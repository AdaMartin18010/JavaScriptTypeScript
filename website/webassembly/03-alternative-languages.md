# 03. AssemblyScript 与替代语言

> 除 Rust 外，AssemblyScript、TinyGo、Grain 等语言的 Wasm 编译路径。

---

## AssemblyScript

**TypeScript 语法 → Wasm 二进制** 的编译器：

```typescript
// assembly/index.ts
export function fib(n: i32): i32 {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

编译：

```bash
npm install assemblyscript
npx asc assembly/index.ts -o build/index.wasm --optimize
```

前端调用：

```typescript
const wasm = await WebAssembly.instantiateStreaming(
  fetch('./build/index.wasm'),
  { env: { abort: () => {} } }
);
console.log(wasm.instance.exports.fib(10));  // 55
```

### AssemblyScript 与 TypeScript 的差异

| 特性 | AssemblyScript | TypeScript |
|------|---------------|------------|
| 类型 | 强制，无 `any` | 可选，有 `any` |
| 数值 | `i32`, `i64`, `f32`, `f64` | `number`, `bigint` |
| 泛型 | 单态化编译 | 类型擦除 |
| GC | 可选 (WasmGC) | JS 引擎自动 |
| 标准库 | 受限 | 完整 |

---

## TinyGo

Go 语言的轻量级子集，支持 Wasm 编译：

```go
package main

import "fmt"

//export add
func add(a, b int32) int32 {
    return a + b
}

func main() {
    fmt.Println("TinyGo Wasm loaded")
}
```

编译：

```bash
tinygo build -o main.wasm -target wasm ./main.go
```

优势：Go 生态（goroutine 编译为异步函数）、体积小（相比完整 Go Wasm）
劣势：标准库受限、无反射、GC 开销

---

## Grain

为 Wasm 设计的函数式语言：

```grain
module Main

let rec fib = (n) => {
  if (n <= 1) {
    n
  } else {
    fib(n - 1) + fib(n - 2)
  }
}

export fib
```

特点：

- 强制类型推断（无显式类型注解）
- 编译输出优化体积极小
- 标准库原生支持 Wasm 宿主调用

---

## 语言选型矩阵

| 语言 | 学习曲线 | 包体积 | 性能 | 生态 | 最佳场景 |
|------|----------|--------|------|------|----------|
| **Rust** | 陡峭 | 小 | 最优 | 极丰富 | 生产级、性能敏感 |
| **AssemblyScript** | 平缓 | 很小 | 优 | 中等 | 前端团队快速上手 |
| **C/C++** | 中等 | 小 | 最优 | 丰富 | 遗留代码迁移 |
| **TinyGo** | 平缓 | 小 | 良 | 受限 | Go 团队、微服务 |
| **Grain** | 平缓 | 极小 | 良 | 小众 | 函数式偏好 |
| **Swift** | 中等 | 中 | 良 | 受限 | iOS 团队共享代码 |
