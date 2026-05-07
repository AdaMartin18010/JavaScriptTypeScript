# M2: HTMX + Alpine.js 协同实验

## 目标

掌握 HTMX 与 Alpine.js 的分工模式：HTMX 负责服务端通信，Alpine.js 负责客户端状态。

## 实验环境

继续使用静态文件 + Node.js 模拟后端。

## 实验任务

### 任务 1: Alpine.js 管理本地状态

```html
<!DOCTYPE html>
<html>
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
</head>
<body>
  <!-- Alpine.js 管理 UI 状态 -->
  <div x-data="{ open: false, count: 0 }">
    <button @click="open = !open">
      Toggle (<span x-text="count"></span> clicks)
    </button>
    <div x-show="open" x-transition>
      <!-- HTMX 负责内容加载 -->
      <div hx-get="/api/details" hx-trigger="revealed">
        Loading...
      </div>
    </div>
  </div>
</body>
</html>
```

### 任务 2: 表单验证 + 提交

```html
<div x-data="{ errors: {} }">
  <form
    hx-post="/api/contact"
    hx-target="#response"
    @htmx:before-request="errors = {}"
    @htmx:response-error="errors = JSON.parse($event.detail.xhr.responseText)"
  >
    <input name="email" type="email" required />
    <span x-show="errors.email" x-text="errors.email" class="error"></span>

    <textarea name="message" required></textarea>
    <span x-show="errors.message" x-text="errors.message" class="error"></span>

    <button type="submit">Send</button>
  </form>
  <div id="response"></div>
</div>
```

### 任务 3: 购物车状态同步

```html
<div x-data="cart()" @htmx:after-swap.window="updateCart($event)">
  <!-- 商品列表由 HTMX 加载 -->
  <div hx-get="/api/products" hx-trigger="load"></div>

  <!-- 购物车由 Alpine.js 管理 -->
  <div class="cart">
    <span x-text="items.length"></span> items
    <span x-text="'$' + total"></span>
  </div>
</div>

<script>
function cart() {
  return {
    items: [],
    get total() {
      return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
    updateCart(event) {
      // 从 HTMX 响应中提取购物车数据
      if (event.detail.target.id === 'cart-data') {
        this.items = JSON.parse(event.detail.target.innerText);
      }
    }
  };
}
</script>
```

## 验证清单

- [ ] Alpine.js 状态变化不触发服务端请求
- [ ] HTMX 请求响应正确更新 DOM
- [ ] 两者事件系统无冲突
- [ ] 表单验证错误正确显示在 Alpine 管理的 UI 中

## 延伸阅读

- [Alpine.js 文档](https://alpinejs.dev/)
- [HTMX + Alpine.js 协作模式](https://htmx.org/essays/hypermedia-friendly-scripting/)
