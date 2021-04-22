import { initState } from './state'
function initMinin(Vue){
   
    Vue.prototype._init = function(options){
        const vm = this;
        vm.$options = options;

        // 初始化状态（讲数据做一个初始化的劫持 当数据改变更新视图）
        // 对数据进行初始化 watch computed props data
        initState(vm)
    }
}

export {
    initMinin
}