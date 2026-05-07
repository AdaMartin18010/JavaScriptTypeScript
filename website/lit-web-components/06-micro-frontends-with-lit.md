---
title: 06 微前端场景
description: 掌握使用 Lit Web Components 构建微前端架构：独立部署、版本兼容、跨应用通信、Module Federation 替代方案。
---

# 06 微前端场景

> **前置知识**：Lit 组件开发、微前端架构概念
>
> **目标**：能够使用 Lit Web Components 构建可独立部署的微前端系统

---

## 1. 微前端架构选型

### 1.1 为什么选择 Lit？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Module Federation** | 框架无关的模块共享 | 运行时耦合、版本冲突 |
| **iframe** | 完全隔离 | 性能差、体验割裂 |
| **Web Components (Lit)** | 原生标准、框架无关、渐进集成 | 需要学习成本 |
| **SPA 路由分发** | 简单 | 技术栈强绑定 |

**Lit + Web Components 的优势**：

- 浏览器原生支持，无运行时依赖
- 各团队可选择自己的框架（React/Vue/Angular/Svelte）
- 渐进式集成，无需重写现有应用
- 版本隔离通过自定义元素命名空间实现

### 1.2 架构模式

```
微前端架构（Lit 方案）：
┌─────────────────────────────────────────┐
│           基座应用 (Shell App)            │
│  - 路由管理                             │
│  - 全局导航                             │
│  - 用户认证                             │
│  - 主题/配置分发                         │
├──────────┬──────────┬─────────────────┤
│ 团队 A   │ 团队 B   │ 团队 C          │
│ React    │ Vue      │ Angular         │
│ App      │ App      │ App             │
│          │          │                 │
│ 共享组件: │ 共享组件: │ 共享组件:        │
│ <ds-btn> │ <ds-btn> │ <ds-btn>        │
│ <ds-card>│ <ds-card>│ <ds-card>       │
│ <ds-form>│ <ds-form>│ <ds-form>       │
└──────────┴──────────┴─────────────────┘
         ↑ 全部来自同一个设计系统
```

---

## 2. 基座应用设计

### 2.1 路由集成

```typescript
// shell-app/src/router.ts
import { registerMicroApps, start } from 'qiankun';
// 或使用原生方案

const apps = [
  {
    name: 'react-app',
    entry: '//localhost:3001',
    container: '#micro-app-container',
    activeRule: '/react',
  },
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#micro-app-container',
    activeRule: '/vue',
  },
];

// Web Components 替代方案：每个微应用暴露一个自定义元素
class MicroAppLoader extends HTMLElement {
  async connectedCallback() {
    const appName = this.getAttribute('app');
    const app = apps.find(a => a.name === appName);

    if (app) {
      // 动态加载微应用
      await loadMicroApp(app, this);
    }
  }
}

customElements.define('micro-app-loader', MicroAppLoader);
```

```html
<!-- 使用 -->
<nav>
  <a href="/react">React 应用</a>
  <a href="/vue">Vue 应用</a>
</nav>

<main id="micro-app-container">
  <!-- 微应用加载到这里 -->
</main>
```

### 2.2 全局配置分发

```typescript
// shell-app/src/config-provider.ts
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { createContext } from '@lit/context';

export interface AppConfig {
  theme: 'light' | 'dark';
  locale: string;
  apiBaseUrl: string;
  features: Record<string, boolean>;
}

export const configContext = createContext<AppConfig>('app-config');

@customElement('app-shell')
export class AppShell extends LitElement {
  @provide({ context: configContext })
  @property({ attribute: false })
  config: AppConfig = {
    theme: 'light',
    locale: 'zh-CN',
    apiBaseUrl: '/api',
    features: {},
  };

  render() {
    return html`<slot></slot>`;
  }
}
```

---

## 3. 跨应用通信

### 3.1 自定义事件总线

```typescript
// shared/src/event-bus.ts
export class MicroFrontendEventBus {
  private target = new EventTarget();

  emit<T>(event: string, detail: T) {
    this.target.dispatchEvent(new CustomEvent(event, { detail }));
  }

  on<T>(event: string, handler: (detail: T) => void) {
    const wrapper = (e: Event) => handler((e as CustomEvent).detail);
    this.target.addEventListener(event, wrapper);
    return () => this.target.removeEventListener(event, wrapper);
  }
}

export const eventBus = new MicroFrontendEventBus();

// 使用示例
// 应用 A 中
eventBus.emit('user:login', { userId: '123', name: 'Alice' });

// 应用 B 中
const unsubscribe = eventBus.on('user:login', (user) => {
  console.log('用户登录:', user);
});

// 取消订阅
unsubscribe();
```

### 3.2 共享状态存储

```typescript
// shared/src/store.ts
import { Signal, signal, computed, effect } from '@lit-labs/signals';

interface GlobalState {
  user: { id: string; name: string } | null;
  notifications: number;
  theme: 'light' | 'dark';
}

class SharedStore {
  private _state = signal<GlobalState>({
    user: null,
    notifications: 0,
    theme: 'light',
  });

  get state() { return this._state.get(); }
  set state(value) { this._state.set(value); }

  // 派生状态
  isLoggedIn = computed(() => this.state.user !== null);

  // 操作
  login(user: GlobalState['user']) {
    this.state = { ...this.state, user };
  }

  logout() {
    this.state = { ...this.state, user: null };
  }

  addNotification() {
    this.state = { ...this.state, notifications: this.state.notifications + 1 };
  }

  setTheme(theme: 'light' | 'dark') {
    this.state = { ...this.state, theme };
  }

  // 订阅变化
  subscribe(callback: (state: GlobalState) => void) {
    return effect(() => callback(this._state.get()));
  }
}

export const sharedStore = new SharedStore();
```

---

## 4. 版本兼容策略

### 4.1 命名空间隔离

```typescript
// 不同版本的设计系统使用不同前缀
// v1: <ds-v1-button>
// v2: <ds-v2-button>

// 构建时配置
const DS_VERSION = process.env.DS_VERSION || 'v1';

@customElement(`ds-${DS_VERSION}-button`)
export class DSButton extends LitElement {
  // ...
}

// 或者在运行时注册别名
import { DSButton as DSButtonV2 } from '@mycompany/design-system@2';
customElements.define('ds-button', DSButtonV2);
```

### 4.2 动态加载

```typescript
// 按需加载不同版本
async function loadComponent(name: string, version?: string) {
  const tagName = version ? `ds-${version}-${name}` : `ds-${name}`;

  if (customElements.get(tagName)) {
    return customElements.get(tagName)!;
  }

  const module = version
    ? await import(`https://cdn.example.com/ds@${version}/${name}.js`)
    : await import(`@mycompany/design-system/components/${name}.js`);

  return module.default;
}

// 使用
const DSButton = await loadComponent('button', 'v2');
```

---

## 5. 独立部署

### 5.1 各团队构建配置

```javascript
// react-app/webpack.config.js
module.exports = {
  output: {
    library: 'reactApp',
    libraryTarget: 'umd',
  },
  externals: {
    // 共享依赖
    'lit': 'lit',
    '@mycompany/design-system': '@mycompany/design-system',
  },
};

// vue-app/vite.config.js
export default {
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'vueApp',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['lit', '@mycompany/design-system'],
    },
  },
};
```

### 5.2 部署清单

```yaml
# deploy-manifest.yaml
apps:
  - name: shell
    url: https://app.example.com
    entry: /shell/index.html

  - name: react-app
    url: https://react-app.example.com
    entry: /react-app/remoteEntry.js
    dependencies:
      - design-system@^2.0.0

  - name: vue-app
    url: https://vue-app.example.com
    entry: /vue-app/remoteEntry.js
    dependencies:
      - design-system@^2.0.0

shared:
  design-system:
    versions:
      - version: "2.0.0"
        url: https://cdn.example.com/design-system@2.0.0
      - version: "2.1.0"
        url: https://cdn.example.com/design-system@2.1.0
```

---

## 6. 性能优化

### 6.1 懒加载微应用

```typescript
// shell-app/src/lazy-loader.ts
const microAppCache = new Map<string, Promise<void>>();

export async function loadMicroApp(name: string): Promise<void> {
  if (microAppCache.has(name)) {
    return microAppCache.get(name)!;
  }

  const loadPromise = import(/* webpackIgnore: true */ `/apps/${name}/entry.js`)
    .then(module => {
      if (module.bootstrap) {
        return module.bootstrap();
      }
    });

  microAppCache.set(name, loadPromise);
  return loadPromise;
}

// 路由守卫
router.beforeEach(async (to) => {
  const appName = to.meta.microApp;
  if (appName) {
    await loadMicroApp(appName);
  }
});
```

### 6.2 共享组件预加载

```html
<!-- 在 shell 应用中预加载常用组件 -->
<link rel="preload" href="/ds/button.js" as="script">
<link rel="preload" href="/ds/input.js" as="script">
<link rel="preload" href="/ds/card.js" as="script">
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **CSS 冲突** | 各微应用全局样式互相影响 | 使用 Shadow DOM 隔离组件样式 |
| **全局事件污染** | 微应用未清理全局事件监听 | 在组件断开时清理 |
| **版本不一致** | 不同微应用使用不同版本的共享库 | 使用命名空间或动态加载 |
| **路由冲突** | 各微应用路由互相干扰 | 基座应用统一管理路由前缀 |

---

## 练习

1. 设计一个微前端基座应用：包含全局导航、主题切换、用户认证，支持加载 React/Vue 子应用。
2. 实现跨应用的购物车状态共享：使用自定义事件或共享 Store。
3. 设计版本兼容方案：同时支持 design-system v1 和 v2 的按钮组件。

---

## 延伸阅读

- [Micro Frontends — Martin Fowler](https://martinfowler.com/articles/micro-frontends.html)
- [Module Federation](https://module-federation.io/)
- [Web Components in Micro Frontends](https://www.angulararchitects.io/blog/micro-frontends-with-web-components/)
