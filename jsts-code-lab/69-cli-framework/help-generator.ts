/**
 * @file 帮助信息生成器
 * @category CLI → Help
 * @difficulty medium
 * @tags cli, help, documentation, formatter
 *
 * @description
 * 根据命令定义自动生成格式化的帮助文本，支持命令列表、参数说明、选项说明和示例展示。
 */

/** 帮助命令定义 */
export interface HelpCommand {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description: string;
  /** 命令别名 */
  aliases?: string[];
  /** 参数定义 */
  arguments?: Array<{ name: string; required?: boolean; description?: string }>;
  /** 选项定义 */
  flags?: Array<{
    name: string;
    alias?: string;
    type: string;
    default?: unknown;
    description?: string;
    required?: boolean;
  }>;
  /** 使用示例 */
  examples?: string[];
}

/** 帮助生成选项 */
export interface HelpOptions {
  /** 程序名称 */
  programName: string;
  /** 版本号 */
  version: string;
  /** 程序描述 */
  description?: string;
  /** 全局选项 */
  globalFlags?: HelpCommand['flags'];
}

/** 帮助信息生成器 */
export class HelpGenerator {
  constructor(private readonly options: HelpOptions) {}

  /**
   * 生成完整帮助信息
   * @param commands - 命令列表
   * @returns 格式化后的帮助文本
   */
  generate(commands: HelpCommand[]): string {
    const lines: string[] = [];

    lines.push(this.formatHeader());
    lines.push(this.formatUsage());
    lines.push('');

    if (commands.length > 0) {
      lines.push(this.formatCommands(commands));
    }

    if (this.options.globalFlags && this.options.globalFlags.length > 0) {
      lines.push('');
      lines.push(this.formatFlags(this.options.globalFlags, 'Global Options'));
    }

    return lines.join('\n');
  }

  /**
   * 生成单个命令的帮助信息
   * @param command - 命令定义
   * @returns 格式化后的帮助文本
   */
  generateForCommand(command: HelpCommand): string {
    const lines: string[] = [];

    lines.push(this.formatHeader());
    lines.push(
      `Usage: ${this.options.programName} ${command.name}${command.arguments && command.arguments.length > 0 ? ' [arguments]' : ''} [options]`
    );
    lines.push('');

    if (command.description) {
      lines.push(`Description: ${command.description}`);
      lines.push('');
    }

    if (command.aliases && command.aliases.length > 0) {
      lines.push(`Aliases: ${command.aliases.join(', ')}`);
      lines.push('');
    }

    if (command.arguments && command.arguments.length > 0) {
      lines.push(this.formatArguments(command.arguments));
      lines.push('');
    }

    if (command.flags && command.flags.length > 0) {
      lines.push(this.formatFlags(command.flags, 'Options'));
      lines.push('');
    }

    if (command.examples && command.examples.length > 0) {
      lines.push(this.formatExamples(command.examples));
    }

    return lines.join('\n');
  }

  private formatHeader(): string {
    return `${this.options.programName} v${this.options.version}${this.options.description ? `\n${this.options.description}` : ''}`;
  }

  private formatUsage(): string {
    return `Usage: ${this.options.programName} <command> [options] [arguments]`;
  }

  private formatCommands(commands: HelpCommand[]): string {
    const lines = ['Commands:'];
    for (const cmd of commands) {
      const aliasStr = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
      lines.push(`  ${(cmd.name + aliasStr).padEnd(24)} ${cmd.description}`);
    }
    return lines.join('\n');
  }

  private formatArguments(args: NonNullable<HelpCommand['arguments']>): string {
    const lines = ['Arguments:'];
    for (const arg of args) {
      const req = arg.required ? '' : '?';
      lines.push(`  ${(arg.name + req).padEnd(24)} ${arg.description ?? ''}`);
    }
    return lines.join('\n');
  }

  private formatFlags(flags: NonNullable<HelpCommand['flags']>, title: string): string {
    const lines = [`${title}:`];
    for (const flag of flags) {
      const alias = flag.alias ? `-${flag.alias}, ` : '    ';
      const defaultStr = flag.default !== undefined ? ` [default: ${String(flag.default)}]` : '';
      const typeStr = flag.type !== 'boolean' ? ` <${flag.type}>` : '';
      lines.push(`  ${alias}--${flag.name}${typeStr.padEnd(16)} ${flag.description ?? ''}${defaultStr}`);
    }
    return lines.join('\n');
  }

  private formatExamples(examples: string[]): string {
    const lines = ['Examples:'];
    for (const example of examples) {
      lines.push(`  $ ${this.options.programName} ${example}`);
    }
    return lines.join('\n');
  }
}
