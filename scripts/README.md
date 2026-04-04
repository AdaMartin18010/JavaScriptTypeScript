# 脚本工具集

本目录包含项目维护和自动化相关的脚本工具。

## 安全扫描 (security-check.js)

🔒 安全漏洞扫描脚本，用于检查项目依赖的安全状况。

### 功能

- ✅ 扫描所有 `package.json` 文件
- ✅ 使用 `npm audit` 检查漏洞
- ✅ 支持 OSV.dev API 查询
- ✅ 支持 Snyk CLI 扫描
- ✅ 自动修复功能
- ✅ 生成 JSON/Markdown 报告
- ✅ 彩色终端输出

### 使用方法

```bash
# 基础扫描
node scripts/security-check.js

# 输出 JSON 格式
node scripts/security-check.js --json

# 使用 OSV.dev API
node scripts/security-check.js --osv

# 尝试自动修复
node scripts/security-check.js --fix

# 静默模式（仅生成报告）
node scripts/security-check.js --quiet
```

### 输出文件

- `security-report.json` - JSON 格式的详细报告
- `SECURITY.md` - Markdown 格式的可读报告

### 标记系统

| 标记 | 含义 |
|------|------|
| 🟢 | 安全，无漏洞 |
| 🟡 | 低危漏洞 |
| 🟠 | 中危漏洞 |
| 🔴 | 高危/严重漏洞 |

### 严重程度计算

脚本根据以下优先级确定总体严重程度：
1. **Critical** - 存在严重漏洞
2. **High** - 存在高危漏洞
3. **Moderate** - 存在中危漏洞
4. **Low** - 仅存在低危漏洞
5. **Safe** - 无漏洞

### 自动化

通过 GitHub Action (`.github/workflows/security-scan.yml`) 实现：
- 每天 UTC 02:00 自动扫描
- PR 时自动检查新依赖
- 发现高危漏洞自动创建 Issue
- 支持手动触发

### 依赖

- Node.js >= 22
- npm (用于 audit)
- 可选: Snyk CLI (`npm install -g snyk`)

## 其他脚本

### update-stars.js

更新 README.md 中的 GitHub Stars 徽章。

### validate-format.js

验证项目文件格式和结构。

---

更多文档请参阅 [项目文档](../docs/)
