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

## 代码示例：Ink React 终端 UI

```tsx
// ink-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

function Dashboard() {
  const [progress, setProgress] = useState(0);
  const { exit } = useApp();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useInput((input) => {
    if (input === 'q') exit();
  });

  const barWidth = 30;
  const filled = Math.round((progress / 100) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        JS/TS Build Dashboard
      </Text>
      <Box marginTop={1}>
        <Text>[{bar}] {progress}%</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press "q" to quit</Text>
      </Box>
    </Box>
  );
}

render(<Dashboard />);
```

## 代码示例：Oclif 插件化 CLI

```typescript
// oclif-example/src/commands/hello.ts
import { Command, Flags } from '@oclif/core';

export default class Hello extends Command {
  static description = 'Say hello';

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name to greet',
      default: 'World',
    }),
    from: Flags.string({
      char: 'f',
      description: 'Who is greeting',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Hello);
    this.log(`${flags.from} says: Hello, ${flags.name}!`);
  }
}

// oclif 自动生成 help：
// $ mycli hello --help
// Say hello
//
// FLAGS
//   -f, --from=<value>  (required) Who is greeting
//   -n, --name=<value>  [default: World] Name to greet
```

## 代码示例：Clack 交互式向导

```typescript
// clack-wizard.ts — 纯交互式 CLI
import * as clack from '@clack/prompts';
import chalk from 'chalk';
import { setTimeout } from 'node:timers/promises';

interface ProjectConfig {
  name: string;
  framework: 'react' | 'vue' | 'svelte' | 'vanilla';
  typescript: boolean;
  features: string[];
}

async function runWizard(): Promise<ProjectConfig> {
  clack.intro(chalk.bgBlue('  JS/TS 项目脚手架  '));

  const name = await clack.text({
    message: '项目名称？',
    placeholder: 'my-awesome-app',
    validate: (value) => {
      if (!value) return '项目名称不能为空';
      if (!/^[a-z0-9-_]+$/i.test(value)) return '只能包含字母、数字、连字符和下划线';
    },
  });

  if (clack.isCancel(name)) {
    clack.cancel('已取消');
    process.exit(0);
  }

  const framework = await clack.select({
    message: '选择框架',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'vanilla', label: 'Vanilla JS' },
    ],
  });

  if (clack.isCancel(framework)) {
    clack.cancel('已取消');
    process.exit(0);
  }

  const typescript = await clack.confirm({
    message: '使用 TypeScript？',
    initialValue: true,
  });

  const features = await clack.multiselect({
    message: '选择要安装的额外功能',
    options: [
      { value: 'eslint', label: 'ESLint + Prettier' },
      { value: 'vitest', label: 'Vitest 测试' },
      { value: 'tailwind', label: 'Tailwind CSS' },
      { value: 'ci', label: 'GitHub Actions CI' },
    ],
  });

  const spinner = clack.spinner();
  spinner.start('正在生成项目...');
  await setTimeout(2000);
  spinner.stop('项目生成完成！');

  clack.outro(chalk.green(`✅ cd ${name}`));

  return {
    name: name as string,
    framework: framework as ProjectConfig['framework'],
    typescript: typescript as boolean,
    features: features as string[],
  };
}

runWizard();
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
- [zx — Google 脚本工具](https://github.com/google/zx)
- [Yargs 官方文档](https://yargs.js.org/)
- [Minimist — 轻量解析](https://github.com/minimistjs/minimist)
- [Meow — 轻量 CLI 辅助](https://github.com/sindresorhus/meow)
- [Ink Testing Library](https://github.com/vadimdemedes/ink-testing-library)
- [Sindre Sorhus CLI 指南](https://github.com/sindresorhus/awesome-nodejs#command-line-utilities)
- [Node.js Process 文档](https://nodejs.org/api/process.html)
- [Node.js Readline 文档](https://nodejs.org/api/readline.html)

---

*最后更新: 2026-04-29*
