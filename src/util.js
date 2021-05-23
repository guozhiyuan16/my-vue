let callbacks = [];
let waiting = false

function flushCallbacks(){
    for(let i = 0;i<callbacks.length;i++){
        let callback = callbacks[i];
        callback();
    }
    waiting = false;
    callbacks = [];
}
// 批处理 第一次开定时器，后续只更新列表，之后执行清空逻辑 (开一个异步任务就行)
export function nextTick(cb){
    callbacks.push(cb); // 默认的cb 是渲染逻辑 用户的逻辑放到渲染逻辑之后即可
    
    if(!waiting){
        waiting = true;
        Promise.resolve().then(flushCallbacks)
    }
    
}

export const isObject = val => typeof val == 'object' && val != null;

const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted'
]
const strats = {};

function mergeHook(parentVal,childVal){
    if(childVal){
        if(parentVal){
            return parentVal.concat(childVal); // 两个钩子变成数组结构
        }else{ // 子有父没有
            return [childVal]
        }
    }else{
        return parentVal; // 儿子没有直接采用付清
    }
}

LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = mergeHook;
})

export function mergeOptions(parent,child){
    const options = {};
    
    for(let key in parent){
        mergeField(key);
    }

    for(let key in child){
        if(!parent.hasOwnProperty(key)){
            mergeField[key];
        }
    }

    function mergeField(key){
        // 策略模式
        if(strats[key]){
            return options[key] = strats[key](parent[key],child[key])
        }

        if(isObject(parent[key]) && isObject(child[key])){
            options[key] = {...parent[key],...child[key]}
        }else{
            if(child[key]){
                options[key] = child[key];
            }else{
                options[key] = parent[key];
            }
        }
    }
    return options;
}

