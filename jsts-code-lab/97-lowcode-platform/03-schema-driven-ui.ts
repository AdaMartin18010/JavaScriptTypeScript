/**
 * @file JSON Schema 驱动 UI
 * @category Low-code -> Schema-Driven UI
 * @difficulty hard
 * @tags low-code, json-schema, schema-driven, ui-generation
 *
 * @description
 * JSON Schema 驱动 UI 是低代码平台的理论基础：通过结构化的 Schema 定义
 * 自动生成完整的用户界面，实现数据模型与视图表现的解耦。
 */

// ============================================================================
// 1. JSON Schema 扩展（UI 专用）
// ============================================================================

export interface JSONSchema7 {
  $id?: string;
  title?: string;
  description?: string;
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  enum?: unknown[];
  properties?: Record<string, JSONSchema7>;
  required?: string[];
  items?: JSONSchema7 | boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  default?: unknown;
  'x-ui'?: UISchemaExtension;
}

export interface UISchemaExtension {
  component?: string;
  order?: string[];
  hidden?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  label?: string;
  colSpan?: number;
  props?: Record<string, unknown>;
  rules?: ValidationSchema[];
  dependencies?: UIDependency[];
}

export interface ValidationSchema {
  rule: string;
  value?: unknown;
  message: string;
}

export interface UIDependency {
  field: string;
  value: unknown;
  effect: 'show' | 'hide' | 'enable' | 'disable' | 'setValue';
  targetValue?: unknown;
}

// ============================================================================
// 2. Schema 解析器
// ============================================================================

export interface ParsedField {
  id: string;
  label: string;
  type: string;
  component: string;
  required: boolean;
  validation: ValidationSchema[];
  props: Record<string, unknown>;
  order?: number;
  dependencies?: UIDependency[];
  children?: ParsedField[];
}

export class SchemaParser {
  private componentMapping: Record<string, string> = {
    'string': 'Input',
    'string:email': 'EmailInput',
    'string:password': 'PasswordInput',
    'string:date': 'DatePicker',
    'string:date-time': 'DateTimePicker',
    'string:uri': 'URLInput',
    'string:textarea': 'TextArea',
    'number': 'NumberInput',
    'integer': 'NumberInput',
    'boolean': 'Switch',
    'array': 'ArrayField',
    'object': 'ObjectField',
  };

  parse(schema: JSONSchema7): ParsedField[] {
    return this.parseProperties(schema.properties ?? {}, schema.required ?? []);
  }

  private parseProperties(
    properties: Record<string, JSONSchema7>,
    required: string[],
    parentPath = ''
  ): ParsedField[] {
    const fields: ParsedField[] = [];

    for (const [key, prop] of Object.entries(properties)) {
      const path = parentPath ? `${parentPath}.${key}` : key;
      const ui = prop['x-ui'] ?? {};

      const field: ParsedField = {
        id: path,
        label: ui.label ?? prop.title ?? key,
        type: prop.type ?? 'string',
        component: this.resolveComponent(prop, ui),
        required: required.includes(key),
        validation: this.buildValidation(prop, ui),
        props: {
          ...ui.props,
          placeholder: ui.placeholder,
          helpText: ui.helpText,
          description: prop.description,
          defaultValue: prop.default,
          enum: prop.enum,
        },
        order: ui.order?.indexOf(key),
        dependencies: ui.dependencies,
      };

      if (prop.type === 'object' && prop.properties) {
        field.children = this.parseProperties(prop.properties, prop.required ?? [], path);
      }

      if (prop.type === 'array' && typeof prop.items === 'object' && prop.items.properties) {
        field.children = this.parseProperties(
          prop.items.properties,
          prop.items.required ?? [],
          `${path}[]`
        );
      }

      fields.push(field);
    }

    return fields;
  }

  private resolveComponent(schema: JSONSchema7, ui: UISchemaExtension | undefined): string {
    if (ui?.component) return ui.component;
    const type = schema.type ?? 'string';
    const format = schema.format ?? '';
    const key = `${type}:${format}`;
    return this.componentMapping[key] ?? this.componentMapping[type] ?? 'Input';
  }

  private buildValidation(schema: JSONSchema7, ui: UISchemaExtension | undefined): ValidationSchema[] {
    const rules: ValidationSchema[] = [];

    if (schema.minLength !== undefined) {
      rules.push({ rule: 'minLength', value: schema.minLength, message: `最少 ${schema.minLength} 个字符` });
    }
    if (schema.maxLength !== undefined) {
      rules.push({ rule: 'maxLength', value: schema.maxLength, message: `最多 ${schema.maxLength} 个字符` });
    }
    if (schema.minimum !== undefined) {
      rules.push({ rule: 'minimum', value: schema.minimum, message: `最小值 ${schema.minimum}` });
    }
    if (schema.maximum !== undefined) {
      rules.push({ rule: 'maximum', value: schema.maximum, message: `最大值 ${schema.maximum}` });
    }
    if (schema.pattern) {
      rules.push({ rule: 'pattern', value: schema.pattern, message: '格式不正确' });
    }
    if (schema.format === 'email') {
      rules.push({ rule: 'email', message: '请输入有效的邮箱地址' });
    }
    if (ui?.rules) {
      rules.push(...ui.rules);
    }

    return rules;
  }

  registerComponent(type: string, format: string | undefined, component: string): void {
    const key = format ? `${type}:${format}` : type;
    this.componentMapping[key] = component;
  }
}

// ============================================================================
// 3. UI 生成器
// ============================================================================

export interface GeneratedUI {
  type: 'form' | 'table' | 'detail' | 'list';
  fields: ParsedField[];
  layout: UILayout;
  actions?: UIAction[];
}

export interface UILayout {
  type: 'grid' | 'flex' | 'tabs' | 'steps';
  columns?: number;
  gutter?: number;
  sections?: Array<{
    title?: string;
    fields: string[];
  }>;
}

export interface UIAction {
  id: string;
  label: string;
  type: 'submit' | 'reset' | 'cancel' | 'custom';
  style?: 'primary' | 'default' | 'danger';
}

export class UIGenerator {
  private parser = new SchemaParser();

  generateForm(schema: JSONSchema7, layout?: Partial<UILayout>): GeneratedUI {
    const fields = this.parser.parse(schema);
    return {
      type: 'form',
      fields,
      layout: { type: 'grid', columns: 2, gutter: 16, ...layout },
      actions: [
        { id: 'submit', label: '提交', type: 'submit', style: 'primary' },
        { id: 'reset', label: '重置', type: 'reset' },
      ],
    };
  }

  generateDetail(schema: JSONSchema7): GeneratedUI {
    const fields = this.parser.parse(schema).map((f) => ({
      ...f,
      props: { ...f.props, readonly: true },
    }));
    return {
      type: 'detail',
      fields,
      layout: { type: 'flex', columns: 1, gutter: 8 },
    };
  }

  generateTableColumns(schema: JSONSchema7): Array<{
    key: string;
    title: string;
    type: string;
    sortable: boolean;
    filterable: boolean;
  }> {
    return this.parser.parse(schema).map((field) => ({
      key: field.id,
      title: field.label,
      type: field.type,
      sortable: ['number', 'integer', 'string', 'date'].includes(field.type),
      filterable: field.props.enum !== undefined || field.type === 'boolean',
    }));
  }
}

// ============================================================================
// 4. Schema 校验器
// ============================================================================

export class SchemaValidator {
  validate(data: unknown, schema: JSONSchema7, path = ''): { valid: boolean; errors: Array<{ path: string; message: string }> } {
    const errors: Array<{ path: string; message: string }> = [];

    if (schema.type === 'object' && typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
        const fullPath = path ? `${path}.${key}` : key;

        if (schema.required?.includes(key) && !(key in obj)) {
          errors.push({ path: fullPath, message: `必填字段缺失: ${key}` });
          continue;
        }

        if (key in obj) {
          const result = this.validate(obj[key], propSchema, fullPath);
          errors.push(...result.errors);
        }
      }
    }

    if (schema.type === 'string' && typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({ path, message: `长度不能小于 ${schema.minLength}` });
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({ path, message: `长度不能大于 ${schema.maxLength}` });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        errors.push({ path, message: '格式不匹配' });
      }
    }

    if ((schema.type === 'number' || schema.type === 'integer') && typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push({ path, message: `不能小于 ${schema.minimum}` });
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push({ path, message: `不能大于 ${schema.maximum}` });
      }
    }

    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({ path, message: `必须是以下值之一: ${schema.enum.join(', ')}` });
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== JSON Schema 驱动 UI ===\n');

  const userSchema: JSONSchema7 = {
    title: '用户',
    type: 'object',
    required: ['username', 'email'],
    properties: {
      username: {
        type: 'string',
        title: '用户名',
        minLength: 3,
        maxLength: 20,
        'x-ui': { component: 'Input', placeholder: '请输入用户名' },
      },
      email: {
        type: 'string',
        format: 'email',
        title: '邮箱',
        'x-ui': { component: 'EmailInput', placeholder: 'example@domain.com' },
      },
      age: {
        type: 'integer',
        title: '年龄',
        minimum: 0,
        maximum: 150,
        'x-ui': { component: 'NumberInput' },
      },
      role: {
        type: 'string',
        title: '角色',
        enum: ['admin', 'editor', 'viewer'],
        default: 'viewer',
        'x-ui': { component: 'Select' },
      },
      profile: {
        type: 'object',
        title: '个人资料',
        properties: {
          bio: { type: 'string', title: '简介', 'x-ui': { component: 'TextArea' } },
          website: { type: 'string', format: 'uri', title: '个人网站' },
        },
      },
    },
  };

  const generator = new UIGenerator();

  console.log('--- 表单生成 ---');
  const form = generator.generateForm(userSchema);
  console.log('UI 类型:', form.type);
  console.log('字段数:', form.fields.length);
  console.log('字段列表:', form.fields.map((f) => `${f.id}(${f.component})`));

  console.log('\n--- 详情页生成 ---');
  const detail = generator.generateDetail(userSchema);
  console.log('详情字段数:', detail.fields.length);

  console.log('\n--- 表格列生成 ---');
  const columns = generator.generateTableColumns(userSchema);
  console.log('表格列:', columns.map((c) => `${c.title}(sortable=${c.sortable})`));

  console.log('\n--- Schema 校验 ---');
  const validator = new SchemaValidator();
  const testData = {
    username: 'ab',
    email: 'invalid',
    age: 200,
    role: 'admin',
    profile: { bio: '', website: '' },
  };
  const result = validator.validate(testData, userSchema);
  console.log('校验通过:', result.valid);
  console.log('错误:', result.errors);
}
