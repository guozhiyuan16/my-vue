let callbacks = [];
let wating = false

function flushCallbacks(){
    for(let i = 0;i<callbacks.length;i++){
        let callback = callbacks[i];
        callback();
    }
    wating = false;
    callbacks = [];
}
// 批处理 第一次开定时器，后续只更新列表，之后执行清空逻辑 (开一个异步任务就行)
export function nextTick(cb){
    callbacks.push(cb); // 默认的cb 是渲染逻辑 用户的逻辑放到渲染逻辑之后即可
    
    if(!wating){
        wating = true;
        Promise.resolve().then(flushCallbacks)
    }
    
}