## 学习Vue源码

> 20210422
- rollup 基本配置
    - 打包文件
    - 启动服务
- Vue 初始化data
    - 通过proxy方法当vm.xx 时 代理到 vm._data.xx
    - 对象的深层监控（数据劫持）

> 20210423
- 数组的深层监控

> 20210424
- 模板渲染的实现
- 模板查找的顺序机制

> 20210425
- dom 转化为 ast 语法树的实现

> 20210426
- ast 转化为 虚拟dom
- 生成render函数

> 20210427
- render函数转化成虚拟dom

> 20210507
- 虚拟dom渲染到页面

> 20210509
- 数据劫持 & dom转化的 总结