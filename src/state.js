import { observe } from './observer/index';

export function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm)
    }
}

function initData(vm){
    let data = vm.$options.data;
    vm._data =  data = typeof data == 'function'?data.call(vm):data; // 如果是函数取返回值，不是的话就是对象

    // 当去vm取值时，将属性取值代理到vm._data上
    Object.keys(data).forEach(key=>{
        proxy(vm,'_data',key)
    })

    observe(data);
}

function proxy(vm,data,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[data][key]
        },
        set(newVal){
            vm[data][key] = newVal;
        }
    })
}