---
title: 05 Alpine.js 核心
description: 深入掌握 Alpine.js 的 15 个核心指令、响应式系统、生命周期和插件生态。理解"现代 Web 的 jQuery"的设计哲学。
---

# 05 Alpine.js 核心

> **前置知识**：HTML、JavaScript 基础、DOM 操作概念
>
> **目标**：掌握 Alpine.js 的全部核心指令，能够构建轻量交互组件

---

## 1. Alpine.js 的设计哲学

### 1.1 定位

Alpine.js 的定位是**"现代 Web 的 jQuery"**：

> 为服务端渲染的页面添加轻量交互，无需构建步骤，无需虚拟 DOM，直接操作真实 DOM。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 体积 | ~7.1 KB gzipped |
| 依赖 | 零依赖 |
| 构建 | 无需构建步骤 |
| 学习曲线 | 15 个核心指令 |
| 与 Tailwind | 天然搭配（TALL Stack） |

---

## 2. x-data：响应式状态容器

### 2.1 基础用法

```html
<!-- 定义组件状态 -->
<div x-data="{ open: false, count: 0 }">
  <button @click="open = !open">
    切换面板
  </button>
  
  <div x-show="open">
    <p>这是可折叠的内容</p>
    <button @click="count++">
      点击了 <span x-text="count"></span> 次
    </button>
  </div>
</div>
```

### 2.2 函数返回数据

```html
<!-- 复杂逻辑使用函数 -->
<div x-data="dropdown()">
  <button @click="toggle">菜单</button>
  <ul x-show="open" @click.outside="close">
    <li>选项 1</li>
    <li>选项 2</li>
  </ul>
</div>

<script>
function dropdown() {
  return {
    open: false,
    toggle() { this.open = !this.open },
    close() { this.open = false },
  };
}
</script>
```

### 2.3 数据作用域

```html
<!-- 父级数据可被子级访问 -->
<div x-data="{ message: 'Hello' }">
  <p x-text="message"></p>  <!-- "Hello" -->
  
  <div x-data="{ name: 'World' }">
    <p x-text="message + ' ' + name"></p>  <!-- "Hello World" -->
    <!-- 子级可以覆盖父级同名属性 -->
    <p x-text="$parent.message"></p>  <!-- 访问父级 message（Alpine 3.13+） -->
  </div>
</div>
```

---

## 3. 显示与隐藏

### 3.1 x-show

```html
<!-- 基础显示/隐藏 -->
<div x-data="{ open: false }">
  <button @click="open = !open">切换</button>
  <div x-show="open">内容</div>
</div>

<!-- 过渡动画 -->
<div x-data="{ open: false }">
  <button @click="open = !open">切换</button>
  <div x-show="open"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 transform scale-95"
       x-transition:enter-end="opacity-100 transform scale-100"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 transform scale-100"
       x-transition:leave-end="opacity-0 transform scale-95">
    带动画的内容
  </div>
</div>
```

### 3.2 x-if

```html
<!-- x-if 完全从 DOM 中移除/添加元素（vs x-show 的 display:none） -->
<div x-data="{ user: null }">
  <template x-if="user">
    <div>
      <p x-text="user.name"></p>
      <button @click="user = null">登出</button>
    </div>
  </template>
  
  <template x-if="!user">
    <button @click="user = { name: 'Alice' }">登录</button>
  </template>
</div>
```

---

## 4. 绑定与事件

### 4.1 x-bind

```html
<div x-data="{ isActive: false, color: 'blue' }">
  <!-- 绑定类名 -->
  <div :class="{ 'active': isActive, 'inactive': !isActive }">
    状态面板
  </div>
  
  <!-- 绑定样式 -->
  <div :style="`color: ${color}`">
    动态颜色文本
  </div>
  
  <!-- 绑定属性 -->
  <img :src="`/images/${color}.png`" :alt="color">
  
  <!-- 简写语法 -->
  <div :class="isActive ? 'bg-blue-500' : 'bg-gray-200'">
    条件类名
  </div>
</div>
```

### 4.2 x-on

```html
<div x-data="{ count: 0 }">
  <!-- 点击事件 -->
  <button @click="count++">+1</button>
  
  <!-- 键盘事件 -->
  <input @keydown.enter="submit()"
         @keydown.escape="cancel()"
         placeholder="按 Enter 提交">
  
  <!-- 事件修饰符 -->
  <form @submit.prevent="handleSubmit">
    <!-- .prevent 阻止默认行为 -->
  </form>
  
  <a @click.stop="doSomething" href="#">
    <!-- .stop 阻止冒泡 -->
  </a>
  
  <div @scroll.throttle="handleScroll">
    <!-- .throttle 节流 -->
  </div>
  
  <input @input.debounce="search()">
    <!-- .debounce 防抖 -->
</div>
```

### 4.3 常用事件修饰符

| 修饰符 | 作用 |
|--------|------|
| `.prevent` | 阻止默认行为 |
| `.stop` | 阻止事件冒泡 |
| `.outside` | 点击元素外部时触发 |
| `.debounce` | 防抖 |
| `.throttle` | 节流 |
| `.once` | 只触发一次 |
| `.window` | 监听 window 事件 |
| `.document` | 监听 document 事件 |

---

## 5. 表单与双向绑定

### 5.1 x-model

```html
<div x-data="{ text: '', checked: false, selected: '', items: [] }">
  <!-- 文本输入 -->
  <input x-model="text" placeholder="输入文字">
  <p>你输入了: <span x-text="text"></span></p>
  
  <!-- 复选框 -->
  <label>
    <input type="checkbox" x-model="checked">
    同意条款
  </label>
  <p x-show="checked">已同意</p>
  
  <!-- 单选框 -->
  <select x-model="selected">
    <option value="">请选择</option>
    <option value="a">选项 A</option>
    <option value="b">选项 B</option>
  </select>
  
  <!-- 多选 -->
  <select x-model="items" multiple>
    <option value="1">项目 1</option>
    <option value="2">项目 2</option>
  </select>
  <p>选中: <span x-text="items.join(', ')"></span></p>
</div>
```

### 5.2 x-model 修饰符

```html
<div x-data="{ search: '' }">
  <!-- .debounce 防抖输入 -->
  <input x-model.debounce="search" placeholder="搜索...">
  <p>搜索: <span x-text="search"></span></p>
  
  <!-- .number 转为数字 -->
  <input type="number" x-model.number="age">
  
  <!-- .trim 去除首尾空格 -->
  <input x-model.trim="username">
  
  <!-- 组合修饰符 -->
  <input x-model.debounce.500ms="query">
</div>
```

---

## 6. 列表渲染

### 6.1 x-for

```html
<div x-data="{ items: ['苹果', '香蕉', '橙子'] }">
  <ul>
    <template x-for="item in items" :key="item">
      <li x-text="item"></li>
    </template>
  </ul>
  
  <!-- 带索引 -->
  <ul>
    <template x-for="(item, index) in items" :key="item">
      <li>
        <span x-text="index + 1"></span>. <span x-text="item"></span>
        <button @click="items.splice(index, 1)">删除</button>
      </li>
    </template>
  </ul>
  
  <!-- 对象迭代 -->
  <div x-data="{ user: { name: 'Alice', age: 30, city: 'Beijing' } }">
    <dl>
      <template x-for="(value, key) in user" :key="key">
        <div>
          <dt x-text="key"></dt>
          <dd x-text="value"></dd>
        </div>
      </template>
    </dl>
  </div>
</div>
```

### 6.2 嵌套循环

```html
<div x-data="{ categories: [
  { name: '水果', items: ['苹果', '香蕉'] },
  { name: '蔬菜', items: ['胡萝卜', '菠菜'] }
] }">
  <template x-for="category in categories" :key="category.name">
    <div>
      <h3 x-text="category.name"></h3>
      <ul>
        <template x-for="item in category.items" :key="item">
          <li x-text="item"></li>
        </template>
      </ul>
    </div>
  </template>
</div>
```

---

## 7. 文本与 HTML 渲染

### 7.1 x-text 与 x-html

```html
<div x-data="{ text: 'Hello <b>World</b>' }">
  <!-- x-text: 纯文本（安全） -->
  <p x-text="text"></p>  <!-- 显示: Hello <b>World</b> -->
  
  <!-- x-html: 渲染 HTML（注意 XSS 风险） -->
  <p x-html="text"></p>  <!-- 显示: Hello World（加粗） -->
</div>

<!-- 安全使用 x-html -->
<div x-data="{ content: '' }">
  <textarea x-model="content" placeholder="输入 Markdown..."></textarea>
  <div x-html="sanitize(marked.parse(content))"></div>
</div>
```

---

## 8. 生命周期与魔法属性

### 8.1 生命周期钩子

```html
<div x-data="{ items: [] }"
     x-init="items = await fetch('/api/items').then(r => r.json())">
  <!-- x-init: 组件初始化时执行 -->
  <ul>
    <template x-for="item in items" :key="item.id">
      <li x-text="item.name"></li>
    </template>
  </ul>
</div>
```

### 8.2 魔法属性

```html
<div x-data="{ open: false }">
  <!-- $el: 当前元素 -->
  <button @click="$el.classList.toggle('active')">
    切换自身类名
  </button>
  
  <!-- $refs: 引用元素 -->
  <input x-ref="input" placeholder="输入...">
  <button @click="$refs.input.focus()">
    聚焦输入框
  </button>
  
  <!-- $watch: 监听变化 -->
  <div x-data="{ query: '', results: [] }"
       x-init="$watch('query', value => search(value))">
    <input x-model="query" placeholder="搜索...">
    <ul>
      <template x-for="result in results" :key="result.id">
        <li x-text="result.name"></li>
      </template>
    </ul>
  </div>
  
  <!-- $store: 全局状态（需定义） -->
  <div x-data>
    <p x-text="$store.auth.user?.name ?? '未登录'"></p>
  </div>
</div>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.store('auth', {
    user: null,
    login(user) { this.user = user; },
    logout() { this.user = null; },
  });
});
</script>
```

---

## 9. 插件生态

### 9.1 常用官方插件

| 插件 | 功能 | 用法 |
|------|------|------|
| `persist` | 状态持久化到 localStorage | `x-data="$persist({ count: 0 })"` |
| `intersect` | 元素进入视口时触发 | `x-intersect="loadMore()"` |
| `resize` | 监听元素尺寸变化 | `x-resize="handleResize"` |
| `focus` | 管理焦点状态 | `x-trap="open"`（焦点陷阱） |
| `collapse` | 折叠动画 | `x-collapse` |
| `anchor` | 元素定位 | `x-anchor="$refs.button"` |

### 9.2 persist 插件示例

```html
<div x-data="$persist({ theme: 'light', sidebarOpen: true })">
  <button @click="theme = theme === 'light' ? 'dark' : 'light'"
          x-text="`当前主题: ${theme}`">
  </button>
  
  <!-- 状态会自动保存到 localStorage，刷新后恢复 -->
</div>
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **忘记 `:key`** | `x-for` 没有 key 导致更新问题 | 始终为 `x-for` 提供 `:key` |
| **x-html XSS 风险** | 渲染用户输入的 HTML | 先 sanitize，或使用 x-text |
| **嵌套 x-data 数据覆盖** | 子组件同名属性覆盖父组件 | 使用不同属性名或 `$parent` |
| **defer 加载问题** | Alpine.js 在 DOM 解析后加载 | 使用 `defer` 属性确保 DOM 就绪 |

---

## 练习

1. 实现一个完整的下拉菜单组件：使用 `x-data` 管理开关状态，`@click.outside` 关闭，`x-transition` 添加动画。
2. 实现一个待办事项列表：使用 `x-for` 渲染列表，`x-model` 双向绑定输入，支持添加/删除/标记完成。
3. 实现一个标签页组件：使用 `x-data` 管理当前标签，切换时显示对应内容。

---

## 延伸阅读

- [Alpine.js Documentation](https://alpinejs.dev/)
- [Alpine.js Plugins](https://alpinejs.dev/plugins)
- [TALL Stack](https://tallstack.dev/)
