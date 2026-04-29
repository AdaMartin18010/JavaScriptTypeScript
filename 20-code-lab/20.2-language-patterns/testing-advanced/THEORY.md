# 高级测试 — 理论基础

## 1. 属性驱动测试（Property-Based Testing）

不测试具体输入，而是测试**不变量属性**：

- 对于所有输入，`reverse(reverse(arr)) === arr`
- 工具：fast-check（JS）、Hypothesis（Python）
- 优势：发现边界条件和意外输入的 bug

## 2. 变异测试（Mutation Testing）

评估测试质量的方法：

1. 自动修改源代码（如 `>` 改为 `<`）
2. 运行测试套件
3. 如果测试通过，说明测试未覆盖该变异（"存活"）
4. 目标：最大化"杀死"变异的比例

工具：Stryker JS

## 3. 契约测试（Contract Testing）

验证服务间接口契约：

- **消费者驱动**: 消费者定义期望，提供者验证满足
- **工具**: Pact、Spring Cloud Contract
- 优势：独立部署，无需集成环境即可验证兼容性

## 4. 混沌工程

在生产环境**故意注入故障**，验证系统韧性：

- **故障类型**: 网络延迟、服务宕机、CPU 满载、内存耗尽
- **实验步骤**: 定义稳态 → 注入故障 → 观察偏差 → 回滚
- **原则**: 最小爆炸半径，可监控，可随时停止

## 5. 视觉回归测试

检测 UI 的视觉变化：

- **截图对比**: 像素级比对基准截图和当前截图
- **工具**: Chromatic、Percy、Loki
- 注意: 字体渲染差异、动画时序、抗锯齿导致误报

## 6. 测试方法对比

| 方法 | 目标 | 工具 | 集成阶段 | 成本 |
|------|------|------|----------|------|
| 属性测试 | 发现边界 bug | fast-check | 单元测试 | 低 |
| 变异测试 | 评估测试质量 | Stryker | CI | 高 |
| 契约测试 | 服务间兼容 | Pact | CI/CD | 中 |
| 混沌工程 | 系统韧性 | Chaos Monkey | 生产 | 高 |
| 视觉回归 | UI 一致性 | Chromatic | CI | 中 |

## 7. 代码示例：fast-check 属性测试

```javascript
const fc = require('fast-check');

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
});
```

## 8. 权威参考

- [fast-check Documentation](https://dubzzz.github.io/fast-check.github.com/) — 属性测试库
- [Stryker Mutator](https://stryker-mutator.io/) — JS 变异测试框架
- [Pact.io](https://pacts.io/) — 契约测试框架
- [Principles of Chaos Engineering](https://principlesofchaos.org/) — 混沌工程原则

## 9. 与相邻模块的关系

- **07-testing**: 测试基础概念
- **75-chaos-engineering**: 混沌工程的深度实践
- **35-accessibility-a11y**: 可访问性自动化测试
