# 里程碑 1：原生 JavaScript + DOM

> 🎯 **学习目标**：不借助任何框架，用原生技术实现一个功能完整的 Todo 应用。

---

## 学习目标

完成本里程碑后，你将能够：

1. 使用现代 ES6+ 语法编写整洁的 JavaScript 代码
2. 熟练操作 DOM API（查询、创建、修改、删除元素）
3. 理解事件委托模式，避免内存泄漏
4. 使用 `localStorage` 实现数据持久化
5. 将代码拆分为独立模块（ES Modules）

---

## 前置知识

- HTML 基础标签和属性
- CSS 基础选择器和盒模型
- JavaScript 变量、函数、条件、循环

---

## 关键概念解释

### 1. 事件委托（Event Delegation）

不直接在每个 Todo 项上绑定事件，而是在父容器上统一监听。这样即使动态添加新元素，也无需重新绑定事件。

```js
// ❌ 不好的做法：每个按钮都绑定一次
deleteButtons.forEach(btn => btn.addEventListener('click', handleDelete));

// ✅ 好的做法：事件委托
todoList.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    handleDelete(e.target);
  }
});
```

### 2. 模板字符串（Template Literals）

用反引号 `` ` `` 包裹字符串，可以嵌入变量和多行文本：

```js
const html = `
  <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
    <span>${todo.text}</span>
    <button class="delete-btn">删除</button>
  </li>
`;
```

### 3. localStorage 限制

- 只能存储字符串，需要用 `JSON.stringify` / `JSON.parse` 转换
- 容量限制约 5MB
- 同步 API，大量数据时会阻塞主线程

---

## 文件结构

```
milestone-01-vanilla-js/
├── README.md
├── package.json          # 本里程碑无需安装依赖，但保留统一结构
├── index.html
└── src/
    ├── app.js            # 应用入口：初始化、事件绑定
    ├── storage.js        # localStorage 封装
    ├── dom-utils.js      # DOM 操作工具函数
    └── style.css         # 样式
```

---

## 运行方式

```bash
# 方式 1：使用 VS Code Live Server 插件
# 右键 index.html → "Open with Live Server"

# 方式 2：使用 npx serve
cd milestone-01-vanilla-js
npx serve src

# 方式 3：直接用浏览器打开 index.html（部分功能受限）
```

---

## 关键代码讲解

### `src/storage.js` — 数据持久化层

```js
const STORAGE_KEY = 'todo-master-m1';

export function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
```

**设计意图**：将存储逻辑抽离，未来更换存储方案（如 IndexedDB）时只需修改此文件。

### `src/dom-utils.js` — 渲染函数

```js
export function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = todo.id;
  li.innerHTML = `
    <input type="checkbox" class="toggle" ${todo.completed ? 'checked' : ''}>
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn">删除</button>
  `;
  return li;
}
```

**注意**：`escapeHtml` 防止 XSS 攻击，永远不要直接将用户输入插入 `innerHTML`。

---

## 常见错误排查

### ❌ 错误：`localStorage` 数据变成 `[object Object]`

**原因**：直接存储对象，而非字符串。

```js
// ❌ 错误
localStorage.setItem('todos', todos);

// ✅ 正确
localStorage.setItem('todos', JSON.stringify(todos));
```

### ❌ 错误：删除一个 Todo 后，其他按钮事件失效

**原因**：没有使用事件委托，新渲染的 DOM 没有重新绑定事件。

**解决**：见上方「事件委托」示例。

### ❌ 错误：`Cannot use import statement outside a module`

**原因**：浏览器默认将 JS 当作脚本而非模块。

**解决**：在 `index.html` 的 `<script>` 标签添加 `type="module"`：

```html
<script type="module" src="./src/app.js"></script>
```

### ❌ 错误：直接打开 `index.html` 时模块加载失败（CORS 错误）

**原因**：`file://` 协议不支持 ES Modules。

**解决**：必须使用本地服务器（Live Server、npx serve 等）。

---

## 下一步

完成本里程碑后，你已经拥有一个可运行的 Todo 应用。但你会发现：

- 没有类型提示，容易传错参数
- 重构时心里没底，不知道哪里会崩
- 多人协作时代码难以理解

这些正是 **TypeScript** 要解决的问题 → [进入里程碑 2](../milestone-02-typescript/)
