/**
 * @file CLI构建器
 * @category CLI → Builder
 * @difficulty medium
 * @tags cli, command-parser, interactive, progress
 */

export interface Command {
  name: string;
  description: string;
  arguments?: { name: string; required: boolean; description: string }[];
  options?: { name: string; alias?: string; type: 'string' | 'boolean' | 'number'; default?: unknown }[];
  action: (args: Record<string, unknown>, options: Record<string, unknown>) => void | Promise<void>;
  subcommands?: Command[];
}

export class CLIBuilder {
  private commands = new Map<string, Command>();
  private globalOptions: Command['options'] = [];
  private name: string;
  private version: string;
  
  constructor(name: string, version = '1.0.0') {
    this.name = name;
    this.version = version;
  }
  
  command(cmd: Command): this {
    this.commands.set(cmd.name, cmd);
    return this;
  }
  
  globalOption(option: NonNullable<Command['options']>[number]): this {
    this.globalOptions!.push(option);
    return this;
  }
  
  parse(argv: string[] = process.argv.slice(2)): void {
    if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
      this.showHelp();
      return;
    }
    
    if (argv[0] === '--version' || argv[0] === '-v') {
      console.log(`${this.name} v${this.version}`);
      return;
    }
    
    const [cmdName, ...rest] = argv;
    const command = this.commands.get(cmdName);
    
    if (!command) {
      console.error(`Unknown command: ${cmdName}`);
      this.showHelp();
      process.exit(1);
    }
    
    this.executeCommand(command, rest);
  }
  
  private executeCommand(command: Command, args: string[]): void {
    const parsed = this.parseArgs(args, command);
    command.action(parsed.args, parsed.options);
  }
  
  private parseArgs(argv: string[], command: Command): { args: Record<string, unknown>; options: Record<string, unknown> } {
    const args: Record<string, unknown> = {};
    const options: Record<string, unknown> = {};
    
    // 解析选项
    let i = 0;
    const allOptions = [...(this.globalOptions || []), ...(command.options || [])];
    
    while (i < argv.length) {
      const arg = argv[i];
      
      if (arg.startsWith('--')) {
        const [name, value] = arg.slice(2).split('=');
        const option = allOptions.find(o => o.name === name);
        
        if (option) {
          if (option.type === 'boolean') {
            options[name] = true;
          } else if (value !== undefined) {
            options[name] = option.type === 'number' ? Number(value) : value;
          } else if (i + 1 < argv.length) {
            options[name] = option.type === 'number' ? Number(argv[++i]) : argv[++i];
          }
        }
      } else if (arg.startsWith('-')) {
        const alias = arg.slice(1);
        const option = allOptions.find(o => o.alias === alias);
        
        if (option) {
          if (option.type === 'boolean') {
            options[option.name] = true;
          } else if (i + 1 < argv.length) {
            options[option.name] = option.type === 'number' ? Number(argv[++i]) : argv[++i];
          }
        }
      } else {
        // 位置参数
        const argDef = command.arguments?.[Object.keys(args).length];
        if (argDef) {
          args[argDef.name] = arg;
        }
      }
      
      i++;
    }
    
    // 应用默认值
    for (const opt of allOptions) {
      if (options[opt.name] === undefined && opt.default !== undefined) {
        options[opt.name] = opt.default;
      }
    }
    
    return { args, options };
  }
  
  displayHelp(): void {
    this.showHelp();
  }

  private showHelp(): void {
    console.log(`\n${this.name} v${this.version}\n`);
    console.log('Usage: <command> [options] [arguments]\n');
    console.log('Commands:');
    
    for (const cmd of this.commands.values()) {
      console.log(`  ${cmd.name.padEnd(15)} ${cmd.description}`);
    }
    
    console.log('\nGlobal Options:');
    console.log('  -h, --help     Show help');
    console.log('  -v, --version  Show version');
    
    if (this.globalOptions!.length > 0) {
      for (const opt of this.globalOptions!) {
        const alias = opt.alias ? `-${opt.alias}, ` : '    ';
        console.log(`  ${alias}--${opt.name.padEnd(10)} ${opt.type}`);
      }
    }
    console.log();
  }
}

// 进度条
export class ProgressBar {
  private total: number;
  private current = 0;
  private width: number;
  
  constructor(total: number, width = 40) {
    this.total = total;
    this.width = width;
  }
  
  update(current: number): void {
    this.current = current;
    this.render();
  }
  
  increment(): void {
    this.current++;
    this.render();
  }
  
  private render(): void {
    const percent = (this.current / this.total) * 100;
    const filled = Math.round((this.current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r[${bar}] ${percent.toFixed(1)}% (${this.current}/${this.total})`);
    
    if (this.current >= this.total) {
      process.stdout.write('\n');
    }
  }
}

// 旋转器
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private interval: ReturnType<typeof setInterval> | null = null;
  private message: string;
  
  constructor(message = 'Loading') {
    this.message = message;
  }
  
  start(): void {
    let i = 0;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.frames[i]} ${this.message}...`);
      i = (i + 1) % this.frames.length;
    }, 80);
  }
  
  stop(message?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      process.stdout.write(`\r✓ ${message || this.message}\n`);
    }
  }
}

// 交互式提示
export class InteractivePrompt {
  async ask(question: string, defaultValue?: string): Promise<string> {
    // 简化实现，实际使用readline
    return new Promise((resolve) => {
      console.log(`${question}${defaultValue ? ` (${defaultValue})` : ''}`);
      // 模拟输入
      setTimeout(() => { resolve(defaultValue || ''); }, 100);
    });
  }
  
  async confirm(question: string, defaultValue = false): Promise<boolean> {
    console.log(`${question} [${defaultValue ? 'Y/n' : 'y/N'}]`);
    // 模拟输入
    return defaultValue;
  }
  
  async select(question: string, choices: string[]): Promise<string> {
    console.log(question);
    choices.forEach((c, i) => { console.log(`  ${i + 1}. ${c}`); });
    // 模拟选择第一个
    return choices[0];
  }
}

export function demo(): void {
  console.log('=== CLI框架 ===\n');
  
  // 创建CLI
  const cli = new CLIBuilder('myapp', '2.0.0');
  
  cli
    .globalOption({ name: 'verbose', alias: 'v', type: 'boolean', default: false })
    .command({
      name: 'init',
      description: 'Initialize a new project',
      arguments: [{ name: 'name', required: true, description: 'Project name' }],
      options: [
        { name: 'template', alias: 't', type: 'string', default: 'default' }
      ],
      action: (args, opts) => {
        console.log(`Initializing project: ${args.name}`);
        console.log(`Template: ${opts.template}`);
        if (opts.verbose) {
          console.log('Verbose mode enabled');
        }
      }
    })
    .command({
      name: 'build',
      description: 'Build the project',
      options: [
        { name: 'watch', alias: 'w', type: 'boolean', default: false },
        { name: 'output', alias: 'o', type: 'string', default: 'dist' }
      ],
      action: (args, opts) => {
        console.log('Building...');
        console.log(`Output: ${opts.output}`);
        console.log(`Watch mode: ${opts.watch}`);
      }
    });
  
  // 显示帮助
  console.log('--- CLI帮助 ---');
  cli.displayHelp(); // 访问公共方法用于演示
  
  // 模拟解析命令
  console.log('\n--- 模拟命令解析 ---');
  console.log('> myapp init my-project --template=react');
  cli.executeCommand(cli.commands.get('init')!, ['my-project', '--template=react']);
  
  // 进度条演示
  console.log('\n--- 进度条 ---');
  const progress = new ProgressBar(10);
  let i = 0;
  const interval = setInterval(() => {
    progress.increment();
    i++;
    if (i >= 10) clearInterval(interval);
  }, 200);
  
  // 交互式提示演示
  setTimeout(() => {
    console.log('\n--- 交互式提示 ---');
    const prompt = new InteractivePrompt();
    prompt.ask('Project name?', 'my-app').then(name => {
      console.log(`Selected: ${name}`);
    });
  }, 2500);
}
