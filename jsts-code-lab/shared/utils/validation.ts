/**
 * @file 验证工具
 * @category Shared → Utils
 * @difficulty easy
 * @tags validation, schema, type-guard
 */

// ============================================================================
// 1. 基础验证器
// ============================================================================

export const Validators = {
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  min: (value: number, min: number): boolean => {
    return value >= min;
  },

  max: (value: number, max: number): boolean => {
    return value <= max;
  },

  pattern: (value: string, regex: RegExp): boolean => {
    return regex.test(value);
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  uuid: (value: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
};

// ============================================================================
// 2. Schema 验证
// ============================================================================

type ValidationRule = {
  validator: (value: unknown) => boolean;
  message: string;
};

type Schema<T> = {
  [K in keyof T]?: ValidationRule[];
};

export class SchemaValidator<T extends object> {
  constructor(private schema: Record<string, ValidationRule[]>) {}

  validate(data: unknown): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    const obj = data as T;

    for (const [key, rules] of Object.entries(this.schema)) {
      const fieldErrors: string[] = [];
      const value = (obj as Record<string, unknown>)[key];

      for (const rule of rules || []) {
        if (!rule.validator(value)) {
          fieldErrors.push(rule.message);
        }
      }

      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// ============================================================================
// 3. 链式验证器
// ============================================================================

export class ValidationChain {
  private rules: ValidationRule[] = [];

  required(message = 'This field is required'): this {
    this.rules.push({ validator: Validators.required, message });
    return this;
  }

  email(message = 'Invalid email format'): this {
    this.rules.push({ validator: (v) => typeof v === 'string' && Validators.email(v), message });
    return this;
  }

  minLength(min: number, message?: string): this {
    this.rules.push({
      validator: (v) => typeof v === 'string' && Validators.minLength(v, min),
      message: message || `Must be at least ${min} characters`
    });
    return this;
  }

  maxLength(max: number, message?: string): this {
    this.rules.push({
      validator: (v) => typeof v === 'string' && Validators.maxLength(v, max),
      message: message || `Must be at most ${max} characters`
    });
    return this;
  }

  pattern(regex: RegExp, message = 'Invalid format'): this {
    this.rules.push({
      validator: (v) => typeof v === 'string' && Validators.pattern(v, regex),
      message
    });
    return this;
  }

  custom(validator: (value: unknown) => boolean, message: string): this {
    this.rules.push({ validator, message });
    return this;
  }

  validate(value: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validator(value)) {
        errors.push(rule.message);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// 4. 类型守卫
// ============================================================================

export const TypeGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  
  isNumber: (value: unknown): value is number => 
    typeof value === 'number' && !Number.isNaN(value),
  
  isInteger: (value: unknown): value is number => 
    Number.isInteger(value),
  
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  
  isArray: <T>(value: unknown): value is T[] => Array.isArray(value),
  
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  
  isFunction: (value: unknown): value is (...args: any[]) => any =>
    typeof value === 'function',
  
  isDate: (value: unknown): value is Date => value instanceof Date,
  
  isPromise: <T>(value: unknown): value is Promise<T> =>
    value instanceof Promise || (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as Promise<T>).then === 'function'
    )
};

// ============================================================================
// 5. 使用示例
// ============================================================================

interface User {
  name: string;
  email: string;
  age: number;
}

const userSchema = new SchemaValidator<User>({
  name: [
    { validator: Validators.required, message: 'Name is required' },
    { validator: (v) => typeof v === 'string' && Validators.minLength(v, 2), message: 'Name too short' }
  ],
  email: [
    { validator: Validators.required, message: 'Email is required' },
    { validator: (v) => typeof v === 'string' && Validators.email(v), message: 'Invalid email' }
  ],
  age: [
    { validator: Validators.required, message: 'Age is required' },
    { validator: (v) => typeof v === 'number' && Validators.min(v, 0), message: 'Age must be positive' }
  ]
});

// ============================================================================
// 导出
// ============================================================================

export { userSchema };;
