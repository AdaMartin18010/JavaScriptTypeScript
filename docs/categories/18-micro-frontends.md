# 微前端方案

微前端（Micro Frontends）是一种将大型前端应用拆分为独立部署、松耦合子应用的架构模式，类似于微服务在后端的实现方式。

---

## Webpack生态

### module-federation

| 属性 | 详情 |
|------|------|
| **GitHub** | webpack/webpack |
| **Stars** | 维基百科级项目 |
| **npm** | `webpack` |
| **官网** | <https://webpack.js.org/concepts/module-federation/> |

#### 简介

Module Federation 是 Webpack 5 内置的模块联邦功能，允许多个独立构建的 JavaScript 应用之间在运行时动态共享模块，是构建微前端架构的核心技术。

#### 适用场景

- 大型前端应用拆分与团队并行开发
- 构建共享组件库或设计系统
- 渐进式迁移遗留系统
- 需要运行时动态加载远程模块

#### 技术栈

- **构建工具**: Webpack 5+
- **JavaScript**: ES6+ / TypeScript
- **框架支持**: React, Vue, Angular, Svelte 等任何框架
- **模块格式**: ESM / CommonJS

#### 代码示例

**远程应用配置 (remote-app/webpack.config.js)**

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Header': './src/components/Header',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

**宿主应用配置 (host-app/webpack.config.js)**

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',
      remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

**使用远程组件**

```javascript
import React, { Suspense, lazy } from 'react';

const RemoteButton = lazy(() => import('remoteApp/Button'));

function App() {
  return (
    <Suspense fallback="Loading...">
      <RemoteButton />
    </Suspense>
  );
}
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 官方原生支持，稳定可靠 | ❌ 强依赖 Webpack 构建工具 |
| ✅ 运行时动态加载模块 | ❌ 不支持 Vite 开发模式（需 build） |
| ✅ 智能共享依赖，减少重复加载 | ❌ 学习曲线较陡峭 |
| ✅ 框架无关，支持任意技术栈 | ❌ 版本兼容性需要仔细管理 |
| ✅ 支持双向引用 | ❌ 调试相对复杂 |

---

### @module-federation/enhanced

| 属性 | 详情 |
|------|------|
| **GitHub** | module-federation/core |
| **npm** | `@module-federation/enhanced` |
| **官网** | <https://module-federation.io/> |

#### 简介

Module Federation 2.0 增强版，2024年由字节跳动 Web Infra 团队与 Webpack 官方合作推出。提供更强大的运行时能力、Rspack 支持，以及独立的 Federation Runtime SDK。

#### 适用场景

- 需要 Rspack 高性能构建
- 复杂的多应用共享依赖管理
- 需要 TypeScript 类型提示
- 运行时动态注册和加载远程模块

#### 技术栈

- **构建工具**: Webpack 5+, Rspack
- **运行时**: Federation Runtime SDK
- **语言**: TypeScript（内置类型支持）

#### 代码示例

**运行时动态加载（无需构建时配置）**

```javascript
import { init, loadRemote } from '@module-federation/enhanced/runtime';

init({
  name: '@demo/app-main',
  remotes: [
    {
      name: '@demo/app1',
      entry: 'http://localhost:3005/mf-manifest.json',
      alias: 'app1',
    },
    {
      name: '@demo/app2',
      entry: 'http://localhost:3006/remoteEntry.js',
      alias: 'app2',
    },
  ],
});

// 动态加载远程模块
const utils = await loadRemote('app2/util');
utils.add(1, 2, 3);
```

**Rspack 配置**

```javascript
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        remote1: 'remote1@http://localhost:3001/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 支持 Rspack，构建速度提升 10 倍+ | ❌ 相对较新，生态仍在完善 |
| ✅ 独立 Runtime SDK，框架无关 | ❌ 需要升级现有构建工具链 |
| ✅ 内置 TypeScript 类型支持 | ❌ 配置比基础版更复杂 |
| ✅ 运行时插件机制 | ❌ 文档社区仍在建设中 |
| ✅ 统一多构建工具标准 | ❌ 可能需要重构现有代码 |

---

## 独立框架

### qiankun

| 属性 | 详情 |
|------|------|
| **GitHub** | umijs/qiankun |
| **Stars** | ⭐ 15.4k |
| **npm** | `qiankun` |
| **官网** | <https://qiankun.umijs.org/> |
| **公司** | 阿里巴巴（蚂蚁集团） |

#### 简介

qiankun 是一个基于 single-spa 的微前端实现库，孵化自蚂蚁集团金融级应用实践。提供开箱即用的微前端解决方案，已在阿里内部支撑 2000+ 微应用。

#### 适用场景

- 企业级中后台系统
- 遗留系统渐进式改造
- 需要强隔离的生产环境
- 多团队协作的大型项目

#### 技术栈

- **基础**: single-spa
- **沙箱**: ProxySandbox / SnapshotSandbox / LegacySandbox
- **样式隔离**: Shadow DOM / Scoped CSS
- **框架支持**: 任何框架（Vue, React, Angular, jQuery等）

#### 代码示例

**主应用**

```javascript
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:7100',
    container: '#container',
    activeRule: '/react',
  },
  {
    name: 'vueApp',
    entry: '//localhost:7101',
    container: '#container',
    activeRule: '/vue',
  },
], {
  beforeLoad: (app) => console.log('before load', app.name),
  afterMount: (app) => console.log('after mount', app.name),
});

start({
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true,
  },
  prefetch: true,
});
```

**子应用 (React)**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 渲染函数
function render(props = {}) {
  const { container } = props;
  const root = ReactDOM.createRoot(
    container ? container.querySelector('#root') : document.getElementById('root')
  );
  root.render(<App />);
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出生命周期
export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  const root = container
    ? container.querySelector('#root')
    : document.getElementById('root');
  ReactDOM.unmountComponentAtNode(root);
}
```

**子应用 webpack 配置**

```javascript
module.exports = {
  output: {
    library: `${packageName}-[name]`,
    libraryTarget: 'umd',
    chunkLoadingGlobal: `webpackJsonp_${packageName}`,
  },
};
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ HTML Entry，接入简单（像iframe一样） | ❌ 不支持 Vite/ESM（qiankun 2.x） |
| ✅ 完善的 JS/CSS 沙箱隔离 | ❌ 改造 webpack 配置较多 |
| ✅ 资源预加载能力 | ❌ 无法同时激活多个子应用 |
| ✅ 路由保持与自动同步 | ❌ 不支持子应用保活 |
| ✅ 社区活跃，文档完善 | ❌ 对 eval 存在安全争议 |
| ✅ Umi 插件支持一键接入 | ❌ IE 环境只能单实例 |

---

### single-spa

| 属性 | 详情 |
|------|------|
| **GitHub** | single-spa/single-spa |
| **Stars** | ⭐ 13k |
| **npm** | `single-spa` |
| **官网** | <https://single-spa.js.org/> |

#### 简介

single-spa 是最早的微前端框架，被誉为"前端微服务的 JavaScript 框架"。它是一个将多个单页面应用聚合为一个整体应用的微前端路由器，生态完善，社区活跃。

#### 适用场景

- 技术栈异构的多团队协作项目
- 需要精细控制应用生命周期的场景
- 已有应用的前后端分离改造
- 长期维护的大型项目

#### 技术栈

- **模块加载**: SystemJS / ES Modules / AMD
- **路由**: 基于 URL 的声明式路由匹配
- **生命周期**: bootstrap, mount, unmount, unload
- **框架支持**: React, Vue, Angular, Svelte, 原生 JS 等

#### 代码示例

**根配置应用 (root-config)**

```javascript
import { registerApplication, start } from 'single-spa';

// 注册应用
registerApplication({
  name: 'app1',
  app: () => System.import('app1'),
  activeWhen: '/app1',
  customProps: { authToken: 'abc123' },
});

registerApplication({
  name: 'navbar',
  app: () => System.import('navbar'),
  activeWhen: () => true, // 始终激活
});

// 启动
start({
  urlRerouteOnly: true,
});
```

**子应用入口**

```javascript
// app1.js
const lifecycles = {
  bootstrap: async (props) => {
    console.log('app1 bootstraped', props);
  },
  mount: async (props) => {
    const container = document.getElementById('app1-container');
    container.innerHTML = '<h1>App 1 is mounted!</h1>';

    // React 应用
    ReactDOM.render(<App />, container);
  },
  unmount: async (props) => {
    const container = document.getElementById('app1-container');
    ReactDOM.unmountComponentAtNode(container);
  },
};

export const { bootstrap, mount, unmount } = lifecycles;
```

**SystemJS Import Map**

```html
<script type="systemjs-importmap">
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5/lib/system/single-spa.min.js",
    "app1": "//localhost:8080/app1.js",
    "navbar": "//localhost:8081/navbar.js"
  }
}
</script>
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 生态最完善，生态工具丰富 | ❌ 需要较多配置和改造工作 |
| ✅ 框架无关，支持任意技术栈 | ❌ 不提供 JS/CSS 沙箱（需额外实现） |
| ✅ 精确的生命周期管理 | ❌ 学习曲线陡峭 |
| ✅ 支持多应用同时激活 | ❌ 需要 SystemJS 等模块加载器 |
| ✅ 社区活跃，文档完善 | ❌ 生产环境需要额外隔离方案 |

---

### micro-app

| 属性 | 详情 |
|------|------|
| **GitHub** | jd-opensource/micro-app |
| **Stars** | ⭐ 5.2k |
| **npm** | `@micro-zoe/micro-app` |
| **官网** | <https://micro-zoe.github.io/micro-app/> |
| **公司** | 京东零售 |

#### 简介

micro-app 是京东零售团队推出的微前端框架，基于类 WebComponent + 虚拟路由系统实现。以组件化思维实现微前端，接入成本最低，京东商城已接入 300+ 微应用。

#### 适用场景

- 快速接入微前端，降低改造成本
- 跨团队协作的敏捷交付项目
- 需要保留子应用完整状态（保活）
- 对 Vite 有支持需求的场景

#### 技术栈

- **核心技术**: CustomElements + Proxy
- **沙箱**: JS 沙箱 / 样式隔离
- **路由**: 虚拟路由系统
- **体积**: ~10kb (gzip)

#### 代码示例

**主应用入口**

```javascript
import microApp from '@micro-zoe/micro-app';

microApp.start({
  lifeCycles: {
    created(e, appName) {
      console.log('创建', appName);
    },
    beforemount(e, appName) {
      console.log('挂载前', appName);
    },
    mounted(e, appName) {
      console.log('已挂载', appName);
    },
    unmount(e, appName) {
      console.log('已卸载', appName);
    },
    error(e, appName) {
      console.log('报错', appName);
    },
  },
  plugins: {
    modules: {
      'appName': [{
        loader(code, url, options) {
          console.log('loader', code, url, options);
          return code;
        },
      }],
    },
  },
});
```

**使用 micro-app 组件**

```jsx
import React from 'react';

function MyPage() {
  return (
    <div>
      <h1>子应用</h1>
      {/* name: 应用名称, url: 应用地址, keep-alive: 保活模式 */}
      <micro-app
        name='my-app'
        url='http://localhost:3000/'
        keep-alive
        inline
        disableSandbox={false}
      />
    </div>
  );
}
```

**子应用（无需改动或极少改动）**

```javascript
// 子应用仅需设置跨域（开发环境）
// vue.config.js / webpack.config.js
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
}
```

**数据通信**

```javascript
// 主应用向子应用发送数据
const microAppElement = document.querySelector('micro-app[name="my-app"]');
microAppElement.setData({ type: 'update', data: { user: 'admin' } });

// 子应用接收数据
window.microApp.addDataListener((data) => {
  console.log('来自主应用的数据:', data);
});

// 子应用向主应用发送数据
window.microApp.dispatch({ type: 'notify', message: 'Hello' });
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 接入成本最低，像使用 iframe 一样简单 | ❌ 依赖 CustomElements 和 Proxy（不兼容 IE） |
| ✅ 支持子应用保活 | ❌ 主应用样式可能污染子应用 |
| ✅ 天然支持 Vite（1.0+） | ❌ 主子应用路由模式必须一致 |
| ✅ JS/CSS 隔离完善 | ❌ 相对较新，社区规模较小 |
| ✅ 体积轻量 (~10kb) | ❌ 文档社区仍在完善 |
| ✅ Fiber 模式提升渲染性能 | ❌ 某些场景下可能存在兼容问题 |

---

### garfish

| 属性 | 详情 |
|------|------|
| **GitHub** | modern-js-dev/garfish |
| **Stars** | ⭐ 4k+ |
| **npm** | `@garfish/core` |
| **官网** | <https://www.garfishjs.org/> |
| **公司** | 字节跳动 |

#### 简介

Garfish 是字节跳动开源的微前端框架，服务超过 100+ 前端团队、400+ 项目。提供完整的微前端解决方案，包含核心运行时使用、浏览器 VM 沙箱、路由插件等。

#### 适用场景

- 大型企业级应用
- 需要完整工具链支持
- Modern.js 生态用户
- 对性能有较高要求

#### 技术栈

- **核心**: @garfish/core
- **沙箱**: VM 沙箱 / 快照沙箱
- **路由**: GarfishRouter
- **集成**: Modern.js 深度集成

#### 代码示例

**主应用**

```javascript
import Garfish from 'garfish';

Garfish.run({
  basename: '/',
  domGetter: '#subApp',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: 'http://localhost:3000', // HTML 入口
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      entry: 'http://localhost:8080/index.js', // JS 入口
    },
  ],
  // 生命周期
  beforeLoad(appInfo) {
    console.log('开始加载', appInfo.name);
  },
  afterMount(appInfo) {
    console.log('挂载完成', appInfo.name);
  },
  beforeUnmount(appInfo) {
    console.log('开始卸载', appInfo.name);
  },
  afterUnmount(appInfo) {
    console.log('卸载完成', appInfo.name);
  },
  errorLoadApp(error, appInfo) {
    console.error('加载失败', appInfo.name, error);
  },
});
```

**子应用**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

export const provider = () => ({
  // 渲染函数
  render({ dom, basename }) {
    ReactDOM.render(
      <React.StrictMode>
        <App basename={basename} />
      </React.StrictMode>,
      dom.querySelector('#root'),
    );
  },
  // 销毁函数
  destroy({ dom }) {
    ReactDOM.unmountComponentAtNode(
      dom.querySelector('#root')
    );
  },
});
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 完整的插件系统 | ❌ 社区相对较小 |
| ✅ 支持 HTML/JS 两种入口 | ❌ 文档相比 qiankun 不够丰富 |
| ✅ VM 沙箱隔离效果好 | ❌ 需要 Modern.js 生态配合最佳 |
| ✅ 字节跳动大规模验证 | ❌ 学习成本较高 |
| ✅ 支持应用缓存 | ❌ 生态工具链依赖较多 |

---

### wujie

| 属性 | 详情 |
|------|------|
| **GitHub** | Tencent/wujie |
| **Stars** | ⭐ 4k+ (腾讯开源追踪显示 4.9k) |
| **npm** | `wujie` |
| **官网** | <https://wujie-micro.github.io/doc/> |
| **公司** | 腾讯文档团队 |

#### 简介

无界（Wujie）是腾讯文档团队开源的微前端框架，基于 WebComponent 容器 + iframe 沙箱。解决适配成本、样式隔离、运行性能、页面白屏、子应用通信、子应用保活、多应用激活等一系列问题。

#### 适用场景

- 需要极致隔离的安全场景
- 第三方应用接入
- 需要子应用保活或多应用同时激活
- Vite 项目微前端化
- 对内存占用敏感的场景

#### 技术栈

- **核心技术**: WebComponent + iframe
- **渲染**: 类 Shadow DOM 方案
- **沙箱**: iframe 原生沙箱
- **兼容性**: IE9+（降级方案）

#### 代码示例

**主应用**

```javascript
import { startApp, preloadApp, destroyApp, setupApp } from 'wujie';

// 预加载
preloadApp({
  name: 'app1',
  url: 'http://localhost:8080',
});

// 配置应用
setupApp({
  name: 'app1',
  url: 'http://localhost:8080',
  exec: true,
  props: { token: 'abc123' },
});

// 启动应用
startApp({
  name: 'app1',
  el: '#wujie-container',
  sync: true, // 同步路由
  alive: true, // 保活模式
  fetch: (url, options) => customFetch(url, options), // 自定义 fetch
  plugins: [
    {
      // 插件生命周期
      patchElement: [{
        selector: 'script[src="xxx.js"]',
        action: (element) => {
          element.setAttribute('crossorigin', 'anonymous');
        },
      }],
    },
  ],
});

// 通信
bus.$on('event-from-sub', (msg) => {
  console.log('来自子应用的消息:', msg);
});
bus.$emit('event-to-sub', { data: 'hello' });
```

**子应用（无侵入或极少侵入）**

```javascript
// 子应用无需特殊导出生命周期
// 如需获取主应用传递的 props
if (window.$wujie) {
  console.log(window.$wujie.props);

  // 向主应用发送消息
  window.$wujie.bus.$emit('notify', { message: 'Hello from sub app' });
}
```

**Vue 组件式使用**

```vue
<template>
  <WujieVue
    width="100%"
    height="100%"
    name="app1"
    :url="url"
    :sync="true"
    :alive="true"
    :props="{ token }"
    @beforeLoad="beforeLoad"
    @beforeMount="beforeMount"
    @afterMount="afterMount"
    @beforeUnmount="beforeUnmount"
    @afterUnmount="afterUnmount"
  />
</template>

<script setup>
import { ref } from 'vue';
const url = ref('http://localhost:8080');
const token = ref('abc123');

const beforeLoad = () => console.log('加载前');
const beforeMount = () => console.log('挂载前');
const afterMount = () => console.log('挂载后');
const beforeUnmount = () => console.log('卸载前');
const afterUnmount = () => console.log('卸载后');
</script>
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ iframe 原生 JS 沙箱，最可靠 | ❌ iframe 带来的部分问题（已优化） |
| ✅ WebComponent 样式隔离 | ❌ 相对较新，社区规模小 |
| ✅ 支持子应用保活 | ❌ 富文本编辑器等复杂交互需额外处理 |
| ✅ 支持多应用同时激活 | ❌ 文档相对简略 |
| ✅ 内存占用减少 60%（相比传统 iframe） | ❌ 通信延迟 <50ms（但仍有延迟） |
| ✅ 支持 Vite | ❌ 某些库可能存在兼容性问题 |
| ✅ 接入成本低，开箱即用 | ❌  issue 响应速度一般 |

---

## 构建工具集成

### vite-plugin-federation

| 属性 | 详情 |
|------|------|
| **GitHub** | originjs/vite-plugin-federation |
| **Stars** | ⭐ 1.2k+ |
| **npm** | `@originjs/vite-plugin-federation` |

#### 简介

Vite/Rollup 的 Module Federation 插件，受 Webpack Module Federation 启发，与其兼容。支持 Vite 生态实现模块联邦功能。

#### 适用场景

- Vite 项目需要模块联邦能力
- Vite + Webpack 混合架构
- 需要构建时模块共享

#### 技术栈

- **构建工具**: Vite / Rollup
- **模块格式**: ESM / SystemJS / UMD
- **兼容性**: 与 Webpack Module Federation 互操作

#### 代码示例

**远程应用 (vite.config.js)**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote-app',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.jsx',
        './Header': './src/components/Header.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

**宿主应用 (vite.config.js)**

```javascript
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host-app',
      remotes: {
        remote_app: 'http://localhost:4173/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
  },
});
```

**使用远程组件**

```javascript
import { defineAsyncComponent, Suspense } from 'vue';

const RemoteButton = defineAsyncComponent(() => import('remote_app/Button'));

<template>
  <Suspense fallback="Loading...">
    <RemoteButton />
  </Suspense>
</template>
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 支持 Vite 快速开发体验 | ❌ 仅 Host 端支持 Dev 模式 |
| ✅ 与 Webpack MF 兼容 | ❌ Remote 端必须 build |
| ✅ 支持混合使用不同构建工具 | ❌ React 混合使用可能有问题 |
| ✅ 社区维护活跃 | ❌ 功能不如官方 MF 完善 |

---

### @module-federation/vite

| 属性 | 详情 |
|------|------|
| **GitHub** | module-federation/vite |
| **npm** | `@module-federation/vite` |
| **官网** | <https://module-federation.io/> |

#### 简介

Module Federation 官方推出的 Vite 插件，作为增强版的一部分，提供更完善的 Vite 支持。

#### 代码示例

**宿主应用**

```typescript
import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    federation({
      name: 'host',
      remotes: {
        remote: {
          type: 'module',
          name: 'remote',
          entry: 'https://example.com/remoteEntry.js',
          shareScope: 'default',
        },
      },
      shared: ['vue'],
    }),
  ],
  server: {
    origin: 'http://localhost:3000',
  },
  build: {
    target: 'chrome89',
  },
});
```

**Vue 中使用**

```vue
<script setup>
import { defineAsyncComponent } from 'vue';
const RemoteMFE = defineAsyncComponent(() => import('remote/remote-app'));
</script>

<template>
  <RemoteMFE v-if="!!RemoteMFE" />
</template>
```

---

## 运行时解决方案

### import-remote

| 属性 | 详情 |
|------|------|
| **GitHub** | 搜索显示相关项目较少 |
| **npm** | `import-remote` |
| **Stars** | ~2k（估算） |

#### 简介

import-remote 是一个用于远程模块加载的轻量级库，支持在运行时动态导入远程 JavaScript 模块，适合简单的微前端场景或作为其他微前端框架的补充。

#### 适用场景

- 简单的远程脚本加载
- 需要动态加载第三方组件
- 轻量级微前端方案

#### 代码示例

```javascript
import { importRemote } from 'import-remote';

// 动态加载远程模块
const remoteModule = await importRemote({
  url: 'http://localhost:3000/remote-app.js',
  scope: 'remoteApp',
  module: './Component',
});

// 使用远程组件
const RemoteComponent = remoteModule.default;
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 轻量级，简单易用 | ❌ 功能相对简单 |
| ✅ 无需复杂配置 | ❌ 缺乏完整的沙箱隔离 |
| ✅ 适合小型项目 | ❌ 生态和社区较小 |

---

### systemjs

| 属性 | 详情 |
|------|------|
| **GitHub** | systemjs/systemjs |
| **Stars** | ⭐ 13k |
| **npm** | `systemjs` |
| **官网** | <https://github.com/systemjs/systemjs> |

#### 简介

SystemJS 是一个可钩子的、基于标准的模块加载器，支持在旧浏览器中运行为原生 ES 模块编写的代码。它支持 AMD、CommonJS、ESM 等多种模块格式，是 single-spa 等微前端框架的基础。

#### 适用场景

- 需要兼容旧浏览器（IE11+）
- 混合使用多种模块格式
- single-spa 生态项目
- 动态模块加载需求

#### 技术栈

- **模块格式**: System.register, AMD, CommonJS, ESM
- **浏览器支持**: IE11+ / 所有现代浏览器
- **Import Maps**: 原生支持

#### 代码示例

**基础使用**

```html
<script src="system.js"></script>
<script type="systemjs-importmap">
{
  "imports": {
    "lodash": "https://unpkg.com/lodash@4.17.10/lodash.js",
    "app": "/js/main.js"
  }
}
</script>
<script type="systemjs-module" src="/js/main.js"></script>
```

**动态导入**

```javascript
System.import('/js/main.js').then((module) => {
  module.run();
});

// 使用 Import Map
System.import('lodash').then((_) => {
  console.log(_.chunk([1, 2, 3, 4], 2));
});
```

**模块定义**

```javascript
// System.register 格式
System.register(['lodash'], function(exports) {
  let _;
  return {
    setters: [function(module) {
      _ = module.default;
    }],
    execute: function() {
      exports('run', function() {
        console.log(_.chunk([1, 2, 3], 2));
      });
    }
  };
});
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 支持多种模块格式 | ❌ 性能比原生 ESM 慢约 1.5 倍 |
| ✅ IE11+ 兼容性 | ❌ 额外的运行时开销 |
| ✅ Import Maps 支持 | ❌ 现代化项目逐步迁移到原生 ESM |
| ✅ 成熟的生态系统 | ❌ 新项目推荐使用原生 ESM |
| ✅ single-spa 生态基础 | ❌ 配置相对复杂 |

---

## 微前端辅助

### @micro-zoe/micro-app

| 属性 | 详情 |
|------|------|
| **GitHub** | jd-opensource/micro-app |
| **Stars** | ⭐ 5.7k |
| **npm** | `@micro-zoe/micro-app` |
| **公司** | 京东零售 |

#### 简介

即 micro-app 框架本身（见上文独立框架部分），作为精简高效的微前端方案，提供 JS 沙箱、样式隔离、元素隔离、预加载等完善功能。

#### 特点

- 接入成本最低
- 体积轻量 (~10kb gzip)
- 零依赖
- 支持任何前端框架

---

### lodash-import-removal

| 属性 | 详情 |
|------|------|
| **类型** | Babel 插件 / 构建工具插件 |
| **用途** | 优化 lodash 导入，减少包体积 |

#### 简介

用于微前端场景下优化 lodash 等库加载的辅助工具。通过自动转换 `import { debounce } from 'lodash'` 为 `import debounce from 'lodash/debounce'`，实现按需加载，减少重复依赖。

#### 代码示例

**Babel 配置**

```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['lodash-import-removal', { libraryName: 'lodash' }],
    ['import', { libraryName: 'antd', style: 'css' }],
  ],
};
```

**转换效果**

```javascript
// 转换前
import { debounce, throttle } from 'lodash';

// 转换后
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

#### 优缺点

| 优点 | 缺点 |
|------|------|
| ✅ 减少微前端应用的依赖体积 | ❌ 需要额外的构建配置 |
| ✅ 避免共享依赖冲突 | ❌ 仅针对特定库优化 |
| ✅ 自动转换，无需手动修改 | ❌ 对 tree-shaking 支持好的项目作用有限 |

---

## 框架对比总结

### 综合对比表

| 框架 | Stars | 接入成本 | JS 隔离 | CSS 隔离 | Vite 支持 | 保活 | 维护状态 |
|------|-------|----------|---------|----------|-----------|------|----------|
| **qiankun** | 15.4k | 中 | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ❌ | ⭐⭐⭐ |
| **single-spa** | 13k | 高 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **micro-app** | 5.2k | 低 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **garfish** | 4k+ | 中 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **wujie** | 4k+ | 低 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Module Federation** | - | 中 | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **SystemJS** | 13k | 中 | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ |

### 选型建议

1. **追求稳定成熟**
   - 选择 **qiankun**（阿里生态、文档完善、生产验证）
   - 选择 **single-spa**（生态最完善、社区最大）

2. **追求低接入成本**
   - 选择 **wujie**（腾讯出品、开箱即用、支持保活）
   - 选择 **micro-app**（京东出品、组件化使用、接入最简单）

3. **追求性能与构建效率**
   - 选择 **@module-federation/enhanced** + Rspack（构建速度 10x）
   - 选择 **Module Federation**（Webpack 5 原生）

4. **Vite 项目**
   - 首选 **wujie** 或 **micro-app**（原生支持）
   - 次选 **@module-federation/vite**（模块联邦方案）

5. **需要极致隔离**
   - 选择 **wujie**（iframe 原生沙箱）
   - 选择 **micro-app**（类 Shadow DOM 隔离）

6. **遗留系统改造**
   - 选择 **qiankun**（HTML Entry、渐进式接入）
   - 选择 **single-spa**（生命周期可控、兼容性好）

---

## 参考资源

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [single-spa 官方文档](https://single-spa.js.org/)
- [micro-app 官方文档](https://micro-zoe.github.io/micro-app/)
- [wujie 官方文档](https://wujie-micro.github.io/doc/)
- [garfish 官方文档](https://www.garfishjs.org/)
- [Module Federation 官方文档](https://module-federation.io/)
- [SystemJS GitHub](https://github.com/systemjs/systemjs)
