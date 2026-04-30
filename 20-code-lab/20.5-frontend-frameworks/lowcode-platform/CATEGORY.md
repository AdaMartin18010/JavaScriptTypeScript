---
dimension: 应用领域
application-domain: 低代码与可视化
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: 低代码平台 — 可视化设计器、Schema 驱动与代码生成
- **模块编号**: 97-lowcode-platform

## 边界说明

本模块聚焦低代码平台的核心引擎实现，包括：

- 组件库管理与页面设计器（含撤销重做）
- Schema 定义与类型安全
- React/Vue 代码生成
- 工作流引擎与表达式引擎

通用 UI 组件库（Ant Design / MUI）和构建工具不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `01-form-engine.ts` | 表单引擎与字段校验规则 | `01-form-engine.md` |
| `02-drag-drop-builder.ts` | 拖拽设计器与坐标计算 | `02-drag-drop-builder.md` |
| `03-schema-driven-ui.ts` | JSON Schema 驱动组件渲染 | `03-schema-driven-ui.md` |
| `04-workflow-engine.ts` | 节点编排与 DAG 执行 | `04-workflow-engine.md` |
| `lowcode-engine.ts` | 低代码引擎核心（画布 / 组件树 / 属性面板） | `lowcode-engine.test.ts` |
| `schema-definition.ts` | 平台 Schema DSL 与类型推导 | — |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### Schema 驱动组件渲染

```typescript
// 03-schema-driven-ui.ts
interface ComponentSchema {
  type: string;
  props: Record<string, unknown>;
  children?: ComponentSchema[];
}

export function renderFromSchema(
  schema: ComponentSchema,
  componentMap: Map<string, React.FC<any>>
): React.ReactElement {
  const Component = componentMap.get(schema.type);
  if (!Component) throw new Error(`Unknown component: ${schema.type}`);

  const children = schema.children?.map((child) => renderFromSchema(child, componentMap));
  return <Component {...schema.props}>{children}</Component>;
}
```

### 撤销重做历史栈

```typescript
export class HistoryStack<T> {
  private past: T[] = [];
  private future: T[] = [];
  private present: T;

  constructor(initial: T) {
    this.present = initial;
  }

  push(next: T) {
    this.past.push(this.present);
    this.present = next;
    this.future = [];
  }

  undo(): T | undefined {
    const previous = this.past.pop();
    if (previous === undefined) return undefined;
    this.future.push(this.present);
    this.present = previous;
    return this.present;
  }

  redo(): T | undefined {
    const next = this.future.pop();
    if (next === undefined) return undefined;
    this.past.push(this.present);
    this.present = next;
    return this.present;
  }
}
```

### 表达式引擎安全求值

```typescript
// 04-workflow-engine.ts — 受控表达式求值
export function safeEvaluate(
  expression: string,
  context: Record<string, unknown>
): unknown {
  // 白名单：仅允许数学与逻辑运算符
  const sanitized = expression.replace(/[^a-zA-Z0-9_+\-*/%<>!&|().\s]/g, '');
  const fn = new Function(...Object.keys(context), `return (${sanitized});`);
  return fn(...Object.values(context));
}
```

### 工作流 DAG 拓扑排序执行

```typescript
// workflow-dag.ts
type NodeId = string;

interface WorkflowNode {
  id: NodeId;
  execute: () => Promise<void>;
  dependencies: NodeId[];
}

export async function executeWorkflow(nodes: WorkflowNode[]): Promise<void> {
  const inDegree = new Map<NodeId, number>();
  const adj = new Map<NodeId, NodeId[]>();
  const nodeMap = new Map<NodeId, WorkflowNode>();

  for (const n of nodes) {
    inDegree.set(n.id, n.dependencies.length);
    nodeMap.set(n.id, n);
    for (const dep of n.dependencies) {
      if (!adj.has(dep)) adj.set(dep, []);
      adj.get(dep)!.push(n.id);
    }
  }

  const queue = nodes.filter((n) => n.dependencies.length === 0).map((n) => n.id);
  let processed = 0;

  while (queue.length) {
    const id = queue.shift()!;
    await nodeMap.get(id)!.execute();
    processed++;

    for (const next of adj.get(id) ?? []) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  if (processed !== nodes.length) {
    throw new Error('Workflow contains a cycle');
  }
}
```

### JSON Schema 表单校验集成（ajv）

```typescript
// form-validation.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export function validateFormData<T>(schema: object, data: unknown): { valid: boolean; errors?: string[] } {
  const validate = ajv.compile<T>(schema);
  const valid = validate(data);
  return {
    valid,
    errors: valid ? undefined : validate.errors?.map((e) => `${e.instancePath} ${e.message}`),
  };
}
```

### React 代码生成模板

```typescript
// codegen-react.ts
interface PageSchema {
  componentName: string;
  imports: string[];
  jsx: string;
}

export function generateReactComponent(schema: PageSchema): string {
  return `import React from 'react';
${schema.imports.map((i) => `import ${i} from './${i}';`).join('\n')}

export default function ${schema.componentName}() {
  return (
${schema.jsx}
  );
}
`;
}
```

### AST 驱动的安全代码生成

```typescript
// codegen-ast.ts — 使用 @babel/generator 生成类型安全代码
import * as t from '@babel/types';
import generate from '@babel/generator';

export function generateFormComponentAst(fields: Array<{ name: string; type: string; required: boolean }>): string {
  const importReact = t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier('React'))],
    t.stringLiteral('react')
  );

  const body = fields.map((field) => {
    const inputType = field.type === 'number' ? 'number' : 'text';
    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('div'), []),
      t.jsxClosingElement(t.jsxIdentifier('div')),
      [
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier('label'), []),
          t.jsxClosingElement(t.jsxIdentifier('label')),
          [t.jsxText(field.name)]
        ),
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier('input'),
            [
              t.jsxAttribute(t.jsxIdentifier('type'), t.stringLiteral(inputType)),
              t.jsxAttribute(t.jsxIdentifier('name'), t.stringLiteral(field.name)),
              ...(field.required ? [t.jsxAttribute(t.jsxIdentifier('required'))] : []),
            ],
            true
          ),
          null,
          []
        ),
      ]
    );
  });

  const component = t.functionDeclaration(
    t.identifier('GeneratedForm'),
    [],
    t.blockStatement([
      t.returnStatement(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier('form'), []),
          t.jsxClosingElement(t.jsxIdentifier('form')),
          body
        )
      ),
    ])
  );

  const ast = t.file(t.program([importReact, component]));
  return generate(ast).code;
}
```

### 实时协作状态同步（Yjs CRDT）

```typescript
// collaboration.ts — 基于 Yjs 的多用户画布协同编辑
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface CanvasElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

class CollaborativeCanvas {
  private doc = new Y.Doc();
  private elements: Y.Array<Y.Map<unknown>>;
  private provider: WebsocketProvider;

  constructor(roomId: string, wsUrl: string) {
    this.elements = this.doc.getArray('elements');
    this.provider = new WebsocketProvider(wsUrl, roomId, this.doc);
  }

  addElement(el: CanvasElement) {
    const map = new Y.Map<unknown>();
    Object.entries(el).forEach(([k, v]) => map.set(k, v));
    this.elements.push([map]);
  }

  updateElement(id: string, patch: Partial<CanvasElement>) {
    for (const map of this.elements) {
      if (map.get('id') === id) {
        Object.entries(patch).forEach(([k, v]) => map.set(k, v));
        break;
      }
    }
  }

  observe(callback: (elements: CanvasElement[]) => void) {
    this.elements.observe(() => {
      callback(this.elements.map((m) => Object.fromEntries(m) as CanvasElement));
    });
  }

  destroy() {
    this.provider.destroy();
    this.doc.destroy();
  }
}
```

## 关联模块

- `56-code-generation` — 代码生成
- `37-pwa` — PWA（低代码平台常输出 PWA）
- `58-data-visualization` — 数据可视化组件
- `30-knowledge-base/30.2-categories/35-pwa-lowcode.md` — 低代码分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| JSON Schema | 规范 | [json-schema.org](https://json-schema.org) |
| react-jsonschema-form | 文档 | [rjsf-team.github.io/react-jsonschema-form](https://rjsf-team.github.io/react-jsonschema-form) |
| Formily | 文档 | [formilyjs.org](https://formilyjs.org) — 阿里开源表单方案 |
| Designable | GitHub | [github.com/alibaba/designable](https://github.com/alibaba/designable) — 低代码设计器 |
| LogicFlow | 文档 | [site.logic-flow.cn](https://site.logic-flow.cn) — 流程图引擎 |
| CodeSandbox / Sandpack | 文档 | [sandpack.codesandbox.io/docs](https://sandpack.codesandbox.io/docs) |
| Low-Code Engine — Ant Design | 文档 | [lowcode-engine.cn](https://lowcode-engine.cn) |
| Appsmith | 文档 | [docs.appsmith.com](https://docs.appsmith.com) |
| ToolJet | 文档 | [docs.tooljet.com](https://docs.tooljet.com) |
| Ajv — JSON Schema Validator | 文档 | [ajv.js.org](https://ajv.js.org/) |
| Babel AST 手册 | 文档 | [github.com/jamiebuilds/babel-handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) |
| Yjs — CRDT 共享类型 | 文档 | [docs.yjs.dev](https://docs.yjs.dev/) |
| Monaco Editor | 文档 | [microsoft.github.io/monaco-editor](https://microsoft.github.io/monaco-editor/) |
| Builder.io — 可视化 CMS | 文档 | [www.builder.io/c/docs/developers](https://www.builder.io/c/docs/developers) |
| React DnD | 文档 | [react-dnd.github.io/react-dnd/about](https://react-dnd.github.io/react-dnd/about) |
| tldraw — 开源白板引擎 | GitHub | [github.com/tldraw/tldraw](https://github.com/tldraw/tldraw) |
| Slate.js — 富文本框架 | 文档 | [docs.slatejs.org](https://docs.slatejs.org/) |

---

*最后更新: 2026-04-29*
