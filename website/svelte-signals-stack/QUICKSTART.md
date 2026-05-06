---
title: 5 分钟上手 Svelte 5
description: '从零开始，5 分钟内在浏览器中运行第一个 Svelte 5 组件，无需本地安装'
keywords: 'Svelte 快速开始, Svelte 5 入门, 初学者, 教程'
---

# 5 分钟上手 Svelte 5

> **目标**: 5 分钟内，让一段 Svelte 代码在浏览器中跑起来
> **不需要**: 理解原理、配置构建工具、安装任何软件
> **只需要**: 一个浏览器

---

## 方式一：浏览器内体验（30 秒）

点击链接 → 直接编辑代码 → 实时看到结果：

👉 **[Svelte REPL 在线 playground](https://svelte.dev/playground)**

将左侧代码替换为以下内容，右侧立即显示计数器：

```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  点击了 {count} 次
</button>
<p>双倍是: {doubled}</p>

<style>
  button {
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  p {
    color: #666;
  }
</style>
```

**你刚刚做了什么？**

- `$state(0)` — 声明一个响应式变量
- `$derived(count * 2)` — 自动计算派生值
- `{count}` — 在模板中显示变量
- `onclick={increment}` — 绑定点击事件
- `<style>` — 样式自动限定在当前组件

---

## 方式二：本地项目（3 分钟）

需要 Node.js 22+。

### 第 1 步：创建项目

```bash
npm create sv@latest my-first-svelte
```

选择：

- **Which template?** → `Skeleton project`
- **Add type checking?** → `Yes, using TypeScript syntax`
- **Select additional options** → 按空格取消所有，直接回车

### 第 2 步：启动开发服务器

```bash
cd my-first-svelte
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，看到 "Welcome to SvelteKit" 即成功。

### 第 3 步：修改首页

打开 `src/routes/+page.svelte`，替换全部内容为：

```svelte
<script>
  let count = $state(0);
</script>

<h1>你好，Svelte 5！</h1>
<button onclick={() => count++}>
  点击了 {count} 次
</button>

<style>
  h1 { color: #ff3e00; }
  button { font-size: 1.2rem; padding: 0.5rem 1rem; }
</style>
```

保存文件，浏览器自动刷新。点击按钮，数字增加。

---

## 方式三：一键云端项目（1 分钟）

| 平台 | 链接 | 特点 |
|:---|:---|:---|
| **StackBlitz** | [sveltekit.new](https://sveltekit.new) | 无需注册，直接编辑完整 SvelteKit 项目 |
| **CodeSandbox** | [svelte.new](https://svelte.new) | 支持多人实时协作 |

---

## 下一步

完成上述任意一种方式后，你已经运行了第一个 Svelte 5 组件。接下来：

1. **理解原理** → 阅读 [02-svelte-5-runes](02-svelte-5-runes.md)（Runes 深度指南）
2. **动手练习** → 跟随 [16-learning-ladder](16-learning-ladder.md) Level 1 的练习项目
3. **构建全栈应用** → 学习 [03-sveltekit-fullstack](03-sveltekit-fullstack.md)

---

> 💡 **遇到问题了？** Svelte Discord 的 `#help` 频道或 [GitHub Discussions](https://github.com/sveltejs/svelte/discussions) 是获取帮助的最佳途径。
