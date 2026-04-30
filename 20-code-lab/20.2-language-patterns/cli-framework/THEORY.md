# CLI 框架理论：从脚本到产品级工具

> **目标读者**：工具开发者、DevOps 工程师、关注开发者体验的团队
> **关联文档**：``30-knowledge-base/30.2-categories/cli-framework.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. CLI 设计原则

### 1.1 Unix 哲学

```
1. 每个程序只做一件事，并把它做好
2. 程序的输出应该是另一个程序的输入
3. 使用文本流作为通用接口
```

### 1.2 现代 CLI 要素

| 要素 | 示例 | 库 |
|------|------|-----|
| **参数解析** | `mycli --port 3000` | Commander.js, Yargs, Clap |
| **交互提示** | 选择列表、输入验证 | Inquirer, @clack/prompts |
| **进度展示** | 进度条、旋转器 | Ora, Consola |
| **颜色输出** | 错误红、成功绿 | Chalk, Picocolors |
| **自动补全** | Tab 补全命令 | Omelette, Fig |
| **帮助文档** | `--help` 自动生成 | Commander's built-in |

---

## 2. JS/TS CLI 生态

### 2.1 框架选型

| 框架 | 特点 | 适用 |
|------|------|------|
| **Commander.js** | 经典、稳定 | 通用 CLI |
| **Yargs** | 强大的中间件 | 复杂参数 |
| **Clack** | 现代、美观 | 交互式 CLI |
| **Ink** | React 渲染终端 | 复杂 TUI |
| **Oclif** | Heroku 出品 | 大型 CLI 框架 |

### 2.2 打包与分发

```bash
# 方案 1: npm 全局安装
npm install -g mycli

# 方案 2: npx（无需安装）
npx mycli

# 方案 3: 独立可执行文件
pkg .       # 打包为二进制
bun build --compile   # Bun 编译
```

---

## 3. 代码示例

### 3.1 Commander.js 子命令与选项验证

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('deploy-cli')
  .description('部署工具')
  .version('1.0.0');

program
  .command('deploy <env>')
  .description('部署到指定环境')
  .option('-d, --dry-run', '模拟运行，不实际部署')
  .option('-t, --timeout <seconds>', '超时时间', '300')
  .option('--tag <tag>', '镜像标签', 'latest')
  .action((env: string, options: { dryRun?: boolean; timeout: string; tag: string }) => {
    console.log(`Deploying to ${env}`);
    console.log(`  dryRun: ${options.dryRun ?? false}`);
    console.log(`  timeout: ${options.timeout}s`);
    console.log(`  tag: ${options.tag}`);
  });

program.parse();
```

### 3.2 Clack 交互式提示

```typescript
import { intro, outro, text, select, confirm, spinner } from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';

async function main() {
  intro('Create New Project');

  const name = await text({
    message: 'Project name?',
    placeholder: 'my-awesome-app',
    validate(value) {
      if (!value) return 'Project name is required';
      if (value.length < 3) return 'Name must be at least 3 characters';
    },
  });

  const framework = await select({
    message: 'Pick a framework.',
    options: [
      { value: 'next', label: 'Next.js' },
      { value: 'nuxt', label: 'Nuxt' },
      { value: 'sveltekit', label: 'SvelteKit' },
    ],
  });

  const install = await confirm({
    message: 'Install dependencies?',
    initialValue: true,
  });

  if (install) {
    const s = spinner();
    s.start('Installing via npm');
    await setTimeout(2000);
    s.stop('Installed');
  }

  outro(`Project "${name}" created successfully!`);
}

main().catch(console.error);
```

### 3.3 Ink React 终端 UI

```typescript
import { render, Text, Box, useInput, useApp } from 'ink';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const { exit } = useApp();

  useInput((input) => {
    if (input === 'q') exit();
    if (input === 'k') setCount((n) => n + 1);
    if (input === 'j') setCount((n) => n - 1);
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="green">Interactive Counter</Text>
      <Text>Count: {count}</Text>
      <Text dimColor>[j] decrement  [k] increment  [q] quit</Text>
    </Box>
  );
}

render(<Counter />);
```

### 3.4 配置文件加载与合并

```typescript
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

interface CliConfig {
  registry?: string;
  timeout?: number;
  retry?: number;
}

function loadConfig(cwd: string): CliConfig {
  const paths = [
    resolve(cwd, '.myclirc.json'),
    resolve(cwd, '.myclirc.js'),
    resolve(cwd, 'package.json'),
  ];

  for (const p of paths) {
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, 'utf-8');
    if (p.endsWith('package.json')) {
      const pkg = JSON.parse(raw) as { mycli?: CliConfig };
      if (pkg.mycli) return pkg.mycli;
    } else if (p.endsWith('.js')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(p) as CliConfig;
    } else {
      return JSON.parse(raw) as CliConfig;
    }
  }
  return {};
}
```

### 3.5 Zod 驱动的参数校验与类型安全

```typescript
// zod-cli-validation.ts — 将 CLI 输入映射到 Zod Schema
import { z } from 'zod';

const DeployOptions = z.object({
  env: z.enum(['dev', 'staging', 'prod']),
  port: z.coerce.number().min(1024).max(65535).default(3000),
  tag: z.string().regex(/^[a-z0-9\-]+$/).default('latest'),
  dryRun: z.boolean().default(false),
});

type DeployOptions = z.infer<typeof DeployOptions>;

function parseAndValidate(args: Record<string, unknown>): DeployOptions {
  const result = DeployOptions.safeParse(args);
  if (!result.success) {
    console.error('Invalid arguments:');
    for (const issue of result.error.issues) {
      console.error(`  --${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

// 使用
const options = parseAndValidate({ env: 'prod', port: '8080' });
console.log(options.port); // 8080 (number)
```

### 3.6 zx 脚本：用 TypeScript 替代 Bash

```typescript
// deploy-script.mts — Google zx 提供类 Bash 的 JS/TS 脚本体验
import { $, cd, chalk, question } from 'zx';

$.verbose = true;

const tag = await question('Deploy tag? ', { choices: ['latest', 'stable'] });
const env = process.env.DEPLOY_ENV ?? 'staging';

await cd('/app');

// 类 Bash 的模板字符串，自动转义参数
await $`docker build -t myapp:${tag} .`;
await $`docker push myapp:${tag}`;

// 捕获输出并处理
const pods = await $`kubectl get pods -n ${env} -o json`;
const podList = JSON.parse(pods.stdout).items;
console.log(chalk.green(`Found ${podList.length} pods in ${env}`));
```

---

## 4. 测试 CLI

```typescript
import { execa } from 'execa';

 test('should show help', async () => {
  const { stdout } = await execa('node', ['./bin/cli.js', '--help']);
  expect(stdout).toContain('Usage:');
});
```

### 4.1 快照测试帮助文本

```typescript
import { test, expect } from 'vitest';
import { execa } from 'execa';

test('help output snapshot', async () => {
  const { stdout } = await execa('node', ['./dist/cli.js', '--help']);
  expect(stdout).toMatchInlineSnapshot(`
    "Usage: deploy-cli [options] [command]

    Options:
      -V, --version   output the version number
      -h, --help      display help for command

    Commands:
      deploy <env>    部署到指定环境
      help [command]  display help for command"
  `);
});
```

---

## 5. 反模式

### 反模式 1：静默失败

❌ 命令失败无任何输出。
✅ 明确错误信息 + 退出码非零。

### 反模式 2：破坏管道

❌ 输出包含装饰字符（emoji、颜色码），无法管道处理。
✅ 检测 `process.stdout.isTTY`，非终端环境禁用装饰。

```typescript
import { supportsColor } from 'supports-color';

const useColor = process.stdout.isTTY && supportsColor.stdout !== false;
const red = (s: string) => (useColor ? `\x1b[31m${s}\x1b[0m` : s);
```

---

## 6. 总结

CLI 是**开发者体验的第一触点**。

**核心原则**：

1. 快速启动 (< 100ms)
2. 清晰的错误信息
3. 遵循 POSIX 惯例

---

## 参考资源

- [Commander.js](https://github.com/tj/commander.js/)
- [Clack](https://github.com/natemoo-re/clack)
- [Ink](https://github.com/vadimdemedes/ink)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [CLI Guidelines](https://clig.dev/)
- [ANSI Escape Codes — Wikipedia](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [npm — package.json bin field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
- [Node.js — process.exit codes](https://nodejs.org/api/process.html#processexitcode)
- [Sindre Sorhus — cli-spinners](https://github.com/sindresorhus/cli-spinners)
- [Google zx](https://github.com/google/zx) — TypeScript 脚本工具
- [Node.js util.parseArgs](https://nodejs.org/api/util.html#utilparseargsconfig) — 原生零依赖参数解析
- [cac](https://github.com/cacjs/cac) — 轻量 CLI 框架，Vite 使用
- [Zod](https://zod.dev/) — TypeScript-first schema validation
- [Oclif Core](https://github.com/oclif/core) — 大型 CLI 框架核心
- [Chalk 5](https://github.com/chalk/chalk) — ESM 终端样式库
- [Consola](https://github.com/unjs/consola) — 优雅的 Node.js 控制台输出
- [Listr2](https://listr2.kilic.dev/) — 美观的 CLI 任务列表

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `argument-validator.ts`
- `cli-builder.ts`
- `command-parser.ts`
- `config-loader.ts`
- `help-generator.ts`
- `index.ts`
- `interactive-prompt.ts`
- `progress-bar.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括：

1. **职责链模式 (Chain of Responsibility)**：中间件按顺序处理 CLI 上下文，每个中间件决定是否继续传递或中断流程（见于 `cli-builder.ts` 的 `use()` 方法）。
2. **模板方法模式 (Template Method)**：命令执行遵循固定的生命周期钩子（解析参数 → 执行中间件 → 调用处理器 → 错误处理），子命令可覆盖具体行为。
3. **策略模式 (Strategy)**：参数解析器支持多种策略（POSIX 短选项聚合、`--key=value` 语法、`--` 剩余参数截断），运行时根据输入特征动态选择解析路径。

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `10-fundamentals/10.2-type-system/` — 掌握 TS 泛型与类型推断，以构建类型安全的 CLI API |
| 前置依赖 | `20-code-lab/20.1-fundamentals-lab/` — Node.js 文件系统、进程、流的基础操作 |
| 后续进阶 | `20-code-lab/20.2-language-patterns/fullstack-patterns/` — 将 CLI 工具集成到全栈工作流（如部署、代码生成） |
| 后续进阶 | `20-code-lab/20.11-rust-toolchain/` — 使用 Rust 编写高性能 CLI 二进制工具 |

---

> 📅 理论深化更新：2026-04-30
