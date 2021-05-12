import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./schedular";

// watcher 是渲染视图的
let id = 0;
class Watcher{
    constructor(vm,exprOrFn,cb,options){
        this.vm = vm;
        this.cb = cb;
        this.options = options;
        this.id = id ++;

        this.getter = exprOrFn;
        this.deps = [];
        this.depsId = new Set();
        this.get(); // 调用传入的函数   调用了render方法，此时会对模板中的数据进行取值
    }
    get(){ // 这个方法中会对属性进行取值操作
        pushTarget(this); // 取值的时候 Dep.target 就有值了
        this.getter(); // 真正的渲染的时候 会取值
        popTarget();
    }
    addDep(dep){
        let id = dep.id
        if(!this.depsId.has(id)){ // dep 是非重复的 ，watcher 也不会重复
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }
    run(){ // 真正执行代码
        this.get();
    }
    update(){ // 如果多次更新 应该合并成一次
        // this.get();
       
        queueWatcher(this)
    }
    // 当属性取值时 需要记住这个watcher，稍后数据变化了，去执行自己记住的watcher即可
}

export default Watcher