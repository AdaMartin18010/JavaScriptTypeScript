# 维护指南 (Maintenance Guide)

> **最后更新**: 2026-05-06 | **适用范围**: Svelte 5 Signals 编译器生态专题 | **维护周期**: 月度

本文件指导维护者如何持续保持专题内容的时效性与准确性。

---

## 一、维护责任矩阵

| 维护项 | 频率 | 触发条件 | 检查文件 | 负责动作 | 自动化 |
|:---|:---|:---|:---|:---|:---:|
| Svelte 版本更新 | 每月 | 新 Release | 21, 22, 23, 24, 25 | 复核源码行号 | ⚠️ 半自动 |
| TC39 提案进展 | 每季度 | 会议记录 | 21 | 更新 Stage / API 变更 | ❌ 手动 |
| Vite 版本更新 | 每季度 | 新 Release | 23 | 更新 Environment API / Rolldown | ⚠️ 半自动 |
| TypeScript 版本 | 每季度 | 新 Release | 24 | 更新类型系统特性 | ⚠️ 半自动 |
| 浏览器标准 | 每半年 | 新 Chrome/FF/Safari | 22 | 更新渲染管线 / INP | ❌ 手动 |
| **外部链接可用性** | **每周** | **—** | **SOURCE_REFERENCE_INDEX** | **验证并修复死链** | **✅ CI 自动** |
| **版本对齐检查** | **每周** | **—** | **全部** | **对比 npm 最新版本** | **✅ CI 自动** |
| **Mermaid 语法检查** | **每周** | **—** | **全部** | **验证图表语法** | **✅ CI 自动** |
| 社区反馈整合 | 每月 | Issue/PR/评论 | 全部 | 更新内容或 FAQ | ❌ 手动 |
| 英文版翻译 | 按需 | 社区需求 | 21-25 | 创建 en/ 子目录 | ❌ 手动 |

> **自动化说明**: GitHub Actions 每周日自动运行内容健康检查，生成报告并上传 Artifacts。维护者需下载报告并处理异常项。
>
> **手动触发**: 在 Actions 标签页选择 "Content Health Check" → "Run workflow" 可立即执行检查。

---

## 二、源码引用更新流程 (Svelte 版本升级时)

### 2.1 检查清单

```markdown
- [ ] Svelte 新版本发布 (如 5.56.0)
- [ ] 对比 `packages/svelte/src/internal/client/reactivity/sources.js` 行号偏移
- [ ] 对比 `deriveds.js` / `effects.js` / `batch.js` / `runtime.js` 结构变更
- [ ] 若核心算法变更 → 更新 25 的定理前提/结论
- [ ] 若仅行号偏移 → 更新 SOURCE_REFERENCE_INDEX.md
- [ ] 验证 GitHub 永久链接 (tag 更新)
- [ ] 更新所有文档的 tagline 版本号
```

### 2.2 行号批量更新脚本 (概念)

```bash
# 假设新旧版本对比后，行号偏移量已知
OLD_TAG="svelte@5.55.5"
NEW_TAG="svelte@5.56.0"
OFFSET=+15  # 示例偏移

# 使用 sed 批量替换 (在 Mac/Linux 环境)
sed -i "s/$OLD_TAG/$NEW_TAG/g" SOURCE_REFERENCE_INDEX.md
# 行号需人工复核，不建议自动替换
```

> ⚠️ **重要**: 行号更新必须人工复核，自动替换可能导致指向错误的代码区域。

---

## 三、内容准确性验证流程

### 3.1 月度验证检查表

| 检查项 | 方法 | 通过标准 |
|:---|:---|:---|
| 所有 GitHub 链接 200 OK | 手动/脚本 HEAD 请求 | 100% 可用 |
| 性能数据未过时 | 对比 js-framework-benchmark 最新结果 | 排名趋势一致 |
| 版本号一致性 | 全文搜索 "5.55" / "5.8.x" | 所有文档同步 |
| Mermaid 图表渲染 | VitePress 本地预览 | 无语法错误 |
| 术语一致性 | 对比 GLOSSARY + GLOSSARY_SUPPLEMENT | 无冲突定义 |

### 3.2 验证报告模板

每月验证完成后，在 `VALIDATION_REPORT.md` 追加：

```markdown
### YYYY-MM 验证

| 检查项 | 状态 | 备注 |
|:---|:---|:---|
| GitHub 链接 | ✅/⚠️/❌ | |
| 版本时效 | ✅/⚠️/❌ | |
| 外部数据 | ✅/⚠️/❌ | |
| 图表渲染 | ✅/⚠️/❌ | |

**行动项**:
- [ ] ...
```

---

## 四、自动化 CI 配置

### 4.1 Content Health Check 工作流

`.github/workflows/content-health-check.yml` 配置了三项自动检查：

| 任务 | 工具 | 检查内容 | 失败策略 |
|:---|:---|:---|:---|
| `check-links` | lychee | 外部链接 200 OK、超时、重定向 | 上传报告，不阻断 |
| `check-versions` | 自定义脚本 | npm 最新版 vs 文档基线对比 | 上传报告，不阻断 |
| `check-mermaid` | 自定义脚本 | 括号/引号/声明匹配 | 上传报告，阻断构建 |

### 4.2 版本跟踪脚本

`scripts/version-tracker.js` 功能：

- 查询 npm registry 获取 svelte / @sveltejs/kit / typescript / vite 最新版本
- 与文档基线对比（major / minor / patch / current）
- 生成 `version-check-report.json`
- 输出行动建议（哪些文档需要更新）

**使用方式**:

```bash
cd website/svelte-signals-stack
node scripts/version-tracker.js
```

### 4.3 Mermaid 验证脚本

`scripts/validate-mermaid.js` 功能：

- 递归扫描所有 `.md` 文件
- 提取 ` ```mermaid ` 代码块
- 基础语法检查（括号匹配、引号匹配、图表声明存在性）
- 生成 `mermaid-validation-report.json`

**使用方式**:

```bash
cd website/svelte-signals-stack
node scripts/validate-mermaid.js
```

---

## 五、社区反馈处理流程

### 4.1 反馈分类

| 类型 | 优先级 | 处理方式 |
|:---|:---|:---|
| 技术错误 (事实错误) | P0 | 立即修复，更新 VALIDATION_REPORT |
| 版本过时 | P1 | 纳入下月维护计划 |
| 内容补充建议 | P2 | 评估后创建新文档或扩展现有 |
| 排版/格式 | P3 | 批量处理 |
| 翻译请求 | P2 | 排期处理 |

### 4.2 反馈记录位置

建议在专题目录下创建 `feedback/` 子目录（如社区活跃时）：

```
feedback/
├── 2026-05-issues.md    # 本月收集的反馈
├── 2026-06-issues.md
└── resolved.md          # 已解决的反馈归档
```

---

## 六、扩展专题创建流程 (未来 31-35)

当 Svelte 6 Alpha 发布或重大技术变革时：

1. **创建计划文档**: `PLAN_SVELTE_6_SERIES.md`
2. **确定范围**: 基于 CHANGELOG 和 RFC 确定 3-5 个深度主题
3. **执行四阶段**: 基础研究 → 核心论证 → 验证优化 → 持续维护
4. **更新索引**: `index.md` 新增导航区块
5. **更新本指南**: 将新专题纳入维护矩阵

---

## 七、紧急修复流程

若发现严重影响准确性的错误（如源码引用完全指向错误的函数）：

1. 立即修复错误文档
2. 更新 `VALIDATION_REPORT.md` 记录修复
3. 若涉及 21-25 核心文档，更新 `SOURCE_REFERENCE_INDEX.md`
4. 在 `index.md` 顶部添加临时公告（可选）

---

## 八、联系与协作

| 渠道 | 用途 |
|:---|:---|
| GitHub Issues | 技术错误报告、内容建议 |
| Pull Requests | 内容补充、翻译贡献 |
| Discussion | 技术选型咨询、使用问题 |

---

> 📌 **维护者备忘**: 本专题的核心价值在于"源码级精确性"。任何更新都必须保证源码引用、行号、算法描述的准确性优先于时效性。宁可延迟更新，不可发布错误信息。
