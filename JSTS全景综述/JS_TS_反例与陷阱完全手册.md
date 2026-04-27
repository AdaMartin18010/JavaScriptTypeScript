---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript / TypeScript 反例与陷阱完全手册

> 收集所有常见错误、反模式和陷阱，附带修复方案

---

## 目录

- [JavaScript / TypeScript 反例与陷阱完全手册](#javascript--typescript-反例与陷阱完全手册)
  - [目录](#目录)
  - [1. 类型系统陷阱](#1-类型系统陷阱)
    - [1.1 any 类型的滥用](#11-any-类型的滥用)
    - [1.2 类型断言的误用](#12-类型断言的误用)
    - [1.3 协变/逆变陷阱](#13-协变逆变陷阱)
  - [2. 异步编程陷阱](#2-异步编程陷阱)
    - [2.1 Promise 常见错误](#21-promise-常见错误)
    - [2.2 Event Loop 误解](#22-event-loop-误解)
  - [3. 作用域与闭包陷阱](#3-作用域与闭包陷阱)
    - [3.1 var 和变量提升](#31-var-和变量提升)
    - [3.2 this 绑定陷阱](#32-this-绑定陷阱)
    - [3.3 闭包内存泄漏](#33-闭包内存泄漏)
  - [4. 对象操作陷阱](#4-对象操作陷阱)
    - [4.1 原型链污染](#41-原型链污染)
    - [4.2 属性遍历陷阱](#42-属性遍历陷阱)
  - [5. 模块系统陷阱](#5-模块系统陷阱)
    - [5.1 ESM vs CJS 混淆](#51-esm-vs-cjs-混淆)
    - [5.2 动态导入陷阱](#52-动态导入陷阱)
  - [6. 数字和计算陷阱](#6-数字和计算陷阱)
    - [6.1 浮点数精度](#61-浮点数精度)
    - [6.2 BigInt 误用](#62-bigint-误用)
  - [7. 正则表达式陷阱](#7-正则表达式陷阱)
  - [8. TypeScript 特有陷阱](#8-typescript-特有陷阱)
    - [8.1 类型缩小失效](#81-类型缩小失效)
    - [8.2 枚举陷阱](#82-枚举陷阱)
  - [9. 错误处理陷阱](#9-错误处理陷阱)
  - [10. 安全检查清单](#10-安全检查清单)
    - [代码审查清单](#代码审查清单)
    - [运行时安全检查](#运行时安全检查)

## 1. 类型系统陷阱

### 1.1 any 类型的滥用

```typescript
// ❌ 坏: 隐式 any
function process(data) {  // 隐式 any!
    return data.value;
}

// ❌ 坏: 显式 any 逃避类型检查
function processAny(data: any) {
    return data.nonExistent;  // 不会报错!
}

// ✅ 好: 使用 unknown + 类型守卫
function processUnknown(data: unknown) {
    if (typeof data === 'object' && data !== null && 'value' in data) {
        return (data as { value: unknown }).value;
    }
    throw new Error('Invalid data');
}

// ✅ 更好: 定义具体类型
interface Data {
    value: string;
}
function processTyped(data: Data) {
    return data.value;  // 类型安全
}
```

### 1.2 类型断言的误用

```typescript
// ❌ 坏: 危险的类型断言
interface User {
    name: string;
    age: number;
}
const user = JSON.parse(jsonString) as User;
// 运行时可能是任何东西!

// ❌ 坏: 双重断言
const value = something as unknown as SpecificType;

// ✅ 好: 使用类型守卫
type UnknownUser = {
    name?: unknown;
    age?: unknown;
};

function isUser(obj: unknown): obj is User {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'name' in obj &&
        typeof (obj as UnknownUser).name === 'string' &&
        'age' in obj &&
        typeof (obj as UnknownUser).age === 'number'
    );
}

const parsed = JSON.parse(jsonString);
if (isUser(parsed)) {
    console.log(parsed.name);  // 类型安全
}

// ✅ 更好: 使用验证库 (Zod)
import { z } from 'zod';
const UserSchema = z.object({
    name: z.string(),
    age: z.number()
});
const user = UserSchema.parse(JSON.parse(jsonString));
```

### 1.3 协变/逆变陷阱

```typescript
// ❌ 坏: 协变数组 (看似安全实际危险)
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

const dogs: Dog[] = [{ name: 'Rex', bark: () => {} }];
const animals: Animal[] = dogs;  // TypeScript允许协变
animals.push({ name: 'Cat' });   // 实际上添加了非Dog到dogs数组!

// ✅ 好: 使用 readonly 防止修改
const animalsReadonly: readonly Animal[] = dogs;
// animalsReadonly.push(...)  // 编译错误

// ❌ 坏: 函数参数逆变
let processDog: (dog: Dog) => void = (dog) => dog.bark();
let processAnimal: (animal: Animal) => void = (animal) => console.log(animal.name);

processDog = processAnimal;  // TypeScript允许，但危险!
processDog({ name: 'Test' } as Dog);  // 运行时错误: bark不存在

// ✅ 好: 使用严格函数类型检查
// tsconfig.json: "strictFunctionTypes": true
```

---

## 2. 异步编程陷阱

### 2.1 Promise 常见错误

```typescript
// ❌ 坏: 忘记 await
async function fetchData() {
    const response = fetch('/api/data');  // 忘记 await!
    return response.json();  // 在 Promise 上调用 json()
}

// ❌ 坏: 混合 async 和回调
async function mixedPattern() {
    setTimeout(async () => {
        await doSomething();  // 错误处理困难
    }, 1000);
}

// ✅ 好: 统一使用 async/await
async function fetchDataFixed() {
    const response = await fetch('/api/data');
    return response.json();
}

// ✅ 好: 使用 Promise 包装回调
async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function properDelay() {
    await delay(1000);
    await doSomething();
}

// ❌ 坏: 并行执行的错误处理
const [users, posts] = await Promise.all([
    fetchUsers(),  // 可能失败
    fetchPosts()   // 可能失败
]);
// 如果 fetchUsers 失败，fetchPosts 的错误被忽略!

// ✅ 好: 分别处理错误
const [usersResult, postsResult] = await Promise.allSettled([
    fetchUsers(),
    fetchPosts()
]);

if (usersResult.status === 'fulfilled') {
    console.log(usersResult.value);
} else {
    console.error('Users failed:', usersResult.reason);
}
```

### 2.2 Event Loop 误解

```javascript
// ❌ 坏: 微任务中的死循环
function microtaskLoop() {
    Promise.resolve().then(() => {
        console.log('Microtask');
        Promise.resolve().then(microtaskLoop);  // 永远不会执行宏任务!
    });
}

// ❌ 坏: 误解执行顺序
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 预期: 1, 4, 3, 2
// 但新手经常认为: 1, 2, 3, 4

// ✅ 好: 理解执行顺序
console.log('Sync 1');
queueMicrotask(() => console.log('Microtask'));
setTimeout(() => console.log('Macrotask'), 0);
console.log('Sync 2');
// 输出: Sync 1, Sync 2, Microtask, Macrotask
```

---

## 3. 作用域与闭包陷阱

### 3.1 var 和变量提升

```javascript
// ❌ 坏: var 的变量提升
function hoistingProblem() {
    console.log(x);  // undefined，不会报错!
    var x = 5;
    console.log(x);  // 5
}

// 实际执行:
// function hoistingProblem() {
//     var x;  // 提升到顶部
//     console.log(x);  // undefined
//     x = 5;
//     console.log(x);
// }

// ❌ 坏: 循环中的 var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// 输出: 3, 3, 3 (不是 0, 1, 2)

// ✅ 好: 使用 let/const
function noHoistingProblem() {
    // console.log(x);  // ReferenceError!
    let x = 5;
    console.log(x);
}

for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// 输出: 0, 1, 2
```

### 3.2 this 绑定陷阱

```javascript
// ❌ 坏: 箭头函数和 this
const obj = {
    name: 'Object',
    regularMethod: function() {
        console.log(this.name);  // 'Object'
    },
    arrowMethod: () => {
        console.log(this.name);  // undefined (继承外层this)
    }
};

// ❌ 坏: 回调中的 this
class User {
    name = 'User';

    fetchData() {
        fetch('/api/data')
            .then(function(response) {
                console.log(this.name);  // undefined!
                return response.json();
            });
    }
}

// ✅ 好: 使用箭头函数保持 this
class UserFixed {
    name = 'User';

    fetchData() {
        fetch('/api/data')
            .then(response => {
                console.log(this.name);  // 'User'
                return response.json();
            });
    }
}

// ✅ 好: 显式绑定
class UserExplicit {
    name = 'User';

    fetchData() {
        fetch('/api/data')
            .then(function(response) {
                console.log(this.name);
            }.bind(this));
    }
}
```

### 3.3 闭包内存泄漏

```javascript
// ❌ 坏: 闭包捕获大对象
function createProcessor() {
    const largeData = new Array(1_000_000).fill('data');

    return function process(index) {
        // 只使用 largeData 的一小部分
        return largeData[index % 10];  // 但整个数组被保留!
    };
}

const processor = createProcessor();
// largeData 永远不会被释放

// ✅ 好: 只保留需要的数据
function createProcessorFixed() {
    const largeData = new Array(1_000_000).fill('data');
    const smallSlice = largeData.slice(0, 10);  // 只复制需要的部分

    return function process(index) {
        return smallSlice[index % 10];
    };
}

// ✅ 更好: 使用 WeakRef (ES2021)
function createProcessorWeak() {
    const largeData = new Array(1_000_000).fill('data');
    const ref = new WeakRef(largeData);

    return function process(index) {
        const data = ref.deref();
        if (data) {
            return data[index % 10];
        }
        return null;  // 数据已被回收
    };
}
```

---

## 4. 对象操作陷阱

### 4.1 原型链污染

```javascript
// ❌ 坏: 不安全的对象合并
function merge(target, source) {
    for (const key in source) {
        target[key] = source[key];  // 危险!
    }
    return target;
}

// 攻击: JSON.parse 后合并
const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
const user = {};
merge(user, maliciousPayload);
// 现在所有对象的 isAdmin 都是 true!

// ✅ 好: 使用 Object.create(null) 或 Map
function mergeSafe(target, source) {
    const safeTarget = Object.create(null);
    Object.assign(safeTarget, target);

    for (const key of Object.keys(source)) {
        if (key === '__proto__' || key === 'constructor') {
            continue;  // 拒绝危险键
        }
        safeTarget[key] = source[key];
    }
    return safeTarget;
}

// ✅ 更好: 使用 Object.freeze 保护原型
Object.freeze(Object.prototype);
```

### 4.2 属性遍历陷阱

```javascript
// ❌ 坏: for...in 遍历继承属性
const obj = { a: 1, b: 2 };
Object.prototype.c = 3;  // 不要这样做!

for (const key in obj) {
    console.log(key);  // 'a', 'b', 'c' - 包含继承属性!
}

// ✅ 好: 使用 hasOwnProperty 检查
for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
        console.log(key);  // 'a', 'b'
    }
}

// ✅ 更好: 使用 Object.keys 或 Object.entries
Object.keys(obj).forEach(key => {
    console.log(key);  // 只包含自身可枚举属性
});

// ✅ 最好: 使用 Object.hasOwn (ES2022)
for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
        console.log(key);
    }
}
```

---

## 5. 模块系统陷阱

### 5.1 ESM vs CJS 混淆

```javascript
// ❌ 坏: 混合使用导入语法
// ESM 文件中使用 require()
import { foo } from './foo';
const bar = require('./bar');  // 错误!

// ❌ 坏: 循环依赖
// a.js
import { b } from './b.js';
export const a = 'a';

// b.js
import { a } from './a.js';  // 循环依赖!
export const b = 'b';

// ✅ 好: 统一使用 ESM
import { foo } from './foo.js';
import { bar } from './bar.js';

// ✅ 好: 解决循环依赖 - 使用函数延迟访问
// a.js
import { getB } from './b.js';
export const a = 'a';
export function useB() {
    return getB();  // 运行时访问
}

// b.js
import { a } from './a.js';
export const b = 'b';
export const getB = () => b;
```

### 5.2 动态导入陷阱

```typescript
// ❌ 坏: 动态导入路径无法分析
const moduleName = getUserInput();  // 用户输入!
const module = await import(`./${moduleName}`);  // 安全风险!

// ❌ 坏: 忘记处理加载错误
const heavyModule = await import('./heavy-module');  // 可能失败!
heavyModule.doSomething();

// ✅ 好: 白名单限制动态导入
const ALLOWED_MODULES = ['module-a', 'module-b'] as const;
type AllowedModule = typeof ALLOWED_MODULES[number];

async function loadModule(name: AllowedModule) {
    if (!ALLOWED_MODULES.includes(name)) {
        throw new Error('Module not allowed');
    }
    // 类型安全的路径
    const module = await import(`./modules/${name}.js`);
    return module;
}

// ✅ 好: 错误处理
async function loadWithFallback() {
    try {
        const module = await import('./optional-module');
        return module;
    } catch (error) {
        console.warn('Optional module not available, using fallback');
        return { doSomething: () => 'fallback' };
    }
}
```

---

## 6. 数字和计算陷阱

### 6.1 浮点数精度

```javascript
// ❌ 坏: 浮点数比较
0.1 + 0.2 === 0.3;  // false!
0.1 + 0.2;  // 0.30000000000000004

// ❌ 坏: 浮点数累加误差
let sum = 0;
for (let i = 0; i < 10; i++) {
    sum += 0.1;
}
sum;  // 0.9999999999999999，不是 1!

// ✅ 好: 使用 epsilon 比较
const EPSILON = 1e-10;
function floatEquals(a, b) {
    return Math.abs(a - b) < EPSILON;
}
floatEquals(0.1 + 0.2, 0.3);  // true

// ✅ 好: 使用整数运算 (金额计算)
// 将元转换为分
const price = 19.99;
const priceInCents = Math.round(price * 100);  // 1999
const total = priceInCents * quantity;  // 整数运算
const finalPrice = total / 100;  // 转回元

// ✅ 更好: 使用 BigInt 或 decimal 库
const price1 = 1999n;  // BigInt
const price2 = 2999n;
const sum = price1 + price2;  // 4998n
```

### 6.2 BigInt 误用

```javascript
// ❌ 坏: BigInt 和 Number 混合运算
1n + 2;  // TypeError!

// ❌ 坏: JSON 序列化
const data = { value: 100n };
JSON.stringify(data);  // TypeError!

// ✅ 好: 显式转换
1n + BigInt(2);  // 3n
Number(1n) + 2;  // 3

// ✅ 好: 自定义 toJSON
const dataSafe = {
    value: 100n,
    toJSON() {
        return { value: this.value.toString() };
    }
};
JSON.stringify(dataSafe);  // '{"value":"100"}'
```

---

## 7. 正则表达式陷阱

```javascript
// ❌ 坏: 正则表达式 DoS (ReDoS)
const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
// 灾难性回溯!
emailRegex.test('a'.repeat(10000) + '@b.com');  // 卡住!

// ✅ 好: 使用安全的正则
const emailRegexSafe = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// 移除导致回溯的量词组合

// ❌ 坏: 正则表达式中的特殊字符
const userInput = 'file.txt';
const regex = new RegExp(userInput);  // . 匹配任意字符!
regex.test('fileXtxt');  // true!

// ✅ 好: 转义特殊字符
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const regexSafe = new RegExp(escapeRegex(userInput));
regexSafe.test('fileXtxt');  // false
regexSafe.test('file.txt');  // true
```

---

## 8. TypeScript 特有陷阱

### 8.1 类型缩小失效

```typescript
// ❌ 坏: 类型守卫在解构后失效
interface Square {
    kind: 'square';
    size: number;
}
interface Circle {
    kind: 'circle';
    radius: number;
}
type Shape = Square | Circle;

function area(shape: Shape): number {
    const { kind } = shape;
    if (kind === 'square') {
        // shape 被正确缩小为 Square
        return shape.size * shape.size;
    }
    // shape 被缩小为 Circle
    return Math.PI * shape.radius ** 2;
}

// ❌ 坏: 解构后类型信息丢失
function areaBad(shape: Shape): number {
    const { kind, size, radius } = shape;  // size 和 radius 都是 number | undefined
    if (kind === 'square') {
        return size * size;  // 错误! size 可能是 undefined
    }
    return Math.PI * radius ** 2;  // 错误!
}

// ✅ 好: 在类型守卫后解构
function areaGood(shape: Shape): number {
    if (shape.kind === 'square') {
        const { size } = shape;  // size 是 number
        return size * size;
    }
    const { radius } = shape;  // radius 是 number
    return Math.PI * radius ** 2;
}
```

### 8.2 枚举陷阱

```typescript
// ❌ 坏: 数字枚举的反向映射
enum Status {
    Active = 1,
    Inactive = 2
}

// 危险的反向映射
const status = Status[999];  // undefined，但不会报错!

// ❌ 坏: 字符串枚举的不可变性
const statusString = 'ACTIVE';
if (statusString === Status.Active) {  // 错误比较
    // ...
}

// ✅ 好: 使用 const 断言的对象
const Status = {
    Active: 'ACTIVE',
    Inactive: 'INACTIVE'
} as const;
type Status = typeof Status[keyof typeof Status];

// 现在 Status 是联合类型 'ACTIVE' | 'INACTIVE'
function handleStatus(status: Status) {
    // 完整的类型安全
}

// ✅ 好: 如果必须使用枚举，启用 const 枚举
const enum StatusConst {
    Active = 1,
    Inactive = 2
}
// 编译时内联，无运行时开销
```

---

## 9. 错误处理陷阱

```typescript
// ❌ 坏: 捕获所有错误但不处理
try {
    await riskyOperation();
} catch (e) {
    // 什么都不做!
}

// ❌ 坏: 丢失错误上下文
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        return response.json();
    } catch (e) {
        throw new Error('Failed to fetch data');  // 丢失原始错误!
    }
}

// ✅ 好: 保留错误链
async function fetchDataFixed() {
    try {
        const response = await fetch('/api/data');
        return response.json();
    } catch (e) {
        throw new Error('Failed to fetch data', { cause: e });
    }
}

// ✅ 好: 类型安全的错误处理
class NetworkError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
    }
}

async function fetchWithTypeSafety(): Promise<Data> {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new NetworkError('Request failed', response.status);
        }
        return response.json();
    } catch (e) {
        if (e instanceof NetworkError) {
            console.error(`Network error: ${e.statusCode}`);
        } else if (e instanceof TypeError) {
            console.error('Connection failed');
        }
        throw e;
    }
}
```

---

## 10. 安全检查清单

### 代码审查清单

- [ ] 没有隐式或显式的 `any` 类型
- [ ] 所有异步操作都有适当的错误处理
- [ ] 没有 `var`，使用 `let` 或 `const`
- [ ] 事件监听器有对应的移除逻辑
- [ ] 没有循环依赖
- [ ] 敏感操作有输入验证
- [ ] 没有危险的正则表达式
- [ ] 浮点数比较使用 epsilon
- [ ] 闭包没有意外捕获大对象
- [ ] 类型断言有验证守卫

### 运行时安全检查

- [ ] 启用严格模式 (`"use strict"` 或 ES 模块)
- [ ] Content Security Policy (CSP) 配置
- [ ] 原型污染防护 (冻结 Object.prototype)
- [ ] 正则表达式超时保护
- [ ] 递归深度限制
- [ ] 内存使用监控

---

*本文档整理了 JavaScript/TypeScript 开发中最常见的陷阱和反模式，建议定期回顾以避免常见问题。*
