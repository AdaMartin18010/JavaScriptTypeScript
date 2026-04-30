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

// ============================================================
// 6. 生命周期与借用检查对比
// ============================================================

/**
 * Rust 生命周期：线性类型系统的核心
 * - &'a T: 对 T 的借用，生命周期为 'a
 * - &'a mut T: 对 T 的可变借用，独占性
 * - Box<T>: 堆分配，所有权转移
 *
 * TS 没有生命周期概念，依赖 GC。
 * 但可以用类型级别的标记来模拟。
 */

// TS 中模拟生命周期的尝试（类型标记）
interface Lifetime<'a'> {
  readonly _lifetime: 'a';
}

// 借用引用：模拟 &T
type Borrow<T, L extends string> = T & { readonly _borrow: L };

// 可变借用：模拟 &mut T
type BorrowMut<T, L extends string> = T & { _borrowMut: L };

// 示例：TS 中无法实现真正的借用检查，但可以用类型约束模拟
interface BorrowChecker<T> {
  readonly borrow: <L extends string>(lifetime: L) => Borrow<T, L>;
  readonly borrowMut: <L extends string>(lifetime: L) => BorrowMut<T, L>;
}

// Rust 代码对比：
// fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
//     if x.len() > y.len() { x } else { y }
// }

// TS 等价（无生命周期保证）：
const longest = (x: string, y: string): string =>
  x.length > y.length ? x : y;

// 范畴论语义：
// Rust 生命周期 = 仿射类型（Affine Type）：每个值最多使用一次
// &'a T = 将所有权暂时"出借"，不改变所有权图
// &'a mut T = 独占出借，出借期间原所有者不可用
// TS GC = 隐式共享（无所有权约束）

// ============================================================
// 7. 模式匹配对比
// ============================================================

/**
 * Rust: 穷尽式模式匹配（Exhaustive Pattern Matching）
 * match expr {
 *     Some(x) => ...,
 *     None => ...,      // 必须处理所有情况
 * }
 *
 * TS: 不穷尽，switch/case 或 if/else
 */

// Rust 风格穷尽匹配（通过类型系统模拟）
type Option<T> = { tag: 'Some'; value: T } | { tag: 'None' };

// 穷尽匹配：编译器检查所有分支
const matchOption = <T, R>(
  opt: Option<T>,
  some: (value: T) => R,
  none: () => R
): R => {
  switch (opt.tag) {
    case 'Some': return some(opt.value);
    case 'None': return none();
    // TS 编译器不会检查穷尽性，需要人为保证
  }
};

// Rust Result 类型与 TS 模式匹配对比
// Rust:
// match result {
//     Ok(value) => process(value),
//     Err(e) => log_error(e),
// }

// TS（不穷尽，容易遗漏错误处理）：
// if (result.ok) {
//     process(result.value);
// }
// // 忘记处理 error 分支！

// 范畴论语义：
// Rust match = 余积的消去子（coproduct eliminator）
// [f, g]: A + B → C，确保两个分支都处理
// TS if/else = 不保证穷尽，可能遗漏分支

// ============================================================
// 8. 宏系统对比
// ============================================================

/**
 * Rust: 声明式宏（macro_rules!）+ 过程宏（Procedural Macros）
 * - 宏在编译期展开，操作 AST
 * - 类型安全：宏展开后仍经过类型检查
 * - 示例：derive(Debug) 自动生成调试输出
 *
 * TS: 装饰器（Decorators）+ 编译时类型操作
 * - 装饰器是运行时元数据
 * - 类型操作在编译时（类型擦除前）
 */

// TS 装饰器（运行时）：
// @Component({ selector: 'app' })
// class MyComponent {}
// → 运行时添加 metadata

// Rust derive 宏（编译时）：
// #[derive(Debug, Clone)]
// struct Point { x: i32, y: i32 }
// → 编译时生成 impl Debug for Point { ... }

// TS 编译时类型操作（近似宏）：
/**
 * 条件类型：编译时类型级编程
 */
type DeepReadonly<T> =
  T extends (infer R)[] ? ReadonlyArray<DeepReadonly<R>> :
  T extends Function ? T :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T;

// 使用示例：
interface MutableState {
  user: { name: string; age: number };
  items: string[];
}

type ImmutableState = DeepReadonly<MutableState>;
// ImmutableState = {
//   readonly user: { readonly name: string; readonly age: number };
//   readonly items: readonly string[];
// }

// 范畴论语义：
// Rust 宏 = 编译时函子：AST → AST
// TS 类型操作 = 编译时函子：Type → Type
// 两者都是"元级别"的构造，但 Rust 宏可操作语法，TS 类型操作仅操作类型

// ============================================================
// 9. 综合对比矩阵
// ============================================================

interface LanguageFeature {
  readonly feature: string;
  readonly rust: string;
  readonly typescript: string;
  readonly categoricalSemantics: string;
}

const comparisonMatrix: LanguageFeature[] = [
  {
    feature: '类型系统',
    rust: '名义类型 + 线性类型',
    typescript: '结构类型 + 子类型',
    categoricalSemantics: 'Rust = 严格 CCC + 线性逻辑；TS = 松弛 CCC + F-子类型'
  },
  {
    feature: '错误处理',
    rust: 'Result<T, E> (Either Monad)',
    typescript: 'try/catch + Promise (Continuation Monad)',
    categoricalSemantics: 'Either = 余积 T + E；Continuation = 指数对象 R^R'
  },
  {
    feature: '内存管理',
    rust: '所有权 + 借用检查',
    typescript: '垃圾回收',
    categoricalSemantics: 'Rust = 线性逻辑资源管理；TS = 隐式 comonad'
  },
  {
    feature: '并发',
    rust: 'async/await + Send/Sync',
    typescript: 'Event Loop + Promise',
    categoricalSemantics: 'Rust = 效应系统；TS = Actor 范畴'
  },
  {
    feature: '泛型',
    rust: 'Trait + 单态化',
    typescript: '结构子类型 + 擦除',
    categoricalSemantics: 'Rust = 参数多态；TS = F-子类型多态'
  },
  {
    feature: '模式匹配',
    rust: '穷尽式 match',
    typescript: '非穷尽 switch/if',
    categoricalSemantics: 'Rust = 余积消去子；TS = 部分消去子'
  },
  {
    feature: '宏系统',
    rust: 'AST 宏（编译时）',
    typescript: '装饰器 + 类型操作',
    categoricalSemantics: 'Rust = 编译时内函子；TS = 类型级内函子'
  },
  {
    feature: '生命周期',
    rust: "仿射类型 'a",
    typescript: '无（GC 管理）',
    categoricalSemantics: 'Rust = 仿射逻辑；TS = 非线性逻辑'
  }
];
