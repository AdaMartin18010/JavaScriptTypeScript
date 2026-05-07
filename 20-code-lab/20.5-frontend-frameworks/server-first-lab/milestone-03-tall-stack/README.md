# M3: TALL Stack 全栈实验

## 目标

体验 TALL Stack（Tailwind + Alpine.js + Laravel + Livewire）风格的开发，对比纯 HTMX 方案。

## 实验环境

使用 PHP/Laravel 或 Node.js 模拟相同模式。

```bash
# Laravel 方案（推荐）
composer create-project laravel/laravel tall-lab
cd tall-lab
composer require livewire/livewire
npm install -D tailwindcss alpinejs
npx tailwindcss init
```

## 实验任务

### 任务 1: Livewire 组件基础

```php
// app/Livewire/Counter.php
namespace App\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

```html
<!-- resources/views/livewire/counter.blade.php -->
<div>
    <button wire:click="increment">+</button>
    <span>{{ $count }}</span>
</div>
```

### 任务 2: HTMX 替代 Livewire（Node.js 方案）

如果你不使用 PHP，可用 Express + HTMX 实现类似体验：

```js
// server.js
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 计数器状态（仅演示，生产用 Redis）
let count = 0;

app.get('/', (req, res) => {
  res.render('index', { count });
});

app.post('/increment', (req, res) => {
  count++;
  res.render('partials/counter', { count });
});

app.listen(3000);
```

```html
<!-- views/partials/counter.ejs -->
<div id="counter" hx-swap="outerHTML">
  <form hx-post="/increment" hx-target="#counter">
    <button type="submit">+</button>
    <span><%= count %></span>
  </form>
</div>
```

### 任务 3: 全栈表单 CRUD

实现一个完整的 Todo CRUD，对比两种实现：

| 特性 | Livewire | HTMX + Express |
|------|----------|----------------|
| 实时验证 | `wire:model.live` | `hx-post` + 局部刷新 |
| 排序/分页 | 内置 `WithPagination` | 手动 `hx-get` + 参数 |
| 文件上传 | `wire:model` | `hx-post` + `FormData` |

## 验证清单

- [ ] 计数器交互无页面刷新
- [ ] Todo CRUD 完整可用
- [ ] 表单验证即时反馈
- [ ] 分页/排序正常工作

## 延伸阅读

- [Laravel Livewire](https://livewire.laravel.com/)
- [TALL Stack 介绍](https://tallstack.dev/)
