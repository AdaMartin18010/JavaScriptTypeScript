---
title: 01 HTMX 核心概念
description: 深入理解 HTMX 的超媒体驱动架构哲学、核心 hx-* 属性、HATEOAS 原则，以及与传统 AJAX/SPA 范式的本质区别。
---

# 01 HTMX 核心概念

> **前置知识**：HTML、HTTP、基础 JavaScript
>
> **目标**：理解 HTMX 的核心哲学和属性系统，能够构建超媒体驱动的交互页面

---

## 1. HTMX 的设计哲学

### 1.1 核心命题

HTMX 的核心命题由 Carson Gross（HTMX 作者）提出：

> **"Any element, any event, any request, any target"**
>
> 任何 HTML 元素都可以响应任何事件，发起任何 HTTP 请求，并将结果更新到页面任何位置。

### 1.2 超媒体驱动 vs 数据驱动

```
传统 SPA 数据流：                    HTMX 超媒体流：
┌─────────┐                        ┌─────────┐
│ 用户点击 │                        │ 用户点击 │
└────┬────┘                        └────┬────┘
     │                                │
     ▼                                ▼
┌─────────┐                        ┌─────────┐
│ JS 处理  │                        │ hx-get  │
│ 事件     │                        │ 触发请求 │
└────┬────┘                        └────┬────┘
     │                                │
     ▼                                ▼
┌─────────┐                        ┌─────────┐
│ fetch() │                        │ 服务器返回 │
│ 获取 JSON│                        │ HTML 片段 │
└────┬────┘                        └────┬────┘
     │                                │
     ▼                                ▼
┌─────────┐                        ┌─────────┐
│ 客户端   │                        │ HTMX 替换 │
│ 渲染更新 │                        │ DOM 目标 │
└─────────┘                        └─────────┘
```

**关键区别**：

- **SPA**：服务器返回 JSON，客户端负责渲染逻辑
- **HTMX**：服务器返回 HTML，浏览器直接替换 DOM

---

## 2. 核心属性系统

### 2.1 请求触发属性

```html
<!-- hx-get: 发送 GET 请求 -->
<button hx-get="/api/user/123">
  加载用户信息
</button>

<!-- hx-post: 发送 POST 请求 -->
<form hx-post="/api/todos">
  <input name="title" placeholder="新任务">
  <button type="submit">添加</button>
</form>

<!-- hx-put / hx-patch / hx-delete: 其他 HTTP 方法 -->
<button hx-put="/api/user/123" hx-include="[name='email']">
  更新邮箱
</button>

<button hx-delete="/api/todos/456">
  删除任务
</button>
```

### 2.2 目标与替换策略

```html
<!-- hx-target: 指定响应内容替换的目标元素 -->
<button hx-get="/api/notifications"
        hx-target="#notification-list">
  刷新通知
</button>

<!-- hx-target 选择器 -->
<!-- this: 元素自身 -->
<!-- closest <selector>: 最近的祖先元素 -->
<!-- find <selector>: 后代元素 -->
<!-- next: 下一个兄弟元素 -->
<!-- previous: 上一个兄弟元素 -->

<div hx-get="/api/detail" hx-target="find .content">
  <div class="content">内容将在这里更新</div>
</div>

<!-- hx-swap: 替换方式 -->
<!-- innerHTML: 替换目标内部（默认） -->
<!-- outerHTML: 替换整个目标元素 -->
<!-- beforebegin: 插入到目标之前 -->
<!-- afterbegin: 插入到目标内部开头 -->
<!-- beforeend: 插入到目标内部末尾 -->
<!-- afterend: 插入到目标之后 -->
<!-- delete: 删除目标，不插入内容 -->
<!-- none: 不替换（用于 hx-on 回调） -->

<div id="list">
  <button hx-post="/api/items"
          hx-target="#list"
          hx-swap="beforeend">
    添加项目（追加到列表末尾）
  </button>
</div>
```

### 2.3 触发事件控制

```html
<!-- hx-trigger: 自定义触发事件 -->

<!-- 鼠标进入时加载 -->
<div hx-get="/api/preview"
     hx-trigger="mouseenter once">
  悬停查看预览（仅触发一次）
</div>

<!-- 失去焦点时保存 -->
<input hx-patch="/api/user/name"
       hx-trigger="blur"
       hx-target="this"
       hx-swap="outerHTML"
       name="name"
       value="Alice">

<!-- 自定义事件触发 -->
<div hx-get="/api/content"
     hx-trigger="contentLoad from:body">
  通过 JS 触发自定义事件加载
</div>

<!-- 修饰符 -->
<!-- delay: 延迟触发 -->
<input hx-get="/api/search"
       hx-trigger="keyup delay:500ms"
       hx-target="#search-results"
       name="q"
       placeholder="搜索...">

<!-- throttle: 节流 -->
<button hx-get="/api/load-more"
        hx-trigger="click throttle:1s"
        hx-target="this"
        hx-swap="outerHTML">
  加载更多（1秒内只触发一次）
</button>
```

---

## 3. HATEOAS 与超媒体系统

### 3.1 HATEOAS 原则

HATEOAS（Hypermedia as the Engine of Application State）是 REST 架构的约束之一：

> **应用程序状态由服务器通过超媒体驱动，客户端无需硬编码 URL 或业务逻辑。**

```html
<!-- 服务器返回的 HTML 包含下一步操作的链接 -->
<div class="todo-item" id="todo-123">
  <span>完成文档编写</span>

  <!-- 操作链接由服务器动态生成 -->
  <button hx-patch="/todos/123/complete"
          hx-target="#todo-123"
          hx-swap="outerHTML">
    标记完成
  </button>

  <button hx-delete="/todos/123"
          hx-confirm="确定删除？"
          hx-target="#todo-123"
          hx-swap="delete">
    删除
  </button>
</div>
```

### 3.2 与 JSON API 的对比

| 方面 | JSON API + SPA | HTMX + HTML |
|------|---------------|-------------|
| 服务器返回 | JSON 数据 | HTML 片段 |
| 客户端逻辑 | 路由、渲染、状态管理 | 最小化（HTMX 属性） |
| URL 管理 | 客户端路由 | 服务器端路由 |
| 状态位置 | 客户端内存 | 服务器 + URL |
| 缓存策略 | 复杂（需要 API + 渲染缓存） | 简单（HTTP 缓存 HTML） |
| SEO | 需要 SSR/预渲染 | 天然 SSR |

---

## 4. 渐进增强

### 4.1 无 JavaScript 也能工作

```html
<!-- 基础表单：无 JS 时正常提交，有 HTMX 时 AJAX 化 -->
<form action="/search" method="get"
      hx-get="/search"
      hx-target="#results"
      hx-push-url="true">
  <input name="q" placeholder="搜索...">
  <button type="submit">搜索</button>
</form>

<!-- 无 JS 时：表单正常提交，页面跳转 -->
<!-- 有 HTMX 时：AJAX 获取，局部更新，URL 推送 -->
```

### 4.2 增强现有页面

```html
<!-- 现有表格添加行内编辑 -->
<table>
  <tr>
    <td>Alice</td>
    <td>
      <!-- 点击邮箱进入编辑模式 -->
      <span hx-get="/users/123/edit-email"
            hx-target="this"
            hx-swap="outerHTML"
            class="editable">
        alice@example.com
      </span>
    </td>
  </tr>
</table>

<!-- 服务器返回编辑表单 -->
<!-- <form hx-patch="/users/123/email" ...> -->
<!--   <input name="email" value="alice@example.com"> -->
<!--   <button>保存</button> -->
<!-- </form> -->
```

---

## 5. HTMX 扩展属性

### 5.1 常用扩展

```html
<!-- hx-indicator: 加载指示器 -->
<button hx-get="/api/slow"
        hx-indicator="#spinner">
  加载慢数据
</button>
<div id="spinner" class="htmx-indicator">加载中...</div>

<!-- hx-confirm: 确认对话框 -->
<button hx-delete="/api/item/123"
        hx-confirm="确定要删除吗？">
  删除
</button>

<!-- hx-push-url: 更新浏览器 URL -->
<a hx-get="/page/2"
   hx-target="#content"
   hx-push-url="true">
  第2页
</a>

<!-- hx-select: 从响应中提取部分内容 -->
<div hx-get="/full-page"
     hx-select="#target-section"
     hx-target="this">
  只替换此部分
</div>

<!-- hx-vals: 添加额外参数 -->
<button hx-post="/api/action"
        hx-vals='{"source": "button"}'>
  提交（带额外参数）
</button>

<!-- hx-headers: 自定义请求头 -->
<div hx-get="/api/protected"
     hx-headers='{"X-Requested-With": "HTMX"}'>
</div>
```

---

## 6. 与后端框架的集成模式

### 6.1 通用后端响应模式

```python
# Django 示例
def todo_list(request):
    todos = Todo.objects.all()
    if request.headers.get('HX-Request'):
        # HTMX 请求：只返回片段
        return render(request, 'todos/_list.html', {'todos': todos})
    # 普通请求：返回完整页面
    return render(request, 'todos/list.html', {'todos': todos})
```

```ruby
# Rails 示例
def index
  @todos = Todo.all
  respond_to do |format|
    format.html do
      if request.headers['HX-Request']
        render partial: 'todos/list', locals: { todos: @todos }
      else
        render :index
      end
    end
  end
end
```

```javascript
// Express + EJS 示例
app.get('/todos', (req, res) => {
  const todos = db.todos.getAll();
  if (req.headers['hx-request']) {
    return res.render('partials/todo-list', { todos });
  }
  res.render('todos', { todos });
});
```

### 6.2 HTMX 请求头

| 请求头 | 说明 |
|--------|------|
| `HX-Request` | `true` — 标识这是 HTMX 请求 |
| `HX-Trigger` | 触发元素的 ID |
| `HX-Trigger-Name` | 触发元素的 name 属性 |
| `HX-Target` | 目标元素的 ID |
| `HX-Current-URL` | 当前页面 URL |

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **忘记处理 HX-Request** | 服务器返回完整页面而非片段 | 检查 `HX-Request` 头，返回对应片段 |
| **CSRF 令牌缺失** | POST/PUT/DELETE 请求被拒绝 | 配置 `htmx.config.includeIndicatorStyles` 或使用 `hx-headers` |
| **目标元素不存在** | `hx-target` 指向不存在的元素 | 确保目标元素在 DOM 中，或使用 `closest` 选择器 |
| **事件冒泡冲突** | HTMX 事件与现有 JS 冲突 | 使用 `hx-trigger` 的 `once` 修饰符或事件委托 |

---

## 练习

1. 实现一个待办事项列表：使用 `hx-get` 加载列表、`hx-post` 添加任务、`hx-patch` 标记完成、`hx-delete` 删除任务。
2. 实现一个搜索框：使用 `hx-trigger="keyup delay:300ms"` 实现防抖搜索，结果更新到 `#search-results`。
3. 实现分页：点击页码使用 `hx-push-url="true"` 更新 URL，同时局部更新内容。

---

## 延伸阅读

- [HTMX Documentation](https://htmx.org/docs/)
- [HTMX Essays — Carson Gross](https://htmx.org/essays/)
- [Hypermedia Systems (免费书籍)](https://hypermedia.systems/)
- [When to use HTMX](https://htmx.org/essays/when-to-use-hypermedia/)
