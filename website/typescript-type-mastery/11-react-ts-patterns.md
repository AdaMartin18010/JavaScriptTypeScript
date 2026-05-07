---
title: 11 React + TS 专属模式
description: 掌握 React 与 TypeScript 结合的专属模式：组件 Props 推断、Event 类型、Ref 类型、Context 类型和 Hooks 类型安全。
---

# 11 React + TS 专属模式

> **前置知识**：React、TypeScript 泛型
>
> **目标**：能够构建类型安全的 React 组件和 Hooks

---

## 1. 组件 Props 模式

### 1.1 基础 Props

```typescript
import { ReactNode, ButtonHTMLAttributes } from 'react';

// 基础接口
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

// 泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

### 1.2 Polymorphic 组件

```typescript
import { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

function Container<T extends ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// 使用
<Container>默认 div</Container>
<Container as="section" id="main">section 标签</Container>
<Container as="a" href="/">链接</Container>
```

---

## 2. Event 类型

### 2.1 常用事件类型

```typescript
import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  KeyboardEvent,
  FocusEvent
} from 'react';

function EventExamples() {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>提交</button>
    </form>
  );
}
```

---

## 3. Ref 类型

### 3.1 useRef

```typescript
import { useRef, useEffect } from 'react';

function RefExamples() {
  // DOM ref
  const inputRef = useRef<HTMLInputElement>(null);

  // 值 ref（不触发重渲染）
  const countRef = useRef<number>(0);

  // 回调 ref
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    if (measureRef.current) {
      console.log(measureRef.current.getBoundingClientRect());
    }
  }, []);

  return (
    <div>
      <input ref={inputRef} />
      <div ref={measureRef}>测量我</div>
    </div>
  );
}
```

### 3.2 forwardRef

```typescript
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## 4. Context 类型

### 4.1 类型安全 Context

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## 5. Hooks 类型

### 5.1 自定义 Hook

```typescript
import { useState, useCallback, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 使用
const { data, loading, error } = useFetch<User[]>('/api/users');
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **children 类型错误** | 使用 `ReactNode` 而非 `ReactElement` | `ReactNode` 包含 string/number |
| **event target 类型** | `e.target` 与 `e.currentTarget` 混淆 | 使用 `e.currentTarget` 获取绑定元素 |
| **ref 为 null** | 未检查 ref.current | 使用可选链 `ref.current?.focus()` |
| **Context 未定义** | 忘记 Provider | 添加运行时检查 |

---

## 延伸阅读

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Total TypeScript — React](https://www.totaltypescript.com/react-with-typescript)
