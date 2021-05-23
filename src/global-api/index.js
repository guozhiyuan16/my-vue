import { mergeOptions } from "../util";

export function initGlobalAPI(Vue){
    Vue.options = {}; // 用来存储全局配置
    Vue.mixin = function(mixin){
        
        this.options = mergeOptions(this.options,mixin);

        console.log(this.options)
        return this; // 多次mixin链式调用
    }
}