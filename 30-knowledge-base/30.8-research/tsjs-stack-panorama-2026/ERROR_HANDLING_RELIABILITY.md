---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 错误处理与系统可靠性：形式化方法与实践

> **关键词**: 异常处理、Result/Option 类型、错误边界、重试策略、断路器、超时取消、结构化日志、混沌工程、容错设计、系统可靠性度量

---

## 目录

- [错误处理与系统可靠性：形式化方法与实践](#错误处理与系统可靠性形式化方法与实践)
  - [目录](#目录)
  - [1. 异常处理的形式化](#1-异常处理的形式化)
    - [1.1 形式化定义](#11-形式化定义)
      - [1.1.1 异常作为计算效果](#111-异常作为计算效果)
      - [1.1.2 Try/Catch/Throw 的代数语义](#112-trycatchthrow-的代数语义)
    - [1.2 代码示例](#12-代码示例)
    - [1.3 最佳实践](#13-最佳实践)
    - [1.4 工具推荐](#14-工具推荐)
  - [2. Result/Option 类型的代数理论](#2-resultoption-类型的代数理论)
    - [2.1 形式化定义](#21-形式化定义)
      - [2.1.1 Result 类型的代数结构](#211-result-类型的代数结构)
      - [2.1.2 Option 类型的代数结构](#212-option-类型的代数结构)
      - [2.1.3 单子（Monad）结构](#213-单子monad结构)
    - [2.2 代码示例](#22-代码示例)
    - [2.3 最佳实践](#23-最佳实践)
    - [2.4 工具推荐](#24-工具推荐)
  - [3. 错误边界的理论基础](#3-错误边界的理论基础)
    - [3.1 形式化定义](#31-形式化定义)
      - [3.1.1 错误边界作为拓扑隔离](#311-错误边界作为拓扑隔离)
      - [3.1.2 恢复语义的形式化](#312-恢复语义的形式化)
    - [3.2 代码示例](#32-代码示例)
    - [3.3 最佳实践](#33-最佳实践)
    - [3.4 工具推荐](#34-工具推荐)
  - [4. 重试策略的形式化](#4-重试策略的形式化)
    - [4.1 形式化定义](#41-形式化定义)
      - [4.1.1 指数退避的形式化](#411-指数退避的形式化)
      - [4.1.2 断路器的状态机模型](#412-断路器的状态机模型)
    - [4.2 代码示例](#42-代码示例)
    - [4.3 最佳实践](#43-最佳实践)
    - [4.4 工具推荐](#44-工具推荐)
  - [5. 超时和取消的形式化](#5-超时和取消的形式化)
    - [5.1 形式化定义](#51-形式化定义)
      - [5.1.1 超时作为时间约束](#511-超时作为时间约束)
      - [5.1.2 取消的形式化模型](#512-取消的形式化模型)
    - [5.2 代码示例](#52-代码示例)
    - [5.3 最佳实践](#53-最佳实践)
    - [5.4 工具推荐](#54-工具推荐)
  - [6. 日志记录的形式化模型](#6-日志记录的形式化模型)
    - [6.1 形式化定义](#61-形式化定义)
      - [6.1.1 日志作为事件流](#611-日志作为事件流)
      - [6.1.2 日志级别偏序](#612-日志级别偏序)
    - [6.2 代码示例](#62-代码示例)
    - [6.3 最佳实践](#63-最佳实践)
    - [6.4 工具推荐](#64-工具推荐)
  - [7. 监控和告警的形式化](#7-监控和告警的形式化)
    - [7.1 形式化定义](#71-形式化定义)
      - [7.1.1 监控指标的形式化](#711-监控指标的形式化)
      - [7.1.2 告警规则的形式化](#712-告警规则的形式化)
    - [7.2 代码示例](#72-代码示例)
    - [7.3 最佳实践](#73-最佳实践)
    - [7.4 工具推荐](#74-工具推荐)
  - [8. 混沌工程的理论基础](#8-混沌工程的理论基础)
    - [8.1 形式化定义](#81-形式化定义)
      - [8.1.1 系统韧性定义](#811-系统韧性定义)
      - [8.1.2 稳态假设](#812-稳态假设)
    - [8.2 代码示例](#82-代码示例)
    - [8.3 最佳实践](#83-最佳实践)
    - [8.4 工具推荐](#84-工具推荐)
  - [9. 容错设计模式](#9-容错设计模式)
    - [9.1 形式化定义](#91-形式化定义)
      - [9.1.1 容错的形式化定义](#911-容错的形式化定义)
      - [9.1.2 降级（Graceful Degradation）](#912-降级graceful-degradation)
      - [9.1.3 隔离（Bulkhead）](#913-隔离bulkhead)
    - [9.2 代码示例](#92-代码示例)
    - [9.3 最佳实践](#93-最佳实践)
    - [9.4 工具推荐](#94-工具推荐)
  - [10. 系统可靠性的数学度量](#10-系统可靠性的数学度量)
    - [10.1 形式化定义](#101-形式化定义)
      - [10.1.1 可靠性函数](#1011-可靠性函数)
      - [10.1.2  bathtub 曲线](#1012--bathtub-曲线)
      - [10.1.3 关键可靠性指标](#1013-关键可靠性指标)
      - [10.1.4 串联和并联系统的可靠性](#1014-串联和并联系统的可靠性)
    - [10.2 代码示例](#102-代码示例)
    - [10.3 最佳实践](#103-最佳实践)
    - [10.4 关键术语](#104-关键术语)
  - [总结](#总结)

---

## 1. 异常处理的形式化

### 1.1 形式化定义

#### 1.1.1 异常作为计算效果

异常处理可以形式化为**计算效果（Computational Effect）**，其核心是一个单子（Monad）结构。

设程序状态空间为 $S$，值域为 $V$，异常域为 $E$，则计算可以表示为：

$$
\text{Comp}(S, V, E) = S \rightarrow (V \times S) \cup (E \times S)
$$

**异常传播规则：**

$$
\frac{\Gamma \vdash e_1 : \text{Comp}(S, V_1, E) \quad \Gamma, x:V_1 \vdash e_2 : \text{Comp}(S, V_2, E)}{\Gamma \vdash \text{try } e_1 \text{ catch } x \Rightarrow e_2 : \text{Comp}(S, V_2, E)}
$$

#### 1.1.2 Try/Catch/Throw 的代数语义

```
throw(e)  ≡ λs. (e, s)                    // 抛出异常，状态不变
try m catch h ≡ λs. case m(s) of
                    (v, s') → (v, s')     // 正常返回
                    (e, s') → h(e)(s')    // 异常处理
```

**单子律（Monad Laws）：**

$$
\begin{aligned}
\text{try } (\text{return } x) \text{ catch } h &= \text{return } x \\
\text{try } m \text{ catch } (\lambda e. \text{throw}(e)) &= m \\
\text{try } (\text{try } m \text{ catch } h_1) \text{ catch } h_2 &= \text{try } m \text{ catch } (\lambda e. \text{try } (h_1(e)) \text{ catch } h_2)
\end{aligned}
$$

### 1.2 代码示例

```typescript
// ============================================
// 形式化异常处理体系
// ============================================

/**
 * 类型安全的错误基类
 * 符合代数数据类型（ADT）规范
 */
abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly isRetryable: boolean;
  readonly timestamp: Date;
  readonly context: Record<string, unknown>;

  constructor(
    message: string,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 序列化为结构化日志格式
   */
  toJSON(): Record<string, unknown> {
    return {
      errorType: this.name,
      code: this.code,
      message: this.message,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * 具体错误类型实现
 */
class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly isRetryable = false;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, { fieldErrors });
    this.fieldErrors = fieldErrors;
  }
}

class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';
  readonly isRetryable = true;
  readonly statusCode?: number;

  constructor(
    message: string,
    statusCode?: number,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, statusCode });
    this.statusCode = statusCode;
  }
}

class TimeoutError extends DomainError {
  readonly code = 'TIMEOUT_ERROR';
  readonly isRetryable = true;
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`, { timeoutMs });
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 异常处理的单子实现
 *
 * 类型签名: Either<E, A> = Left<E> | Right<A>
 *
 * Functor 律:
 *   - map(id) === id
 *   - map(f ∘ g) === map(f) ∘ map(g)
 */
type Either<E, A> =
  | { readonly _tag: 'Left'; readonly left: E }
  | { readonly _tag: 'Right'; readonly right: A };

const Either = {
  left: <E, A = never>(e: E): Either<E, A> => ({ _tag: 'Left', left: e }),
  right: <A, E = never>(a: A): Either<E, A> => ({ _tag: 'Right', right: a }),

  isLeft: <E, A>(e: Either<E, A>): e is { _tag: 'Left'; left: E } =>
    e._tag === 'Left',

  isRight: <E, A>(e: Either<E, A>): e is { _tag: 'Right'; right: A } =>
    e._tag === 'Right',

  // Functor: fmap
  map: <E, A, B>(fa: Either<E, A>, f: (a: A) => B): Either<E, B> =>
    Either.isRight(fa) ? Either.right(f(fa.right)) : fa,

  // Monad: bind (>>=)
  flatMap: <E, A, B>(fa: Either<E, A>, f: (a: A) => Either<E, B>): Either<E, B> =>
    Either.isRight(fa) ? f(fa.right) : fa,

  // Applicative: pure
  of: <A>(a: A): Either<never, A> => Either.right(a),

  // 错误恢复
  catch: <E, A>(fa: Either<E, A>, handler: (e: E) => Either<E, A>): Either<E, A> =>
    Either.isLeft(fa) ? handler(fa.left) : fa
};

/**
 * 安全的异常包装器
 *
 * 符合以下类型签名:
 * safe<T>(f: () => T): Either<Error, T>
 */
function safe<T>(fn: () => T): Either<Error, T> {
  try {
    return Either.right(fn());
  } catch (error) {
    return Either.left(error instanceof Error ? error : new Error(String(error)));
  }
}

async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<Either<Error, T>> {
  try {
    return Either.right(await fn());
  } catch (error) {
    return Either.left(error instanceof Error ? error : new Error(String(error)));
  }
}
```

### 1.3 最佳实践

| 实践原则 | 说明 | 反模式 |
|---------|------|--------|
| **类型化错误** | 使用具体错误类型而非原始 Error | `throw new Error('...')` |
| **错误分类** | 区分可重试/不可重试错误 | 所有错误同等处理 |
| **上下文保留** | 错误携带足够上下文信息 | 仅有错误消息字符串 |
| **错误边界** | 在系统边界捕获并转换 | 内部错误直接暴露 |
| **结构化日志** | 支持 JSON 序列化 | 格式不统一的日志 |

### 1.4 工具推荐

- **[neverthrow](https://github.com/supermacro/neverthrow)** - TypeScript 的 Result 类型实现
- **[ts-results](https://github.com/vultix/ts-results)** - Rust 风格 Result/Option
- **[true-myth](https://github.com/true-myth/true-myth)** - 函数式错误处理

---

## 2. Result/Option 类型的代数理论

### 2.1 形式化定义

#### 2.1.1 Result 类型的代数结构

Result 类型是**和类型（Sum Type）**，表示计算可能成功或失败：

$$
\text{Result}(E, T) = \text{Ok}(T) + \text{Err}(E)
$$

**代数表示：**

$$
|Result(E, T)| = 1 + |T| + |E|
$$

#### 2.1.2 Option 类型的代数结构

Option 类型表示值可能存在或不存在：

$$
\text{Option}(T) = \text{Some}(T) + \text{None}
$$

**代数表示：**

$$
|Option(T)| = 1 + |T|
$$

#### 2.1.3 单子（Monad）结构

Result 构成一个**错误单子（Error Monad）**：

**单位元（Unit）：**

$$
\eta : T \rightarrow \text{Result}(E, T) \\
\eta(x) = \text{Ok}(x)
$$

**绑定（Bind）：**

$$
\mu : \text{Result}(E, \text{Result}(E, T)) \rightarrow \text{Result}(E, T)
$$

**单子律：**

$$
\begin{aligned}
\text{return} \gg= f &= f \quad &\text{(左单位元)} \\
m \gg= \text{return} &= m \quad &\text{(右单位元)} \\
(m \gg= f) \gg= g &= m \gg= (\lambda x. f(x) \gg= g) \quad &\text{(结合律)}
\end{aligned}
$$

### 2.2 代码示例

```typescript
// ============================================
// Option 类型的完整实现
// ============================================

interface None { readonly _tag: 'None'; }
interface Some<A> { readonly _tag: 'Some'; readonly value: A; }
type Option<A> = None | Some<A>;

const Option = {
  some: <A>(value: A): Option<A> => ({ _tag: 'Some', value }),
  none: <A = never>(): Option<A> => ({ _tag: 'None' }),

  isSome: <A>(ma: Option<A>): ma is Some<A> => ma._tag === 'Some',
  isNone: <A>(ma: Option<A>): ma is None => ma._tag === 'None',

  // Functor: fmap
  map: <A, B>(ma: Option<A>, f: (a: A) => B): Option<B> =>
    Option.isSome(ma) ? Option.some(f(ma.value)) : ma,

  // Monad: bind
  flatMap: <A, B>(ma: Option<A>, f: (a: A) => Option<B>): Option<B> =>
    Option.isSome(ma) ? f(ma.value) : ma,

  // 折叠操作
  fold: <A, B>(ma: Option<A>, onNone: () => B, onSome: (a: A) => B): B =>
    Option.isSome(ma) ? onSome(ma.value) : onNone(),

  // 从可空值创建
  fromNullable: <A>(a: A | null | undefined): Option<A> =>
    a == null ? Option.none() : Option.some(a),
};

// ============================================
// Result 类型的完整实现
// ============================================

interface Ok<A> { readonly _tag: 'Ok'; readonly value: A; }
interface Err<E> { readonly _tag: 'Err'; readonly error: E; }
type Result<E, A> = Ok<A> | Err<E>;

const Result = {
  ok: <A, E = never>(value: A): Result<E, A> => ({ _tag: 'Ok', value }),
  err: <E, A = never>(error: E): Result<E, A> => ({ _tag: 'Err', error }),

  isOk: <E, A>(ma: Result<E, A>): ma is Ok<A> => ma._tag === 'Ok',
  isErr: <E, A>(ma: Result<E, A>): ma is Err<E> => ma._tag === 'Err',

  // Functor
  map: <E, A, B>(ma: Result<E, A>, f: (a: A) => B): Result<E, B> =>
    Result.isOk(ma) ? Result.ok(f(ma.value)) : ma,

  // Monad
  flatMap: <E, A, B>(ma: Result<E, A>, f: (a: A) => Result<E, B>): Result<E, B> =>
    Result.isOk(ma) ? f(ma.value) : ma,

  // 错误恢复
  orElse: <E, A>(ma: Result<E, A>, f: (e: E) => Result<E, A>): Result<E, A> =>
    Result.isErr(ma) ? f(ma.error) : ma,

  // 折叠
  fold: <E, A, B>(ma: Result<E, A>, onErr: (e: E) => B, onOk: (a: A) => B): B =>
    Result.isOk(ma) ? onOk(ma.value) : onErr(ma.error),

  // 从可能抛出异常的函数创建
  tryCatch: <E, A>(f: () => A, onError: (error: unknown) => E): Result<E, A> => {
    try {
      return Result.ok(f());
    } catch (error) {
      return Result.err(onError(error));
    }
  },
};
```

### 2.3 最佳实践

| 原则 | 实践 | 避免 |
|-----|------|-----|
| **优先使用 Result** | 在纯函数中使用 Result 类型 | 滥用 try/catch |
| **组合优于嵌套** | 使用 flatMap/ap 组合操作 | 深层嵌套 if/else |
| **类型安全** | 让错误类型携带足够信息 | 使用 any/unknown |
| **提前返回** | 使用 guards 提前处理错误 | 深层嵌套代码块 |

### 2.4 工具推荐

- **[fp-ts](https://github.com/gcanti/fp-ts)** - 完整的函数式编程库
- **[effect](https://github.com/Effect-TS/effect)** - 现代函数式效果系统
- **[purify](https://github.com/gigobyte/purify)** - 函数式工具库

---

## 3. 错误边界的理论基础

### 3.1 形式化定义

#### 3.1.1 错误边界作为拓扑隔离

错误边界实现了一种**故障隔离（Fault Containment）**机制：

$$
\text{ErrorBoundary} : \mathcal{P}(\text{Component}) \rightarrow \mathcal{P}(\text{Component})
$$

设组件树为 $T$，错误边界为 $B \subset T$，则：

$$
\forall c \in B, \text{error}(c) \Rightarrow \neg \text{propagate}(c, T \setminus B)
$$

#### 3.1.2 恢复语义的形式化

**错误恢复作为状态转换：**

$$
(S, E) \xrightarrow{\text{reset}} (S_0, \emptyset)
$$

其中 $S$ 是组件状态，$E$ 是错误状态，$S_0$ 是初始状态。

### 3.2 代码示例

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
  readonly retryCount: number;
}

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly onReset?: () => void;
  readonly maxRetries?: number;
}

/**
 * 形式化错误边界组件
 */
class FormalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // 自动重试逻辑
    if (this.state.retryCount < (this.props.maxRetries ?? 0)) {
      setTimeout(() => {
        this.setState(prev => ({
          retryCount: prev.retryCount + 1,
          hasError: false,
          error: null,
          errorInfo: null
        }));
      }, Math.pow(2, this.state.retryCount) * 1000);
    }
  }

  private handleReset = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: 20, border: '2px solid red' }}>
          <h2>组件渲染错误</h2>
          <details>
            <summary>错误详情</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button onClick={this.handleReset}>重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <FormalErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </FormalErrorBoundary>
    );
  };
}
```

### 3.3 最佳实践

| 策略 | 实现方式 | 适用场景 |
|-----|---------|---------|
| **层级边界** | 路由级别错误边界 | 页面级错误隔离 |
| **组件边界** | 复杂组件包裹 | 第三方组件保护 |
| **功能边界** | 核心功能模块 | 支付、表单等 |
| **全局边界** | 最外层包裹 | 兜底保护 |

### 3.4 工具推荐

- **[react-error-boundary](https://github.com/bvaughn/react-error-boundary)** - 社区标准实现
- **[@sentry/react](https://docs.sentry.io/platforms/javascript/guides/react/)** - 集成错误报告

---

## 4. 重试策略的形式化

### 4.1 形式化定义

#### 4.1.1 指数退避的形式化

**退避延迟计算：**

$$
delay(n) = \min(base \cdot r^n, maxDelay)
$$

**带抖动的退避：**

$$
delay_{jitter}(n) = delay(n) \cdot (1 + \alpha \cdot \text{rand}(-1, 1))
$$

#### 4.1.2 断路器的状态机模型

**状态：** $Q = \{\text{CLOSED}, \text{OPEN}, \text{HALF_OPEN}\}$

**转移函数：**

$$
\delta(q, \sigma) = \begin{cases}
\text{OPEN} & \text{if } q = \text{CLOSED} \land \text{failureRate} > \theta \\
\text{HALF_OPEN} & \text{if } q = \text{OPEN} \land \text{timeout} \\
\text{CLOSED} & \text{if } q = \text{HALF_OPEN} \land \text{success} \\
\text{OPEN} & \text{if } q = \text{HALF_OPEN} \land \text{failure}
\end{cases}
$$

### 4.2 代码示例

```typescript
// ============================================
// 重试策略与断路器的形式化实现
// ============================================

interface RetryPolicy {
  readonly maxAttempts: number;
  readonly baseDelay: number;
  readonly maxDelay: number;
  readonly backoffFactor: number;
  readonly jitter: boolean;
}

const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true
};

/**
 * 计算退避延迟（指数退避 + 抖动）
 */
function calculateBackoffDelay(attempt: number, policy: RetryPolicy): number {
  const exponentialDelay = policy.baseDelay * Math.pow(policy.backoffFactor, attempt);
  const cappedDelay = Math.min(exponentialDelay, policy.maxDelay);

  if (policy.jitter) {
    const jitterAmount = cappedDelay * 0.1;
    const jitterOffset = (Math.random() * 2 - 1) * jitterAmount;
    return Math.max(0, cappedDelay + jitterOffset);
  }

  return cappedDelay;
}

/**
 * 形式化重试执行器
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  policy: Partial<RetryPolicy> = {}
): Promise<T> {
  const fullPolicy = { ...defaultRetryPolicy, ...policy };

  for (let attempt = 0; attempt < fullPolicy.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === fullPolicy.maxAttempts - 1) throw error;

      const delay = calculateBackoffDelay(attempt, fullPolicy);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unexpected end of retry loop');
}

// ============================================
// 断路器实现
// ============================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly timeout: number;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;

  constructor(private readonly config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.checkTimeout();

    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private checkTimeout(): void {
    if (this.state === 'OPEN' && this.lastFailureTime) {
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        this.state = 'HALF_OPEN';
        this.successes = 0;
      }
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN' || this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 4.3 最佳实践

| 策略 | 适用场景 | 配置建议 |
|-----|---------|---------|
| **固定间隔** | 短时临时故障 | `backoffFactor = 1` |
| **线性退避** | 资源限制型服务 | `backoffFactor = 1.5` |
| **指数退避** | 网络不稳定服务 | `backoffFactor = 2` |
| **断路器** | 下游服务故障 | `failureThreshold = 5` |

### 4.4 工具推荐

- **[cockatiel](https://github.com/connor4312/cockatiel)** - TypeScript 弹性模式库
- **[opossum](https://github.com/nodeshift/opossum)** - Node.js 断路器

---

## 5. 超时和取消的形式化

### 5.1 形式化定义

#### 5.1.1 超时作为时间约束

$$
\text{Timeout}(T, d) = \{ t \in T \mid \text{time}(t) \leq d \} \cup \{ \bot \}
$$

#### 5.1.2 取消的形式化模型

$$
\text{race}(f_1, f_2) = \begin{cases}
f_1 & \text{if } f_1 \text{ completes first} \\
f_2 & \text{if } f_2 \text{ completes first}
\end{cases}
$$

### 5.2 代码示例

```typescript
// ============================================
// 超时与取消的形式化实现
// ============================================

class TimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

class CancellationError extends Error {
  constructor(public readonly reason?: unknown) {
    super('Operation was cancelled');
    this.name = 'CancellationError';
  }
}

/**
 * 为 Promise 添加超时
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CancellationError(signal.reason));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new TimeoutError(timeoutMs));
    }, timeoutMs);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new CancellationError(signal?.reason));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    promise.then(
      value => {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onAbort);
        resolve(value);
      },
      error => {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onAbort);
        reject(error);
      }
    );
  });
}

/**
 * 可取消的延迟
 */
function cancellableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CancellationError());
      return;
    }

    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new CancellationError(signal.reason));
    }, { once: true });
  });
}

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 5000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 5.3 最佳实践

| 场景 | 推荐做法 | 注意事项 |
|-----|---------|---------|
| **HTTP 请求** | 使用 AbortController | 及时清理资源 |
| **长时间计算** | 定期检查取消状态 | 避免频繁检查 |
| **并发操作** | 传播取消信号 | 避免内存泄漏 |

### 5.4 工具推荐

- **[p-cancelable](https://github.com/sindresorhus/p-cancelable)** - 可取消 Promise
- **[abort-controller](https://github.com/mysticatea/abort-controller)** - 兼容实现

---

## 6. 日志记录的形式化模型

### 6.1 形式化定义

#### 6.1.1 日志作为事件流

$$
\mathcal{L} : \mathbb{T} \rightarrow \mathcal{P}(\mathcal{E})
$$

其中 $\mathcal{E} = (t, l, m, c, md)$ 包含时间戳、级别、消息、上下文和元数据。

#### 6.1.2 日志级别偏序

$$
DEBUG \prec INFO \prec WARN \prec ERROR \prec FATAL
$$

### 6.2 代码示例

```typescript
// ============================================
// 结构化日志的形式化实现
// ============================================

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

interface LogEvent {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: Record<string, unknown>;
  readonly metadata: {
    readonly file: string;
    readonly line: number;
    readonly function: string;
  };
}

interface LogHandler {
  handle(event: LogEvent): void;
}

class StructuredLogger {
  private handlers: LogHandler[] = [];
  private context: Record<string, unknown> = {};
  private minLevel: LogLevel = 'INFO';

  constructor(
    private readonly name: string,
    options: { minLevel?: LogLevel; context?: Record<string, unknown> } = {}
  ) {
    this.minLevel = options.minLevel ?? 'INFO';
    this.context = options.context ?? {};
  }

  addHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  child(context: Record<string, unknown>): StructuredLogger {
    const child = new StructuredLogger(this.name, {
      minLevel: this.minLevel,
      context: { ...this.context, ...context }
    });
    child.handlers = this.handlers;
    return child;
  }

  private log(level: LogLevel, message: string, extraContext?: Record<string, unknown>): void {
    const priorities = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };
    if (priorities[level] < priorities[this.minLevel]) return;

    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...extraContext },
      metadata: this.extractCallerInfo()
    };

    this.handlers.forEach(h => {
      try { h.handle(event); } catch (e) { console.error('Handler failed:', e); }
    });
  }

  private extractCallerInfo(): LogEvent['metadata'] {
    const stack = new Error().stack;
    const lines = stack?.split('\n') ?? [];
    const callerLine = lines[4] || lines[3];

    const match = callerLine?.match(/at (.+) \((.+):(\d+):(\d+)\)/);
    if (match) {
      return {
        function: match[1].trim(),
        file: match[2],
        line: parseInt(match[3], 10)
      };
    }
    return { function: 'anonymous', file: 'unknown', line: 0 };
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('WARN', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('ERROR', message, {
      ...context,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined
    });
  }
}

// 控制台处理器
class ConsoleHandler implements LogHandler {
  handle(event: LogEvent): void {
    const colors: Record<LogLevel, string> = {
      DEBUG: '\x1b[36m',
      INFO: '\x1b[32m',
      WARN: '\x1b[33m',
      ERROR: '\x1b[31m',
      FATAL: '\x1b[35m'
    };

    console.log(
      `${colors[event.level]}[${event.level}]\x1b[0m ${event.timestamp} - ${event.message}`,
      JSON.stringify(event.context)
    );
  }
}
```

### 6.3 最佳实践

| 实践 | 说明 |
|-----|------|
| **结构化日志** | 使用 JSON 格式，便于解析 |
| **日志级别** | 根据环境设置适当级别 |
| **上下文传递** | 请求 ID、用户 ID 全程传递 |
| **敏感信息** | 脱敏处理密码、token |

### 6.4 工具推荐

- **[pino](https://github.com/pinojs/pino)** - 高性能结构化日志
- **[winston](https://github.com/winstonjs/winston)** - 功能丰富的日志库

---

## 7. 监控和告警的形式化

### 7.1 形式化定义

#### 7.1.1 监控指标的形式化

**指标空间：** $\mathcal{M} = (N, G, V, T)$

**指标类型：**

- 计数器：$C : T \rightarrow \mathbb{N}$（单调递增）
- 计量器：$G : T \rightarrow \mathbb{R}$（任意变化）
- 直方图：$H : T \rightarrow \mathcal{P}(\mathbb{R} \times \mathbb{N})$

#### 7.1.2 告警规则的形式化

$$
\text{Alert} : \mathcal{M}^* \rightarrow \{0, 1\}
$$

**阈值告警：** $\text{Threshold}(m, op, \theta) = op(m, \theta)$

### 7.2 代码示例

```typescript
// ============================================
// 监控和告警的形式化实现
// ============================================

type MetricType = 'counter' | 'gauge' | 'histogram';

interface MetricValue {
  readonly value: number;
  readonly timestamp: number;
  readonly labels: Record<string, string>;
}

class MetricsRegistry {
  private metrics = new Map<string, { name: string; type: MetricType; values: MetricValue[] }>();

  counter(name: string): Counter {
    return new Counter(this, name);
  }

  gauge(name: string): Gauge {
    return new Gauge(this, name);
  }

  histogram(name: string, buckets?: number[]): Histogram {
    return new Histogram(this, name, buckets);
  }
}

class Counter {
  private value = 0;
  constructor(private registry: MetricsRegistry, private name: string) {}
  inc(value: number = 1): void { this.value += value; }
  get(): number { return this.value; }
}

class Gauge {
  private value = 0;
  constructor(private registry: MetricsRegistry, private name: string) {}
  set(value: number): void { this.value = value; }
  get(): number { return this.value; }
}

class Histogram {
  private values: number[] = [];
  constructor(private registry: MetricsRegistry, private name: string, private buckets: number[] = []) {}

  observe(value: number): void {
    this.values.push(value);
  }

  percentile(p: number): number {
    if (this.values.length === 0) return 0;
    const sorted = [...this.values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// ============================================
// 告警规则引擎
// ============================================

type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';

interface AlertRule {
  readonly id: string;
  readonly name: string;
  readonly metric: string;
  readonly operator: ComparisonOperator;
  readonly threshold: number;
  readonly duration: number;
  readonly severity: 'warning' | 'critical' | 'fatal';
}

class AlertManager {
  private rules = new Map<string, AlertRule>();
  private states = new Map<string, { state: 'ok' | 'pending' | 'firing'; startedAt?: number }>();

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  evaluate(ruleId: string, value: number): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    const conditionMet = this.evaluateCondition(value, rule.operator, rule.threshold);
    const currentState = this.states.get(ruleId);
    const now = Date.now();

    if (!currentState) {
      this.states.set(ruleId, {
        state: conditionMet ? 'pending' : 'ok',
        startedAt: conditionMet ? now : undefined
      });
    } else if (currentState.state === 'ok' && conditionMet) {
      this.states.set(ruleId, { state: 'pending', startedAt: now });
    } else if (currentState.state === 'pending' && conditionMet) {
      if (now - (currentState.startedAt ?? now) >= rule.duration) {
        this.states.set(ruleId, { state: 'firing', startedAt: currentState.startedAt });
        this.notify(rule, 'firing');
      }
    } else if ((currentState.state === 'pending' || currentState.state === 'firing') && !conditionMet) {
      this.states.set(ruleId, { state: 'ok' });
      if (currentState.state === 'firing') this.notify(rule, 'resolved');
    }
  }

  private evaluateCondition(value: number, op: ComparisonOperator, threshold: number): boolean {
    switch (op) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      case 'neq': return value !== threshold;
    }
  }

  private notify(rule: AlertRule, state: string): void {
    console.log(`[ALERT:${rule.severity.toUpperCase()}] ${rule.name} is ${state}`);
  }
}
```

### 7.3 最佳实践

| 类型 | RED 方法 | USE 方法 |
|-----|---------|---------|
| **请求** | Rate, Errors, Duration | - |
| **资源** | - | Utilization, Saturation, Errors |

### 7.4 工具推荐

- **[Sentry](https://sentry.io/)** - 错误监控和性能追踪
- **[Datadog](https://www.datadoghq.com/)** - 全栈监控平台
- **[Prometheus](https://prometheus.io/)** + **[Grafana](https://grafana.com/)**

---

## 8. 混沌工程的理论基础

### 8.1 形式化定义

#### 8.1.1 系统韧性定义

$$
\text{Resilience}(S) = \mathbb{P}(S \text{ maintains } \Phi \mid F)
$$

其中 $S$ 是系统，$\Phi$ 是期望属性，$F$ 是故障场景集合。

#### 8.1.2 稳态假设

$$
\text{SteadyState}(S) = \{ m \mid \mu - 3\sigma \leq m \leq \mu + 3\sigma \}
$$

### 8.2 代码示例

```typescript
// ============================================
// 混沌工程的形式化实现
// ============================================

type FaultType = 'latency' | 'error' | 'crash' | 'cpu' | 'memory' | 'kill';

interface FaultConfig {
  readonly type: FaultType;
  readonly target: string;
  readonly probability: number;
  readonly duration: number;
  readonly magnitude: number;
}

interface SteadyStateHypothesis {
  readonly name: string;
  readonly probes: Array<{
    readonly name: string;
    readonly metric: string;
    readonly expected: { min: number; max: number };
  }>;
}

interface ChaosExperiment {
  readonly id: string;
  readonly title: string;
  readonly steadyState: SteadyStateHypothesis;
  readonly method: Array<{ type: 'action'; name: string; config: FaultConfig }>;
}

class ChaosEngine {
  private experiments = new Map<string, ChaosExperiment>();
  private activeFaults = new Set<string>();

  registerExperiment(experiment: ChaosExperiment): void {
    this.experiments.set(experiment.id, experiment);
  }

  async runExperiment(experimentId: string): Promise<{ success: boolean; measurements: any[] }> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);

    console.log(`[Chaos] Starting: ${experiment.title}`);

    // 1. 验证实验前稳态
    const before = await this.checkSteadyState(experiment.steadyState);
    if (!before.success) throw new Error('Steady state not met before experiment');

    // 2. 注入故障
    for (const method of experiment.method) {
      if (method.type === 'action') {
        await this.injectFault(method.config);
      }
    }

    // 3. 等待
    await new Promise(r => setTimeout(r, 5000));

    // 4. 验证实验后稳态
    const after = await this.checkSteadyState(experiment.steadyState);

    // 5. 清理
    this.activeFaults.clear();

    return {
      success: after.success,
      measurements: after.measurements
    };
  }

  private async checkSteadyState(hypothesis: SteadyStateHypothesis) {
    const measurements = hypothesis.probes.map(probe => ({
      probe: probe.name,
      value: Math.random() * 100, // 模拟测量
      withinBounds: true // 模拟结果
    }));

    return {
      success: measurements.every(m => m.withinBounds),
      measurements
    };
  }

  private async injectFault(config: FaultConfig): Promise<void> {
    const faultId = `${config.type}-${Date.now()}`;
    this.activeFaults.add(faultId);
    console.log(`[Chaos] Injecting ${config.type} into ${config.target}`);
  }
}

// 使用示例
const chaosEngine = new ChaosEngine();

chaosEngine.registerExperiment({
  id: 'api-latency-test',
  title: 'API Latency Test',
  steadyState: {
    name: 'api-healthy',
    probes: [
      { name: 'response-time', metric: 'duration', expected: { min: 0, max: 1000 } }
    ]
  },
  method: [
    {
      type: 'action',
      name: 'inject-latency',
      config: { type: 'latency', target: 'api', probability: 1, duration: 60000, magnitude: 0.5 }
    }
  ]
});
```

### 8.3 最佳实践

| 原则 | 说明 |
|-----|------|
| **最小爆炸半径** | 控制故障影响范围 |
| **生产环境优先** | 在真实环境中验证 |
| **自动化回滚** | 快速恢复机制 |
| **假设驱动** | 明确实验假设和结果 |

### 8.4 工具推荐

- **[Chaos Monkey](https://github.com/Netflix/chaosmonkey)** - Netflix 混沌测试工具
- **[Chaos Mesh](https://chaos-mesh.org/)** - Kubernetes 混沌工程
- **[Gremlin](https://www.gremlin.com/)** - 企业级混沌工程平台

---

## 9. 容错设计模式

### 9.1 形式化定义

#### 9.1.1 容错的形式化定义

$$
\text{FaultTolerant}(S) = \forall f \in F_{detectable}: \exists r \in R: r(f) \neq \bot
$$

#### 9.1.2 降级（Graceful Degradation）

$$
\text{Degrade}(S, C) = S' \subseteq S \text{ where } \text{critical}(S') \land \neg C(S')
$$

#### 9.1.3 隔离（Bulkhead）

$$
\text{Bulkhead}(R, C, L) = \bigcup_{i=1}^{n} C_i \text{ where } \forall i \neq j: C_i \cap C_j = \emptyset
$$

### 9.2 代码示例

```typescript
// ============================================
// 容错设计模式的形式化实现
// ============================================

type FeatureLevel = 'critical' | 'important' | 'nice';

interface Feature<T> {
  readonly name: string;
  readonly level: FeatureLevel;
  readonly execute: () => Promise<T>;
  readonly fallback?: () => T;
}

// ============================================
// 1. 降级模式
// ============================================

class DegradationManager {
  private disabledFeatures = new Set<string>();
  private currentLevel: FeatureLevel = 'nice';

  constructor(private features: Feature<unknown>[]) {}

  async checkAndDegrade(cpu: number, memory: number): Promise<void> {
    const max = Math.max(cpu, memory);

    if (max > 90) {
      this.degradeTo('critical');
    } else if (max > 70) {
      this.degradeTo('important');
    }
  }

  private degradeTo(target: FeatureLevel): void {
    this.currentLevel = target;

    for (const feature of this.features) {
      const priorities = { nice: 0, important: 1, critical: 2 };
      if (priorities[feature.level] < priorities[target]) {
        this.disabledFeatures.add(feature.name);
      }
    }
  }

  async execute<T>(name: string): Promise<T> {
    const feature = this.features.find(f => f.name === name);
    if (!feature) throw new Error(`Feature ${name} not found`);

    if (this.disabledFeatures.has(name)) {
      if (feature.fallback) return feature.fallback() as T;
      throw new Error(`Feature ${name} disabled`);
    }

    return await feature.execute() as T;
  }
}

// ============================================
// 2. 舱壁模式（Bulkhead）
// ============================================

interface BulkheadConfig {
  readonly name: string;
  readonly maxConcurrent: number;
  readonly maxQueue: number;
}

class Bulkhead {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private config: BulkheadConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.config.maxConcurrent) {
      if (this.queue.length >= this.config.maxQueue) {
        throw new Error('Bulkhead queue full');
      }

      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      next?.();
    }
  }
}

// ============================================
// 3. 舱壁隔离分区
// ============================================

class BulkheadPartition {
  private partitions = new Map<string, Bulkhead>();

  constructor(configs: Array<{ name: string; maxConcurrent: number }>) {
    for (const config of configs) {
      this.partitions.set(config.name, new Bulkhead({
        ...config,
        maxQueue: config.maxConcurrent * 2
      }));
    }
  }

  async executeInPartition<T>(partition: string, fn: () => Promise<T>): Promise<T> {
    const bulkhead = this.partitions.get(partition);
    if (!bulkhead) {
      throw new Error(`Partition ${partition} not found`);
    }
    return bulkhead.execute(fn);
  }
}

// 使用示例
const bulkheadPartition = new BulkheadPartition([
  { name: 'user-service', maxConcurrent: 10 },
  { name: 'order-service', maxConcurrent: 5 },
  { name: 'payment-service', maxConcurrent: 3 }
]);

// 不同服务使用独立的资源池
bulkheadPartition.executeInPartition('user-service', async () => {
  // 用户服务操作
});
```

### 9.3 最佳实践

| 模式 | 适用场景 | 关键指标 |
|-----|---------|---------|
| **降级** | 资源紧张时 | 保留核心功能 |
| **熔断** | 下游故障 | 失败率阈值 |
| **隔离** | 资源竞争 | 并发限制 |

### 9.4 工具推荐

- **[Resilience4j](https://resilience4j.readme.io/)** - 容错模式库（Java，概念可借鉴）
- **[Polly](https://github.com/App-vNext/Polly)** - .NET 弹性策略库

---

## 10. 系统可靠性的数学度量

### 10.1 形式化定义

#### 10.1.1 可靠性函数

**可靠性函数（Reliability Function）：**

$$
R(t) = \mathbb{P}(T > t) = 1 - F(t)
$$

其中 $T$ 是故障时间随机变量，$F(t)$ 是累积分布函数。

**失效率（Failure Rate）：**

$$
\lambda(t) = \frac{f(t)}{R(t)} = -\frac{d}{dt} \ln R(t)
$$

#### 10.1.2  bathtub 曲线

$$
\lambda(t) = \begin{cases}
\text{decreasing} & t < t_1 \quad \text{(早期故障)} \\
\text{constant} & t_1 \leq t \leq t_2 \quad \text{(随机故障)} \\
\text{increasing} & t > t_2 \quad \text{(磨损故障)}
\end{cases}
$$

#### 10.1.3 关键可靠性指标

**MTBF（平均故障间隔时间）：**

$$
MTBF = \mathbb{E}[T] = \int_0^{\infty} R(t) dt
$$

对于恒定失效率 $\lambda$：

$$
MTBF = \frac{1}{\lambda}
$$

**MTTR（平均修复时间）：**

$$
MTTR = \frac{\sum_{i=1}^{n} \text{repairTime}_i}{n}
$$

**可用性（Availability）：**

$$
A = \frac{MTBF}{MTBF + MTTR} = \frac{\text{uptime}}{\text{uptime} + \text{downtime}}
$$

**不同可用性级别：**

| 可用性 | 年停机时间 | 描述 |
|-------|-----------|-----|
| 99%（两个9）| 3.65 天 | 基本可用 |
| 99.9%（三个9）| 8.76 小时 | 高可用 |
| 99.99%（四个9）| 52.56 分钟 | 极高可用 |
| 99.999%（五个9）| 5.26 分钟 | 故障容错 |
| 99.9999%（六个9）| 31.5 秒 | 高故障容错 |

#### 10.1.4 串联和并联系统的可靠性

**串联系统：**

$$
R_{series}(t) = \prod_{i=1}^{n} R_i(t)
$$

**并联系统：**

$$
R_{parallel}(t) = 1 - \prod_{i=1}^{n} (1 - R_i(t))
$$

**k-out-of-n 系统：**

$$
R_{k/n}(t) = \sum_{i=k}^{n} \binom{n}{i} R(t)^i (1-R(t))^{n-i}
$$

### 10.2 代码示例

```typescript
// ============================================
// 系统可靠性度量的计算实现
// ============================================

/**
 * 可靠性计算器
 */
class ReliabilityCalculator {
  /**
   * 计算可靠性函数 R(t) = e^(-λt) （指数分布假设）
   */
  static reliability(t: number, failureRate: number): number {
    return Math.exp(-failureRate * t);
  }

  /**
   * 计算 MTBF = 1/λ
   */
  static mtbf(failureRate: number): number {
    return 1 / failureRate;
  }

  /**
   * 计算可用性 A = MTBF / (MTBF + MTTR)
   */
  static availability(mtbf: number, mttr: number): number {
    return mtbf / (mtbf + mttr);
  }

  /**
   * 计算不可用性（宕机时间比例）
   */
  static unavailability(mtbf: number, mttr: number): number {
    return mttr / (mtbf + mttr);
  }

  /**
   * 串联系统可靠性
   */
  static seriesReliability(reliabilities: number[]): number {
    return reliabilities.reduce((acc, r) => acc * r, 1);
  }

  /**
   * 并联系统可靠性
   */
  static parallelReliability(reliabilities: number[]): number {
    const product = reliabilities.reduce((acc, r) => acc * (1 - r), 1);
    return 1 - product;
  }

  /**
   * 计算年宕机时间（毫秒）
   */
  static downtimePerYear(availabilityPercent: number): number {
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    return msPerYear * (1 - availabilityPercent / 100);
  }

  /**
   * 计算达到目标可用性所需的 MTBF
   */
  static requiredMtbf(targetAvailability: number, mttr: number): number {
    // A = MTBF / (MTBF + MTTR)
    // A * (MTBF + MTTR) = MTBF
    // A * MTBF + A * MTTR = MTBF
    // A * MTTR = MTBF - A * MTBF
    // A * MTTR = MTBF * (1 - A)
    // MTBF = A * MTTR / (1 - A)
    return (targetAvailability * mttr) / (1 - targetAvailability);
  }
}

/**
 * 可用性目标类
 */
class AvailabilityTarget {
  constructor(
    public readonly nines: number,
    public readonly name: string
  ) {}

  get percentage(): number {
    return 1 - Math.pow(10, -this.nines);
  }

  get downtimePerYear(): string {
    const ms = ReliabilityCalculator.downtimePerYear(this.percentage * 100);

    if (ms < 60000) return `${(ms / 1000).toFixed(1)} 秒`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)} 分钟`;
    if (ms < 86400000) return `${(ms / 3600000).toFixed(1)} 小时`;
    return `${(ms / 86400000).toFixed(1)} 天`;
  }

  static readonly TWO_NINES = new AvailabilityTarget(2, '基本可用');
  static readonly THREE_NINES = new AvailabilityTarget(3, '高可用');
  static readonly FOUR_NINES = new AvailabilityTarget(4, '极高可用');
  static readonly FIVE_NINES = new AvailabilityTarget(5, '故障容错');
  static readonly SIX_NINES = new AvailabilityTarget(6, '高故障容错');
}

/**
 * SLA 计算器
 */
class SLACalculator {
  /**
   * 计算复合 SLA
   */
  static compositeSLA(slas: number[]): number {
    // 串联依赖：SLA_composite = SLA_1 × SLA_2 × ... × SLA_n
    return slas.reduce((acc, sla) => acc * sla, 1);
  }

  /**
   * 计算冗余后的 SLA
   */
  static redundantSLA(sla: number, redundancy: number): number {
    // 并联冗余：SLA_redundant = 1 - (1 - SLA)^n
    return 1 - Math.pow(1 - sla, redundancy);
  }

  /**
   * 计算多区域部署的 SLA
   */
  static multiRegionSLA(singleRegionSLA: number, regions: number): number {
    // 假设区域故障独立
    return this.redundantSLA(singleRegionSLA, regions);
  }
}

// ============================================
// 可靠性监控器
// ============================================

interface FailureEvent {
  readonly timestamp: number;
  readonly component: string;
  readonly type: 'failure' | 'recovery';
}

class ReliabilityMonitor {
  private events: FailureEvent[] = [];

  recordEvent(event: FailureEvent): void {
    this.events.push(event);
  }

  /**
   * 计算 MTBF
   */
  calculateMTBF(component: string, timeWindowMs: number): number {
    const cutoff = Date.now() - timeWindowMs;
    const componentEvents = this.events.filter(
      e => e.component === component && e.timestamp > cutoff
    );

    const failures = componentEvents.filter(e => e.type === 'failure').length;

    if (failures === 0) return Infinity;

    return timeWindowMs / failures;
  }

  /**
   * 计算 MTTR
   */
  calculateMTTR(component: string, timeWindowMs: number): number {
    const cutoff = Date.now() - timeWindowMs;
    const componentEvents = this.events.filter(
      e => e.component === component && e.timestamp > cutoff
    );

    let totalRepairTime = 0;
    let repairCount = 0;

    for (let i = 0; i < componentEvents.length; i++) {
      if (componentEvents[i].type === 'failure') {
        // 寻找对应的恢复事件
        for (let j = i + 1; j < componentEvents.length; j++) {
          if (componentEvents[j].type === 'recovery') {
            totalRepairTime += componentEvents[j].timestamp - componentEvents[i].timestamp;
            repairCount++;
            break;
          }
        }
      }
    }

    return repairCount > 0 ? totalRepairTime / repairCount : 0;
  }

  /**
   * 计算当前可用性
   */
  calculateAvailability(component: string, timeWindowMs: number): number {
    const mtbf = this.calculateMTBF(component, timeWindowMs);
    const mttr = this.calculateMTTR(component, timeWindowMs);

    return ReliabilityCalculator.availability(mtbf, mttr);
  }
}

// ============================================
// 使用示例
// ============================================

// 1. 基本可靠性计算
const failureRate = 0.001; // 每小时 0.1% 故障率
const mtbf = ReliabilityCalculator.mtbf(failureRate);
console.log(`MTBF: ${mtbf} 小时`);

const reliability24h = ReliabilityCalculator.reliability(24, failureRate);
console.log(`24小时可靠性: ${(reliability24h * 100).toFixed(4)}%`);

// 2. 可用性计算
const mttr = 0.5; // 平均修复时间 0.5 小时
const availability = ReliabilityCalculator.availability(mtbf, mttr);
console.log(`可用性: ${(availability * 100).toFixed(4)}%`);

// 3. 可用性目标
console.log('\n可用性目标对照表:');
[2, 3, 4, 5, 6].forEach(nines => {
  const target = new AvailabilityTarget(nines, '');
  console.log(`${nines}个9: ${(target.percentage * 100).toFixed(nines + 2)}% - 年宕机时间: ${target.downtimePerYear}`);
});

// 4. 串联/并联系统
const r1 = 0.99;
const r2 = 0.95;
const r3 = 0.999;

console.log('\n串联系统可靠性:', ReliabilityCalculator.seriesReliability([r1, r2, r3]));
console.log('并联系统可靠性:', ReliabilityCalculator.parallelReliability([r1, r2, r3]));

// 5. SLA 计算
const composite = SLACalculator.compositeSLA([0.999, 0.995, 0.99]);
console.log('\n复合 SLA:', (composite * 100).toFixed(3) + '%');

const redundant = SLACalculator.redundantSLA(0.99, 2);
console.log('双冗余 SLA:', (redundant * 100).toFixed(3) + '%');
```

### 10.3 最佳实践

| 实践 | 说明 | 示例 |
|-----|------|-----|
| **定义 SLO** | 设定具体的服务水平目标 | 99.9% 可用性 |
| **监控 MTBF/MTTR** | 跟踪关键指标趋势 | 使用可靠性监控器 |
| **故障演练** | 定期测试恢复能力 | 混沌工程实验 |
| **容量规划** | 基于可靠性需求规划资源 | 冗余部署 |
| **文档化** | 记录 RTO/RPO 目标 | 灾难恢复计划 |

### 10.4 关键术语

| 术语 | 定义 | 计算公式 |
|-----|------|---------|
| **RTO** | 恢复时间目标（Recovery Time Objective）| - |
| **RPO** | 恢复点目标（Recovery Point Objective）| - |
| **SLA** | 服务等级协议（Service Level Agreement）| - |
| **SLO** | 服务等级目标（Service Level Objective）| - |
| **SLI** | 服务等级指标（Service Level Indicator）| - |

---

## 总结

本文档系统地介绍了错误处理与系统可靠性的形式化方法，涵盖：

1. **异常处理的形式化** - 单子语义和代数结构
2. **Result/Option 类型** - 代数理论和范畴论基础
3. **错误边界** - 故障隔离和恢复策略
4. **重试策略** - 指数退避和断路器模式
5. **超时和取消** - 时间约束和协作式抢占
6. **结构化日志** - 事件流模型和半环代数
7. **监控告警** - 指标空间和阈值谓词
8. **混沌工程** - 稳态假设和韧性验证
9. **容错设计** - 降级、熔断、隔离模式
10. **可靠性度量** - MTBF、MTTR、可用性的数学定义

这些形式化方法为构建高可靠性的 JavaScript/TypeScript 系统提供了坚实的理论基础和实践指导。
