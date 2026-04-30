/**
 * Rust vs TypeScript 范畴论对比 — 代码示例
 * 
 * 本文件提供 Rust 与 TypeScript 在范畴论语境下的可运行代码对比，
 * 用于支持 10-rust-vs-typescript-category-theory-analysis.md。
 * 
 * @theory 范畴论语境下的语言对比
 * @reference The Rust Programming Language (2nd ed., 2023)
 */

// ============================================================
// 1. 类型系统对比：名义类型 vs 结构类型
// ============================================================

// TypeScript: 结构类型（Structural Typing）
// 只要形状匹配，就是兼容的
interface TSPerson {
  name: string;
  age: number;
}

interface TSEmployee {
  name: string;
  age: number;
  department: string;
}

// TS: TSEmployee 是 TSPerson 的子类型（结构兼容）
const tsEmployee: TSEmployee = { name: "Alice", age: 30, department: "Engineering" };
const tsPerson: TSPerson = tsEmployee; // ✅ 合法

// Rust: 名义类型（Nominal Typing）
// 即使形状相同，名字不同就是不兼容
// 
// struct RustPerson { name: String, age: u32 }
// struct RustEmployee { name: String, age: u32, department: String }
// 
// let rust_employee = RustEmployee { ... };
// let rust_person: RustPerson = rust_employee; // ❌ 错误！类型名不匹配

// Rust 需要显式实现转换
// impl From<RustEmployee> for RustPerson { ... }

// 范畴论语义：
// TS 的子类型关系是"精度序"（Precision Order），构成偏序范畴
// Rust 的子类型关系是"名义包含"，需要显式函子映射

// ============================================================
// 2. 错误处理对比：Result Monad vs Exception
// ============================================================

// TypeScript: try/catch + Promise（Continuation Monad）
async function tsDivide(a: number, b: number): Promise<number> {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// TS: 错误是隐式传播的（通过调用栈展开）
async function tsCompute(): Promise<number> {
  const x = await tsDivide(10, 2);
  const y = await tsDivide(x, 0); // 隐式抛出
  return y;
}

// Rust: Result<T, E>（Either Monad）
// fn rust_divide(a: f64, b: f64) -> Result<f64, String> {
//     if b == 0.0 { Err("Division by zero".to_string()) }
//     else { Ok(a / b) }
// }
//
// Rust: ? 操作符显式传播错误
// fn rust_compute() -> Result<f64, String> {
//     let x = rust_divide(10.0, 2.0)?;
//     let y = rust_divide(x, 0.0)?; // 显式传播
//     Ok(y)
// }

// 范畴论语义：
// Rust Result = Either Monad = (T + E) 的和类型
// TS Exception = Continuation Monad = 非局部控制流
// ? 操作符 = Kleisli 组合的语法糖
// try/catch = 异常处理器（Handler of Algebraic Effects）

// ============================================================
// 3. 所有权与内存模型
// ============================================================

// TypeScript: GC 管理，无所有权概念
function tsProcess(data: number[]): number[] {
  return data.map(x => x * 2); // 创建新数组，旧数组仍可用
}

// Rust: 线性类型系统，显式所有权
// fn rust_process(data: Vec<i32>) -> Vec<i32> {
//     data.into_iter().map(|x| x * 2).collect()
// }
// // data 在这里已移动，不能再使用

// 范畴论语义：
// Rust 所有权 = 线性逻辑（Linear Logic）
// &T = 共享引用（Affine 类型）
// &mut T = 独占引用（Linear 类型）
// Box<T> = 唯一所有权（Linear 类型）
// TS GC = 隐式资源管理（非线性）

// ============================================================
// 4. 并发模型对比
// ============================================================

// TypeScript: Event Loop + async/await
async function tsConcurrent(): Promise<void> {
  const [a, b] = await Promise.all([
    fetch('/api/a'),
    fetch('/api/b')
  ]);
  // Event Loop 调度，单线程
}

// Rust: async/await + Send/Sync trait
// async fn rust_concurrent() {
//     let (a, b) = tokio::join!(
//         fetch("/api/a"),
//         fetch("/api/b")
//     );
//     // 线程池调度，多线程可能
// }
//
// // Send trait: 可以安全地跨线程传递
// // Sync trait: 可以安全地跨线程共享引用

// 范畴论语义：
// TS Event Loop = Actor 范畴（消息传递）
// Rust async = 效应系统（Effect System），Send/Sync = 效应约束

// ============================================================
// 5. 泛型对比
// ============================================================

// TypeScript: 结构子类型 + 擦除
function tsIdentity<T>(x: T): T { return x; }
// 编译后：function tsIdentity(x) { return x; } // 类型擦除

// Rust: Trait + 单态化
// fn rust_identity<T>(x: T) -> T { x }
// 编译后：为每个使用的类型生成独立的机器码

// 范畴论语义：
// TS 泛型 = 参数多态 + 子类型多态（F 子类型）
// Rust 泛型 = 参数多态（无子类型），Trait = 接口约束

// TODO: 补充生命周期对比、模式匹配对比、宏系统对比
