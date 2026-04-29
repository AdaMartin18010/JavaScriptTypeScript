# 控制流

> JavaScript 控制流结构：条件、循环、异常处理。

---

## 条件语句

```javascript
if (condition) { /* ... */ }
else if (other) { /* ... */ }
else { /* ... */ }

// 三元运算符
const result = condition ? a : b

// 短路求值
const value = obj?.property ?? 'default'
```

## 循环

```javascript
for (let i = 0; i < n; i++) { /* ... */ }
for (const item of iterable) { /* ... */ }
for (const key in object) { /* ... */ }
while (condition) { /* ... */ }
```

## 异常处理

```javascript
try {
  riskyOperation()
} catch (error) {
  if (error instanceof TypeError) { /* ... */ }
} finally {
  cleanup()
}
```

---

*最后更新: 2026-04-29*
