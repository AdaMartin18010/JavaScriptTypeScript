# 低代码平台 理论解读

## 概述

本模块探讨低代码平台的核心引擎设计与实现，涵盖从可视化设计器、Schema 驱动架构到代码生成与工作流编排的完整技术栈。掌握这些原理对于构建内部运营工具、可视化搭建系统以及提升开发效率至关重要。

## 核心概念

### Schema-First 架构

所有组件与页面均由结构化 Schema 定义驱动，实现从设计时到运行时的类型安全贯通。组件属性、事件、插槽通过声明式 Schema 描述，使可视化配置与最终产物保持语义一致。

### 设计时与运行时分离

设计时（Designer）提供组件库、属性面板、拖拽画布与撤销重做历史栈；运行时（Runtime）通过渲染引擎解析 Schema 并执行动作。两者的解耦允许同一套配置输出到不同技术栈（React、Vue、小程序）。

### DAG 工作流引擎

基于有向无环图的业务流程编排，支持顺序、条件分支、并行等节点类型。工作流实例维护上下文状态与执行历史，可嵌入审批、自动化等业务场景。

## 关键模式

| 模式 | 适用场景 | 注意事项 |
|------|----------|----------|
| 撤销重做栈 | 可视化编辑器中的用户操作回溯 | 使用深拷贝或结构化克隆，注意大状态的内存占用 |
| 模型驱动 UI | 根据数据模型自动生成表单与表格 | 复杂布局仍需人工干预，避免过度泛化 |
| 代码生成器 | 将可视化配置编译为可维护的业务代码 | 需平衡生成代码的可读性与一致性，保留扩展入口 |

## 低代码平台对比

| 特性 | Retool | Appsmith | Budibase | ToolJet |
|------|--------|----------|----------|---------|
| **部署方式** | 云端 SaaS / 自托管 | 开源自托管 / 云端 | 开源自托管 / 云端 | 开源自托管 / 云端 |
| **数据源** | 50+（PostgreSQL、REST、GraphQL、Snowflake 等） | 20+（主流 SQL/NoSQL、REST） | 内置 Budibase DB + 外部连接 | 40+（含 ClickHouse、Firestore 等） |
| **前端组件** | 丰富（表格、表单、图表、地图、自定义 React） | 中等（表格、表单、图表、地图） | 中等（表格、表单、图表） | 丰富（表格、表单、图表、日历、Kanban） |
| **工作流/自动化** | ✅ 工作流 + 定时任务 | ✅ 基础 JS 逻辑 + API | ✅ 自动化流程（内置） | ✅ 工作流引擎 |
| **权限控制** | 细粒度 RBAC + SSO | RBAC + 组权限 | RBAC + 多角色 | RBAC + SSO/SAML |
| **代码扩展** | 自定义 React/JS | 自定义 JS、导入库 | 自定义 JS、Handlebars | 自定义 React/JS、导入 npm |
| **Git 集成** | ✅ 版本控制 | ✅ Git 同步 | ✅ Git 同步 | ✅ Git 同步 |
| **开源协议** | 专有 | Apache-2.0 | GPL-3.0 | AGPL-3.0 |
| **最佳场景** | 企业级内部工具、BI 看板 | 快速 CRUD 后台、开源偏好 | 中小型团队、自动化流程 | 技术团队、需要深度定制 |

## JSON Schema 表单渲染器示例

```typescript
// schema-definition.ts
interface FormSchema {
  type: 'object';
  properties: Record<string, FieldSchema>;
  required?: string[];
}

interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  widget?: 'input' | 'select' | 'date-picker' | 'textarea';
  enum?: Array<{ label: string; value: unknown }>;
  rules?: ValidationRule[];
}

// 示例：用户注册表单 Schema
const userSchema: FormSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      widget: 'input',
      rules: [{ required: true, min: 3, max: 20 }],
    },
    email: {
      type: 'string',
      title: '邮箱',
      widget: 'input',
      rules: [{ required: true, pattern: '^\\S+@\\S+\\.\\S+$' }],
    },
    role: {
      type: 'string',
      title: '角色',
      widget: 'select',
      enum: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '访客', value: 'guest' },
      ],
    },
    subscribed: {
      type: 'boolean',
      title: '订阅邮件通知',
    },
  },
  required: ['username', 'email'],
};

// React 渲染引擎核心
function SchemaForm({ schema, onSubmit }: { schema: FormSchema; onSubmit: (v: unknown) => void }) {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFinish={onSubmit}>
      {Object.entries(schema.properties).map(([key, field]) => (
        <Form.Item
          key={key}
          name={key}
          label={field.title}
          rules={field.rules?.map((r) => ({
            required: r.required,
            min: r.min,
            max: r.max,
            pattern: r.pattern ? new RegExp(r.pattern) : undefined,
          }))}
        >
          {field.widget === 'select' ? (
            <Select options={field.enum} />
          ) : field.type === 'boolean' ? (
            <Switch />
          ) : (
            <Input />
          )}
        </Form.Item>
      ))}
      <Button type="primary" htmlType="submit">提交</Button>
    </Form>
  );
}
```

## 关联模块

- `56-code-generation` — AST 转换、OpenAPI 客户端生成与模板引擎技术
- `02-design-patterns` — 组合模式、访问者模式在低代码系统中的典型应用
- `53-app-architecture` — 应用架构模式与大型前端工程化实践

## 权威参考链接

- [Retool 官方文档](https://docs.retool.com/)
- [Appsmith 官方文档](https://docs.appsmith.com/)
- [Budibase 官方文档](https://docs.budibase.com/)
- [ToolJet 官方文档](https://docs.tooljet.com/)
- [JSON Schema 规范](https://json-schema.org/)
- [React JSON Schema Form (rjsf)](https://rjsf-team.github.io/react-jsonschema-form/docs/)
- [低代码引擎 LowCodeEngine (阿里)](https://lowcode-engine.cn/)

## 参考

- 本模块 `README.md` — 架构层次与关键概念说明
- 本模块 `lowcode-engine.ts` — 引擎核心实现（组件库、设计器、代码生成、工作流）
- 本模块 `schema-definition.ts` — 类型安全的 Schema 定义与验证系统
