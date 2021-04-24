import { initMixin } from './init'

function Vue(options){
    // options 为用户传入的参数
    this._init(options); // 入口方法，初始化操作
}

// 写成一个个的插件对原型进行扩展
initMixin(Vue)

export default Vue