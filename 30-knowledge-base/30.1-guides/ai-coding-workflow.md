# AI 编码工作流

> 在 JavaScript/TypeScript 项目中集成 AI 辅助开发的最佳实践与工具链。

---

## 核心工具

| 工具 | 定位 | 最佳场景 |
|------|------|---------|
| **GitHub Copilot** | 代码补全 | 日常编码，函数级生成 |
| **Claude Code** | Agent 式开发 | 复杂重构，多文件编辑 |
| **Cursor** | IDE 集成 | 全栈开发，代码库理解 |
| **V0.dev** | UI 生成 | React 组件，Tailwind 样式 |
| **Windsurf** | 协作编码 | 实时代码解释，审查辅助 |

---

## 工作流模式

### 1. 提示驱动开发（Prompt-Driven Development）

```
角色：Senior TypeScript Engineer
上下文：Next.js 15 App Router 项目
任务：实现带 Zod 校验的 Server Action
约束：使用 React 19 useActionState，错误信息中文
```

### 2. AI 辅助代码审查

- 提交前用 AI 检查潜在 Bug
- 生成变更摘要（Commit Message）
- 自动检测安全漏洞（XSS、注入）

### 3. 测试生成

```bash
# 用 AI 生成单元测试
claude "为 src/utils/date.ts 生成 vitest 测试用例，覆盖边界条件"
```

---

## 最佳实践

1. **始终人工审查**：AI 生成的代码需理解后再提交
2. **上下文管理**：提供充足的类型定义和示例，减少幻觉
3. **敏感数据隔离**：不向公共 AI 服务发送密钥、PII
4. **版本控制**：AI 修改的文件与人工修改分开展示
5. **知识库构建**：将项目规范、ADR 放入 AI 上下文，保持一致性

---

*最后更新: 2026-04-29*
