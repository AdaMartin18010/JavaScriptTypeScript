/**
 * @file 表单引擎设计与实现
 * @category Low-code → Form Engine
 * @difficulty hard
 * @tags low-code, form-engine, dynamic-form, validation, schema
 *
 * @description
 * 表单引擎是低代码平台的核心组件之一，负责将 Schema 定义转换为可运行的动态表单，
 * 支持字段联动、条件渲染、异步校验和复杂布局。
 */

// ============================================================================
// 1. 表单 Schema 定义
// ============================================================================

export type FieldType =
  | 'string' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'select' | 'multiselect' | 'radio' | 'checkbox'
  | 'textarea' | 'rich-text' | 'password' | 'email' | 'url'
  | 'file' | 'image' | 'json' | 'custom';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;

  // 校验规则
  validation?: ValidationRule[];

  // 数据源（用于 select / radio / checkbox）
  dataSource?: StaticDataSource | RemoteDataSource;

  // 布局
  span?: number;          // 栅格占据列数 (1-24)
  offset?: number;        // 偏移
  hidden?: boolean;       // 隐藏
  disabled?: boolean;     // 禁用

  // 联动
  dependencies?: FieldDependency[];
  condition?: ConditionExpression;

  // 扩展
  props?: Record<string, unknown>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom' | 'async';
  value?: unknown;
  message: string;
  validator?: (value: unknown, context: FormContext) => boolean | Promise<boolean>;
}

export interface StaticDataSource {
  type: 'static';
  options: Array<{ label: string; value: unknown }>;
}

export interface RemoteDataSource {
  type: 'remote';
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, unknown>;
  labelField?: string;
  valueField?: string;
  cacheDuration?: number; // ms
}

export interface FieldDependency {
  fieldId: string;
  effect: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'setOptions';
  condition: ConditionExpression;
}

export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'and' | 'or';

export interface ConditionExpression {
  op: ConditionOperator;
  field?: string;
  value?: unknown;
  conditions?: ConditionExpression[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelWidth?: number;
  fields: FormField[];
  actions?: FormAction[];
}

export interface FormAction {
  id: string;
  label: string;
  type: 'submit' | 'reset' | 'button';
  style?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: string; // 表达式或动作ID
}

// ============================================================================
// 2. 表单运行时上下文
// ============================================================================

export interface FormContext {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Set<string>;
  dirty: Set<string>;
  readonly: boolean;
  submitting: boolean;
}

export class FormEngine {
  private schema: FormSchema;
  private context: FormContext;
  private listeners: Set<(ctx: FormContext) => void> = new Set();
  private dataSourceCache = new Map<string, { data: unknown; expiry: number }>();

  constructor(schema: FormSchema) {
    this.schema = schema;
    this.context = {
      values: this.initValues(schema.fields),
      errors: {},
      touched: new Set(),
      dirty: new Set(),
      readonly: false,
      submitting: false,
    };
  }

  private initValues(fields: FormField[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        values[field.id] = field.defaultValue;
      } else {
        values[field.id] = this.getEmptyValue(field.type);
      }
    }
    return values;
  }

  private getEmptyValue(type: FieldType): unknown {
    switch (type) {
      case 'string': case 'textarea': case 'rich-text': case 'password': case 'email': case 'url': return '';
      case 'number': return 0;
      case 'boolean': case 'checkbox': return false;
      case 'date': case 'datetime': return null;
      case 'select': case 'radio': case 'file': case 'image': return null;
      case 'multiselect': return [];
      case 'json': return {};
      default: return null;
    }
  }

  getContext(): FormContext {
    return { ...this.context };
  }

  subscribe(listener: (ctx: FormContext) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener({ ...this.context });
    }
  }

  /** 设置字段值 */
  setValue(fieldId: string, value: unknown): void {
    this.context.values[fieldId] = value;
    this.context.touched.add(fieldId);
    this.context.dirty.add(fieldId);

    // 清除该字段的错误
    delete this.context.errors[fieldId];

    // 触发联动
    this.processDependencies(fieldId);

    this.notify();
  }

  /** 获取字段值 */
  getValue(fieldId: string): unknown {
    return this.context.values[fieldId];
  }

  /** 获取所有值 */
  getValues(): Record<string, unknown> {
    return { ...this.context.values };
  }

  /** 批量设置 */
  setValues(values: Record<string, unknown>): void {
    Object.assign(this.context.values, values);
    for (const key of Object.keys(values)) {
      this.context.dirty.add(key);
    }
    this.notify();
  }

  /** 重置表单 */
  reset(): void {
    this.context.values = this.initValues(this.schema.fields);
    this.context.errors = {};
    this.context.touched.clear();
    this.context.dirty.clear();
    this.notify();
  }

  // ============================================================================
  // 3. 校验引擎
  // ============================================================================

  async validateField(fieldId: string): Promise<boolean> {
    const field = this.schema.fields.find((f) => f.id === fieldId);
    if (!field || !field.validation) return true;

    const value = this.context.values[fieldId];
    const errors: string[] = [];

    for (const rule of field.validation) {
      const valid = await this.validateRule(value, rule, this.context);
      if (!valid) {
        errors.push(rule.message);
      }
    }

    if (errors.length > 0) {
      this.context.errors[fieldId] = errors;
    } else {
      delete this.context.errors[fieldId];
    }

    this.notify();
    return errors.length === 0;
  }

  async validateAll(): Promise<boolean> {
    let allValid = true;
    for (const field of this.schema.fields) {
      if (field.validation) {
        const valid = await this.validateField(field.id);
        if (!valid) allValid = false;
      }
    }
    return allValid;
  }

  private async validateRule(value: unknown, rule: ValidationRule, context: FormContext): Promise<boolean> {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);
      case 'min':
        return typeof value === 'number' && value >= (rule.value as number);
      case 'max':
        return typeof value === 'number' && value <= (rule.value as number);
      case 'minLength':
        return typeof value === 'string' && value.length >= (rule.value as number);
      case 'maxLength':
        return typeof value === 'string' && value.length <= (rule.value as number);
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value as string).test(value);
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        return typeof value === 'string' && /^https?:\/\/.+/.test(value);
      case 'custom':
      case 'async':
        return rule.validator ? await rule.validator(value, context) : true;
      default:
        return true;
    }
  }

  // ============================================================================
  // 4. 字段联动处理
  // ============================================================================

  private processDependencies(changedFieldId: string): void {
    for (const field of this.schema.fields) {
      if (!field.dependencies) continue;

      for (const dep of field.dependencies) {
        if (dep.fieldId !== changedFieldId) continue;

        const satisfied = this.evaluateCondition(dep.condition, this.context.values);

        switch (dep.effect) {
          case 'show':
            field.hidden = !satisfied;
            break;
          case 'hide':
            field.hidden = satisfied;
            break;
          case 'enable':
            field.disabled = !satisfied;
            break;
          case 'disable':
            field.disabled = satisfied;
            break;
          case 'setValue':
            if (satisfied) {
              this.context.values[field.id] = dep.condition.value;
            }
            break;
        }
      }
    }
  }

  evaluateCondition(condition: ConditionExpression, values: Record<string, unknown>): boolean {
    if (condition.op === 'and') {
      return condition.conditions?.every((c) => this.evaluateCondition(c, values)) ?? true;
    }
    if (condition.op === 'or') {
      return condition.conditions?.some((c) => this.evaluateCondition(c, values)) ?? false;
    }

    const fieldValue = values[condition.field!];
    const compareValue = condition.value;

    switch (condition.op) {
      case 'eq': return fieldValue === compareValue;
      case 'ne': return fieldValue !== compareValue;
      case 'gt': return typeof fieldValue === 'number' && typeof compareValue === 'number' && fieldValue > compareValue;
      case 'gte': return typeof fieldValue === 'number' && typeof compareValue === 'number' && fieldValue >= compareValue;
      case 'lt': return typeof fieldValue === 'number' && typeof compareValue === 'number' && fieldValue < compareValue;
      case 'lte': return typeof fieldValue === 'number' && typeof compareValue === 'number' && fieldValue <= compareValue;
      case 'in': return Array.isArray(compareValue) && compareValue.includes(fieldValue);
      case 'nin': return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
      case 'contains': return typeof fieldValue === 'string' && typeof compareValue === 'string' && fieldValue.includes(compareValue);
      case 'startsWith': return typeof fieldValue === 'string' && typeof compareValue === 'string' && fieldValue.startsWith(compareValue);
      case 'endsWith': return typeof fieldValue === 'string' && typeof compareValue === 'string' && fieldValue.endsWith(compareValue);
      default: return false;
    }
  }

  // ============================================================================
  // 5. 获取可见字段（含条件渲染）
  // ============================================================================

  getVisibleFields(): FormField[] {
    return this.schema.fields.filter((field) => {
      if (field.hidden) return false;
      if (field.condition) {
        return this.evaluateCondition(field.condition, this.context.values);
      }
      return true;
    });
  }

  getSchema(): FormSchema {
    return this.schema;
  }
}

// ============================================================================
// 6. 演示
// ============================================================================

export function demo(): void {
  console.log('=== 表单引擎 ===\n');

  const schema: FormSchema = {
    id: 'user-registration',
    title: '用户注册',
    layout: 'horizontal',
    fields: [
      {
        id: 'username',
        name: 'username',
        label: '用户名',
        type: 'string',
        required: true,
        validation: [
          { type: 'required', message: '用户名不能为空' },
          { type: 'minLength', value: 3, message: '用户名至少 3 个字符' },
          { type: 'maxLength', value: 20, message: '用户名最多 20 个字符' },
        ],
        span: 12,
      },
      {
        id: 'email',
        name: 'email',
        label: '邮箱',
        type: 'email',
        required: true,
        validation: [
          { type: 'required', message: '邮箱不能为空' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ],
        span: 12,
      },
      {
        id: 'userType',
        name: 'userType',
        label: '用户类型',
        type: 'select',
        required: true,
        dataSource: {
          type: 'static',
          options: [
            { label: '个人用户', value: 'individual' },
            { label: '企业用户', value: 'enterprise' },
          ],
        },
        span: 12,
      },
      {
        id: 'companyName',
        name: 'companyName',
        label: '公司名称',
        type: 'string',
        dependencies: [
          {
            fieldId: 'userType',
            effect: 'show',
            condition: { op: 'eq', field: 'userType', value: 'enterprise' },
          },
        ],
        span: 12,
      },
      {
        id: 'age',
        name: 'age',
        label: '年龄',
        type: 'number',
        validation: [
          { type: 'min', value: 18, message: '年龄必须大于等于 18' },
          { type: 'max', value: 120, message: '年龄必须小于等于 120' },
        ],
        span: 12,
      },
    ],
    actions: [
      { id: 'submit', label: '提交', type: 'submit', style: 'primary' },
      { id: 'reset', label: '重置', type: 'reset', style: 'ghost' },
    ],
  };

  const engine = new FormEngine(schema);

  console.log('初始值:', engine.getValues());

  engine.setValue('username', 'ab');
  engine.validateField('username').then((valid) => {
    console.log('用户名校验:', valid ? '通过' : '失败');
    console.log('错误信息:', engine.getContext().errors);
  });

  engine.setValue('userType', 'enterprise');
  console.log('\n选择企业用户后可见字段:', engine.getVisibleFields().map((f) => f.id));

  engine.setValue('email', 'invalid-email');
  engine.validateField('email').then(() => {
    console.log('\n邮箱校验结果:', engine.getContext().errors.email);
  });
}
