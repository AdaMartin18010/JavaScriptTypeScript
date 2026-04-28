/**
 * @file 命令解析器
 * @category CLI → Parser
 * @difficulty medium
 * @tags cli, command-parser, argv, positional-args, flags
 *
 * @description
 * 类似 Commander 的命令解析器，支持子命令、别名、位置参数、选项解析（长选项、短选项、等号赋值）。
 */

/** 解析后的命令结果 */
export interface ParsedCommand {
  /** 主命令名称 */
  command: string;
  /** 位置参数列表 */
  args: string[];
  /** 解析后的选项 */
  flags: Record<string, string | boolean | number>;
  /** 位置参数（与 args 一致） */
  positional: string[];
}

/** 命令定义 */
export interface CommandDefinition {
  /** 命令名称 */
  name: string;
  /** 命令别名 */
  aliases?: string[];
  /** 命令描述 */
  description: string;
  /** 位置参数定义 */
  arguments?: Array<{ name: string; required?: boolean; description?: string }>;
  /** 选项定义 */
  flags?: Array<{
    name: string;
    alias?: string;
    type: 'string' | 'boolean' | 'number';
    default?: string | boolean | number;
    description?: string;
  }>;
  /** 子命令列表 */
  subcommands?: CommandDefinition[];
}

/** 命令解析器 */
export class CommandParser {
  private readonly commands = new Map<string, CommandDefinition>();
  private readonly aliases = new Map<string, string>();

  /**
   * 注册命令
   * @param command - 命令定义
   * @returns 当前实例（链式调用）
   */
  register(command: CommandDefinition): this {
    this.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }
    if (command.subcommands) {
      for (const sub of command.subcommands) {
        this.commands.set(`${command.name}:${sub.name}`, sub);
        if (sub.aliases) {
          for (const alias of sub.aliases) {
            this.aliases.set(`${command.name}:${alias}`, `${command.name}:${sub.name}`);
          }
        }
      }
    }
    return this;
  }

  /**
   * 解析命令行参数
   * @param argv - 命令行参数数组
   * @returns 解析结果
   * @throws 当未提供命令或命令未知时抛出错误
   */
  parse(argv: string[]): ParsedCommand {
    if (argv.length === 0) {
      throw new Error('No command provided');
    }

    const [cmdName, ...rest] = argv;
    const resolvedName = this.aliases.get(cmdName) ?? cmdName;
    const command = this.commands.get(resolvedName);

    if (!command) {
      throw new Error(`Unknown command: ${cmdName}`);
    }

    const flags: Record<string, string | boolean | number> = {};
    const positional: string[] = [];
    let i = 0;

    while (i < rest.length) {
      const arg = rest[i];

      if (arg.startsWith('--')) {
        this.parseLongFlag(arg, command, flags, rest, i);
        i = this.advanceIndex(arg, rest, i, command, flags);
      } else if (arg.startsWith('-') && arg.length > 1) {
        i = this.parseShortFlag(arg, rest, i, command, flags);
      } else {
        positional.push(arg);
      }

      i++;
    }

    // Apply defaults
    for (const flag of command.flags ?? []) {
      if (!(flag.name in flags) && flag.default !== undefined) {
        flags[flag.name] = flag.default;
      }
    }

    return {
      command: resolvedName,
      args: positional,
      flags,
      positional
    };
  }

  /**
   * 获取已注册的命令
   * @param name - 命令名称或别名
   * @returns 命令定义或 undefined
   */
  getCommand(name: string): CommandDefinition | undefined {
    return this.commands.get(name) ?? this.commands.get(this.aliases.get(name) ?? '');
  }

  /**
   * 获取所有已注册的命令
   * @returns 命令定义列表
   */
  getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  private parseLongFlag(
    arg: string,
    command: CommandDefinition,
    flags: Record<string, string | boolean | number>,
    rest: string[],
    i: number
  ): void {
    const eqIndex = arg.indexOf('=');
    const flagName = eqIndex >= 0 ? arg.slice(2, eqIndex) : arg.slice(2);
    const flagDef = command.flags?.find(f => f.name === flagName);

    if (eqIndex >= 0) {
      const rawValue = arg.slice(eqIndex + 1);
      flags[flagName] = this.coerceValue(rawValue, flagDef?.type ?? 'string');
    } else if (flagDef?.type === 'boolean') {
      flags[flagName] = true;
    }
  }

  private advanceIndex(
    arg: string,
    rest: string[],
    i: number,
    command: CommandDefinition,
    flags: Record<string, string | boolean | number>
  ): number {
    const eqIndex = arg.indexOf('=');
    const flagName = eqIndex >= 0 ? arg.slice(2, eqIndex) : arg.slice(2);
    const flagDef = command.flags?.find(f => f.name === flagName);

    if (eqIndex < 0 && flagDef?.type !== 'boolean' && i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
      flags[flagName] = this.coerceValue(rest[i + 1], flagDef?.type ?? 'string');
      return i + 1;
    }
    return i;
  }

  private parseShortFlag(
    arg: string,
    rest: string[],
    i: number,
    command: CommandDefinition,
    flags: Record<string, string | boolean | number>
  ): number {
    const alias = arg.slice(1);
    const flagDef = command.flags?.find(f => f.alias === alias);

    if (flagDef?.type === 'boolean') {
      flags[flagDef.name] = true;
    } else if (flagDef && i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
      flags[flagDef.name] = this.coerceValue(rest[i + 1], flagDef.type ?? 'string');
      return i + 1;
    } else if (flagDef) {
      flags[flagDef.name] = true;
    } else {
      flags[alias] = true;
    }

    return i;
  }

  private coerceValue(value: string, type: 'string' | 'boolean' | 'number'): string | boolean | number {
    if (type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) throw new Error(`Invalid number value: ${value}`);
      return num;
    }
    if (type === 'boolean') return value === 'true' || value === '1';
    return value;
  }
}
