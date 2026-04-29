# CLI 框架

> JavaScript/TypeScript CLI 工具开发框架选型。

---

## 主流方案

| 框架 | 特点 | 包体积 |
|------|------|--------|
| **Commander.js** | 最流行，简单命令解析 | ~15KB |
| **oclif** | Heroku/Slack 出品，插件化 | ~50KB |
| **Ink** | React 渲染终端 UI | ~30KB |
| **Pastel** | 基于 Ink 的框架 | ~20KB |
| **Clack** | 交互式提示，现代体验 | ~10KB |
| **cac** | 极简，零依赖 | ~5KB |

---

## 主流框架对比

| 维度 | Commander.js | Oclif | Ink | Cliffy |
|------|--------------|-------|-----|--------|
| **定位** | 命令解析 | 企业级 CLI 框架 | React 终端 UI | Deno 原生交互 CLI |
| **运行环境** | Node.js / Bun | Node.js | Node.js | Deno |
| **命令解析** | 手动定义 | 自动生成帮助 / 版本 | N/A（UI 库） | 装饰器 / 手动 |
| **交互提示** | 需配合 inquirer | 需配合 inquirer / clack | 组件化 UI | 内置 prompts / select |
| **插件系统** | 无 | 原生插件 + hook | 无 | 模块化命令 |
| **测试支持** | 手动 | 内置 mock stdin/stdout | ink-testing-library | Deno test |
| **TypeScript** | 良好 | 优秀 | 优秀 | 原生（Deno） |
| **生态规模** | 最大（~30M 周下载） | 大 | 中 | 小（Deno 专属） |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃（Deno） |

---

## 代码示例：Commander.js + Chalk + Clack

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as clack from '@clack/prompts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('jsts-cli')
  .description('JavaScript/TypeScript 项目脚手架 CLI')
  .version(pkg.version, '-v, --version', '显示当前版本');

program
  .command('create <project-name>')
  .description('创建一个新项目')
  .option('-t, --template <type>', '项目模板', 'vanilla-ts')
  .option('-f, --force', '强制覆盖已有目录', false)
  .action(async (projectName: string, options: { template: string; force: boolean }) => {
    clack.intro(chalk.blue('🚀 创建新项目'));

    const shouldContinue = await clack.confirm({
      message: `使用模板 "${options.template}" 创建 "${projectName}"，是否继续？`,
    });

    if (shouldContinue !== true) {
      clack.outro(chalk.yellow('已取消'));
      process.exit(0);
    }

    const spinner = clack.spinner();
    spinner.start('正在初始化项目...');

    // 模拟异步任务
    await new Promise((resolve) => setTimeout(resolve, 1500));

    spinner.stop('项目创建完成！');
    clack.note(chalk.green(`cd ${projectName}`) + '\n' + chalk.green('npm install'), '下一步');
    clack.outro(chalk.green('✅ 完成'));
  });

program
  .command('lint [files...]')
  .description('运行 ESLint 检查')
  .option('--fix', '自动修复问题', false)
  .action(async (files: string[], options: { fix: boolean }) => {
    console.log(chalk.cyan('正在检查文件:'), files.length ? files.join(', ') : '全部文件');
    console.log(chalk.gray('自动修复:'), options.fix ? chalk.green('开启') : chalk.yellow('关闭'));
  });

program.parse();
```

---

## 2026 推荐

- **简单脚本**：Commander.js 或 cac
- **复杂交互式 CLI**：Clack + Ink
- **企业级工具**：oclif
- **Deno 生态**：Cliffy

---

## 权威参考链接

- [Commander.js 官方文档](https://github.com/tj/commander.js#readme)
- [oclif 官方文档](https://oclif.io/)
- [Ink 官方文档](https://github.com/vadimdemedes/ink#readme)
- [Clack 官方文档](https://github.com/natemoo-re/clack)
- [Cliffy 官方文档](https://cliffy.io/)
- [cac 官方文档](https://github.com/cacjs/cac)
- [Chalk 官方文档](https://github.com/chalk/chalk)

---

*最后更新: 2026-04-29*
