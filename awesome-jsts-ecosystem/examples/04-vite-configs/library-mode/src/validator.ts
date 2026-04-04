import type { ValidationResult, ValidationRule } from './types';

/**
 * 数据验证器
 */
class Validator<T extends Record<string, unknown>> {
  private rules: Map<keyof T, ValidationRule<T>[]>;

  constructor() {
    this.rules = new Map();
  }

  /**
   * 添加验证规则
   * @param field - 字段名
   * @param rule - 验证规则
   */
  addRule(field: keyof T, rule: ValidationRule<T>): void {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(rule);
  }

  /**
   * 验证数据
   * @param data - 要验证的数据
   */
  validate(data: T): ValidationResult {
    const errors: string[] = [];

    for (const [field, rules] of this.rules) {
      const value = data[field];

      for (const rule of rules) {
        // 必填验证
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(rule.message || `Field "${String(field)}" is required`);
          continue;
        }

        // 跳过空值的后续验证
        if (value === undefined || value === null) {
          continue;
        }

        const strValue = String(value);

        // 最小长度验证
        if (rule.minLength !== undefined && strValue.length < rule.minLength) {
          errors.push(
            rule.message || `Field "${String(field)}" must be at least ${rule.minLength} characters`
          );
          continue;
        }

        // 最大长度验证
        if (rule.maxLength !== undefined && strValue.length > rule.maxLength) {
          errors.push(
            rule.message || `Field "${String(field)}" must be at most ${rule.maxLength} characters`
          );
          continue;
        }

        // 正则验证
        if (rule.pattern && !rule.pattern.test(strValue)) {
          errors.push(rule.message || `Field "${String(field)}" format is invalid`);
          continue;
        }

        // 自定义验证
        if (rule.validator && !rule.validator(value)) {
          errors.push(rule.message || `Field "${String(field)}" validation failed`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 清除所有规则
   */
  clear(): void {
    this.rules.clear();
  }
}

export default Validator;
