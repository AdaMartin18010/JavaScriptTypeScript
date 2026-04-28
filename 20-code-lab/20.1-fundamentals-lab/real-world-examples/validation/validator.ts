/**
 * @fileoverview 企业级验证器系统
 * 
 * 本模块提供了一个完整的声明式验证解决方案，包括：
 * - 声明式验证规则定义
 * - 链式 API 设计
 * - 对象验证器
 * - 表单验证器
 * - 预定义常用规则（email, password, username 等）
 * 
 * @example
 * ```typescript
 * const schema = v.object({
 *   email: v.string().email().required(),
 *   age: v.number().min(18).max(120),
 *   password: v.string().minLength(8).matches(/[A-Z]/)
 * });
 * 
 * const result = schema.validate({ email: 'test@example.com', age: 25 });
 * if (!result.valid) {
 *   console.log(result.errors);
 * }
 * ```
 * 
 * @module validator
 * @version 1.0.0
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  value: unknown;
}

/**
 * 验证错误
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value: unknown;
  field?: string;
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  path: string;
  root: unknown;
  parent?: unknown;
  options: ValidationOptions;
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  strict?: boolean;
  locale?: string;
  messages?: Record<string, string>;
}

/**
 * 验证函数类型
 */
export type ValidationFunction<T = unknown> = (
  value: T,
  context: ValidationContext
) => ValidationError | null | Promise<ValidationError | null>;

/**
 * 转换函数类型
 */
export type TransformFunction<TInput = unknown, TOutput = unknown> = (
  value: TInput,
  context: ValidationContext
) => TOutput;

/**
 * 默认验证选项
 */
export const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  abortEarly: false,
  stripUnknown: false,
  allowUnknown: false,
  strict: false,
  locale: 'zh-CN',
  messages: {},
};

/**
 * 默认错误消息
 */
export const DEFAULT_MESSAGES: Record<string, string> = {
  'validation.required': '此字段为必填项',
  'validation.type': '类型错误，期望 {expected} 类型',
  'validation.string': '必须是字符串',
  'validation.number': '必须是数字',
  'validation.boolean': '必须是布尔值',
  'validation.array': '必须是数组',
  'validation.object': '必须是对象',
  'validation.date': '必须是有效日期',
  'validation.enum': '必须是以下值之一: {values}',
  'validation.min': '不能小于 {min}',
  'validation.max': '不能大于 {max}',
  'validation.minLength': '长度不能小于 {min}',
  'validation.maxLength': '长度不能大于 {max}',
  'validation.length': '长度必须为 {length}',
  'validation.range': '必须在 {min} 和 {max} 之间',
  'validation.pattern': '格式不正确',
  'validation.email': '邮箱格式不正确',
  'validation.url': 'URL 格式不正确',
  'validation.uuid': 'UUID 格式不正确',
  'validation.creditCard': '信用卡号格式不正确',
  'validation.phone': '电话号码格式不正确',
  'validation.password.weak': '密码强度不足',
  'validation.password.noUppercase': '密码必须包含大写字母',
  'validation.password.noLowercase': '密码必须包含小写字母',
  'validation.password.noDigit': '密码必须包含数字',
  'validation.password.noSpecial': '密码必须包含特殊字符',
  'validation.username.invalid': '用户名格式不正确',
  'validation.match': '与 {field} 不匹配',
  'validation.unique': '包含重复值',
  'validation.oneOf': '必须是其中一个指定值',
  'validation.ref': '引用路径 {path} 不存在',
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 格式化错误消息
 */
function formatMessage(
  message: string,
  params: Record<string, unknown> = {}
): string {
  return message.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

/**
 * 创建验证错误
 */
function createError(
  code: string,
  message: string,
  value: unknown,
  context: ValidationContext,
  params?: Record<string, unknown>
): ValidationError {
  const formattedMessage = formatMessage(message, params);
  return {
    path: context.path,
    message: formattedMessage,
    code,
    value,
    field: context.path.split('.').pop(),
  };
}

/**
 * 获取对象路径值
 */
function getPathValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

/**
 * 检查是否为有效的日期
 */
function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============================================================================
// 基础验证器类
// ============================================================================

/**
 * 基础验证器类
 */
export class Validator<T = unknown> {
  protected validations: readonly ValidationFunction<T>[] = [];
  protected transforms: TransformFunction<T, T>[] = [];
  protected defaultValue?: T;
  protected isRequired = false;
  protected isNullable = false;
  protected labelValue?: string;
  protected customMessages: Record<string, string> = {};

  /**
   * 设置字段标签
   */
  label(name: string): this {
    this.labelValue = name;
    return this;
  }

  /**
   * 标记为必填
   */
  required(message?: string): this {
    this.isRequired = true;
    this.addValidation((value, context) => {
      if (value === undefined || value === null || value === '') {
        return createError(
          'validation.required',
          message ?? context.options.messages?.['validation.required'] ?? DEFAULT_MESSAGES['validation.required'],
          value,
          context
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 标记为可选
   */
  optional(): OptionalValidator<T> {
    this.isRequired = false;
    return new OptionalValidator(this);
  }

  /**
   * 允许 null 值
   */
  nullable(): this {
    this.isNullable = true;
    return this;
  }

  /**
   * 设置默认值
   */
  default(value: T): this {
    this.defaultValue = value;
    return this;
  }

  /**
   * 自定义验证
   */
  custom(validator: ValidationFunction<T>, message?: string): this {
    this.addValidation(async (value, context) => {
      const result = await validator(value, context);
      if (result && message) {
        result.message = message;
      }
      return result;
    });
    return this;
  }

  /**
   * 添加验证函数
   */
  protected addValidation(validation: ValidationFunction<T>): void {
    this.validations = [...this.validations, validation];
  }

  /**
   * 添加转换函数
   */
  transform(fn: TransformFunction<T, T>): this {
    this.transforms.push(fn);
    return this;
  }

  /**
   * 自定义错误消息
   */
  messages(messages: Record<string, string>): this {
    this.customMessages = { ...this.customMessages, ...messages };
    return this;
  }

  /**
   * 执行验证
   */
  async validate(
    value: unknown,
    context: Partial<ValidationContext> = {},
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const fullContext: ValidationContext = {
      path: context.path ?? 'value',
      root: context.root ?? value,
      parent: context.parent,
      options: mergedOptions,
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 处理默认值
    let currentValue: T = value as T;
    if ((value === undefined || value === null || value === '') && this.defaultValue !== undefined) {
      currentValue = this.defaultValue;
    }

    // 检查 null/undefined
    if (value === null) {
      if (this.isNullable) {
        return { valid: true, errors: [], warnings, value: null };
      }
      if (!this.isRequired) {
        return { valid: true, errors: [], warnings, value: null };
      }
    }

    if (value === undefined) {
      if (!this.isRequired && this.defaultValue === undefined) {
        return { valid: true, errors: [], warnings, value: undefined };
      }
    }

    // 执行转换
    for (const transform of this.transforms) {
      currentValue = transform(currentValue, fullContext);
    }

    // 执行验证
    for (const validation of this.validations) {
      const error = await validation(currentValue, fullContext);
      if (error) {
        errors.push(error);
        if (mergedOptions.abortEarly) {
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      value: currentValue,
    };
  }

  /**
   * 同步验证
   */
  validateSync(
    value: unknown,
    context: Partial<ValidationContext> = {},
    options: ValidationOptions = {}
  ): ValidationResult {
    // 简化版本，假设没有异步验证器
    return this.validate(value, context, options) as unknown as ValidationResult;
  }
}

/**
 * 可选值验证器
 */
export class OptionalValidator<T> extends Validator<T | undefined> {
  constructor(private baseValidator: Validator<T>) {
    super();
  }

  override async validate(
    value: unknown,
    context: Partial<ValidationContext> = {},
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    if (value === undefined) {
      return { valid: true, errors: [], warnings: [], value: undefined };
    }
    return this.baseValidator.validate(value, context, options);
  }
}

// ============================================================================
// 字符串验证器
// ============================================================================

/**
 * 字符串验证器
 */
export class StringValidator extends Validator<string> {
  constructor() {
    super();
    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        return createError(
          'validation.string',
          context.options.messages?.['validation.string'] ?? DEFAULT_MESSAGES['validation.string'],
          value,
          context
        );
      }
      return null;
    });
  }

  /**
   * 最小长度
   */
  minLength(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'string' && value.length < length) {
        return createError(
          'validation.minLength',
          message ?? context.options.messages?.['validation.minLength'] ?? DEFAULT_MESSAGES['validation.minLength'],
          value,
          context,
          { min: length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 最大长度
   */
  maxLength(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'string' && value.length > length) {
        return createError(
          'validation.maxLength',
          message ?? context.options.messages?.['validation.maxLength'] ?? DEFAULT_MESSAGES['validation.maxLength'],
          value,
          context,
          { max: length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 固定长度
   */
  length(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'string' && value.length !== length) {
        return createError(
          'validation.length',
          message ?? context.options.messages?.['validation.length'] ?? DEFAULT_MESSAGES['validation.length'],
          value,
          context,
          { length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 正则匹配
   */
  matches(pattern: RegExp, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'string' && !pattern.test(value)) {
        return createError(
          'validation.pattern',
          message ?? context.options.messages?.['validation.pattern'] ?? DEFAULT_MESSAGES['validation.pattern'],
          value,
          context
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 邮箱验证
   */
  email(message?: string): this {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return this.matches(emailPattern, message ?? DEFAULT_MESSAGES['validation.email']);
  }

  /**
   * URL 验证
   */
  url(message?: string): this {
    return this.custom((value) => {
      if (typeof value !== 'string') return null;
      try {
        new URL(value);
        return null;
      } catch {
        return createError('validation.url', message ?? DEFAULT_MESSAGES['validation.url'], value, { path: '' } as ValidationContext);
      }
    }, message);
  }

  /**
   * UUID 验证
   */
  uuid(message?: string): this {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return this.matches(uuidPattern, message ?? DEFAULT_MESSAGES['validation.uuid']);
  }

  /**
   * 信用卡号验证（Luhn 算法）
   */
  creditCard(message?: string): this {
    return this.custom((value) => {
      if (typeof value !== 'string') return null;
      
      const clean = value.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(clean)) {
        return createError('validation.creditCard', message ?? DEFAULT_MESSAGES['validation.creditCard'], value, { path: '' } as ValidationContext);
      }

      let sum = 0;
      let isEven = false;
      
      for (let i = clean.length - 1; i >= 0; i--) {
        let digit = parseInt(clean[i], 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }

      if (sum % 10 !== 0) {
        return createError('validation.creditCard', message ?? DEFAULT_MESSAGES['validation.creditCard'], value, { path: '' } as ValidationContext);
      }

      return null;
    }, message);
  }

  /**
   * 手机号验证（中国大陆）
   */
  phone(message?: string): this {
    const phonePattern = /^1[3-9]\d{9}$/;
    return this.matches(phonePattern, message ?? DEFAULT_MESSAGES['validation.phone']);
  }

  /**
   * 密码强度验证
   */
  password(options: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireDigit?: boolean;
    requireSpecial?: boolean;
  } = {}): this {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireDigit = true,
      requireSpecial = true,
    } = options;

    this.minLength(minLength);
    this.maxLength(maxLength);

    if (requireUppercase) {
      this.addValidation((value, context) => {
        if (typeof value === 'string' && !/[A-Z]/.test(value)) {
          return createError(
            'validation.password.noUppercase',
            context.options.messages?.['validation.password.noUppercase'] ?? DEFAULT_MESSAGES['validation.password.noUppercase'],
            value,
            context
          );
        }
        return null;
      });
    }

    if (requireLowercase) {
      this.addValidation((value, context) => {
        if (typeof value === 'string' && !/[a-z]/.test(value)) {
          return createError(
            'validation.password.noLowercase',
            context.options.messages?.['validation.password.noLowercase'] ?? DEFAULT_MESSAGES['validation.password.noLowercase'],
            value,
            context
          );
        }
        return null;
      });
    }

    if (requireDigit) {
      this.addValidation((value, context) => {
        if (typeof value === 'string' && !/\d/.test(value)) {
          return createError(
            'validation.password.noDigit',
            context.options.messages?.['validation.password.noDigit'] ?? DEFAULT_MESSAGES['validation.password.noDigit'],
            value,
            context
          );
        }
        return null;
      });
    }

    if (requireSpecial) {
      this.addValidation((value, context) => {
        if (typeof value === 'string' && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          return createError(
            'validation.password.noSpecial',
            context.options.messages?.['validation.password.noSpecial'] ?? DEFAULT_MESSAGES['validation.password.noSpecial'],
            value,
            context
          );
        }
        return null;
      });
    }

    return this;
  }

  /**
   * 用户名验证
   */
  username(options: {
    minLength?: number;
    maxLength?: number;
    allowUnderscore?: boolean;
    allowHyphen?: boolean;
    startWithLetter?: boolean;
  } = {}): this {
    const {
      minLength = 3,
      maxLength = 20,
      allowUnderscore = true,
      allowHyphen = true,
      startWithLetter = true,
    } = options;

    this.minLength(minLength);
    this.maxLength(maxLength);

    const pattern = new RegExp(
      `^${startWithLetter ? '[a-zA-Z]' : ''}[a-zA-Z0-9${allowUnderscore ? '_' : ''}${allowHyphen ? '-' : ''}]*$`
    );

    return this.matches(pattern, DEFAULT_MESSAGES['validation.username.invalid']);
  }

  /**
   * 修剪空白
   */
  trim(): this {
    return this.transform((value) => (typeof value === 'string' ? value.trim() : value));
  }

  /**
   * 转小写
   */
  toLowerCase(): this {
    return this.transform((value) => (typeof value === 'string' ? value.toLowerCase() : value));
  }

  /**
   * 转大写
   */
  toUpperCase(): this {
    return this.transform((value) => (typeof value === 'string' ? value.toUpperCase() : value));
  }
}

// ============================================================================
// 数字验证器
// ============================================================================

/**
 * 数字验证器
 */
export class NumberValidator extends Validator<number> {
  constructor() {
    super();
    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && typeof value !== 'number') {
        return createError(
          'validation.number',
          context.options.messages?.['validation.number'] ?? DEFAULT_MESSAGES['validation.number'],
          value,
          context
        );
      }
      return null;
    });
  }

  /**
   * 最小值
   */
  min(min: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'number' && value < min) {
        return createError(
          'validation.min',
          message ?? context.options.messages?.['validation.min'] ?? DEFAULT_MESSAGES['validation.min'],
          value,
          context,
          { min }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 最大值
   */
  max(max: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'number' && value > max) {
        return createError(
          'validation.max',
          message ?? context.options.messages?.['validation.max'] ?? DEFAULT_MESSAGES['validation.max'],
          value,
          context,
          { max }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 范围
   */
  range(min: number, max: number, message?: string): this {
    this.addValidation((value, context) => {
      if (typeof value === 'number' && (value < min || value > max)) {
        return createError(
          'validation.range',
          message ?? context.options.messages?.['validation.range'] ?? DEFAULT_MESSAGES['validation.range'],
          value,
          context,
          { min, max }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 整数
   */
  integer(message?: string): this {
    return this.custom((value) => {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        return createError('validation.type', message ?? '必须是整数', value, { path: '' } as ValidationContext);
      }
      return null;
    }, message);
  }

  /**
   * 正数
   */
  positive(message?: string): this {
    return this.custom((value) => {
      if (typeof value === 'number' && value <= 0) {
        return createError('validation.type', message ?? '必须是正数', value, { path: '' } as ValidationContext);
      }
      return null;
    }, message);
  }

  /**
   * 负数
   */
  negative(message?: string): this {
    return this.custom((value) => {
      if (typeof value === 'number' && value >= 0) {
        return createError('validation.type', message ?? '必须是负数', value, { path: '' } as ValidationContext);
      }
      return null;
    }, message);
  }
}

// ============================================================================
// 数组验证器
// ============================================================================

/**
 * 数组验证器
 */
export class ArrayValidator<T = unknown> extends Validator<T[]> {
  constructor(private itemValidator?: Validator<T>) {
    super();
    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        return createError(
          'validation.array',
          context.options.messages?.['validation.array'] ?? DEFAULT_MESSAGES['validation.array'],
          value,
          context
        );
      }
      return null;
    });
  }

  /**
   * 最小长度
   */
  minLength(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (Array.isArray(value) && value.length < length) {
        return createError(
          'validation.minLength',
          message ?? context.options.messages?.['validation.minLength'] ?? DEFAULT_MESSAGES['validation.minLength'],
          value,
          context,
          { min: length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 最大长度
   */
  maxLength(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (Array.isArray(value) && value.length > length) {
        return createError(
          'validation.maxLength',
          message ?? context.options.messages?.['validation.maxLength'] ?? DEFAULT_MESSAGES['validation.maxLength'],
          value,
          context,
          { max: length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 固定长度
   */
  length(length: number, message?: string): this {
    this.addValidation((value, context) => {
      if (Array.isArray(value) && value.length !== length) {
        return createError(
          'validation.length',
          message ?? context.options.messages?.['validation.length'] ?? DEFAULT_MESSAGES['validation.length'],
          value,
          context,
          { length }
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 元素唯一性
   */
  unique(message?: string): this {
    this.addValidation((value, context) => {
      if (Array.isArray(value)) {
        const seen = new Set();
        for (const item of value) {
          const key = typeof item === 'object' ? JSON.stringify(item) : item;
          if (seen.has(key)) {
            return createError(
              'validation.unique',
              message ?? context.options.messages?.['validation.unique'] ?? DEFAULT_MESSAGES['validation.unique'],
              value,
              context
            );
          }
          seen.add(key);
        }
      }
      return null;
    });
    return this;
  }

  /**
   * 验证每个元素
   */
  items(validator: Validator<T>): this {
    this.itemValidator = validator;
    this.addValidation(async (value, context) => {
      if (!Array.isArray(value) || !this.itemValidator) return null;

      for (let i = 0; i < value.length; i++) {
        const result = await this.itemValidator.validate(value[i], {
          ...context,
          path: `${context.path}[${i}]`,
          parent: value,
        }, context.options);

        if (!result.valid) {
          return result.errors[0] ?? null;
        }
      }
      return null;
    });
    return this;
  }
}

// ============================================================================
// 对象验证器
// ============================================================================

/**
 * 对象验证器
 */
export class ObjectValidator<T extends Record<string, unknown> = Record<string, unknown>> extends Validator<T> {
  private shapeValidators: Record<string, Validator> = {};

  constructor(shape?: { [K in keyof T]: Validator<T[K]> }) {
    super();
    
    if (shape) {
      this.shapeValidators = shape as Record<string, Validator>;
    }

    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && (typeof value !== 'object' || Array.isArray(value))) {
        return createError(
          'validation.object',
          context.options.messages?.['validation.object'] ?? DEFAULT_MESSAGES['validation.object'],
          value,
          context
        );
      }
      return null;
    });

    // 验证形状
    this.addValidation(async (value, context) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
      }

      const obj = value as Record<string, unknown>;
      const errors: ValidationError[] = [];
      const validatedObj: Record<string, unknown> = {};

      // 验证已知字段
      for (const [key, validator] of Object.entries(this.shapeValidators)) {
        const fieldValue = obj[key];
        const result = await validator.validate(fieldValue, {
          ...context,
          path: context.path ? `${context.path}.${key}` : key,
          parent: value,
        }, context.options);

        if (!result.valid) {
          errors.push(...result.errors);
        } else {
          validatedObj[key] = result.value;
        }
      }

      // 处理未知字段
      if (!context.options.allowUnknown) {
        for (const key of Object.keys(obj)) {
          if (!(key in this.shapeValidators)) {
            if (context.options.stripUnknown) {
              // 移除未知字段
              continue;
            } else {
              errors.push(createError(
                'validation.object',
                `未知字段: ${key}`,
                obj[key],
                { ...context, path: context.path ? `${context.path}.${key}` : key }
              ));
            }
          }
        }
      }

      // 合并未知字段（如果允许）
      if (context.options.allowUnknown || context.options.stripUnknown) {
        for (const key of Object.keys(obj)) {
          if (!(key in validatedObj)) {
            if (!context.options.stripUnknown) {
              validatedObj[key] = obj[key];
            }
          }
        }
      }

      if (errors.length > 0) {
        return errors[0];
      }

      return null;
    });
  }

  /**
   * 扩展形状
   */
  extend<U extends Record<string, unknown>>(
    additionalShape: { [K in keyof U]: Validator<U[K]> }
  ): ObjectValidator<T & U> {
    const extendedShape = { ...this.shapeValidators, ...additionalShape };
    return new ObjectValidator(extendedShape as { [K in keyof (T & U)]: Validator<(T & U)[K]> });
  }

  /**
   * 选择字段
   */
  pick<K extends keyof T>(...keys: K[]): ObjectValidator<T> {
    const pickedShape: Record<string, Validator> = {};
    for (const key of keys) {
      pickedShape[key as string] = this.shapeValidators[key as string];
    }
    return new ObjectValidator(pickedShape as { [K in keyof T]: Validator<T[K]> });
  }

  /**
   * 排除字段
   */
  omit<K extends keyof T>(...keys: K[]): ObjectValidator<T> {
    const omittedShape: Record<string, Validator> = {};
    for (const [key, validator] of Object.entries(this.shapeValidators)) {
      if (!keys.includes(key as K)) {
        omittedShape[key] = validator;
      }
    }
    return new ObjectValidator(omittedShape as { [K in keyof T]: Validator<T[K]> });
  }

  /**
   * 合并验证器
   */
  merge<U extends Record<string, unknown>>(other: ObjectValidator<U>): ObjectValidator<T & U> {
    return new ObjectValidator({
      ...this.shapeValidators,
      ...other.shapeValidators,
    } as { [K in keyof (T & U)]: Validator<(T & U)[K]> });
  }
}

// ============================================================================
// 布尔验证器
// ============================================================================

/**
 * 布尔验证器
 */
export class BooleanValidator extends Validator<boolean> {
  constructor() {
    super();
    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && typeof value !== 'boolean') {
        return createError(
          'validation.boolean',
          context.options.messages?.['validation.boolean'] ?? DEFAULT_MESSAGES['validation.boolean'],
          value,
          context
        );
      }
      return null;
    });
  }
}

// ============================================================================
// 日期验证器
// ============================================================================

/**
 * 日期验证器
 */
export class DateValidator extends Validator<Date> {
  constructor() {
    super();
    this.addValidation((value, context) => {
      if (value !== undefined && value !== null && !isValidDate(value)) {
        return createError(
          'validation.date',
          context.options.messages?.['validation.date'] ?? DEFAULT_MESSAGES['validation.date'],
          value,
          context
        );
      }
      return null;
    });
  }

  /**
   * 最小日期
   */
  min(minDate: Date, message?: string): this {
    this.addValidation((value, context) => {
      if (value instanceof Date && value < minDate) {
        return createError(
          'validation.min',
          message ?? `日期不能早于 ${minDate.toISOString()}`,
          value,
          context
        );
      }
      return null;
    });
    return this;
  }

  /**
   * 最大日期
   */
  max(maxDate: Date, message?: string): this {
    this.addValidation((value, context) => {
      if (value instanceof Date && value > maxDate) {
        return createError(
          'validation.max',
          message ?? `日期不能晚于 ${maxDate.toISOString()}`,
          value,
          context
        );
      }
      return null;
    });
    return this;
  }
}

// ============================================================================
// 联合类型验证器
// ============================================================================

/**
 * 联合类型验证器
 */
export class UnionValidator<T extends unknown[]> extends Validator<T[number]> {
  constructor(private validators: { [K in keyof T]: Validator<T[K]> }) {
    super();
    this.addValidation(async (value, context) => {
      const errors: ValidationError[] = [];

      for (const validator of this.validators) {
        const result = await validator.validate(value, context, context.options);
        if (result.valid) {
          return null;
        }
        errors.push(...result.errors);
      }

      return createError(
        'validation.oneOf',
        context.options.messages?.['validation.oneOf'] ?? DEFAULT_MESSAGES['validation.oneOf'],
        value,
        context
      );
    });
  }
}

/**
 * 枚举验证器
 */
export class EnumValidator<T extends string | number> extends Validator<T> {
  constructor(private values: T[]) {
    super();
    this.addValidation((value, context) => {
      if (!this.values.includes(value)) {
        return createError(
          'validation.enum',
          context.options.messages?.['validation.enum'] ?? DEFAULT_MESSAGES['validation.enum'],
          value,
          context,
          { values: this.values.join(', ') }
        );
      }
      return null;
    });
  }
}

// ============================================================================
// 表单验证器
// ============================================================================

/**
 * 表单字段
 */
export interface FormField {
  name: string;
  validator: Validator;
  label?: string;
}

/**
 * 表单验证器
 */
export class FormValidator {
  private fields: FormField[] = [];

  /**
   * 添加字段
   */
  field(name: string, validator: Validator<any>, label?: string): this {
    this.fields.push({ name, validator, label });
    return this;
  }

  /**
   * 验证表单数据
   */
  async validate(
    data: Record<string, unknown>,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const validatedData: Record<string, unknown> = {};

    for (const field of this.fields) {
      const value = data[field.name];
      const result = await field.validator.validate(value, {
        path: field.name,
        root: data,
      }, options);

      if (!result.valid) {
        // 添加字段标签到错误信息
        const labeledErrors = result.errors.map((err) => ({
          ...err,
          message: field.label ? `${field.label}: ${err.message}` : err.message,
        }));
        errors.push(...labeledErrors);
      }

      validatedData[field.name] = result.value;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      value: validatedData,
    };
  }

  /**
   * 获取字段列表
   */
  getFields(): FormField[] {
    return [...this.fields];
  }
}

// ============================================================================
// 验证器工厂函数
// ============================================================================

/**
 * 验证器工厂
 */
export const v = {
  /**
   * 字符串验证器
   */
  string(): StringValidator {
    return new StringValidator();
  },

  /**
   * 数字验证器
   */
  number(): NumberValidator {
    return new NumberValidator();
  },

  /**
   * 布尔验证器
   */
  boolean(): BooleanValidator {
    return new BooleanValidator();
  },

  /**
   * 日期验证器
   */
  date(): DateValidator {
    return new DateValidator();
  },

  /**
   * 数组验证器
   */
  array<T>(itemValidator?: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator(itemValidator);
  },

  /**
   * 对象验证器
   */
  object<T extends Record<string, unknown>>(shape?: { [K in keyof T]: Validator<T[K]> }): ObjectValidator<T> {
    return new ObjectValidator(shape);
  },

  /**
   * 联合类型验证器
   */
  union<T extends unknown[]>(...validators: { [K in keyof T]: Validator<T[K]> }): UnionValidator<T> {
    return new UnionValidator(validators);
  },

  /**
   * 枚举验证器
   */
  enum<T extends string | number>(...values: T[]): EnumValidator<T> {
    return new EnumValidator(values);
  },

  /**
   * 字面量验证器
   */
  literal<T extends string | number | boolean>(value: T): Validator<T> {
    return new Validator<T>().custom(
      (v) => (v === value ? null : createError('validation.oneOf', `必须是 ${value}`, v, { path: '' } as ValidationContext)),
      `必须是 ${value}`
    );
  },

  /**
   * 创建表单验证器
   */
  form(): FormValidator {
    return new FormValidator();
  },

  /**
   * 引用其他字段
   */
  ref(path: string): Validator {
    return new Validator().custom((value, context) => {
      const refValue = getPathValue(context.root, path);
      if (refValue === undefined) {
        return createError(
          'validation.ref',
          DEFAULT_MESSAGES['validation.ref'],
          value,
          context,
          { path }
        );
      }
      return value === refValue ? null : createError(
        'validation.match',
        DEFAULT_MESSAGES['validation.match'],
        value,
        context,
        { field: path }
      );
    });
  },
};

// ============================================================================
// 预定义验证器
// ============================================================================

/**
 * 邮箱验证器
 */
export const emailValidator = v.string().email().required();

/**
 * 用户名验证器
 */
export const usernameValidator = v.string().username({
  minLength: 3,
  maxLength: 20,
  allowUnderscore: true,
  allowHyphen: true,
}).required();

/**
 * 密码验证器
 */
export const passwordValidator = v.string().password({
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
}).required();

/**
 * 手机号验证器（中国大陆）
 */
export const phoneValidator = v.string().phone().required();

/**
 * URL 验证器
 */
export const urlValidator = v.string().url().required();

/**
 * UUID 验证器
 */
export const uuidValidator = v.string().uuid().required();

// ============================================================================
// Demo 函数
// ============================================================================

/**
 * 演示验证器系统的使用
 */
export function demo(): void {
  console.log('='.repeat(60));
  console.log('✅ Validator Demo');
  console.log('='.repeat(60));

  // ==========================================================================
  // 1. 字符串验证
  // ==========================================================================
  console.log('\n📝 String Validation');
  console.log('-'.repeat(40));

  const nameValidator = v.string()
    .minLength(2, '姓名至少需要2个字符')
    .maxLength(50, '姓名不能超过50个字符')
    .trim()
    .required();

  const testName = async (name: unknown) => {
    const result = await nameValidator.validate(name);
    console.log(`  Input: ${JSON.stringify(name)}`);
    console.log(`  Valid: ${result.valid ? '✅' : '❌'}`);
    if (!result.valid) {
      console.log(`  Errors: ${result.errors.map((e) => e.message).join(', ')}`);
    }
  };

  testName('  John Doe  ');
  testName('A');
  testName('');
  testName(null);

  // ==========================================================================
  // 2. 邮箱验证
  // ==========================================================================
  console.log('\n📧 Email Validation');
  console.log('-'.repeat(40));

  const emails = [
    'user@example.com',
    'invalid-email',
    'user@domain',
    'User@Example.COM',
  ];

  for (const email of emails) {
    const result = emailValidator.validateSync(email);
    console.log(`  ${email}: ${result.valid ? '✅' : '❌'}`);
  }

  // ==========================================================================
  // 3. 密码强度验证
  // ==========================================================================
  console.log('\n🔐 Password Validation');
  console.log('-'.repeat(40));

  const passwords = [
    'weak',
    'Password123',
    'Password123!',
    'MyStr0ng!P@ss',
  ];

  for (const pwd of passwords) {
    const result = passwordValidator.validateSync(pwd);
    console.log(`  "${pwd}": ${result.valid ? '✅ Strong' : '❌ Weak'}`);
    if (!result.valid) {
      console.log(`    - ${result.errors.map((e) => e.message).join('\n    - ')}`);
    }
  }

  // ==========================================================================
  // 4. 用户名验证
  // ==========================================================================
  console.log('\n👤 Username Validation');
  console.log('-'.repeat(40));

  const usernames = [
    'john_doe',
    'john-doe',
    'john.doe',
    '1johndoe',
    'ab',
    'valid_user-123',
  ];

  for (const username of usernames) {
    const result = usernameValidator.validateSync(username);
    console.log(`  "${username}": ${result.valid ? '✅' : '❌'}`);
  }

  // ==========================================================================
  // 5. 数字验证
  // ==========================================================================
  console.log('\n🔢 Number Validation');
  console.log('-'.repeat(40));

  const ageValidator = v.number()
    .min(0, '年龄不能为负数')
    .max(150, '年龄不能超过150岁')
    .integer('年龄必须是整数')
    .required();

  const ages = [25, -5, 150.5, 200, null];

  for (const age of ages) {
    const result = ageValidator.validateSync(age);
    console.log(`  ${JSON.stringify(age)}: ${result.valid ? '✅' : '❌'}`);
    if (!result.valid) {
      console.log(`    - ${result.errors[0].message}`);
    }
  }

  // ==========================================================================
  // 6. 对象验证
  // ==========================================================================
  console.log('\n📦 Object Validation');
  console.log('-'.repeat(40));

  const userSchema = v.object({
    id: v.string().uuid().required(),
    name: v.string().minLength(2).maxLength(50).required(),
    email: v.string().email().required(),
    age: v.number().min(0).max(150).optional(),
    phone: v.string().phone().optional(),
    address: v.object({
      city: v.string().required(),
      zipCode: v.string().length(6).required(),
    }).optional(),
  });

  const validUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    phone: '13800138000',
    address: {
      city: 'Beijing',
      zipCode: '100000',
    },
  };

  const invalidUser = {
    id: 'not-a-uuid',
    name: 'J',
    email: 'invalid-email',
    age: -5,
    address: {
      city: '',
      zipCode: '123',
    },
  };

  console.log('Valid user:');
  const validResult = userSchema.validateSync(validUser);
  console.log(`  Valid: ${validResult.valid ? '✅' : '❌'}`);

  console.log('\nInvalid user:');
  const invalidResult = userSchema.validateSync(invalidUser);
  console.log(`  Valid: ${invalidResult.valid ? '✅' : '❌'}`);
  if (!invalidResult.valid) {
    invalidResult.errors.forEach((err) => {
      console.log(`    - ${err.path}: ${err.message}`);
    });
  }

  // ==========================================================================
  // 7. 数组验证
  // ==========================================================================
  console.log('\n📚 Array Validation');
  console.log('-'.repeat(40));

  const tagsValidator = v.array(v.string().minLength(1).maxLength(20))
    .minLength(1, '至少需要1个标签')
    .maxLength(5, '最多5个标签')
    .unique('标签不能重复')
    .required();

  const tagTests = [
    ['typescript', 'javascript'],
    [],
    ['tag1', 'tag1'],
    ['a', 'b', 'c', 'd', 'e', 'f'],
  ];

  for (const tags of tagTests) {
    const result = tagsValidator.validateSync(tags);
    console.log(`  ${JSON.stringify(tags)}: ${result.valid ? '✅' : '❌'}`);
    if (!result.valid) {
      console.log(`    - ${result.errors[0].message}`);
    }
  }

  // ==========================================================================
  // 8. 表单验证
  // ==========================================================================
  console.log('\n📝 Form Validation');
  console.log('-'.repeat(40));

  const registrationForm = v.form()
    .field('username', v.string().username().required() as Validator, '用户名')
    .field('email', v.string().email().required() as Validator, '邮箱')
    .field('password', v.string().password().required() as Validator, '密码')
    .field('confirmPassword', v.ref('password'), '确认密码')
    .field('age', v.number().min(18).optional() as Validator, '年龄');

  const formData1 = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'MyStr0ng!P@ss',
    confirmPassword: 'MyStr0ng!P@ss',
    age: 25,
  };

  const formData2 = {
    username: 'ab',
    email: 'invalid',
    password: 'weak',
    confirmPassword: 'different',
    age: 16,
  };

  console.log('Valid form:');
  registrationForm.validate(formData1).then((result) => {
    console.log(`  Valid: ${result.valid ? '✅' : '❌'}`);
  });

  console.log('\nInvalid form:');
  registrationForm.validate(formData2).then((result) => {
    console.log(`  Valid: ${result.valid ? '✅' : '❌'}`);
    result.errors.forEach((err) => {
      console.log(`    - ${err.path}: ${err.message}`);
    });
  });

  // ==========================================================================
  // 9. 联合类型验证
  // ==========================================================================
  console.log('\n🔗 Union Type Validation');
  console.log('-'.repeat(40));

  const statusValidator = v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected')
  );

  const statuses = ['pending', 'approved', 'unknown'];

  for (const status of statuses) {
    const result = statusValidator.validateSync(status);
    console.log(`  "${status}": ${result.valid ? '✅' : '❌'}`);
  }

  // ==========================================================================
  // 10. 对象扩展与选择
  // ==========================================================================
  console.log('\n🔧 Object Extension & Picking');
  console.log('-'.repeat(40));

  const baseUserSchema = v.object({
    id: v.string().uuid().required(),
    name: v.string().required(),
    email: v.string().email().required(),
  });

  const extendedUserSchema = baseUserSchema.extend({
    role: v.enum('user', 'admin', 'moderator'),
    createdAt: v.date().required(),
  });

  const loginSchema = baseUserSchema.pick('email');

  console.log('Base schema fields: id, name, email');
  console.log('Extended schema adds: role, createdAt');
  console.log('Picked schema (login): email only');

  const loginData = { email: 'test@example.com' };
  const loginResult = loginSchema.validateSync(loginData);
  console.log(`\n  Login validation: ${loginResult.valid ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Demo completed!');
  console.log('='.repeat(60));
}

// demo() 可通过显式调用来执行
