# 70-theoretical-foundations 内容审计检查清单

> 每次季度审计时，逐条核对以下检查项。

## 通用检查项（适用于所有文档）

### 1. 元数据完整性

- [ ] YAML frontmatter 包含 `title` 字段
- [ ] YAML frontmatter 包含 `description` 字段
- [ ] YAML frontmatter 包含 `last-updated` 字段（格式：YYYY-MM-DD）
- [ ] YAML frontmatter 包含 `category` 字段
- [ ] `last-updated` 日期是否在 **6 个月内**

### 2. 引用与链接健康度

- [ ] `references` 列表中的所有 URL 格式正确（以 `http://` 或 `https://` 开头）
- [ ] `references` 列表中的所有 URL 可访问（无 404/5xx）
- [ ] 外部链接不超过 2 次连续重定向

### 3. 技术数据一致性

- [ ] 文档中提到的版本号与当前官方最新版本一致（如 TypeScript、ECMAScript 版本）
- [ ] 代码示例在当前运行时环境可执行
- [ ] API 签名与官方文档匹配

### 4. 趋势与预测时效性

- [ ] "未来趋势" 章节中的预测是否仍具前瞻性
- [ ] 已标注为 "即将到来" 的特性是否已正式发布
- [ ] 过时的预测需标注 `deprecated` 或更新为已实现状态

## 分类专属检查项

| 分类 | 额外检查项 |
|------|-----------|
| category-theory | 数学符号与 LaTeX 渲染是否正常 |
| cognitive-models | 引用论文是否为近 5 年内 |
| formal-analysis | 定理/证明是否与最新预印本一致 |
| language-semantics | ECMAScript 阶段（Stage 0-3）是否已推进 |
| type-system | TypeScript 版本号是否为最新稳定版 |

## 审计记录模板

```markdown
## 审计日期：YYYY-MM-DD
- 审计人：
- 文档总数：
- 通过检查：
- 需更新：
- 严重过期（>12 个月）：
```
