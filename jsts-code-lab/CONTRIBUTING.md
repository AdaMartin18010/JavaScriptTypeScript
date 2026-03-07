# 贡献指南

感谢您对 JSTS Code Lab 的兴趣！以下是贡献指南。

## 🚀 快速开始

1. Fork 本仓库
2. 克隆到本地
3. 安装依赖：`pnpm install`
4. 创建分支：`git checkout -b feature/your-feature`

## 📝 代码规范

### TypeScript

- 使用严格模式
- 所有函数必须指定返回类型
- 避免使用 `any`
- 使用 `interface` 定义对象类型

### 文件结构

每个文件应包含：

```typescript
/**
 * @file 文件名
 * @category 分类路径
 * @difficulty easy
 * @tags 标签
 * @description 描述
 */

// 代码内容

// ============================================================================
// 导出
// ============================================================================

export { ... };
```

### 测试

每个模块都应有对应的测试文件：

```typescript
/**
 * @file 测试描述
 */

import { describe, it, expect } from 'vitest';
import { ... } from '...';

describe('模块名', () => {
  it('应该...', () => {
    // 测试代码
  });
});
```

## 🧪 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test stack-queue

# 带覆盖率
pnpm test:coverage
```

## 📋 提交前检查清单

- [ ] 代码通过类型检查：`pnpm type-check`
- [ ] 代码通过 lint：`pnpm lint`
- [ ] 代码已格式化：`pnpm format`
- [ ] 测试通过：`pnpm test`
- [ ] 添加了必要的注释和文档

## 🏷️ 提交信息规范

使用以下格式：

```
<type>(<scope>): <subject>

<body>
```

类型：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `test`: 测试
- `refactor`: 重构
- `style`: 格式

示例：
```
feat(algorithms): add heap sort implementation

- Add MinHeap and MaxHeap classes
- Add heapSort function
- Add unit tests
```

## 📚 添加新内容

### 添加新的 ES 特性

1. 在 `01-ecmascript-evolution/es20XX/` 创建文件
2. 添加示例代码
3. 添加测试文件

### 添加新的设计模式

1. 在 `02-design-patterns/` 相应目录创建文件
2. 包含：问题描述、解决方案、代码实现
3. 添加测试文件

### 添加新的算法

1. 在 `05-algorithms/` 相应目录创建文件
2. 包含：算法描述、复杂度分析、代码实现
3. 添加测试文件

## 🤝 行为准则

- 尊重他人
- 接受建设性批评
- 关注社区利益

## 📧 联系我们

如有问题，请提交 Issue。

感谢您的贡献！
