# CSS-in-JS 完整指南

> 深入理解现代 React 样式解决方案，从理论基础到生产实践

---

## 目录

1. [CSS-in-JS 理论基础](#1-css-in-js-理论基础)
2. [styled-components 深度指南](#2-styled-components-深度指南)
3. [Emotion 深度指南](#3-emotion-深度指南)
4. [Tailwind CSS 方法论](#4-tailwind-css-方法论)
5. [CSS Modules](#5-css-modules)
6. [样式性能优化](#6-样式性能优化)
7. [设计令牌 Design Tokens](#7-设计令牌-design-tokens)

---

## 1. CSS-in-JS 理论基础

### 1.1 样式封装原理

CSS-in-JS 的核心思想是将 CSS 与 JavaScript/TypeScript 代码紧密结合，实现真正的组件级样式隔离。

#### 传统 CSS 的问题

```tsx
// 传统方式：全局命名空间污染
// Button.css
.button { /* 可能被其他组件覆盖 */ }
.button-primary { /* 命名冲突风险 */ }

// 组件.tsx
import './Button.css'; // 全局引入，难以追踪
```

#### CSS-in-JS 的解决方案

```tsx
// 样式与组件真正绑定
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 12px 24px;
  border-radius: 4px;
  background: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
`;

// 生成的类名类似：.sc-bdVaJa .sc-bwzfXH（唯一且可预测）
```

#### 封装层级对比

| 方案 | 封装粒度 | 作用域 | 运行时开销 |
|------|----------|--------|------------|
| 传统 CSS | 无 | 全局 | 无 |
| BEM | 中等 | 手动命名空间 | 无 |
| CSS Modules | 组件级 | 构建时局部化 | 低 |
| CSS-in-JS | 组件级 | 运行时局部化 | 中-高 |

### 1.2 运行时 vs 构建时

#### 运行时方案（如 styled-components）

```tsx
import styled from 'styled-components';

const DynamicButton = styled.button<{ $size: 'sm' | 'md' | 'lg' }>`
  padding: ${props => {
    // 每次渲染都执行
    switch (props.$size) {
      case 'sm': return '8px 16px';
      case 'lg': return '16px 32px';
      default: return '12px 24px';
    }
  }};
`;

// 优点：完全的动态能力
// 缺点：运行时计算开销
```

#### 构建时方案（如 Linaria、Twin.macro）

```tsx
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

// 构建时提取为静态 CSS
const title = css`
  font-size: 24px;
  color: #333;
`;

// 零运行时开销
const Title = styled.h1`
  ${title}
`;
```

#### 性能对比示例

```tsx
// ❌ 运行时：每次渲染都创建新样式
const BadComponent = ({ color }) => {
  const style = { backgroundColor: color }; // 新对象引用
  return <div style={style} />;
};

// ✅ 优化：使用 useMemo 缓存
import { useMemo } from 'react';

const BetterComponent = ({ color }) => {
  const style = useMemo(() => ({
    backgroundColor: color
  }), [color]);
  return <div style={style} />;
};

// ✅ 最佳：CSS-in-JS 库内部优化
import styled from 'styled-components';

const BestComponent = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  // styled-components 会智能缓存和复用样式
`;
```

### 1.3 哈希生成策略

不同的 CSS-in-JS 库采用不同的类名生成策略：

```tsx
// styled-components: 基于组件名 + 内容哈希
// 输出：.sc-bdVaJa { ... }
//      .sc-gsnTZa { ... }

// Emotion: 基于内容哈希
// 输出：.css-1a2b3c4 { ... }

// Linaria: 构建时生成确定性哈希
// 输出：.title_a1b2c3 { ... }
```

#### 自定义哈希生成

```tsx
// styled-components: babel-plugin 配置
// .babelrc
{
  "plugins": [
    ["styled-components", {
      "displayName": true,      // 开发时显示组件名
      "fileName": false,        // 不包含文件名
      "minify": true,           // 生产环境压缩
      "pure": true              // 标记为纯函数用于 tree-shaking
    }]
  ]
}

// Emotion: 缓存 key 配置
/** @jsxImportSource @emotion/react */
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cache = createCache({
  key: 'app',           // 类名前缀：app-xxx
  prefix: true,         // 自动添加浏览器前缀
  speedy: true,         // 快速插入模式
});

const App = () => (
  <CacheProvider value={cache}>
    <YourApp />
  </CacheProvider>
);
```

---

## 2. styled-components 深度指南

### 2.1 基础用法

#### 创建样式组件

```tsx
import styled, { css } from 'styled-components';

// 基础样式组件
const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 基于 props 的条件样式
interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  /* 基础样式 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* 变体样式 */
  ${props => props.$variant === 'primary' && css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  `}

  ${props => props.$variant === 'secondary' && css`
    background: transparent;
    border: 2px solid #667eea;
    color: #667eea;
  `}

  ${props => props.$variant === 'danger' && css`
    background: #ef4444;
    color: white;
  `}

  /* 尺寸样式 */
  ${props => props.$size === 'sm' && css`
    padding: 8px 16px;
    font-size: 14px;
  `}

  ${props => props.$size === 'md' && css`
    padding: 12px 24px;
    font-size: 16px;
  `}

  ${props => props.$size === 'lg' && css`
    padding: 16px 32px;
    font-size: 18px;
  `}

  /* 全宽样式 */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
`;

// 使用
const App = () => (
  <>
    <StyledButton $variant="primary" $size="lg">
      主要按钮
    </StyledButton>
    <StyledButton $variant="secondary" $size="sm" $fullWidth>
      次要按钮
    </StyledButton>
  </>
);
```

#### 样式继承与扩展

```tsx
// 继承现有组件
const PrimaryButton = styled(StyledButton).attrs({ $variant: 'primary' })``;

// 扩展并覆盖样式
const IconButton = styled(StyledButton)`
  padding: 12px;
  border-radius: 50%;

  svg {
    width: 20px;
    height: 20px;
  }
`;

// 使用 attrs 设置默认 props
const LinkButton = styled(StyledButton).attrs({
  as: 'a',
  $variant: 'secondary',
})`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
```

### 2.2 主题系统

#### 定义主题类型和实现

```tsx
// theme.ts
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#0f172a',
    surface: '#1e293b',
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
  },
};
```

#### 主题 Provider 和类型声明

```tsx
// styled.d.ts
import 'styled-components';
import { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// App.tsx
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './theme';

const App = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <YourApp />
    </ThemeProvider>
  );
};
```

#### 使用主题的组件

```tsx
import styled, { useTheme } from 'styled-components';

// 方式1: 通过 props.theme 访问
const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
`;

// 方式2: 使用辅助函数
const Container = styled.div`
  ${({ theme }) => `
    background: ${theme.colors.background};
    padding: ${theme.spacing.md};
    font-family: ${theme.typography.fontFamily};
  `}
`;

// 方式3: 在常规组件中使用 hook
const ThemeToggle = () => {
  const theme = useTheme();

  return (
    <button style={{ color: theme.colors.primary }}>
      切换主题
    </button>
  );
};
```

### 2.3 全局样式

```tsx
// GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* 基础样式 */
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    line-height: 1.5;
    min-height: 100vh;
  }

  /* 主题感知的选择高亮 */
  ::selection {
    background: ${props => props.theme.colors.primary}40;
    color: ${props => props.theme.colors.text.primary};
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.text.disabled};
    border-radius: 4px;
  }

  /* 表单元素基础样式 */
  input, textarea, button {
    font-family: inherit;
  }

  /* 聚焦样式 */
  :focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* 动画减少偏好 */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// App.tsx
import { GlobalStyles } from './GlobalStyles';

const App = () => (
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <YourApp />
  </ThemeProvider>
);
```

### 2.4 动画支持

```tsx
import styled, { keyframes, css } from 'styled-components';

// 定义关键帧
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// 使用动画的组件
const FadeInContainer = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

const Spinner = styled.div<{ $size?: number }>`
  width: ${props => props.$size || 24}px;
  height: ${props => props.$size || 24}px;
  border: 2px solid ${props => props.theme.colors.text.disabled};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// 骨架屏动画
const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.surface} 25%,
    ${props => props.theme.colors.background} 50%,
    ${props => props.theme.colors.surface} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

// 条件动画
const AnimatedCard = styled.div<{ $isVisible: boolean }>`
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateY(${props => props.$isVisible ? 0 : '20px'});
  transition: opacity 0.3s ease, transform 0.3s ease;

  ${props => props.$isVisible && css`
    animation: ${fadeIn} 0.5s ease-out;
  `}
`;
```

### 2.5 TypeScript 支持

#### 完整的类型定义示例

```tsx
// types.ts
import { HTMLAttributes, ReactNode } from 'react';

export interface ButtonBaseProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Button.tsx
import styled, { css } from 'styled-components';
import { ButtonBaseProps } from './types';

// transient props 使用 $ 前缀，不会传递到 DOM
interface StyledButtonProps {
  $variant: NonNullable<ButtonBaseProps['variant']>;
  $size: NonNullable<ButtonBaseProps['size']>;
  $isLoading: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  /* 变体样式 */
  ${props => {
    const variants = {
      primary: css`
        background: ${props.theme.colors.primary};
        color: white;
        &:hover { background: ${props.theme.colors.primary}dd; }
      `,
      secondary: css`
        background: transparent;
        border: 1px solid ${props.theme.colors.text.disabled};
        color: ${props.theme.colors.text.primary};
        &:hover { border-color: ${props.theme.colors.primary}; }
      `,
      ghost: css`
        background: transparent;
        color: ${props.theme.colors.text.secondary};
        &:hover { background: ${props.theme.colors.surface}; }
      `,
      danger: css`
        background: ${props.theme.colors.error};
        color: white;
        &:hover { background: ${props.theme.colors.error}dd; }
      `,
    };
    return variants[props.$variant];
  }}

  /* 尺寸样式 */
  ${props => {
    const sizes = {
      sm: css`padding: 6px 12px; font-size: 14px;`,
      md: css`padding: 10px 20px; font-size: 16px;`,
      lg: css`padding: 14px 28px; font-size: 18px;`,
    };
    return sizes[props.$size];
  }}

  /* 加载状态 */
  ${props => props.$isLoading && css`
    opacity: 0.7;
    cursor: wait;
    pointer-events: none;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonBaseProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => (
  <StyledButton
    $variant={variant}
    $size={size}
    $isLoading={isLoading}
    disabled={isDisabled || isLoading}
    {...props}
  >
    {isLoading && <Spinner $size={16} />}
    {!isLoading && leftIcon}
    {children}
    {!isLoading && rightIcon}
  </StyledButton>
);
```

---

## 3. Emotion 深度指南

### 3.1 css prop

Emotion 的 `css` prop 是最直观的使用方式，类似于内联样式但功能更强大。

```tsx
// 配置 JSX 转换
// tsconfig.json
{
  "compilerOptions": {
    "jsxImportSource": "@emotion/react"
  }
}

// 或者使用经典的 pragma
/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { ReactNode } from 'react';

// 基础用法
const BasicExample = () => (
  <div
    css={css`
      padding: 16px;
      background: #f0f0f0;
      border-radius: 8px;
    `}
  >
    Hello Emotion!
  </div>
);

// 使用主题
const ThemeAware = () => (
  <div
    css={theme => css`
      background: ${theme.colors.background};
      color: ${theme.colors.text.primary};
      padding: ${theme.spacing.md};
    `}
  >
    主题感知样式
  </div>
);

// 条件样式
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const Alert = ({ type, children }: AlertProps) => {
  const styles = css`
    padding: 16px;
    border-radius: 8px;
    font-weight: 500;

    ${type === 'info' && css`
      background: #e0f2fe;
      color: #0369a1;
      border-left: 4px solid #0ea5e9;
    `}

    ${type === 'success' && css`
      background: #dcfce7;
      color: #15803d;
      border-left: 4px solid #22c55e;
    `}

    ${type === 'warning' && css`
      background: #fef3c7;
      color: #b45309;
      border-left: 4px solid #f59e0b;
    `}

    ${type === 'error' && css`
      background: #fee2e2;
      color: #b91c1c;
      border-left: 4px solid #ef4444;
    `}
  `;

  return <div css={styles}>{children}</div>;
};

// 样式组合
const baseStyles = css`
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const primaryStyles = css`
  ${baseStyles}
  background: #3b82f6;
  color: white;

  &:hover {
    background: #2563eb;
  }
`;

const Button = () => (
  <button css={primaryStyles}>点击我</button>
);
```

### 3.2 styled API

Emotion 的 `styled` API 与 styled-components 类似，但有一些独特特性。

```tsx
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// 基础用法
const Box = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 基于 props
interface CardProps {
  elevation?: 0 | 1 | 2 | 3;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = styled.div<CardProps>`
  background: white;
  border-radius: 12px;

  /* 阴影层级 */
  box-shadow: ${props => {
    const shadows = [
      'none',
      '0 1px 3px rgba(0,0,0,0.12)',
      '0 4px 6px rgba(0,0,0,0.1)',
      '0 10px 20px rgba(0,0,0,0.15)',
    ];
    return shadows[props.elevation || 0];
  }};

  /* 内边距 */
  padding: ${props => {
    const paddings = { sm: '12px', md: '20px', lg: '32px' };
    return paddings[props.padding || 'md'];
  }};
`;

// 样式对象方式（适合动态样式）
const DynamicButton = styled.button<{ $color: string }>(props => ({
  backgroundColor: props.$color,
  color: 'white',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
  },
}));

// 组合样式
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const PrimaryButton = styled.button`
  ${baseButtonStyles}
  background: #3b82f6;
  color: white;
`;

// 组件选择器（使用 class name）
const CardWithHeader = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
  }

  .card-body {
    padding: 16px;
  }
`;

// 使用
const Example = () => (
  <CardWithHeader>
    <div className="card-header">标题</div>
    <div className="card-body">内容</div>
  </CardWithHeader>
);
```

### 3.3 缓存策略

Emotion 使用强大的缓存系统来优化性能。

```tsx
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// 创建自定义缓存
const cache = createCache({
  key: 'app',           // CSS 属性名前缀
  prepend: true,        // 将样式插入到 <head> 开头
  speedy: true,         // 使用 insertRule API（更快）
  insertionPoint: document.querySelector('#emotion-insertion-point'),
});

// 应用缓存
const App = () => (
  <CacheProvider value={cache}>
    <YourApp />
  </CacheProvider>
);

// 多缓存实例（微前端场景）
const app1Cache = createCache({ key: 'app1' });
const app2Cache = createCache({ key: 'app2' });
```

#### 缓存调试和优化

```tsx
import { css } from '@emotion/react';

// 使用 label 增强开发体验
const styles = css`
  label: my-component;
  color: blue;
`;

// 生成的类名会包含 label: my-component-xxxx

// 避免不必要的重新渲染
import { useMemo } from 'react';

const OptimizedComponent = ({ color }: { color: string }) => {
  // 缓存样式对象
  const styles = useMemo(
    () => css`
      color: ${color};
      padding: 16px;
    `,
    [color]
  );

  return <div css={styles}>内容</div>;
};

// 或者使用样式工厂函数
const createStyles = (theme: Theme) => css`
  background: ${theme.colors.background};
  color: ${theme.colors.text.primary};
`;

const Component = () => {
  const theme = useTheme();
  // 样式基于 theme 创建，当 theme 变化时重新计算
  const styles = useMemo(() => createStyles(theme), [theme]);

  return <div css={styles}>内容</div>;
};
```

### 3.4 服务端渲染

Emotion 支持多种 SSR 方案。

```tsx
// Next.js 集成 (pages/_document.tsx)
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { extractCritical } from '@emotion/server';
import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';

interface Props extends DocumentInitialProps {
  ids: string[];
  css: string;
}

class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const originalRenderPage = ctx.renderPage;

    // 为 SSR 创建缓存
    const cache = createCache({ key: 'css', prepend: true });
    const { extractCriticalToChunks, constructStyleTagsFromChunks } =
      createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) =>
          function EnhanceApp(props) {
            return (
              <CacheProvider value={cache}>
                <App {...props} />
              </CacheProvider>
            );
          },
      });

    const initialProps = await Document.getInitialProps(ctx);
    const chunks = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = constructStyleTagsFromChunks(chunks);

    return {
      ...initialProps,
      emotionStyleTags,
    };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* 注入关键 CSS */}
          <style
            data-emotion={`css ${this.props.ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: this.props.css }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

#### 流式 SSR 支持

```tsx
// React 18 流式 SSR
import { renderToPipeableStream } from 'react-dom/server';
import createCache from '@emotion/cache';
import createEmotionServer from '@emotion/server/create-instance';

const cache = createCache({ key: 'css' });
const emotionServer = createEmotionServer(cache);

const stream = renderToPipeableStream(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>,
  {
    onShellReady() {
      // 提取关键 CSS
      const { css, ids } = emotionServer.extractCritical(
        // ... 获取 HTML
      );

      response.statusCode = 200;
      response.setHeader('Content-type', 'text/html');
      stream.pipe(response);
    },
  }
);
```

---

## 4. Tailwind CSS 方法论

### 4.1 Utility-first 理念

Tailwind 采用原子类（utility classes）的方式构建界面，摒弃传统的语义化类名。

```tsx
// ❌ 传统方式：语义化类名
const Button = () => (
  <button className="btn btn-primary btn-large">
    提交
  </button>
);

// ✅ Tailwind：原子类组合
const Button = () => (
  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
    提交
  </button>
);
```

#### 为什么使用 Utility-first？

```tsx
// 1. 无需离开 HTML/JSX 写 CSS
// 2. 减少 CSS 包体积（构建时 Purge）
// 3. 避免命名困难
// 4. 设计一致性（使用预设值）

// 对比：实现同样的按钮
// 传统 CSS 需要：
// - 创建 .btn, .btn-primary, .btn-lg 类
// - 维护按钮文档
// - 处理变体组合

// Tailwind 只需：
const Button = ({
  variant = 'primary',
  size = 'md',
  children
}: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  const sizes = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button className={`
      font-semibold rounded-lg transition-colors duration-200
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {children}
    </button>
  );
};
```

### 4.2 配置系统

```js
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // 扩展默认主题
    extend: {
      // 自定义颜色
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: '#ff6b6b',
      },

      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },

      // 自定义间距
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // 自定义断点
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },

      // 自定义阴影
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },

  // 插件
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  // 变体配置
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'disabled'],
    },
  },

  // 安全模式（防止 Purge 误删）
  safelist: [
    'bg-red-500',
    'text-3xl',
    'lg:text-4xl',
    {
      pattern: /bg-(red|green|blue)-(100|200|300)/,
    },
  ],
};

export default config;
```

### 4.3 自定义插件

```js
// tailwind-plugins/animations.js
const plugin = require('tailwindcss/plugin');

const animationPlugin = plugin(
  function({ addUtilities, theme, e }) {
    const animations = theme('customAnimations');

    const utilities = Object.entries(animations).map(([key, value]) => ({
      [`.${e(`animate-${key}`)}`]: {
        animationName: key,
        animationDuration: value.duration,
        animationTimingFunction: value.easing,
      },
    }));

    addUtilities(utilities);
  },
  {
    theme: {
      customAnimations: {
        'spin-slow': {
          duration: '3s',
          easing: 'linear',
        },
        'pulse-fast': {
          duration: '1s',
          easing: 'ease-in-out',
        },
      },
    },
  }
);

// 使用
module.exports = animationPlugin;

// 在 tailwind.config.ts 中
plugins: [
  require('./tailwind-plugins/animations'),
],
```

#### 高级插件示例

```js
// tailwind-plugins/ui-components.js
const plugin = require('tailwindcss/plugin');

const uiComponents = plugin(({ addComponents, theme }) => {
  // 添加组件样式
  addComponents({
    '.btn': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      fontWeight: theme('fontWeight.semibold'),
      borderRadius: theme('borderRadius.lg'),
      transition: 'all 150ms ease',

      '&:hover': {
        transform: 'translateY(-1px)',
      },

      '&:focus': {
        outline: 'none',
        boxShadow: theme('boxShadow.ring'),
      },

      '&:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed',
        transform: 'none',
      },
    },

    '.btn-primary': {
      backgroundColor: theme('colors.blue.500'),
      color: theme('colors.white'),

      '&:hover': {
        backgroundColor: theme('colors.blue.600'),
      },
    },

    '.card': {
      backgroundColor: theme('colors.white'),
      borderRadius: theme('borderRadius.xl'),
      boxShadow: theme('boxShadow.card'),
      overflow: 'hidden',
    },

    '.input': {
      width: '100%',
      padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
      border: `1px solid ${theme('colors.gray.300')}`,
      borderRadius: theme('borderRadius.md'),

      '&:focus': {
        borderColor: theme('colors.blue.500'),
        boxShadow: `0 0 0 3px ${theme('colors.blue.100')}`,
      },
    },
  });
});

module.exports = uiComponents;
```

### 4.4 JIT 模式

Tailwind CSS v3+ 默认使用 JIT（Just-In-Time）引擎。

```js
// tailwind.config.ts (v3 默认 JIT，无需配置 mode)
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // JIT 特性
  theme: {
    extend: {
      // 任意值支持
      spacing: {
        '128': '32rem',
      },
    },
  },
};
```

```tsx
// JIT 特性示例

// 1. 任意值（Arbitrary values）
const Component = () => (
  <>
    {/* 任意颜色 */}
    <div className="bg-[#1da1f2] text-[#14171a]">

    {/* 任意尺寸 */}
    <div className="w-[123px] h-[calc(100vh-4rem)]">

    {/* 任意阴影 */}
    <div className="shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">

    {/* 任意网格 */}
    <div className="grid-cols-[200px_1fr_100px]">
  </>
);

// 2. 动态类名注意事项
const Card = ({ color }: { color: string }) => {
  // ❌ 不会工作 - JIT 无法预测
  return <div className={`bg-${color}-500`} />;

  // ✅ 使用完整类名
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };
  return <div className={colorMap[color]} />;

  // ✅ 或任意值
  return <div className={`bg-[${color}]`} />;
};

// 3. 变体堆叠
const Button = () => (
  <button className="
    bg-blue-500
    hover:bg-blue-600
    focus:ring-2
    active:bg-blue-700
    disabled:opacity-50
    dark:bg-blue-900
    dark:hover:bg-blue-800
  ">
    按钮
  </button>
);
```

---

## 5. CSS Modules

### 5.1 局部作用域

CSS Modules 自动将类名局部化，避免全局命名空间污染。

```css
/* Button.module.css */
/* 局部类名：构建后变为 .Button_button__xxx */
.button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.button:hover {
  background: #2563eb;
}

/* 组合另一个类 */
.primary {
  composes: button;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 从其他文件组合 */
.base {
  composes: flex-center from './utils.module.css';
  composes: text-large from './typography.module.css';
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'default' | 'primary';
  children: React.ReactNode;
}

export const Button = ({ variant = 'default', children }: ButtonProps) => (
  <button className={styles[variant === 'primary' ? 'primary' : 'button']}>
    {children}
  </button>
);

// 使用 classnames 库处理复杂情况
import cn from 'classnames';

export const ButtonWithStates = ({
  variant,
  isLoading,
  isDisabled
}: ButtonProps) => (
  <button
    className={cn(styles.button, {
      [styles.primary]: variant === 'primary',
      [styles.loading]: isLoading,
      [styles.disabled]: isDisabled,
    })}
    disabled={isDisabled}
  >
    {isLoading ? '加载中...' : children}
  </button>
);
```

### 5.2 组合策略

```css
/* utils.module.css */
.flex {
  display: flex;
}

.flexCenter {
  composes: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
}

/* Card.module.css */
.card {
  /* 组合多个工具类 */
  composes: flexCenter from './utils.module.css';
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 变体组合 */
.cardLarge {
  composes: card;
  padding: 48px;
}

.cardCompact {
  composes: card;
  padding: 16px;
}
```

### 5.3 :global 和 :local

```css
/* 默认所有选择器都是局部的 */
.localClass {
  color: blue;
}

/* 明确标记为局部（默认行为） */
:local(.explicitLocal) {
  color: green;
}

/* 全局选择器 */
:global(.globalClass) {
  color: red;
}

/* 全局元素样式 */
:global(body) {
  margin: 0;
  font-family: system-ui;
}

/* 混合使用 */
.component {
  /* 局部样式 */
  padding: 16px;
}

.component :global(.tooltip) {
  /* .component 是局部的，.tooltip 是全局的 */
  position: absolute;
}

/* 第三方库覆盖 */
:global(.react-modal-overlay) {
  background: rgba(0, 0, 0, 0.8) !important;
}
```

```tsx
// TypeScript 类型声明
// types/css-modules.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
```

---

## 6. 样式性能优化

### 6.1 关键 CSS 提取

```tsx
// 关键 CSS 组件
import { useEffect, useState } from 'react';

// 使用 Critters 或类似工具提取关键 CSS
// next.config.js
const withCritters = require('next-critters');

module.exports = withCritters({
  critters: {
    preload: 'swap',
    pruneSource: true,
  },
});

// 手动内联关键 CSS
const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    /* 首屏关键样式 */
    .hero { min-height: 100vh; display: flex; align-items: center; }
    .navbar { position: fixed; top: 0; width: 100%; z-index: 1000; }
    /* ... 其他关键样式 */
  `}} />
);

// 动态导入非关键 CSS
const HeavyComponent = () => {
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    import('./heavy-styles.css').then(() => {
      setStylesLoaded(true);
    });
  }, []);

  if (!stylesLoaded) return <Skeleton />;
  return <div className="heavy-content">...</div>;
};
```

### 6.2 代码分割

```tsx
// 样式组件的按需加载
import { lazy, Suspense } from 'react';

// 延迟加载大型样式组件
const HeavyChart = lazy(() => import('./HeavyChart'));

const Dashboard = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart />
  </Suspense>
);

// CSS-in-JS 的动态导入
const loadThemeStyles = async (theme: string) => {
  const styles = await import(`./themes/${theme}.ts`);
  return styles.default;
};

const ThemeLoader = () => {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    loadThemeStyles('dark').then(setTheme);
  }, []);

  if (!theme) return null;
  return <ThemeProvider theme={theme}><App /></ThemeProvider>;
};
```

### 6.3 样式重复检测

```js
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-no-duplicate-selectors'],
  rules: {
    'plugin/no-duplicate-selectors': true,
    'declaration-block-no-duplicate-properties': true,
    'no-duplicate-at-import-rules': true,
  },
};

// 使用 PurgeCSS 消除未使用的样式
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: ['body', 'html', /^bg-/],
        deep: [/^modal/, /^tooltip/],
      },
    }),
    require('autoprefixer'),
  ],
};

// 运行时样式重复检测（开发环境）
if (process.env.NODE_ENV === 'development') {
  const styleSheets = Array.from(document.styleSheets);
  const rules = new Set();

  styleSheets.forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rules.has(rule.cssText)) {
          console.warn('重复样式规则:', rule.cssText);
        }
        rules.add(rule.cssText);
      });
    } catch (e) {
      // 跨域样式表无法访问
    }
  });
}
```

---

## 7. 设计令牌 Design Tokens

### 7.1 理论基础

设计令牌是设计系统的单一事实来源，将视觉属性抽象为可跨平台使用的变量。

```ts
// tokens/types.ts
export interface DesignTokens {
  colors: {
    brand: ColorScale;
    semantic: SemanticColors;
    neutral: NeutralScale;
  };
  spacing: SpacingScale;
  typography: TypographyScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  animation: AnimationScale;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface NeutralScale {
  white: string;
  50: string;
  100: string;
  // ...
  900: string;
  black: string;
}
```

### 7.2 Style Dictionary

```js
// style-dictionary.config.js
const StyleDictionary = require('style-dictionary');

// 自定义转换器
StyleDictionary.registerTransform({
  name: 'size/px-to-rem',
  type: 'value',
  matcher: token => token.attributes.category === 'spacing',
  transformer: token => `${token.value / 16}rem`,
});

// 自定义格式
StyleDictionary.registerFormat({
  name: 'css/variables-themed',
  formatter: function({ dictionary, options }) {
    const { outputReferences, theme } = options;

    return `
/* ${theme} Theme Variables */
:root[data-theme="${theme}"] {
${dictionary.allProperties
  .map(token => `  --${token.name}: ${token.value};`)
  .join('\n')}
}
    `.trim();
  },
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['attribute/cti', 'name/kebab', 'size/px-to-rem', 'color/css'],
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
    json: {
      buildPath: 'build/json/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested',
        },
      ],
    },
  },
};
```

#### 令牌源文件

```json
{
  "color": {
    "brand": {
      "50": { "value": "#eff6ff" },
      "100": { "value": "#dbeafe" },
      "500": { "value": "#3b82f6" },
      "600": { "value": "#2563eb" },
      "900": { "value": "#1e3a8a" }
    },
    "semantic": {
      "success": { "value": "#10b981" },
      "warning": { "value": "#f59e0b" },
      "error": { "value": "#ef4444" },
      "info": { "value": "#3b82f6" }
    }
  },
  "spacing": {
    "xs": { "value": "4" },
    "sm": { "value": "8" },
    "md": { "value": "16" },
    "lg": { "value": "24" },
    "xl": { "value": "32" },
    "2xl": { "value": "48" }
  },
  "font": {
    "size": {
      "xs": { "value": "12" },
      "sm": { "value": "14" },
      "base": { "value": "16" },
      "lg": { "value": "18" },
      "xl": { "value": "20" },
      "2xl": { "value": "24" }
    },
    "weight": {
      "normal": { "value": "400" },
      "medium": { "value": "500" },
      "semibold": { "value": "600" },
      "bold": { "value": "700" }
    }
  }
}
```

### 7.3 主题切换

```tsx
// hooks/useTheme.ts
import { useEffect, useState, createContext, useContext } from 'react';
import { lightTokens, darkTokens } from './tokens';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  tokens: typeof lightTokens;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 从 localStorage 或系统偏好读取
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    setTheme(saved || system);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const tokens = theme === 'light' ? lightTokens : darkTokens;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// 样式组件集成
import styled from 'styled-components';

const ThemedButton = styled.button`
  background: var(--color-brand-500);
  color: white;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);

  &:hover {
    background: var(--color-brand-600);
  }
`;

// Tailwind 集成
const TokenAwareComponent = () => {
  const { tokens } = useTheme();

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: tokens.colors.surface,
        color: tokens.colors.text.primary
      }}
    >
      主题感知内容
    </div>
  );
};
```

#### CSS 变量主题切换

```css
/* themes/light.css */
:root {
  /* 默认（浅色）主题 */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-brand: #3b82f6;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* 深色主题 */
[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-brand: #60a5fa;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
}

/* 平滑过渡 */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

```tsx
// 主题切换组件
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg"
      style={{
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
      }}
      aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

---

## 总结

| 方案 | 最佳适用场景 | 优点 | 缺点 |
|------|-------------|------|------|
| **styled-components** | 中小型项目、需要动态主题 | 生态成熟、开发者体验好 | 运行时开销较大 |
| **Emotion** | 性能敏感、需要 css prop | 灵活性高、SSR 支持好 | 学习曲线较陡 |
| **Tailwind** | 快速开发、设计系统驱动 | 开发效率高、包体积小 | HTML 类名臃肿 |
| **CSS Modules** | 大型项目、团队多元化 | 零运行时、类型安全 | 动态能力有限 |
| **Linaria** | 极致性能要求 | 零运行时、类 styled-components API | 配置复杂 |

选择合适的样式方案应基于项目规模、团队熟悉度和性能要求。现代 React 应用常常结合使用多种方案（如 Tailwind + CSS Modules 关键组件）。
