# 定理 2：类型模块化定理

> **定位**：`10-fundamentals/10.1-language-semantics/theorems/`
> **关联**：`10-fundamentals/10.2-type-system/` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/` Monorepo 架构

---

## 定理陈述

**类型模块化定理**：当类型共享失控时，架构完整性必然腐蚀。类型的模块化不是可选优化，而是大规模系统中保持结构一致性的必要条件。

形式化表述：

设系统 $S$ 由模块集合 $\{M_1, M_2, ..., M_n\}$ 构成，类型依赖图为 $G = (V, E)$，其中 $V$ 为类型节点，$E$ 为类型依赖边。

$$\text{若 } \exists v \in V.\ \deg(v) > \theta_{\text{arch}} \Rightarrow \text{Integrity}(S) \downarrow$$

其中 $\theta_{\text{arch}}$ 为架构健康度阈值，$\deg(v)$ 为类型节点的度（被依赖数）。

---

## 推理树

```
                    [公理1: 结构子类型公理]
                    TS 采用结构子类型系统
                           │
                    [公理2: 类型即契约公理]
                    类型定义是模块间的编译期契约
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    [引理: Monorepo 类型共享]      [引理: 共享类型包膨胀]
    前后端共享类型定义               单一 @org/types 包含所有领域
              │                         │
              └────────────┬────────────┘
                           ▼
              [类型依赖图 G]
              · 节点 = 类型定义
              · 边 = 类型依赖
                           │
              是否存在高度节点？
              （deg(v) > θ_arch）
              ┌────────────┴────────────┐
              ▼                         ▼
         [否] 架构健康              [是] 类型共享失控
              │                         │
              │                    [后果1: 循环依赖]
              │                    类型包形成循环引用
              │                         │
              │                    [后果2: 影响不可预测]
              │                    修改单一类型触发全量重建
              │                         │
              │                    [后果3: 恐惧驱动开发]
              │                    开发者不敢修改类型定义
              │                         │
              │                    [架构完整性腐蚀]
              │                    分层边界被穿透
              │                    领域模型被污染
              │                    变更成本指数增长
              │                         │
              └────────────┬────────────┘
                           ▼
              [防御策略]
              · 按领域拆分类型包
              · Project References 形式化边界
              · 禁止深层跨包导入
              · 自动化循环依赖检测
```

---

## 关键引理

### 引理 2.1：结构子类型下的模块组合

**陈述**：在结构子类型系统中，模块组合满足交换律与结合律的弱化形式。

**说明**：与名义子类型（Java/C#）不同，TypeScript 的结构子类型不要求显式 `implements` 声明。这意味着模块 $M_A$ 可以隐式满足模块 $M_B$ 的类型契约，只要结构匹配。

**推论**：隐式兼容性增加了类型依赖的**隐蔽性**，需要工具辅助可视化。

### 引理 2.2：共享类型包的版本化契约

**陈述**：共享类型包（如 `@org/contracts`）应遵循语义化版本控制（SemVer），破坏性类型变更需要主版本号升级。

**形式化**：设类型契约 $C$ 的版本为 $v(C)$，若 $v(C)$ 升级导致下游编译错误，则 $\Delta v(C) \geq 1.0.0$。

---

## 代码示例：模块扩充（Module Augmentation）与声明合并

TypeScript 的声明合并（Declaration Merging）和模块扩充是实现类型模块化的高级技术，允许在不修改原始模块的情况下扩展类型定义。

```typescript
// ============================================
// 场景：插件架构中的类型模块化扩展
// ============================================

// 1. 核心模块：定义基础接口（不可变）
// packages/core/src/events.ts
export interface EventMap {
  'app:init': { timestamp: number };
  'app:error': { message: string; stack?: string };
}

export class EventBus<E extends EventMap = EventMap> {
  emit<K extends keyof E>(event: K, payload: E[K]): void {
    console.log(`[${String(event)}]`, payload);
  }
  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void): void {
    /* ... */
  }
}

// ============================================
// 2. 插件模块：通过 Module Augmentation 扩展类型
// packages/auth-plugin/src/augment.ts
// 无需修改 @org/core，即可注册新事件类型
// ============================================

declare module '@org/core' {
  // 扩展核心 EventMap，添加认证相关事件
  interface EventMap {
    'auth:login': { userId: string; method: 'password' | 'oauth' };
    'auth:logout': { userId: string; reason?: string };
    'auth:session-expired': { userId: string; expiredAt: Date };
  }
}

// 现在 EventBus 自动包含 auth 事件，并获得完整类型推断
import { EventBus } from '@org/core';

const bus = new EventBus();

bus.emit('auth:login', { userId: 'u-123', method: 'oauth' }); // ✅ 类型安全
// bus.emit('auth:login', { userId: 'u-123' }); // ❌ Error: method 必填

// ============================================
// 3. 跨包类型隔离：Project References 实践
// ============================================

// packages/tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,        // 启用 Project Reference 编译缓存
    "declaration": true,
    "declarationMap": true,
    "strict": true
  }
}

// packages/core/tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" },
  "include": ["src/**/*"]
}

// packages/auth-plugin/tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" }     // 显式声明编译依赖，禁止反向引用
  ]
}

// packages/web-app/tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" },
    { "path": "../auth-plugin" }
  ]
}

// ============================================
// 4. 品牌类型防止跨域类型混用
// ============================================

type UserId = string & { readonly __brand: 'UserId' };
type TenantId = string & { readonly __brand: 'TenantId' };

// 即使结构上完全相同（都是 string），品牌标记阻止隐式兼容
function transfer(userId: UserId, tenantId: TenantId) {
  /* ... */
}

const uid = 'u-123' as UserId;
const tid = 't-456' as TenantId;

transfer(uid, tid);    // ✅
// transfer(tid, uid); // ❌ Error: 参数位置颠倒，品牌不匹配
```

---

## 代码示例：Barrel File 反模式与依赖可视化

Barrel file（`index.ts` 集中导出）在大型 Monorepo 中会成为类型依赖图的**超级节点**，急剧增加节点度数。

```typescript
// ============================================
// 反模式：巨型 Barrel File 导致类型图中心化
// packages/types/src/index.ts（危险！）
// ============================================

// ❌ 单一导出点导致所有消费者依赖此节点
export * from './user';
export * from './order';
export * from './payment';
export * from './inventory';
export * from './shipping';
export * from './analytics';
export * from './notification';
// ... 50+ 领域

// ============================================
// 正模式：按领域拆分，消费者只引入所需子包
// packages/types-user/src/index.ts
// packages/types-order/src/index.ts
// ============================================

// ✅ 细粒度类型包，降低单节点度数
// import type { UserProfile } from '@org/types-user';
// import type { OrderLine } from '@org/types-order';

// ============================================
// 自动化检测：使用 dependency-cruiser 分析类型图
// .dependency-cruiser.js
// ============================================

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependency',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-deep-cross-import',
      comment: '禁止跨领域深层导入',
      severity: 'warn',
      from: { path: '^packages/([^/]+)/' },
      to: {
        path: '^packages/([^/]+)/',
        pathNot: '^packages/$1/',
        // 只允许通过公共 API（index.ts）导入
        reachable: false
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-peer', 'npm-optional']
    },
    tsConfig: { fileName: './tsconfig.json' }
  }
};

// CLI：生成类型依赖图并检测循环
// npx depcruise --config .dependency-cruiser.js --output-type dot src | dot -T svg > deps.svg
```

---

## 代码示例：类型依赖度数的脚本化监控

通过 TypeScript Compiler API 程序化分析类型节点的入度，实现架构健康度自动化监控。

```typescript
// scripts/analyze-type-graph.ts
import * as ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface TypeNode {
  name: string;
  file: string;
  inDegree: number;
  outDegree: number;
}

function analyzeTypeGraph(projectPath: string): TypeNode[] {
  const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists);
  if (!configPath) throw new Error('tsconfig.json not found');

  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options, fileNames } = ts.parseJsonConfigFileContent(
    config, ts.sys, path.dirname(configPath)
  );

  const program = ts.createProgram(fileNames, options);
  const checker = program.getTypeChecker();
  const graph = new Map<string, { inDegree: Set<string>; outDegree: Set<string> }>();

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;

    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (!symbol) return;

        const key = `${sourceFile.fileName}#${node.name.text}`;
        if (!graph.has(key)) graph.set(key, { inDegree: new Set(), outDegree: new Set() });

        // 分析类型体中的引用
        const type = checker.getTypeAtLocation(node);
        const properties = type.getProperties();
        for (const prop of properties) {
          const propType = checker.getTypeOfSymbolAtLocation(prop, node);
          const propSymbol = propType.getSymbol();
          if (propSymbol?.declarations?.[0]) {
            const declFile = propSymbol.declarations[0].getSourceFile().fileName;
            const targetKey = `${declFile}#${propSymbol.name}`;
            if (targetKey !== key) {
              graph.get(key)!.outDegree.add(targetKey);
              if (!graph.has(targetKey)) graph.set(targetKey, { inDegree: new Set(), outDegree: new Set() });
              graph.get(targetKey)!.inDegree.add(key);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  return Array.from(graph.entries())
    .map(([name, deps]) => ({ name, file: name.split('#')[0], inDegree: deps.inDegree.size, outDegree: deps.outDegree.size }))
    .sort((a, b) => b.inDegree - a.inDegree);
}

// 使用示例
const nodes = analyzeTypeGraph(process.cwd());
const threshold = 20;
const highDegreeNodes = nodes.filter(n => n.inDegree > threshold);

console.table(nodes.slice(0, 10));
if (highDegreeNodes.length > 0) {
  console.warn(`⚠️ 发现 ${highDegreeNodes.length} 个高度类型节点（阈值=${threshold}）`);
  console.warn('建议：拆分巨型 barrel file 或引入接口隔离模式（ISP）');
  process.exit(1);
}
```

---

## 工程实践：防御策略

| 策略 | 实现方式 | 效果 |
|------|---------|------|
| **领域拆分** | `@org/orders-types` / `@org/users-types` | 降低单节点度数 |
| **Project References** | `tsconfig.json` 显式声明依赖 | 编译期边界检查 |
| **禁止深层导入** | ESLint `no-restricted-imports` | 防止实现泄露 |
| **循环依赖检测** | CI 中运行 `madge --circular` | 自动化架构健康检查 |
| **品牌类型** | `type UserId = string & { readonly __brand: 'UserId' }` | 防止语义相同类型混用 |
| **依赖可视化** | `dependency-cruiser` + Graphviz | 类型依赖图持续监控 |

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **TypeScript Handbook: Declaration Merging** | 官方声明合并与模块扩充文档 | [typescriptlang.org/docs/handbook/declaration-merging.html](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |
| **TypeScript Project References** | 官方 Project References 指南 | [typescriptlang.org/docs/handbook/project-references.html](https://www.typescriptlang.org/docs/handbook/project-references.html) |
| **Nx Monorepo: Enforce Module Boundaries** | 大规模 Monorepo 类型边界实践 | [nx.dev/features/enforce-module-boundaries](https://nx.dev/features/enforce-module-boundaries) |
| **Turborepo: TypeScript Best Practices** | Vercel 的 Monorepo TS 建议 | [turbo.build/repo/docs/handbook/linting/typescript](https://turbo.build/repo/docs/handbook/linting/typescript) |
| **madge** | 循环依赖检测 CLI 工具 | [github.com/pahen/madge](https://github.com/pahen/madge) |
| **dependency-cruiser** | 架构依赖可视化与规则检查 | [github.com/sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) |
| **TypeScript Brand Types Deep Dive** | 社区品牌类型最佳实践 | [egghead.io/blog/branded-types-in-typescript](https://egghead.io/blog/branded-types-in-typescript) |
| **TypeScript Compiler API** | 程序化分析类型图的官方接口 | [typescriptlang.org/dev/boost](https://www.typescriptlang.org/dev/boost/) |
| **Martin Fowler: Domain-Driven Design** | 领域拆分理论基础 | [martinfowler.com/bliki/DomainDrivenDesign.html](https://martinfowler.com/bliki/DomainDrivenDesign.html) |
| **SemVer Specification** | 语义化版本控制规范 | [semver.org](https://semver.org/) |
| **Interface Segregation Principle (ISP)** | SOLID 原则之接口隔离 | [wikipedia.org/wiki/Interface_segregation_principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) |
| **Google TypeScript Style Guide** | Google 大型 TS 代码库规范 | [google.github.io/styleguide/tsguide.html](https://google.github.io/styleguide/tsguide.html) |

---

*本定理为 TS/JS 软件堆栈全景分析论证的五大核心定理之二。*
