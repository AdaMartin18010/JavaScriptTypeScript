# JS 引擎架构概览

> V8、SpiderMonkey、JavaScriptCore 的核心组件与执行管线
>
> 对齐版本：ECMAScript 2025 (ES16) | V8 12.x | SpiderMonkey 128+ | JSC 618+

---

## 1. JavaScript 引擎概览

现代 JavaScript 引擎都是**高性能虚拟机**，核心任务：

| 引擎 | 所属组织 | 主要使用场景 |
|------|---------|-------------|
| V8 | Google | Chrome、Node.js、Edge |
| SpiderMonkey | Mozilla | Firefox |
| JavaScriptCore (JSC) | Apple | Safari |
| Chakra | Microsoft | 旧版 Edge（已弃用） |

---

## 2. 核心组件

### 2.1 解析器（Parser / Scanner）

```
源码 → Tokenization（词法分析）→ Parsing（语法分析）→ AST
```

```javascript
// 源码
function add(a, b) { return a + b; }

// AST（抽象语法树）简化表示
{
  type: "FunctionDeclaration",
  id: { type: "Identifier", name: "add" },
  params: [
    { type: "Identifier", name: "a" },
    { type: "Identifier", name: "b" }
  ],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "a" },
        right: { type: "Identifier", name: "b" }
      }
    }]
  }
}
```

### 2.2 解释器（Ignition / Cog / LLInt）

将 AST 编译为**字节码**（Bytecode），逐条解释执行：

```
V8 Ignition 字节码示例：
  LdaSmi [1]          // 加载小整数 1
  Star r0             // 存储到寄存器 r0
  Ldar a0             // 加载参数 a
  Add r0, [0]         // a + r0
  Return              // 返回结果
```

### 2.3 JIT 编译器（TurboFan / IonMonkey / FTL）

将热点代码（Hot Code）编译为**机器码**：

- **基线编译**：快速生成非优化机器码
- **优化编译**：基于类型反馈生成高度优化机器码
- **去优化（Deoptimization）**：当假设不成立时回退到字节码

### 2.4 垃圾回收器（GC）

管理堆内存的分配与回收（详见 [11-memory-management-gc](./11-memory-management-gc.md)）。

---

## 3. 编译管线

### 3.1 V8 的三层编译管线

```
源码 → Parser → AST → Ignition(字节码) → Sparkplug(基线机器码) → Maglev(中级优化) → TurboFan(高级优化)
```

| 层级 | 产物 | 优化程度 | 编译速度 | 适用场景 |
|------|------|---------|---------|---------|
| Ignition | 字节码 | 无 | 极快 | 冷代码、首次执行 |
| Sparkplug | 机器码 | 低 | 快 | 温代码 |
| Maglev | 机器码 | 中 | 中等 | 热代码 |
| TurboFan | 机器码 | 高 | 慢 | 极热代码 |

### 3.2 去优化（Deoptimization）

```javascript
function add(x, y) {
  return x + y;
}

// 前 1000 次调用都是 number，TurboFan 假设 x, y 始终是 number
add(1, 2); // 优化为机器码

// 第 1001 次传入 string，假设不成立！
add("hello", "world"); // 触发去优化，回退到字节码
```

---

## 4. 引擎差异

### 4.1 V8 编译管线演进

- **V8 < 8.6**：Ignition + TurboFan 两层
- **V8 9.0+**：引入 Sparkplug（基线编译器）
- **V8 11.0+**：引入 Maglev（中级优化编译器）
- **V8 12.0+**：三层编译管线成熟

### 4.2 JSC 编译管线

```
LLInt（解释器）→ Baseline JIT → DFG（Data Flow Graph）→ FTL（Faster Than Light）
```

### 4.3 SpiderMonkey 编译管线

```
Cog（解释器）→ Warp（基线+优化编译器，替代 IonMonkey）
```

---

## 5. 性能监控

### 5.1 Chrome DevTools Performance

- Flame Chart：查看函数调用耗时
- Bottom-Up：找出耗时最长的函数

### 5.2 V8 内部标志

```bash
# 查看优化/去优化日志
node --trace-opt --trace-deopt app.js

# 生成性能分析数据
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

---

**参考资源**：V8 Blog | JavaScript Engine Fundamentals
