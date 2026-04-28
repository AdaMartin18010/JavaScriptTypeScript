# Proxy 与 Reflect：元编程的形式化语义

> **定位**：`10-fundamentals/10.5-object-model/`
> **规范来源**：ECMA-262 §28 Proxy Object Internal Methods | §26.1 Reflect

---

## 一、核心命题

**Proxy** 是 ECMAScript 2015 引入的元编程机制，允许开发者**拦截并自定义对象的基本操作**（属性访问、赋值、函数调用等）。**Reflect** 提供了一组与 Proxy 拦截器一一对应的静态方法，作为默认行为的程序化接口。

这对机制将 JavaScript 从「只能使用语言定义的行为」推进到「可以重新定义语言行为」的层次，是框架实现响应式系统、ORM、 mocking 的核心基础设施。

---

## 二、Proxy 的形式化语义

### 2.1 Proxy 作为 exotic object

Proxy 不是普通对象（ordinary object），而是**异质对象（exotic object）**。其所有内部方法均被代理到 **handler** 对象的可选陷阱（trap）：

```
Proxy(target, handler)
  ├── target: 被包装的目标对象
  └── handler: 含陷阱方法的对象

内部方法调用流程：
  proxy.[[Get]](P, Receiver)
    → handler.get ? handler.get(target, P, Receiver)
    → 否则 target.[[Get]](P, Receiver)
```

### 2.2 陷阱与内部方法映射

| Proxy 陷阱 | 对应内部方法 | 触发场景 |
|-----------|-------------|---------|
| `get` | `[[Get]]` | `obj.prop` / `obj[prop]` |
| `set` | `[[Set]]` | `obj.prop = value` |
| `has` | `[[HasProperty]]` | `prop in obj` |
| `deleteProperty` | `[[Delete]]` | `delete obj.prop` |
| `getPrototypeOf` | `[[GetPrototypeOf]]` | `Object.getPrototypeOf` |
| `setPrototypeOf` | `[[SetPrototypeOf]]` | `Object.setPrototypeOf` |
| `apply` | `[[Call]]` | `fn()` |
| `construct` | `[[Construct]]` | `new Fn()` |
| `defineProperty` | `[[DefineOwnProperty]]` | `Object.defineProperty` |
| `getOwnPropertyDescriptor` | `[[GetOwnProperty]]` | `Object.getOwnPropertyDescriptor` |
| `ownKeys` | `[[OwnPropertyKeys]]` | `Object.keys` / `Reflect.ownKeys` |
| `preventExtensions` | `[[PreventExtensions]]` | `Object.preventExtensions` |
| `isExtensible` | `[[IsExtensible]]` | `Object.isExtensible` |

---

## 三、不变性约束（Invariants）

ECMA-262 对 Proxy 陷阱施加了**严格的不变性约束**，防止 handler 产生与目标对象不一致的行为：

### 3.1 核心不变性

| 不变性 | 说明 | 违反后果 |
|--------|------|---------|
| `[[GetPrototypeOf]]` 结果必须一致 | `Object.getPrototypeOf(proxy) === Object.getPrototypeOf(target)` | `TypeError` |
| `[[SetPrototypeOf]]` 必须同步 | 若 target 不可设原型，proxy 也必须不可设 | `TypeError` |
| `[[IsExtensible]]` 必须一致 | `Object.isExtensible(proxy) === Object.isExtensible(target)` | `TypeError` |
| `[[PreventExtensions]]` 不可逆 | 若 `preventExtensions(proxy)` 返回 true，则 `isExtensible(target)` 必须为 false | `TypeError` |
| 不可配置属性不可伪造 | 若 target 有不可配置属性 P，则 proxy 必须报告该属性存在且不可配置 | `TypeError` |
| 不可配置属性值不可变 | 若 target 有不可配置且不可写的属性 P，则 proxy 的 `get` 必须返回相同值 | `TypeError` |

### 3.2 不变性的形式化意义

这些不变性确保了 **Proxy 的透明性（Transparency）**：即使通过 Proxy 拦截，底层目标对象的**结构一致性**仍然得到保证。这是安全沙箱实现的基础。

---

## 四、Reflect 的设计哲学

### 4.1 Reflect 与 Proxy 的对偶性

```javascript
// Proxy 陷阱的默认行为 = Reflect 的对应方法
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // 默认行为：
    return Reflect.get(target, prop, receiver);
  }
});
```

**Reflect 的设计目标**：

1. **程序化默认行为**：将内部方法暴露为可调用的 API
2. **更合理的返回值**：`Reflect.set` 返回 boolean（成功/失败），而 `obj.prop = value` 返回赋值结果
3. **receiver 参数控制**：`Reflect.get(target, prop, receiver)` 可指定 `this` 绑定

### 4.2 Reflect vs Object 方法对比

| 操作 | `Object.*` | `Reflect.*` | 差异 |
|------|-----------|------------|------|
| 获取属性 | `Object.get(obj, prop)` 不存在 | `Reflect.get(obj, prop, receiver)` | 支持 receiver |
| 设置属性 | `obj.prop = value` | `Reflect.set(obj, prop, value, receiver)` | 返回 boolean |
| 定义属性 | `Object.defineProperty(obj, prop, desc)` | `Reflect.defineProperty(obj, prop, desc)` | 返回 boolean |
| 删除属性 | `delete obj.prop` | `Reflect.deleteProperty(obj, prop)` | 返回 boolean |
| 枚举键 | `Object.keys(obj)` | `Reflect.ownKeys(obj)` | 返回所有键（含 Symbol） |

---

## 五、工程模式：响应式系统的实现

### 5.1 Vue 3 Reactivity 的核心机制

```javascript
// 简化版 Vue 3 reactive 原理
const targetMap = new WeakMap();

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);  // 依赖收集
      if (isObject(result)) {
        return reactive(result);  // 递归代理
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);  // 触发更新
      }
      return result;
    }
  });
}
```

### 5.2 品牌类型（Branded Types）的运行时保护

```javascript
function createBranded(brand) {
  return new Proxy(Object.create(null), {
    get(target, key) {
      if (key === Symbol.for('brand')) return brand;
      return target[key];
    },
    set(target, key, value) {
      if (key === Symbol.for('brand')) {
        throw new TypeError('Cannot modify brand');
      }
      target[key] = value;
      return true;
    }
  });
}
```

---

## 六、性能考量

### 6.1 Proxy 的性能开销

| 维度 | 普通对象 | Proxy 代理对象 | 差距 |
|------|---------|---------------|------|
| 属性访问 | 1x | 3-10x | 陷阱调用开销 |
| 属性设置 | 1x | 5-15x | 不变性检查 + 陷阱 |
| 原型链遍历 | 1x | 无额外 | 原型链本身不受影响 |

### 6.2 V8 的 Proxy 优化

V8 对 Proxy 的优化策略：

- **无陷阱短路**：若 handler 为空对象，直接透传 target（性能接近原生）
- **陷阱内联**：热点陷阱可能被内联编译
- **Megamorphic fallback**：若陷阱频繁变化，退化为通用路径

---

## 七、批判性注意

1. **Proxy 无法拦截内部槽访问**：`[[PrivateElements]]`、私有字段 `#field` 无法通过 Proxy 拦截
2. **this 绑定陷阱**：`proxy.method()` 中的 `this` 指向 proxy 而非 target，可能导致问题
3. **结构化克隆不支持**：`structuredClone(proxy)` 会丢失 handler，只克隆 target
4. **调试复杂度**：Proxy 增加了调用栈深度，错误堆栈更难阅读

---

*本文件为对象模型专题的元编程深度分析。后续 `private-fields.md` 将分析 ES2022 私有字段的内存模型与 Proxy 的交互限制。*
