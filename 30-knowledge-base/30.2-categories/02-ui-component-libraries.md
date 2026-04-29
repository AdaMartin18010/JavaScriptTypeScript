---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# UI 组件库

> 用于构建用户界面的组件库和UI框架

---

## React UI 组件库

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **shadcn/ui** | 82k⭐ | Copy-paste 组件，基于 Radix UI 和 Tailwind CSS，无需安装依赖 | ⭐⭐⭐⭐⭐ | [ui.shadcn.com](https://ui.shadcn.com) | [github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) |
| **@mui/material** | 94k⭐ | Google Material Design 设计规范的 React 实现，功能全面 | ⭐⭐⭐⭐⭐ | [mui.com](https://mui.com) | [github.com/mui/material-ui](https://github.com/mui/material-ui) |
| **antd** | 93k⭐ | 企业级 UI 设计语言和 React 组件库，阿里巴巴出品 | ⭐⭐⭐⭐⭐ | [ant.design](https://ant.design) | [github.com/ant-design/ant-design](https://github.com/ant-design/ant-design) |
| **chakra-ui** | 38k⭐ | 现代简约风格的 React 组件库，注重开发体验和可访问性 | ⭐⭐⭐⭐⭐ | [chakra-ui.com](https://chakra-ui.com) | [github.com/chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui) |
| **radix-ui** | 18k⭐ | 无样式、可访问的 UI 原语，用于构建自定义组件 | ⭐⭐⭐⭐⭐ | [radix-ui.com](https://www.radix-ui.com) | [github.com/radix-ui/primitives](https://github.com/radix-ui/primitives) |
| **headlessui** | 26k⭐ | Tailwind Labs 官方出品，完全无样式、可访问的 UI 组件 | ⭐⭐⭐⭐⭐ | [headlessui.com](https://headlessui.com) | [github.com/tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) |
| **nextui** | 22k⭐ | 现代化、快速、美观的 React UI 库，基于 Tailwind CSS | ⭐⭐⭐⭐⭐ | [nextui.org](https://nextui.org) | [github.com/nextui-org/nextui](https://github.com/nextui-org/nextui) |
| **mantine** | 16k⭐ | 全功能 React 组件库，包含 120+ 组件和 Hook | ⭐⭐⭐⭐⭐ | [mantine.dev](https://mantine.dev) | [github.com/mantinedev/mantine](https://github.com/mantinedev/mantine) |

---

## Vue UI 组件库

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **element-plus** | 24k⭐ | Element UI 的 Vue 3 版本，桌面端组件库 | ⭐⭐⭐⭐⭐ | [element-plus.org](https://element-plus.org) | [github.com/element-plus/element-plus](https://github.com/element-plus/element-plus) |
| **ant-design-vue** | 19k⭐ | Ant Design 的 Vue 实现，企业级 UI 组件 | ⭐⭐⭐⭐⭐ | [antdv.com](https://www.antdv.com) | [github.com/vueComponent/ant-design-vue](https://github.com/vueComponent/ant-design-vue) |
| **vuetify** | 38k⭐ | Material Design 组件框架，Vue 3 官方推荐 | ⭐⭐⭐⭐⭐ | [vuetifyjs.com](https://vuetifyjs.com) | [github.com/vuetifyjs/vuetify](https://github.com/vuetifyjs/vuetify) |
| **naive-ui** | 16k⭐ | 图森未来出品，Vue 3 组件库，注重性能和类型安全 | ⭐⭐⭐⭐⭐ | [naiveui.com](https://www.naiveui.com) | [github.com/tusen-ai/naive-ui](https://github.com/tusen-ai/naive-ui) |
| **quasar** | 25k⭐ | 高性能 Vue 框架，支持 SPA、SSR、PWA、桌面和移动端 | ⭐⭐⭐⭐⭐ | [quasar.dev](https://quasar.dev) | [github.com/quasarframework/quasar](https://github.com/quasarframework/quasar) |

---

## 跨框架 UI 组件

| 库名 | Stars | 描述 | TS支持度 | 官网 | GitHub |
|------|-------|------|---------|------|--------|
| **@tanstack/table** | 11k⭐ | 用于构建表格和数据网格的 Headless UI，支持 React、Vue、Svelte、Solid | ⭐⭐⭐⭐⭐ | [tanstack.com/table](https://tanstack.com/table) | [github.com/TanStack/table](https://github.com/TanStack/table) |
| **@tanstack/virtual** | 5k⭐ | 用于虚拟化长列表的 Headless UI，支持多个框架 | ⭐⭐⭐⭐⭐ | [tanstack.com/virtual](https://tanstack.com/virtual) | [github.com/TanStack/virtual](https://github.com/TanStack/virtual) |

---

## 代码示例

### shadcn/ui — Copy-paste 组件模式

```bash
# 初始化（无需安装为依赖，直接复制源码到项目）
npx shadcn@latest init
npx shadcn add button dialog dropdown-menu
```

```tsx
// 直接使用复制的组件源码，完全可定制
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">删除账户</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除？</DialogTitle>
        </DialogHeader>
        <p>此操作不可撤销。</p>
      </DialogContent>
    </Dialog>
  )
}
```

### Radix UI — 无样式原语组合

```tsx
// 基于 Radix 构建完全自定义样式的 Dropdown
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { css } from '@/styled-system/css'

export function CustomDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={css({ cursor: 'pointer' })}>
        打开菜单
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={css({
            bg: 'white',
            rounded: 'md',
            shadow: 'lg',
            p: '2',
            minW: '200px',
          })}
        >
          <DropdownMenu.Item
            className={css({
              px: '3',
              py: '2',
              rounded: 'sm',
              _hover: { bg: 'gray.100' },
              cursor: 'pointer',
            })}
          >
            编辑
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={css({ h: '1px', bg: 'gray.200', my: '1' })} />
          <DropdownMenu.Item className={css({ px: '3', py: '2', color: 'red.600' })}>
            删除
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Element Plus — Vue 3 企业级表格

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ElTable, ElTableColumn, ElTag } from 'element-plus'

interface User {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive'
}

const users = ref<User[]>([
  { id: 1, name: 'Alice', role: 'admin', status: 'active' },
  { id: 2, name: 'Bob', role: 'editor', status: 'inactive' },
])

const roleColor = (role: string) =>
  ({ admin: 'danger', editor: 'warning', viewer: 'info' }[role] || 'info')
</script>

<template>
  <ElTable :data="users" style="width: 100%">
    <ElTableColumn prop="id" label="ID" width="60" />
    <ElTableColumn prop="name" label="姓名" />
    <ElTableColumn prop="role" label="角色">
      <template #default="{ row }">
        <ElTag :type="roleColor(row.role)">{{ row.role }}</ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" label="状态">
      <template #default="{ row }">
        <ElTag :type="row.status === 'active' ? 'success' : 'info'">
          {{ row.status }}
        </ElTag>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
```

### MUI — 主题定制与深色模式

```tsx
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { amber, grey } from '@mui/material/colors'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: amber,
    background: {
      default: grey[900],
      paper: grey[800],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Button variant="contained">主题化按钮</Button>
    </ThemeProvider>
  )
}
```

---

## 可访问性（A11y）最佳实践

所有现代组件库均遵循 [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)：

- **焦点管理**：Dialog 打开时自动聚焦第一个可交互元素，关闭时焦点归还触发器
- **键盘导航**：Menu 支持 `↑` `↓` `Enter` `Escape`，Tabs 支持 `←` `→` 切换
- **屏幕阅读器**：通过 `role`、`aria-expanded`、`aria-describedby` 提供语义信息
- **色彩对比**：确保文本与背景对比度 ≥ 4.5:1（WCAG AA 标准）

```tsx
// 使用 Radix UI 自动获得完整 ARIA 支持
// 无需手动编写 aria 属性
<Checkbox.Root id="terms" checked={checked} onCheckedChange={setChecked}>
  <Checkbox.Indicator>
    <CheckIcon />
  </Checkbox.Indicator>
</Checkbox.Root>
<label htmlFor="terms">我同意服务条款</label>
```

---

## 选型建议

### React 项目

| 场景 | 推荐库 |
|------|--------|
| 快速搭建/企业后台 | **antd** / **@mui/material** |
| 高度定制化设计 | **shadcn/ui** / **radix-ui** |
| 极简现代风格 | **chakra-ui** / **nextui** |
| 已有 Tailwind 项目 | **shadcn/ui** / **headlessui** |
| 全功能一站式 | **mantine** |

### Vue 项目

| 场景 | 推荐库 |
|------|--------|
| 企业后台系统 | **element-plus** / **ant-design-vue** |
| Material Design | **vuetify** |
| 高性能要求 | **naive-ui** |
| 多端统一开发 | **quasar** |

---

## 权威外部链接

- [W3C — WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — 组件可访问性权威标准
- [Radix UI Primitives Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction) — Headless UI 原语设计与 ARIA 实现参考
- [Tailwind CSS — Tailwind UI](https://tailwindui.com/) — 官方商业组件库，展示 Tailwind 最佳实践
- [Material Design 3](https://m3.material.io/) — Google Material Design 规范源文档
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) — Copy-paste 组件方法论
- [Chakra UI — Accessibility](https://v2.chakra-ui.com/docs/components/accordion/usage#accessibility) — 组件库无障碍设计指南
- [WebAIM — Color Contrast Checker](https://webaim.org/resources/contrastchecker/) — WCAG 对比度验证工具
- [Vue.js — Style Guide](https://vuejs.org/style-guide/) — Vue 官方组件设计规范
- [React Documentation — Thinking in React](https://react.dev/learn/thinking-in-react) — React 组件设计哲学
- [TanStack Table Documentation](https://tanstack.com/table/latest/docs/introduction) — 跨框架 Headless Table 权威参考

---

## 相关分类

- [状态管理](./04-state-management.md)
- [表单处理](./05-forms.md)
- [CSS 框架](./10-css-frameworks.md)
