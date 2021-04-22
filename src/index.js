import { initMinin } from './init'

function Vue(options){
    // options 为用户传入的参数
    this._init(options); // 入口方法，初始化操作
}

initMinin(Vue)
export default Vue