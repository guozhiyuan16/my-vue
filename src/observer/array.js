// 核心思想是把数组的原有方法重写，在执行之前先执行自己写的方法   AOP 切片变成

let oldArrayMethods = Array.prototype; // 数组原有方法

export let arrayMethods = Object.create(Array.prototype);// 1）延长作用域链 2）不能直接覆盖，应为只有在vue中调用才用重写的这些方法

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
        console.log('数据刷新');
        let result = oldArrayMethods[method].apply(this,args);

        return result;
    }
})