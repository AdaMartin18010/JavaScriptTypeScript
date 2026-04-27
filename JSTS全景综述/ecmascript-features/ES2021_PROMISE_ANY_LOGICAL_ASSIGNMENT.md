---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# ES2021 特性深度解析：Promise.any、逻辑赋值与内存管理

## 目录

- [ES2021 特性深度解析：Promise.any、逻辑赋值与内存管理](#es2021-特性深度解析promiseany逻辑赋值与内存管理)
  - [目录](#目录)
  - [1. Promise.any 与 Promise 组合子的形式化对比](#1-promiseany-与-promise-组合子的形式化对比)
    - [1.1 形式化定义](#11-形式化定义)
      - [Promise.any 的形式化语义](#promiseany-的形式化语义)
      - [对比：Promise 组合子族](#对比promise-组合子族)
    - [1.2 推理规则](#12-推理规则)
    - [1.3 使用示例](#13-使用示例)
    - [1.4 性能分析](#14-性能分析)
  - [2. AggregateError 结构与错误处理](#2-aggregateerror-结构与错误处理)
    - [2.1 形式化定义](#21-形式化定义)
    - [2.2 推理规则](#22-推理规则)
    - [2.3 使用示例](#23-使用示例)
    - [2.4 性能分析](#24-性能分析)
  - [3. 逻辑赋值运算符的形式化语义](#3-逻辑赋值运算符的形式化语义)
    - [3.1 形式化定义](#31-形式化定义)
    - [3.2 短路语义的形式化](#32-短路语义的形式化)
    - [3.3 使用示例](#33-使用示例)
    - [3.4 性能分析](#34-性能分析)
  - [4. WeakRef 与 FinalizationRegistry 内存管理理论](#4-weakref-与-finalizationregistry-内存管理理论)
    - [4.1 形式化定义](#41-形式化定义)
    - [4.2 内存模型与推理规则](#42-内存模型与推理规则)
    - [4.3 使用示例](#43-使用示例)
    - [4.4 性能分析](#44-性能分析)
  - [5. 数字分隔符的解析语义](#5-数字分隔符的解析语义)
    - [5.1 形式化定义](#51-形式化定义)
    - [5.2 合法性规则](#52-合法性规则)
    - [5.3 形式化文法验证](#53-形式化文法验证)
    - [5.4 使用示例](#54-使用示例)
    - [5.5 性能分析](#55-性能分析)
  - [6. String.prototype.replaceAll 算法复杂度分析](#6-stringprototypereplaceall-算法复杂度分析)
    - [6.1 形式化定义](#61-形式化定义)
    - [6.2 算法实现与复杂度](#62-算法实现与复杂度)
    - [6.3 与其他方法的对比](#63-与其他方法的对比)
    - [6.4 使用示例](#64-使用示例)
    - [6.5 性能优化策略](#65-性能优化策略)
    - [6.6 复杂度分析总结](#66-复杂度分析总结)
  - [附录：ES2021 特性速查表](#附录es2021-特性速查表)

---

## 1. Promise.any 与 Promise 组合子的形式化对比

### 1.1 形式化定义

设有一组 Promise P = {p₁, p₂, ..., pₙ}，其中每个 pᵢ 可能处于以下状态之一：

- **pending**: 未决议状态
- **fulfilled(v)**: 成功完成，值为 v
- **rejected(r)**: 被拒绝，原因为 r

#### Promise.any 的形式化语义

```
Promise.any(P) = {
  fulfilled(vⱼ)    if ∃ pⱼ ∈ P: pⱼ = fulfilled(vⱼ) ∧ j = min{i | pᵢ is fulfilled}
  rejected(AggregateError(R))  if ∀ pᵢ ∈ P: pᵢ = rejected(rᵢ), R = {r₁, ..., rₙ}
}
```

#### 对比：Promise 组合子族

| 组合子 | 成功条件 | 失败条件 | 返回值类型 | 竞争语义 |
|--------|----------|----------|------------|----------|
| `Promise.all` | ∀ pᵢ ∈ P: fulfilled | ∃ pᵢ: rejected | [v₁, ..., vₙ] | 等待全部 |
| `Promise.race` | ∃ pᵢ: settled | ∃ pᵢ: rejected ∧ first | vᵢ 或 rᵢ | 竞争首个 |
| `Promise.allSettled` | 总是成功 | 永不失败 | [{status, value}] | 等待全部 |
| `Promise.any` | ∃ pᵢ: fulfilled | ∀ pᵢ: rejected | vⱼ | 竞争首个成功 |

### 1.2 推理规则

**Promise.any 的推导规则：**

```
pⱼ ↓ fulfilled(v)    ∀i < j: pᵢ ↓ rejected(rᵢ)
────────────────────────────────────────────────
Promise.any([p₁, ..., pₙ]) ↓ fulfilled(v)

∀i ∈ [1,n]: pᵢ ↓ rejected(rᵢ)
─────────────────────────────────────────────────────────────────
Promise.any([p₁, ..., pₙ]) ↓ rejected(AggregateError([r₁, ..., rₙ]))
```

### 1.3 使用示例

```javascript
// 示例 1: 多源数据获取 - 取首个成功者
const fetchFromMultipleCDNs = (resource) => {
  const sources = [
    fetch(`https://cdn1.example.com/${resource}`),
    fetch(`https://cdn2.example.com/${resource}`),
    fetch(`https://cdn3.example.com/${resource}`)
  ];

  return Promise.any(sources);
};

// 示例 2: 快速服务发现
const discoverFastestService = async () => {
  const healthChecks = [
    checkHealth('us-east-1'),
    checkHealth('us-west-2'),
    checkHealth('eu-central-1')
  ];

  try {
    const fastest = await Promise.any(healthChecks);
    return fastest.region;
  } catch (error) {
    // 所有区域都不可用
    throw new ServiceUnavailableError(error.errors);
  }
};

// 示例 3: 带超时的竞争
const fetchWithTimeout = (url, timeout = 5000) => {
  return Promise.any([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
};
```

### 1.4 性能分析

```
时间复杂度: O(n)  空间复杂度: O(n)

┌─────────────────────────────────────────────────────────────────┐
│                    Promise 组合子性能对比                        │
├──────────────┬─────────────┬─────────────┬──────────────────────┤
│    组合子     │   时间      │    空间     │      适用场景         │
├──────────────┼─────────────┼─────────────┼──────────────────────┤
│ Promise.all  │ O(n)        │ O(n)        │ 依赖全部结果          │
│ Promise.race │ O(1)*       │ O(1)        │ 超时/取消控制         │
│ allSettled   │ O(n)        │ O(n)        │ 批量操作状态收集      │
│ Promise.any  │ O(k≤n)      │ O(n)        │ 冗余/高可用场景       │
└──────────────┴─────────────┴─────────────┴──────────────────────┘
* 摊销时间，取决于最快决议的 Promise
```

**关键性能特征：**

- Promise.any 在首个成功时立即解析，无需等待其他 Promise
- 必须跟踪所有 Promise 的拒绝原因，空间开销为 O(n)
- 最优情况时间复杂度为 O(1)（首个 Promise 立即成功）
- 最坏情况时间复杂度为 O(n)（全部失败后聚合错误）

---

## 2. AggregateError 结构与错误处理

### 2.1 形式化定义

AggregateError 是一个特殊的 Error 类型，用于封装多个错误实例。

```
AggregateError :: (errors: Error[], message: string) → Error
```

**结构定义：**

```
AggregateError {
  ├─ [[Prototype]]: Error.prototype
  ├─ name: "AggregateError"
  ├─ message: string
  ├─ errors: Error[]    // 封装的错误列表（可枚举、可配置）
  └─ cause?: any        // 可选的原始原因（ES2022+）
}
```

### 2.2 推理规则

**错误聚合规则：**

```
Γ ⊢ e₁: Error  ...  Γ ⊢ eₙ: Error
─────────────────────────────────
Γ ⊢ new AggregateError([e₁, ..., eₙ]): Error
```

**错误解构规则：**

```
e = AggregateError([e₁, ..., eₙ])  eᵢ ↓ rᵢ
──────────────────────────────────────────
for const err of e.errors ⇒ rᵢ
```

### 2.3 使用示例

```javascript
// 示例 1: 自定义 AggregateError
class ValidationAggregateError extends AggregateError {
  constructor(errors, message = 'Multiple validation errors occurred') {
    super(errors, message);
    this.name = 'ValidationAggregateError';
  }

  get flattenedErrors() {
    return this.errors.flatMap(err =>
      err instanceof AggregateError ? err.flattenedErrors : [err]
    );
  }
}

// 示例 2: Promise.any 错误处理模式
try {
  const result = await Promise.any([
    fetch('/api/primary'),
    fetch('/api/secondary'),
    fetch('/api/tertiary')
  ]);
} catch (aggregateError) {
  // 所有请求都失败
  console.error(`All ${aggregateError.errors.length} attempts failed:`);
  aggregateError.errors.forEach((err, idx) => {
    console.error(`  [${idx}]: ${err.message}`);
  });
}

// 示例 3: 嵌套 AggregateError 处理
function flattenAggregateErrors(error) {
  const errors = [];
  const queue = [error];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current instanceof AggregateError) {
      queue.push(...current.errors);
    } else {
      errors.push(current);
    }
  }

  return errors;
}
```

### 2.4 性能分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| 创建 AggregateError | O(n) | O(n) | n 为错误数量 |
| 遍历 errors | O(n) | O(1) | 直接访问数组 |
| 扁平化嵌套错误 | O(n × d) | O(n × d) | d 为嵌套深度 |
| 错误分类 | O(n) | O(k) | k 为分类数量 |

---

## 3. 逻辑赋值运算符的形式化语义

### 3.1 形式化定义

逻辑赋值运算符结合了逻辑运算符和赋值操作，具有短路求值特性。

**语法形式：**

```
LogicalAssignment ::
  LeftHandSideExpression LogicalAssignmentOperator AssignmentExpression

LogicalAssignmentOperator :: one of
  &&=  ||=  ??=
```

**语义定义：**

| 运算符 | 形式化语义 | 等价表达式 |
|--------|-----------|-----------|
| `x ??= y` | x = (x === undefined \|\| x === null) ? y : x | `x ?? (x = y)` |
| `x \|\|= y` | x = x ? x : y | `x \|\| (x = y)` |
| `x &&= y` | x = x ? y : x | `x && (x = y)` |

### 3.2 短路语义的形式化

**空值合并赋值 (??=)：**

```
           x ↓ undefined/null
──────────────────────────────────────────
x ??= y  ↓  (x = y) ↓ v

           x ↓ v (v ≠ undefined, v ≠ null)
──────────────────────────────────────────
x ??= y  ↓  v
```

**逻辑或赋值 (||=)：**

```
           x ↓ truthy
─────────────────────────
x ||= y  ↓  x

           x ↓ falsy
─────────────────────────
x ||= y  ↓  (x = y) ↓ v
```

**逻辑与赋值 (&&=)：**

```
           x ↓ falsy
─────────────────────────
x &&= y  ↓  x

           x ↓ truthy
─────────────────────────
x &&= y  ↓  (x = y) ↓ v
```

### 3.3 使用示例

```javascript
// 示例 1: 配置对象默认值（??=）
function createConfig(userConfig) {
  const config = {};

  config.timeout ??= 5000;        // 仅当 undefined/null 时赋值
  config.retries ??= 3;
  config.cacheEnabled ??= true;

  // 深度属性初始化
  config.db ??= {};
  config.db.host ??= 'localhost';
  config.db.port ??= 3306;

  return { ...config, ...userConfig };
}

// 示例 2: 懒加载/初始化 (||=)
class LazyService {
  get expensiveResource() {
    return this._resource ||= this.initializeResource();
  }

  initializeResource() {
    console.log('Initializing expensive resource...');
    return new HeavyComputation();
  }
}

// 示例 3: 条件清理 (&&=)
class SessionManager {
  constructor() {
    this.session = null;
  }

  updateActivity() {
    // 仅当 session 存在时更新时间戳
    this.session &&= { ...this.session, lastActive: Date.now() };
  }

  setData(data) {
    // 仅当 session 有效时存储数据
    this.session &&= { ...this.session, data };
  }
}

// 示例 4: 嵌套对象安全赋值
const state = {};
state.user ??= {};
state.user.preferences ??= {};
state.user.preferences.theme ||= 'dark';
state.user.preferences.notifications &&= validateNotifications(
  state.user.preferences.notifications
);
```

### 3.4 性能分析

```
┌────────────────────────────────────────────────────────────────┐
│              逻辑赋值运算符 vs 传统写法性能对比                  │
├────────────────┬────────────────┬──────────────────────────────┤
│     场景        │   逻辑赋值      │      传统写法                 │
├────────────────┼────────────────┼──────────────────────────────┤
│ x ??= y (有值)  │ 1 次比较       │ 2 次比较 (=== undefined      │
│                │                │            || === null)      │
│ x ||= y (真值)  │ 1 次布尔转换   │ 2 次布尔转换                 │
│ x &&= y (假值)  │ 1 次布尔转换   │ 2 次布尔转换                 │
└────────────────┴────────────────┴──────────────────────────────┘
```

**性能优化要点：**

- 短路求值避免不必要的赋值操作
- 减少属性访问次数（尤其对深层属性）
- 引擎可对简单形式进行优化内联

**基准测试对比：**

```javascript
// 测试：1000万次操作
// x ??= y
// 传统: if (x === undefined || x === null) x = y;
// 逻辑赋值通常快 5-15%（取决于引擎优化）
```

---

## 4. WeakRef 与 FinalizationRegistry 内存管理理论

### 4.1 形式化定义

**WeakRef**：对对象的弱引用，不阻止垃圾回收。

```
WeakRef<T> {
  ├─ [[Target]]: T | empty      // 被引用的对象（可变为空）
  ├─ deref(): T | undefined     // 获取强引用或 undefined
  └─ [[IsValid]]: boolean       // 内部有效性标志
}
```

**FinalizationRegistry**：对象被回收时的回调注册表。

```
FinalizationRegistry<T> {
  ├─ [[Cells]]: List<RegistryCell>
  ├─ register(target, heldValue, unregisterToken?): void
  ├─ unregister(unregisterToken): void
  └─ [[CleanupCallback]](heldValue): void
}

RegistryCell {
  ├─ [[WeakRefTarget]]: WeakRef
  ├─ [[HeldValue]]: any
  └─ [[UnregisterToken]]: any | undefined
}
```

### 4.2 内存模型与推理规则

**弱引用语义：**

```
若 WeakRef ref 引用对象 obj：

  ┌─────────────────────────────────────────┐
  │  可达性图包含强引用路径到 obj           │
  │  ─────────────────────────────────────  │
  │  ref.deref() ↓ obj                      │
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │  可达性图无强引用路径到 obj             │
  │  ─────────────────────────────────────  │
  │  ref.deref() ↓ undefined                │
  │  obj 可被垃圾回收                       │
  └─────────────────────────────────────────┘
```

**终结器语义：**

```
对象 obj 被注册到 FinalizationRegistry reg，持有 heldValue：

obj 被回收前:
  reg.[[Cells]] 包含 {[[WeakRefTarget]]: weakref(obj), [[HeldValue]]: heldValue}

obj 被回收时:
  reg.[[CleanupCallback]](heldValue) 被调度执行
  对应 Cell 从 [[Cells]] 移除
```

### 4.3 使用示例

```javascript
// 示例 1: 外部资源关联缓存
class ExternalResourceManager {
  #registry = new FinalizationRegistry((handle) => {
    console.log(`Cleaning up external resource: ${handle}`);
    this.nativeAPI.releaseResource(handle);
  });

  #resources = new Map(); // id -> WeakRef<Wrapper>

  createResource(id, data) {
    const handle = this.nativeAPI.createResource(data);
    const wrapper = { id, data: new WeakRef(data) };

    this.#resources.set(id, new WeakRef(wrapper));
    this.#registry.register(wrapper, handle, wrapper);

    return wrapper;
  }

  getResource(id) {
    const ref = this.#resources.get(id);
    return ref?.deref();
  }
}

// 示例 2: 大对象缓存（不阻止 GC）
class WeakCache<K, V> {
  #cache = new Map<K, WeakRef<V>>();
  #registry = new FinalizationRegistry((key) => {
    this.#cache.delete(key);
  });

  set(key, value) {
    this.#cache.set(key, new WeakRef(value));
    this.#registry.register(value, key);
  }

  get(key) {
    const ref = this.#cache.get(key);
    const value = ref?.deref();

    if (value === undefined) {
      this.#cache.delete(key);
    }

    return value;
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}

// 示例 3: DOM 元素与数据关联（避免内存泄漏）
class ElementDataStore {
  #registry = new FinalizationRegistry((id) => {
    console.log(`Element ${id} was garbage collected`);
    this.#dataStore.delete(id);
  });

  #dataStore = new Map();
  #idCounter = 0;

  setData(element, data) {
    const id = `element-${++this.#idCounter}`;
    this.#dataStore.set(id, data);
    this.#registry.register(element, id, element);

    // 返回取消注册令牌，允许手动清理
    return {
      unregister: () => this.#registry.unregister(element)
    };
  }
}

// 示例 4: Worker 池管理
class WorkerPool {
  #workers = [];
  #registry = new FinalizationRegistry((workerId) => {
    const worker = this.findWorkerById(workerId);
    if (worker) {
      console.log(`Worker ${workerId} reference lost, terminating`);
      worker.terminate();
    }
  });

  acquire() {
    const worker = this.getOrCreateWorker();
    const proxy = new Proxy(worker, {
      // 代理实现...
    });

    this.#registry.register(proxy, worker.id);
    return proxy;
  }
}
```

### 4.4 性能分析

| 操作 | 时间复杂度 | GC 影响 | 注意事项 |
|------|-----------|---------|----------|
| `new WeakRef(obj)` | O(1) | 无 | 创建弱引用对象开销 |
| `weakRef.deref()` | O(1) | 可能触发读屏障 | 结果可能随时失效 |
| `FinalizationRegistry.register` | O(1) | 无 | 注册表增长 |
| 终结器回调执行 | 不确定 | GC 后异步执行 | 无确定时间保证 |

**内存管理最佳实践：**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WeakRef 使用准则                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. 始终检查 deref() 返回值，它可能随时变为 undefined           │
│ 2. 终结器回调执行时间不保证，不要依赖它进行紧急清理             │
│ 3. 终结器中不要创建新对象，可能导致重新进入 GC                  │
│ 4. 使用 unregisterToken 管理需要取消注册的场景                 │
│ 5. WeakRef 不是缓存银弹，考虑 LRU 等确定性策略                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 数字分隔符的解析语义

### 5.1 形式化定义

数字分隔符（Numeric Separators）允许在数字字面量中使用下划线 `_` 作为视觉分隔符。

**语法产生式：**

```
NumericLiteral ::
  DecimalIntegerLiteral DecimalSeparator? ExponentPart?
  . DecimalDigits ExponentPart?
  DecimalBigIntegerLiteral
  NonDecimalIntegerLiteral

DecimalDigits ::
  DecimalDigit
  DecimalDigits DecimalDigit
  DecimalDigits _ DecimalDigit   // 分隔符规则

BinaryDigits ::
  BinaryDigit
  BinaryDigits BinaryDigit
  BinaryDigits _ BinaryDigit

OctalDigits ::
  OctalDigit
  OctalDigits OctalDigit
  OctalDigits _ OctalDigit

HexDigits ::
  HexDigit
  HexDigits HexDigit
  HexDigits _ HexDigit
```

**语义规则：**

```
数值解析: interpret(NumericLiteral) → Number

其中下划线 _ 的处理:
  1. 词法阶段: 识别并验证 _ 的位置
  2. 解析阶段: 移除所有 _ 字符
  3. 求值阶段: 按常规数值字面量求值
```

### 5.2 合法性规则

**有效位置（Before）：**

```
1_000_000_000        // 十进制整数
1_000_000.000_001    // 小数
0xFF_FF_FF_FF        // 十六进制
0b1010_0001          // 二进制
0o7_7_7              // 八进制
1e1_0                // 指数部分
```

**无效位置（SyntaxError）：**

```
_123                 // 开头
123_                 // 结尾
123._456             // 小数点后立即
1__2                 // 连续
0x_FF                // 前缀后
1.2_e3               // 指数指示符后
```

### 5.3 形式化文法验证

```
VALID_SEPARATOR_POSITION ::=
  | AFTER_DIGIT BEFORE_DIGIT
  | AFTER_DIGIT BEFORE_EXPONENT
  | IN_EXPONENT

AFTER_DIGIT ::= [0-9] | [0-9a-fA-F] (hex)
BEFORE_DIGIT ::= [0-9] | [0-9a-fA-F] (hex)
BEFORE_EXPONENT ::= [eE] [+-]? [0-9]
IN_EXPONENT ::= [eE] [+-]? [0-9] _ [0-9]
```

### 5.4 使用示例

```javascript
// 示例 1: 大数字可读性
const WORLD_POPULATION = 7_900_000_000;
const MONEY_IN_CENTS = 999_99;        // $999.99
const BYTES_IN_GB = 1_073_741_824;

// 示例 2: 二进制掩码
const PERMISSIONS = {
  READ:    0b0001,
  WRITE:   0b0010,
  EXECUTE: 0b0100,
  DELETE:  0b1000,
  ALL:     0b1111
};

const FILE_MODE = 0b1101_0110;        // 按字节分组

// 示例 3: 十六进制颜色/地址
const COLOR_CYAN = 0x00_FF_FF;
const MEMORY_ADDRESS = 0xFFFF_0000;
const UUID_PART = 0x12_34_56_78_9A_BC_DE_F0n;

// 示例 4: 科学计数法
const PLANCK_CONSTANT = 6.626_070_15e-34;
const AVOGADRO = 6.022_140_76e23;

// 示例 5: BigInt
const LARGE_PRIME = 9_007_199_254_740_991n;
const MASK_64BIT = 0xFFFF_FFFF_FFFF_FFFFn;

// 示例 6: 金融计算（精度保持）
const toCents = (dollars) => Math.round(dollars * 100);
const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

const transaction = {
  amount: 1_234_567_89,  // 1,234,567.89
  fee: 2_99,             // 2.99
  tax: 123_456_78        // 123,456.78
};
```

### 5.5 性能分析

```
┌────────────────────────────────────────────────────────────────┐
│                数字分隔符性能特征                               │
├──────────────────────┬─────────────────────────────────────────┤
│      阶段             │              开销分析                    │
├──────────────────────┼─────────────────────────────────────────┤
│ 词法分析              │ +1 字符检查/分隔符                       │
│ 语法验证              │ 位置有效性检查 O(k), k=分隔符数量       │
│ 值计算                │ 移除分隔符后正常解析，无额外开销         │
├──────────────────────┼─────────────────────────────────────────┤
│ 运行时开销            │ 零（解析期特性）                         │
│ 文件大小              │ 略微增加（_ 字符）                       │
│ 可读性收益            │ 指数级提升（大数字）                     │
└──────────────────────┴─────────────────────────────────────────┘
```

**解析算法复杂度：**

- 时间：O(n)，其中 n 为数字字面量长度
- 空间：O(1)，仅需验证状态机

---

## 6. String.prototype.replaceAll 算法复杂度分析

### 6.1 形式化定义

```
String.prototype.replaceAll(searchValue, replaceValue) → String

前置条件:
  - 若 searchValue 是字符串，则其长度 > 0
  - 若 searchValue 是正则表达式，则必须有全局标志 g

后置条件:
  - 返回新字符串，其中所有 searchValue 匹配被替换
  - 原字符串不变
```

**算法伪代码：**

```
function replaceAll(S, searchValue, replaceValue):
  1. 令 O = RequireObjectCoercible(S)
  2. 若 searchValue 不是 undefined 且 searchValue 有 @@replace 方法:
       a. 若 IsRegExp(searchValue) 为 true 且 searchValue.global 为 false:
            抛出 TypeError
       b. 返回 Invoke(searchValue, @@replace, (O, replaceValue))
  3. 令 string = ToString(O)
  4. 令 searchString = ToString(searchValue)
  5. 若 searchString 为空字符串 "":
       a. 返回 string  // 或按规范处理
  6. 执行字符串匹配替换算法
  7. 返回结果字符串
```

### 6.2 算法实现与复杂度

**朴素实现（多重单替换）：**

```
时间复杂度: O(n × m × k)
  n = 字符串长度
  m = 搜索串长度
  k = 匹配次数

空间复杂度: O(n × k)
  每次替换创建新字符串
```

**优化实现（单次遍历）：**

```
时间复杂度: O(n × m)  → 使用 KMP/BM 可优化至 O(n + m × k)
空间复杂度: O(n + r)
  n = 结果字符串
  r = 替换函数结果
```

**实际引擎实现（V8 策略）：**

```javascript
// V8 内部优化路径
// 1. 小字符串 + 少匹配: 简单扫描
// 2. 大字符串 + 固定替换: 预分配 + 单次构建
// 3. 正则表达式: 使用 Irregexp 引擎
// 4. 函数替换: 按需调用，懒计算
```

### 6.3 与其他方法的对比

| 方法 | 时间复杂度 | 空间复杂度 | 匹配次数 | 正则支持 |
|------|-----------|-----------|----------|----------|
| `replace` | O(n × m) | O(n) | 首次 | 是 |
| `replaceAll` | O(n × m) → O(n+m) | O(n) | 全部 | 是（需 g 标志） |
| `split`+`join` | O(n × k) | O(n × k) | 全部 | 否 |
| 手动循环 | O(n²) | O(n²) | 全部 | 否 |

### 6.4 使用示例

```javascript
// 示例 1: 基础字符串替换
const text = 'foo bar foo baz foo';
text.replaceAll('foo', 'qux');  // 'qux bar qux baz qux'

// 示例 2: 敏感信息脱敏
function maskPII(text) {
  return text
    .replaceAll(/\d{4}-\d{4}-\d{4}-\d{4}/g, '****-****-****-****')
    .replaceAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                '[EMAIL REDACTED]');
}

// 示例 3: SQL 注入防御（简单转义）
function escapeSQL(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\x00', '\\0');
}

// 示例 4: 模板引擎实现
function renderTemplate(template, data) {
  return Object.entries(data).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

const template = 'Hello {{name}}, you have {{count}} messages';
renderTemplate(template, { name: 'Alice', count: 5 });
// 'Hello Alice, you have 5 messages'

// 示例 5: 函数替换（复杂处理）
const normalizeWhitespace = (str) =>
  str.replaceAll(/\s+/g, (match) =>
    match.includes('\n') ? '\n' : ' '
  );

// 示例 6: 与正则标志的配合
const html = '<div>text</div>';
html.replaceAll(/<[^>]+>/g, '');  // 'text'

// 错误示例（会抛出）
try {
  'test'.replaceAll(/t/, 'x');  // 缺少 g 标志
} catch (e) {
  console.log(e.name);  // TypeError
}
```

### 6.5 性能优化策略

```javascript
// 策略 1: 对于固定模式，预编译正则
const REPEAT_SPACE = /  +/g;
function normalize(text) {
  return text.replaceAll(REPEAT_SPACE, ' ');  // 比字面量更高效
}

// 策略 2: 大量替换时使用数组构建（避免中间字符串）
function efficientReplace(str, replacements) {
  const parts = [];
  let lastIndex = 0;

  // 构建索引...
  // 按位置排序所有匹配
  // 一次性构建结果

  return parts.join('');
}

// 策略 3: 链式替换优化顺序
// 先替换长的/特殊的，再替换短的/通用的
function sanitizeHTML(input) {
  return input
    .replaceAll('&', '&amp;')    // 必须先于其他
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// 策略 4: 大文本分块处理
async function* replaceInStream(stream, search, replace) {
  let buffer = '';
  const searchLen = search.length;

  for await (const chunk of stream) {
    buffer += chunk;
    let idx;

    while ((idx = buffer.indexOf(search)) !== -1) {
      yield buffer.slice(0, idx) + replace;
      buffer = buffer.slice(idx + searchLen);
    }

    // 保留可能的不完整匹配
    if (buffer.length > searchLen) {
      yield buffer.slice(0, -searchLen + 1);
      buffer = buffer.slice(-searchLen + 1);
    }
  }

  yield buffer;
}
```

### 6.6 复杂度分析总结

```
┌────────────────────────────────────────────────────────────────────┐
│                    replaceAll 性能矩阵                              │
├─────────────────────┬─────────────┬─────────────┬──────────────────┤
│       场景           │   时间       │    空间      │     推荐度       │
├─────────────────────┼─────────────┼─────────────┼──────────────────┤
│ 短字符串+字面量      │ O(n)        │ O(n)        │ ★★★★★           │
│ 长字符串+少匹配      │ O(n)        │ O(n)        │ ★★★★★           │
│ 长字符串+多匹配      │ O(n×k)      │ O(n×k)      │ ★★★★☆ (考虑split)│
│ 正则+复杂替换函数    │ O(n×k×f)    │ O(n×k)      │ ★★★☆☆           │
│ 空字符串搜索         │ 无限循环风险 │ -           │ ✗ 禁止           │
└─────────────────────┴─────────────┴─────────────┴──────────────────┘
```

---

## 附录：ES2021 特性速查表

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ES2021 特性总结                               │
├─────────────────────────┬───────────────────────────────────────────┤
│ Promise.any             │ 首个成功 Promise，失败聚合为 AggregateError│
│ AggregateError          │ 多错误封装容器                             │
│ ??= / ||= / &&=          │ 逻辑赋值，短路求值                         │
│ WeakRef                 │ 弱引用，不阻止 GC                         │
│ FinalizationRegistry    │ 对象回收回调注册表                         │
│ Numeric Separators      │ 数字下划线分隔符                           │
│ String.replaceAll       │ 全局字符串替换                             │
└─────────────────────────┴───────────────────────────────────────────┘
```

---

*文档生成时间: 2026-04-08*
*适用于 ES2021 (ECMAScript 12th Edition)*
