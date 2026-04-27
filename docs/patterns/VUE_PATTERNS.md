---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# Vue 3 + TypeScript 设计模式

本文档涵盖了 Vue 3 开发中最常用的设计模式，所有示例均使用 TypeScript 编写。

---

## 目录

- [Vue 3 + TypeScript 设计模式](#vue-3--typescript-设计模式)
  - [目录](#目录)
  - [1. 组合式 API (Composition API) 模式](#1-组合式-api-composition-api-模式)
    - [问题描述](#问题描述)
    - [解决方案](#解决方案)
    - [代码示例](#代码示例)
      - [基础使用](#基础使用)
      - [可复用的 Composable](#可复用的-composable)
    - [Composition vs Options 对比](#composition-vs-options-对比)
  - [2. 选项式 API 最佳实践](#2-选项式-api-最佳实践)
    - [问题描述](#问题描述-1)
    - [解决方案](#解决方案-1)
    - [代码示例](#代码示例-1)
    - [Composition vs Options 对比](#composition-vs-options-对比-1)
  - [3. Provide/Inject 依赖注入](#3-provideinject-依赖注入)
    - [问题描述](#问题描述-2)
    - [解决方案](#解决方案-2)
    - [代码示例](#代码示例-2)
      - [基础使用](#基础使用-1)
      - [复杂状态管理](#复杂状态管理)
    - [Composition vs Options 对比](#composition-vs-options-对比-2)
  - [4. 自定义指令模式](#4-自定义指令模式)
    - [问题描述](#问题描述-3)
    - [解决方案](#解决方案-3)
    - [代码示例](#代码示例-3)
      - [基础指令](#基础指令)
      - [权限指令](#权限指令)
      - [拖拽指令](#拖拽指令)
      - [注册指令](#注册指令)
    - [Composition vs Options 对比](#composition-vs-options-对比-3)
  - [5. 渲染函数和 JSX](#5-渲染函数和-jsx)
    - [问题描述](#问题描述-4)
    - [解决方案](#解决方案-4)
    - [代码示例](#代码示例-4)
      - [基础渲染函数](#基础渲染函数)
      - [JSX 组件](#jsx-组件)
      - [函数式组件](#函数式组件)
    - [Composition vs Options 对比](#composition-vs-options-对比-4)
  - [6. 插槽 (Slots) 高级模式](#6-插槽-slots-高级模式)
    - [问题描述](#问题描述-5)
    - [解决方案](#解决方案-5)
    - [代码示例](#代码示例-5)
      - [基础插槽模式](#基础插槽模式)
      - [使用插槽](#使用插槽)
      - [动态插槽名](#动态插槽名)
    - [Composition vs Options 对比](#composition-vs-options-对比-5)
  - [7. 状态管理 (Pinia/Vuex)](#7-状态管理-piniavuex)
    - [问题描述](#问题描述-6)
    - [解决方案](#解决方案-6)
    - [代码示例](#代码示例-6)
      - [Pinia Store](#pinia-store)
      - [Store 组合](#store-组合)
      - [在组件中使用](#在组件中使用)
    - [Composition vs Options 对比](#composition-vs-options-对比-6)
  - [8. 组件库设计模式](#8-组件库设计模式)
    - [问题描述](#问题描述-7)
    - [解决方案](#解决方案-7)
    - [代码示例](#代码示例-7)
      - [组件架构](#组件架构)
      - [通用按钮组件](#通用按钮组件)
      - [复合组件模式](#复合组件模式)
    - [Composition vs Options 对比](#composition-vs-options-对比-7)
  - [9. Vue 3 的响应式系统原理](#9-vue-3-的响应式系统原理)
    - [问题描述](#问题描述-8)
    - [解决方案](#解决方案-8)
    - [代码示例](#代码示例-8)
      - [响应式原理实现](#响应式原理实现)
      - [Ref 实现](#ref-实现)
      - [Computed 实现](#computed-实现)
      - [响应式工具函数](#响应式工具函数)
    - [Composition vs Options 对比](#composition-vs-options-对比-8)
  - [10. Vue Router 高级模式](#10-vue-router-高级模式)
    - [问题描述](#问题描述-9)
    - [解决方案](#解决方案-9)
    - [代码示例](#代码示例-9)
      - [路由配置](#路由配置)
      - [组合式 API 使用](#组合式-api-使用)
      - [动态路由添加](#动态路由添加)
      - [路由组合式函数](#路由组合式函数)
    - [Composition vs Options 对比](#composition-vs-options-对比-9)
  - [总结](#总结)

---

## 1. 组合式 API (Composition API) 模式

### 问题描述

在大型组件中，选项式 API 导致相关逻辑分散在不同的选项中（data、methods、computed），使得代码难以维护和复用。

### 解决方案

使用组合式 API 将相关逻辑组织在一起，通过可复用的组合式函数 (Composables) 提取通用逻辑。

### 代码示例

#### 基础使用

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// 用户状态管理
interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const searchQuery = ref('')
const loading = ref(false)

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// 加载用户数据
const loadUsers = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await fetch('/api/users')
    users.value = await response.json()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

// 监听搜索变化
watch(searchQuery, (newVal) => {
  console.log('Search query changed:', newVal)
})

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <input
      v-model="searchQuery"
      placeholder="Search users..."
      class="search-input"
    />
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="user in filteredUsers" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>
```

#### 可复用的 Composable

```typescript
// composables/useAsync.ts
import { ref, type Ref } from 'vue'

interface UseAsyncOptions<T> {
  immediate?: boolean
  initialData?: T
}

interface UseAsyncReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: (...args: any[]) => Promise<void>
}

export function useAsync<T>(
  fn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const { immediate = false, initialData = null } = options

  const data = ref<T | null>(initialData) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  const execute = async (...args: any[]): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn(...args)
      data.value = result
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    execute()
  }

  return { data, error, loading, execute }
}

// 使用
// composables/useUsers.ts
export function useUsers() {
  const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch('/api/users')
    return response.json()
  }

  return useAsync(fetchUsers, { immediate: true })
}
```

### Composition vs Options 对比

| 特性 | Composition API | Options API |
|------|-----------------|-------------|
| 逻辑组织 | 按功能/逻辑组织 | 按选项类型组织 |
| 代码复用 | Composables (灵活) | Mixins (有局限性) |
| TypeScript 支持 | 优秀 | 有限 |
| 树摇优化 | 支持 | 不支持 |
| 学习曲线 | 需要理解响应式原理 | 更直观 |

---

## 2. 选项式 API 最佳实践

### 问题描述

虽然 Vue 3 推荐使用组合式 API，但在维护遗留项目或团队协作中，仍需要使用选项式 API，需要了解其最佳实践。

### 解决方案

遵循 Vue 风格指南，合理使用生命周期钩子，注意响应式数据的初始化方式。

### 代码示例

```vue
<script lang="ts">
import { defineComponent, type PropType } from 'vue'

// 类型定义
interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface Data {
  products: Product[]
  selectedCategory: string
  loading: boolean
  error: string | null
}

export default defineComponent({
  name: 'ProductList',

  // Props 类型定义
  props: {
    initialCategory: {
      type: String as PropType<string>,
      default: 'all'
    },
    maxItems: {
      type: Number,
      default: 10,
      validator: (value: number) => value > 0
    }
  },

  // 响应式数据
  data(): Data {
    return {
      products: [],
      selectedCategory: this.initialCategory,
      loading: false,
      error: null
    }
  },

  // 计算属性
  computed: {
    filteredProducts(): Product[] {
      if (this.selectedCategory === 'all') {
        return this.products.slice(0, this.maxItems)
      }
      return this.products
        .filter(p => p.category === this.selectedCategory)
        .slice(0, this.maxItems)
    },

    categories(): string[] {
      const cats = new Set(this.products.map(p => p.category))
      return ['all', ...Array.from(cats)]
    }
  },

  // 侦听器
  watch: {
    selectedCategory(newVal: string, oldVal: string) {
      console.log(`Category changed from ${oldVal} to ${newVal}`)
      this.trackCategoryChange(newVal)
    },

    // 深度监听
    products: {
      deep: true,
      handler(newProducts: Product[]) {
        console.log('Products updated:', newProducts.length)
      }
    }
  },

  // 生命周期钩子
  created() {
    console.log('Component created')
  },

  mounted() {
    this.fetchProducts()
  },

  beforeUnmount() {
    console.log('Cleaning up...')
  },

  // 方法
  methods: {
    async fetchProducts(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to fetch')
        this.products = await response.json()
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
      } finally {
        this.loading = false
      }
    },

    trackCategoryChange(category: string): void {
      // 埋点分析
    },

    selectCategory(category: string): void {
      this.selectedCategory = category
    }
  }
})
</script>
```

### Composition vs Options 对比

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 新项目 | Composition API | 更好的类型支持和代码组织 |
| 遗留项目 | Options API | 保持一致性 |
| 大型组件 | Composition API | 逻辑更清晰 |
| 简单组件 | 两者皆可 | 根据团队规范 |

---

## 3. Provide/Inject 依赖注入

### 问题描述

深层嵌套的组件需要通过 props 逐层传递数据，导致 prop drilling 问题，代码难以维护。

### 解决方案

使用 provide/inject 在祖先组件和后代组件之间建立依赖注入关系，避免中间组件的 prop 传递。

### 代码示例

#### 基础使用

```typescript
// types/theme.ts
export interface Theme {
  primaryColor: string
  secondaryColor: string
  fontSize: 'small' | 'medium' | 'large'
}

export interface ThemeContext {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleFontSize: () => void
}

// injection keys
import type { InjectionKey } from 'vue'

export const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme')
```

```vue
<!-- providers/ThemeProvider.vue -->
<script setup lang="ts">
import { provide, ref, readonly } from 'vue'
import { ThemeKey, type Theme } from '@/types/theme'

const theme = ref<Theme>({
  primaryColor: '#3b82f6',
  secondaryColor: '#6b7280',
  fontSize: 'medium'
})

const setTheme = (newTheme: Theme): void => {
  theme.value = newTheme
}

const toggleFontSize = (): void => {
  const sizes: Theme['fontSize'][] = ['small', 'medium', 'large']
  const currentIndex = sizes.indexOf(theme.value.fontSize)
  theme.value.fontSize = sizes[(currentIndex + 1) % sizes.length]
}

provide(ThemeKey, {
  theme: readonly(theme),
  setTheme,
  toggleFontSize
})
</script>

<template>
  <div class="theme-provider">
    <slot />
  </div>
</template>
```

```vue
<!-- components/ThemedButton.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ThemeKey } from '@/types/theme'

const themeContext = inject(ThemeKey)

if (!themeContext) {
  throw new Error('ThemedButton must be used within ThemeProvider')
}

const { theme, setTheme } = themeContext

const handleClick = () => {
  // 使用主题上下文
}
</script>

<template>
  <button
    :style="{
      backgroundColor: theme.primaryColor,
      fontSize: theme.fontSize === 'small' ? '12px' : theme.fontSize === 'large' ? '18px' : '14px'
    }"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

#### 复杂状态管理

```typescript
// composables/useFormContext.ts
import { provide, inject, ref, computed, type InjectionKey, type Ref } from 'vue'

interface FormField {
  name: string
  value: any
  valid: boolean
  errors: string[]
  touched: boolean
}

interface FormContext {
  fields: Ref<Record<string, FormField>>
  registerField: (name: string, initialValue?: any) => void
  unregisterField: (name: string) => void
  setFieldValue: (name: string, value: any) => void
  setFieldTouched: (name: string, touched: boolean) => void
  validateField: (name: string) => boolean
  isValid: Ref<boolean>
  values: Ref<Record<string, any>>
  submitForm: () => Promise<void>
}

const FormKey: InjectionKey<FormContext> = Symbol('form')

export function useFormProvider(onSubmit: (values: Record<string, any>) => Promise<void>): FormContext {
  const fields = ref<Record<string, FormField>>({})

  const registerField = (name: string, initialValue: any = ''): void => {
    fields.value[name] = {
      name,
      value: initialValue,
      valid: true,
      errors: [],
      touched: false
    }
  }

  const unregisterField = (name: string): void => {
    delete fields.value[name]
  }

  const setFieldValue = (name: string, value: any): void => {
    if (fields.value[name]) {
      fields.value[name].value = value
      validateField(name)
    }
  }

  const setFieldTouched = (name: string, touched: boolean): void => {
    if (fields.value[name]) {
      fields.value[name].touched = touched
    }
  }

  const validateField = (name: string): boolean => {
    const field = fields.value[name]
    if (!field) return false

    // 简单的验证逻辑
    field.valid = field.value !== '' && field.value !== null && field.value !== undefined
    field.errors = field.valid ? [] : [`${name} is required`]

    return field.valid
  }

  const isValid = computed(() =>
    Object.values(fields.value).every(field => field.valid)
  )

  const values = computed(() => {
    const result: Record<string, any> = {}
    Object.entries(fields.value).forEach(([key, field]) => {
      result[key] = field.value
    })
    return result
  })

  const submitForm = async (): Promise<void> => {
    // 验证所有字段
    Object.keys(fields.value).forEach(validateField)

    if (isValid.value) {
      await onSubmit(values.value)
    }
  }

  const context: FormContext = {
    fields,
    registerField,
    unregisterField,
    setFieldValue,
    setFieldTouched,
    validateField,
    isValid,
    values,
    submitForm
  }

  provide(FormKey, context)
  return context
}

export function useFormInject(): FormContext {
  const context = inject(FormKey)
  if (!context) {
    throw new Error('useFormInject must be used within a form provider')
  }
  return context
}
```

### Composition vs Options 对比

| 特性 | Composition API | Options API |
|------|-----------------|-------------|
| 语法 | `provide(key, value)` / `inject(key)` | `provide: {}` / `inject: []` |
| 类型安全 | 使用 InjectionKey 保证类型 | 需要额外类型断言 |
| 默认值 | `inject(key, defaultValue)` | 在 inject 选项中配置 |
| 响应式 | 直接传递 refs | 需要 unwrap |

---

## 4. 自定义指令模式

### 问题描述

需要直接操作 DOM 实现特定功能（如焦点管理、拖拽、权限控制），但组件化方式过于笨重。

### 解决方案

使用自定义指令封装 DOM 操作逻辑，实现可复用的底层 DOM 交互。

### 代码示例

#### 基础指令

```typescript
// directives/vFocus.ts
import type { Directive } from 'vue'

interface FocusOptions {
  delay?: number
  select?: boolean
}

export const vFocus: Directive<HTMLElement, FocusOptions | undefined> = {
  mounted(el, binding) {
    const { delay = 0, select = false } = binding.value || {}

    setTimeout(() => {
      el.focus()
      if (select && el instanceof HTMLInputElement) {
        el.select()
      }
    }, delay)
  }
}

// 使用
// <input v-focus />
// <input v-focus="{ delay: 100, select: true }" />
```

#### 权限指令

```typescript
// directives/vPermission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

type PermissionValue = string | string[]
type PermissionModifier = 'and' | 'or'

interface PermissionBinding {
  value: PermissionValue
  modifiers: Record<PermissionModifier, boolean>
}

export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding: PermissionBinding) {
    const userStore = useUserStore()
    const requiredPermissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    const mode: PermissionModifier = binding.modifiers.and ? 'and' : 'or'

    const hasPermission = mode === 'and'
      ? requiredPermissions.every(p => userStore.hasPermission(p))
      : requiredPermissions.some(p => userStore.hasPermission(p))

    if (!hasPermission) {
      el.remove()
    }
  }
}

// 使用
// <button v-permission="'admin'">Admin Only</button>
// <button v-permission.or="['editor', 'admin']">Editor or Admin</button>
// <button v-permission.and="['user', 'verified']">User and Verified</button>
```

#### 拖拽指令

```typescript
// directives/vDraggable.ts
import type { Directive } from 'vue'

interface DraggableOptions {
  handle?: string
  bounds?: 'parent' | 'window' | { left: number; top: number; right: number; bottom: number }
  onDragStart?: () => void
  onDrag?: (x: number, y: number) => void
  onDragEnd?: (x: number, y: number) => void
}

export const vDraggable: Directive<HTMLElement, DraggableOptions> = {
  mounted(el, binding) {
    const options = binding.value || {}
    const handleSelector = options.handle
    const handle = handleSelector ? el.querySelector(handleSelector) as HTMLElement : el

    if (!handle) return

    let isDragging = false
    let startX = 0
    let startY = 0
    let initialLeft = 0
    let initialTop = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      initialLeft = el.offsetLeft
      initialTop = el.offsetTop

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      options.onDragStart?.()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      let newLeft = initialLeft + deltaX
      let newTop = initialTop + deltaY

      // 边界限制
      if (options.bounds) {
        const bounds = getBounds(el, options.bounds)
        newLeft = Math.max(bounds.left, Math.min(newLeft, bounds.right - el.offsetWidth))
        newTop = Math.max(bounds.top, Math.min(newTop, bounds.bottom - el.offsetHeight))
      }

      el.style.left = `${newLeft}px`
      el.style.top = `${newTop}px`
      el.style.position = 'absolute'

      options.onDrag?.(newLeft, newTop)
    }

    const onMouseUp = () => {
      isDragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      options.onDragEnd?.(el.offsetLeft, el.offsetTop)
    }

    handle.addEventListener('mousedown', onMouseDown)

    // 保存清理函数
    ;(el as any)._draggableCleanup = () => {
      handle.removeEventListener('mousedown', onMouseDown)
    }
  },

  unmounted(el) {
    ;(el as any)._draggableCleanup?.()
  }
}

function getBounds(
  el: HTMLElement,
  bounds: DraggableOptions['bounds']
): { left: number; top: number; right: number; bottom: number } {
  if (bounds === 'window') {
    return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
  }
  if (bounds === 'parent' && el.parentElement) {
    const rect = el.parentElement.getBoundingClientRect()
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
  }
  if (typeof bounds === 'object') {
    return bounds
  }
  return { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }
}
```

#### 注册指令

```typescript
// directives/index.ts
import type { App } from 'vue'
import { vFocus } from './vFocus'
import { vPermission } from './vPermission'
import { vDraggable } from './vDraggable'

export function registerDirectives(app: App): void {
  app.directive('focus', vFocus)
  app.directive('permission', vPermission)
  app.directive('draggable', vDraggable)
}

// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { registerDirectives } from './directives'

const app = createApp(App)
registerDirectives(app)
app.mount('#app')
```

### Composition vs Options 对比

| 生命周期 | Composition API Hook | Options API |
|----------|---------------------|-------------|
| 挂载 | `mounted` | `mounted` |
| 更新 | `updated` | `updated` |
| 卸载 | `unmounted` | `unmounted` |
| 卸载前 | `beforeUnmount` | `beforeUnmount` |

---

## 5. 渲染函数和 JSX

### 问题描述

模板语法在处理动态渲染逻辑、高阶组件或复杂条件渲染时能力有限。

### 解决方案

使用渲染函数 (h) 或 JSX 编写组件，获得完全的 JavaScript 编程能力。

### 代码示例

#### 基础渲染函数

```typescript
// components/Heading.tsx
import { h, defineComponent, type PropType } from 'vue'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export const Heading = defineComponent({
  props: {
    level: {
      type: Number as PropType<HeadingLevel>,
      required: true,
      validator: (v: number) => v >= 1 && v <= 6
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
      default: 'md'
    }
  },
  setup(props, { slots }) {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    }

    return () => h(
      `h${props.level}`,
      {
        class: ['font-bold', sizeClasses[props.size]]
      },
      slots.default?.()
    )
  }
})
```

#### JSX 组件

```tsx
// components/DataTable.tsx
import { defineComponent, computed, type PropType } from 'vue'

interface Column<T> {
  key: keyof T
  title: string
  width?: string
  render?: (row: T, index: number) => JSX.Element
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  rowKey: keyof T
}

export function DataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  return defineComponent({
    props: {
      data: { type: Array as PropType<T[]>, required: true },
      columns: { type: Array as PropType<Column<T>[]>, required: true },
      loading: Boolean,
      rowKey: { type: String as PropType<string>, required: true }
    },
    setup(props) {
      const processedData = computed(() => {
        return props.data.map((row, index) => ({ ...row, _index: index }))
      })

      return () => (
        <div class="data-table">
          {props.loading && <div class="loading-overlay">Loading...</div>}
          <table class="w-full">
            <thead>
              <tr>
                {props.columns.map(col => (
                  <th
                    key={String(col.key)}
                    style={col.width ? { width: col.width } : undefined}
                    class="px-4 py-2 text-left"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.value.map(row => (
                <tr key={String(row[props.rowKey])} class="border-t">
                  {props.columns.map(col => (
                    <td key={String(col.key)} class="px-4 py-2">
                      {col.render
                        ? col.render(row, row._index)
                        : String(row[col.key] ?? '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  })
}

// 使用
// <DataTable
//   :data="users"
//   :columns="[
//     { key: 'name', title: 'Name' },
//     { key: 'email', title: 'Email' },
//     { key: 'status', title: 'Status', render: (row) => <Badge type={row.status} /> }
//   ]"
//   row-key="id"
// />
```

#### 函数式组件

```tsx
// components/Card.tsx
import type { FunctionalComponent, SlotsType } from 'vue'

interface CardProps {
  title?: string
  bordered?: boolean
  hoverable?: boolean
}

type CardSlots = {
  default?: () => unknown
  title?: () => unknown
  footer?: () => unknown
}

export const Card: FunctionalComponent<CardProps, {}, SlotsType<CardSlots>> =
  (props, { slots }) => {
    const classes = [
      'card',
      props.bordered !== false && 'card-bordered',
      props.hoverable && 'card-hoverable'
    ].filter(Boolean)

    return (
      <div class={classes}>
        {(props.title || slots.title) && (
          <div class="card-header">
            {slots.title?.() || <h3>{props.title}</h3>}
          </div>
        )}
        <div class="card-body">{slots.default?.()}</div>
        {slots.footer && <div class="card-footer">{slots.footer()}</div>}
      </div>
    )
  }

Card.props = ['title', 'bordered', 'hoverable']
```

### Composition vs Options 对比

| 特性 | Composition (setup) | Options API |
|------|---------------------|-------------|
| 渲染函数 | `setup()` 返回函数 | `render()` 方法 |
| JSX 支持 | `<script setup lang="tsx"> | `render()` + JSX |
| 模板 | 不支持 | `<template>` 标签 |
| 性能 | 函数式组件更轻量 | 标准组件开销 |

---

## 6. 插槽 (Slots) 高级模式

### 问题描述

需要创建高度可定制的组件，让用户能够完全控制组件的某些部分，同时保持组件的封装性。

### 解决方案

使用具名插槽、作用域插槽和动态插槽名实现灵活的组件组合。

### 代码示例

#### 基础插槽模式

```vue
<!-- components/DataList.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'

interface Props {
  items: T[]
  itemKey: keyof T
  loading?: boolean
}

const props = defineProps<Props>()

// 向父组件暴露的数据
interface SlotScopedData {
  item: T
  index: number
  isFirst: boolean
  isLast: boolean
}

// 定义插槽类型
defineSlots<{
  default?: (props: SlotScopedData) => any
  header?: (props: { count: number }) => any
  empty?: () => any
  loading?: () => any
}>()

const itemCount = computed(() => props.items.length)
</script>

<template>
  <div class="data-list">
    <!-- 头部插槽 -->
    <div v-if="$slots.header" class="data-list-header">
      <slot name="header" :count="itemCount" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="data-list-loading">
      <slot name="loading">
        <span>Loading...</span>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-else-if="items.length === 0" class="data-list-empty">
      <slot name="empty">
        <span>No items found</span>
      </slot>
    </div>

    <!-- 列表内容 -->
    <div v-else class="data-list-items">
      <div
        v-for="(item, index) in items"
        :key="String(item[itemKey])"
        class="data-list-item"
      >
        <slot
          :item="item"
          :index="index"
          :is-first="index === 0"
          :is-last="index === items.length - 1"
        />
      </div>
    </div>
  </div>
</template>
```

#### 使用插槽

```vue
<!-- UserList.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import DataList from './components/DataList.vue'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

const users = ref<User[]>([
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'user' }
])

const loading = ref(false)
</script>

<template>
  <DataList :items="users" item-key="id" :loading="loading">
    <!-- 使用具名插槽 -->
    <template #header="{ count }">
      <h2>Users ({{ count }})</h2>
    </template>

    <!-- 使用作用域插槽 -->
    <template #default="{ item, index, isFirst, isLast }">
      <div
        class="user-card"
        :class="{ 'first-item': isFirst, 'last-item': isLast }"
      >
        <span class="index">#{{ index + 1 }}</span>
        <span class="name">{{ item.name }}</span>
        <span class="role" :class="item.role">{{ item.role }}</span>
      </div>
    </template>

    <!-- 自定义空状态 -->
    <template #empty>
      <div class="empty-state">
        <Icon name="users" />
        <p>No users found. <a href="#" @click="createUser">Create one?</a></p>
      </div>
    </template>
  </DataList>
</template>
```

#### 动态插槽名

```vue
<!-- components/Tabs.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Tab {
  id: string
  label: string
  icon?: string
  disabled?: boolean
}

const props = defineProps<{
  tabs: Tab[]
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const activeTab = computed({
  get: () => props.modelValue || props.tabs[0]?.id,
  set: (val) => emit('update:modelValue', val)
})

defineSlots<{
  [key: `tab-${string}`]: (props: { tab: Tab; isActive: boolean }) => any
  [key: `panel-${string}`]: (props: { tab: Tab; isActive: boolean }) => any
}>()
</script>

<template>
  <div class="tabs">
    <!-- Tab Headers -->
    <div class="tab-headers">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-header', { active: activeTab === tab.id }]"
        :disabled="tab.disabled"
        @click="activeTab = tab.id"
      >
        <!-- 动态插槽: tab-${id} -->
        <slot :name="`tab-${tab.id}`" :tab="tab" :is-active="activeTab === tab.id">
          <span v-if="tab.icon" class="icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </slot>
      </button>
    </div>

    <!-- Tab Panels -->
    <div class="tab-panels">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        v-show="activeTab === tab.id"
        class="tab-panel"
      >
        <!-- 动态插槽: panel-${id} -->
        <slot :name="`panel-${tab.id}`" :tab="tab" :is-active="activeTab === tab.id">
          <p>Content for {{ tab.label }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>
```

### Composition vs Options 对比

| 特性 | Composition API | Options API |
|------|-----------------|-------------|
| 插槽访问 | `useSlots()` / `slots` | `this.$slots` |
| 作用域插槽 | `useSlots()` | `this.$scopedSlots` |
| 类型定义 | `defineSlots<{}>()` | 无原生支持 |
| 动态插槽 | 直接支持 | `$slots[name]` |

---

## 7. 状态管理 (Pinia/Vuex)

### 问题描述

多个组件需要共享状态，props 传递和事件机制变得复杂，需要集中式的状态管理方案。

### 解决方案

使用 Pinia (Vuex 的继任者) 进行类型安全的状态管理，支持组合式 API 风格。

### 代码示例

#### Pinia Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 类型定义
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}

// Composition API 风格 Store
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const preferences = ref<UserPreferences>({
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  })
  const isLoading = ref(false)

  // Getters (Computed)
  const isLoggedIn = computed(() => user.value !== null)
  const displayName = computed(() => user.value?.name || 'Guest')
  const isDarkMode = computed(() => preferences.value.theme === 'dark')

  // Actions
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) throw new Error('Login failed')

      user.value = await response.json()
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    user.value = null
    // 清除其他状态...
  }

  function updatePreferences(newPreferences: Partial<UserPreferences>): void {
    preferences.value = { ...preferences.value, ...newPreferences }
  }

  function toggleTheme(): void {
    preferences.value.theme = preferences.value.theme === 'light' ? 'dark' : 'light'
  }

  return {
    user,
    preferences,
    isLoading,
    isLoggedIn,
    displayName,
    isDarkMode,
    login,
    logout,
    updatePreferences,
    toggleTheme
  }
})

// Options API 风格 Store (兼容旧项目)
export const useUserStoreOptions = defineStore('user', {
  state: () => ({
    user: null as User | null,
    preferences: {
      theme: 'light' as 'light' | 'dark',
      language: 'zh-CN',
      notifications: true
    },
    isLoading: false
  }),

  getters: {
    isLoggedIn: (state) => state.user !== null,
    displayName: (state) => state.user?.name || 'Guest',
    isDarkMode: (state) => state.preferences.theme === 'dark'
  },

  actions: {
    async login(email: string, password: string): Promise<boolean> {
      this.isLoading = true
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) throw new Error('Login failed')

        this.user = await response.json()
        return true
      } catch (error) {
        return false
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
    },

    updatePreferences(newPreferences: Partial<UserPreferences>) {
      this.preferences = { ...this.preferences, ...newPreferences }
    }
  }
})
```

#### Store 组合

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'

interface CartItem {
  productId: string
  quantity: number
  price: number
  name: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // 使用其他 store
  const userStore = useUserStore()

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // 会员折扣
  const discountedTotal = computed(() => {
    const discount = userStore.isLoggedIn ? 0.9 : 1
    return totalPrice.value * discount
  })

  function addItem(item: Omit<CartItem, 'quantity'>): void {
    const existing = items.value.find(i => i.productId === item.productId)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...item, quantity: 1 })
    }
  }

  function removeItem(productId: string): void {
    const index = items.value.findIndex(i => i.productId === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productId: string, quantity: number): void {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart(): void {
    items.value = []
  }

  async function checkout(): Promise<{ success: boolean; orderId?: string }> {
    if (!userStore.isLoggedIn) {
      return { success: false }
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.value,
          userId: userStore.user?.id,
          total: discountedTotal.value
        })
      })

      if (!response.ok) throw new Error('Checkout failed')

      const result = await response.json()
      clearCart()
      return { success: true, orderId: result.orderId }
    } catch (error) {
      return { success: false }
    }
  }

  return {
    items,
    itemCount,
    totalPrice,
    isEmpty,
    discountedTotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout
  }
})
```

#### 在组件中使用

```vue
<!-- components/Cart.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const cartStore = useCartStore()
const userStore = useUserStore()

// 使用 storeToRefs 保持响应性
const { items, itemCount, totalPrice, discountedTotal } = storeToRefs(cartStore)
const { isLoggedIn } = storeToRefs(userStore)

// 方法直接从 store 解构
const { addItem, removeItem, updateQuantity, checkout } = cartStore

async function handleCheckout() {
  const result = await checkout()
  if (result.success) {
    alert(`Order placed! Order ID: ${result.orderId}`)
  } else {
    alert('Checkout failed. Please try again.')
  }
}
</script>

<template>
  <div class="cart">
    <h2>Shopping Cart ({{ itemCount }})</h2>

    <div v-if="items.length === 0" class="empty">
      Your cart is empty
    </div>

    <div v-else>
      <div v-for="item in items" :key="item.productId" class="cart-item">
        <span>{{ item.name }}</span>
        <input
          type="number"
          :value="item.quantity"
          @change="updateQuantity(item.productId, +$event.target.value)"
          min="0"
        />
        <span>${{ item.price * item.quantity }}</span>
        <button @click="removeItem(item.productId)">Remove</button>
      </div>

      <div class="summary">
        <p>Subtotal: ${{ totalPrice.toFixed(2) }}</p>
        <p v-if="isLoggedIn" class="discount">
          Member Discount: ${{ (totalPrice - discountedTotal).toFixed(2) }}
        </p>
        <p class="total">Total: ${{ discountedTotal.toFixed(2) }}</p>
      </div>

      <button
        @click="handleCheckout"
        :disabled="!isLoggedIn"
        class="checkout-btn"
      >
        {{ isLoggedIn ? 'Checkout' : 'Login to Checkout' }}
      </button>
    </div>
  </div>
</template>
```

### Composition vs Options 对比

| 特性 | Pinia (Composition) | Pinia (Options) | Vuex |
|------|---------------------|-----------------|------|
| 语法风格 | `ref` / `computed` | `state` / `getters` / `actions` | Vuex 风格 |
| TypeScript | 自动类型推断 | 需要手动标注 | 需要额外配置 |
| 代码复用 | 可使用 Composables | Mixin 模式 | 模块系统 |
| 体积 | 更小 (~1KB) | ~1KB | 较大 |
| 学习曲线 | 低 (熟悉 Vue 3) | 中 | 较高 |

---

## 8. 组件库设计模式

### 问题描述

需要设计一套可复用、可扩展的组件库，支持主题定制、类型提示和良好的开发者体验。

### 解决方案

使用组件组合模式、配置注入、样式变量系统构建组件库。

### 代码示例

#### 组件架构

```typescript
// components/config-provider/types.ts
export interface Config {
  prefixCls: string
  theme: 'light' | 'dark'
  size: 'small' | 'middle' | 'large'
  locale: Record<string, string>
  zIndexBase: number
  getPopupContainer: () => HTMLElement
}

export const defaultConfig: Config = {
  prefixCls: 'my',
  theme: 'light',
  size: 'middle',
  locale: {},
  zIndexBase: 1000,
  getPopupContainer: () => document.body
}

export const ConfigKey: InjectionKey<ComputedRef<Config>> = Symbol('config')
```

```vue
<!-- components/config-provider/ConfigProvider.vue -->
<script setup lang="ts">
import { provide, computed } from 'vue'
import { ConfigKey, defaultConfig, type Config } from './types'

const props = withDefaults(defineProps<Partial<Config>>(), defaultConfig)

const config = computed<Config>(() => ({
  prefixCls: props.prefixCls ?? defaultConfig.prefixCls,
  theme: props.theme ?? defaultConfig.theme,
  size: props.size ?? defaultConfig.size,
  locale: { ...defaultConfig.locale, ...props.locale },
  zIndexBase: props.zIndexBase ?? defaultConfig.zIndexBase,
  getPopupContainer: props.getPopupContainer ?? defaultConfig.getPopupContainer
}))

provide(ConfigKey, config)
</script>

<template>
  <div :class="[`${config.prefixCls}-config-provider`, `${config.prefixCls}-${config.theme}`]">
    <slot />
  </div>
</template>
```

#### 通用按钮组件

```vue
<!-- components/button/Button.vue -->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { ConfigKey } from '../config-provider/types'

interface ButtonProps {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  ghost?: boolean
  round?: boolean
  icon?: string
  href?: string
  target?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  target: '_self'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 注入全局配置
const config = inject(ConfigKey)
const prefixCls = computed(() => config?.value?.prefixCls ?? 'my')
const globalSize = computed(() => config?.value?.size ?? 'middle')

const buttonSize = computed(() => props.size ?? globalSize.value)

const classes = computed(() => [
  `${prefixCls.value}-btn`,
  `${prefixCls.value}-btn-${props.type}`,
  `${prefixCls.value}-btn-${buttonSize.value}`,
  {
    [`${prefixCls.value}-btn-block`]: props.block,
    [`${prefixCls.value}-btn-ghost`]: props.ghost,
    [`${prefixCls.value}-btn-round`]: props.round,
    [`${prefixCls.value}-btn-loading`]: props.loading,
    [`${prefixCls.value}-btn-disabled`]: props.disabled || props.loading
  }
])

const handleClick = (e: MouseEvent): void => {
  if (props.disabled || props.loading) return
  emit('click', e)
}

// 判断是否是链接按钮
const isLink = computed(() => !!props.href)
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :class="classes"
    :disabled="!isLink && (disabled || loading)"
    :href="isLink ? href : undefined"
    :target="isLink ? target : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-icon">
      <LoadingSpinner />
    </span>
    <span v-else-if="icon" class="btn-icon">
      <Icon :name="icon" />
    </span>
    <span class="btn-content">
      <slot />
    </span>
  </component>
</template>
```

#### 复合组件模式

```vue
<!-- components/form/Form.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { provide, reactive, computed } from 'vue'
import type { FormRules, FormContext, FormItemContext } from './types'
import { FormKey } from './types'

interface FormProps<T> {
  model: T
  rules?: FormRules<T>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  disabled?: boolean
  size?: 'small' | 'middle' | 'large'
}

const props = defineProps<FormProps<T>>()

const emit = defineEmits<{
  submit: [values: T]
  validate: [prop: string, isValid: boolean, message?: string]
}>()

const formItems = reactive<FormItemContext[]>([])

const addField = (field: FormItemContext): void => {
  formItems.push(field)
}

const removeField = (field: FormItemContext): void => {
  const index = formItems.indexOf(field)
  if (index > -1) formItems.splice(index, 1)
}

const validate = async (): Promise<boolean> => {
  const results = await Promise.all(
    formItems.map(item => item.validate(''))
  )
  return results.every(valid => valid)
}

const validateField = async (prop: keyof T): Promise<boolean> => {
  const field = formItems.find(item => item.prop === prop)
  return field ? field.validate('') : true
}

const resetFields = (): void => {
  formItems.forEach(field => field.resetField())
}

const clearValidate = (): void => {
  formItems.forEach(field => field.clearValidate())
}

const context: FormContext<T> = {
  model: props.model,
  rules: props.rules,
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  disabled: props.disabled,
  size: props.size,
  addField,
  removeField
}

provide(FormKey, context)

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate
})
</script>

<template>
  <form class="form" @submit.prevent="validate().then(v => v && emit('submit', props.model))">
    <slot />
  </form>
</template>
```

```vue
<!-- components/form/FormItem.vue -->
<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { FormKey, type FormItemContext } from './types'

interface FormItemProps {
  prop?: string
  label?: string
  labelWidth?: string
  required?: boolean
  rules?: any[]
}

const props = defineProps<FormItemProps>()

const form = inject(FormKey)
const validateMessage = ref('')
const validateState = ref('')

const isRequired = computed(() => {
  return props.required || props.rules?.some(rule => rule.required)
})

const fieldValue = computed(() => {
  if (!form || !props.prop) return undefined
  return form.model[props.prop]
})

const validate = async (trigger: string): Promise<boolean> => {
  if (!props.prop) return true

  const rules = [...(props.rules || []), ...(form?.rules?.[props.prop] || [])]

  for (const rule of rules) {
    if (trigger && rule.trigger && rule.trigger !== trigger) continue

    if (rule.required && !fieldValue.value) {
      validateState.value = 'error'
      validateMessage.value = rule.message || `${props.prop} is required`
      return false
    }

    if (rule.validator) {
      const result = await rule.validator(fieldValue.value)
      if (result !== true) {
        validateState.value = 'error'
        validateMessage.value = result || rule.message
        return false
      }
    }
  }

  validateState.value = 'success'
  validateMessage.value = ''
  return true
}

const resetField = (): void => {
  validateState.value = ''
  validateMessage.value = ''
}

const clearValidate = (): void => {
  validateState.value = ''
  validateMessage.value = ''
}

const context: FormItemContext = {
  prop: props.prop,
  validate,
  resetField,
  clearValidate
}

onMounted(() => {
  form?.addField(context)
})

onUnmounted(() => {
  form?.removeField(context)
})

watch(fieldValue, () => {
  if (validateState.value === 'error') {
    validate('change')
  }
})
</script>

<template>
  <div class="form-item" :class="[`is-${validateState}`]">
    <label
      v-if="label"
      class="form-item-label"
      :class="{ required: isRequired }"
      :style="labelWidth ? { width: labelWidth } : undefined"
    >
      {{ label }}
    </label>
    <div class="form-item-content">
      <slot />
      <div v-if="validateMessage" class="form-item-error">
        {{ validateMessage }}
      </div>
    </div>
  </div>
</template>
```

### Composition vs Options 对比

| 模式 | Composition API | Options API |
|------|-----------------|-------------|
| 组件库设计 | 推荐，类型支持更好 | 兼容性好 |
| 全局配置注入 | `provide` + `inject` | 相同 |
| 父子组件通信 | `defineExpose` | `this.$refs` |
| 动态组件 | `resolveComponent` | 相同 |
| 渲染性能 | 更好 (Tree-shaking) | 标准 |

---

## 9. Vue 3 的响应式系统原理

### 问题描述

需要深入理解 Vue 3 响应式系统的工作原理，以便更好地调试和优化应用性能。

### 解决方案

理解 Proxy 基础、依赖收集和触发机制，学习 Ref 和 Reactive 的区别和使用场景。

### 代码示例

#### 响应式原理实现

```typescript
// reactivity/dep.ts
// 订阅者/依赖管理
export class Dep {
  private subscribers = new Set<ReactiveEffect>()

  depend(): void {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify(): void {
    this.subscribers.forEach(effect => effect())
  }
}

// 当前活跃的 effect
type ReactiveEffect = () => void
let activeEffect: ReactiveEffect | null = null

export function effect(fn: ReactiveEffect): void {
  activeEffect = fn
  fn()
  activeEffect = null
}
```

```typescript
// reactivity/reactive.ts
const targetMap = new WeakMap<object, Map<string | symbol, Dep>>()

export function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      // 依赖收集
      track(target, key)

      // 递归处理嵌套对象
      if (result && typeof result === 'object') {
        return reactive(result)
      }

      return result
    },

    set(target, key, value, receiver) {
      const oldValue = (target as any)[key]
      const result = Reflect.set(target, key, value, receiver)

      // 触发更新（值变化时才触发）
      if (oldValue !== value) {
        trigger(target, key)
      }

      return result
    },

    deleteProperty(target, key) {
      const hadKey = key in target
      const result = Reflect.deleteProperty(target, key)

      if (hadKey) {
        trigger(target, key)
      }

      return result
    },

    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },

    ownKeys(target) {
      track(target, Symbol('iterate'))
      return Reflect.ownKeys(target)
    }
  })
}

function track(target: object, key: string | symbol): void {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }

  dep.depend()
}

function trigger(target: object, key: string | symbol): void {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.notify()
  }

  // 触发迭代相关的 effect
  const iterateDep = depsMap.get(Symbol('iterate'))
  if (iterateDep) {
    iterateDep.notify()
  }
}

// Dep 类定义
class Dep {
  private subscribers = new Set<ReactiveEffect>()

  depend(): void {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify(): void {
    this.subscribers.forEach(effect => effect())
  }
}

type ReactiveEffect = () => void
let activeEffect: ReactiveEffect | null = null
```

#### Ref 实现

```typescript
// reactivity/ref.ts
import { reactive, isRef, type Ref } from 'vue'

// 简化版 Ref 实现
export function ref<T>(value: T): Ref<T> {
  const wrapper = {
    __v_isRef: true,
    _value: value,
    get value() {
      track(wrapper, 'value')
      return this._value
    },
    set value(newValue) {
      this._value = newValue
      trigger(wrapper, 'value')
    }
  }
  return wrapper as Ref<T>
}

// toRef: 将响应式对象的属性转为 ref
export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): Ref<T[K]> {
  return {
    __v_isRef: true,
    get value() {
      return object[key]
    },
    set value(newValue) {
      object[key] = newValue
    }
  } as Ref<T[K]>
}

// toRefs: 将整个响应式对象转为 refs
export function toRefs<T extends object>(object: T): { [K in keyof T]: Ref<T[K]> } {
  const result: any = {}

  for (const key in object) {
    result[key] = toRef(object, key)
  }

  return result
}
```

#### Computed 实现

```typescript
// reactivity/computed.ts
import { effect, type Ref } from 'vue'

export interface ComputedRef<T> extends Ref<T> {
  readonly value: T
}

export function computed<T>(getter: () => T): ComputedRef<T> {
  let value: T
  let dirty = true // 脏检查标记

  const computed = {
    __v_isRef: true,
    get value() {
      if (dirty) {
        value = getter()
        dirty = false
      }
      track(computed, 'value')
      return value
    }
  } as ComputedRef<T>

  // 监听依赖变化
  effect(() => {
    getter()
    dirty = true
    trigger(computed, 'value')
  })

  return computed
}
```

#### 响应式工具函数

```typescript
// reactivity/utils.ts
import { ref, isRef, unref, toRaw } from 'vue'

// 创建只读响应式对象
export function readonly<T extends object>(target: T): Readonly<T> {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      if (result && typeof result === 'object') {
        return readonly(result)
      }
      return result
    },
    set() {
      console.warn(`Set operation on readonly target failed`)
      return true
    },
    deleteProperty() {
      console.warn(`Delete operation on readonly target failed`)
      return true
    }
  })
}

// 创建浅层响应式对象
export function shallowReactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver)
    }
  })
}

// 触发自定义 Ref
export function customRef<T>(factory: (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}): Ref<T> {
  return {
    __v_isRef: true,
    ...factory(track, trigger)
  } as Ref<T>
}

// 防抖 Ref
export function debouncedRef<T>(value: T, delay = 200): Ref<T> {
  let timeout: ReturnType<typeof setTimeout>

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    }
  }))
}
```

### Composition vs Options 对比

| 特性 | ref | reactive | Options API data |
|------|-----|----------|------------------|
| 适用类型 | 任意值 | 仅对象 | 对象返回 |
| 访问方式 | `.value` | 直接访问 | `this.xxx` |
| 解构/展开 | 保持响应性 | 丢失响应性 | - |
| 类型推断 | 好 | 非常好 | 有限 |
| 嵌套对象 | 需要 `.value` | 自动递归 | 自动递归 |

---

## 10. Vue Router 高级模式

### 问题描述

需要实现复杂的导航守卫、动态路由、路由元信息处理等高级路由功能。

### 解决方案

利用 Vue Router 4 的组合式 API、导航守卫、路由匹配和滚动行为控制。

### 代码示例

#### 路由配置

```typescript
// router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由元信息类型
interface RouteMeta {
  requiresAuth?: boolean
  roles?: string[]
  title?: string
  keepAlive?: boolean
  permissions?: string[]
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMeta {}
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Dashboard/Users.vue'),
        meta: {
          title: '用户管理',
          roles: ['admin', 'manager']
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Dashboard/Settings.vue'),
        meta: {
          title: '设置',
          permissions: ['settings:read']
        }
      }
    ]
  },
  {
    path: '/article/:id',
    name: 'Article',
    component: () => import('@/views/Article.vue'),
    props: true, // 将路由参数作为 props 传递
    meta: { title: '文章详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 全局前置守卫
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - My App`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    // 尝试恢复登录状态
    if (!authStore.checked) {
      await authStore.checkAuth()
    }

    if (!authStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // 角色检查
  if (to.meta.roles) {
    const hasRole = to.meta.roles.some(role => authStore.hasRole(role))
    if (!hasRole) {
      return next({ name: 'Forbidden' })
    }
  }

  // 权限检查
  if (to.meta.permissions) {
    const hasPermission = to.meta.permissions.every(p => authStore.hasPermission(p))
    if (!hasPermission) {
      return next({ name: 'Forbidden' })
    }
  }

  next()
})

// 全局解析守卫
router.beforeResolve(async (to) => {
  // 预加载数据
  if (to.meta.preload) {
    // 执行数据预加载
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 埋点分析
  console.log(`Navigated from ${from.path} to ${to.path}`)
})

// 错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
```

#### 组合式 API 使用

```vue
<!-- views/Article.vue -->
<script setup lang="ts">
import { watch, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useArticleStore } from '@/stores/article'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

// Props 从路由参数获取
const props = defineProps<{
  id: string
}>()

// 获取查询参数
const page = computed(() => parseInt(route.query.page as string) || 1)

// 加载文章
const loadArticle = async () => {
  await articleStore.fetchArticle(props.id)
}

loadArticle()

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadArticle()
  }
})

// 导航守卫（组件内）
onBeforeRouteUpdate(async (to, from) => {
  // 同一组件路由更新时
  if (to.params.id !== from.params.id) {
    // 可以阻止导航
    // return false
  }
})

onBeforeRouteLeave((to, from) => {
  // 离开路由前
  if (articleStore.hasUnsavedChanges) {
    const answer = window.confirm('You have unsaved changes. Leave anyway?')
    if (!answer) return false
  }
})

// 编程式导航
const goToEdit = () => {
  router.push({
    name: 'ArticleEdit',
    params: { id: props.id },
    query: { mode: 'advanced' }
  })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// 替换当前历史记录
const updateQuery = (newPage: number) => {
  router.replace({
    query: { ...route.query, page: newPage.toString() }
  })
}
</script>
```

#### 动态路由添加

```typescript
// router/dynamic.ts
import router from './index'
import { usePermissionStore } from '@/stores/permission'

// 动态添加路由
export async function addDynamicRoutes() {
  const permissionStore = usePermissionStore()

  // 从后端获取权限路由
  const accessRoutes = await permissionStore.generateRoutes()

  accessRoutes.forEach(route => {
    if (!router.hasRoute(route.name!)) {
      router.addRoute(route)
    }
  })

  // 添加 404 兜底路由（必须在最后）
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'NotFoundFallback'
  })
}

// 重置路由（用于登出）
export function resetRouter() {
  const routes = router.getRoutes()
  routes.forEach(route => {
    if (route.name && !['Home', 'Login', 'NotFound'].includes(route.name as string)) {
      router.removeRoute(route.name)
    }
  })
}
```

#### 路由组合式函数

```typescript
// composables/useRouteQuery.ts
import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRouteQuery<T extends string | string[]>(
  name: string,
  defaultValue?: T
): Ref<T> {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      const value = route.query[name]
      return (value as T) ?? defaultValue!
    },
    set(newValue) {
      router.push({
        query: { ...route.query, [name]: newValue }
      })
    }
  })
}

// 使用
// const search = useRouteQuery<string>('search', '')
// const page = useRouteQuery<number>('page', 1)

// composables/useRouteParams.ts
export function useRouteParams<T extends string>(
  name: string,
  defaultValue?: T
): Ref<T> {
  const route = useRoute()

  return computed(() => {
    const value = route.params[name]
    return (Array.isArray(value) ? value[0] : value) as T ?? defaultValue!
  })
}
```

### Composition vs Options 对比

| 特性 | Composition API | Options API |
|------|-----------------|-------------|
| 路由访问 | `useRoute()` / `useRouter()` | `this.$route` / `this.$router` |
| 导航守卫 | `onBeforeRouteLeave()` / `onBeforeRouteUpdate()` | `beforeRouteLeave` / `beforeRouteUpdate` |
| 类型支持 | 完美 | 需要额外声明 |
| 代码组织 | 灵活 | 固定选项 |
| 动态导入 | 直接支持 | 需要额外配置 |

---

## 总结

Vue 3 + TypeScript 提供了强大的类型系统和灵活的编程模型：

1. **组合式 API** 是大型应用的首选，提供更好的代码组织和类型支持
2. **Pinia** 作为状态管理方案，比 Vuex 更轻量且对 TypeScript 更友好
3. **Provide/Inject** 适合跨层级的依赖注入场景
4. **自定义指令** 用于 DOM 级别的直接操作
5. **渲染函数/JSX** 提供最大的灵活性
6. **插槽** 实现组件组合和复用
7. **组件库设计** 需要考虑配置注入和类型导出
8. **响应式系统** 的理解有助于性能优化
9. **Vue Router** 的组合式 API 简化了路由操作

选择合适的模式取决于具体的应用场景和团队偏好。
