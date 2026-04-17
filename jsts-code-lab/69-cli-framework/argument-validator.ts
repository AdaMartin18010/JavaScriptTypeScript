/**
 * @file 参数验证器
 * @category CLI → Validation
 * @difficulty medium
 * @tags cli, validation, schema, type-checking
 *
 * @description
 * 为 CLI 参数提供声明式验证，支持必填、字符串、数字、布尔、枚举和自定义验证规则。
 */

/** 验证规则联合类型 */
export type ValidatorRule =
  | { type: 'required'; message?: string }
  | { type: 'string'; minLength?: number; maxLength?: number; pattern?: RegExp; message?: string }
  | { type: 'number'; min?: number; max?: number; integer?: boolean; message?: string }
  | { type: 'boolean'; message?: string }
  | { type: 'enum'; values: unknown[]; message?: string }
  | { type: 'custom'; validator: (value: unknown) => boolean | string; message?: string };

/** 验证模式 */
export interface ValidationSchema {
  [key: string]: ValidatorRule[];
}

/** 参数验证器 */
export class ArgumentValidator {
  private readonly schemas = new Map<string, ValidationSchema>();

  /**
   * 注册命令的验证模式
   * @param command - 命令名称
   * @param schema - 验证模式
   * @returns 当前实例（链式调用）
   */
  registerSchema(command: string, schema: ValidationSchema): this {
    this.schemas.set(command, schema);
    return this;
  }

  /**
   * 验证参数
   * @param command - 命令名称
   * @param args - 要验证的参数对象
   * @returns 错误信息列表，为空表示验证通过
   */
  validate(command: string, args: Record<string, unknown>): string[] {
    const schema = this.schemas.get(command);
    if (!schema) return [];

    const errors: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = args[key];

      for (const rule of rules) {
        const error = this.validateRule(key, value, rule);
        if (error) {
          errors.push(error);
          break;
        }
      }
    }

    return errors;
  }

  /**
   * 验证单个值
   * @param value - 要验证的值
   * @param rules - 验证规则列表
   * @returns 错误信息，undefined 表示验证通过
   */
  validateValue(value: unknown, rules: ValidatorRule[]): string | undefined {
    for (const rule of rules) {
      const error = this.validateRule('value', value, rule);
      if (error) return error;
    }
    return undefined;
  }

  /**
   * 判断参数是否通过验证
   * @param command - 命令名称
   * @param args - 要验证的参数对象
   * @returns 是否通过验证
   */
  isValid(command: string, args: Record<string, unknown>): boolean {
    return this.validate(command, args).length === 0;
  }

  private validateRule(key: string, value: unknown, rule: ValidatorRule): string | undefined {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          return rule.message ?? `${key} is required`;
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          return rule.message ?? `${key} must be a string`;
        }
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          return rule.message ?? `${key} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          return rule.message ?? `${key} must be at most ${rule.maxLength} characters`;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          return rule.message ?? `${key} format is invalid`;
        }
        break;

      case 'number':
        if (typeof value !== 'number' || Number.isNaN(value)) {
          return rule.message ?? `${key} must be a number`;
        }
        if (rule.min !== undefined && value < rule.min) {
          return rule.message ?? `${key} must be at least ${rule.min}`;
        }
        if (rule.max !== undefined && value > rule.max) {
          return rule.message ?? `${key} must be at most ${rule.max}`;
        }
        if (rule.integer && !Number.isInteger(value)) {
          return rule.message ?? `${key} must be an integer`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return rule.message ?? `${key} must be a boolean`;
        }
        break;

      case 'enum':
        if (!rule.values.includes(value)) {
          return rule.message ?? `${key} must be one of: ${rule.values.join(', ')}`;
        }
        break;

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value);
          if (result !== true) {
            return typeof result === 'string' ? result : (rule.message ?? `${key} is invalid`);
          }
        }
        break;
    }

    return undefined;
  }
}
