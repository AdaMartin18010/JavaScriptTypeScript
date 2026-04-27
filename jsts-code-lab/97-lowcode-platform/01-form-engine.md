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

## 参考资源

- [React Hook Form](https://react-hook-form.com/) — 高性能表单库
- [Formily](https://formilyjs.org/) — 阿里开源表单方案
- [JSON Schema](https://json-schema.org/) — 表单 Schema 标准化
