# 模式迁移策略

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/pattern-migration`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块提供从 JavaScript 模式到 TypeScript 模式的系统化迁移路径，解决增量类型化过程中的架构重构、团队认知升级与工程治理问题。

### 1.2 形式化基础

迁移可建模为类型覆盖率单调递增的迭代过程：`Coverage(t+1) ≥ Coverage(t)`。每次迭代通过将 `any` 替换为具体类型，缩小程序的「未类型化空间」，直到达到目标阈值（通常 ≥ 80%）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 鸭子类型 | 基于结构而非名义的类型匹配 | JS 核心范式 |
| 类型守卫 | 运行时检查实现联合类型窄化 | `is`, `asserts` |
| 严格模式阶梯 | 逐步开启 `strictNullChecks`/`noImplicitAny` | `tsconfig.json` |

---

## 二、设计原理

### 2.1 为什么存在

从 JavaScript 迁移到 TypeScript 不仅是语法转换，更是思维模式的升级。迁移策略帮助团队在不中断业务交付的前提下，逐步获得类型系统的安全收益。

### 2.2 迁移策略对比表

| 策略 | 时间投入 | 风险 | 团队要求 | 产出质量 |
|------|---------|------|---------|---------|
| 全面重写 | 高 | 高 | 高 | 最高 |
| 文件级渐进迁移 | 中 | 低 | 中 | 高 |
| `allowJs` + 边界类型 | 低 | 极低 | 低 | 中 |
| 自动化工具迁移 | 低 | 中 | 低 | 中（需人工复核） |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 重写 | 架构最清晰 | 风险高、周期长 | 小型项目/新模块 |
| 渐进迁移 | 风险可控、持续交付 | 过渡期架构复杂度 | 大型遗留系统 |
| 类型覆盖工具 | 量化进度、可视化 | 仅度量不解决 | 治理汇报 |

---

## 三、实践映射

### 3.1 渐进迁移五步法

```ts
// Step 1: 引入 tsconfig（最宽松配置）
// {
//   "compilerOptions": { "allowJs": true, "noEmit": true },
//   "include": ["src/**/*"]
// }

// Step 2: 从入口文件开始，将 .js 重命名为 .ts
// 优先迁移：配置对象、工具函数、数据模型

// Step 3: 为外部依赖安装 @types 或创建 .d.ts
// npm i -D @types/lodash @types/express

// Step 4: 逐步开启严格检查（阶梯式）
// "strictNullChecks": true → "noImplicitAny": true → "strict": true

// Step 5: 建立 CI 门禁，防止类型退化
// package.json: "typecheck": "tsc --noEmit"
```

### 3.2 JS → TS 模式转换示例

```ts
// === Before: JavaScript（防御性编程 + 运行时检查）===
function createUser(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid user data');
  }
  const id = raw.id || generateId();
  const name = raw.name || 'Anonymous';
  const email = raw.email;
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
  return { id, name, email, createdAt: new Date() };
}

// === After: TypeScript（编译期契约 + 类型守卫）===
interface RawUser {
  id?: string;
  name?: string;
  email: unknown;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.includes('@');
}

function generateId(): string {
  return crypto.randomUUID();
}

function createUser(raw: unknown): User {
  // 运行时窄化 + 编译期结构约束
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid user data');
  }
  const r = raw as Record<string, unknown>;

  const email = r.email;
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }

  return {
    id: typeof r.id === 'string' ? r.id : generateId(),
    name: typeof r.name === 'string' ? r.name : 'Anonymous',
    email,
    createdAt: new Date(),
  };
}
```

### 3.3 自动化迁移工具链

```bash
# 1. 类型覆盖率统计
npx type-coverage --project tsconfig.json

# 2. JS 到 TS 初始转换（需人工复核）
npx ts-migrate-full folder src

# 3. any 自动消除建议（结合 ESLint）
npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
# 规则：'@typescript-eslint/no-explicit-any': 'warn'
```

### 3.4 常见误区

| 误区 | 正确理解 |
|------|---------|
| 迁移就是添加 `: any` | 应利用推断，将 `any` 逐步替换为具体类型 |
| 可以一次性完成全部迁移 | 渐进式迁移风险更低，建议按模块分批次 |
| 类型覆盖率 100% 是目标 | 边界文件（如 polyfill）保持 `any` 可接受 |
| 开启 `strict` 后再改代码 | 应先改代码再开严格项，否则错误爆炸 |

### 3.5 扩展阅读

- [TypeScript: Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [TypeScript: Type Coverage Tool](https://github.com/plantain-00/type-coverage)
- [ts-migrate: AirBnB 迁移工具](https://github.com/airbnb/ts-migrate)
- [TypeScript Strict Mode Guide](https://www.typescriptlang.org/tsconfig#strict)
- [Total TypeScript: Migration Strategies](https://www.totaltypescript.com/)
- `10-fundamentals/10.1-language-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
