# 暂时性死区（Temporal Dead Zone, TDZ）

> let/const 声明前的不可访问区域：机制、规范语义与实战影响
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. TDZ 的定义

**暂时性死区（TDZ）** 是变量从**作用域开始**到**声明语句执行**之间的区域。在此区域内访问变量会抛出 `ReferenceError`。

```javascript
{
  // TDZ 开始
  console.log(x); // ❌ ReferenceError: Cannot access 'x' before initialization
  let x = 10;
  // TDZ 结束
}
```

---

## 2. TDZ 的行为表现

### 2.1 `typeof` 在 TDZ 中的异常行为

通常 `typeof` 对未声明的变量返回 `"undefined"`，但对 TDZ 中的变量抛出错误：

```javascript
console.log(typeof undeclared); // "undefined"
console.log(typeof tdzVar);     // ❌ ReferenceError
let tdzVar;
```

### 2.2 访问 TDZ 变量抛出 ReferenceError

```javascript
function test() {
  console.log(a); // ❌ ReferenceError
  let a = 1;
}
```

---

## 3. TDZ 的内部机制

### 3.1 环境记录中的创建 vs 初始化

ECMAScript 规范中的绑定操作：

| 操作 | var | let | const |
|------|-----|-----|-------|
| 创建绑定（CreateBinding） | 编译阶段 | 编译阶段 | 编译阶段 |
| 初始化绑定（InitializeBinding） | 编译阶段（置为 undefined） | 执行到声明语句 | 执行到声明语句 |

### 3.2 规范算法

```
LexicalEnvironment → EnvironmentRecord → CreateMutableBinding(name, false)
// 绑定已创建，但 [[Initialized]] = false

// 执行到声明语句时：
InitializeBinding(name, value)
// [[Initialized]] = true
```

---

## 4. TDZ 与 const 的关系

TDZ 机制确保了 `const` 的**单次赋值语义**：

```javascript
// 如果没有 TDZ，以下代码可能产生歧义
const x = x + 1; // 这里的 x 是外部作用域的 x 还是当前声明的 x？
```

TDZ 确保在声明语句执行前，变量完全不可访问，避免了这种歧义。

---

## 5. 常见陷阱

### 5.1 参数默认值中的 TDZ

```javascript
function test(x = y, y = 1) {
  console.log(x, y);
}
test(); // ❌ ReferenceError: Cannot access 'y' before initialization

// 正确顺序：
function test2(y = 1, x = y) {
  console.log(x, y);
}
test2(); // ✅ 1, 1
```

### 5.2 解构赋值中的 TDZ

```javascript
const { a = b, b } = { b: 2 };
// ❌ ReferenceError: Cannot access 'b' before initialization
// a 的默认值 b 在 b 初始化前被访问
```

### 5.3 类字段初始化中的 TDZ

```javascript
class Example {
  a = 1;
  b = this.a; // ✅
  c = d;      // ❌ ReferenceError（如果 d 是后续声明的字段）
  d = 2;
}
```

---

## 6. 最佳实践

1. **声明前置**：将所有声明放在作用域顶部
2. **避免复杂的初始化依赖**：尤其是解构和参数默认值
3. **使用 lint 规则**：`eslint no-use-before-define`

---

**参考规范**：ECMA-262 §9.3.1 Declarative Environment Records | ECMA-262 §8.1.1.1.1 GetBindingValue
