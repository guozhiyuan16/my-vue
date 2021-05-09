// 核心思想是把数组的原有方法重写，在执行之前先执行自己写的方法   AOP 切片编程

let oldArrayMethods = Array.prototype; // 数组原有方法

export let arrayMethods = Object.create(Array.prototype);// 1）延长作用域链 2）不能直接覆盖，因为只有在vue中调用才用重写的这些方法

// 只有这7中方法是因为这几个方法才会改变原有数组，vue是数据改变刷新视图的
let methods = [
    'pop',
    'push',
    'shift',
    'unshift',
    'splice',
    'revert',
    'sort',
]

methods.forEach(method=>{
    arrayMethods[method] = function(...args){
        let result = oldArrayMethods[method].apply(this,args);
        let insert;
        let ob = this.__ob__; // 这次this 是监控的那个数组
        switch (method){
            case "push":
            case "unshift":
                insert = args;
                break;
            case "splice":
                insert = args.slice(2); // 第三个以后是新增的
                break;
            default:
                break;
        }
        if(insert) ob.observeArray(insert) // 数组新增的值有可能是对象 也需要深层监控 （调用 Observe中的 arrayObserve 监控）
        return result;
    }
})