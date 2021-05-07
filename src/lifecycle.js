import { patch } from "./vdom/patch";
import Watcher from "./watcher"

export function lifecycleMixin(Vue){
    // 将虚拟节点转为真实的dom
    Vue.prototype._update = function(vnode){
       const vm = this;
       // 首次渲染 需要用虚拟节点，来更新真实的dom
        vm.$el = patch(vm.$options.el,vnode)
    }
} 

export function mountComponent(vm,el){
    // 默认vue 是通过watcher来渲染的  渲染watcher （每一个组件都有一个渲染watcher）

    let updateComponent = ()=>{
        vm._update(vm._render()); // vm._render()返回的是虚拟节点     vm._update(vm._render())在把虚拟节点渲染为真实节点
    }
    new Watcher(vm,updateComponent,()=>{},true) // = updateComponent()
}