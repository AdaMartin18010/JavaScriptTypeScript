# UI 组件库对比

> React/Vue 生态主流 UI 组件库选型矩阵。

---

## React 生态

| 库 | 样式方案 | 定制性 | 包体积 | 无障碍 |
|----|---------|--------|--------|--------|
| **shadcn/ui** | Tailwind + Radix | 极高（源码复制） | 按需 | 优秀 |
| **MUI** | CSS-in-JS / Emotion | 高 | ~100KB | 优秀 |
| **Chakra UI v3** | Panda CSS | 高 | ~60KB | 优秀 |
| **Ant Design** | CSS-in-JS | 中 | ~120KB | 良好 |
| **Radix UI** | Headless（无样式） | 无限 | ~15KB | 优秀 |
| **Ark UI** | Headless | 无限 | ~20KB | 优秀 |

## Vue 生态

| 库 | 说明 |
|----|------|
| **Nuxt UI** | Nuxt 官方，Tailwind 驱动 |
| **Vuetify** | Material Design，功能全面 |
| **PrimeVue** | 企业级，多主题 |
| **Radix Vue** | Radix 的 Vue 移植 |

---

## 深度对比：shadcn/ui vs Radix UI vs MUI vs Chakra UI v3

| 维度 | shadcn/ui | Radix UI | MUI (Material UI) | Chakra UI v3 |
|------|-----------|----------|-------------------|--------------|
| **分发方式** | CLI 复制源码到项目 | npm 安装 Headless 组件 | npm 安装预构建组件 | npm 安装预构建组件 |
| **样式方案** | Tailwind CSS | 无 (CSS-in-JS / 任意) | Emotion / CSS-in-JS | Panda CSS (v3) |
| **运行时开销** | 0 (编译后纯 CSS) | ~15KB | ~100KB | ~60KB |
| **RSC 兼容** | ✅ 完美 (无 JS 运行时) | ✅ | ⚠️ 需 `use client` | ✅ (v3 编译时) |
| **主题系统** | CSS 变量 + Tailwind 配置 | CSS 变量 / 无 | `ThemeProvider` | `tokens` / `semanticTokens` |
| **组件数量** | 50+ (且持续增长) | 30+ 底层原语 | 60+ (非常全面) | 40+ (常用齐全) |
| **设计自由度** | ⭐⭐⭐⭐⭐ (源码拥有) | ⭐⭐⭐⭐⭐ (完全自定义) | ⭐⭐⭐ (Material 风格强) | ⭐⭐⭐⭐ (主题灵活) |
| **TypeScript** | ⭐⭐⭐⭐⭐ (类名推断) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **无障碍 (a11y)** | ⭐⭐⭐⭐⭐ (Radix 底层) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **社区热度 (2026)** | 🔥 快速增长 | 稳定 | 成熟庞大 | 维护转型 |
| **代表项目** | Next.js 官方模板 | 设计系统底层 | 大量企业后台 | 设计系统 / 新项目中 |

---

## 代码示例

### shadcn/ui (CLI 安装 + 源码拥有)
```bash
# 初始化
npx shadcn@latest init --yes --template next --base-color slate

# 添加组件 (源码复制到项目中)
npx shadcn add button card dialog
```

```tsx
// app/page.tsx — 使用 shadcn/ui 组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Home() {
  return (
    <div className="p-8">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>账户概览</CardTitle>
          <CardDescription>查看您的账户状态和余额。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold">¥12,580.00</p>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">查看详情</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>交易明细</DialogTitle>
                <DialogDescription>最近 30 天的交易记录。</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div className="flex justify-between"><span>工资收入</span><span className="text-green-600">+¥15,000</span></div>
                <div className="flex justify-between"><span>超市购物</span><span className="text-red-500">-¥420</span></div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Radix UI (Headless — 完全自定义样式)
```tsx
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import './dialog.css'; // 完全自定义 CSS

export function CustomDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="custom-trigger">打开对话框</button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="custom-overlay" />
        <Dialog.Content className="custom-content">
          <Dialog.Title className="custom-title">确认操作</Dialog.Title>
          <Dialog.Description className="custom-description">
            此操作不可撤销，请确认。
          </Dialog.Description>

          <div className="flex gap-2 mt-4">
            <Dialog.Close asChild>
              <button className="btn-secondary">取消</button>
            </Dialog.Close>
            <button className="btn-primary" onClick={() => alert('Confirmed!')}>
              确认
            </button>
          </div>

          <Dialog.Close className="custom-close">
            <span aria-hidden>×</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### MUI (Material UI) v6
```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';

const theme = createTheme({
  palette: {
    primary: { main: '#0070f3' },
  },
});

export function MuiExample() {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Material Card
          </Typography>
          <Typography variant="body2" color="text.secondary">
            使用 Material Design 设计语言的卡片组件。
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)} sx={{ mt: 2 }}>
            打开对话框
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>对话框标题</DialogTitle>
        <DialogContent>
          <Typography>Material UI 对话框内容区域。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
```

### Chakra UI v3 (Panda CSS 驱动)
```tsx
import { Button, Card, Heading, Text, Dialog, Portal, CloseButton } from '@chakra-ui/react';
import { useState } from 'react';

export function ChakraExample() {
  const [open, setOpen] = useState(false);

  return (
    <Card.Root maxW="sm">
      <Card.Body gap="2">
        <Card.Title>Chakra UI v3</Card.Title>
        <Card.Description>
          使用 Panda CSS 的新一代 Chakra UI。
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
          <Dialog.Trigger asChild>
            <Button variant="outline">查看</Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>确认操作</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <Text>Chakra UI v3 使用 Ark UI 作为底层原语，支持 RSC。</Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                  <Button onClick={() => setOpen(false)}>确认</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Card.Footer>
    </Card.Root>
  );
}
```

---

## 选型建议

| 场景 | 推荐库 | 原因 |
|------|--------|------|
| Next.js App Router / RSC | **shadcn/ui** | 零运行时，源码拥有，Tailwind 集成 |
| 企业级后台系统 | **MUI** / **Ant Design** | 组件最全面，生态成熟 |
| 高度定制设计系统 | **Radix UI** + Tailwind | 完全控制样式，a11y 内置 |
| 跨框架设计系统 | **Ark UI** | React / Vue / Solid 共享底层 |
| Vue 3 项目 | **Nuxt UI** / **Radix Vue** | 官方支持，类型安全 |
| 遗留项目维护 | **Chakra UI v2** | 逐步迁移到 v3 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| shadcn/ui | https://ui.shadcn.com/docs | 官方文档与组件库 |
| Radix UI | https://www.radix-ui.com/primitives/docs/overview/introduction | Headless UI 原语文档 |
| MUI (Material UI) | https://mui.com/material-ui/getting-started/ | 官方文档 |
| Chakra UI v3 | https://www.chakra-ui.com/docs/get-started/installation | 官方文档 |
| Ark UI | https://ark-ui.com/react/docs/overview/introduction | 跨框架 Headless UI |
| Ant Design | https://ant.design/docs/react/introduce | 官方文档 |
| Nuxt UI | https://ui.nuxt.com/getting-started | Nuxt 官方 UI 库 |
| Radix Vue | https://www.radix-vue.com/ | Radix 的 Vue 移植 |
| A11y Project | https://www.a11yproject.com/ | 无障碍最佳实践 |
| WAI-ARIA Practices | https://www.w3.org/WAI/ARIA/apg/ | W3C 无障碍指南 |

---

*最后更新: 2026-04-29*
