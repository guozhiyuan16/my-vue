## 学习Vue源码

### `rollup` 基本配置
- 打包文件
- 启动服务

### Vue `如何在原型上扩展方法`的

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

### Vue 对象的`深层监控`（`数据劫持`）

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
        // ... todo
        
        oldArrayMethods[method].call(this,args); // 数组老的方法
    }
})

// - observer/index.js

import { arrayMethods } from './array.js'

class Observer{
    constructor(value){
        // 如果是数组的话如果数组长度很长每个都监控很费时间
        if(Array.isArray(value)){
            
            value.__proto__ = arrayMethods; // 数组的原型指向修改后的那些方法

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

- 模板渲染的实现
- 模板查找的顺序机制
  - dom 转化为 ast 语法树的实现
  - ast 转化为 虚拟dom
  - 生成render函数
  - render函数转化成虚拟dom
  - 虚拟dom渲染到页面

- 数据劫持 总结
- 初次渲染 总结 
    - 对数据进行拦截 对象 数组 （依赖收集）
    - template模板 => ast 语法树（描述语法的）=> render 函数 => 虚拟dom
    - new Vue时会产生一个watcher(渲染watcher) vm._update(vm._render()) 创建真实节点
- 对象的依赖收集 （只有在dom中取过值的元素发生变化才触发视图刷新）
    - 取值的时候给每个值新增一个dep,并且让dep记住这个watcher（也会让watcher记住dep，并且在watcher中去重）
    - 设置值得时候通知dep中记录的watcher让其执行，就会重新渲染视图

- 批处理更新操作 (多次改变值应该只更新最后一次)
    - 在watcher 的update方法中调用 queueWatcher并且参数是watcher本身
    - queueWatcher 中 维护一个 queue 并且把watchr 加入到队列并且去重
    - 通过nextTick 把 一个循环执行watcher 的方法加入到队列中 （nextTick内部也会维护一个队列）
    - 在页面操作时也可以通过 nextTick 来 加入一些异步执行的方法
    - 最后在同步执行完成后 把nextTick中的calbacks 依次执行

- 数组的依赖收集
- Vue.mixin & 生命周期的合并策略
- 组件的合并策略
- 组件的渲染原理
- dom-diff 算法第一层比较



## Question 

- Object.create() 实现原理