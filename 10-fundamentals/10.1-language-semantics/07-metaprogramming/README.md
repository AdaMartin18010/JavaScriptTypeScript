# 元编程

> JavaScript 元编程特性：Proxy、Reflect、装饰器与符号。

---

## Proxy

```javascript
const handler = {
  get(target, prop) {
    return prop in target ? target[prop] : 'default'
  }
}
const proxy = new Proxy({}, handler)
```

## Reflect

```javascript
Reflect.get(obj, 'property')
Reflect.set(obj, 'property', value)
Reflect.has(obj, 'property')
```

## 装饰器（Stage 3）

```javascript
class Example {
  @logged
  greet() { return 'Hello' }
}
```

---

*最后更新: 2026-04-29*
