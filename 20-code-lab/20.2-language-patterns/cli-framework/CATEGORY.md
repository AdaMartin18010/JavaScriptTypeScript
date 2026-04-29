---
dimension: 综合
sub-dimension: Cli framework
created: 2026-04-28
---

# CATEGORY.md — CLI Framework

## 模块归属声明

本模块归属 **「综合」** 维度，聚焦 CLI（命令行界面）框架核心概念与工程实践。

## 包含内容

- 参数解析（Argument Parsing）与校验
- 命令构建器（Command Builder）与子命令编排
- 配置加载（Config Loader）与层级合并
- 交互式提示（Interactive Prompt）与终端 UI
- 帮助文档自动生成

## 子模块目录结构

| 子模块 | 说明 | 关键概念 |
|--------|------|----------|
| `command-parser/` | 命令解析 | POSIX/GNU 风格参数、位置参数、剩余参数 |
| `argument-validator/` | 参数校验 | 类型转换、必填校验、自定义规则 |
| `cli-builder/` | CLI 构建器 | 子命令注册、中间件、生命周期钩子 |
| `config-loader/` | 配置加载 | JSON/YAML/JS 配置、环境变量、默认值合并 |
| `help-generator/` | 帮助生成 | 自动排版、用法示例、彩色输出 |
| `interactive-prompt/` | 交互提示 | inquirer、confirm、select、自动补全 |

## 代码示例

### 手工参数解析器

```typescript
// argument-parser.ts — 理解 CLI 解析底层
interface ParsedArgs {
  flags: Record<string, boolean | string>;
  positional: string[];
  rest: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, boolean | string> = {};
  const positional: string[] = [];
  let restMode = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (restMode) {
      positional.push(arg);
      continue;
    }

    if (arg === '--') {
      restMode = true;
      continue;
    }

    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq >= 0) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith('-')) {
          flags[arg.slice(2)] = next;
          i++;
        } else {
          flags[arg.slice(2)] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      // 短选项聚合: -abc → -a -b -c
      for (const ch of arg.slice(1)) {
        flags[ch] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional, rest: positional };
}

// 使用
const args = parseArgs(process.argv.slice(2));
console.log(args);
// node script.js build --watch --out=dist src → { flags: { watch: true, out: 'dist' }, positional: ['src'] }
```

### 类型安全的命令构建器

```typescript
// cli-builder.ts — 类型安全的命令注册
interface CommandContext {
  cwd: string;
  verbose: boolean;
}

type CommandHandler<T extends Record<string, unknown>> = (
  args: T,
  ctx: CommandContext
) => Promise<void>;

class CLIBuilder {
  private commands = new Map<string, { desc: string; handler: CommandHandler<any> }>();
  private middlewares: Array<(ctx: CommandContext) => CommandContext | Promise<CommandContext>> = [];

  use(mw: (ctx: CommandContext) => CommandContext | Promise<CommandContext>) {
    this.middlewares.push(mw);
    return this;
  }

  command<T extends Record<string, unknown>>(
    name: string,
    desc: string,
    handler: CommandHandler<T>
  ) {
    this.commands.set(name, { desc, handler });
    return this;
  }

  async run(argv: string[]) {
    const [cmdName, ...rest] = argv;
    const cmd = this.commands.get(cmdName);
    if (!cmd) {
      console.error(`Unknown command: ${cmdName}`);
      this.showHelp();
      process.exit(1);
    }

    let ctx: CommandContext = { cwd: process.cwd(), verbose: false };
    for (const mw of this.middlewares) {
      ctx = await mw(ctx);
    }

    const parsed = this.parseFlags(rest);
    await cmd.handler(parsed as any, ctx);
  }

  private parseFlags(args: string[]): Record<string, unknown> {
    // 简化实现...
    return {};
  }

  private showHelp() {
    console.log('Available commands:');
    for (const [name, { desc }] of this.commands) {
      console.log(`  ${name.padEnd(12)} ${desc}`);
    }
  }
}

// 使用
const cli = new CLIBuilder();
cli
  .use(async (ctx) => ({ ...ctx, verbose: process.env.VERBOSE === '1' }))
  .command<{ files: string[] }>('build', 'Build the project', async (args, ctx) => {
    console.log('Building...', args, ctx);
  });
```

### 配置加载与层级合并

```typescript
// config-loader.ts — 配置优先级: CLI 参数 > 环境变量 > 本地配置 > 默认配置
import { readFileSync } from 'fs';
import { join } from 'path';

interface AppConfig {
  port: number;
  host: string;
  database: { url: string; poolSize: number };
}

const defaults: AppConfig = {
  port: 3000,
  host: '0.0.0.0',
  database: { url: 'sqlite::memory:', poolSize: 5 },
};

function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  // 1. 默认值
  let config = structuredClone(defaults);

  // 2. 文件配置 (./config.json)
  try {
    const file = JSON.parse(readFileSync(join(process.cwd(), 'config.json'), 'utf8'));
    config = deepMerge(config, file);
  } catch { /* ignore missing config */ }

  // 3. 环境变量 (APP_PORT, APP_DATABASE__URL)
  config = deepMerge(config, envToConfig('APP_'));

  // 4. CLI 覆盖
  config = deepMerge(config, overrides);

  return config;
}

function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function envToConfig(prefix: string): any {
  const config: any = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(prefix)) continue;
    const path = key.slice(prefix.length).toLowerCase().split('__');
    let cur = config;
    for (let i = 0; i < path.length - 1; i++) {
      cur[path[i]] = cur[path[i]] ?? {};
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
  }
  return config;
}
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| Commander.js | 文档 | [github.com/tj/commander.js](https://github.com/tj/commander.js) — Node.js CLI 框架 |
| yargs | 文档 | [yargs.js.org](https://yargs.js.org) —  pirate-themed CLI 解析器 |
| Oclif | 文档 | [oclif.io](https://oclif.io) — Heroku/ Salesforce 开源 CLI 框架 |
| Ink | 文档 | [github.com/vadimdemedes/ink](https://github.com/vadimdemedes/ink) — React for CLIs |
| inquirer.js | 文档 | [github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js) — 交互式提示 |
| CLI Guidelines | 指南 | [clig.dev](https://clig.dev) — 命令行界面设计最佳实践 |
| POSIX Utility Conventions | 规范 | [pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html) |
| GNU Coding Standards | 规范 | [gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html) |
| chalk | 工具 | [github.com/chalk/chalk](https://github.com/chalk/chalk) — 终端样式库 |
| meow | 工具 | [github.com/sindresorhus/meow](https://github.com/sindresorhus/meow) — 极简 CLI 助手 |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 argument-validator.test.ts
- 📄 argument-validator.ts
- 📄 cli-builder.test.ts
- 📄 cli-builder.ts
- 📄 command-parser.test.ts
- 📄 command-parser.ts
- 📄 config-loader.test.ts
- 📄 config-loader.ts
- 📄 help-generator.test.ts
- 📄 help-generator.ts
- 📄 index.ts
- 📄 interactive-prompt.test.ts
- ... 等 3 个条目

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。

---

*最后更新: 2026-04-29*
