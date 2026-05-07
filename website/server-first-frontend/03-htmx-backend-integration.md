---
title: 03 HTMX 后端集成
description: 掌握 HTMX 与主流后端框架的集成模式：Node.js/Express、Django、Rails、Laravel。覆盖请求处理、片段渲染、状态管理和渐进增强。
---

# 03 HTMX 后端集成

> **前置知识**：HTMX 核心概念、一门后端语言基础
>
> **目标**：能够在不同后端技术栈中实现 HTMX 的完整支持

---

## 1. 集成核心模式

### 1.1 请求识别

所有后端框架都遵循相同的模式：检查 `HX-Request` 头来区分 HTMX 请求和普通请求。

```
HX-Request: true   → 返回 HTML 片段
HX-Request: 缺失  → 返回完整页面
```

### 1.2 响应设计原则

```
原则 1：HTMX 请求返回片段，非 HTMX 请求返回完整页面
原则 2：片段使用与完整页面相同的模板继承结构
原则 3：OOB 更新通过特殊属性标记
```

---

## 2. Node.js + Express 集成

### 2.1 基础结构

```javascript
// app.js
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 判断是否为 HTMX 请求的辅助函数
const isHtmx = (req) => req.headers['hx-request'] === 'true';

// 模板引擎配置（使用 EJS）
app.set('view engine', 'ejs');
app.set('views', './views');

// 路由示例
app.get('/todos', async (req, res) => {
  const todos = await db.todos.findAll();
  
  if (isHtmx(req)) {
    // HTMX 请求：只返回列表片段
    return res.render('partials/todo-list', { todos });
  }
  
  // 普通请求：返回完整页面
  res.render('todos/index', { todos });
});

app.post('/todos', async (req, res) => {
  const todo = await db.todos.create({
    title: req.body.title,
    completed: false,
  });
  
  if (isHtmx(req)) {
    // 返回新 todo 项 + OOB 更新计数
    const count = await db.todos.count();
    return res.render('partials/todo-item', { 
      todo,
      oob: { count }
    });
  }
  
  res.redirect('/todos');
});

app.delete('/todos/:id', async (req, res) => {
  await db.todos.delete(req.params.id);
  
  if (isHtmx(req)) {
    // HTMX 请求：返回空响应（触发 hx-swap="delete"）
    return res.send('');
  }
  
  res.redirect('/todos');
});
```

### 2.2 EJS 模板结构

```html
<!-- views/layout.ejs — 基础布局 -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
</head>
<body>
  <%- body %>
</body>
</html>

<!-- views/todos/index.ejs — 完整页面 -->
<h1>待办事项</h1>

<form hx-post="/todos" hx-target="#todo-list" hx-swap="beforeend">
  <input name="title" placeholder="新任务..." required>
  <button type="submit">添加</button>
</form>

<div id="todo-list">
  <%- include('partials/todo-list', { todos }) %>
</div>

<div id="todo-count">共 <%= todos.length %> 项</div>

<!-- views/partials/todo-list.ejs — 列表片段 -->
<% todos.forEach(todo => { %>
  <%- include('todo-item', { todo }) %>
<% }) %>

<!-- views/partials/todo-item.ejs — 单项片段 -->
<div id="todo-<%= todo.id %>" class="todo-item">
  <span class="<%= todo.completed ? 'completed' : '' %>">
    <%= todo.title %>
  </span>
  <button hx-patch="/todos/<%= todo.id %>/toggle"
          hx-target="#todo-<%= todo.id %>"
          hx-swap="outerHTML">
    <%= todo.completed ? '撤销' : '完成' %>
  </button>
  <button hx-delete="/todos/<%= todo.id %>"
          hx-target="#todo-<%= todo.id %>"
          hx-swap="delete"
          hx-confirm="确定删除？">
    删除
  </button>
</div>
```

---

## 3. Django 集成

### 3.1 视图设计

```python
# views.py
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from .models import Todo

def is_htmx(request):
    return request.headers.get('HX-Request') == 'true'

def todo_list(request):
    todos = Todo.objects.all()
    
    if is_htmx(request):
        return render(request, 'todos/partials/todo_list.html', {
            'todos': todos
        })
    
    return render(request, 'todos/index.html', {
        'todos': todos
    })

@require_http_methods(['POST'])
def todo_create(request):
    todo = Todo.objects.create(title=request.POST['title'])
    
    if is_htmx(request):
        return render(request, 'todos/partials/todo_item.html', {
            'todo': todo
        })
    
    return redirect('todo_list')

@require_http_methods(['PATCH'])
def todo_toggle(request, pk):
    todo = Todo.objects.get(pk=pk)
    todo.completed = not todo.completed
    todo.save()
    
    if is_htmx(request):
        return render(request, 'todos/partials/todo_item.html', {
            'todo': todo
        })
    
    return redirect('todo_list')

@require_http_methods(['DELETE'])
def todo_delete(request, pk):
    Todo.objects.get(pk=pk).delete()
    
    if is_htmx(request):
        return HttpResponse('')  # 空响应触发 hx-swap="delete"
    
    return redirect('todo_list')
```

### 3.2 模板结构

```html
<!-- templates/todos/index.html -->
{% extends 'base.html' %}

{% block content %}
<h1>待办事项</h1>

<form hx-post="{% url 'todo_create' %}"
      hx-target="#todo-list"
      hx-swap="beforeend">
  {% csrf_token %}
  <input name="title" placeholder="新任务..." required>
  <button type="submit">添加</button>
</form>

<div id="todo-list">
  {% include 'todos/partials/todo_list.html' %}
</div>
{% endblock %}

<!-- templates/todos/partials/todo_list.html -->
{% for todo in todos %}
  {% include 'todos/partials/todo_item.html' %}
{% empty %}
  <p>暂无任务</p>
{% endfor %}

<!-- templates/todos/partials/todo_item.html -->
<div id="todo-{{ todo.id }}" class="todo-item">
  <span class="{% if todo.completed %}completed{% endif %}">
    {{ todo.title }}
  </span>
  <button hx-patch="{% url 'todo_toggle' todo.id %}"
          hx-target="#todo-{{ todo.id }}"
          hx-swap="outerHTML">
    {% if todo.completed %}撤销{% else %}完成{% endif %}
  </button>
  <button hx-delete="{% url 'todo_delete' todo.id %}"
          hx-target="#todo-{{ todo.id }}"
          hx-swap="delete"
          hx-confirm="确定删除？">
    删除
  </button>
</div>
```

### 3.3 OOB 更新辅助

```python
# utils.py
from django.template.loader import render_to_string
from django.http import HttpResponse

def htmx_oob_response(request, main_template, main_context, oob_updates):
    """
    oob_updates: [('element_id', template, context), ...]
    """
    main_html = render_to_string(main_template, main_context, request)
    
    oob_html = '\n'.join(
        f'<div id="{elem_id}" hx-swap-oob="true">'
        f'{render_to_string(tpl, ctx, request)}'
        f'</div>'
        for elem_id, tpl, ctx in oob_updates
    )
    
    return HttpResponse(main_html + '\n' + oob_html)
```

---

## 4. Ruby on Rails 集成

### 4.1 控制器设计

```ruby
# app/controllers/todos_controller.rb
class TodosController < ApplicationController
  def index
    @todos = Todo.all
    
    respond_to do |format|
      format.html do
        if htmx_request?
          render partial: 'todos/list', locals: { todos: @todos }
        else
          render :index
        end
      end
    end
  end

  def create
    @todo = Todo.create!(todo_params)
    
    respond_to do |format|
      format.html do
        if htmx_request?
          render partial: 'todos/todo', locals: { todo: @todo }
        else
          redirect_to todos_path
        end
      end
    end
  end

  def destroy
    Todo.find(params[:id]).destroy
    
    respond_to do |format|
      format.html do
        head :ok if htmx_request?
        redirect_to todos_path unless htmx_request?
      end
    end
  end

  private

  def htmx_request?
    request.headers['HX-Request'] == 'true'
  end

  def todo_params
    params.require(:todo).permit(:title)
  end
end
```

### 4.2 Turbo 与 HTMX 共存

Rails 7+ 默认使用 Turbo，但可以与 HTMX 共存：

```erb
<!-- app/views/layouts/application.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    
    <!-- 如果使用 HTMX，可以禁用 Turbo -->
    <meta name="turbo-cache-control" content="no-cache">
    
    <script src="https://unpkg.com/htmx.org@2.0.0"></script>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
```

---

## 5. Laravel 集成

### 5.1 控制器设计

```php
<?php
// app/Http/Controllers/TodoController.php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class TodoController extends Controller
{
    private function isHtmx(Request $request): bool
    {
        return $request->header('HX-Request') === 'true';
    }

    public function index(Request $request)
    {
        $todos = Todo::all();
        
        if ($this->isHtmx($request)) {
            return view('todos.partials.list', compact('todos'));
        }
        
        return view('todos.index', compact('todos'));
    }

    public function store(Request $request)
    {
        $todo = Todo::create($request->validate([
            'title' => 'required|string|max:255',
        ]));
        
        if ($this->isHtmx($request)) {
            return view('todos.partials.todo', compact('todo'));
        }
        
        return redirect()->route('todos.index');
    }

    public function destroy(Request $request, Todo $todo)
    {
        $todo->delete();
        
        if ($this->isHtmx($request)) {
            return response('');
        }
        
        return redirect()->route('todos.index');
    }
}
```

### 5.2 Blade 模板

```blade
{{-- resources/views/todos/index.blade.php --}}
@extends('layouts.app')

@section('content')
<h1>待办事项</h1>

<form hx-post="{{ route('todos.store') }}"
      hx-target="#todo-list"
      hx-swap="beforeend">
    @csrf
    <input name="title" placeholder="新任务..." required>
    <button type="submit">添加</button>
</form>

<div id="todo-list">
    @include('todos.partials.list')
</div>
@endsection

{{-- resources/views/todos/partials/list.blade.php --}}
@forelse($todos as $todo)
    @include('todos.partials.todo')
@empty
    <p>暂无任务</p>
@endforelse

{{-- resources/views/todos/partials/todo.blade.php --}}
<div id="todo-{{ $todo->id }}" class="todo-item">
    <span class="{{ $todo->completed ? 'completed' : '' }}">
        {{ $todo->title }}
    </span>
    <button hx-delete="{{ route('todos.destroy', $todo) }}"
            hx-target="#todo-{{ $todo->id }}"
            hx-swap="delete"
            hx-confirm="确定删除？">
        删除
    </button>
</div>
```

---

## 6. 通用设计模式

### 6.1 中间件/装饰器模式

```python
# Django 中间件示例
class HtmxMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.htmx = request.headers.get('HX-Request') == 'true'
        return self.get_response(request)
```

```javascript
// Express 中间件示例
app.use((req, res, next) => {
  req.htmx = req.headers['hx-request'] === 'true';
  next();
});
```

### 6.2 模板片段组织

```
templates/
├── base.html           # 基础布局
├── todos/
│   ├── index.html      # 完整页面
│   └── partials/       # HTMX 片段
│       ├── list.html
│       ├── item.html
│       └── form.html
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **CSRF Token** | POST/PUT/DELETE 请求被拒绝 | 确保 HTMX 请求包含 CSRF Token |
| **模板缓存** | 片段更新后显示旧内容 | 配置模板引擎关闭缓存（开发环境） |
| **响应头缺失** | 某些框架需要特定响应头 | 确保返回正确的 Content-Type |
| **URL 生成** | 片段中的 URL 使用相对路径 | 使用框架的 URL 生成辅助函数 |

---

## 练习

1. 选择一个你最熟悉的后端框架，实现一个完整的 HTMX CRUD 应用（待办事项或博客）。
2. 实现 OOB 更新：添加待办事项时同时更新列表和计数器。
3. 实现表单验证：服务器验证失败后返回带错误信息的表单片段。

---

## 延伸阅读

- [HTMX Server Examples](https://htmx.org/server-examples/)
- [Django + HTMX Guide](https://django-htmx.readthedocs.io/)
- [Rails + HTMX](https://www.bearer.com/blog/rails-htmx)
- [Laravel + HTMX](https://laraveldaily.com/post/laravel-and-htmx-beginners-guide)
