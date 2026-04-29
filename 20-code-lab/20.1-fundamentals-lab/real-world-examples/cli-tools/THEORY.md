# CLI 工具

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/cli-tools`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决命令行工具的开发问题。涵盖参数解析、交互式提示、进度显示和跨平台兼容性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

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

## 五、与相关技术的对比

与 GUI 工具对比：CLI 更适合自动化和远程环境，学习曲线更陡。

| 维度 | CLI | GUI |
|------|-----|-----|
| 自动化 | ✅ 脚本化、管道化 | ❌ 手动操作 |
| 远程环境 | ✅ SSH 即可 | ❌ 需图形转发 |
| 学习曲线 | 陡峭 | 平缓 |
| 可发现性 | 低（需阅读文档） | 高（视觉提示） |
| 复现性 | 高（命令可记录） | 低（点击难以记录） |

---

## 六、实践映射

### 6.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 CLI 工具 核心机制的理解，并观察不同实现选择带来的行为差异。

### 6.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 进程退出码不重要 | 退出码是脚本链式调用的契约 |
| stdout 和 stderr 可以混用 | stderr 应专用于错误和诊断信息 |

---

## 七、扩展阅读

- [Commander.js Documentation](https://github.com/tj/commander.js#readme)
- [oclif 框架文档](https://oclif.io/docs/introduction)
- [Ink – React for CLIs](https://github.com/vadimdemedes/ink)
- [zx – Google 脚本工具](https://github.com/google/zx)
- [Clack – Modern Interactive CLI](https://github.com/natemoo-re/clack)
- [Node.js Process Exit Codes](https://nodejs.org/api/process.html#process_exit_codes)
- `30-knowledge-base/30.7-tooling`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
