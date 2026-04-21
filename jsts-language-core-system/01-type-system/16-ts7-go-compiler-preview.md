# TS 7.0 Project Corsa 前瞻

> TypeScript 7.0 Go 重写对类型系统与开发体验的影响
>
> 参考来源：TypeScript 官方博客 2024–2025 | Project Corsa 技术预览

---

## 1. Project Corsa 概述

2024 年，微软宣布启动 **Project Corsa**——将 TypeScript 编译器从 TypeScript 重写为 Go 语言：

| 指标 | 当前（TS 5.x/6.x） | Project Corsa 目标 |
|------|------------------|-------------------|
| 编译速度 | 基准 | **10x 提升** |
| 内存占用 | 基准 | **50% 减少** |
| Language Service 启动 | 秒级（大型项目） | **亚秒级** |

## 2. 对类型系统的影响

### 2.1 语言语义不变性

Project Corsa **不会改变**：
- TypeScript 类型系统的规则
- 类型推断算法
- 与 JavaScript 的互操作语义

### 2.2 类型检查强度的潜在提升

Go 实现可能支持：
- **并行类型检查**：利用多核 CPU
- **增量类型检查缓存**：跨文件的更细粒度缓存
- **更大的递归深度**：Go 的栈管理可能允许更深的类型递归

## 3. 对开发体验的影响

### 3.1 Language Service 预览

VS Code 已支持通过 TypeScript Nightly 扩展预览 Go-based Language Service：

```json
{
  "typescript.experimental.useTsgo": true
}
```

### 3.2 实际收益

- 大型 monorepo（50万+ 行 TS 代码）的 IntelliSense 冷启动从数秒降至亚秒
- Go-to-definition 和 Rename 操作显著加速

## 4. 对生态系统的影响

### 4.1 编译器 API

- `typescript` npm 包的 API 可能变化
- 构建工具（webpack、Vite、esbuild）需要适配
- 类型声明文件（.d.ts）格式保持不变

### 4.2 CI/CD

- 编译时间的大幅缩短将直接改善 CI 流水线
- 类型检查可作为更轻量的 pre-commit 钩子

## 5. 时间线与里程碑

| 时间 | 里程碑 |
|------|--------|
| 2024 Q4 | 项目宣布 |
| 2025 Q2 | Language Service 预览 |
| 2025 Q4 | alpha 版本 |
| 2026 H2 | beta / RC 预期 |
| 2027+ | 正式发布（预估） |

## 6. 准备建议

### 6.1 立即行动

- 测试 `--stableTypeOrdering` 标志
- 使用 TypeScript Nightly 扩展体验 Language Service

### 6.2 中期准备

- 确保构建管道不依赖 `typescript` 包的内部 API
- 评估并行构建策略

### 6.3 长期策略

- TS 7.0 的 tsc 编译器将与当前版本共存一段时间
- Language Service 将首先迁移，tsc 稍后跟进

---

**参考来源**：
- [TypeScript 官方博客：Go 重写公告](https://devblogs.microsoft.com/typescript/)
- Project Corsa GitHub 里程碑
