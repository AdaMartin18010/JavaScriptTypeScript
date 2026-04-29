# CI/CD 工具对比

> GitHub Actions、GitLab CI、Jenkins、CircleCI 的深度对比矩阵。

---

## 对比矩阵

| 维度 | GitHub Actions | GitLab CI | Jenkins | CircleCI |
|------|---------------|-----------|---------|----------|
| **配置语法** | YAML | YAML | Groovy | YAML |
| **Marketplace/生态** | 20K+ Actions | 内置模板 | 1,800+ 插件 | Orb 生态 |
| **自托管 Runner** | ✅ | ✅ | ✅ 原生 | ✅ |
| **并发构建** | 20（免费） | 400 min/月 | 无限制 | 无限制（付费） |
| **缓存策略** | actions/cache | 内置 | 插件 | 内置 |
| **安全扫描** | Dependabot/CodeQL | 内置 SAST/DAST | 插件 | 集成第三方 |
| **可复用工作流** | ✅ | ✅ | Shared Libraries | ✅ |
| **定价（团队）** | $4/用户 + 分钟 | $29/用户/月 | 自托管成本 | 按需计费 |

---

## 选型建议

| 场景 | 推荐 |
|------|------|
| GitHub 托管项目 | GitHub Actions |
| 企业级 DevSecOps | GitLab CI |
| 超大规模/复杂定制 | Jenkins |
| 快速云原生启动 | CircleCI |

---

*最后更新: 2026-04-29*
