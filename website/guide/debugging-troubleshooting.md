---
title: JavaScript/TypeScript 调试与故障排查指南
description: "Awesome JS/TS Ecosystem 指南: JavaScript/TypeScript 调试与故障排查指南"
---

---

title: 'JavaScript/TypeScript 调试与故障排查指南'
---

# JavaScript/TypeScript 调试与故障排查指南

本文档涵盖了浏览器和 Node.js 环境下的高级调试技巧、常见问题排查方法以及专业调试工具的使用。

---

## 目录

- [JavaScript/TypeScript 调试与故障排查指南](#javascripttypescript-调试与故障排查指南)
  - [目录](#目录)
  - [一、浏览器开发者工具高级技巧](#一浏览器开发者工具高级技巧)
    - [1.1 Console API 高级用法](#11-console-api-高级用法)
      - [console.table() - 表格化输出数组/对象](#consoletable---表格化输出数组对象)
      - [console.group() / console.groupEnd() - 分组日志](#consolegroup--consolegroupend---分组日志)
      - [console.time() / console.timeEnd() - 性能计时](#consoletime--consoletimeend---性能计时)
      - [console.trace() - 堆栈跟踪](#consoletrace---堆栈跟踪)
    - [1.2 Breakpoints 类型和条件断点](#12-breakpoints-类型和条件断点)
      - [断点类型总览](#断点类型总览)
      - [条件断点实战](#条件断点实战)
      - [DOM 断点](#dom-断点)
    - [1.3 Network 面板分析](#13-network-面板分析)
      - [请求瀑布图分析](#请求瀑布图分析)
      - [实际案例：API 性能优化](#实际案例api-性能优化)
      - [模拟网络条件](#模拟网络条件)
    - [1.4 Performance 性能分析](#14-performance-性能分析)
      - [CPU 性能分析](#cpu-性能分析)
      - [实际案例：优化长任务](#实际案例优化长任务)
      - [渲染性能分析](#渲染性能分析)
    - [1.5 Memory 内存泄漏检测](#15-memory-内存泄漏检测)
      - [Heap Snapshot 分析](#heap-snapshot-分析)
      - [实际案例：事件监听器泄漏](#实际案例事件监听器泄漏)
      - [Allocation Timeline 检测](#allocation-timeline-检测)
  - [二、Node.js 调试技巧](#二nodejs-调试技巧)
    - [2.1 --inspect 和 Chrome DevTools](#21---inspect-和-chrome-devtools)
      - [启动调试模式](#启动调试模式)
      - [实际案例：调试 Express 应用](#实际案例调试-express-应用)
    - [2.2 VS Code 调试配置](#22-vs-code-调试配置)
      - [launch.json 配置](#launchjson-配置)
      - [实际案例：调试 NestJS 应用](#实际案例调试-nestjs-应用)
    - [2.3 日志级别管理](#23-日志级别管理)
      - [使用 Winston 进行结构化日志](#使用-winston-进行结构化日志)
      - [动态调整日志级别](#动态调整日志级别)
    - [2.4 Core Dump 分析](#24-core-dump-分析)
      - [启用 Core Dump](#启用-core-dump)
      - [使用 llnode 分析 Core Dump](#使用-llnode-分析-core-dump)
      - [使用 heapdump 生成堆快照](#使用-heapdump-生成堆快照)
  - [三、异步代码调试](#三异步代码调试)
    - [3.1 async/await 堆栈追踪](#31-asyncawait-堆栈追踪)
      - [问题：异步堆栈丢失](#问题异步堆栈丢失)
      - [解决方案](#解决方案)
    - [3.2 Promise 链调试](#32-promise-链调试)
      - [Promise 链可视化](#promise-链可视化)
      - [调试技巧：标记 Promise](#调试技巧标记-promise)
    - [3.3 异步断点设置](#33-异步断点设置)
      - [在 VS Code 中调试 async/await](#在-vs-code-中调试-asyncawait)
  - [四、TypeScript 调试](#四typescript-调试)
    - [4.1 Source Map 配置](#41-source-map-配置)
      - [tsconfig.json 完整配置](#tsconfigjson-完整配置)
      - [VS Code TypeScript 调试配置](#vs-code-typescript-调试配置)
    - [4.2 类型错误定位](#42-类型错误定位)
      - [使用 TypeScript 诊断工具](#使用-typescript-诊断工具)
      - [复杂类型错误调试](#复杂类型错误调试)
      - [使用 @ts-expect-error 进行预期错误测试](#使用-ts-expect-error-进行预期错误测试)
    - [4.3 tsc --traceResolution](#43-tsc---traceresolution)
      - [模块解析追踪](#模块解析追踪)
  - [五、常见问题排查](#五常见问题排查)
    - [5.1 内存泄漏诊断流程](#51-内存泄漏诊断流程)
      - [诊断检查清单](#诊断检查清单)
      - [内存监控脚本](#内存监控脚本)
    - [5.2 性能瓶颈定位](#52-性能瓶颈定位)
      - [CPU 性能分析流程](#cpu-性能分析流程)
      - [性能分析工具集成](#性能分析工具集成)
    - [5.3 死锁和竞态条件检测](#53-死锁和竞态条件检测)
      - [死锁检测器](#死锁检测器)
      - [竞态条件检测](#竞态条件检测)
    - [5.4 循环依赖检测](#54-循环依赖检测)
      - [循环依赖分析工具](#循环依赖分析工具)
  - [六、调试工具推荐](#六调试工具推荐)
    - [6.1 ndb](#61-ndb)
      - [安装与使用](#安装与使用)
      - [实际案例：调试子进程](#实际案例调试子进程)
    - [6.2 0x 火焰图](#62-0x-火焰图)
      - [安装与使用](#安装与使用-1)
      - [实际案例：性能优化](#实际案例性能优化)
    - [6.3 clinic.js](#63-clinicjs)
      - [安装与使用](#安装与使用-2)
    - [6.4 heapdump](#64-heapdump)
      - [使用场景](#使用场景)
      - [分析堆快照](#分析堆快照)
      - [自动内存泄漏检测](#自动内存泄漏检测)
  - [附录：调试速查表](#附录调试速查表)
    - [常用 Chrome DevTools 快捷键](#常用-chrome-devtools-快捷键)
    - [Node.js 调试标志](#nodejs-调试标志)
    - [VS Code 调试配置模板](#vs-code-调试配置模板)

---

## 一、浏览器开发者工具高级技巧

### 1.1 Console API 高级用法

#### console.table() - 表格化输出数组/对象

**操作步骤**：

1. 打开浏览器开发者工具（F12 或 Ctrl+Shift+I）
2. 切换到 Console 面板
3. 输入 `console.table(data)` 命令

```javascript
// 案例：展示用户列表数据
const users = [
  { id: 1, name: '张三', age: 28, role: 'admin' },
  { id: 2, name: '李四', age: 32, role: 'editor' },
  { id: 3, name: '王五', age: 25, role: 'viewer' }
];

console.table(users);
// 输出结果：以表格形式展示所有用户信息

// 只展示特定列
console.table(users, ['name', 'role']);
```

**截图说明**：

```
┌─────────┬─────┬────────┬─────┬─────────┐
│ (index) │ id  │  name  │ age │  role   │
├─────────┼─────┼────────┼─────┼─────────┤
│    0    │  1  │ '张三' │ 28  │ 'admin' │
│    1    │  2  │ '李四' │ 32  │ 'editor'│
│    2    │  3  │ '王五' │ 25  │ 'viewer'│
└─────────┴─────┴────────┴─────┴─────────┘
```

#### console.group() / console.groupEnd() - 分组日志

```javascript
// 案例：复杂应用中的日志分组
function fetchUserData(userId) {
  console.group(`🔍 获取用户数据 [ID: ${userId}]`);

  console.log('步骤1: 验证用户ID格式');
  console.assert(userId > 0, '用户ID必须大于0');

  console.log('步骤2: 发送API请求');
  console.log('API端点:', `/api/users/${userId}`);

  console.log('步骤3: 处理响应数据');
  const mockData = { id: userId, name: '测试用户' };
  console.log('原始数据:', mockData);

  console.groupEnd();
  return mockData;
}

fetchUserData(123);
```

**截图说明**：

```
🔍 获取用户数据 [ID: 123]
  步骤1: 验证用户ID格式
  步骤2: 发送API请求
    API端点: /api/users/123
  步骤3: 处理响应数据
    原始数据: {id: 123, name: '测试用户'}
```

#### console.time() / console.timeEnd() - 性能计时

```javascript
// 案例：测量复杂算法执行时间
function bubbleSort(arr) {
  console.time('冒泡排序执行时间');

  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }

  console.timeEnd('冒泡排序执行时间');
  return result;
}

const largeArray = Array.from({ length: 10000 }, () => Math.random());
bubbleSort(largeArray);
// 输出: 冒泡排序执行时间: 245.673ms
```

#### console.trace() - 堆栈跟踪

```javascript
// 案例：追踪函数调用链
function level1() {
  level2();
}

function level2() {
  level3();
}

function level3() {
  console.trace('追踪调用栈');
  console.log('当前执行位置');
}

level1();
// 输出完整的调用栈信息，帮助理解代码执行路径
```

---

### 1.2 Breakpoints 类型和条件断点

#### 断点类型总览

| 断点类型 | 触发条件 | 适用场景 |
|---------|---------|---------|
| Line Breakpoint | 执行到指定行 | 常规调试 |
| Conditional Breakpoint | 满足条件时触发 | 循环、大量数据处理 |
| DOM Breakpoint | DOM 变化时触发 | 监听元素修改 |
| XHR/Fetch Breakpoint | 网络请求时触发 | API 调试 |
| Event Listener Breakpoint | 特定事件触发 | 事件处理调试 |

#### 条件断点实战

**操作步骤**：

1. 在代码行号上右键 → "Add conditional breakpoint"
2. 输入条件表达式
3. 只有条件为真时才会暂停

```javascript
// 案例：在循环中找到特定条件的数据
function processOrders(orders) {
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    // 条件断点: order.total > 10000 && order.status === 'pending'
    processOrder(order);
  }
}

// 模拟数据
const orders = [
  { id: 1, total: 500, status: 'completed' },
  { id: 2, total: 15000, status: 'pending' },  // 断点将在这里触发
  { id: 3, total: 800, status: 'pending' }
];
```

**截图说明**：

```
在 Sources 面板中：
- 行号显示为橙色（条件断点标识）
- 断点只在满足 order.total > 10000 && order.status === 'pending' 时暂停
- 避免在每次迭代都暂停，提高调试效率
```

#### DOM 断点

```javascript
// 案例：监控元素被意外修改的情况
// 在 Elements 面板中:
// 1. 选中目标元素
// 2. 右键 → "Break on" → 选择断点类型

// 三种 DOM 断点类型：
// - subtree modifications: 子树修改时触发
// - attribute modifications: 属性变化时触发
// - node removal: 节点移除时触发

// 实际案例：找出谁修改了按钮的 disabled 状态
const submitBtn = document.getElementById('submit');
// 在 Elements 面板对该元素设置 "attribute modifications" 断点
// 任何代码修改该元素的属性时都会暂停
```

---

### 1.3 Network 面板分析

#### 请求瀑布图分析

**操作步骤**：

1. 打开 Network 面板
2. 勾选 "Preserve log" 保留历史
3. 勾选 "Disable cache" 禁用缓存
4. 刷新页面观察请求

**截图说明**：

```
Network 面板关键列说明：
┌──────────┬────────┬────────┬────────┬──────────┬──────────┐
│   Name   │ Status │  Type  │ Initiator │  Size   │  Time   │
├──────────┼────────┼────────┼──────────┼──────────┼──────────┤
│ index.html│  200   │document│   -      │  12.3 KB │  234 ms │
│ app.js   │  200   │ script │ index    │  45.6 KB │  567 ms │
│ api/data │  200   │ fetch  │ app.js   │   2.1 KB │ 1200 ms │ ← 慢请求
│ style.css│  200   │ stylesheet│ index  │   8.9 KB │  345 ms │
└──────────┴────────┴────────┴──────────┴──────────┴──────────┘

颜色编码：
- 蓝色: 等待服务器响应 (TTFB)
- 绿色: 内容下载时间
- 灰色: 排队/停滞时间
```

#### 实际案例：API 性能优化

```javascript
// 优化前：串行请求
async function loadDashboard() {
  const user = await fetch('/api/user').then(r => r.json());
  const orders = await fetch('/api/orders').then(r => r.json());      // 等待 user
  const stats = await fetch('/api/statistics').then(r => r.json());   // 等待 orders
  return { user, orders, stats };
}
// Network 面板显示：3个请求依次执行，总时间 ≈ 3秒

// 优化后：并行请求
async function loadDashboardOptimized() {
  const [user, orders, stats] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/orders').then(r => r.json()),
    fetch('/api/statistics').then(r => r.json())
  ]);
  return { user, orders, stats };
}
// Network 面板显示：3个请求同时发起，总时间 ≈ 1秒
```

#### 模拟网络条件

**操作步骤**：

1. Network 面板 → "No throttling" 下拉菜单
2. 选择预设：Slow 3G / Fast 3G / Offline
3. 或使用自定义配置

```javascript
// 案例：测试弱网环境下的错误处理
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('请求超时，请检查网络连接');
    }
    throw error;
  }
}

// 在 Slow 3G 模式下测试
fetchWithTimeout('/api/data');
```

---

### 1.4 Performance 性能分析

#### CPU 性能分析

**操作步骤**：

1. Performance 面板 → 点击 "Record" 按钮
2. 执行需要分析的操作
3. 点击 "Stop" 结束录制
4. 分析火焰图

**截图说明**：

```
Performance 面板视图：
┌─────────────────────────────────────────────────────────────┐
│  📊 CPU Usage        ████████████████████░░░░░░░░░░░░░░░░░  │
│  FPS                60|59|60|30|60|60|60|58|60|60|60|60     │
│  NET                |   |   |   |   |   |   |   |   |      │
├─────────────────────────────────────────────────────────────┤
│  Main Thread (火焰图)                                        │
│  ├─ Animation Frame                                          │
│  │  ├─ updateLayout    ████████ (耗时较长)                   │
│  │  └─ paint           ██                                    │
│  ├─ Timer                                                    │
│  │  └─ processData     ████████████ (需优化)                 │
│  └─ Script                                                   │
│     └─ heavyComputation  ████████████████████ (阻塞主线程)    │
└─────────────────────────────────────────────────────────────┘

颜色含义：
- 蓝色: HTML解析
- 紫色: 样式计算
- 绿色: 绘制
- 黄色: JavaScript执行
- 红色: 长时间任务警告 (>50ms)
```

#### 实际案例：优化长任务

```javascript
// 优化前：阻塞主线程的排序操作
function processLargeDataset(data) {
  // 10万条数据的复杂计算
  const sorted = data.sort((a, b) => complexCompare(a, b));
  const processed = sorted.map(transformItem);
  return processed;
}
// Performance 面板显示：红色长任务，FPS 掉到个位数

// 优化后：使用 requestIdleCallback 分片处理
async function processLargeDatasetOptimized(data, chunkSize = 1000) {
  const results = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    // 使用 requestIdleCallback 在浏览器空闲时处理
    await new Promise(resolve => {
      requestIdleCallback(() => {
        const processed = chunk.map(transformItem);
        results.push(...processed);
        resolve();
      });
    });
  }

  return results;
}
// Performance 面板显示：任务被拆分成小块，保持 60 FPS
```

#### 渲染性能分析

```javascript
// 案例：检测强制同步布局 (Forced Reflow)
function badLayoutExample() {
  const elements = document.querySelectorAll('.item');

  elements.forEach(el => {
    // ❌ 错误：读取后立即写入，触发强制重排
    const height = el.offsetHeight;  // 读取
    el.style.height = height + 10 + 'px';  // 写入

    const width = el.offsetWidth;    // 再次读取 (触发新的重排!)
    el.style.width = width + 10 + 'px';
  });
}

// 优化版本
function goodLayoutExample() {
  const elements = document.querySelectorAll('.item');

  // 1. 先读取所有值
  const dimensions = Array.from(elements).map(el => ({
    el,
    height: el.offsetHeight,
    width: el.offsetWidth
  }));

  // 2. 批量写入
  dimensions.forEach(({ el, height, width }) => {
    el.style.height = height + 10 + 'px';
    el.style.width = width + 10 + 'px';
  });
}
// Performance 面板中 "Layout Shift" 和 "Recalculate Style" 时间显著减少
```

---

### 1.5 Memory 内存泄漏检测

#### Heap Snapshot 分析

**操作步骤**：

1. Memory 面板 → 选择 "Heap snapshot"
2. 点击 "Take snapshot" 记录初始状态
3. 执行可疑操作
4. 再次点击 "Take snapshot"
5. 对比两个快照（Comparison 视图）

**截图说明**：

```
Heap Snapshot 对比视图：
┌────────────────────────────────────────────────────────────┐
│  Constructor    │  New  │ Deleted │ Delta │  Alloc. Size  │
├────────────────────────────────────────────────────────────┤
│  Array          │  120  │   45    │  +75  │    2.4 MB     │
│  Object         │  890  │  234    │ +656  │    5.6 MB     │
│  (closure)      │   45  │    0    │  +45  │    1.2 MB  ⚠️ │ ← 泄漏嫌疑
│  Detached DOM   │   12  │    0    │  +12  │  480 KB    ⚠️ │ ← 严重泄漏
│  EventListener  │   30  │    5    │  +25  │  320 KB    ⚠️ │ ← 未移除监听
└────────────────────────────────────────────────────────────┘

Retention Path（保留链）：
Window → app → cache → Array → (closure) → 泄漏的对象
```

#### 实际案例：事件监听器泄漏

```javascript
// 案例：SPA 页面切换时的内存泄漏
class DataFetcher {
  constructor() {
    this.cache = new Map();
    // ❌ 错误：未移除全局事件监听
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    console.log('window resized');
  }
}

// 问题：每次路由切换创建新的 DataFetcher，但事件监听没有移除
// Memory 面板显示：Detached DOM tree 增长，EventListener 数量持续增加

// 修复版本
class DataFetcherFixed {
  constructor() {
    this.cache = new Map();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    console.log('window resized');
  }

  // ✅ 添加清理方法
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.cache.clear();
  }
}

// 路由切换时调用
dataFetcher.destroy();
```

#### Allocation Timeline 检测

```javascript
// 案例：使用 Allocation instrumentation 检测间歇性泄漏
function simulateMemoryLeak() {
  const leakyArray = [];

  setInterval(() => {
    // 模拟泄漏：持续添加大对象
    const bigObject = {
      data: new Array(10000).fill('x').join(''),
      timestamp: Date.now(),
      id: Math.random()
    };
    leakyArray.push(bigObject);

    console.log(`当前缓存大小: ${leakyArray.length}`);
  }, 100);
}

// Memory 面板 → Allocation instrumentation on timeline
// 录制一段时间后会看到阶梯状上升的蓝色区域，表示内存持续增长
```

---

## 二、Node.js 调试技巧

### 2.1 --inspect 和 Chrome DevTools

#### 启动调试模式

**操作步骤**：

```bash
# 方式1: 基础调试模式
node --inspect server.js

# 方式2: 在首行代码暂停 (适合启动阶段调试)
node --inspect-brk server.js

# 方式3: 指定端口 (默认 9229)
node --inspect=0.0.0.0:9229 server.js

# 方式4: 使用 nodemon 自动重启调试
npx nodemon --inspect server.js
```

**截图说明**：

```
终端输出：
Debugger listening on ws://127.0.0.1:9229/abc123-def456
For help, see: https://nodejs.org/en/docs/inspector

Chrome DevTools 连接：
1. 打开 Chrome → chrome://inspect
2. 点击 "Open dedicated DevTools for Node"
3. 或点击 "inspect" 链接

DevTools 界面显示：
┌─────────────────────────────────────────────────────────────┐
│  Sources 面板中显示 Node.js 文件                             │
│  ├─ server.js                                               │
│  ├─ node_modules                                            │
│  └─ (anonymous)                                             │
│                                                            │
│  Console 面板可以直接执行 Node.js 代码                        │
│  > process.version                                          │
│  'v18.17.0'                                                 │
└─────────────────────────────────────────────────────────────┘
```

#### 实际案例：调试 Express 应用

```javascript
// server.js
const express = require('express');
const app = express();

// 在 Chrome DevTools 中设置断点
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;  // 在这里设置断点

  console.log(`获取用户: ${userId}`);

  // 模拟数据库查询
  const user = await db.findById(userId);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json(user);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**调试步骤**：

```bash
# 1. 启动调试模式
node --inspect-brk server.js

# 2. 在 Chrome DevTools 中设置断点
# 3. 使用 curl 或浏览器访问端点
curl http://localhost:3000/api/users/123

# 4. 代码将在断点处暂停，可以：
#    - 查看 req, res 对象
#    - 单步执行
#    - 在 Console 中执行表达式
```

---

### 2.2 VS Code 调试配置

#### launch.json 配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Program",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--testPathPattern=${fileBasenameNoExtension}"
      ],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Current File",
      "type": "node",
      "request": "launch",
      "program": "${file}",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**截图说明**：

```
VS Code 调试界面：
┌─────────────────────────────────────────────────────────────┐
│  调试工具栏：                                               │
│  [▶️ 继续] [⏸️ 单步跳过] [⬇️ 进入] [⬆️ 跳出] [🔄 重启] [⏹️ 停止]│
│                                                            │
│  左侧面板：                                                  │
│  ├─ 变量 (VARIABLES)                                       │
│  │  ├─ Local                                               │
│  │  │  ├─ userId: "123"                                    │
│  │  │  ├─ user: {id: 123, name: "张三"}                      │
│  │  │  └─ res: ServerResponse {...}                        │
│  │  └─ Global                                              │
│  ├─ 监视 (WATCH)                                           │
│  │  └─ req.params.id                                       │
│  ├─ 调用栈 (CALL STACK)                                     │
│  └─ 断点 (BREAKPOINTS)                                      │
│                                                            │
│  底部：调试控制台                                            │
│  > req.headers                                              │
│  { 'content-type': 'application/json', ... }                │
└─────────────────────────────────────────────────────────────┘
```

#### 实际案例：调试 NestJS 应用

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "NestJS Debug",
      "type": "node",
      "request": "launch",
      "args": ["${workspaceFolder}/src/main.ts"],
      "runtimeArgs": [
        "--nolazy",
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register"
      ],
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // 在这里设置断点
    const user = await this.usersService.findOne(+id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }
}
```

---

### 2.3 日志级别管理

#### 使用 Winston 进行结构化日志

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

```javascript
// 使用示例
const logger = require('./logger');

function processOrder(orderId) {
  logger.debug('开始处理订单', { orderId });

  try {
    logger.info('验证订单信息', { orderId });
    validateOrder(orderId);

    logger.info('扣减库存', { orderId });
    deductInventory(orderId);

    logger.info('订单处理完成', { orderId });
  } catch (error) {
    logger.error('订单处理失败', {
      orderId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

**日志输出示例**：

```json
// production 环境 (JSON 格式)
{
  "level": "error",
  "message": "订单处理失败",
  "timestamp": "2024-01-15T08:30:45.123Z",
  "service": "user-service",
  "orderId": "ORD-12345",
  "error": "库存不足",
  "stack": "Error: 库存不足\n    at deductInventory..."
}

// development 环境 (彩色格式)
[2024-01-15 08:30:45] [32minfo[39m:    验证订单信息 {"orderId":"ORD-12345"}
[2024-01-15 08:30:45] [31merror[39m:   订单处理失败 {"orderId":"ORD-12345","error":"库存不足"}
```

#### 动态调整日志级别

```javascript
// 允许运行时修改日志级别 (用于生产环境调试)
const express = require('express');
const logger = require('./logger');
const app = express();

// 管理员接口：动态调整日志级别
app.post('/admin/log-level', (req, res) => {
  const { level } = req.body;
  const validLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

  if (!validLevels.includes(level)) {
    return res.status(400).json({
      error: 'Invalid level',
      validLevels
    });
  }

  logger.level = level;
  logger.info(`日志级别已调整为: ${level}`);

  res.json({
    message: 'Log level updated',
    currentLevel: level
  });
});

// 使用示例：临时开启调试日志排查问题
curl -X POST http://localhost:3000/admin/log-level \
  -H "Content-Type: application/json" \
  -d '{"level": "debug"}'
```

---

### 2.4 Core Dump 分析

#### 启用 Core Dump

```bash
# Linux 系统启用 core dump
ulimit -c unlimited                    # 临时启用
echo '/tmp/core.%e.%p' | sudo tee /proc/sys/kernel/core_pattern  # 设置保存路径

# 启动 Node.js 时保留控制台输出
node --redirect-warnings=warnings.log server.js
```

#### 使用 llnode 分析 Core Dump

```bash
# 安装 llnode
npm install -g llnode

# 分析 core dump
llnode /usr/bin/node -c /tmp/core.node.12345

# llnode 常用命令
(llnode) v8 findjsobjects           # 列出所有 JS 对象
(llnode) v8 findjsinstances Error   # 查找 Error 实例
(llnode) v8 inspect 0x12345678      # 检查特定对象
```

#### 使用 heapdump 生成堆快照

```javascript
// 安装
npm install heapdump

// 使用
const heapdump = require('heapdump');

// 方式1: 代码中主动触发
function captureHeapSnapshot() {
  const filename = `./heap-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err) => {
    if (err) console.error(err);
    else console.log(`Heap snapshot written to ${filename}`);
  });
}

// 方式2: 通过信号触发
// USR2 信号触发堆快照
process.on('SIGUSR2', () => {
  captureHeapSnapshot();
});

// 使用: kill -USR2 <pid>
```

---

## 三、异步代码调试

### 3.1 async/await 堆栈追踪

#### 问题：异步堆栈丢失

```javascript
// 问题：原始堆栈信息不完整
async function level1() {
  await level2();
}

async function level2() {
  await level3();
}

async function level3() {
  throw new Error('出错了！');
}

level1().catch(err => console.error(err.stack));
// 输出: 堆栈只显示 level3，丢失了 level1 和 level2 的信息
```

#### 解决方案

```javascript
// Node.js v12+ 使用 async stack traces
// 启动时添加 --async-stack-traces 标志
// node --async-stack-traces server.js

// 或使用 V8 标志 (Node v14+)
// node --stack-trace-limit=100 server.js

// 更好的错误包装
class AsyncError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
  }
}

async function withContext(fn, context) {
  try {
    return await fn();
  } catch (error) {
    throw new AsyncError(`${context} 失败`, error);
  }
}

// 使用示例
async function processPayment(orderId) {
  return withContext(async () => {
    await validateOrder(orderId);
    await chargePayment(orderId);
    await sendConfirmation(orderId);
  }, `处理订单 ${orderId}`);
}

// 错误输出现在包含完整上下文
// Error: 处理订单 ORD-123 失败
//   at ...
// Caused by: Error: 支付网关超时
//   at ...
```

**Chrome DevTools 截图说明**：

```
Sources 面板中的异步堆栈：
┌─────────────────────────────────────────────────────────────┐
│  Call Stack (with async)                                    │
│  ├─ level3 (async)     ← 当前暂停位置                        │
│  │  at line 15                                               │
│  ├─ async level2       ← async 标记表示异步边界              │
│  │  at line 10                                               │
│  ├─ async level1                                              │
│  │  at line 5                                                │
│  └─ <anonymous>                                              │
│     at line 20                                               │
│                                                              │
│  ☑️ 勾选 "Async" 选项可以看到完整的异步调用链                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Promise 链调试

#### Promise 链可视化

```javascript
// 安装 promise-debug
npm install promise-debug

// 使用
const PromiseDebug = require('promise-debug');
PromiseDebug.enable();

// 实际案例：复杂的 Promise 链
fetchUser(userId)
  .then(user => fetchOrders(user.id))
  .then(orders => orders.filter(o => o.status === 'pending'))
  .then(pendingOrders => calculateTotal(pendingOrders))
  .then(total => applyDiscount(total, userId))
  .then(finalAmount => createInvoice(finalAmount))
  .then(invoice => sendEmail(userId, invoice))
  .catch(error => {
    // 由于 PromiseDebug，这里可以看到哪个 then 失败了
    console.error('Promise chain failed:', error);
  });

// 控制台输出：
// Promise chain: fetchUser → fetchOrders → filter → calculateTotal
// ✓ fetchUser completed (45ms)
// ✓ fetchOrders completed (120ms)
// ✓ filter completed (1ms)
// ✗ calculateTotal failed (0ms) - TypeError: Cannot read property 'price' of undefined
```

#### 调试技巧：标记 Promise

```javascript
// 自定义 Promise 标记工具
function trackPromise(name, promise) {
  const startTime = Date.now();
  console.log(`[${name}] 开始执行`);

  return promise
    .then(result => {
      console.log(`[${name}] 成功 (${Date.now() - startTime}ms)`);
      return result;
    })
    .catch(error => {
      console.error(`[${name}] 失败 (${Date.now() - startTime}ms):`, error.message);
      throw error;
    });
}

// 使用示例
async function loadDashboard(userId) {
  const user = await trackPromise('fetchUser', fetchUser(userId));
  const orders = await trackPromise('fetchOrders', fetchOrders(user.id));
  const stats = await trackPromise('fetchStats', fetchStats(user.id));

  return { user, orders, stats };
}

// 输出：
// [fetchUser] 开始执行
// [fetchUser] 成功 (45ms)
// [fetchOrders] 开始执行
// [fetchOrders] 成功 (120ms)
// [fetchStats] 开始执行
// [fetchStats] 失败 (5000ms): 请求超时
```

---

### 3.3 异步断点设置

#### 在 VS Code 中调试 async/await

```javascript
// 案例：复杂的异步流程
async function processOrderBatch(orderIds) {
  const results = [];

  for (const orderId of orderIds) {
    // 断点1: 在这里设置断点，观察每次迭代的值
    console.log(`处理订单: ${orderId}`);

    try {
      // 断点2: Step Into 进入 processOrder
      const result = await processOrder(orderId);

      // 断点3: 观察 result 的值
      results.push(result);
    } catch (error) {
      // 断点4: 捕获异常时暂停
      console.error(`订单 ${orderId} 处理失败`, error);
      results.push({ orderId, error: error.message });
    }
  }

  return results;
}

// VS Code launch.json 配置
{
  "type": "node",
  "request": "launch",
  "name": "Debug Async",
  "program": "${workspaceFolder}/async-demo.js",
  "stopOnEntry": false,
  // 关键配置：支持 async/await 调试
  "runtimeArgs": ["--nolazy"],
  "sourceMaps": true
}
```

**调试技巧**：

```
在 VS Code 中：
1. 设置断点后按 F5 启动
2. F10 (Step Over): 执行当前行，不进入函数内部
3. F11 (Step Into): 进入 async 函数内部
4. Shift+F11 (Step Out): 跳出当前 async 函数
5. 在 Watch 面板添加表达式: await getStatus()

注意：async/await 编译后的代码可能需要 source map
```

---

## 四、TypeScript 调试

### 4.1 Source Map 配置

#### tsconfig.json 完整配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",

    // Source Map 配置
    "sourceMap": true,              // 生成 .js.map 文件
    "inlineSourceMap": false,       // 不内联 source map
    "sourceRoot": "/",              // source map 根路径
    "mapRoot": "/",                 // map 文件根路径

    // 声明文件
    "declaration": true,            // 生成 .d.ts 文件
    "declarationMap": true,         // 生成 .d.ts.map 文件

    // 调试增强
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### VS Code TypeScript 调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "TS Debug (ts-node)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--nolazy",
        "-r", "ts-node/register/transpile-only"
      ],
      "args": ["${workspaceFolder}/src/index.ts"],
      "cwd": "${workspaceFolder}",
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    },
    {
      "name": "TS Debug (Compiled)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "sourceMaps": true,
      "smartStep": true,           // 自动跳过非用户代码
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

**Source Map 工作原理**：

```
文件结构：
src/
  └── utils.ts          ← 源代码 (TypeScript)
dist/
  └── utils.js          ← 编译后的代码
  └── utils.js.map      ← Source Map
  └── utils.d.ts        ← 类型声明

Source Map 内容示例：
{
  "version": 3,
  "sources": ["../src/utils.ts"],
  "names": ["add", "a", "b"],
  "mappings": "AAAA,SAAgBA...",
  "file": "utils.js",
  "sourceRoot": ""
}

调试时：
- 断点打在 src/utils.ts:10
- VS Code 通过 source map 映射到 dist/utils.js:15
- 实际执行的是 dist/utils.js，但调试器显示 src/utils.ts
```

---

### 4.2 类型错误定位

#### 使用 TypeScript 诊断工具

```bash
# 详细错误信息
tsc --noEmit --pretty

# 生成诊断报告
tsc --noEmit --diagnostics

# 追踪特定文件的问题
tsc --noEmit --traceResolution 2>&1 | grep "my-module"
```

#### 复杂类型错误调试

```typescript
// 案例：复杂的泛型类型错误
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

// 错误代码
async function fetchUser(): Promise<ApiResponse<User>> {
  const response = await fetch('/api/user');
  const data = await response.json();

  // ❌ 类型错误：Type 'any' is not assignable to type 'User'
  return {
    data: data,
    status: response.status,
    message: 'OK'
  };
}

// 调试步骤：
// 1. 悬停在变量上查看推断类型
// 2. 使用显式类型注解
async function fetchUserDebug(): Promise<ApiResponse<User>> {
  const response = await fetch('/api/user');

  // 显式声明类型
  const data: User = await response.json();
  //          ^^^^ 如果这里报错，说明 API 返回格式不符合预期

  return {
    data,
    status: response.status,
    message: 'OK'
  };
}

// 3. 使用类型守卫进行运行时检查
function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}
```

#### 使用 @ts-expect-error 进行预期错误测试

```typescript
// 案例：测试类型系统的边界条件

// 测试：验证 readonly 属性
type ImmutableUser = {
  readonly id: number;
  readonly name: string;
};

function testImmutableUser() {
  const user: ImmutableUser = { id: 1, name: '张三' };

  // @ts-expect-error - 测试只读属性不能被修改
  user.id = 2;

  // @ts-expect-error - 测试缺少必需属性
  const incomplete: ImmutableUser = { id: 1 };

  // 如果没有产生 TypeScript 错误，@ts-expect-error 会报错
  // 这确保了类型系统按预期工作
}
```

---

### 4.3 tsc --traceResolution

#### 模块解析追踪

```bash
# 追踪模块解析过程
tsc --traceResolution > resolution.log 2>&1

# 配合 grep 查找特定模块
tsc --traceResolution 2>&1 | grep -A 5 "lodash"
```

**输出分析**：

```
======== Resolving module 'express' from '/project/src/server.ts'. ========
Module resolution kind is not specified, using 'NodeJs'.
Loading module 'express' from 'node_modules' folder, target file types: TypeScript, Declaration.
File '/project/node_modules/express/package.json' exists according to earlier cached lookups.
'package.json' has 'types' field './types/index.d.ts' that references '/project/node_modules/express/types/index.d.ts'.
File '/project/node_modules/express/types/index.d.ts' exists - use it as a module resolution result.
======== Module name 'express' was successfully resolved to '/project/node_modules/express/types/index.d.ts'. ========
```

**常见问题排查**：

```bash
# 问题1: 找不到模块声明文件
tsc --traceResolution 2>&1 | grep "Cannot find module"

# 问题2: 使用了错误的类型定义版本
tsc --traceResolution 2>&1 | grep "types"

# 问题3: 模块解析策略问题
tsc --traceResolution 2>&1 | grep "Module resolution kind"
```

---

## 五、常见问题排查

### 5.1 内存泄漏诊断流程

#### 诊断检查清单

```
内存泄漏诊断步骤：

1. 确认问题
   □ 使用 top / htop 观察 RSS 内存增长
   □ 使用 process.memoryUsage() 监控
   □ 确认是内存泄漏而非正常缓存增长

2. 生成堆快照
   □ 初始状态快照
   □ 运行业务操作
   □ 触发垃圾回收 (global.gc())
   □ 再次快照

3. 分析比较
   □ 使用 Chrome DevTools 对比快照
   □ 关注 Detached DOM tree
   □ 关注未释放的 EventListener
   □ 关注 Closure 中的引用

4. 定位根因
   □ 检查全局变量
   □ 检查定时器/interval
   □ 检查事件监听器
   □ 检查缓存策略
```

#### 内存监控脚本

```javascript
// memory-monitor.js
const v8 = require('v8');
const fs = require('fs');

class MemoryMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 60000; // 1分钟
    this.threshold = options.threshold || 100 * 1024 * 1024; // 100MB
    this.snapshotsDir = options.snapshotsDir || './snapshots';

    this.stats = [];
    this.timer = null;
  }

  start() {
    console.log('内存监控已启动');
    this.timer = setInterval(() => this.checkMemory(), this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkMemory() {
    const usage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();

    const stat = {
      timestamp: new Date().toISOString(),
      rss: this.formatBytes(usage.rss),
      heapTotal: this.formatBytes(usage.heapTotal),
      heapUsed: this.formatBytes(usage.heapUsed),
      external: this.formatBytes(usage.external),
      heapSizeLimit: this.formatBytes(heapStats.heap_size_limit)
    };

    this.stats.push(stat);
    console.log(`[${stat.timestamp}] RSS: ${stat.rss}, Heap Used: ${stat.heapUsed}`);

    // 超过阈值时生成堆快照
    if (usage.heapUsed > this.threshold) {
      this.takeHeapSnapshot();
    }

    // 保持最近100条记录
    if (this.stats.length > 100) {
      this.stats.shift();
    }
  }

  takeHeapSnapshot() {
    const snapshot = v8.writeHeapSnapshot(
      `${this.snapshotsDir}/heap-${Date.now()}.heapsnapshot`
    );
    console.log('堆快照已生成:', snapshot);
  }

  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (bytes >= 1024 && unitIndex < units.length - 1) {
      bytes /= 1024;
      unitIndex++;
    }
    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
  }

  generateReport() {
    const report = {
      summary: {
        totalSamples: this.stats.length,
        duration: this.stats.length > 0
          ? `${this.interval * this.stats.length / 60000} 分钟`
          : 'N/A'
      },
      stats: this.stats
    };

    fs.writeFileSync(
      './memory-report.json',
      JSON.stringify(report, null, 2)
    );

    return report;
  }
}

// 使用
const monitor = new MemoryMonitor({
  interval: 30000,  // 30秒
  threshold: 200 * 1024 * 1024  // 200MB
});

monitor.start();

// 优雅退出
process.on('SIGINT', () => {
  monitor.stop();
  monitor.generateReport();
  process.exit(0);
});
```

---

### 5.2 性能瓶颈定位

#### CPU 性能分析流程

```javascript
// 使用 Node.js 内置 profiler
// 1. 生成性能分析文件
node --prof app.js

// 2. 处理分析结果
node --prof-process isolate-0x*-v8.log > profile.txt

// 3. 查看热点函数
// profile.txt 中查找 [JavaScript] 和 [C++ builtin] 部分
```

#### 性能分析工具集成

```javascript
// performance-analyzer.js
const { PerformanceObserver, performance } = require('perf_hooks');

class PerformanceAnalyzer {
  constructor() {
    this.measurements = new Map();
    this.setupObserver();
  }

  setupObserver() {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log(`[${entry.name}] Duration: ${entry.duration.toFixed(2)}ms`);
        this.recordMeasurement(entry.name, entry.duration);
      });
    });
    obs.observe({ entryTypes: ['measure', 'function'] });
  }

  measure(name, fn) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    performance.mark(startMark);

    const result = fn();

    // 处理异步函数
    if (result instanceof Promise) {
      return result.finally(() => {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
      });
    }

    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    return result;
  }

  recordMeasurement(name, duration) {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name).push(duration);
  }

  generateReport() {
    const report = {};

    for (const [name, durations] of this.measurements) {
      const sorted = durations.sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);

      report[name] = {
        count: sorted.length,
        total: sum.toFixed(2) + 'ms',
        average: (sum / sorted.length).toFixed(2) + 'ms',
        min: sorted[0].toFixed(2) + 'ms',
        max: sorted[sorted.length - 1].toFixed(2) + 'ms',
        p95: sorted[Math.floor(sorted.length * 0.95)].toFixed(2) + 'ms',
        p99: sorted[Math.floor(sorted.length * 0.99)].toFixed(2) + 'ms'
      };
    }

    console.log('\n========== 性能报告 ==========');
    console.table(report);
    return report;
  }
}

// 使用示例
const analyzer = new PerformanceAnalyzer();

// 测量数据库查询
async function getUserData(userId) {
  return analyzer.measure('db.getUser', async () => {
    // 模拟数据库查询
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id: userId, name: '张三' };
  });
}

// 测量 API 调用
async function callExternalAPI() {
  return analyzer.measure('api.external', async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  });
}

// 批量测试
async function runBenchmark() {
  for (let i = 0; i < 100; i++) {
    await getUserData(i);
    await callExternalAPI();
  }

  analyzer.generateReport();
}

runBenchmark();
```

---

### 5.3 死锁和竞态条件检测

#### 死锁检测器

```javascript
// deadlock-detector.js
class DeadlockDetector {
  constructor() {
    this.lockGraph = new Map(); // resource -> resources it waits for
    this.heldLocks = new Map(); // resource -> holder
  }

  // 尝试获取锁
  acquireLock(resource, holder) {
    const currentHolder = this.heldLocks.get(resource);

    if (currentHolder && currentHolder !== holder) {
      // 资源被占用，检查是否会形成循环等待
      this.lockGraph.set(holder, resource);

      if (this.hasCycle(holder)) {
        this.lockGraph.delete(holder);
        throw new Error(
          `死锁检测: ${holder} 等待 ${resource} 会形成循环依赖`
        );
      }

      return false; // 获取失败，需要等待
    }

    this.heldLocks.set(resource, holder);
    return true;
  }

  // 释放锁
  releaseLock(resource, holder) {
    if (this.heldLocks.get(resource) === holder) {
      this.heldLocks.delete(resource);
      this.lockGraph.delete(holder);
    }
  }

  // 使用 DFS 检测环
  hasCycle(start) {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (node) => {
      visited.add(node);
      recursionStack.add(node);

      const neighbor = this.lockGraph.get(node);
      if (neighbor) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    return dfs(start);
  }
}

// 使用示例
const detector = new DeadlockDetector();

async function transfer(from, to, amount) {
  const lock1 = from < to ? from : to;
  const lock2 = from < to ? to : from;

  // 按固定顺序获取锁，避免死锁
  await acquireLock(lock1);
  await acquireLock(lock2);

  // 执行转账
  accounts[from] -= amount;
  accounts[to] += amount;

  releaseLock(lock2);
  releaseLock(lock1);
}
```

#### 竞态条件检测

```javascript
// race-condition-detector.js
class RaceConditionDetector {
  constructor() {
    this.sharedAccess = new Map(); // variable -> access log
    this.warnings = [];
  }

  trackAccess(variable, operation, context) {
    const access = {
      operation, // 'read' | 'write'
      context,   // 调用上下文
      timestamp: Date.now(),
      stack: new Error().stack
    };

    if (!this.sharedAccess.has(variable)) {
      this.sharedAccess.set(variable, []);
    }

    const logs = this.sharedAccess.get(variable);
    logs.push(access);

    // 检查竞态条件：非原子的读写操作
    this.checkRaceCondition(variable, logs);

    // 保持最近100条记录
    if (logs.length > 100) logs.shift();
  }

  checkRaceCondition(variable, logs) {
    const recent = logs.slice(-5); // 最近5次访问

    // 检测读写冲突
    const writes = recent.filter(l => l.operation === 'write');
    const reads = recent.filter(l => l.operation === 'read');

    if (writes.length > 0 && reads.length > 0) {
      // 检查是否是不同的异步上下文
      const contexts = new Set(recent.map(l => l.context));
      if (contexts.size > 1) {
        this.warnings.push({
          variable,
          type: '潜在竞态条件',
          accesses: recent,
          suggestion: '考虑使用锁或原子操作'
        });
      }
    }
  }

  report() {
    if (this.warnings.length === 0) {
      console.log('✓ 未检测到竞态条件');
      return;
    }

    console.warn(`⚠️ 检测到 ${this.warnings.length} 个潜在竞态条件:\n`);
    this.warnings.forEach((warning, i) => {
      console.warn(`${i + 1}. ${warning.type} - 变量: ${warning.variable}`);
      console.warn(`   建议: ${warning.suggestion}\n`);
    });
  }
}

// 使用示例
const detector = new RaceConditionDetector();

let sharedCounter = 0;

async function increment() {
  detector.trackAccess('sharedCounter', 'read', 'increment');
  const current = sharedCounter;

  // 模拟一些操作
  await new Promise(resolve => setTimeout(resolve, 10));

  detector.trackAccess('sharedCounter', 'write', 'increment');
  sharedCounter = current + 1; // 竞态条件！
}

// 并发执行会触发竞态条件警告
Promise.all([
  increment(),
  increment(),
  increment()
]).then(() => {
  console.log('最终值:', sharedCounter); // 可能不是 3
  detector.report();
});
```

---

### 5.4 循环依赖检测

#### 循环依赖分析工具

```javascript
// circular-dependency-detector.js
const fs = require('fs');
const path = require('path');

class CircularDependencyDetector {
  constructor(options = {}) {
    this.extensions = options.extensions || ['.js', '.ts', '.jsx', '.tsx'];
    this.exclude = options.exclude || ['node_modules'];
    this.dependencies = new Map();
  }

  analyze(dir) {
    this.scanDirectory(dir);
    const cycles = this.findCycles();
    return this.generateReport(cycles);
  }

  scanDirectory(dir, basePath = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!this.exclude.some(e => fullPath.includes(e))) {
          this.scanDirectory(fullPath, basePath);
        }
      } else if (this.extensions.some(ext => entry.name.endsWith(ext))) {
        this.analyzeFile(fullPath, basePath);
      }
    }
  }

  analyzeFile(filePath, basePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(basePath, filePath);

    // 匹配 import 和 require 语句
    const importRegex = /(?:import\s+.*?\s+from\s+|require\s*\(\s*)['"]([^'"]+)['"]/g;
    const deps = [];

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // 只处理相对路径的导入
      if (importPath.startsWith('.')) {
        const resolved = this.resolveImport(filePath, importPath);
        if (resolved) {
          deps.push(path.relative(basePath, resolved));
        }
      }
    }

    this.dependencies.set(relativePath, deps);
  }

  resolveImport(fromFile, importPath) {
    const dir = path.dirname(fromFile);
    const resolved = path.resolve(dir, importPath);

    // 尝试不同的扩展名
    for (const ext of ['', ...this.extensions]) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
      // 尝试 index 文件
      const indexPath = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  findCycles() {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];

    const dfs = (node) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = this.dependencies.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cycle = dfs(neighbor);
          if (cycle) return cycle;
        } else if (recursionStack.has(neighbor)) {
          // 发现循环
          const cycleStart = path.indexOf(neighbor);
          return [...path.slice(cycleStart), neighbor];
        }
      }

      path.pop();
      recursionStack.delete(node);
      return null;
    };

    for (const node of this.dependencies.keys()) {
      if (!visited.has(node)) {
        const cycle = dfs(node);
        if (cycle && !cycles.some(c => this.cyclesEqual(c, cycle))) {
          cycles.push(cycle);
        }
      }
    }

    return cycles;
  }

  cyclesEqual(a, b) {
    if (a.length !== b.length) return false;
    const strA = a.join('->');
    for (let i = 0; i < b.length; i++) {
      const rotated = [...b.slice(i), ...b.slice(0, i)];
      if (rotated.join('->') === strA) return true;
    }
    return false;
  }

  generateReport(cycles) {
    return {
      totalFiles: this.dependencies.size,
      totalDependencies: Array.from(this.dependencies.values())
        .reduce((sum, deps) => sum + deps.length, 0),
      circularDependencies: cycles.length,
      cycles: cycles.map(cycle => ({
        chain: cycle.join(' → '),
        files: cycle
      })),
      suggestions: cycles.map(cycle => this.generateSuggestion(cycle))
    };
  }

  generateSuggestion(cycle) {
    return {
      problem: `循环依赖: ${cycle.join(' → ')}`,
      solutions: [
        '1. 提取公共代码到单独的模块',
        '2. 使用依赖注入替代直接导入',
        '3. 将共享类型定义到独立的 types 文件',
        '4. 延迟导入 (将 import 移到函数内部)'
      ]
    };
  }
}

// CLI 使用
if (require.main === module) {
  const targetDir = process.argv[2] || './src';

  console.log(`分析目录: ${targetDir}\n`);

  const detector = new CircularDependencyDetector();
  const report = detector.analyze(targetDir);

  console.log(`扫描文件数: ${report.totalFiles}`);
  console.log(`依赖关系数: ${report.totalDependencies}`);
  console.log(`循环依赖数: ${report.circularDependencies}\n`);

  if (report.cycles.length > 0) {
    console.log('发现的循环依赖:');
    report.cycles.forEach((cycle, i) => {
      console.log(`\n${i + 1}. ${cycle.chain}`);
    });

    console.log('\n解决建议:');
    report.suggestions.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.problem}`);
      s.solutions.forEach(sol => console.log(`   ${sol}`));
    });
  } else {
    console.log('✓ 未发现循环依赖');
  }
}

module.exports = CircularDependencyDetector;
```

---

## 六、调试工具推荐

### 6.1 ndb

ndb 是 Google 推出的增强型 Node.js 调试工具，基于 Chrome DevTools。

#### 安装与使用

```bash
# 安装
npm install -g ndb

# 基本使用
ndb server.js

# 使用 npm 脚本
ndb npm start

# 调试测试
ndb npm test

# 跟随子进程
ndb --follow-child-processes npm test
```

**主要特性**：

```
┌─────────────────────────────────────────────────────────────┐
│  ndb 界面特性：                                              │
│                                                             │
│  1. 更好的 Source Map 支持                                   │
│     - TypeScript 源码映射更准确                              │
│     - 支持 webpack 打包后的源码                              │
│                                                             │
│  2. 子进程调试                                               │
│     - 自动 attach 到子进程                                   │
│     - 支持 cluster 模式                                      │
│                                                             │
│  3. 增强的 Console                                            │
│     - 支持 top-level await                                   │
│     - 更好的自动完成                                         │
│                                                             │
│  4. 网络请求拦截                                              │
│     - 修改请求/响应                                          │
│     - 模拟错误场景                                           │
└─────────────────────────────────────────────────────────────┘
```

#### 实际案例：调试子进程

```javascript
// master.js
const { fork } = require('child_process');

console.log('Master 启动');

const worker = fork('./worker.js');

worker.on('message', (msg) => {
  console.log('收到消息:', msg);
});

worker.send({ cmd: 'start' });
```

```javascript
// worker.js
process.on('message', (msg) => {
  if (msg.cmd === 'start') {
    // 在这里设置断点，ndb 会自动 attach 到这个子进程
    doWork();
  }
});

function doWork() {
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += i;
  }
  process.send({ result });
}
```

```bash
# 使用 ndb 调试子进程
ndb --follow-child-processes master.js
```

---

### 6.2 0x 火焰图

0x 是一个生成 Node.js 火焰图的工具，用于可视化性能瓶颈。

#### 安装与使用

```bash
# 安装
npm install -g 0x

# 基本使用
0x server.js

# 指定输出目录
0x -o ./profiles app.js

# 分析特定时长
0x --collect-only --kernel-tracing -- node app.js

# 使用 Node.js 内置 profiler (无需特权)
0x --node-options="--prof" app.js
```

**火焰图解读**：

```
火焰图结构说明：

┌─────────────────────────────────────────────────────────────┐
│  宽度 = 执行时间占比                                          │
│  颜色 = 不同函数/模块                                         │
│  高度 = 调用栈深度                                            │
│                                                             │
│  [====express=handler====]                                   │
│  [==router==]  [===db.query===]                              │
│  [==handle==]  [==mysql==]  [==parse==]                       │
│                                                             │
│  从上到下是调用关系：                                          │
│  handle → router → express.handler                          │
│                      └── db.query → mysql                   │
│                      └── parse                               │
└─────────────────────────────────────────────────────────────┘

分析要点：
- 顶层宽条 = 热点函数，需要优化
- 平顶 = 函数本身执行时间长
- 尖顶 = 调用栈深，递归可能有问题
```

#### 实际案例：性能优化

```javascript
// slow-app.js - 优化前
const express = require('express');
const app = express();

app.get('/slow', (req, res) => {
  // 同步阻塞操作（CPU 密集型）
  const result = heavyComputation();
  res.json({ result });
});

function heavyComputation() {
  // 同步计算 2秒
  const start = Date.now();
  while (Date.now() - start < 2000) {
    Math.random() * Math.random();
  }
  return 'done';
}

app.listen(3000);
```

```bash
# 生成火焰图
0x --node-options="--prof" slow-app.js

# 发起请求
while true; do curl http://localhost:3000/slow; done

# Ctrl+C 停止后，自动生成火焰图 HTML
# 打开 flamegraph.html 查看
```

**优化后**：

```javascript
// fast-app.js - 优化后
const express = require('express');
const app = express();

app.get('/fast', async (req, res) => {
  // 异步处理，不阻塞事件循环
  const result = await asyncComputation();
  res.json({ result });
});

function asyncComputation() {
  return new Promise((resolve) => {
    // 使用 setImmediate 让出事件循环
    setImmediate(() => {
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      resolve(result);
    });
  });
}

app.listen(3000);
```

---

### 6.3 clinic.js

clinic.js 是一个全面的 Node.js 性能诊断工具套件。

#### 安装与使用

```bash
# 安装完整套件
npm install -g clinic

# 或单独安装组件
npm install -g clinic-doctor clinic-bubbleprof clinic-flame clinic-heapprofiler
```

**clinic doctor** - 诊断性能问题

```bash
# 收集系统诊断信息
clinic doctor -- node server.js

# 压力测试后生成报告
autocannon -c 100 -d 30 http://localhost:3000
# Ctrl+C 停止，自动生成报告
```

**报告解读**：

```
Doctor 报告示例：

┌─────────────────────────────────────────────────────────────┐
│  Event Loop Delay (事件循环延迟)                            │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│  平均: 12ms    峰值: 45ms                                   │
│  状态: ✓ 正常                                                │
│                                                             │
│  CPU Usage (CPU 使用率)                                     │
│  ████████████████████████████████░░░░░░░░░░░░░░░░░          │
│  平均: 65%    峰值: 95%                                      │
│  状态: ⚠️ 高负载                                             │
│                                                             │
│  Memory Usage (内存使用)                                     │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│  平均: 120MB    趋势: 稳定增长 ⚠️                            │
│  状态: ⚠️ 可能存在内存泄漏                                    │
│                                                             │
│  诊断建议：                                                  │
│  1. 检查是否有未关闭的数据库连接                             │
│  2. 使用 clinic bubbleprof 分析异步流程                      │
│  3. 使用 clinic heapprofiler 分析内存使用                    │
└─────────────────────────────────────────────────────────────┘
```

**clinic bubbleprof** - 异步流程分析

```bash
# 分析异步操作
clinic bubbleprof -- node server.js

# 发起各种请求后停止
# 生成气泡图，显示异步操作的时间分布
```

**气泡图解读**：

```
气泡图说明：

大气泡 = 耗时长的异步操作
连线 = 异步操作的因果关系
颜色 = 不同类型的操作 (HTTP, DB, File, etc.)

[DB Query]━━━━━━●━━━━━━[HTTP Response]
     ↑                    ↑
[Connection]         [JSON Parse]
     ↑
[DNS Lookup]

从这个图可以看出：
- DNS 查找是瓶颈
- 数据库查询耗时过长
- JSON 解析也有优化空间
```

**clinic heapprofiler** - 内存分析

```bash
# 分析内存使用
clinic heapprofiler -- node server.js

# 生成堆内存分配火焰图
```

---

### 6.4 heapdump

heapdump 用于生成 V8 堆内存快照，分析内存泄漏。

#### 使用场景

```javascript
// memory-leak-demo.js
const heapdump = require('heapdump');
const http = require('http');

// 模拟内存泄漏
const leakyCache = [];

const server = http.createServer((req, res) => {
  // 每次请求都添加大对象到缓存
  const bigObject = {
    data: Buffer.alloc(1024 * 1024), // 1MB
    timestamp: Date.now(),
    url: req.url
  };

  leakyCache.push(bigObject);

  res.end(`Cache size: ${leakyCache.length} items`);
});

// 信号触发堆快照
process.on('SIGUSR2', () => {
  console.log('生成堆快照...');
  heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);
});

// 定时触发
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);

  if (usage.heapUsed > 100 * 1024 * 1024) { // 超过 100MB
    console.log('内存使用过高，生成诊断快照');
    heapdump.writeSnapshot(`./heap-high-${Date.now()}.heapsnapshot`);
  }
}, 10000);

server.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('发送 SIGUSR2 信号生成堆快照');
  console.log('Linux/Mac: kill -USR2 <pid>');
  console.log('Windows: 不支持信号，使用 HTTP 触发');
});
```

#### 分析堆快照

```bash
# 1. 生成快照
node memory-leak-demo.js
# 在另一个终端
for i in {1..100}; do curl http://localhost:3000/; done
kill -USR2 <pid>

# 2. 在 Chrome DevTools 中打开
# 打开 Chrome → DevTools → Memory 面板 → Load
# 选择生成的 .heapsnapshot 文件
```

**分析技巧**：

```
Chrome DevTools 堆快照分析：

1. Summary 视图
   - 按构造函数分组
   - 查找数量异常的对象
   - (array) 和 (string) 通常是泄漏嫌疑

2. Comparison 视图
   - 对比两个时间点的快照
   - 查看新增的对象
   - 定位泄漏源

3. Containment 视图
   - 从 GC root 开始的引用链
   - 查看对象的保留路径

4. Dominators 视图
   - 找出占用内存最多的对象
   - 识别内存大户
```

#### 自动内存泄漏检测

```javascript
// auto-leak-detector.js
const heapdump = require('heapdump');
const v8 = require('v8');

class AutoLeakDetector {
  constructor(options = {}) {
    this.thresholdMB = options.thresholdMB || 100;
    this.growthThreshold = options.growthThreshold || 0.2; // 20% 增长
    this.checkInterval = options.checkInterval || 60000; // 1分钟

    this.measurements = [];
    this.checkCount = 0;
  }

  start() {
    console.log('自动内存泄漏检测已启动');
    this.timer = setInterval(() => this.check(), this.checkInterval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  check() {
    const usage = process.memoryUsage();
    const heapMB = usage.heapUsed / 1024 / 1024;

    this.measurements.push({
      timestamp: Date.now(),
      heapMB,
      rssMB: usage.rss / 1024 / 1024
    });

    this.checkCount++;

    // 保留最近20个测量点
    if (this.measurements.length > 20) {
      this.measurements.shift();
    }

    console.log(`[检查 ${this.checkCount}] Heap: ${heapMB.toFixed(2)} MB`);

    // 检测持续增长
    if (this.measurements.length >= 5) {
      this.detectGrowth();
    }

    // 超过绝对阈值
    if (heapMB > this.thresholdMB) {
      this.triggerDiagnostic('超过内存阈值');
    }
  }

  detectGrowth() {
    const recent = this.measurements.slice(-5);
    const first = recent[0].heapMB;
    const last = recent[recent.length - 1].heapMB;
    const growth = (last - first) / first;

    if (growth > this.growthThreshold) {
      this.triggerDiagnostic(`内存持续增长: ${(growth * 100).toFixed(1)}%`);
    }
  }

  triggerDiagnostic(reason) {
    const timestamp = Date.now();
    const filename = `./heap-diagnostic-${timestamp}.heapsnapshot`;

    console.warn(`⚠️ ${reason}`);
    console.warn(`生成诊断快照: ${filename}`);

    heapdump.writeSnapshot(filename, (err) => {
      if (err) {
        console.error('生成快照失败:', err);
      } else {
        console.log('诊断快照已生成');
      }
    });

    // 同时生成 GC 统计
    const heapStats = v8.getHeapStatistics();
    console.log('GC 统计:', {
      totalHeapSize: (heapStats.total_heap_size / 1024 / 1024).toFixed(2) + ' MB',
      usedHeapSize: (heapStats.used_heap_size / 1024 / 1024).toFixed(2) + ' MB',
      heapSizeLimit: (heapStats.heap_size_limit / 1024 / 1024).toFixed(2) + ' MB'
    });
  }
}

module.exports = AutoLeakDetector;

// 使用
const detector = new AutoLeakDetector({
  thresholdMB: 200,
  growthThreshold: 0.3,
  checkInterval: 30000
});

detector.start();
```

---

## 附录：调试速查表

### 常用 Chrome DevTools 快捷键

| 操作 | Windows/Linux | Mac |
|------|--------------|-----|
| 打开 DevTools | F12 / Ctrl+Shift+I | Cmd+Option+I |
| 切换到 Console | Ctrl+Shift+J | Cmd+Option+J |
| 快速搜索文件 | Ctrl+P | Cmd+P |
| 全局搜索 | Ctrl+Shift+F | Cmd+Option+F |
| 继续执行 | F8 / Ctrl+\ | F8 / Cmd+\ |
| 单步跳过 | F10 / Ctrl+' | F10 / Cmd+' |
| 单步进入 | F11 / Ctrl+; | F11 / Cmd+; |
| 单步跳出 | Shift+F11 / Ctrl+Shift+; | Shift+F11 / Cmd+Shift+; |

### Node.js 调试标志

```bash
# 基础调试
node --inspect                    # 启用调试 (默认端口 9229)
node --inspect=9230               # 指定端口
node --inspect-brk                # 首行暂停
node --inspect=0.0.0.0:9229       # 允许远程调试

# 性能分析
node --prof                       # 生成 v8.log
node --prof-process               # 处理分析结果
node --trace-events-enabled       # 启用追踪事件

# 内存相关
node --expose-gc                  # 暴露 global.gc()
node --max-old-space-size=4096    # 设置堆内存上限
node --heapsnapshot-near-heap-limit=3  # 接近内存限制时生成快照

# 诊断输出
node --trace-warnings             # 追踪警告
node --trace-uncaught             # 追踪未捕获异常
node --report-on-fatalerror       # 致命错误时生成诊断报告
node --report-uncaught-exception  # 未捕获异常时生成报告
```

### VS Code 调试配置模板

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🚀 Launch Current File",
      "type": "node",
      "request": "launch",
      "program": "${file}",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "🐛 Attach to Port",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true
    },
    {
      "name": "⚡ Launch with Nodemon",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "nodemon",
      "program": "${workspaceFolder}/server.js",
      "restart": true,
      "console": "integratedTerminal"
    },
    {
      "name": "📘 Debug Jest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "${fileBasenameNoExtension}"],
      "console": "integratedTerminal"
    },
    {
      "name": "🔷 Debug TypeScript",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/${fileBasenameNoExtension}.ts"],
      "sourceMaps": true
    }
  ]
}
```

---

*本文档持续更新，如有问题或建议，欢迎提交 PR。*
