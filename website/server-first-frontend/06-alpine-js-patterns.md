---
title: 06 Alpine.js 模式
description: 掌握 Alpine.js 的实战模式：表单验证、模态框、标签页、下拉菜单、轻量状态管理，以及与 Tailwind CSS 的深度集成。
---

# 06 Alpine.js 模式

> **前置知识**：Alpine.js 核心指令
>
> **目标**：能够使用 Alpine.js 实现常见的 UI 交互模式

---

## 1. 表单验证模式

### 1.1 实时验证

```html
<div x-data="{
  email: '',
  password: '',
  errors: {},
  validate() {
    this.errors = {};
    if (!this.email.includes('@')) this.errors.email = '请输入有效的邮箱';
    if (this.password.length < 8) this.errors.password = '密码至少 8 位';
    return Object.keys(this.errors).length === 0;
  }
}">
  <form @submit.prevent="if(validate()) $el.submit()">
    <div>
      <input x-model="email"
             @blur="validate()"
             placeholder="邮箱"
             :class="{ 'border-red-500': errors.email }">
      <p x-show="errors.email" x-text="errors.email" class="text-red-500 text-sm"></p>
    </div>

    <div>
      <input x-model="password"
             type="password"
             @blur="validate()"
             placeholder="密码"
             :class="{ 'border-red-500': errors.password }">
      <p x-show="errors.password" x-text="errors.password" class="text-red-500 text-sm"></p>
    </div>

    <button type="submit" :disabled="Object.keys(errors).length > 0">
      注册
    </button>
  </form>
</div>
```

### 1.2 动态表单字段

```html
<div x-data="{
  fields: [{ name: '', value: '' }],
  addField() { this.fields.push({ name: '', value: '' }) },
  removeField(index) { this.fields.splice(index, 1) }
}">
  <template x-for="(field, index) in fields" :key="index">
    <div class="field-row">
      <input x-model="field.name" placeholder="字段名">
      <input x-model="field.value" placeholder="值">
      <button @click="removeField(index)" type="button">删除</button>
    </div>
  </template>

  <button @click="addField()" type="button">添加字段</button>

  <pre x-text="JSON.stringify(fields, null, 2)"></pre>
</div>
```

---

## 2. 模态框模式

### 2.1 基础模态框

```html
<div x-data="{ open: false }">
  <button @click="open = true">打开模态框</button>

  <!-- 遮罩层 -->
  <div x-show="open"
       class="fixed inset-0 bg-black bg-opacity-50 z-40"
       x-transition:enter="transition-opacity ease-out duration-300"
       x-transition:enter-start="opacity-0"
       x-transition:enter-end="opacity-100"
       x-transition:leave="transition-opacity ease-in duration-200"
       x-transition:leave-start="opacity-100"
       x-transition:leave-end="opacity-0"
       @click="open = false">
  </div>

  <!-- 模态框内容 -->
  <div x-show="open"
       class="fixed inset-0 z-50 flex items-center justify-center"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="opacity-0 transform scale-95"
       x-transition:enter-end="opacity-100 transform scale-100"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="opacity-100 transform scale-100"
       x-transition:leave-end="opacity-0 transform scale-95">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <h2 class="text-xl font-bold mb-4">模态框标题</h2>
      <p class="mb-4">这是模态框的内容。</p>
      <div class="flex justify-end gap-2">
        <button @click="open = false" class="px-4 py-2 border rounded">取消</button>
        <button @click="open = false" class="px-4 py-2 bg-blue-500 text-white rounded">确认</button>
      </div>
    </div>
  </div>
</div>
```

### 2.2 焦点陷阱（使用 Focus 插件）

```html
<div x-data="{ open: false }">
  <button @click="open = true">打开</button>

  <div x-show="open" x-trap="open" @keydown.escape.window="open = false">
    <input placeholder="输入 1">
    <input placeholder="输入 2">
    <button @click="open = false">关闭</button>
  </div>
</div>
```

---

## 3. 标签页模式

```html
<div x-data="{ activeTab: 'profile' }">
  <div class="flex border-b">
    <button @click="activeTab = 'profile'"
            :class="{ 'border-b-2 border-blue-500': activeTab === 'profile' }"
            class="px-4 py-2">
      个人资料
    </button>
    <button @click="activeTab = 'settings'"
            :class="{ 'border-b-2 border-blue-500': activeTab === 'settings' }"
            class="px-4 py-2">
      设置
    </button>
    <button @click="activeTab = 'notifications'"
            :class="{ 'border-b-2 border-blue-500': activeTab === 'notifications' }"
            class="px-4 py-2">
      通知
    </button>
  </div>

  <div class="p-4">
    <div x-show="activeTab === 'profile'" x-transition>
      <h3>个人资料内容</h3>
    </div>
    <div x-show="activeTab === 'settings'" x-transition>
      <h3>设置内容</h3>
    </div>
    <div x-show="activeTab === 'notifications'" x-transition>
      <h3>通知内容</h3>
    </div>
  </div>
</div>
```

---

## 4. 下拉菜单模式

```html
<div x-data="{ open: false }" class="relative">
  <button @click="open = !open" @click.outside="open = false"
          class="px-4 py-2 bg-gray-200 rounded">
    菜单 <span x-text="open ? '▲' : '▼'"></span>
  </button>

  <div x-show="open"
       x-transition:enter="transition ease-out duration-100"
       x-transition:enter-start="transform opacity-0 scale-95"
       x-transition:enter-end="transform opacity-100 scale-100"
       x-transition:leave="transition ease-in duration-75"
       x-transition:leave-start="transform opacity-100 scale-100"
       x-transition:leave-end="transform opacity-0 scale-95"
       class="absolute mt-2 w-48 bg-white border rounded shadow-lg z-50">
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">选项 1</a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">选项 2</a>
    <a href="#" class="block px-4 py-2 hover:bg-gray-100">选项 3</a>
  </div>
</div>
```

---

## 5. 轻量状态管理

### 5.1 全局 Store

```html
<!-- 定义全局状态 -->
<script>
document.addEventListener('alpine:init', () => {
  Alpine.store('cart', {
    items: [],
    get count() { return this.items.reduce((sum, item) => sum + item.qty, 0) },
    get total() { return this.items.reduce((sum, item) => sum + item.price * item.qty, 0) },
    add(item) {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ ...item, qty: 1 });
      }
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
    },
  });
});
</script>

<!-- 在任何地方使用 -->
<div x-data>
  <span x-text="$store.cart.count"></span> 件商品
  <span x-text="`¥${$store.cart.total}`"></span>
</div>

<div x-data="{ product: { id: 1, name: 'T恤', price: 99 } }">
  <button @click="$store.cart.add(product)">
    添加到购物车
  </button>
</div>
```

### 5.2 组件间通信

```html
<!-- 方式 1：使用全局事件 -->
<div x-data="{ message: '' }"
     x-init="$watch('message', value => {
       window.dispatchEvent(new CustomEvent('message-sent', { detail: value }));
     })">
  <input x-model="message" placeholder="输入消息...">
</div>

<div x-data="{ received: '' }"
     x-init="window.addEventListener('message-sent', e => received = e.detail)">
  收到: <span x-text="received"></span>
</div>

<!-- 方式 2：使用 $dispatch（更简洁） -->
<div x-data="{ count: 0 }">
  <button @click="count++; $dispatch('count-updated', count)">
    +1
  </button>
</div>

<div x-data="{ total: 0 }" @count-updated.window="total = $event.detail">
  总计: <span x-text="total"></span>
</div>
```

---

## 6. 与 Tailwind CSS 集成

### 6.1 TALL Stack 组件

```html
<!-- 完整的 Tailwind + Alpine 组件 -->
<div x-data="{ open: false }" class="relative inline-block text-left">
  <button @click="open = !open" type="button"
          class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
    选项
    <svg class="-mr-1 ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <div x-show="open"
       @click.outside="open = false"
       x-transition:enter="transition ease-out duration-100"
       x-transition:enter-start="transform opacity-0 scale-95"
       x-transition:enter-end="transform opacity-100 scale-100"
       x-transition:leave="transition ease-in duration-75"
       x-transition:leave-start="transform opacity-100 scale-100"
       x-transition:leave-end="transform opacity-0 scale-95"
       class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
    <div class="py-1">
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">编辑</a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">复制</a>
    </div>
    <div class="py-1">
      <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">删除</a>
    </div>
  </div>
</div>
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **过渡动画不生效** | x-show 和 x-transition 用法错误 | 确保 x-transition 在 x-show 的同一元素上 |
| **Store 未定义** | 在 alpine:init 前访问 $store | 确保 Store 在 alpine:init 中定义 |
| **深度嵌套性能** | 大量 x-for 嵌套导致卡顿 | 考虑分页或虚拟滚动 |
| **事件委托混淆** | .window 和 .outside 修饰符使用错误 | 理解事件传播路径 |

---

## 练习

1. 实现一个完整的图片轮播组件：上一张/下一张按钮、指示器点、自动播放、触摸滑动支持。
2. 实现一个拖拽排序列表：使用 Alpine.js 管理拖拽状态，更新列表顺序。
3. 实现一个树形菜单：支持展开/折叠、递归渲染子菜单。

---

## 延伸阅读

- [Alpine.js Examples](https://alpinejs.dev/examples)
- [Tailwind UI](https://tailwindui.com/)（使用 Alpine.js）
- [TALL Stack Presets](https://github.com/laravel-frontend-presets/tall)
