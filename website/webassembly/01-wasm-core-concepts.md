# 01. WebAssembly 核心概念

> 理解 Wasm 的二进制格式、线性内存模型与栈机执行语义。

---

## 什么是 WebAssembly

WebAssembly (Wasm) 是一种**面向现代浏览器的二进制指令格式**，设计目标：

- **接近原生的执行性能**（比 JS 快 10%-50%，特定场景 2-5 倍）
- **语言无关性**（C/C++、Rust、Go、AssemblyScript 均可编译为 Wasm）
- **安全沙箱**（与 JS 共享同源策略和权限模型）
- **可移植性**（所有主流浏览器、Node.js、Deno、边缘平台均支持）

```
┌─────────────────────────────────────────────┐
│              Web Application                │
├─────────────────────────────────────────────┤
│  JavaScript/TypeScript (协调层、UI、I/O)    │
│         ↕ JS ↔ Wasm 互操作边界              │
│  WebAssembly (计算密集型核心、编解码、算法) │
└─────────────────────────────────────────────┘
```

---

## 二进制格式

Wasm 模块以 `.wasm` 文件分发，内部结构：

```
┌─────────────────────────────────────┐
│  Magic Number: 0x00 0x61 0x73 0x6D │  (\0asm)
│  Version: 0x01 0x00 0x00 0x00      │  (v1)
├─────────────────────────────────────┤
│  Section 1: Type      (函数签名)    │
│  Section 2: Import    (导入)        │
│  Section 3: Function  (函数索引)    │
│  Section 4: Table     (间接调用表)  │
│  Section 5: Memory    (内存定义)    │
│  Section 6: Global    (全局变量)    │
│  Section 7: Export    (导出)        │
│  Section 8: Start     (启动函数)    │
│  Section 9: Element   (表初始化)    │
│  Section 10: Code     (函数体)      │
│  Section 11: Data     (数据段)      │
└─────────────────────────────────────┘
```

### 文本格式 (WAT)

Wasm 的人类可读文本表示：

```wat
(module
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add)
  (export "add" (func $add))
)
```

编译为二进制：

```bash
wat2math add.wat -o add.wasm
```

---

## 线性内存模型

Wasm 使用单一的**线性内存**（Linear Memory），本质是一个可增长的 `ArrayBuffer`：

```
┌────────────────────────────────────────┐
│  0x0000  │  栈底 (Stack)               │
│          │  ...                        │
│          │  栈顶 ↓                     │
├──────────┼─────────────────────────────┤
│          │  堆 (Heap)                  │
│          │  ...                        │
│          │  动态分配                   │
├──────────┼─────────────────────────────┤
│  0xNNNN  │  数据段 (Data Segment)      │
│          │  静态全局数据               │
└──────────┴─────────────────────────────┘
         ↑ 内存页 (64KB / page)
```

JS 中访问 Wasm 内存：

```typescript
const memory = new WebAssembly.Memory({ initial: 1, maximum: 4 });
const uint8 = new Uint8Array(memory.buffer);

// 写入
const str = "Hello Wasm";
const encoder = new TextEncoder();
uint8.set(encoder.encode(str), 0);

// 读取
const decoder = new TextDecoder();
console.log(decoder.decode(uint8.slice(0, str.length)));
```

---

## 栈机执行语义

Wasm 是**基于栈的虚拟机**（Stack Machine），指令操作隐式操作数栈：

```wat
;; 计算 (2 + 3) * 4
i32.const 2   ;; push 2
i32.const 3   ;; push 3
i32.add       ;; pop 2, pop 3, push 5
i32.const 4   ;; push 4
i32.mul       ;; pop 5, pop 4, push 20
```

### 类型系统

Wasm 只有四种数值类型：

| 类型 | 位宽 | 说明 |
|------|------|------|
| `i32` | 32 位 | 有/无符号整数 |
| `i64` | 64 位 | 有/无符号整数 |
| `f32` | 32 位 | IEEE 754 单精度浮点 |
| `f64` | 64 位 | IEEE 754 双精度浮点 |

WasmGC（Wasm 2.0）扩展了结构类型、数组和函数引用。

---

## Wasm 2.0 / 3.0 新特性

| 特性 | 状态 | 说明 |
|------|------|------|
| **SIMD** | 稳定 | 128 位向量操作，图像/音频处理加速 |
| **多内存** | 提案中 | 多个独立线性内存段 |
| **尾调用** | 稳定 | 函数尾调用优化，支持递归模式 |
| **WasmGC** | 稳定 | 托管语言的垃圾回收支持 |
| **Memory64** | 提案中 | 64 位地址空间 |
| **JSPI** | 提案中 | JavaScript Promise Integration，同步调用异步 JS |
