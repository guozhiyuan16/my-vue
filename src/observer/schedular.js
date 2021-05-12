import { nextTick } from "../util";

let has = {};
let queue = [];
let pending = false

// 清空queue
function flushShedularQueue(){
    for(let i = 0 ; i < queue.length;i++){
        let watcher = queue[i]
        watcher.run()
    }
    queue = [];
    has = {};
    pending = false;
}

export function queueWatcher(watcher){// 调度更新几次 
    // 更新时对watcher去重
    let id = watcher.id;
    if(has[id] == null){
        queue.push(watcher);
        has[id] = true;

        // 清空 queue
        // setTimeout(flushShedularQueue,0); // vue 更新操作是异步的
        if(!pending){ //  如果watcher不是同一个 ，多次调用queuewatcher 会产生多个nextTick 
            pending = true;
            nextTick(flushShedularQueue)
        }
        
    }
}