import { initState } from './state'
import { compileToFunctions } from './compiler/index.js'
import { callHook, mountComponent } from './lifecycle';
import { mergeOptions, nextTick } from './util';
export function initMixin(Vue){

    // Vue 如何渲染 1.ast  2.render 3.vnode(不应该是my-button)
    Vue.prototype._init = function(options){
        const vm = this; // vm 是 Vue的实例
        // vm.$options = options;
        vm.$options = mergeOptions(vm.constructor.options,options); // 把用户传入的options 和 mixin 合并
        
        // 初始化状态（将数据做一个初始化的劫持 当数据改变更新视图）
        // 对数据进行初始化 watch computed props data
        callHook(vm,'beforeCreate')
        initState(vm); // 传递的是vm 此时vm已经挂在了 options
        callHook(vm,'created')

        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$mount = function(el){
        el = el && document.querySelector(el);
        const vm = this;
        const options = vm.$options;

        vm.$el = el;
        // 三种挂载方式
        // 1) render 有render直接使用
        // 2) template 没有render看template
        // 3) 最后是el找html 找外部模板
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