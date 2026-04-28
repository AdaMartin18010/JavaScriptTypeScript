# 季度内容审计清单

> **定位**：`60-meta-content/quarterly-audit/`
> **频率**：每季度首月执行

---

## 审计五维度

### 维度 1：技术准确性（Accuracy）

- [ ] 版本号核实（Node.js/Bun/Deno/TS/React/Vue）
- [ ] CVE 数据验证（NVD 数据库交叉核对）
- [ ] 性能基准数据更新（TechEmpower/js-framework-benchmark）
- [ ] API 签名核实（官方文档对照）

### 维度 2：时效性（Timeliness）

- [ ] 标记超过 6 个月未更新的文档
- [ ] 检查废弃工具/库的引用（如 Vue 2、Jest→Vitest 趋势）
- [ ] 更新 Stars/下载量数据（L4 层）
- [ ] 新增工具收录评估（GitHub Trending 扫描）

### 维度 3：完整性（Completeness）

- [ ] 检查 THEORY.md 覆盖率（目标：100%）
- [ ] 检查 ARCHITECTURE.md 覆盖率（目标：100%）
- [ ] 检查 README.md 覆盖率（目标：100%）
- [ ] 检查缺失的对比矩阵/决策树

### 维度 4：一致性（Consistency）

- [ ] 术语统一检查（如「认知脚手架」vs「认知接口」）
- [ ] 数据一致性（同一数据在不同文档中的值是否一致）
- [ ] 链接有效性（内部交叉引用是否断裂）
- [ ] 格式一致性（标题层级、代码块标注）

### 维度 5：可运行性（Runnability）

- [ ] 代码示例通过 CI 测试
- [ ] 示例项目可一键运行
- [ ] 依赖版本可解析（无冲突）
- [ ] Mermaid 图表可渲染

---

## 审计流程

```
Week 1: 准备
  ├── 生成本季度变更清单
  └── 分配审计责任人

Week 2: 自动化扫描
  ├── 运行 link-checker
  ├── 运行 version-checker
  └── 运行 code-test-runner

Week 3: 人工审查
  ├── 重点文档抽样审阅
  ├── 新特性缺口识别
  └── 社区反馈整理

Week 4: 修复与发布
  ├── 修复 P0/P1 问题
  ├── 更新审计报告
  └── 发布季度更新说明
```

---

## 工具清单

| 工具 | 用途 | 自动化 |
|------|------|--------|
| `markdown-link-check` | 链接有效性 | ✅ CI |
| `remark-lint` | Markdown 格式 | ✅ CI |
| `madge --circular` | 循环依赖检测 | ✅ CI |
| 自定义 version-checker | 版本号核实 | 半自动 |
| GitHub Trending API | 生态趋势 | 手动 |

---

*本清单为内容质量保证的基础设施。*
