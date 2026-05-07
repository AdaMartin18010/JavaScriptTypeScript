---
title: 02 HTMX 高级模式
description: 掌握 HTMX 的高级模式：Out-of-Band 更新、View Transitions、历史管理、事件系统、以及复杂交互场景的设计模式。
---

# 02 HTMX 高级模式

> **前置知识**：HTMX 核心概念、HTML、基础 JavaScript
>
> **目标**：掌握 HTMX 的高级功能，能够设计复杂的超媒体交互

---

## 1. Out-of-Band (OOB) 更新

### 1.1 核心概念

OOB 更新允许服务器在响应中包含**多个 HTML 片段**，每个片段可以更新页面上的不同位置。

```html
<!-- 当前页面 -->
<div id="cart-count">3</div>
<div id="product-list">
  <!-- 产品列表 -->
</div>

<!-- 点击"加入购物车"按钮 -->
<button hx-post="/cart/add/123"
        hx-target="#product-list"
        hx-swap="innerHTML">
  加入购物车
</button>
```

```html
<!-- 服务器返回的响应（包含 OOB 内容） -->
<div id="product-list">
  <!-- 更新后的产品列表 -->
</div>

<!-- OOB 更新：更新购物车数量（id 匹配页面上的元素） -->
<div id="cart-count" hx-swap-oob="true">4</div>
```

### 1.2 多个 OOB 更新

```html
<!-- 服务器可以同时更新多个区域 -->
<div id="cart-count" hx-swap-oob="true">5</div>
<div id="cart-total" hx-swap-oob="true">¥299.00</div>
<div id="toast-message" hx-swap-oob="true">
  <div class="toast success">已添加到购物车</div>
</div>
```

### 1.3 OOB 与 hx-select 结合

```html
<!-- 从响应中选择特定元素进行 OOB 更新 -->
<div id="sidebar" hx-swap-oob="true:find .active-count">
  <!-- 只有 .active-count 会被提取并替换到 #sidebar 中的匹配元素 -->
</div>
```

---

## 2. View Transitions

### 2.1 浏览器原生 View Transitions

HTMX 2.0+ 支持浏览器的 View Transitions API：

```html
<!-- 启用 View Transitions -->
<meta name="htmx-config" content='{"viewTransition":"true"}'>

<!-- 或在特定请求上启用 -->
<div hx-get="/page/2"
     hx-target="#content"
     hx-swap="innerHTML transition:true">
  下一页（带动画过渡）
</div>
```

### 2.2 CSS View Transitions

```css
/* 定义过渡动画 */
::view-transition-old(content) {
  animation: slide-out 0.3s ease-out;
}

::view-transition-new(content) {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-20px); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### 2.3 回退方案

```javascript
// 检测 View Transitions 支持
htmx.on('htmx:noTransition', function(evt) {
  // 浏览器不支持 View Transitions，使用 CSS 动画回退
  evt.detail.target.classList.add('fade-in');
});
```

---

## 3. 历史管理

### 3.1 URL 推送与替换

```html
<!-- hx-push-url: 将请求 URL 推入浏览器历史 -->
<a hx-get="/articles/123"
   hx-target="#content"
   hx-push-url="true">
  阅读文章（URL 变为 /articles/123）
</a>

<!-- hx-push-url="false": 不推送 URL（默认） -->
<button hx-post="/api/like/123"
        hx-push-url="false">
  点赞（不改变 URL）
</button>

<!-- hx-replace-url: 替换当前历史记录（不创建新记录） -->
<form hx-post="/search"
      hx-target="#results"
      hx-replace-url="true">
  <!-- 搜索后替换 URL，不增加历史记录 -->
</form>
```

### 3.2 浏览器前进/后退

HTMX 自动处理 `popstate` 事件（浏览器前进/后退）：

```html
<!-- 配置历史缓存行为 -->
<meta name="htmx-config" content='{"historyCacheSize":"20"}'>

<!-- 禁用特定元素的历史缓存 -->
<div hx-get="/realtime-data"
     hx-target="#dashboard"
     hx-history="false">
  实时数据（不缓存历史）
</div>
```

---

## 4. HTMX 事件系统

### 4.1 生命周期事件

```javascript
// htmx:beforeRequest — 请求发送前
htmx.on('htmx:beforeRequest', function(evt) {
  console.log('请求即将发送:', evt.detail.requestConfig.path);
  // 可以在此处修改请求头或取消请求
});

// htmx:afterRequest — 请求完成后
htmx.on('htmx:afterRequest', function(evt) {
  if (evt.detail.successful) {
    console.log('请求成功');
  } else {
    console.error('请求失败:', evt.detail.xhr.status);
  }
});

// htmx:beforeSwap — 替换内容前
htmx.on('htmx:beforeSwap', function(evt) {
  // 可以修改响应内容或取消替换
  if (evt.detail.xhr.status === 404) {
    evt.detail.shouldSwap = true;
    evt.detail.target = document.getElementById('not-found');
  }
});

// htmx:afterSwap — 替换内容后
htmx.on('htmx:afterSwap', function(evt) {
  // 初始化新插入的 DOM 元素
  initializeComponents(evt.detail.target);
});

// htmx:load — 新内容加载完成（包括初始页面加载）
htmx.on('htmx:load', function(evt) {
  // 对新加载的元素执行初始化
});
```

### 4.2 自定义事件触发

```html
<!-- 通过服务器响应触发自定义事件 -->
<button hx-post="/api/action"
        hx-on::after-request="alert('操作完成')">
  执行操作
</button>

<!-- 触发自定义事件供其他组件监听 -->
<form hx-post="/api/settings"
      hx-on::after-request="
        const event = new CustomEvent('settingsUpdated', { detail: { source: 'form' } });
        document.dispatchEvent(event);
      ">
  <!-- 表单内容 -->
</form>

<!-- 监听自定义事件 -->
<div hx-get="/api/status"
     hx-trigger="settingsUpdated from:body">
  状态将在这里更新
</div>
```

---

## 5. 复杂交互模式

### 5.1 级联选择

```html
<!-- 省份选择 -->
<select name="province"
        hx-get="/api/cities"
        hx-target="#city-select"
        hx-trigger="change">
  <option value="">选择省份</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
</select>

<!-- 城市选择（由省份选择触发更新） -->
<select id="city-select" name="city">
  <option value="">先选择省份</option>
</select>

<!-- 服务器返回城市列表 -->
<!-- <option value="chaoyang">朝阳区</option> -->
<!-- <option value="haidian">海淀区</option> -->
```

### 5.2 无限滚动

```html
<div id="items-container">
  <!-- 初始项目 -->
</div>

<div hx-get="/api/items?page=2"
     hx-trigger="revealed"
     hx-target="#items-container"
     hx-swap="beforeend"
     hx-indicator="#loading">
  滚动到这里加载更多
</div>

<div id="loading" class="htmx-indicator">加载中...</div>
```

### 5.3 内联编辑

```html
<!-- 显示模式 -->
<div id="email-display"
     hx-get="/user/123/edit-email"
     hx-target="this"
     hx-swap="outerHTML"
     hx-trigger="click"
     class="editable">
  alice@example.com
</div>

<!-- 编辑模式（服务器返回） -->
<form id="email-edit"
      hx-patch="/user/123/email"
      hx-target="this"
      hx-swap="outerHTML">
  <input type="email" name="email" value="alice@example.com" autofocus>
  <button type="submit">保存</button>
  <button type="button"
          hx-get="/user/123/email-display"
          hx-target="#email-edit"
          hx-swap="outerHTML">
    取消
  </button>
</form>
```

### 5.4 模态框

```html
<!-- 触发按钮 -->
<button hx-get="/modal/content"
        hx-target="#modal-container"
        hx-swap="innerHTML"
        hx-on::after-request="document.getElementById('modal-backdrop').classList.add('active')">
  打开模态框
</button>

<!-- 模态框容器 -->
<div id="modal-backdrop" class="modal-backdrop">
  <div id="modal-container" class="modal-content"
       hx-on:click="if(event.target === this) this.closest('.modal-backdrop').classList.remove('active')">
    <!-- 模态框内容由 HTMX 加载 -->
  </div>
</div>
```

---

## 6. 安全性

### 6.1 CSRF 保护

```html
<!-- 方法 1：Meta 标签 -->
<meta name="htmx-config" content='{"includeIndicatorStyles":false}'>

<!-- 方法 2：每个请求包含 CSRF Token -->
<meta name="csrf-token" content="{{ csrf_token }}">

<script>
  document.body.addEventListener('htmx:configRequest', function(evt) {
    evt.detail.headers['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content;
  });
</script>
```

### 6.2 确认对话框

```html
<button hx-delete="/api/items/123"
        hx-confirm="确定要删除此项目吗？">
  删除
</button>

<!-- 自定义确认对话框 -->
<button hx-delete="/api/items/123"
        hx-on:click="if(!confirm('确定删除？')) event.preventDefault()">
  删除
</button>
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **OOB 目标不存在** | OOB 元素的 id 在页面上找不到 | 确保 id 匹配，或检查条件渲染 |
| **事件重复绑定** | 每次 HTMX 更新后事件处理器重复 | 使用事件委托或 `htmx:load` 初始化 |
| **View Transitions 不兼容** | 旧浏览器不支持 | 提供 CSS 动画回退 |
| **历史状态不一致** | 前进/后退后页面状态错误 | 确保服务器正确响应 HX-Request |

---

## 练习

1. 实现一个带有 OOB 更新的购物车：添加商品时同时更新购物车数量、总价和显示提示消息。
2. 实现一个带有 View Transitions 的相册：点击图片使用过渡动画打开详情。
3. 实现一个带有级联选择的表单：国家 → 省份 → 城市，每一级触发下一级的 HTMX 加载。

---

## 延伸阅读

- [HTMX Advanced Patterns](https://htmx.org/examples/)
- [HTMX Extensions](https://extensions.htmx.org/)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
