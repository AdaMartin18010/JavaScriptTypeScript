# ES2020 (ES11) 特性完整语义分析

> 本文档深入解析 ES2020 引入的 8 个核心特性，包含完整的 ECMA-262 规范引用、形式化定义、使用示例与常见陷阱。

---

## 目录

- [ES2020 (ES11) 特性完整语义分析](#es2020-es11-特性完整语义分析)
  - [目录](#目录)
  - [1. 动态 import() 的完整语义分析](#1-动态-import-的完整语义分析)
    - [1.1 规范章节](#11-规范章节)
    - [1.2 形式化定义](#12-形式化定义)
    - [1.3 语法产生式](#13-语法产生式)
    - [1.4 执行语义](#14-执行语义)
    - [1.5 使用示例](#15-使用示例)
    - [1.6 常见陷阱](#16-常见陷阱)
  - [2. 空值合并运算符 ?? 的形式化](#2-空值合并运算符--的形式化)
    - [2.1 规范章节](#21-规范章节)
    - [2.2 形式化定义](#22-形式化定义)
    - [2.3 推理规则](#23-推理规则)
    - [2.4 与 || 的语义对比](#24-与--的语义对比)
    - [2.5 使用示例](#25-使用示例)
    - [2.6 常见陷阱](#26-常见陷阱)
  - [3. 可选链操作符 ?. 的完整语义](#3-可选链操作符--的完整语义)
    - [3.1 规范章节](#31-规范章节)
    - [3.2 形式化定义](#32-形式化定义)
    - [3.3 语法产生式](#33-语法产生式)
    - [3.4 短路语义](#34-短路语义)
    - [3.5 使用示例](#35-使用示例)
    - [3.6 常见陷阱](#36-常见陷阱)
  - [4. globalThis 的统一全局对象](#4-globalthis-的统一全局对象)
    - [4.1 规范章节](#41-规范章节)
    - [4.2 形式化定义](#42-形式化定义)
    - [4.3 环境绑定语义](#43-环境绑定语义)
    - [4.4 使用示例](#44-使用示例)
    - [4.5 常见陷阱](#45-常见陷阱)
  - [5. Promise.allSettled 的完整形式化](#5-promiseallsettled-的完整形式化)
    - [5.1 规范章节](#51-规范章节)
    - [5.2 形式化定义](#52-形式化定义)
    - [5.3 与 Promise.all 的语义对比](#53-与-promiseall-的语义对比)
    - [5.4 推理规则](#54-推理规则)
    - [5.5 使用示例](#55-使用示例)
    - [5.6 常见陷阱](#56-常见陷阱)
  - [6. for-in 枚举顺序的标准化](#6-for-in-枚举顺序的标准化)
    - [6.1 规范章节](#61-规范章节)
    - [6.2 形式化定义](#62-形式化定义)
    - [6.3 枚举顺序算法](#63-枚举顺序算法)
    - [6.4 使用示例](#64-使用示例)
    - [6.5 常见陷阱](#65-常见陷阱)
  - [7. import.meta 的元数据语义](#7-importmeta-的元数据语义)
    - [7.1 规范章节](#71-规范章节)
    - [7.2 形式化定义](#72-形式化定义)
    - [7.3 元数据属性](#73-元数据属性)
    - [7.4 使用示例](#74-使用示例)
    - [7.5 常见陷阱](#75-常见陷阱)
  - [8. export \* as namespace 语法](#8-export--as-namespace-语法)
    - [8.1 规范章节](#81-规范章节)
    - [8.2 形式化定义](#82-形式化定义)
    - [8.3 语法产生式](#83-语法产生式)
    - [8.4 命名空间导出语义](#84-命名空间导出语义)
    - [8.5 使用示例](#85-使用示例)
    - [8.6 常见陷阱](#86-常见陷阱)
  - [附录：ES2020 特性速查表](#附录es2020-特性速查表)

---

## 1. 动态 import() 的完整语义分析

### 1.1 规范章节

**ECMA-262 规范**: [§15.3.6 Import Calls](https://tc39.es/ecma262/#sec-import-calls)

**相关抽象操作**:

- `EvaluateImportCall` - 评估动态导入调用
- `HostLoadImportedModule` - 宿主环境加载模块
- `FinishDynamicImport` - 完成动态导入过程

### 1.2 形式化定义

动态导入 `import()` 是一个类似函数的语法结构，返回一个 Promise，解析为模块命名空间对象或模块的默认导出。

```
ImportCall:
  import ( AssignmentExpression )
  import ( AssignmentExpression , AssignmentExpression )

语义:
  import(specifier) → Promise<ModuleNamespaceObject>
  import(specifier, options) → Promise<ModuleNamespaceObject>
```

**形式化语义函数**:

```
EvaluateImportCall(specifier, options):
  1. 令 ref 为 Evaluate(specifier)
  2. 令 specifierString 为 ToString(GetValue(ref))
  3. 令 promiseCapability 为 NewPromiseCapability(%Promise%)
  4. 令 moduleRequest 为 { [[Specifier]]: specifierString }
  5. 若 options 存在:
       a. 令 optionsRef 为 Evaluate(options)
       b. 令 optionsValue 为 GetValue(optionsRef)
       c. 若 optionsValue 不是 undefined:
          i. 提取断言等选项
  6. 执行 HostLoadImportedModule(...)
  7. 返回 promiseCapability.[[Promise]]
```

### 1.3 语法产生式

```
ImportMetaExpression:
  import . meta

ImportCall:
  import ( AssignmentExpression )
  import ( AssignmentExpression , AssignmentExpression )

注：import() 虽语法类似函数调用，但不是函数。
    它是一个特殊的语法形式，具有以下特性:
    - 不能绑定到变量: const myImport = import // SyntaxError
    - 不能使用 call/apply: import.call(null, './mod.js') // TypeError
    - 不能在 new 表达式中使用
```

### 1.4 执行语义

**模块加载状态机**:

```
模块加载生命周期:

  ┌──────────────┐
  │    Start     │
  └──────┬───────┘
         │ 调用 import(specifier)
         ▼
  ┌──────────────┐
  │   Loading    │ ──→ HostLoadImportedModule
  └──────┬───────┘    (解析、获取、实例化)
         │
         ▼
  ┌──────────────┐
  │   Linked     │ ──→ 完成模块图链接
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ Evaluated    │ ──→ 执行模块体
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Fulfilled   │ ──→ 返回命名空间对象
  └──────────────┘
```

### 1.5 使用示例

```javascript
// 示例 1: 基本动态导入
async function loadUtils() {
  const utils = await import('./utils.js');
  utils.doSomething();
}

// 示例 2: 条件加载
async function loadPolyfill() {
  if (!Array.prototype.flat) {
    await import('./polyfills/array-flat.js');
  }
}

// 示例 3: 基于环境的模块选择
async function loadConfig() {
  const config = process.env.NODE_ENV === 'production'
    ? await import('./config.prod.js')
    : await import('./config.dev.js');
  return config.default;
}

// 示例 4: 动态路径构造
async function loadLocale(lang) {
  try {
    const locale = await import(`./locales/${lang}.json`);
    return locale.default;
  } catch (err) {
    // 回退到默认语言
    return (await import('./locales/en.json')).default;
  }
}

// 示例 5: 命名空间解构
async function loadMath() {
  const { PI, sin, cos } = await import('./math.js');
  return { PI, sin, cos };
}

// 示例 6: 同时导入多个模块
async function loadMultiple() {
  const [utils, helpers] = await Promise.all([
    import('./utils.js'),
    import('./helpers.js')
  ]);
  return { utils, helpers };
}

// 示例 7: 使用 import.meta 配合
async function loadSibling(name) {
  const module = await import(new URL(`./${name}.js`, import.meta.url));
  return module;
}
```

### 1.6 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **试图绑定 import** | `const myImport = import;` | 无法绑定，import 是语法结构 |
| **模板字符串陷阱** | `import('./${name}')` | `import(\`./${name}.js\`)` 注意括号位置 |
| **不使用 await** | `const mod = import('./x')` | `const mod = await import('./x')` 或 `.then()` |
| **循环依赖** | A 动态导入 B，B 动态导入 A | 重构代码，避免循环 |
| **遗漏 .default** | `const { foo } = await import('./mod')` | `const { default: foo } = await import('./mod')` |
| **SSR 中直接使用** | `await import('fs')` | 使用 typeof window 判断或 try-catch |

```javascript
// 陷阱 1: import 不是函数
const importFn = import; // SyntaxError: Unexpected token 'import'

// 陷阱 2: 字符串拼接问题（动态路径）
const name = 'utils';
// 错误: 模板字符串整体作为参数
const mod = await import(`./${name}`); // 可以工作

// 陷阱 3: 忘记 await 导致返回 Promise
const mod = import('./utils.js');
mod.doSomething(); // TypeError: mod.doSomething is not a function

// 正确
const mod = await import('./utils.js');
mod.doSomething();

// 陷阱 4: 默认导出的获取
const module = await import('./config.js');
console.log(module); // { default: { ... }, __esModule: true }
const config = module.default; // 需要显式获取 default

// 陷阱 5: 静态分析限制
// 打包工具可能无法分析动态路径
const name = getModuleName(); // 运行时才能确定
const mod = await import(`./modules/${name}`); // 可能打包失败
```

---

## 2. 空值合并运算符 ?? 的形式化

### 2.1 规范章节

**ECMA-262 规范**: [§13.12 Coalesce Expression](https://tc39.es/ecma262/#sec-coalesce-expression)

**相关抽象操作**:

- `Evaluation of CoalesceExpression`
- `IsLooselyEqual` 用于 null/undefined 检测

### 2.2 形式化定义

空值合并运算符 `??` 是一个短路二元运算符，仅当左侧操作数为 `null` 或 `undefined` 时，才返回右侧操作数。

**语法产生式**:

```
CoalesceExpression:
  CoalesceExpressionHead ?? BitwiseORExpression

CoalesceExpressionHead:
  CoalesceExpression
  BitwiseORExpression
```

**形式化语义**:

```
Evaluation of CoalesceExpression: head ?? right

1. 令 lref 为 Evaluation of head
2. 令 lval 为 GetValue(lref)
3. 若 lval 是 undefined 或 null:
     a. 令 rref 为 Evaluation of right
     b. 返回 GetValue(rref)
4. 否则，返回 lval
```

**数学定义**:

```
?? : Any × Any → Any

x ?? y = {
  y    if x ∈ {undefined, null}
  x    otherwise
}
```

### 2.3 推理规则

```
         Γ ⊢ e₁ ↓ undefined/null
────────────────────────────────────
Γ ⊢ (e₁ ?? e₂) ↓ v where e₂ ↓ v

         Γ ⊢ e₁ ↓ v (v ∉ {undefined, null})
────────────────────────────────────────────
        Γ ⊢ (e₁ ?? e₂) ↓ v
```

### 2.4 与 || 的语义对比

| 表达式 | 当左侧为 | 返回右侧? |
|--------|----------|-----------|
| `a \|\| b` | `undefined` | 是 |
| `a \|\| b` | `null` | 是 |
| `a \|\| b` | `0` | 是 (意外!) |
| `a \|\| b` | `""` | 是 (意外!) |
| `a \|\| b` | `false` | 是 (意外!) |
| `a ?? b` | `undefined` | 是 |
| `a ?? b` | `null` | 是 |
| `a ?? b` | `0` | **否** (返回 0) |
| `a ?? b` | `""` | **否** (返回 "") |
| `a ?? b` | `false` | **否** (返回 false) |

### 2.5 使用示例

```javascript
// 示例 1: 提供默认值（正确场景）
function greet(name) {
  const userName = name ?? 'Anonymous';
  return `Hello, ${userName}!`;
}

greet(null);      // 'Hello, Anonymous!'
greet(undefined); // 'Hello, Anonymous!'
greet('');        // 'Hello, !' (保留空字符串)
greet(0);         // 'Hello, 0!' (保留 0)

// 示例 2: 配置对象默认值
function createApp(config) {
  const {
    port = 3000,                    // 解构默认值
    host = 'localhost',
    timeout = 5000,
    retries = 3
  } = config ?? {};                 // 空值合并保护

  return { port, host, timeout, retries };
}

createApp(null);      // { port: 3000, host: 'localhost', ... }
createApp(undefined); // { port: 3000, host: 'localhost', ... }
createApp({ port: 8080 }); // { port: 8080, host: 'localhost', ... }

// 示例 3: 链式空值合并
const value =
  obj.first ??
  obj.second ??
  obj.third ??
  'default';

// 示例 4: 与可选链结合
const street = user?.address?.street ?? 'Unknown Street';

// 示例 5: 函数参数默认值
function fetchData(url, options) {
  const timeout = options?.timeout ?? 5000;
  const retries = options?.retries ?? 3;
  // ...
}

// 示例 6: API 响应处理
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  return {
    name: data.name ?? 'Unknown',
    email: data.email ?? 'no-email@example.com',
    avatar: data.avatar ?? '/default-avatar.png'
  };
}

// 示例 7: localStorage 安全读取
function getStoredValue(key) {
  try {
    const item = localStorage.getItem(key);
    return JSON.parse(item) ?? null;
  } catch {
    return null;
  }
}
```

### 2.6 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **与 \|\| 混用** | `a ?? b \|\| c` | 使用括号明确优先级或统一运算符 |
| **与 && 混用** | `a && b ?? c` | SyntaxError，必须用括号 |
| **假阳性默认值** | `value \|\| default` (当 value 可能是 0 或 "") | `value ?? default` |
| **与解构默认值重复** | `{ x = y ?? z }` | 选择一种方式即可 |

```javascript
// 陷阱 1: 与 || 混用导致意外结果
const value = 0 ?? 10 || 20;
// 0 ?? 10 = 0 (因为 0 不是 null/undefined)
// 0 || 20 = 20 (因为 0 是 falsy)
// 结果: 20 (可能不是预期的!)

// 明确意图:
const value1 = (0 ?? 10) || 20; // 20
const value2 = 0 ?? (10 || 20); // 0

// 陷阱 2: 语法错误 - 不能与 && 直接混用
// const x = a && b ?? c; // SyntaxError
const x = (a && b) ?? c; // OK
const y = a && (b ?? c); // OK

// 陷阱 3: 假阴性 (误以为需要默认值)
function process(value) {
  // 错误: 0 和 "" 也是有效值
  const num = value || 1;
  return num * 10;
}
process(0); // 10 (应该是 0!)

function processCorrect(value) {
  const num = value ?? 1;
  return num * 10;
}
processCorrect(0); // 0

// 陷阱 4: 混淆 nullish 与 falsy
const values = [
  { input: null,      '??': null ?? 'default', '||': null || 'default' },
  { input: undefined, '??': undefined ?? 'd',   '||': undefined || 'd' },
  { input: 0,         '??': 0 ?? 'default',     '||': 0 || 'default' },
  { input: '',        '??': '' ?? 'default',    '||': '' || 'default' },
  { input: false,     '??': false ?? 'default', '||': false || 'default' },
  { input: NaN,       '??': NaN ?? 'default',   '||': NaN || 'default' },
];

// 陷阱 5: 嵌套对象访问链
const obj = { data: { value: 0 } };
// 错误: 当 data 存在但 value 为 0 时
const val = obj.data.value || 10; // 10 (错误!)
const val2 = obj.data.value ?? 10; // 0 (正确)
```

---

## 3. 可选链操作符 ?. 的完整语义

### 3.1 规范章节

**ECMA-262 规范**: [§13.13 Optional Chains](https://tc39.es/ecma262/#sec-optional-chains)

**相关抽象操作**:

- `EvaluatePropertyAccessWithOptionalChain`
- `OptionalChainEvaluation`
- `OptionalDelete`

### 3.2 形式化定义

可选链操作符 `?.` 提供了一种安全地访问嵌套对象属性的方式，当引用为 nullish (null 或 undefined) 时，表达式短路返回 `undefined` 而不是抛出错误。

**语法产生式**:

```
OptionalExpression:
  MemberExpression OptionalChain
  CallExpression OptionalChain
  OptionalExpression OptionalChain

OptionalChain:
  ?. Arguments
  ?. [ Expression ]
  ?. IdentifierName
  ?. TemplateLiteral
  ?. PrivateIdentifier
  OptionalChain Arguments
  OptionalChain [ Expression ]
  OptionalChain . IdentifierName
  OptionalChain TemplateLiteral
  OptionalChain PrivateIdentifier
```

**形式化语义**:

```
Evaluation of OptionalChain: base?.property

1. 令 baseReference 为 Evaluation of base
2. 令 baseValue 为 GetValue(baseReference)
3. 若 baseValue 是 undefined 或 null:
     a. 返回 undefined
4. 令 propertyNameReference 为 Evaluation of property
5. 令 propertyNameValue 为 GetValue(propertyNameReference)
6. 令 propertyKey 为 ToPropertyKey(propertyNameValue)
7. 返回 baseValue.[[Get]](propertyKey, baseValue)
```

### 3.3 语法产生式

```
// 可选属性访问
obj?.prop
obj?.[expr]

// 可选方法调用
obj?.method()
obj?.[expr]()

// 可选链调用
func?.()

// 可选模板字面量（已弃用/限制）
obj?.`template` // 实际中受限

// 可选私有字段访问
obj?.#privateField

// 链式使用
obj?.prop?.nested?.value
obj?.method()?.result
```

### 3.4 短路语义

```
可选链短路规则:

base?.X

若 base 是 nullish (null/undefined):
  ┌─────────────────────────────────────────┐
  │  整个表达式立即返回 undefined           │
  │  不评估 X 中的任何部分                  │
  │  不调用 X 中的任何函数                  │
  │  不访问 X 中的任何属性                  │
  └─────────────────────────────────────────┘

若 base 不是 nullish:
  ┌─────────────────────────────────────────┐
  │  正常评估 X，将 base 作为 this 上下文   │
  │  若 X 中还有 ?.，递归应用此规则         │
  └─────────────────────────────────────────┘
```

**形式化推理规则**:

```
       Γ ⊢ base ↓ null/undefined
─────────────────────────────────────
Γ ⊢ base?.X ↓ undefined

       Γ ⊢ base ↓ obj (obj ≠ null/undefined)
       Γ ⊢ obj.X ↓ v
─────────────────────────────────────
Γ ⊢ base?.X ↓ v
```

### 3.5 使用示例

```javascript
// 示例 1: 基本属性访问
const user = {
  profile: {
    name: 'Alice',
    address: {
      city: 'Beijing'
    }
  }
};

// 传统写法
const city1 = user && user.profile && user.profile.address && user.profile.address.city;

// 可选链写法
const city2 = user?.profile?.address?.city; // 'Beijing'

// 安全访问不存在的属性
const zip = user?.profile?.address?.zipCode; // undefined (不报错)

// 示例 2: 可选方法调用
const calculator = {
  add: (a, b) => a + b,
  history: []
};

// 安全调用可能存在的方法
const result = calculator?.add?.(2, 3); // 5

// 当对象为 null 时安全处理
const nullCalc = null;
const result2 = nullCalc?.add?.(2, 3); // undefined (不报错)

// 示例 3: 动态属性访问
const getProp = (obj, key) => obj?.[key];
getProp(user, 'profile'); // { name: 'Alice', ... }
getProp(null, 'profile'); // undefined

// 示例 4: 函数调用链
const api = {
  fetch: () => ({
    json: () => Promise.resolve({ data: [] })
  })
};

const data = await api?.fetch?.()?.json?.();

// 示例 5: 与空值合并结合
const config = {
  server: {
    port: 0  // 0 是有效值
  }
};

const port = config?.server?.port ?? 3000; // 0 (保留 0，不是默认值)

// 示例 6: DOM 操作中的安全访问
element?.querySelector?.('.item')?.classList?.add?.('active');

// 示例 7: 删除操作（ES2021+）
delete user?.profile?.tempData; // 安全删除

// 示例 8: 处理数组
const users = [
  { name: 'Alice', orders: [{ id: 1 }] },
  { name: 'Bob' }
];

const firstOrderId = users?.[0]?.orders?.[0]?.id; // 1
const bobOrder = users?.[1]?.orders?.[0]?.id;     // undefined

// 示例 9: 构建安全的数据处理管道
function processData(data) {
  return data
    ?.map?.(item => item?.value)
    ?.filter?.(v => v != null)
    ?.reduce?.((a, b) => a + b, 0) ?? 0;
}

processData(null);                      // 0
processData([{ value: 1 }, { value: 2 }]); // 3
processData([null, { value: 5 }]);      // 5

// 示例 10: 条件执行
const logger = {
  debug: console.log,
  info: console.info
};

// 仅在 logger 存在且有 debug 方法时才调用
logger?.debug?.('Debug message');
```

### 3.6 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **赋值左侧使用** | `obj?.prop = value` | 先检查再赋值: `if (obj) obj.prop = value` |
| **构造函数使用** | `new Class?.()` | `new (Class?.())` 或不使用可选链 |
| **链过长失去意义** | `a?.b?.c?.d?.e` | 考虑数据结构设计或提前返回 |
| **可选 delete** | `delete obj?.prop` | ES2021+ 支持，旧环境会报错 |
| **与 ++/-- 混用** | `obj?.prop++` | 先获取值，再递增 |
| **过度使用** | `obj?.prop?.method()` | 若确定存在则直接使用 `obj.prop.method()` |

```javascript
// 陷阱 1: 不能用于赋值左侧
const obj = {};
// obj?.prop = 1; // SyntaxError: Invalid left-hand side in assignment

// 正确方式
if (obj) {
  obj.prop = 1;
}

// 陷阱 2: 构造函数
// new MyClass?.(); // SyntaxError

// 陷阱 3: 短路行为误解
let called = false;
const obj = null;
const result = obj?.method(called = true);
console.log(called); // false! (方法参数不会被评估)

// 陷阱 4: 返回值 undefined 可能与有效值混淆
const user = { name: null };
const name = user?.name; // null (不是 undefined)

const user2 = null;
const name2 = user2?.name; // undefined

// 无法仅通过结果区分这两种情况

// 陷阱 5: 数组越界不会触发短路
const arr = [1, 2, 3];
arr?.[10]; // undefined (但不是可选链的结果，是普通越界)

// 陷阱 6: 多次可选链调用中的副作用
let obj = {
  getA() { console.log('getA'); return null; },
  getB() { console.log('getB'); return 1; }
};

// 只打印 'getA'，因为 getA() 返回 null，getB 不会被调用
const result = obj.getA()?.b ?? obj.getB();

// 陷阱 7: 与模板字符串
const obj = { toString: () => 'hello' };
// obj?.`template`; // 语法限制

// 陷阱 8: 错误地认为会跳过整个表达式
const x = null;
const y = x?.a + 1; // undefined + 1 = NaN
// 可选链只保护到 ?. 为止，后面的 + 1 仍会执行

// 正确做法
const y = x?.a ?? 0 + 1;
```

---

## 4. globalThis 的统一全局对象

### 4.1 规范章节

**ECMA-262 规范**: [§19.1.1 globalThis](https://tc39.es/ecma262/#sec-globalthis)

**相关抽象操作**:

- `SetDefaultGlobalBindings` - 设置全局绑定
- `GetGlobalObject` - 获取全局对象

### 4.2 形式化定义

`globalThis` 是一个标准化的全局环境绑定，在所有 JavaScript 环境中指向全局对象，无论代码运行在浏览器、Node.js 还是其他环境中。

**形式化定义**:

```
globalThis: Object

语义:
  在任何执行上下文中，globalThis 绑定到该环境的全局对象。

环境映射:
  ┌──────────────────┬──────────────────────────────┐
  │ 环境              │ globalThis 指向              │
  ├──────────────────┼──────────────────────────────┤
  │ 浏览器            │ window                       │
  │ Node.js          │ global                       │
  │ Web Worker       │ self                         │
  │ 严格模式模块      │ 模块顶层 this (undefined)     │
  │ 非严格模式        │ 全局对象                      │
  └──────────────────┴──────────────────────────────┘
```

**规范要求**:

```
全局对象的属性 globalThis:
- { [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }
- 值: 当前环境的全局对象
- 在非浏览器环境中，globalThis 必须直接等同于实际的全局对象
```

### 4.3 环境绑定语义

```
全局环境记录 (Global Environment Record):

┌─────────────────────────────────────────────────────────────┐
│                    Global Environment                        │
├─────────────────────────────────────────────────────────────┤
│ [[ObjectRecord]]: Object Environment Record                 │
│   ├─ 绑定对象: 全局对象 (window/global/self)                │
│   └─ 包含: 所有全局变量声明                                  │
├─────────────────────────────────────────────────────────────┤
│ [[GlobalThisValue]]: 全局对象                               │
│   ├─ 指向: 与 [[ObjectRecord]] 相同                          │
│   └─ 通过 globalThis 访问                                    │
├─────────────────────────────────────────────────────────────┤
│ [[DeclarativeRecord]]: Declarative Environment Record       │
│   └─ 包含: let/const/class 声明                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 使用示例

```javascript
// 示例 1: 跨环境全局对象访问
// 在浏览器中
globalThis === window; // true

// 在 Node.js 中
globalThis === global; // true

// 在 Web Worker 中
globalThis === self; // true

// 示例 2: 检测当前环境
function detectEnvironment() {
  if (globalThis.window === globalThis) {
    return 'browser';
  }
  if (globalThis.process?.versions?.node) {
    return 'nodejs';
  }
  if (globalThis.importScripts) {
    return 'webworker';
  }
  return 'unknown';
}

// 示例 3: 安全地添加全局 polyfill
if (!globalThis.Array.prototype.flat) {
  globalThis.Array.prototype.flat = function(depth = 1) {
    // polyfill 实现
  };
}

// 示例 4: 跨环境的定时器
globalThis.setTimeout(() => {
  console.log('Works everywhere!');
}, 1000);

// 示例 5: 访问全局 Math
globalThis.Math.max(1, 2, 3); // 3

// 示例 6: 模块中访问全局 this
// 在 ES 模块中，顶层 this 是 undefined
// 但 globalThis 仍然指向全局对象
console.log(this);        // undefined
console.log(globalThis);  // global object

// 示例 7: 安全的 JSON polyfill
const JSON = globalThis.JSON || {
  parse: /* fallback */,
  stringify: /* fallback */
};

// 示例 8: 检测 fetch API 支持
if (globalThis.fetch) {
  // 使用原生 fetch
} else {
  // 使用 polyfill
}

// 示例 9: 跨环境的事件总线
class GlobalEventBus {
  constructor() {
    if (!globalThis.__eventBus) {
      globalThis.__eventBus = new EventTarget();
    }
    this.bus = globalThis.__eventBus;
  }

  emit(event, data) {
    this.bus.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  on(event, handler) {
    this.bus.addEventListener(event, handler);
  }
}

// 示例 10: 调试时检查全局状态
function debugGlobals() {
  const globals = Object.keys(globalThis);
  console.log(`Global scope has ${globals.length} properties`);

  // 检查是否有变量泄漏到全局
  const userVars = globals.filter(k =>
    !['window', 'self', 'globalThis', 'document', 'console'].includes(k)
  );
  console.log('Potential user globals:', userVars);
}
```

### 4.5 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **模块中混淆 this** | `this.setTimeout` | `globalThis.setTimeout` |
| **严格函数中的 this** | 函数内使用 this | 使用 globalThis 明确意图 |
| **不可覆盖性误解** | `globalThis = {}` | globalThis 可覆盖，但不建议 |
| **与 self 混淆** | `self` (可能是局部变量) | 使用 globalThis 明确引用全局 |

```javascript
// 陷阱 1: 模块中 this 是 undefined
// module.js
console.log(this); // undefined
console.log(globalThis); // 全局对象

// 陷阱 2: 箭头函数中 this 继承外层
const obj = {
  method: () => {
    console.log(this); // undefined (模块顶层)
    console.log(globalThis); // 全局对象
  }
};

// 陷阱 3: 严格模式函数
function strictFunc() {
  'use strict';
  console.log(this); // undefined
  console.log(globalThis); // 全局对象
}

// 陷阱 4: 不同环境的差异
// 在浏览器中，window 可以被覆盖
var window = 'oops';
console.log(window); // 'oops'
console.log(globalThis); // 仍然指向真正的全局对象

// 陷阱 5: 嵌套 iframe 中
// 每个 iframe 有自己的 globalThis
console.log(globalThis === parent.globalThis); // false

// 陷阱 6: 试图冻结全局对象
// Object.freeze(globalThis); // 可能失败或导致问题

// 陷阱 7: Worker 环境中的差异
// Worker 中没有 window/document
globalThis.document; // undefined (Worker 中)
globalThis.self; // 指向 Worker 全局对象
```

---

## 5. Promise.allSettled 的完整形式化

### 5.1 规范章节

**ECMA-262 规范**: [§27.2.4.3 Promise.allSettled](https://tc39.es/ecma262/#sec-promise.allsettled)

**相关抽象操作**:

- `Promise.allSettled`
- `Promise.allSettledResolveElement`
- `Promise.allSettledRejectElement`

### 5.2 形式化定义

`Promise.allSettled` 接收一个可迭代对象，返回一个 Promise，当所有输入 Promise 都已敲定（无论成功或失败）时，返回的 Promise 以描述每个 Promise 结果的对象数组兑现。

**形式化语义**:

```
Promise.allSettled: Iterable<Promise<T>> → Promise<Array<SettlementResult>>

SettlementResult =
  | { status: "fulfilled", value: T }
  | { status: "rejected", reason: any }
```

**状态转换图**:

```
输入 Promise 集合 P = {p₁, p₂, ..., pₙ}

p₁: pending ──→ fulfilled(v₁) ──┐
p₂: pending ──→ rejected(r₂) ──┼──→ allSettled Promise
p₃: pending ──→ fulfilled(v₃) ──┤    fulfilled with
...                             │    [{s:"fulfilled",v:v₁},
pₙ: pending ──→ fulfilled(vₙ) ──┘     {s:"rejected",r:r₂},
                                      {s:"fulfilled",v:v₃}, ...]

关键点: 无论个别 Promise 失败与否，allSettled 总是成功
```

### 5.3 与 Promise.all 的语义对比

| 特性 | Promise.all | Promise.allSettled |
|------|-------------|-------------------|
| 成功条件 | 所有 Promise 成功 | 所有 Promise 已敲定 |
| 失败条件 | 任一 Promise 失败 | 永不失败 |
| 返回值 | 结果值的数组 | 状态描述对象的数组 |
| 失败处理 | 首个失败的 Promise 原因 | 包含在结果中 |
| 使用场景 | 依赖全部成功 | 需要知道每个结果 |

### 5.4 推理规则

```
给定 P = [p₁, p₂, ..., pₙ]

对于每个 pᵢ:
  pᵢ ↓ fulfilled(vᵢ)  →  result[i] = { status: "fulfilled", value: vᵢ }
  pᵢ ↓ rejected(rᵢ)   →  result[i] = { status: "rejected", reason: rᵢ }

────────────────────────────────────────────────────────────────
Promise.allSettled(P) ↓ fulfilled([result₁, result₂, ..., resultₙ])
```

**与 Promise.all 的形式化对比**:

```
Promise.all(P):
  ∃pᵢ ∈ P: pᵢ = rejected(r)  →  Promise.all(P) = rejected(r)
  ∀pᵢ ∈ P: pᵢ = fulfilled(vᵢ) →  Promise.all(P) = fulfilled([v₁, ..., vₙ])

Promise.allSettled(P):
  ∀P: Promise.allSettled(P) = fulfilled([{status, value/reason}, ...])
  (总是成功，无论输入 Promise 状态)
```

### 5.5 使用示例

```javascript
// 示例 1: 基本用法
const promises = [
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
];

const results = await Promise.allSettled(promises);
console.log(results);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]

// 示例 2: 批量操作结果处理
async function fetchMultiple(urls) {
  const requests = urls.map(url =>
    fetch(url).catch(err => err)
  );

  const results = await Promise.allSettled(requests);

  return {
    successful: results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value),
    failed: results
      .filter(r => r.status === 'rejected')
      .map(r => r.reason)
  };
}

// 示例 3: 数据库批量写入
async function batchInsert(records) {
  const operations = records.map(record =>
    db.insert(record)
      .then(() => ({ success: true, record }))
      .catch(error => ({ success: false, record, error }))
  );

  const results = await Promise.allSettled(operations);

  const summary = results.reduce((acc, result) => {
    const { success, record, error } = result.value;
    if (success) {
      acc.inserted.push(record);
    } else {
      acc.failed.push({ record, error });
    }
    return acc;
  }, { inserted: [], failed: [] });

  return summary;
}

// 示例 4: 带超时的多个请求
async function fetchWithTimeout(urls, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeout)
  );

  const requests = urls.map(url =>
    Promise.race([fetch(url), timeoutPromise])
  );

  return await Promise.allSettled(requests);
}

// 示例 5: 结果分类处理
async function processJobs(jobs) {
  const results = await Promise.allSettled(
    jobs.map(job => executeJob(job))
  );

  const fulfilled = [];
  const rejected = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      fulfilled.push({ index, value: result.value });
    } else {
      rejected.push({ index, reason: result.reason });
    }
  });

  return { fulfilled, rejected };
}

// 示例 6: 与 TypeScript 类型结合
type SettlementResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: any };

async function typedAllSettled<T>(
  promises: Promise<T>[]
): Promise<SettlementResult<T>[]> {
  return Promise.allSettled(promises);
}

// 示例 7: 重试机制
async function fetchWithRetry(urls, maxRetries = 3) {
  let results = await Promise.allSettled(
    urls.map(url => fetch(url))
  );

  for (let i = 0; i < maxRetries; i++) {
    const failedUrls = results
      .map((r, idx) => ({ result: r, idx }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ idx }) => urls[idx]);

    if (failedUrls.length === 0) break;

    const retryResults = await Promise.allSettled(
      failedUrls.map(url => fetch(url))
    );

    // 更新结果
    let retryIdx = 0;
    results = results.map(r =>
      r.status === 'rejected' ? retryResults[retryIdx++] : r
    );
  }

  return results;
}

// 示例 8: 顺序依赖的批量操作
async function sequentialBatch(operations) {
  const results = [];

  for (const batch of chunk(operations, 5)) {
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);

    // 检查是否有严重错误需要中断
    const criticalFailures = batchResults.filter(
      r => r.status === 'rejected' && isCritical(r.reason)
    );

    if (criticalFailures.length > 0) {
      throw new AggregateError(
        criticalFailures.map(r => r.reason),
        'Critical errors occurred'
      );
    }
  }

  return results;
}
```

### 5.6 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **混淆结果结构** | `results.map(r => r.value)` | `results.map(r => r.status === 'fulfilled' ? r.value : null)` |
| **忘记检查 status** | `results[0].value` | 先检查 `results[0].status` |
| **与 all 混用** | 用 allSettled 但需要快速失败 | 使用 Promise.all |
| **空数组处理** | 预期特殊行为 | `Promise.allSettled([])` 立即返回 `[]` |

```javascript
// 陷阱 1: 直接访问 value（不检查 status）
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error')
]);

// 错误: 直接访问 value
const values = results.map(r => r.value);
// [1, undefined] - 第二个是 undefined!

// 正确: 根据 status 处理
const values = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

// 陷阱 2: 忘记处理 rejected
const results = await Promise.allSettled(promises);
// 如果不处理 rejected，可能忽略错误

// 正确做法
const hasErrors = results.some(r => r.status === 'rejected');
if (hasErrors) {
  console.error('Some operations failed');
}

// 陷阱 3: 结果顺序与输入顺序
const results = await Promise.allSettled([
  slowPromise(),
  fastPromise()
]);
// results[0] 对应 slowPromise，results[1] 对应 fastPromise
// 顺序与输入一致，不是完成顺序!

// 陷阱 4: 非 Promise 值
const results = await Promise.allSettled([1, 2, 3]);
// 非 Promise 值被视为已兑现的 Promise
// [{status: 'fulfilled', value: 1}, ...]

// 陷阱 5: 类型收窄（TypeScript）
const results = await Promise.allSettled([fetch1(), fetch2()]);

// 需要类型保护
const data = results
  .filter((r): r is PromiseFulfilledResult<Response> =>
    r.status === 'fulfilled'
  )
  .map(r => r.value);

// 陷阱 6: 性能误解
// allSettled 必须等待所有 Promise 完成
// 如果一个 Promise 很慢，即使其他的都失败了，也要等待
```

---

## 6. for-in 枚举顺序的标准化

### 6.1 规范章节

**ECMA-262 规范**: [§14.7.5 The for-in Statement](https://tc39.es/ecma262/#sec-for-in-and-for-of-statements)

**相关抽象操作**:

- `EnumerateObjectProperties`
- `OrdinaryOwnPropertyKeys`

### 6.2 形式化定义

ES2020 标准化了 `for-in` 循环中对象属性的枚举顺序，使其与 `Object.keys`、`Object.entries`、`Object.getOwnPropertyNames` 和 `JSON.stringify` 一致。

**枚举顺序规则**:

```
EnumerateObjectProperties(O):

1. 令 ownKeys 为 OrdinaryOwnPropertyKeys(O)
2. 按以下顺序返回属性键:
   a. 所有整数索引 (numeric string keys that are array indices)，按数值升序
   b. 所有字符串键 (非整数索引)，按创建顺序
   c. 所有 Symbol 键，按创建顺序
3. 对原型链上的对象递归应用此规则
```

**形式化定义**:

```
给定对象 O，其属性按以下顺序枚举:

枚举顺序(O) =
  sort_numeric_asc(
    { k | k ∈ OwnPropertyKeys(O), IsArrayIndex(k) }
  ) ++
  preserve_creation_order(
    { k | k ∈ OwnPropertyKeys(O), Type(k) = String, ¬IsArrayIndex(k) }
  ) ++
  preserve_creation_order(
    { k | k ∈ OwnPropertyKeys(O), Type(k) = Symbol }
  )

其中 ++ 表示列表连接
```

### 6.3 枚举顺序算法

```
┌─────────────────────────────────────────────────────────────┐
│                 属性枚举顺序算法                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  对于对象本身:                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. 正整数索引 (0, 1, 2, ...)，按数值升序               │  │
│  │    - "0", "1", "10" (数值 0, 1, 10)                   │  │
│  │    - 注意: "10" 在 "2" 之后                            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. 字符串键，按创建顺序                                │  │
│  │    - 包括类数组索引范围外的键                          │  │
│  │    - 如 "foo", "bar", "999999999999999999"             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3. Symbol 键，按创建顺序                               │  │
│  │    - Symbol('a'), Symbol('b')                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  然后递归到原型链:                                           │
│    - 对每个原型对象应用相同规则                              │
│    - 原型属性在实例属性之后枚举                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 使用示例

```javascript
// 示例 1: 基本枚举顺序
const obj = {
  c: 1,
  a: 2,
  b: 3
};

for (const key in obj) {
  console.log(key); // c, a, b (创建顺序)
}

// 示例 2: 整数索引优先
const mixed = {
  z: 1,
  10: 2,
  a: 3,
  1: 4,
  b: 5,
  2: 6
};

for (const key in mixed) {
  console.log(key); // 1, 2, 10, z, a, b
}
// 整数索引先按数值排序，然后字符串键按创建顺序

// 示例 3: 类数组对象
const arrayLike = {
  foo: 'first',
  2: 'two',
  10: 'ten',
  1: 'one',
  bar: 'last'
};

for (const key in arrayLike) {
  console.log(key, arrayLike[key]);
}
// 1: one
// 2: two
// 10: ten
// foo: first
// bar: last

// 示例 4: 原型链枚举
const proto = {
  protoProp: 1,
  0: 'proto-index'
};

const instance = Object.create(proto);
instance.instanceProp = 2;
instance[1] = 'instance-index';

for (const key in instance) {
  console.log(key);
}
// 1 (实例整数)
// instanceProp (实例字符串)
// 0 (原型整数)
// protoProp (原型字符串)

// 示例 5: 大整数索引
const bigIndices = {
  999999999999: 'big',
  1: 'one',
  small: 'small'
};

for (const key in bigIndices) {
  console.log(key);
}
// 1 (整数索引)
// 999999999999 (超出数组索引范围，视为字符串)
// small

// 示例 6: Symbol 键不参与 for-in
const sym = Symbol('test');
const objWithSymbol = {
  a: 1,
  [sym]: 2
};

for (const key in objWithSymbol) {
  console.log(key); // 只打印 'a'，Symbol 被忽略
}

// 示例 7: 与 Object.keys 的一致性
const testObj = {
  z: 1,
  2: 2,
  a: 3,
  1: 4
};

console.log(Object.keys(testObj)); // ['1', '2', 'z', 'a']

const forInKeys = [];
for (const key in testObj) {
  forInKeys.push(key);
}
console.log(forInKeys); // ['1', '2', 'z', 'a'] - 相同!

// 示例 8: JSON.stringify 顺序一致性
const jsonObj = {
  z: 1,
  2: 2,
  a: 3,
  1: 4
};

console.log(JSON.stringify(jsonObj)); // '{"1":4,"2":2,"z":1,"a":3}'
// 注意: 虽然规范定义了顺序，但 JSON 格式中属性顺序理论上不应依赖

// 示例 9: 动态添加属性的顺序
const dynamic = { a: 1 };
dynamic.z = 2;
dynamic[10] = 3;  // 整数索引
dynamic.b = 4;

for (const key in dynamic) {
  console.log(key); // 10, a, z, b
}

// 示例 10: 删除后重新添加
const reorder = { a: 1, b: 2, c: 3 };
delete reorder.b;
reorder.b = 4;  // b 现在是最后添加的

for (const key in reorder) {
  console.log(key); // a, c, b (b 移到最后)
}
```

### 6.5 常见陷阱

| 陷阱 | 说明 | 建议 |
|------|------|------|
| **依赖枚举顺序** | 虽然标准化了，但不应依赖 | 需要顺序时使用 Map 或显式排序 |
| **Symbol 不可枚举** | for-in 忽略 Symbol | 需要 Symbol 使用 Reflect.ownKeys |
| **继承属性被枚举** | for-in 包含原型链 | 使用 hasOwnProperty 过滤 |
| **非整数键视为字符串** | "10" 大于 "2" 按数值，但 "02" 是字符串 | 理解整数索引定义 |

```javascript
// 陷阱 1: 依赖枚举顺序（虽然标准化但不推荐）
const obj = { b: 1, a: 2 };
// 不要假设 for-in 总是按 b, a 顺序

// 需要确定顺序时
const sorted = Object.keys(obj).sort();
for (const key of sorted) {
  console.log(key, obj[key]);
}

// 陷阱 2: Symbol 不可枚举
const sym = Symbol('hidden');
const obj = { [sym]: 'secret', normal: 'visible' };

// for-in 看不到 Symbol
for (const key in obj) {
  console.log(key); // 只打印 'normal'
}

// 使用 Reflect.ownKeys 看到所有键
console.log(Reflect.ownKeys(obj)); // ['normal', Symbol(hidden)]

// 陷阱 3: 继承属性
const parent = { inherited: 'parent' };
const child = Object.create(parent);
child.own = 'child';

for (const key in child) {
  console.log(key); // 'own', 'inherited'
}

// 安全检查
for (const key in child) {
  if (child.hasOwnProperty(key)) {
    console.log('Own:', key); // 只打印 'own'
  }
}

// 陷阱 4: 整数索引定义
const obj = {
  '01': 'not-index',  // 前导零，不是整数索引
  '1': 'index'        // 整数索引
};

for (const key in obj) {
  console.log(key); // '1', '01' (整数索引先)
}

// 陷阱 5: 浮点数不是整数索引
const obj2 = {
  '1.5': 'float',
  '1': 'integer'
};

for (const key in obj2) {
  console.log(key); // '1', '1.5' (浮点数字符串在字符串键部分)
}

// 陷阱 6: 超大整数
const obj3 = {
  '9007199254740993': 'big',  // > 2^53-1，不是有效数组索引
  '1': 'small'
};

for (const key in obj3) {
  console.log(key); // '1', '9007199254740993' (大数视为字符串)
}
```

---

## 7. import.meta 的元数据语义

### 7.1 规范章节

**ECMA-262 规范**: [§15.3.12 import.meta](https://tc39.es/ecma262/#sec-import.meta)

**相关抽象操作**:

- `EvaluateImportMeta`
- `HostGetImportMetaProperties`

### 7.2 形式化定义

`import.meta` 是一个包含模块元数据的对象，在每个模块中可用，提供关于该模块的上下文信息。

**语法产生式**:

```
ImportMeta:
  import . meta

语义:
  import.meta: Object
  - 创建: 模块评估时创建一次
  - 可扩展: 是
  - 原型: null 或 Object.prototype
```

**形式化语义**:

```
EvaluateImportMeta():
  1. 令 module 为 GetActiveScriptOrModule()
  2. 断言: module 是 Source Text Module Record
  3. 若 module.[[ImportMeta]] 不是 empty:
       a. 返回 module.[[ImportMeta]]
  4. 令 importMeta 为 ObjectCreate(null)
  5. 执行 HostGetImportMetaProperties(module, importMeta)
  6. 设置 module.[[ImportMeta]] 为 importMeta
  7. 返回 importMeta
```

**模块记录中的存储**:

```
Source Text Module Record {
  ...
  [[ImportMeta]]: Object | empty
  ...
}
```

### 7.3 元数据属性

```
┌─────────────────────────────────────────────────────────────┐
│              import.meta 属性（宿主环境定义）                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  浏览器环境:                                                │
│  ┌────────────────┬───────────────────────────────────────┐ │
│  │ url            │ 模块的绝对 URL                         │ │
│  │ resolve(spec)  │ 解析相对路径为绝对 URL                  │ │
│  └────────────────┴───────────────────────────────────────┘ │
│                                                             │
│  Node.js 环境:                                              │
│  ┌────────────────┬───────────────────────────────────────┐ │
│  │ url            │ 模块的 file:// URL                    │ │
│  │ filename       │ 模块的文件路径 (fileURLToPath)         │ │
│  │ dirname        │ 模块所在目录                           │ │
│  │ resolve(spec)  │ 解析相对路径                           │ │
│  └────────────────┴───────────────────────────────────────┘ │
│                                                             │
│  注: 属性是宿主定义的，规范只规定了基础设施                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 使用示例

```javascript
// 示例 1: 获取模块 URL
console.log(import.meta.url);
// 浏览器: "https://example.com/modules/my-module.js"
// Node.js: "file:///path/to/project/modules/my-module.js"

// 示例 2: 解析相对路径
const worker = new Worker(new URL('./worker.js', import.meta.url));
const image = new Image();
image.src = new URL('../assets/logo.png', import.meta.url);

// 示例 3: 条件执行（检测是否为模块）
if (import.meta.url) {
  console.log('Running as ES module');
}

// 示例 4: 模块热替换 (HMR) 基础
if (import.meta.hot) {
  import.meta.hot.accept();
}

// 示例 5: 动态导入相对模块
async function loadSibling(name) {
  const module = await import(new URL(`./${name}.js`, import.meta.url));
  return module;
}

// 示例 6: 获取模块路径信息（Node.js）
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, 'config.json');

// 示例 7: 构建工具检测
if (import.meta.env?.MODE === 'development') {
  console.log('Development mode');
}

// 示例 8: 可扩展元数据
import.meta.customData = { version: '1.0.0' };
console.log(import.meta.customData.version);

// 示例 9: 模块配置
// config.js
export const config = {
  baseUrl: new URL('.', import.meta.url),
  isMainModule: import.meta.url === process.argv[1]
};

// 示例 10: 测试检测
const isTest = import.meta.url.includes('.test.') ||
               import.meta.env?.NODE_ENV === 'test';

// 示例 11: 跨环境路径处理
function resolveAsset(path) {
  // 浏览器: 直接使用 URL
  if (typeof window !== 'undefined') {
    return new URL(path, import.meta.url).href;
  }
  // Node.js: 转换为文件路径
  return fileURLToPath(new URL(path, import.meta.url));
}

// 示例 12: 模块版本信息
import { version } from './package.json' assert { type: 'json' };
import.meta.moduleInfo = { version, name: 'my-module' };
```

### 7.5 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **CommonJS 中使用** | `import.meta` | 使用 `__filename`, `__dirname` |
| **赋值给 url** | `import.meta.url = '...'` | 属性是只读的（某些环境） |
| **解构使用** | `const { url } = import.meta` | 可以，但要注意环境差异 |
| **忘记 URL 构造函数** | `import.meta.url + '/file'` | `new URL('file', import.meta.url)` |

```javascript
// 陷阱 1: 在 CommonJS 中不可用
// module.cjs
// console.log(import.meta.url); // SyntaxError

// CommonJS 中使用 __filename
console.log(__filename);

// 陷阱 2: 属性可变性
// import.meta.url 通常是只读的
// import.meta.url = 'new-url'; // TypeError (某些环境)

// 但可以添加新属性
import.meta.custom = 'value'; // OK

// 陷阱 3: 字符串拼接路径（错误）
const modulePath = import.meta.url + '/../config.js';
// 结果: "file:///path/module.js/../config.js" (不规范)

// 正确: 使用 URL 构造函数
const correctPath = new URL('../config.js', import.meta.url).href;

// 陷阱 4: 忘记 URL 是对象
console.log(typeof import.meta.url); // "string"

// 陷阱 5: 浏览器与 Node.js 差异
// 浏览器: import.meta.url 是 http(s) URL
// Node.js: import.meta.url 是 file:// URL

// 跨环境代码需要处理
function getDirname() {
  if (typeof window !== 'undefined') {
    // 浏览器: 可能没有直接等价物
    return new URL('.', import.meta.url).pathname;
  }
  // Node.js
  return fileURLToPath(new URL('.', import.meta.url));
}

// 陷阱 6: 动态代码中不可用
const code = 'console.log(import.meta.url)';
eval(code); // 可能抛出错误或返回 undefined

// 陷阱 7: 不能解构基础属性
// 虽然可以解构，但属性可能在不同环境不一致
const { url } = import.meta; // OK，但 url 可能没有

// 陷阱 8: JSON 导入断言中使用
import data from './data.json' assert { type: 'json' };
// import.meta.url 仍然指向 .js 文件，不是 JSON
```

---

## 8. export * as namespace 语法

### 8.1 规范章节

**ECMA-262 规范**: [§16.2.3 Exports](https://tc39.es/ecma262/#sec-exports)

**相关语法产生式**:

- `NamedExports`
- `ExportFromClause`

### 8.2 形式化定义

`export * as namespace` 语法允许将另一个模块的所有导出重新导出为一个命名空间对象。

**形式化语义**:

```
ExportDeclaration:
  export * as Identifier from ModuleSpecifier

语义:
  将指定模块的所有导出收集到一个命名空间对象中，
  以指定的 Identifier 名称导出。

等价于（概念上）:
  import * as Identifier from ModuleSpecifier;
  export { Identifier };
```

**模块记录影响**:

```
模块 M 执行 export * as ns from './module.js':

1. 创建对 './module.js' 的模块请求
2. 解析后，将目标模块的命名空间对象绑定到本地名称 "ns"
3. 导出绑定 "ns" 作为 M 的本地导出

导出表项:
  [[LocalName]]: "ns"
  [[ExportName]]: "ns"
  [[ModuleRequest]]: "./module.js"
  [[ImportName]]: "*"
```

### 8.3 语法产生式

```
ExportDeclaration:
  export ExportFromClause FromClause ;
  export NamedExports ;
  export VariableStatement
  export Declaration
  export default HoistableDeclaration
  export default ClassDeclaration
  export default [lookahead ∉ { function, class }] AssignmentExpression ;

ExportFromClause:
  *
  * as IdentifierName
  NamedExports

NamedExports:
  { }
  { ExportsList }
  { ExportsList , }

ExportsList:
  ExportSpecifier
  ExportsList , ExportSpecifier

ExportSpecifier:
  IdentifierName
  IdentifierName as IdentifierName
```

### 8.4 命名空间导出语义

```
┌─────────────────────────────────────────────────────────────┐
│           export * as ns from './mod' 语义模型               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  源模块 (mod.js)              重新导出模块 (main.js)         │
│  ┌─────────────────┐          ┌───────────────────────┐    │
│  │ export const a  │          │                       │    │
│  │ export const b  │          │ export * as ns from   │    │
│  │ export default  │─────────▶│   './mod.js';         │    │
│  │ function foo()  │          │                       │    │
│  └─────────────────┘          └───────────────────────┘    │
│                                          │                  │
│                                          ▼                  │
│                               导入方 (consumer.js)           │
│                               ┌───────────────────────┐    │
│                               │ import { ns } from    │    │
│                               │   './main.js';        │    │
│                               │                       │    │
│                               │ ns.a, ns.b, ns.default│    │
│                               └───────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 使用示例

```javascript
// ==================== 示例 1: 基本用法 ====================
// utils/math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export default class Calculator { /* ... */ }

// utils/index.js
export * as math from './math.js';
export * as string from './string.js';

// app.js
import { math, string } from './utils/index.js';

console.log(math.add(1, 2));        // 3
console.log(string.capitalize('a')); // 'A'
const calc = new math.default();     // Calculator 实例

// ==================== 示例 2: API 版本控制 ====================
// api/v1.js
export const getUser = () => { /* v1 */ };
export const getPosts = () => { /* v1 */ };

// api/v2.js
export const getUser = () => { /* v2 */ };
export const getPosts = () => { /* v2 */ };
export const getComments = () => { /* v2 only */ };

// api/index.js
export * as v1 from './v1.js';
export * as v2 from './v2.js';

// client.js
import { v1, v2 } from './api/index.js';

// 使用 v1 API
const userV1 = await v1.getUser();

// 使用 v2 API
const userV2 = await v2.getUser();
const comments = await v2.getComments(); // v1 没有此方法

// ==================== 示例 3: 功能模块组织 ====================
// components/button.js
export const Button = () => {};
export const ButtonGroup = () => {};

// components/input.js
export const Input = () => {};
export const TextArea = () => {};

// components/index.js
export * as Button from './button.js';
export * as Input from './input.js';
export { default as Modal } from './modal.js';

// 使用
import { Button, Input, Modal } from './components';
const btn = new Button.Button();
const input = new Input.Input();

// ==================== 示例 4: 与具名导出结合 ====================
// constants.js
export const API_URL = 'https://api.example.com';
export const TIMEOUT = 5000;

// services.js
export * as constants from './constants.js';
export const fetchUser = () => {};
export const fetchPosts = () => {};

// 使用
import { constants, fetchUser } from './services.js';
console.log(constants.API_URL);

// ==================== 示例 5: 库的重新导出 ====================
// lodash-wrapper.js
export * as array from 'lodash/array.js';
export * as object from 'lodash/object.js';
export * as string from 'lodash/string.js';

// 使用
import { array, object } from './lodash-wrapper.js';
array.chunk([1, 2, 3, 4], 2);

// ==================== 示例 6: 动态命名空间（结合动态导入） ====================
// dynamic-loader.js
export async function loadNamespace(path) {
  const module = await import(path);
  return module;
}

// 虽然不是 export * as，但可以达到类似效果
// 真正的动态需要运行时代码

// ==================== 示例 7: TypeScript 命名空间 ====================
// types/math.d.ts
export interface Point { x: number; y: number; }
export interface Vector { dx: number; dy: number; }

// types/index.ts
export * as Math from './math';
export * as String from './string';

// 使用
import { Math } from './types';
const point: Math.Point = { x: 1, y: 2 };

// ==================== 示例 8: 条件导出 ====================
// config/index.js
export * as development from './development.js';
export * as production from './production.js';

// main.js
import { development, production } from './config/index.js';

const config = process.env.NODE_ENV === 'production'
  ? production
  : development;
```

### 8.6 常见陷阱

| 陷阱 | 错误示例 | 正确写法 |
|------|----------|----------|
| **与 export * 混淆** | `export * from './mod'` 重新导出所有 | `export * as ns from './mod'` 导出命名空间 |
| **命名冲突** | 多个 export * as 使用相同名 | 使用不同标识符名 |
| **默认导出访问** | `import { default } from './mod'` | `ns.default` |
| **循环引用** | A export * as B from B | 避免循环引用 |

```javascript
// 陷阱 1: export * 与 export * as 的区别
// utils.js - 导出 a, b, c

// index1.js - 重新导出所有 (展开)
export * from './utils.js';
// 导入方: import { a, b, c } from './index1.js';

// index2.js - 导出为命名空间
export * as utils from './utils.js';
// 导入方: import { utils } from './index2.js';
//         utils.a, utils.b, utils.c

// 陷阱 2: 默认导出在命名空间中
// mod.js
export const named = 1;
export default class Foo {}

// index.js
export * as mod from './mod.js';

// 使用
import { mod } from './index.js';
console.log(mod.named);     // 1
console.log(mod.default);   // Foo 类

// 陷阱 3: 命名冲突
// index.js
export * as utils from './utils.js';
export * as utils from './other-utils.js'; // Error: Duplicate export

// 解决: 使用不同名称
export * as utils from './utils.js';
export * as otherUtils from './other-utils.js';

// 陷阱 4: 不能同时 export * 和 export * as
// 但可以组合
export * from './utils.js';           // 展开所有导出
export * as more from './more.js';    // 导出为命名空间

// 陷阱 5: 不能直接修改导出的命名空间
// index.js
export * as config from './config.js';

// config.js 修改后，命名空间对象会反映变化
// 但不应该在导入方修改命名空间

// 陷阱 6: Tree Shaking 影响
// export * as 可能导致整个模块被包含
// 打包工具优化可能不如具名导出

// 陷阱 7: 循环引用检测困难
// a.js
export * as b from './b.js';

// b.js
export * as a from './a.js';
// 可能导致循环引用错误
```

---

## 附录：ES2020 特性速查表

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ES2020 特性总结                             │
├─────────────────────────┬───────────────────────────────────────────┤
│ 动态 import()           │ 运行时模块加载，返回 Promise              │
│                         │ import('./module.js')                     │
├─────────────────────────┼───────────────────────────────────────────┤
│ 空值合并运算符 ??       │ 仅对 null/undefined 使用默认值            │
│                         │ value ?? defaultValue                     │
├─────────────────────────┼───────────────────────────────────────────┤
│ 可选链操作符 ?.         │ 安全访问嵌套属性，短路返回 undefined      │
│                         │ obj?.prop?.method?.()                     │
├─────────────────────────┼───────────────────────────────────────────┤
│ globalThis              │ 统一的全局对象引用                        │
│                         │ 跨环境: 浏览器/Node.js/Worker             │
├─────────────────────────┼───────────────────────────────────────────┤
│ Promise.allSettled      │ 等待所有 Promise，永不失败                │
│                         │ 返回 [{status, value/reason}]             │
├─────────────────────────┼───────────────────────────────────────────┤
│ for-in 枚举顺序         │ 标准化: 整数索引 → 字符串 → Symbol        │
│                         │ 与 Object.keys 顺序一致                   │
├─────────────────────────┼───────────────────────────────────────────┤
│ import.meta             │ 模块元数据对象                            │
│                         │ import.meta.url, 可扩展                   │
├─────────────────────────┼───────────────────────────────────────────┤
│ export * as ns          │ 命名空间重新导出                          │
│                         │ export * as utils from './utils.js'       │
└─────────────────────────┴───────────────────────────────────────────┘
```

**兼容性提示**:

- ES2020 特性在现代浏览器（Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+）中原生支持
- Node.js 14+ 支持所有 ES2020 特性
- 对于旧环境，使用 Babel 或 TypeScript 编译

**最佳实践**:

1. 使用 `??` 而非 `||` 进行 nullish 检查
2. 使用 `?.` 简化嵌套属性访问
3. 使用 `globalThis` 编写跨环境代码
4. 使用 `Promise.allSettled` 处理批量操作结果
5. 使用 `import()` 实现代码分割和懒加载
6. 使用 `import.meta.url` 解析相对资源路径

---

*文档生成时间: 2026-04-08*
*适用于 ES2020 (ECMAScript 11th Edition)*
