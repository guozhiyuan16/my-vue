import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';


function Vue(options){
    // options 为用户传入的参数
    this._init(options); // 入口方法，初始化操作
}

// 写成一个个的插件对原型进行扩展
initMixin(Vue); // 扩展初始化方法
lifecycleMixin(Vue); // 扩展_update方法
renderMixin(Vue); // 扩展_render方法

export default Vue