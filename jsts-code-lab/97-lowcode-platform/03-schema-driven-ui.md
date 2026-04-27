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

## 参考资源

- [JSON Schema](https://json-schema.org/)
- [React JSON Schema Form](https://rjsf-team.github.io/react-jsonschema-form/)
- [Formily JSON Schema](https://formilyjs.org/)
- [Uniforms](https://uniforms.tools/)
