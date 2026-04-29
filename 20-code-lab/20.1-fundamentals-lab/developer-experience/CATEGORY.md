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
| Turborepo 文档 | 官方文档 | [turbo.build/repo/docs](https://turbo.build/repo/docs) |
| pnpm Workspaces | 官方文档 | [pnpm.io/workspaces](https://pnpm.io/workspaces) |
| TypeScript — Project References | 官方文档 | [typescriptlang.org/docs/handbook/project-references.html](https://www.typescriptlang.org/docs/handbook/project-references.html) |
| Node.js — TTY 文档 | 官方文档 | [nodejs.org/api/tty.html](https://nodejs.org/api/tty.html) |
| MDN — Source Map | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/SourceMap) |
| Webpack — Hot Module Replacement | 官方文档 | [webpack.js.org/concepts/hot-module-replacement/](https://webpack.js.org/concepts/hot-module-replacement/) |

---

*最后更新: 2026-04-29*
