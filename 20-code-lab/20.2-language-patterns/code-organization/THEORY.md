# 代码组织 — 理论基础

## 1. 模块化原则

### 单一职责原则（SRP）

每个模块只负责一个功能领域，修改原因只有一个。

### 依赖倒置原则（DIP）

高层模块不应依赖低层模块，两者都应依赖抽象。

### 稳定依赖原则（SDP）

模块应依赖于比它更稳定的模块。

## 2. 项目结构模式

### 按功能组织（Feature-Based）

```
src/
  features/
    auth/
      api.ts
      store.ts
      components/
      hooks/
    dashboard/
      ...
```

优点：功能内聚，添加新功能只需新建目录。

### 按类型组织（Type-Based）

```
src/
  components/
  hooks/
  utils/
  services/
```

优点：同类文件集中，适合小型项目。

### 整洁架构（Clean Architecture）

```
src/
  domain/      # 核心业务规则，无外部依赖
  application/ # 用例编排
  infrastructure/ # 框架、数据库、外部服务
  presentation/   # UI 层
```

## 3. Barrel Export 模式与类型安全导入

```typescript
// features/auth/index.ts — Barrel 文件
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export type { AuthUser, AuthState } from './types';

// 消费者代码
import { useAuth, type AuthUser } from '@/features/auth';
```

```typescript
// 使用 TypeScript project references 实现跨包类型隔离
// tsconfig.json (packages/ui)
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}

// tsconfig.json (apps/web)
{
  "references": [{ "path": "../../packages/ui" }]
}
```

## 4. 依赖注入与控制反转（IoC）

```typescript
// domain/EmailService.ts — 抽象接口
export interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// infrastructure/SendGridEmailService.ts — 具体实现
export class SendGridEmailService implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    // SendGrid API 调用
  }
}

// application/UserRegistration.ts — 高层只依赖抽象
export class UserRegistration {
  constructor(private emailService: EmailService) {}

  async register(email: string) {
    // ... 业务逻辑
    await this.emailService.send(email, 'Welcome', 'Thanks for signing up!');
  }
}

// composition.ts — 在入口组装依赖
const emailService = new SendGridEmailService();
const registration = new UserRegistration(emailService);
```

## 5. 模块边界强制：封装私有 API 面

```typescript
// packages/utils/src/index.ts — 显式导出公共 API
export { formatDate } from './formatDate';
export { parseQuery } from './parseQuery';
// 不导出内部辅助函数，避免外部依赖

// packages/utils/package.json — 限制可导入路径
{
  "name": "@myrepo/utils",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./internal/*": null  // 禁止直接导入内部文件
  }
}
```

```typescript
// .eslintrc.cjs — 使用 ESLint 限制跨层依赖
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@/features/*/*'],
          message: '禁止跨 Feature 直接导入内部模块，请使用公开的 Barrel Export',
        },
        {
          group: ['@/infrastructure/*'],
          message: 'Domain 层禁止直接依赖 Infrastructure 层',
        },
      ],
    }],
  },
};
```

## 6. 仓库与代码组织策略对比

| 维度 | Monorepo | Polyrepo |
|------|----------|----------|
| **代码共享** | 直接内部引用，无需发布 npm 包 | 通过私有 registry 或 git submodule 共享 |
| **版本协同** | 原子提交可跨包更新 | 各仓库独立版本，升级成本高 |
| **构建工具** | Nx、Turborepo、Rush、pnpm workspaces | 各项目独立配置 |
| **权限控制** | 依赖代码库级权限（CODEOWNERS） | 仓库级权限天然隔离 |
| **CI/CD** | 全局依赖图分析，仅构建受影响包 | 各仓库独立流水线 |
| **适用场景** | 大型团队、强关联的多包项目 | 开源生态、团队高度自治 |

| 维度 | Feature-Based | Type-Based |
|------|---------------|------------|
| **文件分布** | 按业务功能内聚 | 按技术类型聚合 |
| **可扩展性** | 新增功能 = 新增目录，不污染现有结构 | 项目变大后目录膨胀 |
| **团队协作** | 减少代码冲突，功能边界清晰 | 多人同时修改同类型目录 |
| **适用规模** | 中大型应用、长期维护 | 小型项目、原型快速验证 |

## 7. Monorepo 配置示例（Turborepo）

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
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```json
// package.json (根目录)
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

```
my-monorepo/
├── apps/
│   ├── web/          # Next.js 应用
│   └── mobile/       # React Native 应用
├── packages/
│   ├── ui/           # 共享组件库
│   ├── utils/        # 工具函数
│   └── ts-config/    # 共享 TypeScript 配置
├── turbo.json
└── package.json
```

## 8. 循环依赖检测与消除

```typescript
// 使用 madge 检测循环引用
// npx madge --circular --extensions ts src/
// 输出示例：
// src/features/auth/store.ts -> src/features/user/api.ts -> src/features/auth/store.ts

// 解决方案：引入共享抽象层（domain/events.ts）
// auth/store.ts 发布事件
eventBus.emit('auth:login', { userId });
// user/api.ts 监听事件
eventBus.on('auth:login', ({ userId }) => refreshUserProfile(userId));
```

## 9. 路径别名与 TypeScript 配置

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  }
}
```

```typescript
// vite.config.ts / webpack.config.js 中同步配置
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
    },
  },
});
```

## 10. 依赖管理

- **显式依赖**: 每个模块声明其依赖，避免隐式全局状态
- **依赖方向**: 外层依赖内层，内层不感知外层
- **循环依赖检测**: 使用工具（如 madge）检测并消除循环引用

## 11. 与相邻模块的关系

- **06-architecture-patterns**: 架构模式的理论
- **59-fullstack-patterns**: 全栈项目的组织实践
- **23-toolchain-configuration**: 工具链配置支持代码组织

## 12. 新增代码示例

### 领域驱动设计（DDD）项目结构

```typescript
// DDD 分层目录结构示例
/*
src/
├── bounded-contexts/
│   └── order/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── Order.ts          # 聚合根
│       │   ├── value-objects/
│       │   │   └── Money.ts          # 不可变值对象
│       │   ├── events/
│       │   │   └── OrderCreated.ts   # 领域事件
│       │   └── repositories/
│       │       └── OrderRepository.ts # 接口（端口）
│       ├── application/
│       │   ├── commands/
│       │   │   └── CreateOrderHandler.ts
│       │   └── queries/
│       │       └── GetOrderByIdQuery.ts
│       └── infrastructure/
│           ├── persistence/
│           │   └── PrismaOrderRepository.ts # 适配器实现
│           └── messaging/
│               └── EventBusAdapter.ts
*/

// domain/entities/Order.ts
export class Order {
  private constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public readonly total: Money,
    public status: OrderStatus = 'pending'
  ) {}

  static create(items: OrderItem[]): Order {
    const total = items.reduce((sum, item) => sum.add(item.price.multiply(item.quantity)), Money.zero());
    return new Order(crypto.randomUUID(), items, total);
  }

  confirm(): void {
    if (this.status !== 'pending') throw new Error('Only pending orders can be confirmed');
    this.status = 'confirmed';
  }
}
```

### 模块联邦（Module Federation）微前端配置

```typescript
// webpack.config.js — Module Federation 配置
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell_app',
      remotes: {
        // 远程模块映射
        checkout: 'checkout@https://checkout.example.com/remoteEntry.js',
        product: 'product@https://product.example.com/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};

// 消费远程模块
// const ProductDetail = lazy(() => import('product/ProductDetail'));
```

### API 面测试（保护模块边界）

```typescript
// packages/ui/api-surface.test.ts — 确保公共 API 不变
import * as PublicAPI from './src/index';

describe('Public API Surface', () => {
  it('should only export expected components', () => {
    const exported = Object.keys(PublicAPI).sort();
    expect(exported).toEqual([
      'Button',
      'Card',
      'Modal',
      'useTheme',
      // 明确列出所有公开 API，防止意外暴露内部模块
    ]);
  });

  it('should not export internal utilities', () => {
    expect(PublicAPI).not.toHaveProperty('internalHelper');
  });
});
```

### 自动化依赖健康检查脚本

```typescript
// scripts/dependency-health.ts — 检查非法跨层导入
import { readFileSync } from 'fs';
import { globSync } from 'glob';

const LAYER_RULES = [
  { from: 'src/domain/', forbidden: ['src/infrastructure/', 'src/presentation/'] },
  { from: 'src/application/', forbidden: ['src/presentation/'] },
];

function checkLayerViolations(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const importRegex = /from ['"]([^'"]+)['"];?/g;
  const violations: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    for (const rule of LAYER_RULES) {
      if (filePath.includes(rule.from)) {
        for (const forbidden of rule.forbidden) {
          if (importPath.includes(forbidden.replace('src/', '@/'))) {
            violations.push(`${filePath}: illegal import from ${importPath} (violates ${rule.from} -> ${forbidden})`);
          }
        }
      }
    }
  }
  return violations;
}

// 运行检查
const files = globSync('src/**/*.ts');
const allViolations = files.flatMap(checkLayerViolations);
if (allViolations.length > 0) {
  console.error('Layer violations found:');
  allViolations.forEach(v => console.error('  -', v));
  process.exit(1);
}
console.log('✓ All layer dependencies are valid');
```

## 权威参考链接

- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [Nx 官方文档](https://nx.dev/getting-started/intro)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo.tools 对比指南](https://monorepo.tools/)
- [Google Monorepo 实践 (Eng)](https://research.google/pubs/pub45424/)
- [Feature-Based Project Structure](https://react-file-structure.surge.sh/)
- [Martin Fowler — BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [npm query 与依赖审计](https://docs.npmjs.com/cli/v10/commands/npm-query)
- [Dependency Cruiser — 可视化依赖关系](https://github.com/sverweij/dependency-cruiser)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#packages_exports) — 限制模块公开接口
- [TypeScript Handbook: Modules](https://www.typescriptlang.org/docs/handbook/modules.html) — 模块系统权威指南
- [ESLint no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports) — 依赖方向强制
- [Feature-Sliced Design](https://feature-sliced.design/) — 前端架构方法论
- [Turborepo 远程缓存](https://turbo.build/repo/docs/core-concepts/remote-caching) — CI 加速
- [pnpm Catalogs](https://pnpm.io/catalogs) — 集中版本管理
- [Nx 项目图与 affected 构建](https://nx.dev/features/explore-graph)
- [Module Federation — webpack](https://webpack.js.org/concepts/module-federation/) — 微前端模块共享
- [DDD Reference — Eric Evans](https://www.domainlanguage.com/ddd/reference/) — 领域驱动设计参考
- [OSGi Alliance — Modular Java](https://www.osgi.org/) — Java 模块化标准（跨语言参考）
- [Rust Modules and Crates](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html) — Rust 模块系统最佳实践
- [Go Modules Reference](https://go.dev/ref/mod) — Go 语言依赖管理权威文档

### Nx 项目图与 affected 构建

```json
{
  "extends": "nx/presets/core.json",
  "targetDefaults": {
    "build": { "dependsOn": ["^build"], "cache": true },
    "test": { "dependsOn": ["build"], "cache": true }
  }
}
```

```bash
npx nx affected -t build --base=main --head=HEAD
npx nx graph
```

### pnpm Workspace Catalog 集中版本管理

```yaml
# pnpm-workspace.yaml
catalog:
  react: ^18.2.0
  typescript: ^5.4.0

# package.json
# "dependencies": { "react": "catalog:" }
```

### 依赖可视化：Dependency Cruiser

```bash
npx depcruise src --include-only "^src" --output-type dot | dot -T svg > dependency-graph.svg
```

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
