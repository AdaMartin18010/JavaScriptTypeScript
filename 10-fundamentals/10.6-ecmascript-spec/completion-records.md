# 完成记录与异常传播机制

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`

---

## 完成记录的结构

```
Completion Record {
  [[Type]]: normal | break | continue | return | throw,
  [[Value]]: any | empty,
  [[Target]]: String | empty
}
```

## 类型语义

| [[Type]] | 触发场景 | 传播行为 |
|---------|---------|---------|
| `normal` | 正常执行 | 继续下一步 |
| `break` | `break` 语句 | 跳出最近的循环/switch |
| `continue` | `continue` 语句 | 跳到最近的循环迭代 |
| `return` | `return` 语句 | 从函数返回 |
| `throw` | `throw` 语句 | 沿调用栈传播，直到 try-catch |

## ReturnIfAbrupt 模式

```
// 伪代码模式
1. 令 result 为 AbstractOperation()
2. 若 result 是 abrupt completion，返回 result
3. 令 value 为 result.[[Value]]
4. // 继续使用 value
```

## 异常传播示例

```javascript
function foo() {
  try {
    bar();
  } catch (e) {
    return 'caught';
  }
}

function bar() {
  baz();
}

function baz() {
  throw new Error('deep');
}

foo(); // 'caught'
```

规范视角的传播链：
```
baz(): throw completion
  → bar(): 未捕获，传播给 caller
    → foo(): try-catch 捕获，转为 return 'caught'
```

---

*本文件为规范基础专题的完成记录深度分析。*
