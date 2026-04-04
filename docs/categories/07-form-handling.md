# 表单处理库

> 本文档梳理主流前端表单处理库，涵盖 React 和 Vue 生态的高性能表单解决方案

---

## 📊 整体概览

| 库 | 框架 | Stars | 趋势 | TS支持 | 包大小 |
|------|------|-------|------|--------|--------|
| react-hook-form | React | 41k+ | ⭐ 最流行 | ✅ 原生 | ~9KB |
| formik | React | 32k+ | ⭐ 经典稳定 | ✅ 官方 | ~15KB |
| vee-validate | Vue | 11k+ | ⭐ Vue生态首选 | ✅ 原生 | ~12KB |
| react-final-form | React | 7k+ | ⭐ 轻量级 | ✅ 官方 | ~5KB |
| @tanstack/form | 通用 | 3k+ | ⭐ 新兴 | ✅ 原生 | ~8KB |
| formkit | Vue | 4k+ | ⭐ 全功能 | ✅ 原生 | ~25KB |

---

## 1. React 表单

### 1.1 react-hook-form

| 属性 | 详情 |
|------|------|
| **名称** | react-hook-form |
| **Stars** | ⭐ 41,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型推断完美 |
| **GitHub** | [react-hook-form/react-hook-form](https://github.com/react-hook-form/react-hook-form) |
| **官网** | [react-hook-form.com](https://react-hook-form.com) |
| **包大小** | ~9KB gzipped |

**一句话描述**：高性能、轻量级的 React 表单库，通过非受控组件和引用注册实现极致性能。

**核心特点**：
- 🚀 **极致性能**：采用非受控组件，减少不必要的重渲染
- 🎯 **简洁 API**：基于 Hooks 的设计，学习曲线平缓
- 🔗 **轻松集成**：与 Yup、Zod、Joi 等校验库无缝配合
- 📱 **React Native 支持**：同时支持 Web 和移动端
- 🧪 **易于测试**：不依赖复杂的状态管理

**适用场景**：
- 需要高性能表单的大型应用
- 复杂表单场景（动态字段、嵌套表单）
- 对包体积敏感的项目
- 需要良好 TypeScript 支持的项目

**代码示例**：

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 定义校验模式
const schema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('请输入有效邮箱'),
  age: z.number().min(18, '必须年满18岁').optional(),
});

type FormData = z.infer<typeof schema>;

function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('username')} placeholder="用户名" />
        {errors.username && <span>{errors.username.message}</span>}
      </div>
      
      <div>
        <input {...register('email')} placeholder="邮箱" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      <div>
        <input type="number" {...register('age', { valueAsNumber: true })} placeholder="年龄" />
        {errors.age && <span>{errors.age.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

**高级用法 - 动态字段**：

```tsx
import { useFieldArray, useForm } from 'react-hook-form';

function DynamicForm() {
  const { control, register } = useForm({
    defaultValues: {
      items: [{ name: '' }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <button type="button" onClick={() => remove(index)}>删除</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '' })}>
        添加项目
      </button>
    </form>
  );
}
```

---

### 1.2 formik

| 属性 | 详情 |
|------|------|
| **名称** | formik |
| **Stars** | ⭐ 32,000+ |
| **TS支持** | ✅ 官方类型定义完善 |
| **GitHub** | [jaredpalmer/formik](https://github.com/jaredpalmer/formik) |
| **官网** | [formik.org](https://formik.org) |
| **包大小** | ~15KB gzipped |

**一句话描述**：React 最流行的表单库之一，提供完整的表单状态管理和校验解决方案。

**核心特点**：
- 📝 **完整表单管理**：处理 values、errors、touched、isSubmitting 等状态
- 🔧 **声明式 API**：使用 JSX 表达式处理表单逻辑
- 🎨 **灵活渲染**：支持 render props 和 hooks 两种模式
- 🔌 **丰富生态**：与 Yup 深度集成，社区方案成熟
- 📚 **文档完善**：大量示例和最佳实践

**适用场景**：
- 需要完整表单状态管理的项目
- 团队偏好受控组件模式
- 已有大量 Formik 使用的遗留项目
- 需要丰富社区资源支持的项目

**代码示例**：

```tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .max(15, '最多15个字符')
    .required('必填项'),
  lastName: Yup.string()
    .max(20, '最多20个字符')
    .required('必填项'),
  email: Yup.string()
    .email('无效的邮箱地址')
    .required('必填项'),
});

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
}

function SignupForm() {
  const initialValues: FormValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="firstName">名字</label>
            <Field type="text" name="firstName" />
            <ErrorMessage name="firstName" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="lastName">姓氏</label>
            <Field type="text" name="lastName" />
            <ErrorMessage name="lastName" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="email">邮箱</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" className="error" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            提交
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

**Hooks API 用法**：

```tsx
import { useFormik } from 'formik';

function LoginForm() {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: Partial<typeof values> = {};
      if (!values.email) {
        errors.email = '必填项';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = '无效的邮箱地址';
      }
      return errors;
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <input
        id="email"
        name="email"
        type="email"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
      />
      {formik.touched.email && formik.errors.email && (
        <div>{formik.errors.email}</div>
      )}
      
      <input
        id="password"
        name="password"
        type="password"
        onChange={formik.handleChange}
        value={formik.values.password}
      />
      
      <button type="submit">登录</button>
    </form>
  );
}
```

---

### 1.3 react-final-form

| 属性 | 详情 |
|------|------|
| **名称** | react-final-form |
| **Stars** | ⭐ 7,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [final-form/react-final-form](https://github.com/final-form/react-final-form) |
| **官网** | [final-form.org/react](https://final-form.org/react) |
| **包大小** | ~5KB gzipped |

**一句话描述**：基于 Final Form 引擎的高性能 React 表单库，采用订阅模式实现精细化更新控制。

**核心特点**：
- ⚡ **订阅模式**：只订阅需要的表单状态，避免不必要渲染
- 🔧 **与框架解耦**：Final Form 引擎可跨框架使用
- 🎭 **高阶组件支持**：FormSpy 等组件实现复杂交互
- 📝 **字段级校验**：支持同步和异步校验
- 🪶 **轻量级**：核心功能精简，插件扩展

**适用场景**：
- 需要精细控制渲染性能的项目
- 超大型表单（上百个字段）
- 需要跨框架共享表单逻辑
- 对包体积极度敏感的项目

**代码示例**：

```tsx
import { Form, Field } from 'react-final-form';

interface FormValues {
  customerName: string;
  orderNumber: string;
}

const required = (value: string) => (value ? undefined : '必填项');

function OrderForm() {
  const onSubmit = async (values: FormValues) => {
    await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(values),
    });
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ customerName: '', orderNumber: '' }}
      render={({ handleSubmit, form, submitting, pristine, values }) => (
        <form onSubmit={handleSubmit}>
          <Field name="customerName" validate={required}>
            {({ input, meta }) => (
              <div>
                <label>客户名称</label>
                <input {...input} type="text" placeholder="客户名称" />
                {meta.error && meta.touched && <span>{meta.error}</span>}
              </div>
            )}
          </Field>

          <Field name="orderNumber" validate={required}>
            {({ input, meta }) => (
              <div>
                <label>订单编号</label>
                <input {...input} type="text" placeholder="订单编号" />
                {meta.error && meta.touched && <span>{meta.error}</span>}
              </div>
            )}
          </Field>

          <div className="buttons">
            <button type="submit" disabled={submitting}>
              提交
            </button>
            <button
              type="button"
              onClick={form.reset}
              disabled={submitting || pristine}
            >
              重置
            </button>
          </div>

          <pre>{JSON.stringify(values, undefined, 2)}</pre>
        </form>
      )}
    />
  );
}
```

---

### 1.4 @tanstack/form

| 属性 | 详情 |
|------|------|
| **名称** | @tanstack/form |
| **Stars** | ⭐ 3,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [TanStack/form](https://github.com/TanStack/form) |
| **官网** | [tanstack.com/form](https://tanstack.com/form) |
| **包大小** | ~8KB gzipped |

**一句话描述**：TanStack 出品的无头表单库，支持 React、Vue、Svelte 等多个框架。

**核心特点**：
- 🔀 **跨框架**：核心逻辑与框架无关，统一 API
- 🎯 **类型安全**：完整的 TypeScript 类型支持
- 📦 **TanStack 生态**：与 Query、Table 等库配合良好
- ⚡ **响应式**：基于细粒度订阅的高性能更新
- 🧪 **测试友好**：易于单元测试和集成测试

**适用场景**：
- 使用 TanStack 系列库的项目
- 需要跨框架共享表单方案的团队
- 追求类型安全的现代项目
- 需要无头 UI 自定义的项目

**代码示例**：

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

function TanstackForm() {
  const form = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="fullName"
        validatorAdapter={zodValidator}
        validators={{
          onChange: z.string().min(2, '姓名至少2个字符'),
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>姓名</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <em role="alert">{field.state.meta.errors.join(', ')}</em>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="phone"
        validatorAdapter={zodValidator}
        validators={{
          onChange: z.string().regex(/^1[3-9]\d{9}$/, '无效的手机号'),
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>手机号</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <em role="alert">{field.state.meta.errors.join(', ')}</em>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
```

---

## 2. Vue 表单

### 2.1 vee-validate

| 属性 | 详情 |
|------|------|
| **名称** | vee-validate |
| **Stars** | ⭐ 11,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [logaretm/vee-validate](https://github.com/logaretm/vee-validate) |
| **官网** | [vee-validate.logaretm.com](https://vee-validate.logaretm.com) |
| **包大小** | ~12KB gzipped |

**一句话描述**：Vue.js 最流行的表单校验库，支持 Vue 2 和 Vue 3，提供组件式和组合式两种 API。

**核心特点**：
- 🎯 **Vue 专属**：深度集成 Vue 响应式系统
- 📝 **双向绑定**：完美支持 v-model
- 🔌 **校验灵活**：内置校验规则，支持 Zod、Yup 等
- 🎨 **UI 无关**：可与任意 UI 框架配合使用
- 🌐 **i18n 支持**：内置国际化错误消息

**适用场景**：
- Vue 2 或 Vue 3 项目
- 需要响应式表单状态管理
- 需要丰富校验规则的项目
- 国际化应用

**代码示例**：

```vue
<template>
  <form @submit="onSubmit">
    <div>
      <label for="email">邮箱</label>
      <input
        id="email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
      />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>

    <div>
      <label for="password">密码</label>
      <input
        id="password"
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
      />
      <span v-if="errors.password">{{ errors.password }}</span>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? '提交中...' : '注册' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

const validationSchema = toTypedSchema(
  z.object({
    email: z.string().email('请输入有效的邮箱'),
    password: z.string().min(6, '密码至少6位'),
  })
);

const { handleSubmit, defineField, errors, isSubmitting } = useForm({
  validationSchema,
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  alert('注册成功！');
});
</script>
```

**组件式 API**：

```vue
<template>
  <Form @submit="onSubmit" :validation-schema="schema">
    <Field name="username" v-slot="{ field, errors }">
      <div>
        <input v-bind="field" placeholder="用户名" />
        <span v-if="errors.length">{{ errors[0] }}</span>
      </div>
    </Field>

    <Field name="age" type="number" v-slot="{ field, errors }">
      <div>
        <input v-bind="field" placeholder="年龄" />
        <span v-if="errors.length">{{ errors[0] }}</span>
      </div>
    </Field>

    <button type="submit">提交</button>
  </Form>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate';
import { object, string, number } from 'yup';

const schema = object({
  username: string().required().min(3),
  age: number().required().min(1),
});

const onSubmit = (values: unknown) => {
  console.log(values);
};
</script>
```

---

### 2.2 formkit

| 属性 | 详情 |
|------|------|
| **名称** | formkit |
| **Stars** | ⭐ 4,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [formkit/formkit](https://github.com/formkit/formkit) |
| **官网** | [formkit.com](https://formkit.com) |
| **包大小** | ~25KB gzipped |

**一句话描述**：全功能的 Vue 表单框架，提供表单结构、校验、提交、渲染等完整解决方案。

**核心特点**：
- 🏗️ **结构化表单**：内置 20+ 种输入类型
- 🎨 **主题系统**：官方提供 Genesis、Regenesis 等主题
- 🧩 **插件生态**：可扩展表单功能
- 🌐 **多语言**：内置 50+ 语言支持
- 📚 **文档详细**：大量示例和教程

**适用场景**：
- 需要快速构建复杂表单的项目
- 需要统一表单样式的企业项目
- 需要丰富输入类型的场景
- 希望开箱即用的团队

**代码示例**：

```vue
<template>
  <FormKit
    type="form"
    @submit="handleSubmit"
    submit-label="注册"
    :config="{ validationVisibility: 'submit' }"
  >
    <FormKit
      type="text"
      name="username"
      label="用户名"
      validation="required|length:3,15"
      placeholder="请输入用户名"
    />

    <FormKit
      type="email"
      name="email"
      label="邮箱"
      validation="required|email"
      placeholder="your@email.com"
    />

    <FormKit
      type="password"
      name="password"
      label="密码"
      validation="required|length:6"
      placeholder="******"
    />

    <FormKit
      type="password"
      name="password_confirm"
      label="确认密码"
      validation="required|confirm"
      placeholder="******"
    />

    <FormKit
      type="checkbox"
      name="agree"
      label="我同意服务条款"
      validation="accepted"
    />
  </FormKit>
</template>

<script setup lang="ts">
interface FormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  agree: boolean;
}

const handleSubmit = async (data: FormData) => {
  await fetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  alert('注册成功！');
};
</script>
```

**分组和列表**：

```vue
<template>
  <FormKit type="form" @submit="submitHandler">
    <!-- 分组 -->
    <FormKit type="group" name="address">
      <FormKit type="text" name="street" label="街道" validation="required" />
      <FormKit type="text" name="city" label="城市" validation="required" />
      <FormKit type="text" name="zip" label="邮编" validation="required|matches:/^\d{6}$/" />
    </FormKit>

    <!-- 动态列表 -->
    <FormKit
      type="list"
      name="hobbies"
      :value="['']"
      dynamic
    >
      <label>兴趣爱好</label>
      <FormKit
        v-for="(item, index) in items"
        :key="index"
        type="text"
        :index="index"
        placeholder="输入兴趣爱好"
      />
      <button type="button" @click="items.push('')">添加</button>
    </FormKit>

    <button type="submit">保存</button>
  </FormKit>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const items = ref(['']);

const submitHandler = (data: unknown) => {
  console.log(data);
};
</script>
```

---

## 3. 选型对比

### 3.1 React 表单库对比

| 特性 | react-hook-form | formik | react-final-form | @tanstack/form |
|------|-----------------|--------|------------------|----------------|
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TS支持** | 🟢 原生 | 🟢 官方 | 🟢 官方 | 🟢 原生 |
| **包大小** | 小 (~9KB) | 中 (~15KB) | 小 (~5KB) | 小 (~8KB) |
| **学习曲线** | 平缓 | 平缓 | 中等 | 中等 |
| **社区活跃度** | 高 | 高 | 中 | 增长中 |
| **文档完善度** | 优秀 | 优秀 | 良好 | 良好 |
| **校验集成** | Yup/Zod/等 | Yup (深度) | 任意 | Zod/Yup |
| **受控/非受控** | 非受控 | 受控 | 受控 | 受控 |
| **渲染优化** | 引用机制 | 无 | 订阅模式 | 细粒度订阅 |
| **适用场景** | 高性能表单 | 通用表单 | 超大型表单 | 现代项目 |

### 3.2 Vue 表单库对比

| 特性 | vee-validate | formkit |
|------|--------------|---------|
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **TS支持** | 🟢 原生 | 🟢 原生 |
| **包大小** | 中 (~12KB) | 大 (~25KB) |
| **学习曲线** | 平缓 | 平缓 |
| **社区活跃度** | 高 | 中 |
| **文档完善度** | 优秀 | 优秀 |
| **UI 耦合度** | 无头 | 内置主题 |
| **输入类型** | 任意 HTML | 20+ 内置 |
| **动态字段** | 支持 | 内置支持 |
| **适用场景** | 灵活定制 | 快速开发 |

### 3.3 跨框架通用对比

| 需求场景 | 推荐方案 | 理由 |
|----------|----------|------|
| React 高性能表单 | **react-hook-form** | 非受控组件，最小化重渲染 |
| React 大型表单 | **react-final-form** | 订阅模式，精细控制更新 |
| React 快速开发 | **formik** | 生态成熟，文档丰富 |
| React + TanStack | **@tanstack/form** | 生态一致，类型安全 |
| Vue 3 项目 | **vee-validate** | 响应式集成，社区首选 |
| Vue 企业级表单 | **formkit** | 功能完整，主题系统 |
| 跨框架团队 | **@tanstack/form** | 统一 API，多框架支持 |
| 超大型表单 | **react-final-form** | 极致性能，订阅优化 |

---

## 4. 选型建议

### 4.1 按框架选择

| 框架 | 首选 | 备选 |
|------|------|------|
| React | react-hook-form | formik / @tanstack/form |
| Vue 3 | vee-validate | formkit |
| Vue 2 | vee-validate v4 | - |
| Solid/Svelte | @tanstack/form | - |

### 4.2 按项目规模选择

| 规模 | 推荐方案 |
|------|----------|
| 小型/快速原型 | vee-validate (Vue) / react-hook-form (React) |
| 中型应用 | react-hook-form / vee-validate / formik |
| 大型企业应用 | formkit (Vue) / react-hook-form + Zod |
| 超大型表单 | react-final-form |

### 4.3 按特殊需求选择

| 需求 | 推荐方案 |
|------|----------|
| 极致性能 | react-hook-form / react-final-form |
| 类型安全优先 | react-hook-form + Zod / @tanstack/form |
| 开箱即用 | formkit |
| 国际化表单 | vee-validate |
| 复杂动态表单 | react-hook-form (useFieldArray) / formkit |
| 已有 Yup 校验 | formik / vee-validate |

---

## 🔗 参考资源

- [React Hook Form 文档](https://react-hook-form.com/get-started)
- [Formik 文档](https://formik.org/docs/overview)
- [Final Form 文档](https://final-form.org/docs/react-final-form/getting-started)
- [TanStack Form 文档](https://tanstack.com/form/latest)
- [vee-validate 文档](https://vee-validate.logaretm.com/v4/)
- [FormKit 文档](https://formkit.com/getting-started)
- [Zod 文档](https://zod.dev) - 推荐搭配使用的校验库
- [Yup 文档](https://github.com/jquense/yup)

---

> 📅 本文档最后更新：2026年4月
> 
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据
