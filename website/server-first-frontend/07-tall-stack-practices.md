---
title: 07 TALL Stack 实战
description: 掌握 TALL Stack（Tailwind CSS + Alpine.js + Laravel + Livewire）的完整实战：从项目搭建到生产部署的全流程最佳实践。
---

# 07 TALL Stack 实战

> **前置知识**：Alpine.js 核心、Laravel 基础、Tailwind CSS 基础
>
> **目标**：能够使用 TALL Stack 构建完整的全栈应用

---

## 1. TALL Stack 概述

### 1.1 技术栈组成

| 技术 | 职责 | 版本 |
|------|------|------|
| **Tailwind CSS** | 原子化 CSS 框架 | 3.x+ |
| **Alpine.js** | 前端交互 | 3.x+ |
| **Laravel** | PHP 后端框架 | 10.x+ |
| **Livewire** | Laravel 的全栈框架（无 JS 编写） | 3.x+ |

### 1.2 架构定位

```
TALL Stack 架构：
┌─────────────────────────────────────────┐
│           Tailwind CSS                  │
│         （样式层，原子化 CSS）            │
├─────────────────────────────────────────┤
│           Alpine.js                     │
│      （交互层，轻量前端逻辑）              │
├─────────────────────────────────────────┤
│           Livewire                      │
│   （组件层，PHP 写动态组件）              │
├─────────────────────────────────────────┤
│           Laravel                       │
│      （后端层，MVC + Eloquent）          │
└─────────────────────────────────────────┘
```

**何时使用 TALL Stack**：

- 管理后台、CRM、CMS 等表单密集型应用
- 需要快速开发 MVP
- 团队熟悉 PHP/Laravel
- 不需要复杂的客户端状态管理

---

## 2. 项目搭建

### 2.1 创建 Laravel 项目

```bash
# 创建 Laravel 项目
composer create-project laravel/tall-app
cd tall-app

# 安装 Livewire
composer require livewire/livewire

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.2 配置 Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './app/Http/Livewire/**/*.php',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```css
/* resources/css/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.3 布局模板

```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'TALL App')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-gray-100">
    <div class="min-h-screen">
        @include('layouts.navigation')

        <main class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                @yield('content')
            </div>
        </main>
    </div>

    @livewireScripts
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</body>
</html>
```

---

## 3. Livewire 组件开发

### 3.1 创建组件

```bash
php artisan make:livewire TodoList
```

```php
<?php
// app/Livewire/TodoList.php
namespace App\Livewire;

use Livewire\Component;
use App\Models\Todo;

class TodoList extends Component
{
    public $title = '';
    public $todos;

    protected $rules = [
        'title' => 'required|string|max:255',
    ];

    public function mount()
    {
        $this->todos = Todo::latest()->get();
    }

    public function addTodo()
    {
        $this->validate();

        Todo::create(['title' => $this->title]);
        $this->title = '';
        $this->todos = Todo::latest()->get();
    }

    public function toggleTodo($id)
    {
        $todo = Todo::find($id);
        $todo->update(['completed' => !$todo->completed]);
        $this->todos = Todo::latest()->get();
    }

    public function deleteTodo($id)
    {
        Todo::destroy($id);
        $this->todos = Todo::latest()->get();
    }

    public function render()
    {
        return view('livewire.todo-list');
    }
}
```

```blade
{{-- resources/views/livewire/todo-list.blade.php --}}
<div>
    <form wire:submit.prevent="addTodo" class="mb-6">
        <div class="flex gap-2">
            <input
                wire:model="title"
                type="text"
                placeholder="新任务..."
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                添加
            </button>
        </div>
        @error('title') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
    </form>

    <ul class="space-y-2">
        @foreach($todos as $todo)
            <li class="flex items-center justify-between p-3 bg-white rounded-md shadow">
                <span class="{{ $todo->completed ? 'line-through text-gray-500' : '' }}">
                    {{ $todo->title }}
                </span>
                <div class="flex gap-2">
                    <button wire:click="toggleTodo({{ $todo->id }})"
                            class="text-sm text-indigo-600 hover:text-indigo-800">
                        {{ $todo->completed ? '撤销' : '完成' }}
                    </button>
                    <button wire:click="deleteTodo({{ $todo->id }})"
                            class="text-sm text-red-600 hover:text-red-800">
                        删除
                    </button>
                </div>
            </li>
        @endforeach
    </ul>
</div>
```

### 3.2 Livewire + Alpine.js 协同

```blade
{{-- 使用 Alpine.js 增强 Livewire 组件 --}}
<div x-data="{ confirming: false }">
    <button @click="confirming = true" class="text-red-600">
        删除
    </button>

    {{-- 确认对话框 --}}
    <div x-show="confirming" class="fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="bg-white p-6 rounded-lg max-w-sm mx-auto mt-20">
            <p class="mb-4">确定要删除吗？</p>
            <div class="flex justify-end gap-2">
                <button @click="confirming = false" class="px-4 py-2 border rounded">
                    取消
                </button>
                <button wire:click="deleteTodo({{ $todo->id }})"
                        @click="confirming = false"
                        class="px-4 py-2 bg-red-600 text-white rounded">
                    确认删除
                </button>
            </div>
        </div>
    </div>
</div>
```

---

## 4. 表单与验证

### 4.1 实时验证

```php
<?php
// app/Livewire/UserForm.php
namespace App\Livewire;

use Livewire\Component;
use App\Models\User;

class UserForm extends Component
{
    public $name = '';
    public $email = '';
    public $password = '';

    protected $rules = [
        'name' => 'required|string|min:2|max:100',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ];

    // 实时验证（用户输入时）
    public function updated($propertyName)
    {
        $this->validateOnly($propertyName);
    }

    public function save()
    {
        $validated = $this->validate();
        User::create($validated);

        session()->flash('message', '用户创建成功！');
        $this->reset();
    }

    public function render()
    {
        return view('livewire.user-form');
    }
}
```

```blade
{{-- resources/views/livewire/user-form.blade.php --}}
<div>
    @if (session()->has('message'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ session('message') }}
        </div>
    @endif

    <form wire:submit.prevent="save" class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700">姓名</label>
            <input wire:model.live="name" type="text"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">邮箱</label>
            <input wire:model.live="email" type="email"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            @error('email') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">密码</label>
            <input wire:model.live="password" type="password"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            @error('password') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <button type="submit" wire:loading.attr="disabled"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <span wire:loading.remove>保存</span>
            <span wire:loading>保存中...</span>
        </button>
    </form>
</div>
```

---

## 5. 数据表格

### 5.1 带分页和搜索的表格

```php
<?php
// app/Livewire/UserTable.php
namespace App\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\User;

class UserTable extends Component
{
    use WithPagination;

    public $search = '';
    public $sortField = 'name';
    public $sortDirection = 'asc';

    public function sortBy($field)
    {
        if ($this->sortField === $field) {
            $this->sortDirection = $this->sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortField = $field;
            $this->sortDirection = 'asc';
        }
    }

    public function render()
    {
        $users = User::query()
            ->when($this->search, function ($query) {
                $query->where('name', 'like', '%' . $this->search . '%')
                      ->orWhere('email', 'like', '%' . $this->search . '%');
            })
            ->orderBy($this->sortField, $this->sortDirection)
            ->paginate(10);

        return view('livewire.user-table', compact('users'));
    }
}
```

```blade
{{-- resources/views/livewire/user-table.blade.php --}}
<div>
    <div class="mb-4">
        <input wire:model.live.debounce.300ms="search"
               type="text"
               placeholder="搜索..."
               class="rounded-md border-gray-300 shadow-sm">
    </div>

    <table class="min-w-full divide-y divide-gray-200">
        <thead>
            <tr>
                <th wire:click="sortBy('name')" class="cursor-pointer px-6 py-3 text-left">
                    姓名
                    @if($sortField === 'name')
                        {{ $sortDirection === 'asc' ? '▲' : '▼' }}
                    @endif
                </th>
                <th wire:click="sortBy('email')" class="cursor-pointer px-6 py-3 text-left">
                    邮箱
                    @if($sortField === 'email')
                        {{ $sortDirection === 'asc' ? '▲' : '▼' }}
                    @endif
                </th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            @foreach($users as $user)
                <tr>
                    <td class="px-6 py-4">{{ $user->name }}</td>
                    <td class="px-6 py-4">{{ $user->email }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="mt-4">
        {{ $users->links() }}
    </div>
</div>
```

---

## 6. 部署与生产优化

### 6.1 构建优化

```bash
# 生产构建
npm run build

# 优化 Livewire
php artisan livewire:publish --assets

# 缓存配置
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6.2 性能优化

```php
// config/livewire.php
return [
    // 使用持久化中间件减少请求开销
    'persistent_middleware' => [
        // ...
    ],

    // 延迟加载非关键组件
    'lazy_placeholder' => 'default',
];
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **Livewire 和 Alpine 冲突** | 两者都操作 DOM | 明确职责边界：Livewire 管理数据，Alpine 管理动画 |
| **N+1 查询** | Livewire 渲染时产生大量查询 | 使用 Eloquent 的 `with()` 预加载 |
| **大表单性能** | 大量 wire:model 导致频繁请求 | 使用 wire:model.debounce 或分组更新 |
| **文件上传内存** | 大文件上传导致内存溢出 | 使用 Livewire 的临时文件上传机制 |

---

## 练习

1. 使用 TALL Stack 实现一个完整的博客系统：文章 CRUD、分类、标签、评论。
2. 实现一个带有实时搜索、排序、分页的用户管理后台。
3. 实现一个带有文件上传（图片预览）的产品管理页面。

---

## 延伸阅读

- [Livewire Documentation](https://livewire.laravel.com/)
- [Laravel Documentation](https://laravel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TALL Stack Tutorial](https://tallstack.dev/)
