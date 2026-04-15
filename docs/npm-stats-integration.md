# npm 下载量统计集成指南

本文档介绍如何在项目中集成 npm 下载量统计功能，以及如何使用相关脚本。

## 📋 功能概述

npm 统计集成提供以下功能：

1. **自动获取下载量**：从 npm registry API 获取包的周下载量和月下载量
2. **批量处理**：支持批量查询多个 npm 包
3. **数据持久化**：将统计数据保存到 JSON 文件
4. **与 GitHub Stars 集成**：合并显示 GitHub Stars 和 npm 下载量
5. **报告生成**：自动生成 Markdown 格式的统计报告

## 🔧 文件结构

```
scripts/
├── npm-stats.js      # npm 统计核心模块
├── update-stats.js   # 统计数据集成脚本
└── update-stars.js   # 原有的 Stars 更新脚本

data/
├── npm-stats.json    # npm 下载量数据
├── stats.json        # 合并后的统计数据
└── STATS_REPORT.md   # 生成的统计报告

docs/
└── npm-stats-integration.md  # 本文档
```

## 📡 API 端点

脚本使用以下 npm registry API 端点：

- **周下载量**：`https://api.npmjs.org/downloads/point/last-week/:package`
- **月下载量**：`https://api.npmjs.org/downloads/point/last-month/:package`

### 响应格式示例

```json
{
  "downloads": 1234567,
  "start": "2025-03-28",
  "end": "2025-04-03",
  "package": "express"
}
```

## 🚀 使用方法

### 1. 基础使用

```bash
# 获取默认包列表的统计
node scripts/npm-stats.js

# 获取指定包的统计
node scripts/npm-stats.js fetch express fastify lodash

# 获取完整默认列表
node scripts/npm-stats.js fetch-all
```

### 2. 完整统计集成

```bash
# 更新所有统计数据（GitHub Stars + npm 下载量）
node scripts/update-stats.js

# 仅更新 GitHub Stars
node scripts/update-stats.js --stars-only

# 仅更新 npm 下载量
node scripts/update-stats.js --npm-only

# 基于已有数据生成报告
node scripts/update-stats.js --report
```

### 3. 生成报告

```bash
# 从已保存的 npm 数据生成报告
node scripts/npm-stats.js report

# 指定输出文件
node scripts/npm-stats.js report -o my-report.md
```

## 📊 数据格式

### npm-stats.json 格式

```json
{
  "generatedAt": "2025-04-04T10:30:00.000Z",
  "totalPackages": 50,
  "stats": {
    "express": {
      "weekly": 25000000,
      "monthly": 100000000,
      "lastUpdated": "2025-04-04"
    },
    "lodash": {
      "weekly": 15000000,
      "monthly": 60000000,
      "lastUpdated": "2025-04-04"
    }
  }
}
```

### stats.json 格式（合并数据）

```json
{
  "generatedAt": "2025-04-04T10:30:00.000Z",
  "totalRepos": 30,
  "totalNpmPackages": 50,
  "repositories": {
    "expressjs/express": {
      "owner": "expressjs",
      "repo": "express",
      "github": {
        "starsBadge": "https://img.shields.io/github/stars/expressjs/express",
        "url": "https://github.com/expressjs/express"
      },
      "npm": {
        "package": "express",
        "weekly": 25000000,
        "monthly": 100000000
      }
    }
  },
  "packages": {
    "express": {
      "weekly": 25000000,
      "monthly": 100000000,
      "lastUpdated": "2025-04-04"
    }
  }
}
```

## 🔌 作为模块使用

你可以在其他脚本中导入 npm-stats 模块：

```javascript
const {
  getPackageStats,
  getBatchStats,
  saveStats,
  loadStats
} = require('./scripts/npm-stats');

// 获取单个包
const stats = await getPackageStats('express');
console.log(stats);
// { package: 'express', weekly: 25000000, monthly: 100000000, ... }

// 批量获取
const batchStats = await getBatchStats(['express', 'lodash', 'zod']);
console.log(batchStats);

// 加载已保存的数据
const savedData = loadStats();
```

## ⚙️ 配置

### 默认包列表

编辑 `scripts/npm-stats.js` 中的 `DEFAULT_PACKAGES` 数组：

```javascript
const DEFAULT_PACKAGES = [
  'express', 'fastify', 'koa',
  'next', 'nuxt', 'astro',
  // ... 添加更多包
];
```

### GitHub 到 npm 包名映射

在 `scripts/update-stats.js` 中编辑 `inferNpmPackage` 函数：

```javascript
const specialCases = {
  'expressjs': 'express',
  'nestjs': '@nestjs/core',
  // ... 添加更多映射
};
```

## 🔄 GitHub Actions 集成

建议将统计更新添加到 GitHub Actions 工作流：

```yaml
name: Update Stats

on:
  schedule:
    # 每天 UTC 02:00 运行
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Update stats
        run: node scripts/update-stats.js

      - name: Commit changes
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git add data/ README.md
          git commit -m "chore: update stats [skip ci]" || exit 0
          git push
```

## 📈 性能考虑

- **并发控制**：默认并发数为 5，可通过选项调整
- **请求延迟**：默认批次间延迟 100ms，避免触发限流
- **超时设置**：单个请求超时时间为 10 秒
- **错误处理**：单个包失败不会中断整个流程

## 🛠️ 故障排除

### API 限流

如果遇到限流，增加延迟：

```javascript
const stats = await getBatchStats(packages, {
  concurrency: 3,  // 降低并发
  delay: 500,      // 增加延迟
});
```

### 包名编码

Scoped packages（如 `@nestjs/core`）会自动进行 URL 编码。

### 网络问题

如果遇到网络超时，检查：

1. 网络连接
2. 代理设置
3. 防火墙规则

## 📝 贡献指南

添加新的 npm 包到追踪列表：

1. 编辑 `scripts/npm-stats.js` 中的 `DEFAULT_PACKAGES`
2. 如果包名与 GitHub 仓库名不同，在 `inferNpmPackage` 中添加映射
3. 运行测试确保数据获取正常

## 🔗 相关资源

- [npm registry API 文档](https://github.com/npm/registry/blob/master/docs/download-counts.md)
- [shields.io 徽章服务](https://shields.io/)
- [GitHub API 文档](https://docs.github.com/en/rest)

## 📄 许可证

MIT
