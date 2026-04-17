/**
 * @file 配置文件加载器
 * @category CLI → Config
 * @difficulty medium
 * @tags cli, config, yaml, json, file-io
 *
 * @description
 * 支持 JSON 和 YAML 格式的配置文件加载、解析与保存。
 * 支持按路径加载和自动搜索配置文件。
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** 配置加载器选项 */
export interface ConfigLoaderOptions {
  /** 搜索路径列表 */
  searchPaths?: string[];
  /** 支持的文件扩展名 */
  supportedExtensions?: string[];
  /** 文件编码 */
  encoding?: BufferEncoding;
}

/** 配置文件加载器 */
export class ConfigLoader {
  private readonly searchPaths: string[];
  private readonly supportedExtensions: string[];
  private readonly encoding: BufferEncoding;

  /**
   * @param options - 加载器配置选项
   */
  constructor(options: ConfigLoaderOptions = {}) {
    this.searchPaths = options.searchPaths ?? ['.', './config', './.config'];
    this.supportedExtensions = options.supportedExtensions ?? ['.json', '.yaml', '.yml'];
    this.encoding = options.encoding ?? 'utf-8';
  }

  /**
   * 从指定路径加载配置文件
   * @param filePath - 文件路径
   * @returns 解析后的配置对象
   * @throws 当文件不存在或格式不支持时抛出错误
   */
  load<T = unknown>(filePath: string): T {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new ConfigLoadError(`Config file not found: ${resolved}`);
    }

    const ext = path.extname(resolved).toLowerCase();
    const content = fs.readFileSync(resolved, this.encoding);

    return this.parse(content, ext) as T;
  }

  /**
   * 搜索并加载配置文件
   * @param baseName - 配置文件基础名（不含扩展名）
   * @returns 包含路径和配置的对象，未找到时返回 null
   */
  search<T = unknown>(baseName: string): { path: string; config: T } | null {
    for (const dir of this.searchPaths) {
      for (const ext of this.supportedExtensions) {
        const fullPath = path.resolve(dir, `${baseName}${ext}`);
        if (fs.existsSync(fullPath)) {
          return { path: fullPath, config: this.load<T>(fullPath) };
        }
      }
    }
    return null;
  }

  /**
   * 解析配置内容
   * @param content - 配置文本内容
   * @param extension - 文件扩展名
   * @returns 解析后的对象
   * @throws 当格式不支持或解析失败时抛出错误
   */
  parse(content: string, extension: string): unknown {
    switch (extension.toLowerCase()) {
      case '.json':
        try {
          return JSON.parse(content);
        } catch {
          throw new ConfigLoadError('Invalid JSON format');
        }

      case '.yaml':
      case '.yml': {
        return this.parseYaml(content);
      }

      default:
        throw new ConfigLoadError(`Unsupported config format: ${extension}`);
    }
  }

  /**
   * 保存配置到文件
   * @param filePath - 目标文件路径
   * @param config - 配置对象
   * @throws 当格式不支持时抛出错误
   */
  save(filePath: string, config: unknown): void {
    const ext = path.extname(filePath).toLowerCase();
    let content: string;

    switch (ext) {
      case '.json':
        content = JSON.stringify(config, null, 2);
        break;
      case '.yaml':
      case '.yml':
        content = this.toYaml(config);
        break;
      default:
        throw new ConfigLoadError(`Cannot save to unsupported format: ${ext}`);
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, this.encoding);
  }

  private parseYaml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    const stack: Array<{ obj: Record<string, unknown>; indent: number }> = [{ obj: result, indent: -1 }];

    for (const rawLine of lines) {
      const line = rawLine.split('#')[0];
      if (!line.trim()) continue;

      const indent = line.length - line.trimStart().length;

      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const value = trimmed.slice(2).trim();
        const current = stack[stack.length - 1].obj;
        const lastKey = Object.keys(current).pop();
        if (lastKey) {
          const arr = (current[lastKey] as unknown[]) ?? [];
          arr.push(this.coerceYamlValue(value));
          current[lastKey] = arr;
        }
      } else if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();

        const current = stack[stack.length - 1].obj;
        if (value) {
          current[key] = this.coerceYamlValue(value);
        } else {
          const newObj: Record<string, unknown> = {};
          current[key] = newObj;
          stack.push({ obj: newObj, indent });
        }
      }
    }

    return result;
  }

  private coerceYamlValue(value: string): unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null' || value === '~') return null;
    if (/^-?\d+$/.test(value)) return Number(value);
    if (/^-?\d+\.\d+$/.test(value)) return Number(value);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }
    return value;
  }

  private toYaml(obj: unknown, indent = 0): string {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return String(obj);

    const spaces = ' '.repeat(indent);
    const lines: string[] = [];

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          lines.push(`${spaces}- ` + this.toYaml(item, indent + 2).trimStart());
        } else {
          lines.push(`${spaces}- ${String(item)}`);
        }
      }
    } else {
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (typeof value === 'object' && value !== null) {
          lines.push(`${spaces}${key}:`);
          lines.push(this.toYaml(value, indent + 2));
        } else {
          lines.push(`${spaces}${key}: ${String(value)}`);
        }
      }
    }

    return lines.join('\n');
  }
}

/** 配置加载错误 */
export class ConfigLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigLoadError';
  }
}
