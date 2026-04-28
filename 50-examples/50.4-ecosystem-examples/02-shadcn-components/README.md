# shadcn/ui 组件示例

这是一个展示 shadcn/ui 组件库用法的完整示例项目，使用 Next.js + TypeScript + Tailwind CSS 构建。

## 什么是 shadcn/ui？

[shadcn/ui](https://ui.shadcn.com) 是一个设计精美的 UI 组件集合，它不是传统的组件库，而是**可复制的组件代码集合**：

- **不是 NPM 包**：组件代码直接复制到您的项目中
- **完全可定制**：您可以自由修改任何组件代码
- **基于 Radix UI**：提供优秀的可访问性和无头组件
- **Tailwind CSS 样式**：使用 Tailwind 的实用类进行样式设置
- **TypeScript 优先**：完整的类型支持

## 项目结构

```
.
├── components.json          # shadcn/ui 配置文件
├── next.config.mjs          # Next.js 配置
├── package.json             # 项目依赖
├── postcss.config.mjs       # PostCSS 配置
├── tailwind.config.ts       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
├── src/
│   ├── components/
│   │   ├── ui/             # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   └── badge.tsx
│   │   ├── ButtonDemo.tsx   # 按钮示例
│   │   ├── CardDemo.tsx     # 卡片示例
│   │   ├── FormDemo.tsx     # 表单示例
│   │   ├── DialogDemo.tsx   # 对话框示例
│   │   └── DataTableDemo.tsx # 数据表示例
│   ├── lib/
│   │   └── utils.ts         # 工具函数
│   ├── pages/
│   │   └── index.tsx        # 主页面
│   └── styles/
│       └── globals.css      # 全局样式
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看示例。

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 如何初始化新项目

### 使用 shadcn/ui CLI

```bash
# 1. 创建 Next.js 项目
mkdir my-app
cd my-app
npx shadcn@latest init
```

### 手动配置

1. **创建 Next.js 项目**

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
```

2. **初始化 shadcn/ui**

```bash
npx shadcn@latest init
```

3. **配置 options**
   - **Style**: Default (或 New York)
   - **Base color**: Slate (或其他)
   - **CSS variables**: Yes (推荐)

4. **配置路径别名** (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 如何添加组件

### 使用 CLI (推荐)

```bash
# 添加单个组件
npx shadcn@latest add button

# 添加多个组件
npx shadcn@latest add button card input label

# 查看所有可用组件
npx shadcn@latest add --help
```

### 手动添加

您也可以直接从 [shadcn/ui 文档](https://ui.shadcn.com/docs/components) 复制组件代码。

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 路径别名

项目使用 `@/*` 作为 `src/*` 的别名：

```typescript
// 使用路径别名
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 而不是相对路径
import { Button } from "../../components/ui/button"
```

### 类型安全

所有组件都提供完整的 TypeScript 类型支持：

```typescript
// Button 组件类型
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// 使用示例
<Button variant="outline" size="lg" onClick={handleClick}>
  点击我
</Button>
```

## 组件展示

本项目包含以下组件示例：

### 1. Button 按钮
- 多种变体：default、destructive、outline、ghost、link
- 多种尺寸：sm、default、lg、icon
- 支持 loading 状态和 disabled 状态

### 2. Card 卡片
- 可组合的卡片结构：Header、Content、Footer
- 支持标题和描述
- 灵活的布局选项

### 3. Form 表单
- 表单验证
- 错误处理
- 密码显示/隐藏切换
- 提交状态管理

### 4. Dialog 对话框
- 可访问的模态对话框
- 支持表单和确认操作
- 自定义动画效果

### 5. DataTable 数据表格
- 分页功能
- 状态标签
- 汇总统计

## 自定义主题

### 修改 CSS 变量

编辑 `src/styles/globals.css`：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### 修改 Tailwind 配置

编辑 `tailwind.config.ts`：

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // ...
    },
  },
}
```

## 常用命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 添加 shadcn 组件
npx shadcn@latest add [component]
```

## 相关资源

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)

## 许可证

MIT
