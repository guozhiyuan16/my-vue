export function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm)
    }
}

function initData(vm){
    let data = vm.$options.data;
    vm._data =  data = typeof data == 'function'?data.call(vm):data;

    // 当去vm取值时，将属性取值代理到vm._data上
    Object.keys(data).forEach(key=>{
        proxy(vm,'_data',key)
    })

    observe(data);
}

function observe(data){
    // 对象才监测
    if(typeof data!= 'object' || data == null){
        return data;
    }
    // vue默认最外层data必须是一个对象
    new Observer(data);
}

class Observer{
    constructor(value){
        this.walk(value);
    }
    walk(data){
        Object.keys(data).forEach(key=>{
            defineReactive(data,key,data[key])
        })
    }
}

function defineReactive(target,key,value){
    observe(value); // 深层监控
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(value!=newValue){
                observe(newValue); // 直接赋值为一个新对象
                value = newValue
            }
        }
    })
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