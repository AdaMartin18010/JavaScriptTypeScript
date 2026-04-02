/**
 * @file CLI 命令解析器
 * @category Real World Examples → CLI Tools
 * @difficulty medium
 * @tags cli, command-parser, arg-parser
 */

// ============================================================================
// 1. 参数解析
// ============================================================================

export interface ParsedArgs {
  command: string;
  args: string[];
  flags: Map<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args: string[] = [];
  const flags = new Map<string, string | boolean>();
  let command = '';
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value !== undefined) {
        flags.set(key, value);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        flags.set(key, argv[++i]);
      } else {
        flags.set(key, true);
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        flags.set(key, argv[++i]);
      } else {
        flags.set(key, true);
      }
    } else if (!command) {
      command = arg;
    } else {
      args.push(arg);
    }
  }
  
  return { command, args, flags };
}

// ============================================================================
// 2. 命令构建器
// ============================================================================

type CommandHandler = (args: string[], flags: Map<string, string | boolean>) => void | Promise<void>;

interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

export class CLI {
  private commands = new Map<string, Command>();
  private defaultHandler?: CommandHandler;
  
  command(name: string, description: string, handler: CommandHandler): this {
    this.commands.set(name, { name, description, handler });
    return this;
  }
  
  default(handler: CommandHandler): this {
    this.defaultHandler = handler;
    return this;
  }
  
  help(): string {
    const lines = ['Usage: <command> [options] [arguments]', '', 'Commands:'];
    for (const cmd of this.commands.values()) {
      lines.push(`  ${cmd.name.padEnd(15)} ${cmd.description}`);
    }
    lines.push('', 'Options:');
    lines.push('  -h, --help     Show help');
    lines.push('  -v, --version  Show version');
    return lines.join('\n');
  }
  
  async run(argv: string[]): Promise<void> {
    const parsed = parseArgs(argv);
    
    if (parsed.flags.has('help') || parsed.flags.has('h')) {
      console.log(this.help());
      return;
    }
    
    const command = this.commands.get(parsed.command);
    if (command) {
      await command.handler(parsed.args, parsed.flags);
    } else if (this.defaultHandler) {
      await this.defaultHandler(parsed.args, parsed.flags);
    } else {
      console.error(`Unknown command: ${parsed.command}`);
      console.log(this.help());
      process.exit(1);
    }
  }
}

// ============================================================================
// 3. 进度条
// ============================================================================

export class ProgressBar {
  private current = 0;
  
  constructor(
    private total: number,
    private width = 40,
    private label = 'Progress'
  ) {}
  
  update(current: number): void {
    this.current = current;
    const percent = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r${this.label}: [${bar}] ${percent}%`);
    
    if (current >= this.total) {
      process.stdout.write('\n');
    }
  }
  
  increment(): void {
    this.update(this.current + 1);
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

/*
const cli = new CLI();

cli
  .command('init', 'Initialize project', async (args, flags) => {
    console.log('Initializing project...');
    if (flags.get('template')) {
      console.log(`Using template: ${flags.get('template')}`);
    }
  })
  .command('build', 'Build project', async (args, flags) => {
    const watch = flags.has('watch') || flags.has('w');
    console.log(`Building... ${watch ? '(watch mode)' : ''}`);
  })
  .default((args, flags) => {
    console.log('Welcome to my CLI!');
  });

// 运行
cli.run(process.argv.slice(2));
*/

// ============================================================================
// 导出
// ============================================================================

;

export type { CommandHandler, Command };;

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== CLI 命令解析器演示 ===\n');

  // 1. 参数解析演示
  console.log('--- 参数解析 ---');
  
  const examples = [
    ['init', 'my-project', '--template=react', '--typescript'],
    ['build', '--watch', '-o', './dist'],
    ['deploy', 'production', '--force'],
    ['--help'],
    ['-v']
  ];
  
  for (const argv of examples) {
    const parsed = parseArgs(argv);
    console.log(`\n输入: ${argv.join(' ')}`);
    console.log(`  命令: ${parsed.command || '(none)'}`);
    console.log(`  参数: [${parsed.args.join(', ')}]`);
    console.log(`  标志: ${Array.from(parsed.flags.entries()).map(([k, v]) => `${k}=${v}`).join(', ') || '(none)'}`);
  }

  // 2. CLI 构建器演示
  console.log('\n--- CLI 构建器 ---');
  
  // 创建一个示例 CLI
  const cli = new CLI();
  cli
    .command('init', 'Initialize a new project', async (args, flags) => {
      console.log(`  [执行] 初始化项目: ${args[0] || 'unnamed'}`);
      if (flags.has('template')) {
        console.log(`  [执行] 使用模板: ${flags.get('template')}`);
      }
    })
    .command('build', 'Build the project', async (args, flags) => {
      const watchMode = flags.has('watch') || flags.has('w');
      console.log(`  [执行] 构建项目${watchMode ? ' (监视模式)' : ''}`);
    })
    .command('test', 'Run tests', async (args, flags) => {
      const pattern = args[0] || '**/*.test.ts';
      console.log(`  [执行] 运行测试: ${pattern}`);
      if (flags.has('coverage')) {
        console.log('  [执行] 生成覆盖率报告');
      }
    })
    .default(() => {
      console.log('  [执行] 显示欢迎信息');
    });
  
  console.log('\n已注册命令:');
  console.log(cli.help());
  
  // 模拟运行命令
  console.log('模拟命令执行:\n');
  
  const commandsToRun = [
    ['init', 'my-app', '--template=vue'],
    ['build', '--watch'],
    ['test', 'unit', '--coverage'],
    ['--help']
  ];
  
  for (const cmd of commandsToRun) {
    console.log(`> ${cmd.join(' ')}`);
    await cli.run(cmd);
    console.log('');
  }

  // 3. 进度条演示
  console.log('--- 进度条 ---');
  console.log('模拟文件下载:\n');
  
  const progressBar = new ProgressBar(100, 30, 'Downloading');
  
  // 模拟进度更新
  for (let i = 0; i <= 100; i += 10) {
    progressBar.update(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n下载完成!\n');

  // 4. 复杂示例
  console.log('--- 复杂使用场景 ---');
  console.log('一个完整的项目 CLI 工具示例:\n');
  
  const projectCLI = new CLI();
  projectCLI
    .command('create', 'Create new project', async (args, flags) => {
      const name = args[0] || 'my-project';
      console.log(`  Creating "${name}"...`);
      console.log(`  ✓ Created directory`);
      console.log(`  ✓ Initialized package.json`);
      console.log(`  ✓ Installed dependencies`);
      if (flags.has('git')) {
        console.log(`  ✓ Initialized git repository`);
      }
      console.log(`  Done! Run "cd ${name}" to start.`);
    })
    .command('dev', 'Start development server', async (args, flags) => {
      const port = flags.get('port') || '3000';
      console.log(`  Starting dev server on port ${port}...`);
      console.log(`  ✓ Server ready at http://localhost:${port}`);
      console.log(`  ✓ Hot reload enabled`);
    })
    .command('lint', 'Run linter', async (args, flags) => {
      const fix = flags.has('fix');
      console.log(`  Running linter${fix ? ' (auto-fix enabled)' : ''}...`);
      console.log(`  ✓ 42 files checked`);
      console.log(`  ✓ 0 errors, 3 warnings`);
      if (fix) {
        console.log(`  ✓ Fixed 3 auto-fixable issues`);
      }
    });
  
  console.log(projectCLI.help());
  
  // 模拟一些命令
  console.log('示例命令:\n');
  console.log('> create my-app --git');
  await projectCLI.run(['create', 'my-app', '--git']);
  console.log('');
  
  console.log('> dev --port=8080');
  await projectCLI.run(['dev', '--port=8080']);
  console.log('');
  
  console.log('> lint --fix');
  await projectCLI.run(['lint', '--fix']);

  console.log('\n=== 演示结束 ===\n');
}
