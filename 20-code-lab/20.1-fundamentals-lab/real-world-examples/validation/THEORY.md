# 数据验证

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/validation`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决输入数据的有效性校验问题。通过模式匹配、运行时类型检查与错误聚合提升数据质量。

### 1.2 形式化基础

验证可形式化为部分函数 `v: D → D ∪ Error`，其中合法输入映射到自身（恒等），非法输入映射到错误描述。单调性要求：`v(x) = x ⇒ v(y) = y` 对所有 `y ⊑ x`（子结构）成立，确保约束的局部一致性。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 模式匹配 | 数据结构与校验规则的对应 | schema.ts |
| 错误聚合 | 多字段校验结果的统一收集 | error-aggregator.ts |

---

## 二、设计原理

### 2.1 为什么存在

外部输入是应用安全漏洞的主要来源。严格的验证机制在数据进入系统前建立防线，防止非法数据导致的运行时错误和安全风险。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 运行时校验 | 覆盖所有输入 | 运行时开销 | 外部 API 边界 |
| 编译时类型 | 零运行时成本 | 无法验证数据形状 | 内部函数参数 |

### 2.3 与相关技术的对比

| 特性 | Zod | Yup | Valibot | Joi | class-validator |
|------|-----|-----|---------|-----|-----------------|
| 树摇优化 | 良好 | 一般 | 极致 | 一般 | 依赖 reflect-metadata |
|  bundle 体积 | ~12 kB | ~18 kB | ~1 kB | ~28 kB | ~20 kB+ |
| TypeScript 推导 | 原生支持 | 需定义类型 | 原生支持 | 需定义类型 | 装饰器驱动 |
| 错误消息定制 | 灵活 | 灵活 | 灵活 | 灵活 | 中等 |
| 异步校验 | 支持 | 支持 | 支持 | 支持 | 支持 |
| 生态成熟度 | 高 | 高 | 成长中 | 高 | 高 |

与运行时 schema 库对比：编译时类型检查零成本但无法验证外部输入。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 数据验证 核心机制的理解，并观察不同实现选择带来的行为差异。

#### 可运行示例：组合式验证器 + 错误聚合

```typescript
// validator.ts — 零依赖组合式验证框架，可运行 (Node.js / 浏览器)

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

interface ValidationError {
  path: string;
  message: string;
  value: unknown;
}

type Validator<T> = (value: unknown, path?: string) => ValidationResult<T>;

const string: Validator<string> = (v, path = '') =>
  typeof v === 'string'
    ? { success: true, data: v }
    : { success: false, errors: [{ path, message: 'Expected string', value: v }] };

const number: Validator<number> = (v, path = '') =>
  typeof v === 'number' && !Number.isNaN(v)
    ? { success: true, data: v }
    : { success: false, errors: [{ path, message: 'Expected number', value: v }] };

const email: Validator<string> = (v, path = '') => {
  const base = string(v, path);
  if (!base.success) return base;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(base.data)
    ? base
    : { success: false, errors: [{ path, message: 'Invalid email', value: v }] };
};

function minLength(min: number): (v: string) => ValidationResult<string> {
  return (v) =>
    v.length >= min
      ? { success: true, data: v }
      : { success: false, errors: [{ path: '', message: `Min length ${min}`, value: v }] };
}

function pipe<T>(...validators: Validator<T>[]): Validator<T> {
  return (v, path = '') => {
    const errors: ValidationError[] = [];
    let current: unknown = v;
    for (const validator of validators) {
      const result = validator(current, path);
      if (!result.success) {
        errors.push(...result.errors);
        break; // 短路
      }
      current = result.data;
    }
    return errors.length
      ? { success: false, errors }
      : { success: true, data: current as T };
  };
}

function object<T extends Record<string, Validator<any>>>(
  schema: T
): Validator<{ [K in keyof T]: T[K] extends Validator<infer U> ? U : never }> {
  return (v, path = '') => {
    if (typeof v !== 'object' || v === null) {
      return { success: false, errors: [{ path, message: 'Expected object', value: v }] };
    }
    const data = {} as any;
    const errors: ValidationError[] = [];
    for (const [key, validator] of Object.entries(schema)) {
      const result = validator((v as Record<string, unknown>)[key], `${path}${path ? '.' : ''}${key}`);
      if (!result.success) errors.push(...result.errors);
      else data[key] = result.data;
    }
    return errors.length
      ? { success: false, errors }
      : { success: true, data };
  };
}

// ===== 演示 =====
const userSchema = object({
  name: pipe(string, minLength(2)),
  age: number,
  email: email,
});

const valid = userSchema({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
});
console.log('Valid:', valid.success); // true

const invalid = userSchema({
  name: 'A',
  age: 'thirty',
  email: 'not-an-email',
});
if (!invalid.success) {
  console.table(invalid.errors);
  // path        message            value
  // name        Min length 2       A
  // age         Expected number    thirty
  // email       Invalid email      not-an-email
}
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 前端验证可以替代后端 | 前端验证仅提升体验，后端必须独立校验 |
| 类型检查等于运行时验证 | 类型在编译后消失，不能阻止非法输入 |

### 3.3 扩展阅读

- [Zod 文档](https://zod.dev/)
- [Valibot 文档](https://valibot.dev/)
- [JSON Schema Specification](https://json-schema.org/)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- `30-knowledge-base/30.8-data`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
