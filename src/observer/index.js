import { arrayMethods } from './array.js'
// 专门用来监控数据变化的类
class Observer{
    constructor(value){
        // 如果是数组的话如果数组长度很长每个都监控很费时间
        if(Array.isArray(value)){
            
            value.__proto__ = arrayMethods; // 数组的原型指向修改后的那些方法

            this.arrayObserve(value); // 数组中的对象变化了也需要监控
        }else{
            this.walk(value);
        }
    }
    arrayObserve(value){
        value.forEach(val=>{
            console.log(val)
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
    Object.defineProperty(target,key,{
        get(){
            return value
        },
        set(newValue){
            if(value!=newValue){
                observe(newValue); // 直接赋值为一个新对象需要监控
                value = newValue
            }
        }
    })
}

export function observe(data){
    // 对象才监测
    if(typeof data!= 'object' || data == null){
        return data;
    }
    // vue默认最外层data必须是一个对象
    new Observer(data);
}