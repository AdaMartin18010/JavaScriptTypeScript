---
dimension: 工程实践
sub-dimension: 开发者体验
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「工程实践」** 维度，聚焦 开发者体验 核心概念与工程实践。

## 包含内容

- **热模块替换（HMR）**：Vite / Webpack HMR API、`import.meta.hot`、模块边界声明与状态保留。
- **快速刷新（Fast Refresh）**：React Fast Refresh 原理、组件级状态保持、错误恢复边界。
- **错误遮罩（Error Overlay）**：编译期错误捕获、运行时堆栈美化、Source Map 映射与点击跳转。
- **开发服务器代理**：Vite `server.proxy`、Webpack DevServer、HTTPS 自签名证书配置。
- **Monorepo 工具链**：Turborepo 管道缓存、pnpm workspaces、TypeScript Project References 增量编译。
- **CLI 交互体验**：进度条、交互式提示、彩色输出、TTY 检测与降级策略。

## 代码示例

### Vite HMR 接受模块更新

```typescript
// src/stores/counter.ts
export const counter = { count: 0 };

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 保留旧状态或迁移状态
      console.log('[HMR] counter module updated');
    }
  });
}
```

### React Fast Refresh 状态保持

```typescript
// Fast Refresh 通过以下规则保留组件状态：
// 1. 仅导出 React 组件的模块会被热更新
// 2.  hooks 调用顺序不变时，状态保留
// 3. 组件被替换为其他类型时，状态重置

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  // 修改此处 JSX 或添加辅助函数时，count 状态会保留
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 以下导出模式会破坏 Fast Refresh：
// ❌ export default () => <div />   // 匿名默认导出
// ✅ export default function Component() {} // 具名默认导出
```

### 运行时错误遮罩处理器

```typescript
interface ErrorOverlayPayload {
  message: string;
  stack: string;
  frame?: { file: string; line: number; column: number };
}

class ErrorOverlay {
  private el: HTMLDivElement | null = null;

  show(payload: ErrorOverlayPayload): void {
    this.hide();
    this.el = document.createElement('div');
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #1e1e1e; color: #ff5555; font-family: monospace;
      padding: 2rem; white-space: pre-wrap; overflow: auto;
    `;
    this.el.textContent = `[Runtime Error] ${payload.message}\n\n${payload.stack}`;
    document.body.appendChild(this.el);
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}

window.addEventListener('error', (e) => {
  new ErrorOverlay().show({ message: e.message, stack: e.error?.stack ?? '' });
});
```

### Vite 开发服务器代理配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
    https: {
      // mkcert 生成的本地可信证书
      key: './certs/localhost-key.pem',
      cert: './certs/localhost-cert.pem',
    },
  },
});
```

### Monorepo pnpm workspace + Turborepo 配置

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

### TypeScript Project References 增量编译

```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// apps/web/tsconfig.json
{
  "references": [{ "path": "../../packages/core" }],
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

> 使用 Project References 后，`tsc --build` 会增量编译，仅重新构建变更的依赖图。

### CLI 进度条与 TTY 检测

```typescript
import { WriteStream } from 'node:tty';

class ProgressBar {
  private total: number;
  private current = 0;
  private readonly width = 40;
  private readonly isTTY = process.stdout instanceof WriteStream && process.stdout.isTTY;

  constructor(total: number) {
    this.total = total;
  }

  update(current: number): void {
    this.current = current;
    if (!this.isTTY) {
      if (current === this.total) console.log('Done.');
      return;
    }
    const ratio = this.current / this.total;
    const filled = Math.round(this.width * ratio);
    const empty = this.width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r[${bar}] ${(ratio * 100).toFixed(1)}%`);
    if (this.current >= this.total) process.stdout.write('\n');
  }
}
```

### Vite 插件开发示例

```typescript
// plugins/html-transform.ts — 自定义 Vite 插件
import type { Plugin } from 'vite';

export function htmlTransformPlugin(): Plugin {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      // 注入全局环境变量或分析脚本
      return html.replace(
        '<head>',
        `<head>\n  <meta name="build-time" content="${new Date().toISOString()}">`
      );
    },
  };
}

// vite.config.ts
import { defineConfig } from 'vite';
import { htmlTransformPlugin } from './plugins/html-transform';

export default defineConfig({
  plugins: [htmlTransformPlugin()],
});
```

### React Error Boundary + Source Map 恢复

```tsx
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 上报到 Sentry / LogRocket
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: '2rem', color: 'red' }}>
            <h2>Something went wrong.</h2>
            <pre>{this.state.error?.stack}</pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

### Turborepo Remote Cache 配置

```json
// turbo.json — 远程缓存与签名验证
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "enabled": true,
    "signature": true
  },
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["NODE_ENV", "API_URL"]
    }
  }
}
```

```bash
# 配置远程缓存（Vercel / self-hosted）
npx turbo login
npx turbo link

# CI 中启用缓存
TURBO_TOKEN=$TOKEN TURBO_TEAM=$TEAM npx turbo run build
```

### 代码示例：自定义 Source Map 解析器

```typescript
// utils/parse-stack.ts — 将错误堆栈解析为结构化数据
import { SourceMapConsumer } from 'source-map';

interface StackFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  source?: string; // 原始源码行
}

export async function parseStackTrace(error: Error, sourceMapDir: string): Promise<StackFrame[]> {
  const lines = error.stack?.split('\n') ?? [];
  const frames: StackFrame[] = [];

  for (const line of lines) {
    const match = line.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/);
    if (!match) continue;

    const [, functionName, fileName, lineStr, colStr] = match;
    const frame: StackFrame = {
      functionName,
      fileName,
      lineNumber: parseInt(lineStr, 10),
      columnNumber: parseInt(colStr, 10),
    };

    // 尝试解析 Source Map
    try {
      const mapPath = `${sourceMapDir}/${fileName}.map`;
      const rawMap = await fs.promises.readFile(mapPath, 'utf-8');
      const consumer = await new SourceMapConsumer(rawMap);
      const original = consumer.originalPositionFor({
        line: frame.lineNumber,
        column: frame.columnNumber,
      });
      if (original.source) {
        frame.fileName = original.source;
        frame.lineNumber = original.line ?? frame.lineNumber;
        frame.columnNumber = original.column ?? frame.columnNumber;
        frame.source = consumer.sourceContentFor(original.source) ?? undefined;
      }
      consumer.destroy();
    } catch {
      // Source Map 不可用，保留编译后位置
    }

    frames.push(frame);
  }

  return frames;
}
```

### 代码示例：Vite 环境变量类型安全注入

```typescript
// types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENABLE_ANALYTICS: string; // "true" | "false"
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

```typescript
// config/env.ts — 运行时验证与转换
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false'),
});

export const env = envSchema.parse(import.meta.env);
export type Env = z.infer<typeof envSchema>;
```

### 代码示例：Webpack 模块联邦（Module Federation）微前端 HMR

```typescript
// webpack.config.ts — Module Federation 配置
import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';

export default {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host_app',
      remotes: {
        remote: 'remote_app@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
  devServer: {
    hot: true,
    // 模块联邦远程加载支持 HMR
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
```

## 常见误区

| 误区 | 正确理解 |
|------|---------|
| HMR 会保留所有状态 | 仅保留组件 hooks 状态；模块级变量可能重置 |
| Source Map 只在开发有用 | 生产环境 Source Map 是错误监控和调试的关键 |
| Turborepo 只缓存构建产物 | 也缓存 lint / test / typecheck 结果 |
| Project References 自动工作 | 需要 `composite: true` 和正确的 `references` 路径 |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cli-ux-patterns.test.ts
- 📄 cli-ux-patterns.ts
- 📄 dev-server.test.ts
- 📄 dev-server.ts
- 📄 error-overlay.test.ts
- 📄 error-overlay.ts
- 📄 fast-refresh.test.ts
- 📄 fast-refresh.ts
- 📄 hot-module-replacement.test.ts
- 📄 hot-module-replacement.ts
- 📄 index.ts
- 📄 monorepo-tooling.test.ts
- ... 等 5 个条目

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Vite — HMR API | 官方文档 | [vitejs.dev/guide/api-hmr.html](https://vitejs.dev/guide/api-hmr.html) |
| React — Fast Refresh | 官方文档 | [react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react) |
| React Fast Refresh 技术原理 | GitHub Wiki | [github.com/facebook/react/issues/16604](https://github.com/facebook/react/issues/16604) |
| Turborepo 文档 | 官方文档 | [turbo.build/repo/docs](https://turbo.build/repo/docs) |
| pnpm Workspaces | 官方文档 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| TypeScript — Project References | 官方文档 | [typescriptlang.org/docs/handbook/project-references.html](https://www.typescriptlang.org/docs/handbook/project-references.html) |
| Node.js — TTY 文档 | 官方文档 | [nodejs.org/api/tty.html](https://nodejs.org/api/tty.html) |
| MDN — Source Map | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap) |
| Webpack — Hot Module Replacement | 官方文档 | [webpack.js.org/concepts/hot-module-replacement/](https://webpack.js.org/concepts/hot-module-replacement/) |
| Vite Config Reference | 官方文档 | [vitejs.dev/config/server-options.html](https://vitejs.dev/config/server-options.html) |
| mkcert — 本地 HTTPS 证书 | 工具 | [github.com/FiloSottile/mkcert](https://github.com/FiloSottile/mkcert) |
| ANSI Escape Codes | 参考 | [en.wikipedia.org/wiki/ANSI_escape_code](https://en.wikipedia.org/wiki/ANSI_escape_code) |
| Vite Plugin API | 官方文档 | [vitejs.dev/guide/api-plugin.html](https://vitejs.dev/guide/api-plugin.html) |
| React — Error Boundaries | 官方文档 | [react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) |
| Source Map Revision 3 Spec | 规范 | [sourcemaps.info/spec.html](https://sourcemaps.info/spec.html) |
| Turbo Remote Caching | 官方文档 | [turbo.build/repo/docs/core-concepts/remote-caching](https://turbo.build/repo/docs/core-concepts/remote-caching) |
| Vite Dev Server Source Maps | 文档 | [vitejs.dev/config/build-options.html#build-sourcemap](https://vitejs.dev/config/build-options.html#build-sourcemap) |
| Webpack Module Federation | 官方文档 | [module-federation.io/](https://module-federation.io/) |
| React DevTools | 官方文档 | [react.dev/learn/react-developer-tools](https://react.dev/learn/react-developer-tools) |
| Chrome DevTools — JavaScript Debugging | 官方文档 | [developer.chrome.com/docs/devtools/javascript](https://developer.chrome.com/docs/devtools/javascript) |
| Node.js — Inspector Protocol | 官方文档 | [nodejs.org/en/learn/getting-started/debugging](https://nodejs.org/en/learn/getting-started/debugging) |
| Zod — Schema Validation | 官方文档 | [zod.dev](https://zod.dev/) |

---

*最后更新: 2026-04-29*
