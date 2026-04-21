# this 绑定机制

> JavaScript 中最易混淆的概念：this 的四种绑定规则与优先级

---

## 内容大纲（TODO）

### 1. 四种绑定规则

- 默认绑定（Default Binding）
- 隐式绑定（Implicit Binding）
- 显式绑定（Explicit Binding）：call/apply/bind
- new 绑定（Constructor Binding）

### 2. 绑定优先级

- new > 显式 > 隐式 > 默认

### 3. 箭头函数的 this

- 词法 this（Lexical this）
- 不绑定自己的 this
- 不能作为构造函数

### 4. 严格模式影响

- 严格模式下的默认绑定
- 模块中的默认绑定

### 5. 类中的 this

- 类方法的 this
- 私有字段的 this
- 类字段箭头函数

### 6. 常见陷阱

- 回调函数中的 this 丢失
- DOM 事件处理器的 this
- 解构方法时的 this 丢失
