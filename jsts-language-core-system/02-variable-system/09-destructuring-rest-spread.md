# 解构、Rest 与 Spread

> 结构化数据提取、剩余参数收集与对象/数组展开
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 数组解构

```javascript
const [a, b, c] = [1, 2, 3];
// a=1, b=2, c=3

const [first, ...rest] = [1, 2, 3, 4];
// first=1, rest=[2, 3, 4]

const [x = 10, y = 20] = [1];
// x=1, y=20

// 跳过元素
const [, , third] = [1, 2, 3];
// third=3
```

---

## 2. 对象解构

```javascript
const { name, age } = { name: "Alice", age: 30 };
// name="Alice", age=30

const { name: userName, age: userAge } = { name: "Bob", age: 25 };
// userName="Bob", userAge=25

const { a = 1, b = 2 } = { a: 10 };
// a=10, b=2

// 嵌套解构
const { user: { profile: { email } } } = { user: { profile: { email: "a@b.com" } } };
```

---

## 3. Rest 语法

### 3.1 函数参数

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6
```

### 3.2 解构中的 Rest

```javascript
const [first, ...rest] = [1, 2, 3];
const { a, ...others } = { a: 1, b: 2, c: 3 };
// others = { b: 2, c: 3 }
```

---

## 4. Spread 语法

### 4.1 数组展开

```javascript
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

const merged = [...arr1, ...arr2];
```

### 4.2 对象展开

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 对象合并（后面的覆盖前面的）
const config = { ...defaults, ...userOptions };
```

### 4.3 函数调用

```javascript
const nums = [1, 2, 3];
Math.max(...nums); // 3
```

---

## 5. 实际应用模式

```javascript
// React 组件解构 props
function UserCard({ name, email, avatar, ...rest }) {
  return <div {...rest}>{name}</div>;
}

// 配置合并
const createConfig = (options) => ({
  host: "localhost",
  port: 3000,
  ...options
});

// 数组去重
const unique = [...new Set(array)];
```

---

## 6. 性能考虑

```javascript
// Spread 展开大数组会创建新数组
const huge = new Array(100000);
const copy = [...huge]; // 创建 100000 元素的新数组

// 对超大数组，考虑使用 slice
const copy2 = huge.slice();
```

## 7. 嵌套解构与重命名

```javascript
// 深层嵌套 + 重命名
const {
  data: {
    user: { name: userName, email: userEmail } = {}
  } = {}
} = apiResponse;

// 数组嵌套
const [[a, b], [c, d]] = [[1, 2], [3, 4]];
```

## 8. 解构与默认值的组合

```javascript
function createUser({
  name = "Anonymous",
  age = 0,
  role = "user",
  permissions = []
} = {}) {
  return { name, age, role, permissions };
}

createUser(); // { name: "Anonymous", age: 0, role: "user", permissions: [] }
createUser({ name: "Alice" }); // { name: "Alice", age: 0, role: "user", permissions: [] }
```

## 9. 常见陷阱

```javascript
// ❌ 解构 null/undefined
const { a } = null; // TypeError

// ✅ 使用默认值
const { a } = null ?? {}; // 安全

// ❌ Rest 必须是最后一个
const [a, ...rest, b] = [1, 2, 3]; // SyntaxError

// ❌ 对象 Rest 复制引用
const obj = { nested: { value: 1 } };
const { nested } = obj;
nested.value = 2;
console.log(obj.nested.value); // 2（浅拷贝）
```

## 10. 解构在 TypeScript 中的应用

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

function processUser({ id, name, email = "no-email" }: User) {
  console.log(id, name, email);
}

// 泛型解构
function first<T>([head, ...tail]: T[]): T | undefined {
  return head;
}
```

## 11. ES2025 的新展开特性

```javascript
// 正则匹配结果的命名解构
const { groups: { year, month, day } } = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/.exec("2024-03-15");

// Iterator Helpers 与解构
const [first, second] = [1, 2, 3, 4, 5].values().take(2);
```

## 12. 性能优化

```javascript
// 小数组展开开销可忽略
const a = [1, 2];
const b = [...a, 3]; // 快

// 大数组避免重复展开
const huge = new Array(10000);
// ❌ 多次展开
const x = [...huge];
const y = [...huge];
// ✅ 复用
const copy = [...huge];
const x2 = copy;
```

## 13. 解构的错误处理

```javascript
// 解构 null/undefined 会抛出 TypeError
try {
  const { a } = null;
} catch (e) {
  console.log(e instanceof TypeError); // true
}

// 安全解构
default function safeDestructure(obj) {
  const { a = 1, b = 2 } = obj ?? {};
  return { a, b };
}
```

---

**参考规范**：ECMA-262 §13.3.3 Destructuring Binding Patterns | ECMA-262 §13.2 Spread Element

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
