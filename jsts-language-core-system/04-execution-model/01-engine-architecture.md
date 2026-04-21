# JS 引擎架构概览

> V8、SpiderMonkey、JavaScriptCore 的核心组件与执行管线

---

## 内容大纲（TODO）

### 1. JavaScript 引擎概览

- V8（Chrome/Node.js）
- SpiderMonkey（Firefox）
- JavaScriptCore（Safari）

### 2. 核心组件

- Parser / Scanner：词法分析与语法分析
- AST 生成
- Ignition / Interpreter：字节码解释器
- TurboFan / JIT：优化编译器
- GC：垃圾回收器

### 3. 编译管线

- 源码 → AST → 字节码 → 机器码
- 热点代码的优化编译
- 去优化（Deoptimization）

### 4. 引擎差异

- V8 的 Sparkplug / Maglev / Turbofan 三层编译
- JSC 的 LLInt / Baseline / DFG / FTL
- SpiderMonkey 的 Cog / IonMonkey / Warp

### 5. 性能监控

- Chrome DevTools Performance
- --prof / --trace-opt
