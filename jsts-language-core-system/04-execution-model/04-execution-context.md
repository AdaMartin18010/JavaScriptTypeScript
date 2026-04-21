# 执行上下文（Execution Context）

> JavaScript 代码执行的运行时环境抽象
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 执行上下文类型

ECMAScript 定义了三种执行上下文：

| 类型 | 创建时机 | 特点 |
|------|---------|------|
| 全局执行上下文 | 脚本开始时 | 只有一个，始终在栈底 |
| 函数执行上下文 | 函数被调用时 | 每次调用创建新的 |
| Eval 执行上下文 | eval() 执行时 | 受限的执行环境 |

---

## 2. 执行上下文的创建

### 2.1 创建阶段（Creation Phase）

```javascript
function example(x) {
  const y = 10;
  function inner() {}
}

example(5);
```

创建阶段完成的工作：

1. **创建词法环境（LexicalEnvironment）**
   - 创建环境记录
   - 绑定 `let`/`const`/`class` 声明（未初始化）
   - 绑定函数声明

2. **创建变量环境（VariableEnvironment）**
   - 绑定 `var` 声明（初始化为 undefined）

3. **绑定 this**
   - 根据调用方式确定 this 值

4. **绑定外层引用**
   - 指向父级词法环境

### 2.2 执行阶段（Execution Phase）

按代码顺序逐行执行，初始化变量，执行语句。

---

## 3. 执行上下文的组成

```javascript
ExecutionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: { /* let/const/class/function */ },
    OuterEnv: /* 父级词法环境 */
  },
  VariableEnvironment: {
    EnvironmentRecord: { /* var */ },
    OuterEnv: /* 父级词法环境 */
  },
  ThisBinding: /* this 值 */
}
```

---

## 4. 执行上下文栈

```javascript
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // 此时执行上下文栈：
  // [全局上下文, a 的上下文, b 的上下文, c 的上下文]
}

a();
```

---

## 5. 执行上下文的生命周期

```
1. 创建阶段
   ├── 创建词法环境
   ├── 创建变量环境
   ├── 绑定 this
   └── 绑定外层引用

2. 压入执行上下文栈

3. 执行阶段
   ├── 变量初始化
   ├── 代码执行
   └── 函数调用（创建新的执行上下文）

4. 弹栈

5. 销毁（垃圾回收）
```

---

## 6. 与作用域的关系

- **执行上下文栈**：管理代码的**调用顺序**（动态）
- **作用域链**：管理变量的**访问权限**（静态/词法）

```javascript
const x = "global";

function outer() {
  const x = "outer";
  function inner() {
    const x = "inner";
    console.log(x); // "inner"
  }
  inner();
}

outer();

// 执行上下文栈：[全局, outer, inner]
// inner 的作用域链：inner → outer → 全局
```

---

**参考规范**：ECMA-262 §9.4 Execution Contexts | ECMA-262 §9.4.1 GetActiveScriptOrModule
