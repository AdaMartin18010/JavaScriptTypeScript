# ES2025 新特性

> **定位**：`20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2025`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

ES2025（ECMAScript 16）补齐 `Set` 的集合代数方法、引入正则表达式 `/v` 标志、`Promise.try` 同步异常捕获辅助，以及 `Iterator` 原型辅助方法，解决集合运算缺失、Unicode 属性集匹配复杂化与异步边界错误处理不一致问题。

### 1.2 形式化基础

集合代数 5 元组定义：`intersection`, `union`, `difference`, `symmetricDifference`, `isSubsetOf`/`isSupersetOf`/`isDisjointFrom` 满足数学集合论公理：

- `A.union(B) ≡ B.union(A)`（交换律）
- `A.intersection(A) ≡ A`（幂等律）

### 1.3 关键概念

| 特性 | 定义 | 关联 |
|------|------|------|
| Set 集合代数 | Set 实例上的数学集合运算方法 | 7 个新方法 |
| RegExp `v` flag | Unicode 属性类与集合运算的增强标志 | `u` 标志的演进 |
| `Promise.try` | 将同步/同步抛异常函数统一为 Promise | 异步边界处理 |

---

## 二、设计原理

### 2.1 为什么存在

社区长期依赖 lodash、immutable.js 或手写循环实现集合运算；`/u` 标志不支持字符类集合运算（如 `[\p{Letter}--[a-z]]`）；`Promise.resolve(fn())` 无法捕获同步抛出的异常。ES2025 将这些标准化。

### 2.2 特性速查表

| 特性 | 方法 / 语法 | 说明 |
|------|------------|------|
| 交集 | `setA.intersection(setB)` | 返回同时存在于 A 和 B 的元素 |
| 并集 | `setA.union(setB)` | 返回 A 或 B 中所有元素 |
| 差集 | `setA.difference(setB)` | 返回在 A 但不在 B 的元素 |
| 对称差 | `setA.symmetricDifference(setB)` | 仅存在于 A 或 B 之一的元素 |
| 子集判断 | `setA.isSubsetOf(setB)` | A 是否为 B 的子集 |
| 超集判断 | `setA.isSupersetOf(setB)` | A 是否为 B 的超集 |
| 不相交判断 | `setA.isDisjointFrom(setB)` | A 与 B 是否无共同元素 |
| RegExp `v` | `/.../v` | 支持 `\p{...}`、集合差 `--`、交集 `&&` |
| Promise.try | `Promise.try(fn)` | 同步异常 → rejected Promise |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生 Set 方法 | O(n) 优化、可读性强 | 旧运行时需 polyfill | 现代浏览器/Node ≥ 22 |
| lodash `intersection` | 兼容旧环境 | 额外依赖、无 Set 语义 | 遗留项目 |
| `/v` vs `/u` | 集合运算、嵌套类 | 学习曲线稍陡 | 复杂 Unicode 匹配 |

---

## 三、实践映射

### 3.1 从理论到代码

```js
// === Set 集合代数 ===
const frontend = new Set(['React', 'Vue', 'Angular']);
const backend  = new Set(['Node', 'React', 'Django']);

frontend.intersection(backend);      // Set { 'React' }
frontend.union(backend);             // Set { 'React', 'Vue', 'Angular', 'Node', 'Django' }
frontend.difference(backend);        // Set { 'Vue', 'Angular' }
frontend.symmetricDifference(backend); // Set { 'Vue', 'Angular', 'Node', 'Django' }

const tagsA = new Set(['js', 'ts', 'node']);
const tagsB = new Set(['js', 'deno']);
tagsA.isSubsetOf(new Set(['js', 'ts', 'node', 'bun'])); // true
tagsA.isDisjointFrom(new Set(['rust', 'go']));           // true

// === RegExp `v` flag ===
// 匹配所有字母，但排除小写 a-z
const re = /[\p{Letter}--[a-z]]/v;
re.test('A');  // true
re.test('a');  // false
re.test('中'); // true

// 多属性集合交集：匹配 Emoji 中的手势
const gesture = /[\p{Emoji}&&\p{So}]/v;
gesture.test('👍'); // true
gesture.test('A');  // false

// === Promise.try ===
// 统一处理同步和异步异常
function parseConfig(raw) {
  return Promise.try(() => JSON.parse(raw))
    .then(cfg => validate(cfg))
    .catch(err => ({ error: err.message }));
}

// 同步抛异常也会进入 catch
parseConfig('not json').then(console.log); // { error: 'Unexpected token...' }
```

### 3.2 高级代码示例

#### Set 集合代数实战：权限系统

```javascript
// roles.js — 基于 Set 集合运算的 RBAC 权限计算
const rolePermissions = {
  admin: new Set(['read', 'write', 'delete', 'manage']),
  editor: new Set(['read', 'write', 'publish']),
  viewer: new Set(['read']),
};

function effectivePermissions(roles) {
  // 并集：用户拥有任一角色的所有权限
  return roles.map(r => rolePermissions[r] || new Set())
    .reduce((acc, set) => acc.union(set), new Set());
}

function conflictingRoles(roleA, roleB) {
  // 对称差：两角色独有的权限差异
  const permsA = rolePermissions[roleA];
  const permsB = rolePermissions[roleB];
  if (!permsA || !permsB) return null;
  return permsA.symmetricDifference(permsB);
}

function canUpgradeTo(currentRoles, targetRole) {
  // 子集判断：当前权限是否为 targetRole 权限的子集
  const current = effectivePermissions(currentRoles);
  const target = rolePermissions[targetRole];
  return current.isSubsetOf(target);
}

// 使用示例
console.log(effectivePermissions(['editor', 'viewer']));
// Set { 'read', 'write', 'publish' }

console.log(canUpgradeTo(['viewer'], 'editor')); // true
console.log(canUpgradeTo(['admin'], 'editor'));  // false
```

#### RegExp `v` flag 实战：国际化输入校验

```javascript
// validators.js
// 匹配有效的国际化标识符（Unicode 字母 + 数字 + 连接符），但排除纯数字
const validIdentifier = /^[\p{Letter}\p{Mark}\p{Number}\p{Connector_Punctuation}]+$/v;
const notPureNumber = /[\p{Letter}\p{Mark}]/v;

function isValidUsername(username) {
  return validIdentifier.test(username) && notPureNumber.test(username);
}

// 集合差：匹配所有字母，但排除 ASCII 数字和 Basic Latin 之外的符号
const safeChars = /[\p{Letter}\p{Number}--[\p{ASCII}&&\p{Number}]]/v;

// 嵌套属性类：匹配中文或日文汉字，但排除日文假名
const cjkHan = /[\p{Script=Han}||\p{Script=Hani}--[\p{Script=Katakana}\p{Script=Hiragana}]]/v;

console.log(isValidUsername('赵小明'));     // true
console.log(isValidUsername('user_123'));    // true
console.log(isValidUsername('12345'));       // false（纯数字）
console.log(cjkHan.test('漢'));              // true
console.log(cjkHan.test('カタカナ'));         // false
```

#### `Promise.try` 统一异步边界

```javascript
// data-service.js
class DataService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async fetchUser(userId) {
    return Promise.try(() => {
      if (!userId || typeof userId !== 'string') {
        throw new TypeError('userId must be a non-empty string');
      }
      return this.apiClient.get(`/users/${encodeURIComponent(userId)}`);
    }).then(response => {
      if (!response.data) throw new Error('Empty response');
      return this.transformUser(response.data);
    });
  }

  transformUser(raw) {
    return Promise.try(() => ({
      id: raw.id,
      name: raw.name.trim(),
      email: raw.email.toLowerCase(),
      // 若 raw.name 不是字符串，.trim() 会抛异常，被统一捕获为 rejected Promise
    }));
  }
}

// 无论同步错误还是异步错误，都走统一的 .catch
const service = new DataService({ get: () => Promise.resolve({ data: null }) });
service.fetchUser('').catch(err => console.error('Handled:', err.message));
// → Handled: userId must be a non-empty string
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| Set 方法会修改原集合 | 所有集合代数方法返回**新 Set**，原集合不可变 |
| `/v` 完全替代 `/u` | `/v` 是 `/u` 的超集，但某些边界行为不同，迁移需测试 |
| `Promise.try` 只接受同步函数 | 也接受返回 Promise 的函数，行为等价于 `Promise.resolve().then(fn)` |

### 3.4 扩展阅读

- [ECMAScript 2025 Draft Specification](https://tc39.es/ecma262/)
- [MDN: Set.prototype.intersection](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection)
- [MDN: RegExp `v` flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets)
- [MDN: Promise.try](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try)
- [TC39 Proposal: Set Methods](https://github.com/tc39/proposal-set-methods)
- [TC39 Proposal: RegExp `v` flag](https://github.com/tc39/proposal-regexp-v-flag)
- [TC39 Proposal: Promise.try](https://github.com/tc39/proposal-promise-try)
- [V8 Blog: New in JS ES2025](https://v8.dev/features/tags/es2025)
- [Can I use — Set methods](https://caniuse.com/mdn-javascript_builtins_set_intersection)
- [Unicode Regular Expressions — unicode.org](https://unicode.org/reports/tr18/)
- `30-knowledge-base/30.1-language-evolution`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
