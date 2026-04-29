# 高级测试 — 理论基础

## 1. 属性驱动测试（Property-Based Testing）

不测试具体输入，而是测试**不变量属性**：

- 对于所有输入，`reverse(reverse(arr)) === arr`
- 工具：fast-check（JS）、Hypothesis（Python）
- 优势：发现边界条件和意外输入的 bug

### 代码示例

```typescript
import * as fc from 'fast-check';

describe('Array operations', () => {
  // 属性：reverse(reverse(arr)) === arr
  it('should satisfy double reverse identity', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        return JSON.stringify(arr.reverse().reverse()) === JSON.stringify(arr);
      })
    );
  });

  // 属性：排序后数组是非递减的
  it('should produce sorted array', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] < sorted[i - 1]) return false;
        }
        return true;
      })
    );
  });

  // 属性：map 的复合律 f(g(x)) === compose(f,g)(x)
  it('should preserve map composition', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const f = (x: number) => x + 1;
        const g = (x: number) => x * 2;
        const left = arr.map(g).map(f);
        const right = arr.map((x) => f(g(x)));
        return JSON.stringify(left) === JSON.stringify(right);
      })
    );
  });
});
```

---

## 2. 变异测试（Mutation Testing）

评估测试质量的方法：

1. 自动修改源代码（如 `>` 改为 `<`）
2. 运行测试套件
3. 如果测试通过，说明测试未覆盖该变异（"存活"）
4. 目标：最大化"杀死"变异的比例

工具：Stryker JS

### 配置与运行

```json
// stryker.config.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts"]
}
```

```bash
npx stryker run
# 查看报告：reports/mutation/html/index.html
```

---

## 3. 契约测试（Contract Testing）

验证服务间接口契约：

- **消费者驱动**: 消费者定义期望，提供者验证满足
- **工具**: Pact、Spring Cloud Contract
- 优势：独立部署，无需集成环境即可验证兼容性

### Pact 消费者测试示例

```typescript
import { Pact } from '@pact-foundation/pact';
import { like, integer, string } from '@pact-foundation/pact/dsl/matchers';

const provider = new Pact({
  consumer: 'OrderService',
  provider: 'UserService',
  port: 1234,
});

describe('UserService contract', () => {
  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  it('returns user by id', async () => {
    await provider.addInteraction({
      state: 'user with id 123 exists',
      uponReceiving: 'a request for user 123',
      withRequest: {
        method: 'GET',
        path: '/users/123',
      },
      willRespondWith: {
        status: 200,
        body: {
          id: integer(123),
          name: string('Alice'),
          email: like('alice@example.com'),
        },
      },
    });

    const user = await fetchUser(123); // 实际消费者代码
    expect(user.name).toBe('Alice');
  });
});
```

---

## 4. 混沌工程

在生产环境**故意注入故障**，验证系统韧性：

- **故障类型**: 网络延迟、服务宕机、CPU 满载、内存耗尽
- **实验步骤**: 定义稳态 → 注入故障 → 观察偏差 → 回滚
- **原则**: 最小爆炸半径，可监控，可随时停止

### 代码示例：延迟注入中间件

```typescript
import { Middleware } from 'koa';

export function chaosLatency(options: { probability: number; maxMs: number }): Middleware {
  return async (ctx, next) => {
    if (Math.random() < options.probability) {
      const delay = Math.floor(Math.random() * options.maxMs);
      ctx.set('X-Chaos-Delay', String(delay));
      await new Promise((r) => setTimeout(r, delay));
    }
    await next();
  };
}

// 使用
app.use(chaosLatency({ probability: 0.1, maxMs: 5000 }));
```

---

## 5. 视觉回归测试

检测 UI 的视觉变化：

- **截图对比**: 像素级比对基准截图和当前截图
- **工具**: Chromatic、Percy、Loki
- 注意: 字体渲染差异、动画时序、抗锯齿导致误报

### Storybook + Chromatic 配置

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    chromatic: {
      delay: 300,          // 等待动画完成
      diffThreshold: 0.05, // 像素差异阈值
      viewports: [320, 768, 1280],
    },
  },
};

export default preview;
```

---

## 6. 测试方法对比

| 方法 | 目标 | 工具 | 集成阶段 | 成本 |
|------|------|------|----------|------|
| 属性测试 | 发现边界 bug | fast-check | 单元测试 | 低 |
| 变异测试 | 评估测试质量 | Stryker | CI | 高 |
| 契约测试 | 服务间兼容 | Pact | CI/CD | 中 |
| 混沌工程 | 系统韧性 | Chaos Monkey | 生产 | 高 |
| 视觉回归 | UI 一致性 | Chromatic | CI | 中 |

---

## 7. 快照测试最佳实践

```typescript
import { render } from '@testing-library/react';
import { toMatchSnapshot } from 'jest-snapshot';

describe('Component snapshots', () => {
  it('renders correctly', () => {
    const { container } = render(<UserCard user={mockUser} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders error state', () => {
    const { container } = render(<UserCard error={new Error('Network fail')} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

---

## 8. 权威参考

- [fast-check Documentation](https://dubzzz.github.io/fast-check.github.com/) — 属性测试库
- [Stryker Mutator](https://stryker-mutator.io/) — JS 变异测试框架
- [Pact.io](https://pact.io/) — 契约测试框架
- [Principles of Chaos Engineering](https://principlesofchaos.org/) — 混沌工程原则
- [Chromatic](https://www.chromatic.com/) — 视觉回归测试平台
- [Google Testing Blog](https://testing.googleblog.com/) — 测试方法论
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/) — 测试框架设计参考

## 9. 与相邻模块的关系

- **07-testing**: 测试基础概念
- **75-chaos-engineering**: 混沌工程的深度实践
- **35-accessibility-a11y**: 可访问性自动化测试

---

*最后更新: 2026-04-29*
