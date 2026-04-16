# WebAssembly 性能深度解析

> 本文档深入探讨 WebAssembly (Wasm) 的设计原理、性能特征、互操作机制及未来发展方向，为 JavaScript/TypeScript 开发者提供全面的 Wasm 技术指南。

---

## 目录

- [WebAssembly 性能深度解析](#webassembly-性能深度解析)
  - [目录](#目录)
  - [1. WebAssembly 的设计原理和类型系统](#1-webassembly-的设计原理和类型系统)
    - [1.1 理论解释](#11-理论解释)
      - [核心设计原则](#核心设计原则)
      - [Wasm 类型系统](#wasm-类型系统)
      - [栈机架构](#栈机架构)
    - [1.2 代码示例](#12-代码示例)
      - [WAT (WebAssembly Text Format) 示例](#wat-webassembly-text-format-示例)
      - [JavaScript 加载和调用](#javascript-加载和调用)
    - [1.3 性能数据](#13-性能数据)
    - [1.4 使用场景](#14-使用场景)
  - [2. Wasm 的内存模型和线性内存](#2-wasm-的内存模型和线性内存)
    - [2.1 理论解释](#21-理论解释)
      - [内存特性](#内存特性)
      - [内存对齐](#内存对齐)
    - [2.2 代码示例](#22-代码示例)
      - [内存操作 WAT](#内存操作-wat)
      - [JavaScript 内存操作](#javascript-内存操作)
    - [2.3 性能数据](#23-性能数据)
    - [2.4 使用场景](#24-使用场景)
  - [3. Wasm 与 JavaScript 的互操作](#3-wasm-与-javascript-的互操作)
    - [3.1 理论解释](#31-理论解释)
      - [互操作成本模型](#互操作成本模型)
    - [3.2 代码示例](#32-代码示例)
      - [基础互操作模式](#基础互操作模式)
      - [高级互操作：字符串传递](#高级互操作字符串传递)
      - [对象序列化](#对象序列化)
    - [3.3 性能数据](#33-性能数据)
    - [3.4 使用场景](#34-使用场景)
  - [4. Rust/C/C++ 编译到 Wasm 的选项](#4-rustcc-编译到-wasm-的选项)
    - [4.1 理论解释](#41-理论解释)
      - [编译工具链对比](#编译工具链对比)
      - [编译输出格式](#编译输出格式)
    - [4.2 代码示例](#42-代码示例)
      - [Rust 编译到 Wasm](#rust-编译到-wasm)
      - [C/C++ 使用 Emscripten](#cc-使用-emscripten)
    - [4.3 性能数据](#43-性能数据)
    - [4.4 使用场景](#44-使用场景)
  - [5. AssemblyScript 的 TypeScript 子集](#5-assemblyscript-的-typescript-子集)
    - [5.1 理论解释](#51-理论解释)
      - [AssemblyScript 类型映射](#assemblyscript-类型映射)
    - [5.2 代码示例](#52-代码示例)
      - [基础语法](#基础语法)
      - [与 JavaScript 交互](#与-javascript-交互)
    - [5.3 性能数据](#53-性能数据)
    - [5.4 使用场景](#54-使用场景)
  - [6. Wasm 的性能特征](#6-wasm-的性能特征)
    - [6.1 理论解释](#61-理论解释)
      - [启动时间分析](#启动时间分析)
    - [6.2 代码示例](#62-代码示例)
      - [性能基准测试](#性能基准测试)
    - [6.3 性能数据](#63-性能数据)
      - [综合性能对比](#综合性能对比)
      - [具体场景性能](#具体场景性能)
    - [6.4 使用场景](#64-使用场景)
  - [7. WASI（WebAssembly System Interface）](#7-wasiwebassembly-system-interface)
    - [7.1 理论解释](#71-理论解释)
      - [WASI 能力模型](#wasi-能力模型)
    - [7.2 代码示例](#72-代码示例)
      - [Rust WASI 程序](#rust-wasi-程序)
      - [自定义 WASI 运行时](#自定义-wasi-运行时)
    - [7.3 性能数据](#73-性能数据)
    - [7.4 使用场景](#74-使用场景)
  - [8. 组件模型（Component Model）的未来](#8-组件模型component-model的未来)
    - [8.1 理论解释](#81-理论解释)
      - [WIT (Wasm Interface Types)](#wit-wasm-interface-types)
    - [8.2 代码示例](#82-代码示例)
      - [Rust Component](#rust-component)
      - [JavaScript 使用 Component](#javascript-使用-component)
      - [组件组合](#组件组合)
    - [8.3 性能数据](#83-性能数据)
    - [8.4 使用场景](#84-使用场景)
  - [9. Wasm 在浏览器外的应用](#9-wasm-在浏览器外的应用)
    - [9.1 理论解释](#91-理论解释)
    - [9.2 代码示例](#92-代码示例)
      - [Cloudflare Workers (边缘计算)](#cloudflare-workers-边缘计算)
      - [Node.js 中使用 Wasm](#nodejs-中使用-wasm)
      - [数据库中的 Wasm](#数据库中的-wasm)
    - [9.3 性能数据](#93-性能数据)
    - [9.4 使用场景](#94-使用场景)
  - [10. Wasm 的安全模型和沙箱机制](#10-wasm-的安全模型和沙箱机制)
    - [10.1 理论解释](#101-理论解释)
      - [安全特性详解](#安全特性详解)
    - [10.2 代码示例](#102-代码示例)
      - [安全沙箱配置](#安全沙箱配置)
      - [形式化验证示例](#形式化验证示例)
    - [10.3 性能数据](#103-性能数据)
    - [10.4 使用场景](#104-使用场景)
  - [总结](#总结)
    - [性能特点](#性能特点)
    - [最佳实践](#最佳实践)
    - [未来展望](#未来展望)

---

## 1. WebAssembly 的设计原理和类型系统

### 1.1 理论解释

WebAssembly 是一种低级的类汇编语言，设计目标是在现代 Web 浏览器中以接近原生的速度运行。

#### 核心设计原则

| 设计原则 | 说明 |
|---------|------|
| **可移植性** | 架构无关，可在所有现代浏览器和平台上运行 |
| **安全性** | 沙箱执行环境，内存安全验证 |
| **高效性** | 紧凑的二进制格式，快速解码和执行 |
| **开放性** | 标准开放，多语言支持 |

#### Wasm 类型系统

Wasm 采用**静态类型系统**，支持以下核心类型：

**数值类型:**

- `i32`: 32位整数
- `i64`: 64位整数
- `f32`: 32位浮点数 (IEEE 754)
- `f64`: 64位浮点数 (IEEE 754)

**向量类型 (SIMD):**

- `v128`: 128位向量 (4x32位, 2x64位, 8x16位, 16x8位)

**引用类型:**

- `funcref`: 函数引用
- `externref`: 外部引用 (外部对象的不透明引用)

#### 栈机架构

Wasm 采用**基于栈的虚拟机架构**：

```
操作示例: 计算 (3 + 4) * 2

栈操作序列:
  i32.const 3    ;; 压入 3  [3]
  i32.const 4    ;; 压入 4  [3, 4]
  i32.add        ;; 弹出 3,4, 压入 7  [7]
  i32.const 2    ;; 压入 2  [7, 2]
  i32.mul        ;; 弹出 7,2, 压入 14 [14]
```

### 1.2 代码示例

#### WAT (WebAssembly Text Format) 示例

```wat
;; 计算阶乘的 Wasm 模块
(module
  ;; 导入 JavaScript 的 console.log 函数
  (import "env" "log" (func $log (param i32)))

  ;; 导出 factorial 函数
  (export "factorial" (func $factorial))

  ;; 阶乘函数实现
  (func $factorial (param $n i32) (result i32)
    (local $result i32)
    (local $i i32)

    ;; result = 1
    i32.const 1
    local.set $result

    ;; i = 1
    i32.const 1
    local.set $i

    (block $done
      (loop $continue
        ;; if i > n, break
        local.get $i
        local.get $n
        i32.gt_s
        br_if $done

        ;; result *= i
        local.get $result
        local.get $i
        i32.mul
        local.set $result

        ;; i++
        local.get $i
        i32.const 1
        i32.add
        local.set $i

        br $continue
      )
    )

    local.get $result
  )
)
```

#### JavaScript 加载和调用

```javascript
// 加载并实例化 Wasm 模块
async function loadWasm() {
  const importObject = {
    env: {
      log: (value) => console.log('Wasm says:', value)
    }
  };

  const response = await fetch('./factorial.wasm');
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, importObject);

  // 调用 Wasm 函数
  console.log('5! =', instance.exports.factorial(5));  // 120
  console.log('10! =', instance.exports.factorial(10)); // 3628800

  return instance.exports;
}

// 预编译模块（可缓存）
async function loadWasmAdvanced(wasmBuffer) {
  const module = await WebAssembly.compile(wasmBuffer);
  const instance1 = await WebAssembly.instantiate(module, importObject);
  const instance2 = await WebAssembly.instantiate(module, importObject);
  return { module, instances: [instance1, instance2] };
}
```

### 1.3 性能数据

| 操作类型 | 执行时间 (ns/op) | 相对于 JS 的加速比 |
|---------|-----------------|-------------------|
| 整数加法 (i32.add) | ~1 | 1.0x |
| 整数乘法 (i32.mul) | ~2 | 1.0x |
| 浮点除法 (f64.div) | ~5 | 1.5x |
| 模块编译 (1MB) | ~50ms | 10x 快于解析 JS |
| 模块实例化 | ~5ms | 5x 快于 JS 初始化 |

### 1.4 使用场景

- **计算密集型任务**: 图像处理、音视频编解码、科学计算
- **游戏引擎**: Unity、Unreal Engine 的 Web 导出
- **加密算法**: 高性能的哈希、签名验证
- **仿真模拟**: 物理引擎、分子动力学模拟

---

## 2. Wasm 的内存模型和线性内存

### 2.1 理论解释

WebAssembly 使用**线性内存（Linear Memory）**模型：

```
┌─────────────────────────────────────────────────────────┐
│                    线性内存布局                          │
├─────────────────────────────────────────────────────────┤
│  地址 0x0000                                            │
│     ┌─────────────────────────────────────────┐          │
│     │  内存页 0 (64KB)                        │          │
│     │  ├─ 数据段 (初始化的全局数据)            │          │
│     │  ├─ 堆 (动态分配)                       │          │
│     │  └─ 栈 (函数调用帧)                     │          │
│     └─────────────────────────────────────────┘          │
│  地址 0x10000                                           │
│     ┌─────────────────────────────────────────┐          │
│     │  内存页 1 (64KB) - 动态增长             │          │
│     └─────────────────────────────────────────┘          │
│  最大 4GB (32位地址空间)                                 │
└─────────────────────────────────────────────────────────┘
```

#### 内存特性

| 特性 | 说明 |
|-----|------|
| 页大小 | 64KB (65536 字节) |
| 初始大小 | 1 页起，编译时确定 |
| 最大大小 | 4GB (2^32 字节) |
| 可增长性 | 通过 memory.grow 指令动态增长 |
| 边界检查 | 所有访问自动边界检查 |

#### 内存对齐

```
对齐规则:
  - i32.load/i32.store: 4 字节对齐
  - i64.load/i64.store: 8 字节对齐
  - v128.load/v128.store: 16 字节对齐

性能影响:
  - 未对齐访问: 可能需要多次内存访问
  - 对齐访问: 单次内存访问，CPU 缓存友好
```

### 2.2 代码示例

#### 内存操作 WAT

```wat
(module
  ;; 定义 1 页初始内存，最多 10 页
  (memory $mem 1 10)

  ;; 导出内存给 JavaScript
  (export "memory" (memory $mem))

  ;; 导出初始化内存函数
  (export "initData" (func $initData))
  (export "sumArray" (func $sumArray))
  (export "growMemory" (func $growMemory))

  ;; 初始化数据到内存
  (func $initData
    ;; 在地址 0 存储数组 [1, 2, 3, 4, 5]
    i32.const 0      ;; 地址
    i32.const 1      ;; 值
    i32.store        ;; 存储 4 字节

    i32.const 4
    i32.const 2
    i32.store

    i32.const 8
    i32.const 3
    i32.store

    i32.const 12
    i32.const 4
    i32.store

    i32.const 16
    i32.const 5
    i32.store
  )

  ;; 求和数组 (假设从地址 0 开始，5 个元素)
  (func $sumArray (result i32)
    (local $sum i32)
    (local $i i32)
    (local $addr i32)

    i32.const 0
    local.set $sum

    i32.const 0
    local.set $i

    (block $done
      (loop $loop
        ;; if i >= 5
        local.get $i
        i32.const 5
        i32.ge_s
        br_if $done

        ;; addr = i * 4
        local.get $i
        i32.const 4
        i32.mul
        local.set $addr

        ;; sum += memory[addr]
        local.get $sum
        local.get $addr
        i32.load         ;; 从内存加载 4 字节
        i32.add
        local.set $sum

        ;; i++
        local.get $i
        i32.const 1
        i32.add
        local.set $i

        br $loop
      )
    )

    local.get $sum
  )

  ;; 增长内存
  (func $growMemory (param $pages i32) (result i32)
    local.get $pages
    memory.grow      ;; 返回之前的页数，失败返回 -1
  )
)
```

#### JavaScript 内存操作

```javascript
async function memoryDemo() {
  const response = await fetch('./memory.wasm');
  const { instance } = await WebAssembly.instantiate(await response.arrayBuffer());

  // 获取导出的内存
  const memory = instance.exports.memory;

  console.log('初始内存大小:', memory.buffer.byteLength, 'bytes'); // 65536

  // 初始化数据
  instance.exports.initData();

  // 直接访问 Wasm 内存
  const int32View = new Int32Array(memory.buffer);
  console.log('内存中的数组:', Array.from(int32View.slice(0, 5))); // [1, 2, 3, 4, 5]

  // 从 JavaScript 写入内存
  int32View[100] = 999;
  int32View[101] = 888;

  // 增长内存
  const previousPages = instance.exports.growMemory(2);
  console.log('增长前页数:', previousPages); // 1
  console.log('新内存大小:', memory.buffer.byteLength, 'bytes'); // 196608 (3页)

  // 注意：增长后需要重新创建视图
  const newView = new Int32Array(memory.buffer);
  console.log('数据仍然保留:', newView[0]); // 1

  return instance.exports.sumArray(); // 15
}

// 高效的内存池管理
class WasmMemoryPool {
  constructor(memory, startOffset, blockSize, blockCount) {
    this.memory = memory;
    this.blockSize = blockSize;
    this.blockCount = blockCount;
    this.startOffset = startOffset;
    this.freeList = new Set(Array.from({length: blockCount}, (_, i) => i));
  }

  allocate() {
    if (this.freeList.size === 0) throw new Error('Out of memory');
    const index = this.freeList.values().next().value;
    this.freeList.delete(index);
    return this.startOffset + index * this.blockSize;
  }

  free(offset) {
    const index = (offset - this.startOffset) / this.blockSize;
    this.freeList.add(index);
  }

  getView(offset, length) {
    return new Uint8Array(this.memory.buffer, offset, length);
  }
}
```

### 2.3 性能数据

| 内存操作 | 延迟 (cycles) | 吞吐量 |
|---------|--------------|--------|
| 对齐的 32 位加载 | 3-4 | 1/周期 |
| 未对齐的 32 位加载 | 8-12 | 0.5/周期 |
| 64 位加载 | 3-5 | 1/周期 |
| 128 位 SIMD 加载 | 4-6 | 2/周期 |
| memory.grow | 1000+ | N/A |
| 边界检查开销 | 0-1 | 硬件优化消除 |

### 2.4 使用场景

- **大型数据缓冲区**: 图像、音频、视频数据的处理
- **共享状态**: JS 和 Wasm 之间的零拷贝数据共享
- **内存池管理**: 自定义分配器减少垃圾回收压力
- **环形缓冲区**: 流式数据处理

---

## 3. Wasm 与 JavaScript 的互操作

### 3.1 理论解释

Wasm-JS 互操作的核心机制：

```
┌─────────────────────────────────────────────────────────────┐
│                    Wasm-JS 互操作模型                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  JavaScript  │◄───────►│  WebAssembly │                 │
│  │   运行时     │         │    模块      │                 │
│  └──────────────┘         └──────────────┘                 │
│         │                        │                         │
│         │ 1. 导入函数            │ 2. 导出函数              │
│         │ 3. 共享内存            │ 4. 表 (间接调用)          │
│         │ 5. 全局变量            │                           │
│         ▼                        ▼                         │
│  ┌──────────────────────────────────────────┐              │
│  │            共享线性内存                   │              │
│  │  (JavaScript TypedArray 视图)            │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

#### 互操作成本模型

| 操作 | 成本级别 | 说明 |
|-----|---------|------|
| 调用 Wasm 函数 | 低 | 约 5-10 个 CPU 周期 |
| 从 Wasm 返回 | 低 | 约 5-10 个 CPU 周期 |
| 传递 i32/f64 | 极低 | 寄存器传递 |
| 传递字符串 | 高 | 需要内存拷贝和编码转换 |
| 传递对象 | 高 | 需要序列化/反序列化 |
| 访问共享内存 | 极低 | 直接内存访问 |

### 3.2 代码示例

#### 基础互操作模式

```javascript
// ============================================
// 模式 1: 基本导入/导出
// ============================================

const importObject = {
  env: {
    // 导入 console.log
    consoleLog: (ptr, len) => {
      const bytes = new Uint8Array(memory.buffer, ptr, len);
      console.log(new TextDecoder().decode(bytes));
    },

    // 导入获取时间戳
    performanceNow: () => performance.now(),

    // 导入数学函数
    mathSin: Math.sin,
    mathCos: Math.cos,

    // 导入内存
    memory: new WebAssembly.Memory({ initial: 1 })
  }
};

const { instance } = await WebAssembly.instantiate(wasmModule, importObject);
const result = instance.exports.add(5, 3);
```

#### 高级互操作：字符串传递

```javascript
// ============================================
// 模式 2: 高效的字符串处理
// ============================================

class WasmStringBridge {
  constructor(instance) {
    this.instance = instance;
    this.memory = instance.exports.memory;
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder('utf-8');
    this.stringCache = new Map();
  }

  // 将 JS 字符串写入 Wasm 内存
  writeString(str, ptr) {
    const bytes = this.encoder.encode(str);
    const view = new Uint8Array(this.memory.buffer, ptr, bytes.length);
    view.set(bytes);
    return bytes.length;
  }

  // 从 Wasm 内存读取字符串
  readString(ptr, len) {
    const view = new Uint8Array(this.memory.buffer, ptr, len);
    return this.decoder.decode(view);
  }

  // 分配内存并写入字符串
  allocateAndWrite(str) {
    const bytes = this.encoder.encode(str);
    const ptr = this.instance.exports.malloc(bytes.length + 1);

    const view = new Uint8Array(this.memory.buffer, ptr, bytes.length + 1);
    view.set(bytes);
    view[bytes.length] = 0; // null terminator

    return { ptr, len: bytes.length };
  }

  // 释放字符串内存
  freeString(ptr) {
    this.instance.exports.free(ptr);
  }
}

// 使用示例
const bridge = new WasmStringBridge(instance);
const { ptr, len } = bridge.allocateAndWrite("Hello WebAssembly!");
const upperPtr = instance.exports.toUpperCase(ptr);
const resultLen = instance.exports.strlen(upperPtr);
const result = bridge.readString(upperPtr, resultLen);
bridge.freeString(ptr);
bridge.freeString(upperPtr);
console.log(result); // "HELLO WEBASSEMBLY!"
```

#### 对象序列化

```javascript
// ============================================
// 模式 3: 复杂数据结构传递
// ============================================

class WasmDataBridge {
  constructor(instance) {
    this.instance = instance;
    this.memory = instance.exports.memory;
    this.view = new DataView(this.memory.buffer);
  }

  // 写入结构体
  writeStruct(ptr, schema, data) {
    let offset = ptr;

    for (const field of schema) {
      switch (field.type) {
        case 'i32':
          this.view.setInt32(offset, data[field.name], true);
          offset += 4;
          break;
        case 'f64':
          this.view.setFloat64(offset, data[field.name], true);
          offset += 8;
          break;
      }
    }
  }

  // 读取结构体
  readStruct(ptr, schema) {
    const data = {};
    let offset = ptr;

    for (const field of schema) {
      switch (field.type) {
        case 'i32':
          data[field.name] = this.view.getInt32(offset, true);
          offset += 4;
          break;
        case 'f64':
          data[field.name] = this.view.getFloat64(offset, true);
          offset += 8;
          break;
      }
    }

    return data;
  }
}

// 定义结构体 Schema
const RectangleSchema = [
  { name: 'x', type: 'f64' },
  { name: 'y', type: 'f64' },
  { name: 'width', type: 'f64' },
  { name: 'height', type: 'f64' }
];

// 使用
const bridge = new WasmDataBridge(instance);
const rectPtr = instance.exports.malloc(32);
bridge.writeStruct(rectPtr, RectangleSchema, {
  x: 10, y: 20, width: 100, height: 50
});
const area = instance.exports.calculateArea(rectPtr);
instance.exports.free(rectPtr);
```

### 3.3 性能数据

| 互操作场景 | 延迟 | 吞吐量 (ops/sec) |
|-----------|------|-----------------|
| 简单函数调用 (i32) | ~20ns | 50,000,000 |
| 简单函数调用 (f64) | ~20ns | 50,000,000 |
| 字符串传递 (100字节) | ~500ns | 2,000,000 |
| 对象序列化 | ~2-10us | 100,000-500,000 |
| 共享内存访问 | ~5ns | 200,000,000 |

### 3.4 使用场景

- **混合计算**: 用 Wasm 处理 CPU 密集型部分，JS 处理 I/O
- **遗留代码**: 将 C/C++ 库移植到 Web
- **安全执行**: 隔离不可信代码
- **多语言应用**: 在 JS 应用中集成 Rust/Go 模块

---

## 4. Rust/C/C++ 编译到 Wasm 的选项

### 4.1 理论解释

#### 编译工具链对比

| 工具链 | 语言 | 特点 | 适用场景 |
|-------|------|------|---------|
| **Emscripten** | C/C++ | 最成熟，提供 POSIX API 模拟 | 大型 C++ 项目移植 |
| **Rust + wasm-pack** | Rust | 现代工具链，优秀的内存安全 | 新项目，系统编程 |
| **Clang/LLVM** | C/C++ | 原生编译，轻量级 | 小型项目，自定义运行时 |
| **TinyGo** | Go | 适合嵌入式，体积小 | IoT，边缘计算 |
| **AssemblyScript** | TypeScript | JS 开发者友好 | Web 前端项目 |

#### 编译输出格式

```
┌─────────────────────────────────────────────────────────┐
│                  Wasm 编译输出选项                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 独立 Wasm 模块 (.wasm)                              │
│     - 无运行时依赖                                       │
│     - 需要手动管理内存和导入                              │
│                                                         │
│  2. Wasm + JS 胶水代码                                   │
│     - Emscripten 生成                                     │
│     - 自动内存管理和 API 适配                             │
│                                                         │
│  3. WASI 模块                                            │
│     - 标准系统接口                                        │
│     - 适合非浏览器环境                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 代码示例

#### Rust 编译到 Wasm

```rust
// ============================================
// Rust 代码 (src/lib.rs)
// ============================================

use wasm_bindgen::prelude::*;

// 导出函数到 JavaScript
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// 使用外部 JavaScript 函数
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    log(&format!("Hello, {}", name));
}

// 复杂类型传递
#[wasm_bindgen]
pub struct Point {
    x: f64,
    y: f64,
}

#[wasm_bindgen]
impl Point {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }

    pub fn distance(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }
}
```

```toml
# Cargo.toml
[package]
name = "wasm-demo"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = { version = "0.3", features = ["console"] }

[profile.release]
opt-level = 3
lto = true
```

```javascript
// 构建和使用
// $ wasm-pack build --target web

import init, { fibonacci, greet, Point } from './pkg/wasm_demo.js';

async function run() {
  await init();

  console.log(fibonacci(10)); // 55
  greet('WebAssembly');       // Hello, WebAssembly!

  const p1 = new Point(0, 0);
  const p2 = new Point(3, 4);
  console.log(p1.distance(p2)); // 5.0
}
```

#### C/C++ 使用 Emscripten

```cpp
// ============================================
// C++ 代码 (example.cpp)
// ============================================

#include <emscripten/emscripten.h>
#include <cmath>

// 导出函数
extern "C" {
    // 基础计算函数
    EMSCRIPTEN_KEEPALIVE
    int add(int a, int b) {
        return a + b;
    }

    // 图像处理示例：灰度转换
    EMSCRIPTEN_KEEPALIVE
    void grayscale(unsigned char* data, int length) {
        for (int i = 0; i < length; i += 4) {
            unsigned char gray = (unsigned char)(
                0.299 * data[i] +
                0.587 * data[i + 1] +
                0.114 * data[i + 2]
            );
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
        }
    }

    // 矩阵乘法
    EMSCRIPTEN_KEEPALIVE
    void matrix_multiply(
        float* A, float* B, float* C,
        int M, int N, int K
    ) {
        for (int i = 0; i < M; i++) {
            for (int j = 0; j < N; j++) {
                float sum = 0.0f;
                for (int k = 0; k < K; k++) {
                    sum += A[i * K + k] * B[k * N + j];
                }
                C[i * N + j] = sum;
            }
        }
    }
}
```

```bash
# 编译命令
# 生成独立 Wasm 模块
emcc example.cpp -O3     -s WASM=1     -s EXPORTED_FUNCTIONS='["_add", "_grayscale", "_matrix_multiply"]'     -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]'     -s ALLOW_MEMORY_GROWTH=1     -o example.js

# 生成纯 Wasm (无 JS 胶水)
emcc example.cpp -O3     -s WASM=1     -s SIDE_MODULE=1     -o example.wasm
```

```javascript
// JavaScript 使用
const Module = require('./example.js');

Module.onRuntimeInitialized = () => {
    // 使用 ccall/cwrap
    const add = Module.cwrap('add', 'number', ['number', 'number']);
    console.log(add(5, 3)); // 8

    // 直接内存操作
    const grayscale = Module.cwrap('grayscale', null, ['number', 'number']);
    const imageData = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]);

    const ptr = Module._malloc(imageData.length);
    Module.HEAPU8.set(imageData, ptr);

    grayscale(ptr, imageData.length);

    const result = Module.HEAPU8.subarray(ptr, ptr + imageData.length);
    console.log(result); // 灰度化后的数据

    Module._free(ptr);
};
```

### 4.3 性能数据

| 编译器/优化级别 | 二进制大小 | 执行速度 | 编译时间 |
|--------------|-----------|---------|---------|
| Rust (debug) | 500KB+ | 1x | 5s |
| Rust (release) | 50KB | 10x | 30s |
| Rust (release + LTO) | 30KB | 12x | 60s |
| Emscripten -O0 | 1MB+ | 1x | 2s |
| Emscripten -O3 | 100KB | 8x | 15s |
| Emscripten -Os | 80KB | 7x | 15s |

### 4.4 使用场景

- **Rust**: 新项目、需要内存安全、现代工具链
- **Emscripten**: 移植现有 C++ 代码库（如游戏引擎）
- **C**: 嵌入式系统、底层优化
- **多语言混合**: 不同语言模块通过 Wasm 互操作

---

## 5. AssemblyScript 的 TypeScript 子集

### 5.1 理论解释

AssemblyScript 是一种将 TypeScript 子集编译为 WebAssembly 的语言：

```
┌─────────────────────────────────────────────────────────┐
│              AssemblyScript 架构图                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   TypeScript 子集代码                                    │
│   (带类型注解)                                           │
│         │                                               │
│         ▼                                               │
│   ┌─────────────┐     ┌─────────────┐                  │
│   │ 解析器      │────►│ 类型检查器   │                  │
│   └─────────────┘     └─────────────┘                  │
│                              │                          │
│                              ▼                          │
│                        ┌─────────────┐                  │
│                        │ Binaryen    │                  │
│                        │ 编译器      │                  │
│                        └─────────────┘                  │
│                              │                          │
│                              ▼                          │
│                        WebAssembly                      │
│                        二进制代码                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### AssemblyScript 类型映射

| AssemblyScript | WebAssembly | 说明 |
|---------------|-------------|------|
| `i32` | i32 | 32位有符号整数 |
| `i64` | i64 | 64位有符号整数 |
| `f32` | f32 | 32位浮点数 |
| `f64` | f64 | 64位浮点数 |
| `v128` | v128 | 128位 SIMD 向量 |
| `Array<T>` | 内存+长度 | 泛型数组 |
| `string` | 内存+编码 | UTF-16 编码字符串 |
| `class` | 结构体 | 带有布局的复合类型 |

### 5.2 代码示例

#### 基础语法

```typescript
// ============================================
// AssemblyScript (index.ts)
// ============================================

// 导出函数
export function add(a: i32, b: i32): i32 {
    return a + b;
}

// 数组操作
export function sumArray(arr: Array<i32>): i32 {
    let sum: i32 = 0;
    for (let i: i32 = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

// 浮点运算
export function calculateCircleArea(radius: f64): f64 {
    return Math.PI * radius * radius;
}

// 字符串处理
export function greet(name: string): string {
    return "Hello, " + name + "!";
}

// 类定义
export class Vector3 {
    constructor(
        public x: f64 = 0,
        public y: f64 = 0,
        public z: f64 = 0
    ) {}

    magnitude(): f64 {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        );
    }

    add(other: Vector3): Vector3 {
        return new Vector3(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        );
    }

    static dot(a: Vector3, b: Vector3): f64 {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}

// SIMD 操作
export function simdMultiply(a: v128, b: v128): v128 {
    return f32x4.mul(a, b);
}

// 内存管理
export function processData(ptr: usize, length: i32): void {
    const array = Uint32Array.wrap(memory.buffer, ptr, length);

    for (let i: i32 = 0; i < length; i++) {
        array[i] = array[i] * 2;
    }
}
```

```json
// asconfig.json
{
  "targets": {
    "debug": {
      "outFile": "build/debug.wasm",
      "textFile": "build/debug.wat",
      "sourceMap": true,
      "debug": true
    },
    "release": {
      "outFile": "build/release.wasm",
      "textFile": "build/release.wat",
      "sourceMap": true,
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  },
  "options": {
    "bindings": "esm"
  }
}
```

```javascript
// 加载和使用
import { add, sumArray, Vector3 } from './build/release.js';

// 基础函数调用
console.log(add(1, 2)); // 3

// 数组操作
const arr = new Int32Array([1, 2, 3, 4, 5]);
console.log(sumArray(arr)); // 15

// 类操作
const v1 = new Vector3(1, 2, 3);
const v2 = new Vector3(4, 5, 6);
console.log(v1.magnitude());
const v3 = v1.add(v2);
```

#### 与 JavaScript 交互

```typescript
// loader.ts - 高级加载器
import { instantiate } from '@assemblyscript/loader';

async function loadWasm() {
    const module = await WebAssembly.compileStreaming(
        fetch('./build/release.wasm')
    );

    const instance = await instantiate(module, {
        env: {
            abort: (msg, file, line, col) => {
                console.error('Abort: ' + msg + ' at ' + file + ':' + line + ':' + col);
            },
            seed: () => Date.now(),
        },
    });

    // 使用 loader 辅助函数
    const { __newString, __getString, __newArray, __getArray } = instance;

    // 传递字符串
    const ptr = __newString("Hello from JS");
    const resultPtr = instance.exports.processString(ptr);
    const result = __getString(resultPtr);

    // 传递数组
    const arrPtr = __newArray(
        instance.exports.Int32Array_ID,
        [1, 2, 3, 4, 5]
    );
    const sum = instance.exports.sumArray(arrPtr);

    return instance.exports;
}
```

### 5.3 性能数据

| 测试项目 | AssemblyScript | JavaScript | Wasm 优势 |
|---------|---------------|------------|-----------|
| 整数加法 | 1.0x | 1.0x | 相当 |
| 浮点运算 | 1.5x | 1.0x | 50% |
| 数组求和 | 2.0x | 1.0x | 100% |
| 矩阵乘法 | 5.0x | 1.0x | 400% |
| 字符串处理 | 0.8x | 1.0x | -20% (需要转换) |
| 二进制大小 | 5KB | N/A | 极小 |

### 5.4 使用场景

- **前端计算**: 图像滤镜、音频处理、游戏逻辑
- **算法库**: 排序、搜索、数学计算
- **教育目的**: 学习 Wasm 而不需要学习 Rust/C
- **快速原型**: 从 TS 到 Wasm 的快速迭代

---

## 6. Wasm 的性能特征

### 6.1 理论解释

WebAssembly 的性能优势主要来自以下几个方面：

```
┌─────────────────────────────────────────────────────────┐
│              Wasm 性能优势来源                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 二进制格式                                           │
│     - 比文本 JS 快 10-20 倍解码                          │
│     - 紧凑，网络传输更快                                 │
│                                                         │
│  2. 静态类型                                             │
│     - 编译时类型检查，无运行时类型检查开销                │
│     - 更优化的机器码生成                                 │
│                                                         │
│  3. 线性内存                                             │
│     - 连续的内存布局，缓存友好                           │
│     - 无 GC 暂停，可预测的性能                           │
│                                                         │
│  4. 提前编译 (AOT)                                       │
│     - 浏览器可并行编译                                   │
│     - 启动时已是优化代码                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 启动时间分析

| 阶段 | JavaScript | WebAssembly | 说明 |
|-----|-----------|-------------|------|
| 下载 | 慢 (文本) | 快 (二进制) | Wasm 通常小 50-80% |
| 解析 | 慢 | 极快 | Wasm 解析快 10-20 倍 |
| 编译 | JIT | AOT | Wasm 可流式编译 |
| 优化 | 运行时 | 已优化 | Wasm 无需再优化 |
| 执行 | 优化后 | 直接执行 | JS 需要预热 |

### 6.2 代码示例

#### 性能基准测试

```javascript
// ============================================
// 性能测试框架
// ============================================

class WasmBenchmark {
    constructor(wasmInstance) {
        this.wasm = wasmInstance.exports;
        this.results = [];
    }

    measure(name, fn, iterations = 1000000) {
        // 预热
        for (let i = 0; i < 1000; i++) fn();

        // 正式测试
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = performance.now();

        const opsPerSecond = iterations / ((end - start) / 1000);
        const timePerOp = (end - start) * 1000 / iterations; // microseconds

        this.results.push({
            name,
            opsPerSecond,
            timePerOp,
            totalTime: end - start
        });

        return { opsPerSecond, timePerOp };
    }

    compare(jsFn, wasmFn, name) {
        const jsResult = this.measure(name + ' (JS)', jsFn);
        const wasmResult = this.measure(name + ' (Wasm)', wasmFn);

        const speedup = wasmResult.opsPerSecond / jsResult.opsPerSecond;
        console.log(name + ': Wasm ' + speedup.toFixed(2) + 'x faster');

        return { js: jsResult, wasm: wasmResult, speedup };
    }
}

// ============================================
// 具体测试用例
// ============================================

async function runBenchmarks() {
    const { instance } = await WebAssembly.instantiateStreaming(
        fetch('./benchmark.wasm')
    );

    const bench = new WasmBenchmark(instance);

    // 测试 1: 阶乘计算
    function jsFactorial(n) {
        if (n <= 1) return 1;
        return n * jsFactorial(n - 1);
    }

    bench.compare(
        () => jsFactorial(20),
        () => instance.exports.factorial(20),
        'Factorial'
    );

    // 测试 2: 斐波那契数列
    function jsFibonacci(n) {
        if (n <= 1) return n;
        return jsFibonacci(n - 1) + jsFibonacci(n - 2);
    }

    bench.compare(
        () => jsFibonacci(25),
        () => instance.exports.fibonacci(25),
        'Fibonacci'
    );

    // 测试 3: 矩阵乘法
    const size = 64;
    const a = new Float32Array(size * size).map(() => Math.random());
    const b = new Float32Array(size * size).map(() => Math.random());
    const c = new Float32Array(size * size);

    function jsMatrixMultiply() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let sum = 0;
                for (let k = 0; k < size; k++) {
                    sum += a[i * size + k] * b[k * size + j];
                }
                c[i * size + j] = sum;
            }
        }
    }

    const aPtr = instance.exports.malloc(a.length * 4);
    const bPtr = instance.exports.malloc(b.length * 4);
    const cPtr = instance.exports.malloc(c.length * 4);

    new Float32Array(instance.exports.memory.buffer).set(a, aPtr / 4);
    new Float32Array(instance.exports.memory.buffer).set(b, bPtr / 4);

    bench.compare(
        jsMatrixMultiply,
        () => instance.exports.matrixMultiply(aPtr, bPtr, cPtr, size),
        'Matrix Multiply'
    );

    // 打印结果
    console.table(bench.results);
}
```

### 6.3 性能数据

#### 综合性能对比

| 测试项目 | JavaScript (V8) | WebAssembly | 加速比 |
|---------|-----------------|-------------|--------|
| 启动时间 | 100ms | 20ms | 5x |
| 编译时间 | 500ms | 50ms | 10x |
| 峰值性能 | 1.0x | 0.9-1.3x | ~1x |
| 内存使用 | 基准 | 50-80% | 更好 |
| 可预测性 | 有 GC 暂停 | 无暂停 | 更好 |

#### 具体场景性能

| 场景 | JS 性能 | Wasm 性能 | 适用性 |
|-----|---------|-----------|--------|
| 纯计算 (无DOM) | 1.0x | 1.0-1.5x | 推荐 Wasm |
| 复杂算法 | 1.0x | 2.0-10x | 强烈推荐 Wasm |
| 数据处理 | 1.0x | 1.5-3.0x | 推荐 Wasm |
| 字符串处理 | 1.0x | 0.5-1.0x | 不推荐 Wasm |
| 频繁 JS<->Wasm 调用 | 1.0x | 0.8-1.0x | 边界检查开销 |

### 6.4 使用场景

- **游戏**: 物理引擎、AI、渲染计算
- **多媒体**: 音视频编解码、图像处理
- **科学计算**: 数值模拟、数据分析
- **加密**: 哈希、签名、密钥派生
- **仿真**: CAD、3D 建模、有限元分析

---

## 7. WASI（WebAssembly System Interface）

### 7.1 理论解释

WASI 是 WebAssembly 的标准系统接口，使 Wasm 能够在浏览器外运行：

```
┌─────────────────────────────────────────────────────────┐
│                  WASI 架构                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Wasm 模块 (可移植代码)               │   │
│  │                                                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │
│  │  │ 应用代码 │  │ 标准库  │  │ WASI 导入函数   │ │   │
│  │  └────┬────┘  └────┬────┘  └────────┬────────┘ │   │
│  │       └─────────────┴────────────────┘          │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │              WASI 运行时实现                      │   │
│  │  (wasmtime / wasmer / wasm3 / Node.js / ...)     │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │              宿主系统能力                         │   │
│  │  文件系统 │ 网络 │ 环境变量 │ 时钟 │ 随机数 │ ... │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### WASI 能力模型

WASI 采用**基于能力的安全模型**：

```
传统安全模型:          WASI 能力模型:
┌──────────┐           ┌──────────┐
│ 用户权限 │           │ 文件描述符│
│  ├─ 读   │           │  (fd)    │
│  ├─ 写   │    ──►    │  + 权限   │
│  ├─ 执行 │           │  ├─ 读   │
│  └─ ...  │           │  └─ 写   │
└──────────┘           └──────────┘

优势:
- 最小权限原则
- 显式授权
- 易于沙箱化
```

### 7.2 代码示例

#### Rust WASI 程序

```rust
// ============================================
// Rust WASI 程序 (src/main.rs)
// ============================================

use std::env;
use std::fs;
use std::io::{self, Read, Write};
use std::time::{SystemTime, UNIX_EPOCH};

fn main() -> io::Result<()> {
    // 读取命令行参数
    let args: Vec<String> = env::args().collect();
    println!("Arguments: {:?}", args);

    // 读取环境变量
    if let Ok(home) = env::var("HOME") {
        println!("HOME: {}", home);
    }

    // 文件操作
    let content = fs::read_to_string("/input.txt")?;
    println!("File content: {}", content);

    // 写入文件
    fs::write("/output.txt", "Hello from WASI!")?;

    // 获取当前时间
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap();
    println!("Current time: {} seconds", now.as_secs());

    // 标准输入输出
    print!("Enter your name: ");
    io::stdout().flush()?;

    let mut name = String::new();
    io::stdin().read_line(&mut name)?;
    println!("Hello, {}!", name.trim());

    Ok(())
}
```

```toml
# Cargo.toml
[package]
name = "wasi-demo"
version = "0.1.0"
edition = "2021"

[dependencies]

[profile.release]
opt-level = 3
lto = true
```

```bash
# 编译为 WASI 目标
rustup target add wasm32-wasi
cargo build --target wasm32-wasi --release

# 使用 Wasmtime 运行
wasmtime --dir=. ./target/wasm32-wasi/release/wasi-demo.wasm arg1 arg2

# 使用 Wasmer 运行
wasmer run --dir=. ./target/wasm32-wasi/release/wasi-demo.wasm
```

#### 自定义 WASI 运行时

```javascript
// ============================================
// Node.js WASI 实现
// ============================================

const { WASI } = require('wasi');
const fs = require('fs');
const path = require('path');

async function runWasiModule(wasmPath, args = []) {
    const wasi = new WASI({
        args: [path.basename(wasmPath), ...args],
        env: process.env,
        preopens: {
            '/sandbox': '/actual/path/on/host',
            '/tmp': '/tmp'
        },
        returnOnExit: true
    });

    const wasm = await WebAssembly.compile(
        fs.readFileSync(wasmPath)
    );

    const instance = await WebAssembly.instantiate(
        wasm,
        {
            wasi_snapshot_preview1: wasi.wasiImport,
            // 自定义导入
            env: {
                custom_log: (ptr, len) => {
                    const memory = instance.exports.memory;
                    const bytes = new Uint8Array(memory.buffer, ptr, len);
                    console.log('[Wasm Log]:', new TextDecoder().decode(bytes));
                }
            }
        }
    );

    wasi.start(instance);

    return instance;
}

// 使用
runWasiModule('./app.wasm', ['--verbose', '--output', 'result.txt']);
```

```rust
// 使用 wit-bindgen 生成类型安全的绑定
// wit/host.wit
/*
package example:host;

world host {
    import custom-log: func(msg: string);

    export run: func() -> result<string, error>;
}
*/

// src/lib.rs
wit_bindgen::generate!({
    world: "host",
    path: "wit/host.wit"
});

struct MyComponent;

impl Guest for MyComponent {
    fn run() -> Result<String, Error> {
        custom_log("Starting component...");

        // 执行操作
        let result = do_work()?;

        custom_log(&format!("Result: {}", result));
        Ok(result)
    }
}

export!(MyComponent);
```

### 7.3 性能数据

| WASI 运行时 | 启动时间 | 内存占用 | 性能 | 成熟度 |
|------------|---------|---------|------|--------|
| Wasmtime | ~10ms | ~10MB | 优秀 | 高 |
| Wasmer | ~15ms | ~15MB | 优秀 | 高 |
| Wasm3 | ~5ms | ~5MB | 良好 | 中 |
| WasmEdge | ~20ms | ~20MB | 优秀 | 中 |
| Node.js WASI | ~50ms | ~50MB | 良好 | 中 |

### 7.4 使用场景

- **微服务**: 轻量级、安全的容器替代方案
- **插件系统**: 安全的第三方扩展机制
- **边缘计算**: 快速启动，低资源消耗
- **可移植工具**: 跨平台的 CLI 工具
- **区块链**: 智能合约执行环境

---

## 8. 组件模型（Component Model）的未来

### 8.1 理论解释

WebAssembly Component Model 是 Wasm 的下一代标准：

```
┌─────────────────────────────────────────────────────────┐
│              Component Model 架构                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Component (组件)                    │   │
│  │                                                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │
│  │  │ Rust    │  │ C++     │  │ TypeScript      │ │   │
│  │  │ Module  │  │ Module  │  │ Module          │ │   │
│  │  └────┬────┘  └────┬────┘  └────────┬────────┘ │   │
│  │       └─────────────┴────────────────┘          │   │
│  │                   │                              │   │
│  │              Interface Types                     │   │
│  │         (跨语言类型系统)                          │   │
│  │                   │                              │   │
│  │  ┌────────────────┴────────────────┐            │   │
│  │  │  Imports: 需要的功能              │            │   │
│  │  │  Exports: 提供的功能              │            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  特性:                                                  │
│  - 语言无关的接口定义 (WIT)                              │
│  - 自动类型转换和序列化                                   │
│  - 组合多个组件                                         │
│  - 虚拟化能力                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### WIT (Wasm Interface Types)

```wit
// example.wit
package example:calculator@1.0.0;

// 定义接口
interface operations {
    record point {
        x: f64,
        y: f64,
    }

    enum operator {
        add,
        subtract,
        multiply,
        divide,
    }

    // 基本操作
    calculate: func(a: f64, b: f64, op: operator) -> result<f64, string>;

    // 几何计算
    distance: func(p1: point, p2: point) -> f64;

    // 列表操作
    sum-list: func(values: list<f64>) -> f64;
}

// 定义世界（组件集合）
world calculator {
    export operations;
    import wasi:cli/stdout@0.2.0;
}
```

### 8.2 代码示例

#### Rust Component

```rust
// ============================================
// Rust Component (src/lib.rs)
// ============================================

use bindings::exports::example::calculator::operations::*;

mod bindings {
    wit_bindgen::generate!({
        world: "calculator",
        path: "../wit/example.wit"
    });
}

struct Component;

impl Guest for Component {
    fn calculate(a: f64, b: f64, op: Operator) -> Result<f64, String> {
        match op {
            Operator::Add => Ok(a + b),
            Operator::Subtract => Ok(a - b),
            Operator::Multiply => Ok(a * b),
            Operator::Divide => {
                if b == 0.0 {
                    Err("Division by zero".to_string())
                } else {
                    Ok(a / b)
                }
            }
        }
    }

    fn distance(p1: Point, p2: Point) -> f64 {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        (dx * dx + dy * dy).sqrt()
    }

    fn sum_list(values: Vec<f64>) -> f64 {
        values.iter().sum()
    }
}

bindings::export!(Component with_types_in bindings);
```

#### JavaScript 使用 Component

```javascript
// ============================================
// JavaScript 组件宿主
// ============================================

import { ComponentFactory } from '@bytecodealliance/componentize-js';

async function runComponent() {
    // 加载组件
    const component = await ComponentFactory.fromFile(
        './calculator.wasm'
    );

    // 获取导出的接口
    const calculator = component.exports['example:calculator/operations'];

    // 使用类型安全的 API
    const result = calculator.calculate(10, 5, 'add');
    console.log('10 + 5 =', result); // 15

    const distance = calculator.distance(
        { x: 0, y: 0 },
        { x: 3, y: 4 }
    );
    console.log('Distance:', distance); // 5

    const sum = calculator.sumList([1, 2, 3, 4, 5]);
    console.log('Sum:', sum); // 15
}
```

#### 组件组合

```wit
// combined.wit
package example:app@1.0.0;

// 引入其他组件
interface app {
    use example:calculator/operations.{point};

    complex-calculation: func(points: list<point>) -> result<f64, string>;
}

world combined {
    import example:calculator/operations@1.0.0;
    import wasi:http/outgoing-handler@0.2.0;

    export app;
}
```

```rust
// 组合多个组件
use bindings::example::calculator::operations::*;
use bindings::wasi::http::outgoing_handler::*;

fn complex_calculation(points: Vec<Point>) -> Result<f64, String> {
    if points.len() < 2 {
        return Err("Need at least 2 points".to_string());
    }

    let mut total_distance = 0.0;

    for i in 0..points.len() - 1 {
        // 调用导入的 calculator 组件
        total_distance += distance(&points[i], &points[i + 1]);
    }

    // 可能还使用 HTTP 客户端
    // let response = handle(request)?;

    Ok(total_distance)
}
```

### 8.3 性能数据

| 特性 | 当前 Wasm | Component Model | 影响 |
|-----|-----------|-----------------|------|
| 类型转换开销 | 手动 | 自动优化 | 减少 50-80% |
| 跨模块调用 | 共享内存 | 直接调用 | 延迟降低 30% |
| 二进制大小 | 基准 | 增加 10-20% | 接口元数据 |
| 启动时间 | 基准 | 增加 5-10ms | 组件初始化 |
| 开发效率 | 低 | 高 | 大幅提升 |

### 8.4 使用场景

- **微服务网格**: 多语言服务的无缝集成
- **插件生态**: 标准化的插件接口
- **云原生应用**: 跨平台的可移植组件
- **IoT**: 资源受限设备的组件化部署
- **Serverless**: 更快的冷启动和更好的隔离

---

## 9. Wasm 在浏览器外的应用

### 9.1 理论解释

WebAssembly 正在扩展到浏览器之外的多个领域：

```
┌─────────────────────────────────────────────────────────┐
│              Wasm 生态系统                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  浏览器                                                 │
│  ├─ 游戏引擎 (Unity, Unreal)                           │
│  ├─ 多媒体处理 (FFmpeg.wasm)                           │
│  ├─ 设计工具 (Figma, AutoCAD)                          │
│  └─ 开发工具 (VS Code Web)                             │
│                                                         │
│  服务器端                                              │
│  ├─ 微服务 (Wasmtime, Wasmer)                          │
│  ├─ 边缘计算 (Cloudflare Workers, Fastly Compute)      │
│  ├─ 函数计算 (AWS Lambda, Azure Functions)             │
│  └─ 数据库 (Wasm UDFs in SQLite, PostgreSQL)           │
│                                                         │
│  区块链                                                │
│  ├─ 智能合约 (Polkadot, NEAR, EOS)                     │
│  └─ 执行环境 (Ethereum 2.0)                            │
│                                                         │
│  物联网/嵌入式                                         │
│  ├─ 微控制器 (Wasm3, WAMR)                             │
│  └─ 工业控制                                           │
│                                                         │
│  桌面应用                                              │
│  ├─ Tauri (Rust + Web 技术)                            │
│  └─ 跨平台运行时                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.2 代码示例

#### Cloudflare Workers (边缘计算)

```rust
// ============================================
// Cloudflare Worker (Rust)
// ============================================

use worker::*;
use serde_json::json;

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    // 路由处理
    match req.path().as_str() {
        "/api/compute" => handle_compute(req).await,
        "/api/hash" => handle_hash(req).await,
        _ => Response::error("Not found", 404),
    }
}

async fn handle_compute(_req: Request) -> Result<Response> {
    // 在边缘节点执行高性能计算
    let result = perform_intensive_calculation();

    Response::from_json(&json!({
        "result": result,
        "edge_location": "CF-Edge"
    }))
}

fn perform_intensive_calculation() -> f64 {
    // CPU 密集型计算
    let mut sum = 0.0;
    for i in 0..1_000_000 {
        sum += (i as f64).sin();
    }
    sum
}

async fn handle_hash(mut req: Request) -> Result<Response> {
    let body = req.text().await?;

    // 使用 Rust 加密库
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(body.as_bytes());
    let result = hasher.finalize();

    Response::ok(format!("{:x}", result))
}
```

```javascript
// wrangler.toml
name = "wasm-worker"
main = "build/worker/shim.mjs"
compatibility_date = "2024-01-01"

[build]
command = "cargo install -q worker-build && worker-build --release"
```

#### Node.js 中使用 Wasm

```javascript
// ============================================
// Node.js 高性能模块
// ============================================

const fs = require('fs');
const path = require('path');

class ImageProcessor {
    constructor() {
        const wasmBuffer = fs.readFileSync(
            path.join(__dirname, 'image_processor.wasm')
        );

        this.memory = new WebAssembly.Memory({
            initial: 10,
            maximum: 100
        });

        const importObject = {
            env: {
                memory: this.memory,
                abort: (msg, file, line, col) => {
                    console.error('Abort at ' + file + ':' + line + ':' + col);
                }
            }
        };

        const wasmModule = new WebAssembly.Module(wasmBuffer);
        this.instance = new WebAssembly.Instance(wasmModule, importObject);
    }

    processImage(imageBuffer, operation) {
        const { exports } = this.instance;
        const { malloc, free, process_image } = exports;

        // 分配内存
        const inputPtr = malloc(imageBuffer.length);
        const outputPtr = malloc(imageBuffer.length);

        // 写入输入数据
        const memoryView = new Uint8Array(this.memory.buffer);
        memoryView.set(imageBuffer, inputPtr);

        // 执行处理
        const resultSize = process_image(
            inputPtr,
            imageBuffer.length,
            outputPtr,
            operation
        );

        // 读取结果
        const result = Buffer.from(
            memoryView.slice(outputPtr, outputPtr + resultSize)
        );

        // 释放内存
        free(inputPtr);
        free(outputPtr);

        return result;
    }
}

// 使用示例
const processor = new ImageProcessor();

const image = fs.readFileSync('input.png');
const resized = processor.processImage(image, 'resize');
const grayscale = processor.processImage(image, 'grayscale');

fs.writeFileSync('output.png', resized);
```

#### 数据库中的 Wasm

```rust
// ============================================
// SQLite Wasm UDF
// ============================================

use sqlite_wasm_udf::prelude::*;

#[sqlite_udf]
fn json_path(json_text: &str, path: &str) -> Result<String> {
    let value: serde_json::Value = serde_json::from_str(json_text)?;

    let mut current = &value;
    for segment in path.split('.') {
        current = current.get(segment)
            .ok_or_else(|| Error::new("Path not found"))?;
    }

    Ok(current.to_string())
}

#[sqlite_udf]
fn regex_match(text: &str, pattern: &str) -> Result<bool> {
    let regex = regex::Regex::new(pattern)?;
    Ok(regex.is_match(text))
}

#[sqlite_udf]
fn calculate(expression: &str) -> Result<f64> {
    // 使用 meval-rs 解析数学表达式
    meval::eval_str(expression)
        .map_err(|e| Error::new(&e.to_string()))
}
```

```sql
-- 在 SQL 中使用 Wasm UDF
SELECT
    id,
    json_path(data, 'user.name') as user_name,
    regex_match(email, '^[a-z]+@[a-z]+\.com$') as is_valid_email,
    calculate('sin(x) * cos(y)') as computed_value
FROM records;
```

### 9.3 性能数据

| 场景 | 传统方案 | Wasm 方案 | 优势 |
|-----|---------|-----------|------|
| 边缘计算冷启动 | 100-500ms | 1-10ms | 10-100x 更快 |
| 服务器less函数 | 1-3s | 10-50ms | 快速启动 |
| 数据库 UDF | 1-5ms | 0.1-1ms | 沙箱安全 |
| IoT 设备 | 无法运行 | 可运行 | 可移植性 |
| 区块链合约 | Gas 高 | Gas 低 | 高效执行 |

### 9.4 使用场景

- **边缘计算**: CDN 边缘的实时处理
- **Serverless**: 快速启动的函数计算
- **数据库扩展**: 安全的自定义函数
- **区块链**: 高性能智能合约
- **IoT**: 跨设备的可移植逻辑

---

## 10. Wasm 的安全模型和沙箱机制

### 10.1 理论解释

WebAssembly 的安全设计基于多个层次：

```
┌─────────────────────────────────────────────────────────┐
│              Wasm 安全层次                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 4: 应用层安全                                     │
│  ├─ 安全的 API 设计                                      │
│  ├─ 输入验证                                             │
│  └─ 最小权限原则                                         │
│                                                         │
│  Layer 3: 宿主环境安全                                   │
│  ├─ 功能白名单 (Capability-based)                        │
│  ├─ 资源限制 (CPU/内存)                                  │
│  └─ 网络隔离                                             │
│                                                         │
│  Layer 2: Wasm 运行时安全                                │
│  ├─ 模块验证 (Validation)                                │
│  ├─ 线性内存隔离                                         │
│  ├─ 调用栈保护                                           │
│  └─ 间接调用检查                                         │
│                                                         │
│  Layer 1: 语言级安全                                     │
│  ├─ 类型安全                                             │
│  ├─ 内存安全 (边界检查)                                   │
│  ├─ 控制流完整性                                         │
│  └─ 无未定义行为                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 安全特性详解

| 安全机制 | 实现方式 | 防护对象 |
|---------|---------|---------|
| **类型安全** | 静态类型系统，验证时检查 | 类型混淆攻击 |
| **内存安全** | 边界检查，线性内存隔离 | 缓冲区溢出、越界访问 |
| **控制流完整性** | 调用间接表，结构化控制流 | ROP/JOP 攻击 |
| **无未定义行为** | 规范定义所有操作结果 | 未定义行为利用 |
| **确定性执行** | 无外部可见未定义行为 | 侧信道攻击 |

### 10.2 代码示例

#### 安全沙箱配置

```javascript
// ============================================
// 安全的 Wasm 运行时配置
// ============================================

class SecureWasmRuntime {
    constructor(options = {}) {
        this.options = {
            maxMemoryPages: options.maxMemoryPages || 10,
            maxExecutionTime: options.maxExecutionTime || 5000,
            maxCallStackDepth: options.maxCallStackDepth || 1000,
            allowedImports: options.allowedImports || new Set(),
            ...options
        };

        this.stats = {
            memoryAccesses: 0,
            calls: 0,
            startTime: null
        };
    }

    createSecureImports() {
        const runtime = this;

        return {
            env: {
                // 受控的内存访问日志
                memory: new WebAssembly.Memory({
                    initial: 1,
                    maximum: this.options.maxMemoryPages
                }),

                // 受限制的输出
                log: (ptr, len) => {
                    if (len > 1024) {
                        throw new Error('Log message too large');
                    }
                    const bytes = new Uint8Array(
                        this.memory.buffer,
                        ptr,
                        len
                    );
                    console.log('[Wasm]:', new TextDecoder().decode(bytes));
                },

                // 时间访问 (受限)
                time: () => {
                    // 可以添加速率限制
                    return Date.now();
                },

                // 安全的中止处理
                abort: (msgPtr, filePtr, line, col) => {
                    const msg = this.readString(msgPtr);
                    const file = this.readString(filePtr);
                    throw new Error(
                        'Wasm abort: ' + msg + ' at ' + file + ':' + line + ':' + col
                    );
                },

                // 种子随机数 (确定性)
                seed: () => {
                    return this.options.deterministic ? 42 : Date.now();
                }
            },

            // 计量 (Gas 机制)
            metering: {
                use_gas: (amount) => {
                    runtime.gasUsed += amount;
                    if (runtime.gasUsed > runtime.gasLimit) {
                        throw new Error('Out of gas');
                    }
                }
            }
        };
    }

    async run(wasmBuffer, entryPoint, ...args) {
        this.stats.startTime = performance.now();
        this.gasUsed = 0;
        this.gasLimit = this.options.gasLimit || 1000000;

        // 超时检查
        const timeoutId = setTimeout(() => {
            throw new Error('Execution timeout');
        }, this.options.maxExecutionTime);

        try {
            const imports = this.createSecureImports();
            const { instance } = await WebAssembly.instantiate(
                wasmBuffer,
                imports
            );

            this.memory = instance.exports.memory;

            // 包装入口点以添加安全检查
            const wrappedEntry = this.wrapFunction(
                instance.exports[entryPoint]
            );

            const result = await wrappedEntry(...args);

            return {
                result,
                stats: {
                    executionTime: performance.now() - this.stats.startTime,
                    gasUsed: this.gasUsed,
                    memoryPages: this.memory.buffer.byteLength / 65536
                }
            };

        } finally {
            clearTimeout(timeoutId);
        }
    }

    wrapFunction(fn) {
        const runtime = this;
        const original = fn;
        let callDepth = 0;

        return function(...args) {
            callDepth++;

            if (callDepth > runtime.options.maxCallStackDepth) {
                callDepth--;
                throw new Error('Call stack overflow');
            }

            try {
                return original.apply(this, args);
            } finally {
                callDepth--;
            }
        };
    }

    readString(ptr) {
        const view = new Uint8Array(this.memory.buffer);
        let len = 0;
        while (view[ptr + len] !== 0 && len < 1024) len++;
        return new TextDecoder().decode(
            new Uint8Array(this.memory.buffer, ptr, len)
        );
    }
}

// 使用示例
const runtime = new SecureWasmRuntime({
    maxMemoryPages: 5,
    maxExecutionTime: 1000,
    gasLimit: 100000
});

const result = await runtime.run(wasmBuffer, 'compute', input);
console.log('Result:', result.result);
console.log('Stats:', result.stats);
```

#### 形式化验证示例

```rust
// ============================================
// 使用 wasmtime 的安全配置
// ============================================

use wasmtime::{Config, Engine, Module, Store, Limits, MemoryType};
use wasmtime_wasi::WasiCtxBuilder;

fn create_secure_engine() -> Engine {
    let mut config = Config::new();

    // 禁用 JIT sprayed 代码 (防止某些攻击)
    config.cranelift_opt_level(wasmtime::OptLevel::Speed);

    // 启用浮点陷阱 (确定性)
    config.cranelift_nan_canonicalization(true);

    // 禁用并行编译 (如果不需要)
    config.parallel_compilation(false);

    // 启用消耗计量
    config.consume_fuel(true);

    Engine::new(&config).unwrap()
}

fn run_with_limits(wasm_bytes: &[u8]) -> anyhow::Result<()> {
    let engine = create_secure_engine();
    let module = Module::new(&engine, wasm_bytes)?;

    // 限制内存
    let memory_type = MemoryType::new(
        1, // min pages
        Some(10) // max pages
    );

    // 限制 WASI 能力
    let wasi = WasiCtxBuilder::new()
        .inherit_stdio()
        .preopen_dir("/sandbox", "/sandbox")?
        .env("SAFE_MODE", "1")
        .build();

    let mut store = Store::new(&engine, wasi);

    // 设置燃料限制
    store.add_fuel(10000)?;

    // 实例化并运行
    let instance = wasmtime::Instance::new(&mut store, &module, &[])?;

    let run = instance
        .get_typed_func::<(), ()>(&mut store, "run")?;

    run.call(&mut store, ())?;

    // 检查剩余燃料
    let remaining = store.get_fuel()?;
    println!("Fuel consumed: {}", 10000 - remaining);

    Ok(())
}
```

### 10.3 性能数据

| 安全机制 | 性能开销 | 安全提升 |
|---------|---------|---------|
| 边界检查 | 0-5% | 消除缓冲区溢出 |
| 类型验证 | 一次性的 (编译时) | 消除类型混淆 |
| 控制流完整性 | 2-10% | 消除 ROP 攻击 |
| 内存隔离 | 0% | 消除内存泄漏 |
| 计量系统 | 5-15% | 资源控制 |
| 确定性执行 | 10-20% | 消除侧信道 |

### 10.4 使用场景

- **第三方插件**: 安全的扩展机制
- **用户代码执行**: 在线代码运行环境
- **智能合约**: 区块链安全执行
- **边缘计算**: 不可信代码的安全执行
- **多租户环境**: 租户间的安全隔离

---

## 总结

WebAssembly 代表了 Web 平台性能演进的重要里程碑。通过本文档的深入分析，我们可以得出以下关键结论：

### 性能特点

| 维度 | 优势 | 劣势 |
|-----|------|------|
| 计算性能 | 接近原生，比 JS 快 1-10 倍 | 字符串处理较慢 |
| 启动时间 | 比 JS 快 5-10 倍 | 需要额外编译步骤 |
| 内存使用 | 更紧凑，无 GC 暂停 | 手动内存管理 |
| 可移植性 | 跨平台，跨语言 | 生态系统仍在成长 |

### 最佳实践

1. **选择合适的场景**: 计算密集型任务使用 Wasm，DOM 操作留在 JS
2. **减少边界穿越**: 批量处理数据，减少 JS/Wasm 调用次数
3. **共享内存**: 使用 TypedArray 视图实现零拷贝数据传输
4. **预编译**: 使用 WebAssembly.compile 缓存编译结果
5. **错误处理**: 在 Wasm 内部处理错误，避免频繁抛出异常

### 未来展望

- **Component Model**: 将带来真正的跨语言组件生态
- **GC 提案**: 支持高级语言（Java、C#）更高效地编译到 Wasm
- **Exception Handling**: 标准化的异常处理机制
- **Threads**: 共享内存多线程支持
- **SIMD 完善**: 更多向量指令集支持

WebAssembly 正在从浏览器技术演变为通用的安全沙箱执行环境，其影响力将远超 Web 开发领域。

---

*文档版本: 1.0*
*最后更新: 2026-04-08*
