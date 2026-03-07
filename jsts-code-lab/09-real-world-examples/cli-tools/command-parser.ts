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

export {
  parseArgs,
  CLI,
  ProgressBar
};

export type { ParsedArgs, CommandHandler, Command };
