# JSON Schema 驱动 UI

> 文件: `03-schema-driven-ui.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## Schema-Driven 架构

```
数据模型 (JSON Schema)
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Schema     │────▶│   Parser    │────▶│  Generator  │
│  定义       │     │  解析器      │     │  生成器      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ┌─────────┐               ┌─────────┐               ┌─────────┐
              │  Form   │               │ Table   │               │ Detail  │
              │  表单   │               │ 表格    │               │ 详情页  │
              └─────────┘               └─────────┘               └─────────┘
```

---

## x-ui 扩展规范

JSON Schema 是数据校验标准，低代码平台通过 `x-ui` 扩展注入 UI 元数据：

```json
{
  "type": "string",
  "title": "用户名",
  "minLength": 3,
  "x-ui": {
    "component": "Input",
    "placeholder": "请输入用户名",
    "colSpan": 12,
    "dependencies": [
      {
        "field": "userType",
        "value": "enterprise",
        "effect": "show"
      }
    ]
  }
}
```

### 自动生成规则

| Schema 特性 | 自动推断的 UI 行为 |
|-------------|-------------------|
| `required` | 表单字段标记必填 |
| `minLength` / `maxLength` | 输入框字符计数 + 校验 |
| `minimum` / `maximum` | 数字输入范围限制 |
| `enum` | 下拉选择框 |
| `format: email` | 邮箱输入组件 |
| `format: date` | 日期选择器 |
| `default` | 表单初始值 |

---

## 多视图生成

同一套 Schema 可驱动多种 UI 视图：

```typescript
const schema = loadSchema('user.json');

// 表单视图（编辑）
const formUI = generator.generateForm(schema);

// 表格视图（列表）
const tableUI = generator.generateTableColumns(schema);

// 详情视图（只读）
const detailUI = generator.generateDetail(schema);

// 搜索视图（条件过滤）
const searchUI = generator.generateSearch(schema);
```

---

## 完整 Schema 与渲染器实现

### 用户管理 Schema 示例

```typescript
// user.schema.ts
export const userSchema = {
  $id: 'user-schema',
  type: 'object',
  title: '用户信息',
  required: ['name', 'email', 'role'],
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      minLength: 2,
      maxLength: 50,
      'x-ui': {
        component: 'Input',
        placeholder: '请输入真实姓名',
        colSpan: 12,
      },
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email',
      'x-ui': {
        component: 'Input',
        placeholder: 'example@company.com',
        colSpan: 12,
      },
    },
    role: {
      type: 'string',
      title: '角色',
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
      'x-ui': {
        component: 'Select',
        colSpan: 6,
      },
    },
    department: {
      type: 'string',
      title: '部门',
      'x-ui': {
        component: 'Select',
        colSpan: 6,
        dependencies: [
          {
            field: 'role',
            value: 'admin',
            effect: 'show',
          },
        ],
      },
    },
    bio: {
      type: 'string',
      title: '个人简介',
      maxLength: 500,
      'x-ui': {
        component: 'TextArea',
        rows: 4,
        showCount: true,
        colSpan: 24,
      },
    },
    tags: {
      type: 'array',
      title: '技能标签',
      items: {
        type: 'string',
        enum: ['React', 'Vue', 'Node.js', 'Rust', 'Go'],
      },
      'x-ui': {
        component: 'TagSelect',
        mode: 'multiple',
        colSpan: 24,
      },
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      title: '创建时间',
      readOnly: true,
      'x-ui': {
        component: 'DatePicker',
        showTime: true,
        colSpan: 12,
      },
    },
  },
} as const;
```

### 类型安全的 Schema 渲染器

```typescript
// schema-renderer.tsx
import React from 'react';
import type { JSONSchema7 } from 'json-schema';

interface SchemaRendererProps {
  schema: JSONSchema7;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  mode?: 'form' | 'detail' | 'table';
}

const componentMap: Record<string, React.FC<any>> = {
  Input: ({ value, onChange, placeholder }) => (
    <input
      className="schema-input"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  Select: ({ value, onChange, options }) => (
    <select className="schema-select" value={value || ''} onChange={e => onChange(e.target.value)}>
      {options?.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  ),
  TextArea: ({ value, onChange, rows, showCount, maxLength }) => (
    <div>
      <textarea
        className="schema-textarea"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={rows || 3}
        maxLength={maxLength}
      />
      {showCount && (
        <span className="char-count">{(value || '').length}/{maxLength}</span>
      )}
    </div>
  ),
  TagSelect: ({ value, onChange, options, mode }) => (
    <div className="tag-select">
      {options?.map((opt: string) => {
        const selected = (value || []).includes(opt);
        return (
          <button
            key={opt}
            className={selected ? 'tag active' : 'tag'}
            onClick={() => {
              const next = selected
                ? (value || []).filter((v: string) => v !== opt)
                : [...(value || []), opt];
              onChange(next);
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  ),
};

export const SchemaRenderer: React.FC<SchemaRendererProps> = ({
  schema,
  value,
  onChange,
  mode = 'form',
}) => {
  const isReadOnly = mode === 'detail';

  const renderField = (key: string, propSchema: JSONSchema7) => {
    const ui = (propSchema as any)['x-ui'] || {};
    const Component = componentMap[ui.component] || componentMap.Input;
    const fieldValue = value[key];
    const error = validateField(fieldValue, propSchema);

    // 条件渲染：处理 dependencies
    if (ui.dependencies) {
      const shouldShow = ui.dependencies.every((dep: any) => {
        const depValue = value[dep.field];
        return dep.effect === 'show' ? depValue === dep.value : depValue !== dep.value;
      });
      if (!shouldShow) return null;
    }

    return (
      <div key={key} className={`field col-${ui.colSpan || 24}`}>
        <label>
          {propSchema.title || key}
          {schema.required?.includes(key) && <span className="required">*</span>}
        </label>
        <Component
          value={fieldValue}
          onChange={(v: any) => onChange({ ...value, [key]: v })}
          placeholder={ui.placeholder}
          options={propSchema.enum}
          rows={ui.rows}
          showCount={ui.showCount}
          maxLength={propSchema.maxLength}
          mode={ui.mode}
          readOnly={isReadOnly || propSchema.readOnly}
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  };

  const validateField = (val: unknown, propSchema: JSONSchema7): string | null => {
    if (schema.required?.some(k => k === propSchema.title) && (val === undefined || val === '')) {
      return '此字段为必填项';
    }
    if (propSchema.minLength && typeof val === 'string' && val.length < propSchema.minLength) {
      return `最少 ${propSchema.minLength} 个字符`;
    }
    if (propSchema.format === 'email' && typeof val === 'string' && !/\S+@\S+\.\S+/.test(val)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  };

  return (
    <div className="schema-form">
      {Object.entries(schema.properties || {}).map(([key, prop]) =>
        renderField(key, prop as JSONSchema7)
      )}
    </div>
  );
};
```

### 表格列自动生成

```typescript
// table-generator.ts
import type { JSONSchema7 } from 'json-schema';

interface ColumnDef {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: unknown) => string | React.ReactNode;
  sorter?: boolean;
  filters?: { text: string; value: string }[];
}

export function generateColumns(schema: JSONSchema7): ColumnDef[] {
  return Object.entries(schema.properties || {}).map(([key, prop]) => {
    const propSchema = prop as JSONSchema7;
    const col: ColumnDef = {
      key,
      title: propSchema.title || key,
      dataIndex: key,
      sorter: propSchema.type === 'number' || propSchema.type === 'integer',
    };

    if (propSchema.enum) {
      col.filters = propSchema.enum.map(v => ({ text: String(v), value: String(v) }));
    }

    if (propSchema.format === 'date-time') {
      col.render = (value) => new Date(value as string).toLocaleString();
    }

    if (key === 'email') {
      col.render = (value) => React.createElement('a', { href: `mailto:${value}` }, value as string);
    }

    return col;
  });
}
```

---

## 跨框架 Schema 渲染

Schema 驱动的核心优势是 **框架无关的数据描述**：

```typescript
// 同一 Schema 驱动 React / Vue / Angular / 小程序
const schema = loadSchema('order.json');

// React
<SchemaRenderer schema={schema} value={formData} onChange={setFormData} />

// Vue (伪代码)
<SchemaRenderer :schema="schema" v-model="formData" />

// 小程序 JSON 配置
{
  "usingComponents": {
    "schema-form": "/components/schema-form/index"
  },
  "schema": "order.json"
}
```

---

## 参考资源

### 规范与标准

- [JSON Schema](https://json-schema.org/) — JSON Schema 官方规范与文档
- [JSON Schema 2020-12 规范](https://json-schema.org/draft/2020-12/json-schema-core) — 核心规范文档
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) — 广泛使用的 Schema 扩展标准

### 开源实现

- [React JSON Schema Form (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/) — React 生态最流行的 Schema 表单库
- [Formily](https://formilyjs.org/) — 阿里开源的跨框架 Schema 驱动表单解决方案
- [Uniforms](https://uniforms.tools/) — 基于 JSON Schema 的 React 表单库
- [Vue Formulate](https://vueformulate.com/) — Vue 2/3 的声明式表单
- [Ant Design Form 生成器](https://procomponents.ant.design/components/schema-form) — ProComponents Schema 表单
- [MSON (Component.js)](https://github.com/redgeoff/mson) — 基于 JSON 的组件定义语言

### 设计模式

- [Schema-first Development](https://www.apollographql.com/docs/tutorial/schema/) — 先定义 Schema，再驱动实现的方法论

---

*最后更新: 2026-04-29*
