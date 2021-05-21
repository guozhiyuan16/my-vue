import { arrayMethods } from './array.js'
import Dep from "./dep";
// 专门用来监控数据变化的类
class Observer{
    constructor(value){
        this.dep = new Dep(); // 对象和数组也需要增加一个dep

        // value.__ob__ = this; 这种写法每个值都加了一个对象, 对象深层监控 ,会导致死循环

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
    observeArray(value){ // 数组的每一项都 observer 所以效率低
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

function dependArray(value){
    for(let i = 0 ; i< value.length;i++){
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current)
        }
    }
}

function defineReactive(target,key,value){
    let childOb = observe(value); // 深层监控
    let dep = new Dep(); // 每次都会给属性创建一个dep，每个属性都有dep
    Object.defineProperty(target,key,{ // 需要给每个属性都增加一个dep
        get(){
            if(Dep.target){
                dep.depend(); // 让这个属性自己的dep记住这个watcher，也要让watcher记住这个dep

                if(childOb){ // 可能是数组 可能是对象，对象也要收集依赖，后续写$set方法时需要触发他自己的更新操作
                    childOb.dep.depend();   // 就是让数组和对象也记录watcher

                    if(Array.isArray(value)){ // 取外层数组要将数组里面的也进行依赖收集
                       dependArray(value);
                    }
                }
                
            }
            return value
        },
        set(newValue){
            if(value!=newValue){
                observe(newValue); // 直接赋值为一个新对象需要监控
                value = newValue;

                dep.notify();// 通知dep中记录的watcher让他去执行
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
    return new Observer(data);
}