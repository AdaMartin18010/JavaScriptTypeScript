# 内部方法与内部槽

> ECMAScript 对象的底层机制：[[Get]]、[[Set]]、[[Call]] 等
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 内部方法（Internal Methods）

所有对象必须实现以下内部方法：

| 内部方法 | 用途 |
|---------|------|
| [[GetPrototypeOf]] | 获取原型 |
| [[SetPrototypeOf]] | 设置原型 |
| [[IsExtensible]] | 是否可扩展 |
| [[PreventExtensions]] | 阻止扩展 |
| [[GetOwnProperty]] | 获取自有属性 |
| [[DefineOwnProperty]] | 定义属性 |
| [[HasProperty]] | 检查属性 |
| [[Get]] | 获取属性值 |
| [[Set]] | 设置属性值 |
| [[Delete]] | 删除属性 |
| [[OwnPropertyKeys]] | 获取自有属性键 |

---

## 2. 内部槽（Internal Slots）

内部槽是对象的内部状态，不可从 JavaScript 访问：

### 2.1 函数的额外内部槽

| 内部槽 | 用途 |
|--------|------|
| [[Environment]] | 函数创建时的词法环境（闭包） |
| [[FormalParameters]] | 形参列表 |
| [[ECMAScriptCode]] | 函数体代码 |
| [[ThisMode]] | lexical / strict / global |
| [[FunctionKind]] | normal / classConstructor / generator |

---

## 3. Proxy 与内部方法

Proxy 可以拦截内部方法的调用：

```javascript
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
});
```

---

**参考规范**：ECMA-262 §6.1.7.2 Object Internal Methods and Internal Slots
