## 学习Vue源码

- rollup 基本配置
    - 打包文件
    - 启动服务
- Vue 初始化data
    - 通过proxy方法当vm.xx 时 代理到 vm._data.xx
    - 对象的深层监控（数据劫持）

- 数组的深层监控

- 模板渲染的实现
- 模板查找的顺序机制
  - dom 转化为 ast 语法树的实现
  - ast 转化为 虚拟dom
  - 生成render函数
  - render函数转化成虚拟dom
  - 虚拟dom渲染到页面

- 数据劫持 总结
- 初次渲染 总结 
    - 对数据进行拦截 对象 数组 （依赖收集）
    - template模板 => ast 语法树（描述语法的）=> render 函数 => 虚拟dom
    - new Vue时会产生一个watcher(渲染watcher) vm._update(vm._render()) 创建真实节点
- 对象的依赖收集 （只有在dom中取过值的元素发生变化才触发视图刷新）
    - 取值的时候给每个值新增一个dep,并且让dep记住这个watcher（也会让watcher记住dep，并且在watcher中去重）
    - 设置值得时候通知dep中记录的watcher让其执行，就会重新渲染视图

- 批处理更新操作 (多次改变值应该只更新最后一次)
    - 在watcher 的update方法中调用 queueWatcher并且参数是watcher本身
    - queueWatcher 中 维护一个 queue 并且把watchr 加入到队列并且去重
    - 通过nextTick 把 一个循环执行watcher 的方法加入到队列中 （nextTick内部也会维护一个队列）
    - 在页面操作时也可以通过 nextTick 来 加入一些异步执行的方法
    - 最后在同步执行完成后 把nextTick中的calbacks 依次执行

- 数组的依赖收集
- Vue.mixin & 生命周期的合并策略
- 组件的合并策略
- 组件的渲染原理
- dom-diff 算法第一层比较