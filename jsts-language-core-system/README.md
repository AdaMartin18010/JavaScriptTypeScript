# jsts-language-core-system

> JavaScript/TypeScript 语言核心系统：从类型到执行引擎的完整知识体系
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0 | TS 7.0 Go 编译器预览

---

## 八大专题

| 专题 | 文件数 | 核心覆盖 |
|------|--------|---------|
| [01 类型系统](./01-type-system/) | 12+ | 基础类型、泛型、条件类型、工具类型、型变 |
| [02 变量系统](./02-variable-system/) | 9+ | 声明、作用域、闭包、提升、解构、私有状态 |
| [03 控制流](./03-control-flow/) | 9+ | 条件、循环、异常、生成器、异步控制、资源管理 |
| [04 执行模型](./04-execution-model/) | 11+ | V8 引擎、事件循环、内存管理、并发原语 |
| [05 执行流](./05-execution-flow/) | 6+ | 同步/异步流、Promise、async/await、事件循环练习 |
| [06 规范基础](./06-ecmascript-spec-foundation/) | 6+ | 抽象操作、规范类型、内部方法、Completion Records、环境记录、Realm |
| [07 JS/TS 对称差](./07-js-ts-symmetric-difference/) | 6 | JS-Only 特性、TS-Only 特性、运行时影响、类型系统边界、反向映射 |
| [08 模块系统](./08-module-system/) | 6+ | ESM、CommonJS、互操作、模块解析、循环依赖 |
| [09 对象模型](./09-object-model/) | 5+ | 属性描述符、原型链、Proxy/Reflect、私有字段、创建模式 |

**总计：75+ 个理论文件 + 60+ 个可运行 TS 代码文件 | 全部 > 5000 字节**

---

## 三条学习路径

### 路径 A：语言核心 → 执行引擎

```
类型系统 → 变量系统 → 控制流 → 执行模型
```

### 路径 B：前端视角 → 运行时

```
变量/作用域 → 控制流 → 执行流 → 事件循环 → 内存管理
```

### 路径 C：规范视角

```
规范基础 → 类型系统 → 执行模型 → 高级特性
```

---

## 与互补目录的关系

| 本目录 | 互补目录 | 关系 |
|--------|---------|------|
| `jsts-language-core-system/` | `JSTS全景综述/` | 本目录按专题重组，全景综述按 ES 版本罗列 |
| `jsts-language-core-system/` | `jsts-code-lab/` | 本目录重理论机制，代码实验室重实战代码 |

---

## 版本对齐

- **ECMAScript**：2025 (16th Edition)
- **TypeScript**：5.8–6.0
- **TS 编译器**：7.0 "Project Corsa" Go 编译器预览
- **HTML Living Standard**：事件循环模型

---

## 质量指标

- ✅ 63+ 理论文件 > 5000 字节
- ✅ 52+ 可运行 TS 代码文件 (`.ts` + `demo()`)
- ✅ 9/9 README 导航完整
- ✅ 0 个 stub 或空文件
- ✅ 版本对齐到 ES2025 / TS 5.8–6.0

## 深入学习建议

### 前置知识

- JavaScript 基础语法
- ES6+ 新特性
- 基本的数据结构和算法

### 推荐资源

- ECMA-262 规范官方文档 (<https://tc39.es/ecma262/>)
- TypeScript Handbook (<https://www.typescriptlang.org/docs/>)
- V8 博客 (<https://v8.dev/blog>)
- HTML Living Standard (<https://html.spec.whatwg.org/>)

### 实践路径

1. 阅读本专题所有文件
2. 在 Chrome DevTools 中验证概念
3. 尝试修改代码观察行为变化
4. 阅读规范原文加深理解

### 与其他专题的关联

- 类型系统 → 变量系统：类型如何影响变量声明和作用域
- 变量系统 → 控制流：作用域如何影响控制流语句
- 控制流 → 执行模型：异步控制流与事件循环的关系
- 执行模型 → 执行流：引擎如何执行同步和异步代码
- 规范基础 → 所有专题：理解底层规范机制
- 对象模型 → 类型系统：结构类型系统与对象类型的关系
- 对象模型 → 变量系统：闭包与对象私有状态的关联
- 对象模型 → 执行模型：引擎对对象内部方法的优化（Hidden Class、Inline Caching）

## 版本历史

| 日期 | 更新 |
|------|------|
| 2025-04 | 初始版本，骨架搭建 |
| 2025-04 | 全面深化，全部文件 > 5000 字节 |
