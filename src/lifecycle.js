import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher"

export function lifecycleMixin(Vue){
    // 将虚拟节点转为真实的dom
    Vue.prototype._update = function(vnode){
       const vm = this;
       // 首次渲染 需要用虚拟节点，来更新真实的dom

       // patch 初始化渲染的时候，会创建一个新节点并将老节点删掉
       // vm.$el = patch(vm.$options.el,vnode)

       // 第一次渲染完毕后，拿到新的节点，下次再次渲染时替换上次渲染的结果  性能差
        vm.$el = patch(vm.$el,vnode)  // 组件低啊用patch方法后会产生$el属性
    }
} 

export function callHook(vm,hook){
    const handlers = vm.$options[hook];
    if(handlers){
        handlers.forEach(handler=>handler.call(vm))
    }
}

export function mountComponent(vm){
    // 默认vue 是通过watcher来渲染的  渲染watcher （每一个组件都有一个渲染watcher）

    let updateComponent = ()=>{
        vm._update(vm._render()); // vm._render()返回的是虚拟节点     vm._update(vm._render())在把虚拟节点渲染为真实节点
    }
    new Watcher(vm,updateComponent,()=>{},true) // = updateComponent()
}