## `Vue源码`

### `rollup` 基本配置
- 打包文件
- 启动服务

### `如何在原型上扩展方法`

```js
import { initMixin } from './init'
function Vue(options){
    // optionss 为用户传入的参数
    this._init(options);
}

// 写成一个个插件对原型进行扩展
initMinxn(Vue);
```

```js
// -init.js
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        // ...
    }
    Vue.prototype.$mount = function(el){
        // ...
    }
}

```

### 对象的`深层监控`（`数据劫持`）

#### 对象的`响应式`实现

- 初始化时调用 initState(vm)

```js
// - init.js
import { initState } from './state';
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        const vm = this; // vm 是 Vue的实例
        vm.$options = options;

        initState(vm); // options 已经挂载在 vm上
    }
}

// - state.js
import { observe } from './observer/index';

export function initState(vm){
    const opts = vm.$options;
    if(opts.data){ // 有传递data 就需要对数据进行劫持
        initDate(vm);
    }
}

function initDate(vm){
    let data = vm.$options.data
    // 把数据代理到 vm._data上方便拿取
    vm._data =  data = typeof data == 'function'?data.call(vm):data; // 如果是函数取返回值，不是的话就是对象

    // 当去vm取值时，将属性取值代理到vm._data上
    Object.keys(data).forEach(key=>{
        proxy(vm,'_data',key)
    })

    observe(data);
}

function proxy(vm,data,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[data][key]
        },
        set(newVal){
            vm[data][key] = newVal;
        }
    })
}

// - observer/index.js
class Observer{
    constructor(value){
        this.walk(value);
    }
    walk(data){
        Object.keys(data).forEach(key=>{
            defineReactive(data,key,data[key])
        })
    }
}

function defineReactive(target,key,value){
    observe(value); // data中某个值还为队形需要监控
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(value!=newValue){
                observe(newValue); // data中某个值修改为对象需要监控新赋的值
                value = newValue;
            }
        }
    })
}


export function observe(data){
    // 对象才监测
    if(typeof data!= 'object' || data == null){
        return; // 如果是普通值直接返回（不能返回data）
    }
    // vue默认最外层data必须是一个对象
    return new Observer(data);
}
```

#### 数组的`响应式`实现

- 核心思想是把`数组的原有方法重写`，在`执行之前先执行自己写的方法` (`AOP切片编程`)
- 只有`data中的数组`才会先执行自己定义的，在`外部不受影响` （所有不能直接修改数组原型）

```js
// - observer/array.js

let oldArrayMethods = Array.prototype; // 保存数组原有方法

export let arrayMethods = Object.create(Array.prototype); // 通过Array.__proto__ 还能找到数组原有方法

// 只有这7中方法是因为这几个方法才会改变原有数组，vue是数据改变刷新视图的
let methods = [
    'pop',
    'push',
    'shift',
    'unshift',
    'splice',
    'revert',
    'sort',
]

methods.forEach(method => {
    arrayMethods[method] = funtions(...args){
        let result = oldArrayMethods[method].call(this,args); // 数组老的方法
        // 新插入数组中的值也需要变成响应式 => 调用Observer中的observeArray
        let insert;
        let ob = this.__ob__;

        switch (method){
            case "push":
            case "unshift":
                insert = args;
                break;
            case "splice":
                insert = args.slice(2); // 第三个以后是新增的
                break;
            default:
                break;
        }
        if(insert) ob.observeArray(insert) // 数组新增的值有可能是对象 也需要深层监控 （调用 Observe中的 arrayObserve 监控）

        return result
    }
})

// - observer/index.js

import { arrayMethods } from './array.js'

class Observer{
    constructor(value){
        // 给每个值增加__ob__指向Observer这个类（方便value通过__ob__调用observeArray方法）
        Object.defineProperty(value,'__ob__',{
            value:this,
            enumerable:false, // 不可枚举，防止被循环出来
            configurable:false
        })
        // 如果是数组的话如果数组长度很长每个都监控很费时间
        if(Array.isArray(value)){
            
            value.__proto__ = arrayMethods; // 数组的原型指向修改后的那些方法
            // Object.setPrototypeOf(value,arrayMethods);
            this.observeArray(value); // 数组中的对象变化了也需要监控
        }else{
            this.walk(value);
        }
    }
    observeArray(value){ // 数组的每一项都 observer 所以效率低
        value.forEach(val=>{
            observe(val)
        })
    }
    ...
}

```

### `初渲染` 流程

- template模板 => ast 语法树（描述语法的）=> render 函数 => 虚拟dom
- new Vue时会产生一个watcher(渲染watcher) vm._update(vm._render()) 创建真实节点

#### 获取`template`模板

> `模板查找顺序`

- `render` 有render直接使用
- `template` 没有render看template
- 最后是`el找html找外部模板`

```js
// -init.js
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        ...
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function(el){
        el = el && document.querySelector(el);
        const vm = this;
        const options = vm.$options;

        vm.$el = el;
        if(!options.render){
            let template = options.template;
            if(!template && el){
                template = el.outerHTML;
            }
            ...
        }
        ...
    }
}

```

#### 模板编译成`render`函数

> 生成`compileToFunctions`函数主要流程

- 模板编译成render函数
  - `parseHtml` 生成ast语法树
  - `generate` 变为一个_c("div",{a:1},_c())
  - 使用with包裹生成的字符串 let str = `with(this){return ${code}}` (渲染的时候去实例取值)
  - `return new Function(str)`

```js
// - compiler/index.js
import { parseHtml } from './parse';
import { generate } from './generate';

export function compileToFunctions(template){
    // 生成 ast 语法树
    let ast = parseHtml(template);

    // ast 生成 虚拟dom
    let code = generate(ast);

    // 生成render函数
    let render = `with(this){ return ${code} }`

    // 把字符串变成一个函数
    let fn = new Function(render);

    // 返回render函数
    return fn;
}

```

> `render`函数挂在到 vm.options上

```js
// - init.js
import { mountComponent } from './lifecycle';

export function initMixin(Vue){
    ...

    Vue.prototype.$mount = function (el){
        el = el && document.querySelector(el);
        const vm = this;
        const options = vm.$options;
        
        vm.$el = el;

        if(!options.render){
            let template = options.template;
            if(!template && el){
                template = el.outerHTML;
            }
            // template => render方法
            // 1.处理模板变为ast树 2.标记静态节点 3.codegen=>return 字符串 4.new Function + with (render函数)
            const render = compileToFunctions(template);
            options.render = render; // 保证render一定有
        }

        mountComponent(vm);// 组件挂载
    }
}

```

#### render函数生成`虚拟dom`

- Vue 是通过`Watcher渲染`页面
- Watcher 第二个参数是 `updateComponent` => vm._update(vm_render());
- `vm._render 产生虚拟节点`
- `vm._update 把虚拟节点渲染为真实节点`

```js
// -lifecycle.js
import Watcher from './observer/watcher';

export function mountComponent(vm){
    // Watcher中会执行此方法
    let updateComponent = () => {
        vm._update(vm._render());
    }
    new Watcher(vm,updateComponent,()=>{},true);
}

```

```js
// -render.js

import { createElement, createTextVnode } from "./vdom/index.js";

export function renderMixin(Vue){
    Vue.prototype._c = function(...args){ // 创建元素的虚拟节点
        return createElement(this,...args);
    }
    Vue.prototype._v = function(text){ // 创建文本虚拟节点
        return createTextVnode(this,text);
    }
    Vue.prototype._s = function(val){  // 转化成字符串
        return val == null ?'':(typeof val == 'object')? JSON.stringify(val): val;
    }
    Vue.prototype._render = function(){
        const vm = this;
        let render = vm.$options.render; // 获取编译后的render方法

        let vnode = render.call(vm); // 调用render方法产生虚拟节点 （会自动将值进行渲染）

        render vnode; // 返回虚拟节点
    }
}

// -vdom/index.js
export function createElement(vm,tag,data= {},...children){
    return vnode(vm,tag,data,data.key,children,undefined)
}

export function createTextVnode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

function vnode(vm,tag,data,key,children,text,componentOptions){
    return { // 可以根据需求任意添加
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}

```


#### 虚拟dom`patch`渲染到页面

- patch 分为`初渲染`和后续的`dom-diff`;


```js
// -lifecycle.js
import { patch } from './vdom/patch';
import Watcher from './observer/watcher';

export function lifecycle(Vue){
    Vue.prototype._update = function(vnode){
        const vm = this;

        // 通过patch吧虚拟节点转为真实节点
        vm.$el = patch(vm.$el,vnode); //组件渲染用patch方法后会产生$el属性
    }
}

export function mountComponent(vm){
    // Watcher中会执行此方法
    let updateComponent = () => {
        vm._update(vm._render());
    }
    new Watcher(vm,updateComponent,()=>{},true);
}

// -vdom/patch.js
export function patch(oldVnode,vnode){ // oldVnode 是一个真实元素
    const isRealElement = oldVnode.nodeType;
    if(isRealElement){
        const oldElm = oldVnode; // id="app"
        const parentElm = oldElm.parentNode;// body
        let el = createElm(vnode); // 根据虚拟节点创建真实的节点
        parentElm.insertBefore(el,oldElm.nextSibling); // 将创建的节点插到原有的节点的下一个
        parentElm.removeChild(oldElm);// 删除原有的节点

        return el // vm.$el
    }else{
        // dom-diff
    }
}

function updateProperties(vnode,oldProps = {}){
    let newProps = vnode.data || {}; // 属性
    let el = vnode.el; // 当前的真实元素

    // 1.老的属性 新的没有 删除属性
    for(let key in oldProps){
        if(!newProps[key]){
            el.removeAttribute(key);
        }
    }

    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    for(let key in oldStyle){ // 判断样式新老先比对
        if(!newStyle[key]){
            el.style[key] = '';
        }
    }

    // 2. 新的属性老的没有,直接用新的覆盖，不考虑有没有
    for(let key in newProps){
        if(key == 'style'){
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName]
            }
        }else if(key === 'class'){
            el.className = newProps.class;
        }else{
            el.setAttribute(key,newProps[key])
        }
    }
}

export function createElm(vnode){
    let { tag,children, key, data, text, vm } = vnode;
    
    if(typeof tag === 'string'){
        vnode.el = document.createElement(tag);
        updateProperties(vnode); // 更新属性
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child))； // 递归创建子元素
        })
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el;
}

```


### `依赖收集`

> 依赖收集 （`只有在dom中取过值的元素发生变化才触发视图刷新`）
> 本质上就是`data中的属性都绑定watch`，`属性变化时watch重新渲染`

#### `对象的依赖收集`

- 取值的时候给每个值新增一个dep,并且让dep记住这个watcher（也会让watcher记住dep，并且在watcher中去重）
- 设置值得时候通知dep中记录的watcher让其执行，就会重新渲染视图


#### `数组的依赖收集`


### `批处理更新操作`

> 多次改变值应该只更新最后一次

- 在watcher 的update方法中调用 queueWatcher并且参数是watcher本身
- queueWatcher 中 维护一个 queue 并且把watchr 加入到队列并且去重
- 通过nextTick 把 一个循环执行watcher 的方法加入到队列中 （nextTick内部也会维护一个队列）
- 在页面操作时也可以通过 nextTick 来 加入一些异步执行的方法
- 最后在同步执行完成后 把nextTick中的calbacks 依次执行


### `Vue.mixin` & `生命周期的合并策略`

### `组件的合并策略`

### `组件的渲染原理` 

### `dom-diff`

## Question 

- Object.create() 实现原理
- AST语法树和虚拟dom的关系
- Object.defineProperty 实现原理