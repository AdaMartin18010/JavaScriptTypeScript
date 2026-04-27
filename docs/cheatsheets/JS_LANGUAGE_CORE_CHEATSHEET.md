# JavaScript / TypeScript 语言核心速查表

> 涵盖数据类型、运算符、作用域、闭包、原型链、Promise、ES2025/2026 新特性

---

## 数据类型

```typescript
// 原始类型 (Primitive)
type Primitive = string | number | bigint | boolean | symbol | null | undefined;

// 对象类型 (Object)
type Obj = object | Function | Array<any> | Date | RegExp | Map<K,V> | Set<T>;

// TypeScript 独有
type TSOnly = any | unknown | never | void | enum | tuple | literal;
```

| 类型 | 示例 | 说明 |
|------|------|------|
| `string` | `"hello"` | 不可变 UTF-16 序列 |
| `number` | `42`, `NaN`, `Infinity` | IEEE 754 双精度浮点 |
| `bigint` | `9007199254740993n` | 任意精度整数 |
| `boolean` | `true`, `false` | |
| `symbol` | `Symbol('desc')` | 唯一标识符 |
| `null` | `null` | 空值（typeof 为 object，历史 bug）|
| `undefined` | `undefined` | 未初始化 |
| `object` | `{}`, `[]`, `()=>{}` | 引用类型 |

---

## 运算符优先级（从高到低）

```
() [] .                    // 分组、属性访问
new (带参数列表)           // new Foo()
++ -- ! ~ typeof void delete  // 一元运算符
**                         // 指数运算
* / %                      // 乘除模
+ -                        // 加减
<< >> >>>                  // 位移位
< <= > >= in instanceof    // 关系运算
== != === !==              // 相等运算
& ^ |                      // 位运算
&&                         // 逻辑与
|| ??                      // 逻辑或 / 空值合并
?:                         // 条件运算符
= += -= ...                // 赋值
,                          // 逗号
```

---

## 作用域链

```javascript
// 全局作用域
const global = 'global';

function outer() {
    const outerVar = 'outer';

    function inner() {
        const innerVar = 'inner';
        console.log(innerVar);  // inner
        console.log(outerVar);  // outer（词法作用域）
        console.log(global);    // global
    }

    inner();
}
```

| 作用域类型 | ES版本 | 特性 |
|-----------|--------|------|
| 函数作用域 | ES1 | `var` 声明 |
| 块级作用域 | ES6 | `let` / `const` |
| 模块作用域 | ES6 | `import` / `export` |
| 全局作用域 | - | `window` / `globalThis` |

---

## 闭包

```typescript
function createCounter(initial = 0) {
    let count = initial;
    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count,
        reset: () => { count = initial; }
    };
}

const counter = createCounter(10);
counter.increment(); // 11
counter.getValue();  // 11
```

**闭包三要素**：

1. 函数嵌套函数
2. 内部函数引用外部变量
3. 外部函数返回内部函数（或传递引用）

---

## 原型链

```
instance → Constructor.prototype → Object.prototype → null

foo.__proto__ === Foo.prototype
Foo.prototype.__proto__ === Object.prototype
Object.prototype.__proto__ === null
```

```typescript
// 类语法（ES6+ 语法糖）
class Animal {
    constructor(public name: string) {}
    speak() { console.log(`${this.name} makes a sound`); }
}

class Dog extends Animal {
    speak() { console.log(`${this.name} barks`); }
}

const dog = new Dog('Buddy');
dog.speak(); // Buddy barks

// 原型链检查
dog instanceof Dog;     // true
dog instanceof Animal;  // true
dog instanceof Object;  // true
```

---

## Promise 生命周期

```
Pending → Fulfilled (resolve) → .then(onFulfilled)
       → Rejected  (reject)  → .catch(onRejected)
```

```typescript
// 创建
const p = new Promise<string>((resolve, reject) => {
    setTimeout(() => resolve('done'), 1000);
});

// 链式调用
p.then(result => result.toUpperCase())
 .then(upper => console.log(upper))
 .catch(err => console.error(err))
 .finally(() => console.log('cleanup'));

// 组合
Promise.all([p1, p2, p3]);      // 全部成功
Promise.race([p1, p2, p3]);     // 第一个 settled
Promise.allSettled([p1, p2]);   // 全部 settled
Promise.any([p1, p2]);          // 第一个 fulfilled
```

---

## ES2025 / ES2026 新特性速查

| 特性 | 状态 | 示例 | 文档位置 |
|------|------|------|---------|
| `Array.prototype.toSorted` | ES2023 | `[3,1,2].toSorted()` | code-lab/01 |
| `Array.prototype.toReversed` | ES2023 | `[1,2,3].toReversed()` | code-lab/01 |
| `Array.prototype.with` | ES2023 | `[1,2,3].with(1, 99)` | code-lab/01 |
| `Array.prototype.findLast` | ES2023 | `[1,2,3].findLast(x=>x>1)` | code-lab/01 |
| `Temporal API` | ES2026 Stage 4 | `Temporal.Now.instant()` | guides/temporal-api-guide |
| `Error.isError` | ES2026 Stage 4 | `Error.isError(err)` | code-lab/01 |
| `Math.sumPrecise` | ES2026 Stage 4 | `Math.sumPrecise([0.1, 0.2])` | code-lab/01 |
| `Uint8Array Base64` | ES2026 Stage 4 | `bytes.toBase64()` | code-lab/01 |

---

## TypeScript 类型体操速查

```typescript
// 常用工具类型
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Record<K extends keyof any, T> = { [P in K]: T };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// 实用自定义类型
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
type Flatten<T> = T extends Array<infer U> ? U : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
```

---

*最后更新: 2026-04-27*
*review-cycle: 6 months*
*next-review: 2026-10-27*
*status: current*
