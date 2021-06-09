import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { initGlobalAPI } from './global-api/index';
import { compileToFunctions } from './compiler/index';
import { createElm, patch } from './vdom/patch';

function Vue(options){
    // options 为用户传入的参数
    this._init(options); // 入口方法，初始化操作
}

// 写成一个个的插件对原型进行扩展
initMixin(Vue); // 扩展初始化方法
lifecycleMixin(Vue); // 扩展_update方法
renderMixin(Vue); // 扩展_render方法
initGlobalAPI(Vue); // 扩展Vue构造函数上的方法

// 手动构建两个虚拟dom 之后手动进行比对
let vm1 = new Vue({
    data(){
        return { name:'g' }
    }
});
let render1 = compileToFunctions(`<div id="a" a="1" style="color:red">{{name}}</div>`); // 模板编译成render函数
let oldVnode = render1.call(vm1); // 老的虚拟节点
let el = createElm(oldVnode);
document.body.appendChild(el);

let vm2 = new Vue({
    data(){
        return { name:'z' }
    }
});
let render2 = compileToFunctions(`<div id="b" b="2" style="background:red">{{name}}</div>`); // 模板编译成render函数
let newVnode = render2.call(vm2); // 老的虚拟节点

setTimeout(()=>{
    patch(oldVnode,newVnode); // 包括了初渲染和diff算法流程
},2000)

// 只是内容改变了，不需要重新创建新的元素
// let el2 = createElm(newVnode); 
// document.body.appendChild(el2);

export default Vue;