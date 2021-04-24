import { initState } from './state'
export  function initMinin(Vue){
   
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options;

        // 初始化状态（讲数据做一个初始化的劫持 当数据改变更新视图）
        // 对数据进行初始化 watch computed props data
        initState(vm);

        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function(el){
        el = document.querySelector(el);
        const vm = this;
        const options = vm.$options;
        // 三种挂载方式
        // 1) render 有render直接使用
        // 2) template 没有render看template
        // 3) 最后是el找html 找外部模板
        if(!options.render){
            let template = options.template;
            if(!template && el){
                template = el.outerHTML;
            }
            console.log(template)
            // 如何将模板编译成函数
            const render = compileToFunctions(template);
            options.render = render; // 保证render一定有
        }
    }
}