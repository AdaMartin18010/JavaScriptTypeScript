# Promise 执行流

> Promise 从创建到解决的完整执行轨迹

---

## 内容大纲（TODO）

### 1. Promise 创建

- new Promise(executor) 的执行
- executor 的同步执行

### 2. 状态转换

- pending → fulfilled / rejected
- 状态的一旦确定不可变

### 3. 回调注册与执行

- .then(onFulfilled, onRejected)
- 回调进入微任务队列的时机
- Promise 链的执行顺序

### 4. 微任务调度细节

- Promise 解决后的微任务排队
- 链式调用的微任务顺序

### 5. Promise 静态方法执行流

- Promise.resolve / Promise.reject
- Promise.all 的并发与顺序
- Promise.race 的竞争语义

### 6. 可视化

- Promise 状态机 Mermaid 图
- Promise 链执行时序图
