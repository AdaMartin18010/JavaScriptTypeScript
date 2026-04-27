---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 数据验证库生态

> 本文档梳理主流 JavaScript/TypeScript 数据验证库，数据参考自 GitHub Stars、npm 下载量及社区活跃度

---

## 📊 整体概览

| 库 | Stars | 分类 | 包体积 | TS支持 |
|------|-------|------|--------|--------|
| zod | 36k+ | TS-first Schema | ~12KB | ✅ 原生TS |
| yup | 23k+ | JS/TS 验证 | ~15KB | ✅ 官方支持 |
| validator.js | 23k+ | 专用验证 | ~25KB | ✅ 社区定义 |
| joi | 20k+ | JS/TS 验证 | ~70KB | ⚠️ 社区定义 |
| ajv | 12k+ | JSON Schema | ~25KB | ✅ 官方支持 |
| class-validator | 11k+ | 装饰器验证 | ~35KB | ✅ 原生TS |
| effect | 8k+ | TS-first Schema | ~50KB | ✅ 原生TS |
| superstruct | 8k+ | JS/TS 验证 | ~8KB | ✅ 官方支持 |
| libphonenumber-js | 8k+ | 专用验证 | ~45KB | ✅ 官方支持 |
| io-ts | 7k+ | JS/TS 验证 | ~35KB | ✅ 原生TS |
| valibot | 6k+ | TS-first Schema | **<1KB** tree-shaken | ✅ 原生TS |
| arktype | 5k+ | TS-first Schema | ~15KB | ✅ 原生TS |

---

## 1. TypeScript 优先 (Schema-First)

这些库专为 TypeScript 设计，从 Schema 自动推导类型，实现 "单源真相"。

### 1.1 Zod

| 属性 | 详情 |
|------|------|
| **名称** | Zod |
| **Stars** | ⭐ 34,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型推导完美 |
| **GitHub** | [colinhacks/zod](https://github.com/colinhacks/zod) |
| **官网** | [zod.dev](https://zod.dev) |
| **安装** | `npm install zod` |

**一句话描述**：TypeScript-first 的 Schema 验证库，以开发者体验为核心，实现类型与验证的完全统一。

**核心特点**：

- 🔥 **类型推导**：从 Schema 自动推导 TypeScript 类型
- 🎯 **零依赖**：轻量纯净，无外部依赖
- 🔗 **链式 API**：直观流畅的 API 设计
- 🧩 **可组合**：Schema 可组合、可复用
- 🌲 **树摇友好**：支持按需导入
- 📦 **生态丰富**：支持 React Hook Form、tRPC、Fastify 等

**适用场景**：

- TypeScript 项目的运行时类型安全
- API 输入/输出验证
- 表单验证（配合 React Hook Form）
- 配置与环境变量验证

**代码示例**：

```typescript
import { z } from 'zod';

// 基础 Schema
const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().min(0).max(150).optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  tags: z.array(z.string()).max(10),
});

// 类型推导
type User = z.infer<typeof UserSchema>;
// 等价于：
// type User = {
//   id: number;
//   email: string;
//   name: string;
//   age?: number;
//   role: 'admin' | 'user' | 'guest';
//   tags: string[];
// }

// 验证数据
const result = UserSchema.safeParse({
  id: 1,
  email: 'user@example.com',
  name: '张三',
  tags: ['vip', 'active']
});

if (result.success) {
  console.log(result.data); // 类型安全的数据
} else {
  console.error(result.error.format());
}

// 同步验证（会抛出异常）
try {
  const user = UserSchema.parse({ /* ... */ });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(err.issues);
  }
}

// 异步验证
const AsyncUserSchema = z.object({
  email: z.string().email(),
  // 异步自定义验证
  username: z.string().refine(async (val) => {
    return await checkUsernameAvailable(val);
  }, { message: '用户名已被占用' })
});

const result2 = await AsyncUserSchema.safeParseAsync(data);

// 高级：transform 和 preprocess
const DateSchema = z.preprocess(
  (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
  z.date()
);
```

---

### 1.2 Valibot

| 属性 | 详情 |
|------|------|
| **名称** | Valibot |
| **Stars** | ⭐ 6,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [fabian-hiller/valibot](https://github.com/fabian-hiller/valibot) |
| **官网** | [valibot.dev](https://valibot.dev) |
| **安装** | `npm install valibot` |

**一句话描述**：Zod 的轻量级替代方案，模块化设计实现极致的 tree-shaking，核心仅 **<1KB**（tree-shaken），边缘计算环境首选。

**核心特点**：

- 🪶 **极致轻量**：核心功能仅 ~2KB，tree-shaken 后 **<1KB**
- 🧩 **模块化 API**：每个验证器独立导入，零冗余
- 🎯 **类型安全**：完整的类型推导支持
- 🔌 **生态兼容**：与 Zod API 高度相似，迁移成本低
- ⚡ **边缘环境首选**：Cloudflare Workers、Vercel Edge 友好
- 📦 **2025-2026 状态**：API 已稳定，社区持续活跃，作为 Zod 轻量替代被广泛采用

**适用场景**：

- 对包体积极敏感的项目（边缘计算、Serverless）
- 移动端/低带宽环境
- 需要极致 tree-shaking 的应用
- Zod 用户想要更小体积
- **Cloudflare Workers / Vercel Edge 等边缘运行时**

**代码示例**：

```typescript
import * as v from 'valibot';

// 基础 Schema - 模块化导入每个验证器
const UserSchema = v.object({
  id: v.pipe(v.number(), v.integer(), v.minValue(1)),
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
  age: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(150))),
  role: v.optional(v.picklist(['admin', 'user', 'guest']), 'user'),
});

// 类型推导
type User = v.InferOutput<typeof UserSchema>;

// 验证
const result = v.safeParse(UserSchema, {
  id: 1,
  email: 'user@example.com',
  name: '张三'
});

if (result.success) {
  console.log(result.output);
} else {
  console.error(result.issues);
}

// 管道组合验证器（pipe API）
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8),
  v.maxLength(100),
  v.regex(/[A-Z]/, '需要包含大写字母'),
  v.regex(/[0-9]/, '需要包含数字')
);

// 转换值
const StringToDateSchema = v.pipe(
  v.string(),
  v.transform((val) => new Date(val)),
  v.date()
);

// 自定义验证器
const schema = v.pipe(
  v.string(),
  v.check((val) => val.includes('@'), '必须包含 @ 符号')
);
```

---

### 1.3 ArkType

| 属性 | 详情 |
|------|------|
| **名称** | ArkType |
| **Stars** | ⭐ 5,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型即验证器 |
| **GitHub** | [arktypeio/arktype](https://github.com/arktypeio/arktype) |
| **官网** | [arktype.io](https://arktype.io) |
| **安装** | `npm install arktype` |

**一句话描述**：1ms 冷启动的类型验证库，使用 TypeScript 类型语法直接定义 Schema，实现真正的类型即代码。

**核心特点**：

- ⚡ **极速**：1ms 冷启动，毫秒级编译
- 📝 **类型语法**：使用 TS 类型语法定义 Schema
- 🎯 **类型即验证器**：`type` 关键字直接定义验证规则
- 🔗 **深度类型推断**：100% 类型安全
- 🧪 **自定义错误**：强大的错误消息定制

**适用场景**：

- 追求极致性能的项目
- 希望减少样板代码的团队
- 需要快速启动的 Serverless 环境
- 类型优先的架构设计

**代码示例**：

```typescript
import { type } from 'arktype';

// 使用 TypeScript 类型语法定义 Schema
const User = type({
  id: 'number',
  email: 'email',  // 内置 email 验证
  name: 'string>2', // 字符串长度大于2
  age: 'number|undefined', // 可选数字
  role: "'admin'|'user'|'guest'", // 字面量联合类型
  tags: 'string[]<10' // 最多10个元素的字符串数组
});

// 类型推导 - 与验证器同步
type User = typeof User.infer;

// 验证
const user = User({
  id: 1,
  email: 'user@example.com',
  name: '张三',
  tags: ['vip']
});

if (user instanceof type.errors) {
  console.log(user.summary);
} else {
  console.log(user); // 类型安全
}

// 复杂的类型表达式
const AdvancedUser = type({
  // 嵌套对象
  profile: {
    firstName: 'string',
    lastName: 'string',
    fullName: 'string' // 可通过配置字段
  },
  // 数组约束
  scores: 'number[]>=0<=100',
  // 可选 + 默认值
  status: "'active'|'inactive'" | 'default:active',
  // 联合类型
  contact: 'email|phone',
  // 元组
  coords: '[number, number]'
});

// 自定义验证与错误
const StrongPassword = type(
  'string',
  's => s.length >= 8',
  '密码长度至少8位'
);
```

---

### 1.4 Effect

| 属性 | 详情 |
|------|------|
| **名称** | Effect |
| **Stars** | ⭐ 8,000+ (effect-ts/effect) |
| **TS支持** | ✅ 原生 TypeScript，函数式编程 |
| **GitHub** | [Effect-TS/effect](https://github.com/Effect-TS/effect) |
| **官网** | [effect.website](https://effect.website) |
| **安装** | `npm install effect` |

**一句话描述**：完整的函数式编程生态系统，包含强大的 Schema 模块，适用于复杂的企业级类型安全需求。

**核心特点**：

- 🏗️ **完整生态**：不仅仅是验证，包含完整的函数式编程工具
- 🎯 **函数式编程**：基于 Effect 模式，处理副作用
- 🔒 **类型安全**：最严格的类型推导
- 🧩 **可组合**：Schema、Effect、Stream 等模块协同工作
- 📊 **可观测**：内置日志、指标、追踪支持

**适用场景**：

- 复杂的企业级应用
- 需要处理复杂副作用的场景
- 函数式编程团队
- 需要高可靠性的系统

**代码示例**：

```typescript
import { Schema } from 'effect';
import { Effect } from 'effect';

// 基础 Schema
const UserId = Schema.Number.pipe(Schema.int(), Schema.positive());

const User = Schema.Struct({
  id: UserId,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  name: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(50)),
  age: Schema.optionalWith(Schema.Number.pipe(Schema.between(0, 150)), {
    default: () => 0
  }),
  role: Schema.Literal('admin', 'user', 'guest').pipe(
    Schema.withConstructorDefault(() => 'user')
  )
});

// 类型推导
type User = typeof User.Type;

// 解码（验证并转换）
const decodeUser = Schema.decodeUnknownSync(User);

try {
  const user = decodeUser({
    id: 1,
    email: 'user@example.com',
    name: '张三'
  });
  console.log(user);
} catch (error) {
  console.error('验证失败:', error);
}

// 使用 Effect 处理验证（函数式风格）
const validateUser = (input: unknown) =>
  Schema.decodeUnknown(User)(input).pipe(
    Effect.map((user) => ({
      ...user,
      displayName: `${user.name} (${user.role})`
    })),
    Effect.catchAll((error) =>
      Effect.fail({ type: 'ValidationError', error })
    )
  );

// 运行 Effect
const program = Effect.runPromise(validateUser(data));

// 复杂 Schema 组合
const Address = Schema.Struct({
  street: Schema.String,
  city: Schema.String,
  country: Schema.String
});

const UserWithAddress = Schema.extend(User, Schema.Struct({
  addresses: Schema.Array(Address)
}));

// 带品牌类型的安全 ID
const UserId = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.brand('UserId')
);
// UserId 类型不能与普通 number 混淆
```

---

## 2. JavaScript/TypeScript 验证库

这些库同时支持 JavaScript 和 TypeScript，提供灵活的验证方案。

### 2.1 Yup

| 属性 | 详情 |
|------|------|
| **名称** | Yup |
| **Stars** | ⭐ 23,000+ |
| **TS支持** | ✅ 官方 TypeScript 支持 |
| **GitHub** | [jquense/yup](https://github.com/jquense/yup) |
| **安装** | `npm install yup` |

**一句话描述**：受 Joi 启发的 JavaScript 对象 Schema 验证器，API 简洁直观，特别适合表单验证场景。

**核心特点**：

- 🎯 **直观的 API**：类似 Joi 但更简单
- 📝 **内嵌条件验证**：支持复杂的条件逻辑
- 🔧 **自定义验证**：易于扩展
- 📱 **表单友好**：与 Formik、React Hook Form 配合良好
- 🌐 **i18n 支持**：内置错误消息国际化

**适用场景**：

- React/Vue 表单验证
- API 请求体验证
- 需要复杂条件验证的场景
- 从 Joi 迁移的项目

**代码示例**：

```typescript
import * as yup from 'yup';

// 基础 Schema
const userSchema = yup.object({
  id: yup.number().integer().positive().required(),
  email: yup.string().email('请输入有效邮箱').required(),
  name: yup.string().min(2, '名称至少2个字符').max(50).required(),
  age: yup.number().min(0).max(150).nullable(),
  role: yup.string().oneOf(['admin', 'user', 'guest']).default('user'),
  tags: yup.array().of(yup.string()).max(10)
});

// 类型推导需要 @types/yup 或 yup 内置类型
type User = yup.InferType<typeof userSchema>;

// 验证
async function validateUser(data: unknown) {
  try {
    const user = await userSchema.validate(data, {
      abortEarly: false, // 返回所有错误
      stripUnknown: true // 删除未知字段
    });
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { success: false, errors: error.errors };
    }
    throw error;
  }
}

// 条件验证
const conditionalSchema = yup.object({
  isCompany: yup.boolean().required(),
  companyName: yup.string().when('isCompany', {
    is: true,
    then: (schema) => schema.required('公司名必填'),
    otherwise: (schema) => schema.notRequired()
  })
});

// 自定义验证方法
yup.addMethod(yup.string, 'phone', function (message = '无效的手机号') {
  return this.matches(/^1[3-9]\d{9}$/, message);
});

// 嵌套对象验证
const addressSchema = yup.object({
  street: yup.string().required(),
  city: yup.string().required()
});

const fullUserSchema = userSchema.shape({
  address: addressSchema.required()
});

// 数组验证
const usersSchema = yup.array().of(userSchema).min(1).required();
```

---

### 2.2 Joi

| 属性 | 详情 |
|------|------|
| **名称** | Joi |
| **Stars** | ⭐ 20,000+ |
| **TS支持** | ⚠️ 社区定义 (@types/joi) |
| **GitHub** | [hapijs/joi](https://github.com/hapijs/joi) |
| **官网** | [joi.dev](https://joi.dev) |
| **安装** | `npm install joi` |

**一句话描述**：hapi.js 框架出品的强大数据验证库，API 丰富成熟，是 Node.js 生态中最经典的验证方案之一。

**核心特点**：

- 🏗️ **功能丰富**：最完整的验证 API
- 🧩 **链式 API**：清晰流畅的方法链
- 🔧 **高度可扩展**：自定义规则、类型、错误
- 📝 **引用验证**：支持字段间引用验证
- 🌐 **成熟稳定**：多年生产环境验证

**适用场景**：

- Node.js 后端 API 验证
- hapi.js / Express / Fastify 项目
- 需要复杂验证逻辑的系统
- 已有 Joi  Schema 的大型项目

**代码示例**：

```typescript
import Joi from 'joi';

// 基础 Schema
const userSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(0).max(150),
  role: Joi.string().valid('admin', 'user', 'guest').default('user'),
  tags: Joi.array().items(Joi.string()).max(10),
  metadata: Joi.object().pattern(Joi.string(), Joi.any()) // 动态键
});

// 验证
const { error, value } = userSchema.validate({
  id: 1,
  email: 'user@example.com',
  name: '张三',
  tags: ['vip']
}, {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true
});

if (error) {
  console.error(error.details);
} else {
  console.log(value);
}

// 异步验证（用于数据库查询等）
const asyncSchema = Joi.object({
  username: Joi.string().external(async (value) => {
    const exists = await checkUsernameExists(value);
    if (exists) {
      throw new Error('用户名已存在');
    }
  })
});

await asyncSchema.validateAsync(data);

// 复杂条件验证
const conditionalSchema = Joi.object({
  type: Joi.string().valid('personal', 'company').required(),
  // 条件字段
  companyName: Joi.when('type', {
    is: 'company',
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  // 交叉引用
  password: Joi.string().required(),
  confirmPassword: Joi.ref('password')
}).with('password', 'confirmPassword'); // 要求同时存在

// 自定义验证规则
const customSchema = Joi.extend((joi) => ({
  type: 'mobile',
  base: joi.string(),
  messages: {
    'mobile.base': '不是有效的手机号'
  },
  validate(value, helpers) {
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return { value, errors: helpers.error('mobile.base') };
    }
  }
}));

// 数组和对象验证
const schema = Joi.object({
  users: Joi.array().items(userSchema).unique('email'), // email 唯一
  config: Joi.object().keys({
    debug: Joi.boolean().default(false),
    port: Joi.number().port().default(3000)
  })
});
```

---

### 2.3 Superstruct

| 属性 | 详情 |
|------|------|
| **名称** | Superstruct |
| **Stars** | ⭐ 8,000+ |
| **TS支持** | ✅ 官方 TypeScript 支持 |
| **GitHub** | [ianstormtaylor/superstruct](https://github.com/ianstormtaylor/superstruct) |
| **安装** | `npm install superstruct` |

**一句话描述**：用纯 JavaScript/TypeScript 编写、可组合的结构验证库，专注于可组合的验证逻辑。

**核心特点**：

- 🧩 **可组合**：Struct 可像函数一样组合
- 📝 **清晰错误**：详细的错误路径信息
- 🔧 **可定制**：易于创建自定义类型
- 🪶 **轻量**：核心小巧，无依赖
- 🎯 **类型推导**：完整的 TypeScript 支持

**适用场景**：

- 需要可组合验证逻辑的项目
- 自定义验证需求较多的场景
- 追求清晰错误信息的应用
- 轻量级验证需求

**代码示例**：

```typescript
import {
  object, string, number, array, optional,
  union, literal, boolean, assert, create, is
} from 'superstruct';

// 基础 Struct
const User = object({
  id: number(),
  email: string(),
  name: string(),
  age: optional(number()),
  role: union([literal('admin'), literal('user'), literal('guest')]),
  isActive: optional(boolean(), true) // 带默认值
});

// 类型推导
type User = Infer<typeof User>;

// 验证方式1：assert（失败抛出）
try {
  assert(data, User);
  // data 现在被收窄为 User 类型
} catch (error) {
  console.error(error.message);
  console.error(error.path); // 错误路径
}

// 验证方式2：create（返回验证后的数据）
const user = create({
  id: 1,
  email: 'user@example.com',
  name: '张三',
  role: 'user'
}, User);

// 验证方式3：is（返回布尔值）
if (is(data, User)) {
  // TypeScript 知道 data 是 User 类型
  console.log(data.email);
}

// 自定义 Struct
import { define, refine } from 'superstruct';

// 邮箱验证
const Email = define<string>('Email', (value) => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

// 带约束的字符串
const Password = refine(string(), 'Password', (value) => {
  return value.length >= 8;
});

// 组合使用
const UserWithEmail = object({
  ...User.schema,
  email: Email,
  password: Password
});

// 动态 Struct
const VersionedStruct = (version: number) => {
  if (version === 1) {
    return object({ name: string() });
  }
  return object({ name: string(), email: string() });
};
```

---

### 2.4 Ajv

| 属性 | 详情 |
|------|------|
| **名称** | Ajv (Another JSON Schema Validator) |
| **Stars** | ⭐ 12,000+ |
| **TS支持** | ✅ 官方 TypeScript 支持 |
| **GitHub** | [ajv-validator/ajv](https://github.com/ajv-validator/ajv) |
| **官网** | [ajv.js.org](https://ajv.js.org) |
| **安装** | `npm install ajv` |

**一句话描述**：最快的 JSON Schema 验证器，支持 JSON Schema Draft-07/2019-09/2020-12 标准，适合需要标准兼容的场景。

**核心特点**：

- ⚡ **极速**：最快的 JSON Schema 验证器
- 📋 **标准兼容**：支持 JSON Schema 标准
- 🔧 **可扩展**：丰富的插件生态
- 📝 **JTD 支持**：JSON Type Definition 支持
- 🎨 **代码生成**：编译 Schema 为高效验证函数

**适用场景**：

- 需要 JSON Schema 标准兼容的项目
- OpenAPI/Swagger 规范验证
- 配置验证
- 高性能要求的场景
- 已有 JSON Schema 定义的系统

**代码示例**：

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true,      // 返回所有错误
  strict: false,        // 严格模式
  coerceTypes: true     // 类型强制转换
});
addFormats(ajv); // 添加 format 支持

// JSON Schema 定义
const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    email: { type: 'string', format: 'email' },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150
    },
    role: {
      type: 'string',
      enum: ['admin', 'user', 'guest'],
      default: 'user'
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 10
    }
  },
  required: ['id', 'email', 'name'],
  additionalProperties: false
};

// 编译 Schema（推荐，提升性能）
const validate = ajv.compile(userSchema);

// 验证
const valid = validate({
  id: 1,
  email: 'user@example.com',
  name: '张三'
});

if (valid) {
  console.log('验证通过');
} else {
  console.error(validate.errors);
  // [{ instancePath: '/email', message: 'must match format "email"', ... }]
}

// 使用 JTD (JSON Type Definition)
import AjvJTD from 'ajv/dist/jtd';

const ajvJTD = new AjvJTD();

const userJTDSchema = {
  properties: {
    id: { type: 'int32' },
    email: { type: 'string' },
    name: { type: 'string' }
  },
  optionalProperties: {
    age: { type: 'int32' }
  }
} as const;

const parse = ajvJTD.compileParser(userJTDSchema);
const user = parse('{"id":1,"email":"a@b.com","name":"张三"}');

// 自定义关键字
ajv.addKeyword({
  keyword: 'phone',
  validate: (schema: any, data: string) => {
    return /^1[3-9]\d{9}$/.test(data);
  },
  errors: true
});

// TypeScript 类型从 Schema 生成（需单独工具）
// 推荐：json-schema-to-typescript
```

---

### 2.5 class-validator

| 属性 | 详情 |
|------|------|
| **名称** | class-validator |
| **Stars** | ⭐ 11,000+ |
| **TS支持** | ✅ 原生 TypeScript，装饰器驱动 |
| **GitHub** | [typestack/class-validator](https://github.com/typestack/class-validator) |
| **安装** | `npm install class-validator class-transformer reflect-metadata` |

**一句话描述**：基于装饰器的类属性验证库，与 TypeORM、NestJS 完美集成，采用面向对象的验证风格。

**核心特点**：

- 🎨 **装饰器驱动**：使用装饰器声明验证规则
- 🏗️ **面向对象**：基于类的验证模型
- 🔗 **生态集成**：与 NestJS、TypeORM 深度集成
- 📝 **内置规则丰富**：大量常用验证器
- 🧩 **自定义验证器**：易于扩展

**适用场景**：

- NestJS 项目（官方推荐）
- TypeORM 实体验证
- 面向对象风格的代码库
- 需要装饰器语法的项目

**代码示例**：

```typescript
import 'reflect-metadata';
import {
  IsInt, IsEmail, IsString, MinLength, MaxLength,
  IsOptional, IsEnum, ValidateNested, ArrayMaxSize,
  validate, validateOrReject, ValidationError
} from 'class-validator';
import { Type, plainToClass } from 'class-transformer';

// 定义验证类
class CreateUserDto {
  @IsInt({ message: 'ID 必须是整数' })
  @MinLength(1, { message: 'ID 必须为正数' })
  id!: number;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @MinLength(2, { message: '名称至少2个字符' })
  @MaxLength(50, { message: '名称最多50个字符' })
  name!: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(['admin', 'user', 'guest'])
  role: string = 'user';

  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];
}

// 嵌套对象验证
class Address {
  @IsString()
  street!: string;

  @IsString()
  city!: string;
}

class UserWithAddress extends CreateUserDto {
  @ValidateNested()
  @Type(() => Address) // class-transformer 需要
  address!: Address;
}

// 验证函数
async function validateUser(data: unknown): Promise<void> {
  // 转换为类实例
  const user = plainToClass(CreateUserDto, data);

  // 验证
  const errors: ValidationError[] = await validate(user);

  if (errors.length > 0) {
    // 格式化错误
    const formatted = errors.map(err => ({
      property: err.property,
      constraints: err.constraints
    }));
    console.error(formatted);
    throw new Error('验证失败');
  }

  // 或使用 validateOrReject 直接抛出
  await validateOrReject(user);
}

// 自定义验证器
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
class IsUsernameUniqueConstraint implements ValidatorConstraintInterface {
  async validate(username: string): Promise<boolean> {
    return await checkUsernameAvailable(username);
  }

  defaultMessage(): string {
    return '用户名 $value 已被占用';
  }
}

// 使用自定义验证器
class User {
  @Validate(IsUsernameUniqueConstraint)
  username!: string;
}

// 验证组
class Product {
  @IsString({ groups: ['create', 'update'] })
  name!: string;

  @IsInt({ groups: ['create'] }) // 仅创建时验证
  id!: number;
}

await validate(product, { groups: ['create'] });
```

---

### 2.6 io-ts

| 属性 | 详情 |
|------|------|
| **名称** | io-ts |
| **Stars** | ⭐ 7,000+ |
| **TS支持** | ✅ 原生 TypeScript，函数式风格 |
| **GitHub** | [gcanti/io-ts](https://github.com/gcanti/io-ts) |
| **安装** | `npm install io-ts fp-ts` |

**一句话描述**：基于 fp-ts 的运行时类型验证库，采用函数式编程范式，与 fp-ts 生态无缝集成。

**核心特点**：

- 🎯 **类型即代码**：Codec 同时定义类型和验证
- 🔗 **fp-ts 集成**：完整的函数式编程支持
- 📝 **精确错误**：详细的验证错误路径
- 🧩 **可组合**：Codec 可自由组合
- 🎨 **自定义 Codec**：易于创建新类型

**适用场景**：

- 函数式编程项目
- 已使用 fp-ts 的代码库
- 需要精确错误处理的系统
- 类型驱动的开发

**代码示例**：

```typescript
import * as t from 'io-ts';
import { isRight, isLeft, fold } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// 基础 Codec（同时是类型定义和验证器）
const User = t.type({
  id: t.Int,
  email: t.string,
  name: t.string,
  age: t.union([t.number, t.undefined]),
  role: t.keyof({ admin: null, user: null, guest: null })
});

// 类型推导
type User = t.TypeOf<typeof User>;
// 等价于：
// type User = {
//   id: number;
//   email: string;
//   name: string;
//   age: number | undefined;
//   role: 'admin' | 'user' | 'guest';
// }

// 验证（返回 Either 类型）
const result = User.decode({
  id: 1,
  email: 'user@example.com',
  name: '张三',
  role: 'user'
});

// 处理结果（函数式风格）
if (isRight(result)) {
  console.log('验证通过:', result.right);
} else {
  // 格式化错误
  const errors = PathReporter.report(result);
  console.error(errors);
}

// 使用 pipe 处理（推荐）
pipe(
  User.decode(data),
  fold(
    (errors) => console.error('失败:', PathReporter.report(errors)),
    (user) => console.log('成功:', user)
  )
);

// 部分类型（允许额外字段）
const PartialUser = t.partial({
  bio: t.string,
  website: t.string
});

// 交集类型（组合）
const CompleteUser = t.intersection([User, PartialUser]);

// 数组
const Users = t.array(User);

// 自定义 Codec
const Email = new t.Type<string, string, unknown>(
  'Email',
  (input): input is string => typeof input === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input),
  (input, context) =>
    typeof input === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
      ? t.success(input)
      : t.failure(input, context, '无效邮箱格式'),
  t.identity
);

// 使用自定义 Codec
const UserWithEmail = t.type({
  ...User.props,
  email: Email
});

// 带默认值的解码
import { withDefault } from 'io-ts-types/lib/withDefault';

const UserWithDefaults = t.type({
  name: t.string,
  role: withDefault(t.string, 'user')
});
```

---

## 3. 专用验证库

针对特定数据类型的专用验证库。

### 3.1 validator.js

| 属性 | 详情 |
|------|------|
| **名称** | validator.js |
| **Stars** | ⭐ 23,000+ |
| **TS支持** | ✅ 社区定义 (@types/validator) |
| **GitHub** | [validatorjs/validator.js](https://github.com/validatorjs/validator.js) |
| **官网** | [github.com/validatorjs/validator.js](https://github.com/validatorjs/validator.js) |
| **安装** | `npm install validator` |

**一句话描述**：最全面的字符串验证和清理库，提供数十种常用验证函数，专注于字符串处理。

**核心特点**：

- 📚 **验证器丰富**：50+ 种验证函数
- 🧹 **清理功能**：字符串清理和规范化
- 🌍 **国际化**：支持多种地区的验证规则
- 🪶 **模块化**：支持按需导入
- ⚡ **性能优异**：经过优化的实现

**适用场景**：

- 表单字段验证
- 数据清理和规范化
- 用户输入验证
- 需要大量字符串验证的场景

**代码示例**：

```typescript
import validator from 'validator';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

// 基础验证
validator.isEmail('test@example.com'); // true
validator.isURL('https://example.com'); // true
validator.isUUID('550e8400-e29b-41d4-a716-446655440000'); // true

// 按需导入（tree-shaking 友好）
isEmail('test@example.com'); // true
isMobilePhone('13800138000', 'zh-CN'); // true

// 常用验证器
const validations = {
  // 字符串长度
  isLength: validator.isLength('hello', { min: 2, max: 10 }),

  // 数字
  isNumeric: validator.isNumeric('12345'),
  isInt: validator.isInt('42', { min: 0, max: 100 }),
  isFloat: validator.isFloat('3.14'),

  // 日期时间
  isDate: validator.isDate('2024-01-15'),
  isISO8601: validator.isISO8601('2024-01-15T10:30:00Z'),

  // 网络相关
  isURL: validator.isURL('https://example.com', {
    protocols: ['https'],
    require_tld: true
  }),
  isIP: validator.isIP('192.168.1.1', 4),
  isPort: validator.isPort('8080'),

  // 身份信息
  isCreditCard: validator.isCreditCard('4111111111111111'),
  isIdentityCard: validator.isIdentityCard('110101199003077513', 'zh-CN'),

  // 格式验证
  isJSON: validator.isJSON('{"key":"value"}'),
  isBase64: validator.isBase64('SGVsbG8gV29ybGQ='),
  isHexColor: validator.isHexColor('#FF5733'),
  isMD5: validator.isMD5('5d41402abc4b2a76b9719d911017c592'),
  isJWT: validator.isJWT('eyJhbGciOiJIUzI1NiIs...'),

  // 布尔值
  isBoolean: validator.isBoolean('true'),

  // 空白检查
  isEmpty: validator.isEmpty('', { ignore_whitespace: true })
};

// 字符串清理
const sanitized = {
  // 去除 HTML
  stripLow: validator.stripLow('Hello\x00World'),

  // 转义 HTML
  escape: validator.escape('<script>alert("xss")</script>'),

  // 去除多余空格
  trim: validator.trim('  hello  '),

  // 规范化换行
  normalizeEmail: validator.normalizeEmail('Test.User+tag@Example.com'),
  // 输出: testuser@example.com

  // 黑名单/白名单
  blacklist: validator.blacklist('hello world', ' '), // 'helloworld'
  whitelist: validator.whitelist('hello123', 'a-z'), // 'hello'

  // 数字处理
  toInt: validator.toInt('42.9'), // 42
  toFloat: validator.toFloat('42.9'), // 42.9
  toBoolean: validator.toBoolean('yes'), // true

  // 日期处理
  toDate: validator.toDate('2024-01-15'), // Date 对象

  // 字符串处理
  toUpperCase: validator.toUpperCase('hello'), // 'HELLO'
  toLowerCase: validator.toLowerCase('HELLO'), // 'hello'
};

// 自定义验证（使用 matches）
const isChineseName = (name: string) => {
  return validator.matches(name, /^[\u4e00-\u9fa5]{2,8}$/);
};

// 组合验证函数
const validateUserInput = (input: {
  email: string;
  phone: string;
  website?: string;
}) => {
  const errors: string[] = [];

  if (!isEmail(input.email)) {
    errors.push('邮箱格式不正确');
  }

  if (!isMobilePhone(input.phone, 'zh-CN')) {
    errors.push('手机号格式不正确');
  }

  if (input.website && !validator.isURL(input.website)) {
    errors.push('网站地址格式不正确');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
};
```

---

### 3.2 libphonenumber-js

| 属性 | 详情 |
|------|------|
| **名称** | libphonenumber-js |
| **Stars** | ⭐ 8,000+ |
| **TS支持** | ✅ 官方 TypeScript 支持 |
| **GitHub** | [catamphetamine/libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) |
| **安装** | `npm install libphonenumber-js` |

**一句话描述**：Google libphonenumber 的轻量级 JavaScript 端口，专注于电话号码解析、格式化和验证。

**核心特点**：

- 🌍 **国际标准**：基于 Google libphonenumber
- 📦 **轻量**：核心版本仅 ~45KB（对比原版 500KB+）
- 🎯 **高精度**：准确的号码解析和验证
- 📱 **格式化**：自动格式化为国际/本地格式
- 🔍 **运营商检测**：可识别运营商信息

**适用场景**：

- 用户注册手机号验证
- 国际化应用的电话处理
- 通讯录应用
- 需要格式化显示手机号的项目

**代码示例**：

```typescript
import {
  parsePhoneNumber,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  getExampleNumber,
  getCountries,
  getCountryCallingCode,
  AsYouType
} from 'libphonenumber-js';

// 基础验证
isValidPhoneNumber('+8613800138000'); // true
isValidPhoneNumber('+1 415 555 2671', 'US'); // true
isValidPhoneNumber('13800138000', 'CN'); // true

// 解析电话号码
const phoneNumber = parsePhoneNumberFromString('+8613800138000');
if (phoneNumber) {
  console.log(phoneNumber.country); // 'CN'
  console.log(phoneNumber.countryCallingCode); // '86'
  console.log(phoneNumber.nationalNumber); // '13800138000'
  console.log(phoneNumber.number); // '+86138001380000'

  // 格式化输出
  console.log(phoneNumber.format('E.164')); // '+8613800138000'
  console.log(phoneNumber.format('INTERNATIONAL')); // '+86 138 0013 8000'
  console.log(phoneNumber.format('NATIONAL')); // '138 0013 8000'
  console.log(phoneNumber.formatRFC396()); // 'tel:+86-138-0013-8000'

  // 类型检测
  console.log(phoneNumber.getType()); // 'MOBILE'
}

// 解析带默认国家的号码
try {
  const number = parsePhoneNumber('13800138000', 'CN');
  console.log(number.formatInternational()); // +86 138 0013 8000
} catch (error) {
  console.error('无效号码');
}

// 实时格式化（输入时）
const asYouType = new AsYouType('CN');
console.log(asYouType.input('1')); // '1'
console.log(asYouType.input('3')); // '13'
console.log(asYouType.input('8')); // '138'
console.log(asYouType.input('0')); // '138 0'
console.log(asYouType.input('0')); // '138 00'
console.log(asYouType.input('1')); // '138 001'
console.log(asYouType.input('3')); // '138 0013'

// 获取示例号码
const exampleCN = getExampleNumber('CN', ['mobile']);
console.log(exampleCN?.formatNational()); // '138 0013 8000'

// 获取所有支持的国家
const countries = getCountries(); // ['AC', 'AD', 'AE', ...]

// 获取国家拨号代码
console.log(getCountryCallingCode('CN')); // '86'
console.log(getCountryCallingCode('US')); // '1'

// 批量验证和格式化
function validateAndFormatPhone(
  phone: string,
  country: string
): { valid: boolean; formatted?: string; error?: string } {
  try {
    const parsed = parsePhoneNumber(phone, country);

    if (!parsed || !parsed.isValid()) {
      return { valid: false, error: '无效的电话号码' };
    }

    return {
      valid: true,
      formatted: parsed.formatInternational()
    };
  } catch (err) {
    return { valid: false, error: '解析失败' };
  }
}

// 自定义验证组件（React 示例）
interface PhoneInputProps {
  country: string;
  value: string;
  onChange: (value: string, isValid: boolean) => void;
}

function validatePhone(value: string, country: string): boolean {
  try {
    const parsed = parsePhoneNumber(value, country);
    return parsed?.isValid() ?? false;
  } catch {
    return false;
  }
}

// 按需导入（最小体积）
import parsePhoneNumber from 'libphonenumber-js/min'; // 最小版本
import parsePhoneNumberMobile from 'libphonenumber-js/mobile'; // 仅移动端
```

---

## 📈 选择建议

| 需求场景 | 推荐库 | 理由 |
|----------|--------|------|
| **现代 TypeScript 项目** | Zod / Valibot | 类型推导完美，生态丰富 |
| **极致包体积** | Valibot | **<1KB** tree-shaken，边缘环境首选 |
| **极速冷启动** | ArkType | 1ms 编译，类型语法 |
| **函数式编程** | Effect / io-ts | fp-ts 生态，函数式风格 |
| **NestJS/TypeORM** | class-validator | 装饰器风格，深度集成 |
| **JSON Schema 标准** | Ajv | 标准兼容，性能最佳 |
| **Node.js API 验证** | Joi / Zod | 功能丰富，生态成熟 |
| **表单验证** | Zod / Yup / Superstruct | React/Vue 生态支持好 |
| **手机号处理** | libphonenumber-js | 国际标准，格式化完整 |
| **字符串验证** | validator.js | 验证器最全面 |

---

## 🔗 相关资源

- [Zod 官方文档](https://zod.dev)
- [Valibot 官方文档](https://valibot.dev)
- [ArkType 官方文档](https://arktype.io)
- [Effect 官方文档](https://effect.website)
- [JSON Schema 规范](https://json-schema.org)
- [libphonenumber 项目](https://github.com/google/libphonenumber)
