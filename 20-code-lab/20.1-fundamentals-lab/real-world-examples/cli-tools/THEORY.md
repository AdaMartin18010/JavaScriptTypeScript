# CLI 工具

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/cli-tools`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决命令行工具的开发问题。涵盖参数解析、交互式提示、进度显示和跨平台兼容性。

### 1.2 形式化基础

CLI 程序可建模为函数 `f: Args × Env → ExitCode × Stdout × Stderr`，其中：

- `Args`: 命令行参数向量
- `Env`: 环境变量映射
- `ExitCode`: 0 表示成功，非零表示错误类别
- `Stdout`: 程序输出流
- `Stderr`: 错误与诊断信息流

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 参数解析 | 命令行输入的结构化提取 | arg-parser.ts |
| 进程退出码 | 向 shell 报告执行状态的约定 | exit-codes.ts |

---

## 二、设计原理

### 2.1 为什么存在

命令行是开发者最高效的操作界面。CLI 工具通过脚本化、管道化和批量化，显著提升开发、构建和部署流程的自动化水平。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 交互式提示 | 用户友好 | 自动化困难 | 初始化向导 |
| 纯参数 | 易于脚本化 | 学习成本高 | CI/CD 工具 |

---

## 三、CLI 框架对比

| 框架 | 特性 | 生态插件 | 类型支持 | 适用场景 |
|------|------|----------|----------|----------|
| **Commander.js** | 简洁声明式 API，子命令支持 | 中等（inquirer、chalk 等） | 社区 @types | 中小型 CLI、快速原型 |
| **oclif** | 企业级框架，自动生成 help、插件系统 | 丰富（Heroku CLI 同款） | 原生 TS | 大型多命令 CLI（如 Salesforce CLI） |
| **Yargs** | 中间件管道、自动 help、严格模式 | 中等 | 原生 TS | 复杂参数验证、中间件链 |
| **Ink** | React 组件渲染到终端 | 丰富（spinners、tables） | 原生 TS | 富交互 TUI（类 GUI 的终端界面） |
| **zx** | Google 出品，用 JS/TS 写 shell 脚本 | 依赖 Node.js 内置 | 原生 TS | 快速脚本、构建流程替代 Bash |
| **Clack** | 现代交互提示（取代 inquirer） | 轻量生态 | 原生 TS | 初始化向导、配置脚手架 |

---

## 四、Code Example：Commander.js

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

const program = new Command();

program
  .name('jstool')
  .description('A sample CLI for JS/TS project scaffolding')
  .version(pkg.version);

program
  .command('init <project-name>')
  .description('Initialize a new project')
  .option('-t, --template <type>', 'project template', 'vanilla')
  .option('--skip-install', 'skip dependency installation', false)
  .action(async (projectName: string, options: { template: string; skipInstall: boolean }) => {
    console.log(chalk.blue(`Creating project: ${projectName}`));
    console.log(chalk.gray(`  Template: ${options.template}`));
    console.log(chalk.gray(`  Skip install: ${options.skipInstall}`));
    // 实际实现：复制模板、写入 package.json、可选 npm install
  });

program
  .command('lint [files...]')
  .description('Lint TS files')
  .option('--fix', 'auto-fix issues', false)
  .action(async (files: string[], options: { fix: boolean }) => {
    const targets = files.length > 0 ? files : ['src/**/*.ts'];
    console.log(chalk.yellow(`Linting: ${targets.join(', ')}`));
    console.log(chalk.gray(`  Auto-fix: ${options.fix}`));
    // 实际实现：调用 ESLint API
  });

// 子命令组示例
const db = program.command('db').description('Database operations');

db.command('migrate')
  .description('Run pending migrations')
  .option('--dry-run', 'preview changes without applying', false)
  .action(async (options: { dryRun: boolean }) => {
    console.log(chalk.green('Running migrations...'));
    if (options.dryRun) {
      console.log(chalk.cyan('[DRY RUN] No actual changes'));
    }
  });

// 解析参数
program.parse();
```

**使用示例**：

```bash
# 查看帮助
jstool --help

# 初始化项目
jstool init my-app --template react

# 执行 lint
jstool lint src/index.ts src/utils.ts --fix

# 数据库迁移预览
jstool db migrate --dry-run
```

---

## 五、Code Example：Clack 交互式向导

```typescript
#!/usr/bin/env node
import { intro, outro, text, select, confirm, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';

async function main() {
  intro(chalk.bgBlue(' Create a new JS/TS project '));

  const projectName = await text({
    message: 'Project name?',
    placeholder: 'my-awesome-app',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(value)) return 'Only lowercase letters, numbers, and hyphens';
    },
  });

  if (isCancel(projectName)) {
    outro('Cancelled');
    process.exit(0);
  }

  const framework = await select({
    message: 'Pick a framework',
    options: [
      { value: 'vanilla', label: 'Vanilla' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'svelte', label: 'Svelte' },
    ],
  });

  if (isCancel(framework)) {
    outro('Cancelled');
    process.exit(0);
  }

  const useTypescript = await confirm({
    message: 'Use TypeScript?',
    initialValue: true,
  });

  if (isCancel(useTypescript)) {
    outro('Cancelled');
    process.exit(0);
  }

  const useLint = await confirm({
    message: 'Add ESLint + Prettier?',
    initialValue: true,
  });

  // 模拟项目生成
  console.log(chalk.gray(`\nScaffolding project in ./${projectName}...`));

  // 实际实现：
  // await copyTemplate(framework, useTypescript, projectName);
  // if (useLint) await setupLint(projectName);

  outro(chalk.green(`Done! cd ${projectName} && npm install`));
}

main().catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
```

---

## 六、Code Example：zx 脚本替代 Bash

```typescript
#!/usr/bin/env tsx
import { $, cd, chalk, fs, path } from 'zx';

// 配置：zx 默认在命令失败时抛出异常
$.verbose = true;

async function deploy() {
  const pkg = await fs.readJson('package.json');
  const version = pkg.version;
  const tag = `v${version}`;

  console.log(chalk.blue(`Deploying ${pkg.name}@${version}...`));

  // 运行构建
  await $`npm run build`;

  // 运行测试
  await $`npm run test`;

  // 生成变更日志
  await $`git add .`;
  await $`git commit -m "release: ${tag}"`;
  await $`git tag ${tag}`;

  // 发布
  await $`npm publish`;
  await $`git push origin main --tags`;

  console.log(chalk.green(`Successfully deployed ${tag}`));
}

async function setupProject(name: string) {
  await $`mkdir -p ${name}`;
  cd(name);

  await $`npm init -y`;
  await $`npm install typescript vitest @types/node`;
  await $`npx tsc --init`;

  // 修改 package.json
  const pkg = await fs.readJson('package.json');
  pkg.scripts = {
    build: 'tsc',
    test: 'vitest',
    dev: 'tsx watch src/index.ts',
  };
  await fs.writeJson('package.json', pkg, { spaces: 2 });

  await fs.ensureDir('src');
  await fs.writeFile('src/index.ts', 'console.log("Hello, world!");\n');

  console.log(chalk.green(`Project ${name} ready!`));
}

// 主入口
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case 'deploy':
    await deploy();
    break;
  case 'setup':
    await setupProject(args[0] || 'new-project');
    break;
  default:
    console.log(chalk.yellow('Usage: zx deploy | zx setup <name>'));
    process.exit(1);
}
```

---

## 七、Code Example：Ink TUI（React for Terminal）

```tsx
#!/usr/bin/env node
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import Spinner from 'ink-spinner';

// 一个简单的任务列表 TUI
interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

function TaskRunner() {
  const { exit } = useApp();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Install dependencies', status: 'done' },
    { id: '2', name: 'Run type check', status: 'running' },
    { id: '3', name: 'Run tests', status: 'pending' },
    { id: '4', name: 'Build production', status: 'pending' },
  ]);
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    if (key.downArrow) setSelected(s => Math.min(tasks.length - 1, s + 1));
    if (input === 'r') {
      // 重试选中任务
      setTasks(prev =>
        prev.map((t, i) => (i === selected ? { ...t, status: 'running' } : t))
      );
    }
    if (key.escape || input === 'q') exit();
  });

  useEffect(() => {
    // 模拟任务执行
    const timer = setInterval(() => {
      setTasks(prev => {
        const running = prev.findIndex(t => t.status === 'running');
        if (running === -1) return prev;
        const next = [...prev];
        next[running] = { ...next[running], status: Math.random() > 0.1 ? 'done' : 'error' };
        if (running + 1 < next.length && next[running + 1].status === 'pending') {
          next[running + 1] = { ...next[running + 1], status: 'running' };
        }
        return next;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const statusIcon = (s: Task['status']) => {
    switch (s) {
      case 'done': return chalk.green('✓');
      case 'error': return chalk.red('✗');
      case 'running': return <Spinner type="dots" />;
      default: return chalk.gray('○');
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>CI Pipeline</Text>
      {tasks.map((task, i) => (
        <Box key={task.id}>
          <Text>{i === selected ? '> ' : '  '}</Text>
          <Text>{statusIcon(task.status)} </Text>
          <Text color={task.status === 'error' ? 'red' : undefined}>{task.name}</Text>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>↑↓ navigate | r retry | q quit</Text>
      </Box>
    </Box>
  );
}

render(<TaskRunner />);
```

---

## 八、进程退出码最佳实践

```typescript
// lib/exit-codes.ts
export const ExitCode = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENT: 2,
  NOT_FOUND: 3,
  PERMISSION_DENIED: 4,
  TIMEOUT: 5,
  EXTERNAL_COMMAND_FAILED: 127,
  SIGNAL_TERMINATED: 130, // SIGINT
} as const;

// 优雅的错误处理
export class CliError extends Error {
  constructor(
    message: string,
    public readonly code: number = ExitCode.GENERAL_ERROR,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CliError';
  }
}

export function handleError(err: unknown): never {
  if (err instanceof CliError) {
    console.error(chalk.red(`Error (${err.code}): ${err.message}`));
    if (err.details) console.error(chalk.gray(JSON.stringify(err.details, null, 2)));
    process.exit(err.code);
  }

  console.error(chalk.red('Unexpected error:'), err);
  process.exit(ExitCode.GENERAL_ERROR);
}

// 使用
import { handleError, CliError, ExitCode } from './lib/exit-codes';

try {
  await main();
} catch (err) {
  handleError(err);
}
```

---

## 九、与相关技术的对比

与 GUI 工具对比：CLI 更适合自动化和远程环境，学习曲线更陡。

| 维度 | CLI | GUI |
|------|-----|-----|
| 自动化 | ✅ 脚本化、管道化 | ❌ 手动操作 |
| 远程环境 | ✅ SSH 即可 | ❌ 需图形转发 |
| 学习曲线 | 陡峭 | 平缓 |
| 可发现性 | 低（需阅读文档） | 高（视觉提示） |
| 复现性 | 高（命令可记录） | 低（点击难以记录） |

---

## 十、实践映射

### 10.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 CLI 工具 核心机制的理解，并观察不同实现选择带来的行为差异。

### 10.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 进程退出码不重要 | 退出码是脚本链式调用的契约 |
| stdout 和 stderr 可以混用 | stderr 应专用于错误和诊断信息 |
| 所有平台路径分隔符相同 | 使用 `path.sep` 和 `path.join` 保证跨平台 |

---

## 十一、扩展阅读

- [Commander.js Documentation](https://github.com/tj/commander.js#readme)
- [oclif 框架文档](https://oclif.io/docs/introduction)
- [Ink – React for CLIs](https://github.com/vadimdemedes/ink)
- [zx – Google 脚本工具](https://github.com/google/zx)
- [Clack – Modern Interactive CLI](https://github.com/natemoo-re/clack)
- [Node.js Process Exit Codes](https://nodejs.org/api/process.html#process_exit_codes)
- [Node.js Readline 模块](https://nodejs.org/api/readline.html) — 原生交互输入
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code) — 终端控制序列
- `30-knowledge-base/30.7-tooling`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
