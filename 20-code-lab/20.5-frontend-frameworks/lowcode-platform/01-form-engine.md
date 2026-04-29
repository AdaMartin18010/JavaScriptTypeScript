# 表单引擎设计与实现

> 文件: `01-form-engine.ts` | 难度: ⭐⭐⭐⭐ (高级)

---

## 表单引擎架构

```
Schema 定义层
├── 字段类型系统 (string / number / select / ...)
├── 校验规则 DSL
├── 联动依赖图
└── 数据源绑定

运行时引擎
├── 状态管理 (values / errors / touched / dirty)
├── 校验调度器 (同步 + 异步)
├── 联动计算器 (条件表达式求值)
├── 数据源加载器 (静态 + 远程 + 缓存)
└── 渲染适配器 (React / Vue / 纯 DOM)

输出层
├── 表单数据 (JSON)
├── 校验结果
├── 变更事件流
└── 提交/重置动作
```

---

## 核心设计决策

### 1. Schema-First

所有表单行为均由 Schema 声明式定义，无需编写 imperative 代码：

```typescript
const schema: FormSchema = {
  fields: [
    {
      id: 'country',
      type: 'select',
      dataSource: { type: 'remote', url: '/api/countries' }
    },
    {
      id: 'city',
      type: 'select',
      // 联动：country 变化时重新加载城市列表
      dependencies: [{
        fieldId: 'country',
        effect: 'setOptions',
        condition: { op: 'ne', field: 'country', value: null }
      }]
    }
  ]
};
```

### 2. 统一条件表达式

校验、联动、条件渲染共享同一套表达式引擎：

```typescript
// 校验：年龄必须 >= 18
{ op: 'gte', field: 'age', value: 18 }

// 联动：当 userType === 'enterprise' 时显示 companyName
{ op: 'eq', field: 'userType', value: 'enterprise' }

// 复杂条件
{
  op: 'and',
  conditions: [
    { op: 'eq', field: 'country', value: 'CN' },
    { op: 'gte', field: 'age', value: 18 }
  ]
}
```

### 3. 数据源抽象

| 类型 | 特性 | 适用场景 |
|------|------|----------|
| `static` | 内联选项数组 | 枚举值、固定选项 |
| `remote` | HTTP 请求 + 缓存 | 动态字典、级联选择 |
| `computed` | 依赖其他字段计算 | 联动过滤 |

---

## 性能优化

### 校验节流

```typescript
// 输入时立即进行轻量校验（如格式检查）
// 防抖后进行重量校验（如异步查重）
const debouncedValidate = debounce((fieldId, value) => {
  formEngine.validateAsync(fieldId, value);
}, 300);
```

### 联动计算优化

```typescript
// 构建依赖图，仅重新计算受影响的字段
const depGraph = buildDependencyGraph(schema.fields);
// 当 field A 变化时，仅重新评估 A 的下游节点
const affectedFields = depGraph.getDownstream(changedFieldId);
```

---

## 完整实现：条件表达式引擎

```typescript
// expression-engine.ts

type Operator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'and' | 'or' | 'not' | 'in';

interface Condition {
  op: Operator;
  field?: string;
  value?: unknown;
  conditions?: Condition[];
}

class ExpressionEngine {
  evaluate(condition: Condition, context: Record<string, unknown>): boolean {
    switch (condition.op) {
      case 'eq':
        return context[condition.field!] === condition.value;
      case 'ne':
        return context[condition.field!] !== condition.value;
      case 'gt':
        return (context[condition.field!] as number) > (condition.value as number);
      case 'gte':
        return (context[condition.field!] as number) >= (condition.value as number);
      case 'lt':
        return (context[condition.field!] as number) < (condition.value as number);
      case 'lte':
        return (context[condition.field!] as number) <= (condition.value as number);
      case 'in':
        return (condition.value as unknown[]).includes(context[condition.field!]);
      case 'and':
        return condition.conditions!.every(c => this.evaluate(c, context));
      case 'or':
        return condition.conditions!.some(c => this.evaluate(c, context));
      case 'not':
        return !this.evaluate(condition.conditions![0], context);
      default:
        return false;
    }
  }
}

// Usage
const engine = new ExpressionEngine();
const context = { age: 25, country: 'CN', userType: 'enterprise' };

const condition: Condition = {
  op: 'and',
  conditions: [
    { op: 'eq', field: 'country', value: 'CN' },
    { op: 'gte', field: 'age', value: 18 }
  ]
};

console.log(engine.evaluate(condition, context)); // true
```

---

## 完整实现：异步校验调度器

```typescript
// validation-scheduler.ts

type ValidationResult = { valid: boolean; message?: string };
type Validator = (value: unknown) => ValidationResult | Promise<ValidationResult>;

interface FieldValidators {
  sync: Validator[];
  async: Validator[];
}

class ValidationScheduler {
  private pending = new Map<string, AbortController>();

  async validateField(
    fieldId: string,
    value: unknown,
    validators: FieldValidators
  ): Promise<ValidationResult[]> {
    // Cancel previous async validation for this field
    this.pending.get(fieldId)?.abort();
    const controller = new AbortController();
    this.pending.set(fieldId, controller);

    const results: ValidationResult[] = [];

    // Run synchronous validators first
    for (const validator of validators.sync) {
      const result = validator(value);
      results.push(result);
      if (!result.valid) {
        // Fast-fail: stop on first sync error
        this.pending.delete(fieldId);
        return results;
      }
    }

    // Debounce async validators
    await new Promise(resolve => setTimeout(resolve, 300));
    if (controller.signal.aborted) {
      return [{ valid: false, message: 'Validation aborted' }];
    }

    for (const validator of validators.async) {
      const result = await validator(value);
      results.push(result);
      if (!result.valid) break;
    }

    this.pending.delete(fieldId);
    return results;
  }
}

// Usage example
const scheduler = new ValidationScheduler();

const validators: FieldValidators = {
  sync: [
    (v) => ({ valid: v !== '', message: 'Required' }),
    (v) => ({ valid: (v as string).length >= 3, message: 'Min 3 chars' })
  ],
  async: [
    async (v) => {
      const res = await fetch(`/api/check-username?u=${v}`);
      const data = await res.json();
      return { valid: data.available, message: data.available ? undefined : 'Taken' };
    }
  ]
};

scheduler.validateField('username', 'john_doe', validators)
  .then(results => console.log(results));
```

---

## 完整实现：依赖图构建与联动计算

```typescript
// dependency-graph.ts

interface FieldDependency {
  fieldId: string;
  targetField: string;
  effect: string;
  condition: Condition;
}

class DependencyGraph {
  private adjacency = new Map<string, Set<string>>();
  private dependencies: FieldDependency[] = [];

  addDependency(dep: FieldDependency) {
    this.dependencies.push(dep);
    if (!this.adjacency.has(dep.fieldId)) {
      this.adjacency.set(dep.fieldId, new Set());
    }
    this.adjacency.get(dep.fieldId)!.add(dep.targetField);
  }

  getDownstream(fieldId: string): string[] {
    const visited = new Set<string>();
    const queue = [fieldId];
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.adjacency.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            result.push(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
    return result;
  }

  getDependenciesForTarget(targetField: string): FieldDependency[] {
    return this.dependencies.filter(d => d.targetField === targetField);
  }
}

// Usage
const graph = new DependencyGraph();
graph.addDependency({ fieldId: 'country', targetField: 'city', effect: 'setOptions', condition: { op: 'ne', field: 'country', value: null } });
graph.addDependency({ fieldId: 'city', targetField: 'district', effect: 'setOptions', condition: { op: 'ne', field: 'city', value: null } });

console.log(graph.getDownstream('country')); // ['city', 'district']
```

---

## 参考资源

### 权威英文资源 (Authoritative English Sources)

- [React Hook Form](https://react-hook-form.com/) — 高性能表单库
- [Formily](https://formilyjs.org/) — 阿里开源表单方案
- [JSON Schema](https://json-schema.org/) — 表单 Schema 标准化
- [JSON Schema Validation Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-validation.html) — 官方校验规范
- [W3C HTML Forms Specification](https://html.spec.whatwg.org/multipage/forms.html) — HTML 表单标准
- [Mozilla MDN: Form Data Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation) — 浏览器原生校验权威指南
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms) — Google 官方响应式表单架构
- [Fluent UI React Form Controls](https://react.fluentui.dev/?path=/docs/components-form--docs) — Microsoft 企业级表单组件模式
- [IBM Carbon Design System: Forms](https://carbondesignsystem.com/components/form/usage/) — 企业表单设计系统最佳实践
- [Microsoft FAST: FormAssociated Components](https://www.fast.design/docs/components/form-associated/) — W3C 标准表单关联组件实现
