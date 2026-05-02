# Svelte 专题数据自动刷新机制

本文档说明 `website/svelte-signals-stack/` 专题的数据自动刷新脚本及其使用方法。

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `scripts/update-svelte-data.js` | **主脚本**：获取 Svelte 生态数据并更新 JSON 和 Markdown |
| `scripts/fetch-trends.js` | 通用 GitHub Stars 趋势脚本（已增强 429 重试） |
| `scripts/npm-stats.js` | 通用 npm 下载量脚本（已增强 429 重试） |
| `data/stats.json` | 综合统计（GitHub + npm），全生态仓库数据 |
| `data/npm-stats.json` | npm 下载量专项数据 |

---

## 🔑 环境变量与 Token 配置

### GITHUB_TOKEN（强烈建议配置）

GitHub API 对未认证请求的限制为 **60 次/小时**，对认证请求为 **5,000 次/小时**。

**创建 Token：**

1. 访问 <https://github.com/settings/tokens>
2. 点击 "Generate new token (classic)"
3. 选择有效期（建议 90 天）
4. **不需要任何 scope**（公开仓库数据只需要空 scope 的 token 即可提升 rate limit）
5. 生成后复制 token

**配置方式（选择一种）：**

```bash
# 方式一：临时设置（当前终端会话）
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
node scripts/update-svelte-data.js

# 方式二：Windows PowerShell
$env:GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
node scripts/update-svelte-data.js

# 方式三：写入 .env 文件（推荐，不进入 git）
echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx" > .env
# 运行前加载：
# Windows PowerShell: Get-Content .env | ForEach-Object { if ($_ -match "^(.+?)=(.+)$") { Set-Content "env:$($matches[1])" $matches[2] } }
# Linux/macOS: export $(cat .env | xargs)
```

> ⚠️ **安全提示**：不要将 `.env` 文件提交到 Git。项目 `.gitignore` 已默认忽略 `.env`。

### npm Registry

npm Registry API **无需认证**，但存在隐性速率限制。脚本已内置：

- 请求间隔 600ms
- 429 错误自动重试（指数退避，最多 3 次）

---

## 🚀 使用方法

### 基础用法

```bash
node scripts/update-svelte-data.js
```

### 完整输出示例

```
🚀 Svelte 专题数据自动刷新

📡 获取 GitHub Stars...
  sveltejs/svelte... ✅ 86,454 stars
  sveltejs/kit... ✅ 20,475 stars

📦 获取 npm 下载量...
  ✅ svelte: 4.2M/周, 18.1M/月
  ✅ @sveltejs/kit: 1.7M/周, 7.7M/月
  ...

💾 更新数据文件...
💾 已更新: data/stats.json
💾 已更新: data/npm-stats.json

📄 同步专题文件...
  ✏️  已更新: index.md Svelte Stars
  ✏️  已更新: framework-comparison.md Svelte npm
  ...

✨ 完成!
GitHub: 2/2 成功
npm: 11/11 成功
```

### 部分失败时的行为

如果某个 API 请求失败（如达到 rate limit）：

1. 脚本会重试 3 次（指数退避）
2. 若仍失败，会保留该条目的旧数据（如有）
3. 最后输出**手动更新提示**，列出所有获取到的最新值
4. 退出码为 `1`，方便 CI 检测

---

## 📊 数据更新范围

### 自动获取的数据

| 数据源 | 项目 | 更新目标 |
|--------|------|----------|
| GitHub API | `sveltejs/svelte` | Stars, Forks, Open Issues |
| GitHub API | `sveltejs/kit` | Stars, Forks, Open Issues |
| npm Registry | `svelte` | 周/月下载量 |
| npm Registry | `@sveltejs/kit` | 周/月下载量 |
| npm Registry | `vite-plugin-svelte` 等 9 个包 | 周/月下载量 |

### 自动同步的 Markdown 文件

| 文件 | 更新内容 |
|------|----------|
| `index.md` | Stars 数、npm 下载量、数据来源时间戳、最后更新时间 |
| `10-framework-comparison.md` | Svelte Stars、npm 周下载量、数据基准时间、最后更新时间 |
| `19-frontier-tracking.md` | 最后更新时间 |

### 需要手动维护的数据

以下数据无法通过公开 API 自动获取，需人工更新：

- **版本号**（如 Svelte 5.55.x、SvelteKit 2.59.x）— 需查看 GitHub Releases
- **性能基准数据**（JS Framework Benchmark 结果）— 需运行基准测试
- **贡献者人数、活跃 Issue/PR 数** — 需人工统计或使用高级 GitHub API
- **非 Svelte 竞品数据**（React/Vue/Solid/Angular 的 Stars 和下载量）— 需运行 `fetch-trends.js` 和 `npm-stats.js`

---

## 🛡️ 速率限制处理

### GitHub API

| 场景 | 处理策略 |
|------|----------|
| 429 Too Many Requests | 读取 `Retry-After` 响应头，等待后重试 |
| 无 `Retry-After` | 默认等待 1000ms，指数退避（1000ms → 2000ms → 4000ms） |
| 认证用户 | 5,000 请求/小时，脚本每次运行约 2 请求 |
| 未认证用户 | 60 请求/小时，建议配置 `GITHUB_TOKEN` |

### npm Registry API

| 场景 | 处理策略 |
|------|----------|
| 429 Too Many Requests | 同上，指数退避重试 |
| 请求间隔 | 批次内并行，批次间 600ms 间隔 |

---

## 🔄 建议的更新频率

| 数据类型 | 建议频率 | 自动化方式 |
|----------|----------|------------|
| Stars / npm 下载量 | 每周 | GitHub Actions 定时任务 |
| 版本号 | 每两周 | 人工检查 + 脚本辅助 |
| 性能基准 | 每季度 | 人工运行基准测试 |
| 全量生态数据 | 每月 | 运行 `fetch-trends.js` + `npm-stats.js` |

### GitHub Actions 定时任务示例（可选）

```yaml
# .github/workflows/update-svelte-data.yml
name: Update Svelte Data
on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日 UTC 00:00
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Update data
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/update-svelte-data.js
      - name: Commit changes
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add data/ website/svelte-signals-stack/
          git diff --cached --quiet || git commit -m "chore: auto-update svelte data [$(date +%Y-%m-%d)]"
          git push
```

> 注意：`secrets.GITHUB_TOKEN` 在 GitHub Actions 中自动提供，无需手动创建。

---

## 🐛 故障排查

### "GitHub API 429 (Rate Limit)"

**原因**：未配置 `GITHUB_TOKEN` 且短时间内多次运行脚本。
**解决**：

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
# 等待 1 小时后重试，或配置 token 后立即重试
```

### "npm API 429 (Rate Limit)"

**原因**：npm Registry 对 IP 级别的请求频率有限制。
**解决**：等待几分钟后重试，脚本已自动退避重试 3 次。

### "未找到匹配模式，跳过: xxx"

**原因**：Markdown 文件中的表格格式发生了变化，脚本的正则表达式未能匹配。
**解决**：

1. 查看脚本输出的**手动更新提示**
2. 手动编辑对应 Markdown 文件中的数据
3. 或修改 `scripts/update-svelte-data.js` 中的正则表达式以适配新格式

### 数据文件损坏

**备份恢复**：

```bash
# 从 git 恢复
git checkout data/stats.json data/npm-stats.json
```

---

## 📚 数据来源与可靠性

| 来源 | 可靠性 | 更新延迟 |
|------|:------:|:--------:|
| GitHub API | ⭐⭐⭐⭐⭐ | 实时 |
| npm Registry | ⭐⭐⭐⭐⭐ | 实时（周统计每日更新） |
| JS Framework Benchmark | ⭐⭐⭐⭐⭐ | 季度 |
| State of JS | ⭐⭐⭐⭐⭐ | 年度 |

所有自动获取的数据均标注时间戳和来源，位于：

- JSON 文件中的 `generatedAt`、`fetchedAt`、`source` 字段
- Markdown 中的 `数据来源：GitHub（YYYY-MM-DD）、npm Registry（YYYY-MM 周均）`

---

## 📝 维护记录

| 日期 | 变更 |
|------|------|
| 2026-05-02 | 创建 `scripts/update-svelte-data.js`，增强 `fetch-trends.js` 和 `npm-stats.js` 的 429 重试逻辑 |
