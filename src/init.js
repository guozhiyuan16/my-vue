import { initState } from './state'
import { compileToFunctions } from './compiler/index.js'
import { mountComponent } from './lifecycle';
import { nextTick } from './util';
export function initMixin(Vue){

    Vue.prototype._init = function(options){
        const vm = this; // vm 是 Vue的实例
        vm.$options = options;

        // 初始化状态（将数据做一个初始化的劫持 当数据改变更新视图）
        // 对数据进行初始化 watch computed props data
        initState(vm); // 传递的是vm 此时vm已经挂在了 options

        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$mount = function(el){
        el = document.querySelector(el);
        const vm = this;
        const options = vm.$options;

        vm.$options.el = el;
        // 三种挂载方式
        // 1) render 有render直接使用
        // 2) template 没有render看template
        // 3) 最后是el找html 找外部模板
        if(!options.render){
            let template = options.template;
            if(!template && el){
                template = el.outerHTML;
            }
            // 如何将模板编译成render函数
            const render = compileToFunctions(template);
            options.render = render; // 保证render一定有
        }

        mountComponent(vm,el);// 组件挂载
    }
}