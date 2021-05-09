import { arrayMethods } from './array.js'
import Dep from "../dep";
// 专门用来监控数据变化的类
class Observer{
    constructor(value){
        // value.__ob__ = this; 这种写法每个值都加了一个对象，会导致死循环

        // 给每个值加一个__ob__指向这个类
        Object.defineProperty(value,'__ob__',{
            value:this,
            enumerable:false, // 不可枚举，防止被循环出来
            configurable:false
        })
        // 如果是数组的话如果数组长度很长每个都监控很费时间
        if(Array.isArray(value)){
            
            value.__proto__ = arrayMethods; // 数组的原型指向修改后的那些方法

            this.observeArray(value); // 数组中的对象变化了也需要监控
        }else{
            this.walk(value);
        }
    }
    observeArray(value){
        value.forEach(val=>{
            observe(val)
        })
    }
    // 用来监控对象的
    walk(data){
        Object.keys(data).forEach(key=>{
            defineReactive(data,key,data[key])
        })
    }
}

function defineReactive(target,key,value){
    observe(value); // 深层监控
    let dep = new Dep(); // 每次都会给属性创建一个dep
    Object.defineProperty(target,key,{ // 需要给每个属性都增加一个dep
        get(){
            if(Dep.target){
                dep.depend(); // 让这个属性自己的dep记住这个watcher，也要让watcher记住这个dep
            }
            return value
        },
        set(newValue){
            if(value!=newValue){
                observe(newValue); // 直接赋值为一个新对象需要监控
                value = newValue;

                dep.notify();
            }
        }
    })
}

export function observe(data){
    // 对象才监测
    if(typeof data!= 'object' || data == null){
        return data;
    }
    if(data.__ob__){ // 有__ob__说明已经被监测过了，防止循环引用
        return data; 
    }
    // vue默认最外层data必须是一个对象
    new Observer(data);
}