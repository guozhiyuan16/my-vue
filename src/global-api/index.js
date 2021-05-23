import { mergeOptions } from "../util";

export function initGlobalAPI(Vue){
    Vue.options = {}; // 用来存储全局配置
    Vue.mixin = function(mixin){
        this.options = mergeOptions(this.options,mixin);

        return this; // 多次mixin链式调用
    }

    Vue.options._base = Vue; // Vue 的构造函数
    Vue.options.components = {}; // 用来存放组件的定义
    Vue.component = function(id,definition){
        definition.name = definition.name || id;  // definition.name 优先级大于 id
        definition = this.options._base.extend(definition); // 通过对象产生一个构造函数
        this.options.components[id] = definition;
    }

    Vue.extend = function(options){ // 子组件初始化时 会 new VueComponent
        const Super = this;
        const Sub = function VueComponent(options){
            this._init(options)
        }
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constuctor = Sub;
        Sub.component = Super.component;

        // 每次声明一次组件 都会把父级的定义放到自己身上
        Sub.options = mergeOptions(Super.options,options)
        return Sub; // 这个构造函数是由对象产生而来的
    }
}