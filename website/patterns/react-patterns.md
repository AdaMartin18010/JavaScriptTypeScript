---
title: 'React 设计模式指南'
---

# React 设计模式指南

本文档涵盖了 React 开发中最常用的 10 种设计模式，使用 TypeScript 编写代码示例。

---

## 目录

- [React 设计模式指南](#react-设计模式指南)
  - [目录](#目录)
  - [1. 容器/展示组件模式](#1-容器展示组件模式)
    - [问题描述](#问题描述)
    - [解决方案](#解决方案)
    - [代码示例](#代码示例)
    - [何时使用](#何时使用)
    - [注意事项](#注意事项)
  - [2. 高阶组件 (HOC) 模式](#2-高阶组件-hoc-模式)
    - [问题描述](#问题描述-1)
    - [解决方案](#解决方案-1)
    - [代码示例](#代码示例-1)
    - [何时使用](#何时使用-1)
    - [注意事项](#注意事项-1)
  - [3. Render Props 模式](#3-render-props-模式)
    - [问题描述](#问题描述-2)
    - [解决方案](#解决方案-2)
    - [代码示例](#代码示例-2)
    - [何时使用](#何时使用-2)
    - [注意事项](#注意事项-2)
  - [4. Hooks 模式](#4-hooks-模式)
    - [问题描述](#问题描述-3)
    - [解决方案](#解决方案-3)
    - [代码示例](#代码示例-3)
      - [4.1 useState - 状态管理](#41-usestate---状态管理)
      - [4.2 useEffect - 副作用处理](#42-useeffect---副作用处理)
      - [4.3 自定义 Hooks](#43-自定义-hooks)
    - [何时使用](#何时使用-3)
    - [注意事项](#注意事项-3)
  - [5. Compound Components 模式](#5-compound-components-模式)
    - [问题描述](#问题描述-4)
    - [解决方案](#解决方案-4)
    - [代码示例](#代码示例-4)
    - [何时使用](#何时使用-4)
    - [注意事项](#注意事项-4)
  - [6. Context API 模式](#6-context-api-模式)
    - [问题描述](#问题描述-5)
    - [解决方案](#解决方案-5)
    - [代码示例](#代码示例-5)
    - [何时使用](#何时使用-5)
    - [注意事项](#注意事项-5)
  - [7. 状态提升模式](#7-状态提升模式)
    - [问题描述](#问题描述-6)
    - [解决方案](#解决方案-6)
    - [代码示例](#代码示例-6)
    - [何时使用](#何时使用-6)
    - [注意事项](#注意事项-6)
  - [8. 控制反转模式](#8-控制反转模式)
    - [问题描述](#问题描述-7)
    - [解决方案](#解决方案-7)
    - [代码示例](#代码示例-7)
    - [何时使用](#何时使用-7)
    - [注意事项](#注意事项-7)
  - [9. Portals 和模态框模式](#9-portals-和模态框模式)
    - [问题描述](#问题描述-8)
    - [解决方案](#解决方案-8)
    - [代码示例](#代码示例-8)
    - [何时使用](#何时使用-8)
    - [注意事项](#注意事项-8)
  - [10. Suspense 和错误边界模式](#10-suspense-和错误边界模式)
    - [问题描述](#问题描述-9)
    - [解决方案](#解决方案-9)
    - [代码示例](#代码示例-9)
    - [何时使用](#何时使用-9)
    - [注意事项](#注意事项-9)
  - [总结](#总结)
  - [推荐学习资源](#推荐学习资源)

---

## 1. 容器/展示组件模式

### 问题描述

在 React 应用中，组件往往同时承担**数据获取/状态管理**和**UI 渲染**的双重职责，导致：

- 组件难以复用
- 测试困难（需要模拟数据获取）
- 职责不清晰

### 解决方案

将组件分为两类：

- **容器组件（Container）**：负责数据获取、状态管理、业务逻辑
- **展示组件（Presentational）**：负责 UI 渲染，接收数据通过 props

### 代码示例

```tsx
// 展示组件: UserProfile.tsx
// 只负责渲染 UI，不处理数据获取

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UserProfileProps {
  user: User;
  onEdit: () => void;
  loading?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  loading = false,
}) => {
  if (loading) {
    return <div className="user-profile-skeleton">加载中...</div>;
  }

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} className="avatar" />
      <div className="user-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
      <button onClick={onEdit}>编辑</button>
    </div>
  );
};

// 容器组件: UserProfileContainer.tsx
// 负责数据获取和状态管理

import { useState, useEffect } from 'react';
import { UserProfile } from './UserProfile';

export const UserProfileContainer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据获取
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user/current');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleEdit = () => {
    // 处理编辑逻辑，如导航到编辑页面
    console.log('编辑用户');
  };

  if (!user) {
    return <div>用户未找到</div>;
  }

  return <UserProfile user={user} onEdit={handleEdit} loading={loading} />;
};
```

### 何时使用

- 需要从 API 获取数据的场景
- 需要在多个地方复用相同 UI 但数据源不同的场景
- 需要为组件编写单元测试时

### 注意事项

| 容器组件 | 展示组件 |
|---------|---------|
| 关注"如何做" | 关注"长什么样" |
| 包含状态和业务逻辑 | 纯函数，无状态 |
| 通常不渲染 DOM 或样式 | 负责 DOM 结构和样式 |
| 数据来源：API、Redux、Context | 数据来源：props |

**注意**：随着 Hooks 的普及，这种模式的使用频率有所下降，但核心思想（关注点分离）仍然重要。

---

## 2. 高阶组件 (HOC) 模式

### 问题描述

需要在多个组件之间共享相同的功能（如数据获取、权限检查、日志记录），但不想重复代码。

### 解决方案

高阶组件是一个函数，接收一个组件并返回一个增强后的组件。

```
HOC(Component) => EnhancedComponent
```

### 代码示例

```tsx
// withAuth.tsx - 权限检查 HOC

import React, { ComponentType } from 'react';

interface WithAuthProps {
  // 注入到包装组件的 props
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
}

// 权限检查 HOC
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole?: string
): React.FC<P & WithAuthProps> {
  const WithAuthComponent: React.FC<P & WithAuthProps> = (props) => {
    const [auth, setAuth] = React.useState<AuthState>({
      isAuthenticated: false,
      userRole: null,
    });

    React.useEffect(() => {
      // 检查认证状态
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          // 验证 token 并获取用户信息
          const userInfo = await verifyToken(token);
          setAuth({
            isAuthenticated: true,
            userRole: userInfo.role,
          });
        }
      };
      checkAuth();
    }, []);

    // 未登录，重定向到登录页
    if (!auth.isAuthenticated) {
      return <div>请先登录</div>;
    }

    // 检查角色权限
    if (requiredRole && auth.userRole !== requiredRole) {
      return <div>无权访问此页面</div>;
    }

    // 渲染原始组件，传入所有 props
    return <WrappedComponent {...(props as P)} />;
  };

  // 设置 displayName 便于调试
  WithAuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuthComponent;
}

// 辅助函数
function getDisplayName<P>(Component: ComponentType<P>): string {
  return Component.displayName || Component.name || 'Component';
}

// 模拟 token 验证
async function verifyToken(token: string): Promise<{ role: string }> {
  // 实际实现中调用 API 验证
  return { role: 'admin' };
}

// 使用示例
interface AdminDashboardProps {
  title: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>只有管理员能看到此页面</p>
    </div>
  );
};

// 使用 HOC 包装组件
export const ProtectedAdminDashboard = withAuth(AdminDashboard, 'admin');

// 使用
// <ProtectedAdminDashboard title="管理员控制台" />
```

**更多 HOC 示例 - 数据获取:**

```tsx
// withDataFetching.tsx

interface WithDataFetchingProps<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export function withDataFetching<T, P extends WithDataFetchingProps<T>>(
  WrappedComponent: ComponentType<P>,
  url: string
): React.FC<Omit<P, keyof WithDataFetchingProps<T>>> {
  return function WithDataFetchingWrapper(props) {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [url]);

    // 将 data、loading、error 注入到包装组件
    return (
      <WrappedComponent
        {...(props as P)}
        data={data!}
        loading={loading}
        error={error}
      />
    );
  };
}
```

### 何时使用

- 需要跨组件复用逻辑时（认证、日志、数据获取）
- 需要在渲染前对 props 进行转换或检查
- 需要给组件添加额外的生命周期行为

### 注意事项

1. **不要滥用 HOC**：多个 HOC 嵌套会导致 props 传递困难和调试困难
2. **命名冲突**：多个 HOC 可能注入相同的 prop 名称
3. **静态方法丢失**：需要手动复制静态方法到增强组件
4. **Refs 转发问题**：需要使用 `React.forwardRef` 转发 refs
5. **优先考虑 Hooks**：现代 React 中，许多 HOC 场景可以用自定义 Hooks 替代

---

## 3. Render Props 模式

### 问题描述

与 HOC 类似，需要在组件间共享代码，但希望更灵活地控制渲染内容。

### 解决方案

使用一个值为函数的 prop，该函数返回 React 元素，让组件决定如何渲染。

### 代码示例

```tsx
// MouseTracker.tsx - 鼠标位置追踪组件

import React, { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  // render prop 模式：接收一个函数，函数参数是 mouse position
  render: (mouse: MousePosition) => React.ReactNode;
}

export const MouseTracker: React.FC<MouseTrackerProps> = ({ render }) => {
  const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    setMouse({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div style={{ height: '100vh' }} onMouseMove={handleMouseMove}>
      {render(mouse)}
    </div>
  );
};

// 使用方式 1: 显示鼠标坐标
const MouseCoordinates: React.FC = () => {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>
          鼠标位置: ({x}, {y})
        </p>
      )}
    />
  );
};

// 使用方式 2: 跟随鼠标的图片
const MouseFollower: React.FC = () => {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <img
          src="/cat.png"
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
          }}
          alt="跟随鼠标的猫"
        />
      )}
    />
  );
};
```

**更实用的示例 - 数据获取组件:**

```tsx
// DataFetcher.tsx - 通用数据获取组件

interface DataFetcherProps<T> {
  url: string;
  render: (state: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return <>{render({ ...state, refetch: fetchData })}</>;
}

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  return (
    <DataFetcher<User[]>
      url="/api/users"
      render={({ data, loading, error, refetch }) => {
        if (loading) return <div>加载用户列表...</div>;
        if (error) return (
          <div>
            <p>错误: {error.message}</p>
            <button onClick={refetch}>重试</button>
          </div>
        );
        return (
          <ul>
            {data?.map((user) => (
              <li key={user.id}>
                {user.name} - {user.email}
              </li>
            ))}
          </ul>
        );
      }}
    />
  );
};
```

### 何时使用

- 需要在多个组件间共享有状态逻辑
- 需要让使用者完全控制渲染内容时
- 不想引入 HOC 的嵌套复杂性时

### 注意事项

1. **不要在 render 方法中使用箭头函数**：会导致子组件不必要的重新渲染
2. **与 HOC 的选择**：
   - HOC：添加功能到现有组件
   - Render Props：需要动态决定渲染内容
3. **现代替代方案**：许多 Render Props 场景可以用自定义 Hooks 替代

---

## 4. Hooks 模式

### 问题描述

- 类组件中复用状态逻辑困难（需要使用 HOC 或 Render Props）
- 类组件中的 this 指向问题
- 生命周期方法常常包含不相关的逻辑

### 解决方案

Hooks 让你可以在函数组件中使用状态和其他 React 特性，提供了更简洁、更可复用的代码组织方式。

### 代码示例

#### 4.1 useState - 状态管理

```tsx
import { useState } from 'react';

// 基础用法
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount((prev) => prev + 1)}>+1 (函数式)</button>
    </div>
  );
};

// 对象状态
interface FormState {
  username: string;
  email: string;
  age: number;
}

const UserForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    age: 0,
  });

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form>
      <input
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
        placeholder="用户名"
      />
      <input
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="number"
        value={form.age}
        onChange={(e) => updateField('age', Number(e.target.value))}
        placeholder="年龄"
      />
    </form>
  );
};
```

#### 4.2 useEffect - 副作用处理

```tsx
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 数据获取
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        if (!cancelled) {
          setUser(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // 清理函数：处理竞态条件和内存泄漏
    return () => {
      cancelled = true;
    };
  }, [userId]); // 依赖数组

  // 订阅/取消订阅
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小改变:', window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 空依赖数组 = 只在挂载和卸载时执行

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return <div>用户名: {user.name}</div>;
};
```

#### 4.3 自定义 Hooks

```tsx
// useLocalStorage.ts - 本地存储 Hook

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 获取初始值
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 更新 localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // 触发自定义事件，让其他使用相同 key 的 hook 更新
        window.dispatchEvent(new StorageEvent('storage', { key }));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 监听其他标签页的更改
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue]);

  return [storedValue, setValue];
}

// 使用示例
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      当前主题: {theme}
    </button>
  );
};
```

```tsx
// useDebounce.ts - 防抖 Hook

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例 - 搜索框防抖
const SearchInput: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('搜索:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
};
```

```tsx
// useFetch.ts - 数据获取 Hook

import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

// 使用示例
const UserList: React.FC = () => {
  const { data: users, loading, error, refetch } = useFetch<User[]>('/api/users');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button onClick={refetch}>刷新</button>
    </div>
  );
};
```

### 何时使用

- **useState**: 任何需要在组件中管理状态的场景
- **useEffect**: 数据获取、订阅、手动 DOM 操作等副作用
- **自定义 Hooks**: 需要在多个组件间复用状态逻辑时

### 注意事项

1. **只在最顶层调用 Hooks**：不要在循环、条件或嵌套函数中调用
2. **只在 React 函数中调用 Hooks**：函数组件或自定义 Hooks 中
3. **依赖数组要完整**：使用 `eslint-plugin-react-hooks` 自动检查
4. **避免过度使用 useEffect**：不是所有状态变化都需要 useEffect
5. **清理副作用**：确保取消订阅、清除定时器等

---

## 5. Compound Components 模式

### 问题描述

需要创建一组相互关联、共享状态的组件（如 Tabs、Accordion、Select），但不想通过复杂的 props 传递来管理它们之间的关系。

### 解决方案

Compound Components 是一组组件，它们一起工作来完成一个任务，通过隐式共享状态来通信。

### 代码示例

```tsx
// Tabs.tsx - 复合组件示例

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Context 用于在组件间共享状态
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// 根组件
interface TabsProps {
  children: ReactNode;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> & {
  List: typeof TabList;
  Trigger: typeof TabTrigger;
  Content: typeof TabContent;
} = ({ children, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || '');

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

// 自定义 Hook 用于访问 Context
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs 子组件必须在 Tabs 组件内使用');
  }
  return context;
};

// Tab 列表容器
interface TabListProps {
  children: ReactNode;
  className?: string;
}

const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return <div className={`tab-list ${className || ''}`}>{children}</div>;
};

// Tab 触发器
interface TabTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

const TabTrigger: React.FC<TabTriggerProps> = ({
  value,
  children,
  disabled = false,
}) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      className={`tab-trigger ${isActive ? 'active' : ''}`}
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

// Tab 内容
interface TabContentProps {
  value: string;
  children: ReactNode;
}

const TabContent: React.FC<TabContentProps> = ({ value, children }) => {
  const { activeTab } = useTabs();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div className="tab-content" role="tabpanel">
      {children}
    </div>
  );
};

// 将子组件附加到 Tabs
Tabs.List = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;

export { Tabs };

// 使用示例
const App: React.FC = () => {
  return (
    <Tabs defaultTab="account" onChange={(tab) => console.log('切换到:', tab)}>
      <Tabs.List>
        <Tabs.Trigger value="account">账户</Tabs.Trigger>
        <Tabs.Trigger value="password">密码</Tabs.Trigger>
        <Tabs.Trigger value="settings" disabled>
          设置
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="account">
        <h3>账户信息</h3>
        <p>这里是账户信息内容...</p>
      </Tabs.Content>

      <Tabs.Content value="password">
        <h3>修改密码</h3>
        <p>这里是密码修改表单...</p>
      </Tabs.Content>

      <Tabs.Content value="settings">
        <h3>系统设置</h3>
        <p>这里是设置选项...</p>
      </Tabs.Content>
    </Tabs>
  );
};
```

**另一个示例 - Accordion:**

```tsx
// Accordion.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccordionContextType {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

const Accordion: React.FC<AccordionProps> & {
  Item: typeof AccordionItem;
  Header: typeof AccordionHeader;
  Content: typeof AccordionContent;
} = ({ children, allowMultiple = false, defaultExpanded = [] }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
};

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion 子组件必须在 Accordion 内使用');
  }
  return context;
};

interface AccordionItemProps {
  value: string;
  children: ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ value, children }) => {
  return (
    <div className="accordion-item" data-value={value}>
      {children}
    </div>
  );
};

interface AccordionHeaderProps {
  value: string;
  children: ReactNode;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  value,
  children,
}) => {
  const { expandedItems, toggleItem } = useAccordion();
  const isExpanded = expandedItems.has(value);

  return (
    <button
      className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
      onClick={() => toggleItem(value)}
      aria-expanded={isExpanded}
    >
      {children}
      <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
    </button>
  );
};

interface AccordionContentProps {
  value: string;
  children: ReactNode;
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  value,
  children,
}) => {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(value);

  if (!isExpanded) return null;

  return <div className="accordion-content">{children}</div>;
};

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Content = AccordionContent;

export { Accordion };

// 使用
const FAQ: React.FC = () => {
  return (
    <Accordion allowMultiple>
      <Accordion.Item value="q1">
        <Accordion.Header value="q1">什么是 React?</Accordion.Header>
        <Accordion.Content value="q1">
          React 是一个用于构建用户界面的 JavaScript 库。
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="q2">
        <Accordion.Header value="q2">什么是 Hooks?</Accordion.Header>
        <Accordion.Content value="q2">
          Hooks 让你可以在函数组件中使用状态和其他 React 特性。
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};
```

### 何时使用

- 需要创建一组紧密关联的 UI 组件时
- 组件之间有隐式状态需要共享时
- 想要提供声明式的 API 给使用者

### 注意事项

1. **清晰的文档**：由于组件之间关系隐式，需要良好的文档说明
2. **错误处理**：当子组件在错误上下文中使用时给出清晰错误信息
3. **灵活性 vs 约束**：在灵活性和正确性之间找到平衡
4. **TypeScript 支持**：确保类型安全，特别是在嵌套组件中

---

## 6. Context API 模式

### 问题描述

props  drilling（逐层传递 props）在深层组件树中变得繁琐且难以维护。需要在组件树中多个层级共享全局状态。

### 解决方案

使用 React Context API 提供一种在组件之间共享数据的方式，无需显式通过组件树逐层传递 props。

### 代码示例

```tsx
// ThemeContext.tsx - 主题管理

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // 根据系统偏好解析主题
  const resolvedTheme: 'light' | 'dark' = React.useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);

  // 应用主题到 DOM
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // 监听系统主题变化
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // 触发重新渲染
      setThemeState('system');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }, []);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// 自定义 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用');
  }
  return context;
};

// 使用示例
const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>当前主题: {theme} (解析为: {resolvedTheme})</p>
      <button onClick={toggleTheme}>切换主题</button>
      <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
        <option value="system">跟随系统</option>
      </select>
    </div>
  );
};
```

**更复杂的示例 - 购物车 Context:**

```tsx
// CartContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';

// 类型定义
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.id !== action.payload.id
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Actions
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  // 计算派生状态
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart 必须在 CartProvider 内使用');
  }
  return context;
};

// 使用示例
const ProductCard: React.FC<{ product: Omit<CartItem, 'quantity'> }> = ({
  product,
}) => {
  const { addItem, openCart } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    openCart();
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  );
};

const CartIcon: React.FC = () => {
  const { totalItems, toggleCart } = useCart();

  return (
    <button onClick={toggleCart} className="cart-icon">
      购物车 ({totalItems})
    </button>
  );
};
```

### 何时使用

- 需要在多个不相关的组件间共享全局数据（主题、用户信息、语言）
- props drilling 超过 2-3 层时
- 需要全局状态管理但不想引入 Redux 等库时

### 注意事项

1. **不要滥用 Context**：不是所有全局状态都需要 Context，考虑使用 URL 状态、本地存储等
2. **性能考虑**：Context 变化会导致所有消费者重新渲染
3. **拆分 Context**：将频繁变化和不常变化的 Context 分开
4. **默认值**：为 Context 提供合理的默认值
5. **考虑状态管理库**：对于复杂应用，考虑 Redux、Zustand、Jotai 等

---

## 7. 状态提升模式

### 问题描述

多个兄弟组件需要共享和同步状态，但它们没有直接的父子关系。

### 解决方案

将共享状态提升到最近的共同祖先组件，通过 props 向下传递状态和回调函数。

### 代码示例

```tsx
// 温度转换器示例

import React, { useState } from 'react';

// 类型定义
interface TemperatureInputProps {
  temperature: string;
  scale: 'c' | 'f';
  onTemperatureChange: (value: string) => void;
}

// 温度输入组件（展示组件）
const TemperatureInput: React.FC<TemperatureInputProps> = ({
  temperature,
  scale,
  onTemperatureChange,
}) => {
  const scaleNames: Record<string, string> = {
    c: '摄氏度',
    f: '华氏度',
  };

  return (
    <fieldset>
      <legend>输入温度 ({scaleNames[scale]}):</legend>
      <input
        type="number"
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
};

//  boiling 判断组件
const BoilingVerdict: React.FC<{ celsius: number }> = ({ celsius }) => {
  if (celsius >= 100) {
    return <p>水会沸腾。</p>;
  }
  return <p>水不会沸腾。</p>;
};

// 转换函数
function toCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function tryConvert(value: string, convert: (n: number) => number): string {
  const input = parseFloat(value);
  if (Number.isNaN(input)) {
    return '';
  }
  const output = convert(input);
  const rounded = Math.round(output * 1000) / 1000;
  return rounded.toString();
}

// 父组件（容器组件）- 状态提升到这里
const Calculator: React.FC = () => {
  const [temperature, setTemperature] = useState<string>('');
  const [scale, setScale] = useState<'c' | 'f'>('c');

  const celsius =
    scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit =
    scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;

  const handleCelsiusChange = (value: string) => {
    setScale('c');
    setTemperature(value);
  };

  const handleFahrenheitChange = (value: string) => {
    setScale('f');
    setTemperature(value);
  };

  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      <BoilingVerdict celsius={parseFloat(celsius) || 0} />
    </div>
  );
};

export default Calculator;
```

**更复杂的示例 - 表单状态提升:**

```tsx
// 多步骤表单的状态提升

import React, { useState } from 'react';

// 表单数据类型
interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  addressInfo: {
    street: string;
    city: string;
    zipCode: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
}

// 步骤 1: 个人信息
interface PersonalInfoStepProps {
  data: FormData['personalInfo'];
  onChange: (data: FormData['personalInfo']) => void;
  onNext: () => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const handleChange = (field: keyof FormData['personalInfo'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <h2>个人信息</h2>
      <input
        placeholder="名"
        value={data.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
      />
      <input
        placeholder="姓"
        value={data.lastName}
        onChange={(e) => handleChange('lastName', e.target.value)}
      />
      <input
        placeholder="邮箱"
        type="email"
        value={data.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      <button onClick={onNext}>下一步</button>
    </div>
  );
};

// 步骤 2: 地址信息
interface AddressInfoStepProps {
  data: FormData['addressInfo'];
  onChange: (data: FormData['addressInfo']) => void;
  onNext: () => void;
  onBack: () => void;
}

const AddressInfoStep: React.FC<AddressInfoStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const handleChange = (field: keyof FormData['addressInfo'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <h2>地址信息</h2>
      <input
        placeholder="街道"
        value={data.street}
        onChange={(e) => handleChange('street', e.target.value)}
      />
      <input
        placeholder="城市"
        value={data.city}
        onChange={(e) => handleChange('city', e.target.value)}
      />
      <input
        placeholder="邮编"
        value={data.zipCode}
        onChange={(e) => handleChange('zipCode', e.target.value)}
      />
      <button onClick={onBack}>上一步</button>
      <button onClick={onNext}>下一步</button>
    </div>
  );
};

// 步骤 3: 支付信息
interface PaymentInfoStepProps {
  data: FormData['paymentInfo'];
  onChange: (data: FormData['paymentInfo']) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const PaymentInfoStep: React.FC<PaymentInfoStepProps> = ({
  data,
  onChange,
  onSubmit,
  onBack,
}) => {
  const handleChange = (field: keyof FormData['paymentInfo'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <h2>支付信息</h2>
      <input
        placeholder="卡号"
        value={data.cardNumber}
        onChange={(e) => handleChange('cardNumber', e.target.value)}
      />
      <input
        placeholder="有效期"
        value={data.expiryDate}
        onChange={(e) => handleChange('expiryDate', e.target.value)}
      />
      <input
        placeholder="CVV"
        type="password"
        value={data.cvv}
        onChange={(e) => handleChange('cvv', e.target.value)}
      />
      <button onClick={onBack}>上一步</button>
      <button onClick={onSubmit}>提交</button>
    </div>
  );
};

// 父组件 - 状态提升到这里
const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: { firstName: '', lastName: '', email: '' },
    addressInfo: { street: '', city: '', zipCode: '' },
    paymentInfo: { cardNumber: '', expiryDate: '', cvv: '' },
  });

  const handleSubmit = () => {
    console.log('提交表单:', formData);
    // 发送到服务器
  };

  return (
    <div className="multi-step-form">
      <div className="progress-bar">
        步骤 {currentStep} / 3
      </div>

      {currentStep === 1 && (
        <PersonalInfoStep
          data={formData.personalInfo}
          onChange={(data) =>
            setFormData((prev) => ({ ...prev, personalInfo: data }))
          }
          onNext={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <AddressInfoStep
          data={formData.addressInfo}
          onChange={(data) =>
            setFormData((prev) => ({ ...prev, addressInfo: data }))
          }
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <PaymentInfoStep
          data={formData.paymentInfo}
          onChange={(data) =>
            setFormData((prev) => ({ ...prev, paymentInfo: data }))
          }
          onSubmit={handleSubmit}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
};

export default MultiStepForm;
```

### 何时使用

- 多个兄弟组件需要同步状态时
- 子组件需要修改父组件的状态时
- 需要实现"受控组件"模式时

### 注意事项

1. **找到正确的提升层级**：提升到最近的共同祖先，不要过度提升
2. **单向数据流**：状态提升配合回调函数实现清晰的单向数据流
3. **组件解耦**：子组件应该只依赖 props，不依赖特定父组件
4. **考虑 Context**：如果 props drilling 过深，考虑使用 Context
5. **状态管理库**：复杂应用考虑使用专门的状态管理方案

---

## 8. 控制反转模式

### 问题描述

组件内部硬编码了某些行为，导致：

- 难以复用和定制
- 需要修改组件源码才能改变行为
- 组件过于臃肿，包含过多职责

### 解决方案

将控制权交给使用组件的开发者，通过 props 或组合方式让使用者决定组件的行为和渲染内容。

### 代码示例

```tsx
// 传统方式 vs 控制反转方式

// ============ 传统方式（不好）============
// 组件内部硬编码了行为和样式

const TraditionalButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'blue',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
      }}
    >
      点击我
    </button>
  );
};

// ============ 控制反转方式（好）============
// 组件接收 children 和 className，控制权交给使用者

interface InvertedButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const InvertedButton: React.FC<InvertedButtonProps> = ({
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
    >
      {children}
    </button>
  );
};

// 使用方式 - 使用者完全控制内容和样式
const App: React.FC = () => {
  return (
    <div>
      {/* 自定义内容和样式 */}
      <InvertedButton
        onClick={() => console.log(' clicked')}
        className="btn-primary btn-large"
      >
        <span>🚀</span> 主要按钮
      </InvertedButton>

      <InvertedButton
        onClick={() => console.log(' clicked')}
        className="btn-secondary"
        disabled
      >
        禁用按钮
      </InvertedButton>
    </div>
  );
};
```

**更高级的控制反转 - 卡片组件:**

```tsx
// Card.tsx - 高度可定制的卡片组件

import React, { ReactNode } from 'react';

// 定义各个部分的 render props 类型
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children?: ReactNode;
  renderHeader?: () => ReactNode;
  className?: string;
}

interface CardBodyProps {
  children?: ReactNode;
  renderBody?: () => ReactNode;
  className?: string;
}

interface CardFooterProps {
  children?: ReactNode;
  renderFooter?: () => ReactNode;
  className?: string;
}

// 主组件
const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children, className = '' }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

// 子组件
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  renderHeader,
  className = '',
}) => {
  return (
    <div className={`card-header ${className}`}>
      {renderHeader ? renderHeader() : children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  renderBody,
  className = '',
}) => {
  return (
    <div className={`card-body ${className}`}>
      {renderBody ? renderBody() : children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  renderFooter,
  className = '',
}) => {
  return (
    <div className={`card-footer ${className}`}>
      {renderFooter ? renderFooter() : children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };

// 使用示例 - 多种方式使用同一组件
const UserCard: React.FC<{ user: { name: string; avatar: string; bio: string } }> = ({
  user,
}) => {
  // 方式 1: 使用 children
  return (
    <Card className="user-card">
      <Card.Header>
        <img src={user.avatar} alt={user.name} />
        <h3>{user.name}</h3>
      </Card.Header>
      <Card.Body>
        <p>{user.bio}</p>
      </Card.Body>
      <Card.Footer>
        <button>关注</button>
      </Card.Footer>
    </Card>
  );
};

const ProductCard: React.FC<{
  product: { title: string; price: number; image: string };
}> = ({ product }) => {
  // 方式 2: 使用 render prop
  return (
    <Card className="product-card">
      <Card.Header
        renderHeader={() => (
          <div className="product-image-container">
            <img src={product.image} alt={product.title} />
            <span className="badge">新品</span>
          </div>
        )}
      />
      <Card.Body
        renderBody={() => (
          <>
            <h4>{product.title}</h4>
            <p className="price">${product.price}</p>
          </>
        )}
      />
      <Card.Footer
        renderFooter={() => (
          <div className="product-actions">
            <button>加入购物车</button>
            <button>收藏</button>
          </div>
        )}
      />
    </Card>
  );
};
```

**异步组件的控制反转 - 数据获取:**

```tsx
// DataComponent.tsx - 完全控制数据获取逻辑的组件

import React, { ReactNode } from 'react';

interface DataComponentProps<T> {
  // 使用者提供数据获取函数
  fetchData: () => Promise<T>;
  // 使用者提供渲染逻辑
  render: (data: T) => ReactNode;
  // 使用者提供加载状态渲染
  renderLoading?: () => ReactNode;
  // 使用者提供错误处理
  renderError?: (error: Error) => ReactNode;
}

interface DataComponentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

class DataComponent<T> extends React.Component<
  DataComponentProps<T>,
  DataComponentState<T>
> {
  state: DataComponentState<T> = {
    data: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const data = await this.props.fetchData();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      });
    }
  };

  render() {
    const { data, loading, error } = this.state;
    const { render, renderLoading, renderError } = this.props;

    if (loading && renderLoading) {
      return <>{renderLoading()}</>;
    }

    if (error && renderError) {
      return <>{renderError(error)}</>;
    }

    if (data) {
      return <>{render(data)}</>;
    }

    return null;
  }
}

// 使用示例 - 完全控制所有方面
const UserList: React.FC = () => {
  return (
    <DataComponent
      fetchData={async () => {
        const response = await fetch('/api/users');
        return response.json();
      }}
      renderLoading={() => (
        <div className="custom-loading">
          <Spinner />
          <p>正在加载用户...</p>
        </div>
      )}
      renderError={(error) => (
        <div className="custom-error">
          <AlertIcon />
          <p>加载失败: {error.message}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      )}
      render={(users) => (
        <ul className="user-list">
          {users.map((user: any) => (
            <li key={user.id}>
              <UserAvatar user={user} />
              <span>{user.name}</span>
            </li>
          ))}
        </ul>
      )}
    />
  );
};
```

### 何时使用

- 需要创建高度可复用和可定制的组件时
- 组件的行为需要根据不同场景变化时
- 避免"道具爆炸"（props drilling 过多配置项）时

### 注意事项

1. **API 设计要一致**：约定优于配置，但也要提供足够的灵活性
2. **提供合理的默认值**：即使控制权交给使用者，也要有合理的默认行为
3. **文档要清晰**：说明哪些部分可以被控制，如何使用
4. **不要过度设计**：简单组件不需要复杂的控制反转
5. **组合优于继承**：使用组合和 render props 而不是继承

---

## 9. Portals 和模态框模式

### 问题描述

- 模态框、提示框等 UI 元素需要突破父组件的 CSS 约束（如 `overflow: hidden`）
- 需要确保模态框在 DOM 层级上位于顶层，避免 z-index 问题
- 需要处理焦点管理和无障碍访问

### 解决方案

使用 React Portal 将子组件渲染到 DOM 树的不同位置，通常直接挂载到 `document.body`。

### 代码示例

```tsx
// Portal.tsx

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export const Portal: React.FC<PortalProps> = ({
  children,
  container = document.body,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, container) : null;
};
```

```tsx
// Modal.tsx - 完整的模态框组件

import React, { useEffect, useRef, useCallback } from 'react';
import { Portal } from './Portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 处理 ESC 键关闭
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  // 处理焦点陷阱（Focus Trap）
  useEffect(() => {
    if (!isOpen) return;

    // 保存之前聚焦的元素
    const previouslyFocused = document.activeElement as HTMLElement;

    // 将焦点移到模态框
    contentRef.current?.focus();

    // 添加键盘监听
    document.addEventListener('keydown', handleKeyDown);

    // 禁止背景滚动
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // 恢复之前的焦点
      previouslyFocused?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // 处理遮罩层点击
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (
      closeOnOverlayClick &&
      overlayRef.current === event.target
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Portal>
      {/* 遮罩层 */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        role="presentation"
      >
        {/* 模态框内容 */}
        <div
          ref={contentRef}
          className={`modal-content ${sizeClasses[size]}`}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflow: 'auto',
            outline: 'none',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex={-1}
        >
          {/* 头部 */}
          {(title || showCloseButton) && (
            <div
              className="modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              {title && (
                <h2
                  id="modal-title"
                  style={{ margin: 0, fontSize: '1.25rem' }}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="关闭"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* 内容 */}
          <div className="modal-body" style={{ padding: '20px' }}>
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// 使用示例
const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>打开模态框</button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="确认删除"
        size="sm"
      >
        <p>确定要删除这条记录吗？此操作不可撤销。</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setIsModalOpen(false)}>取消</button>
          <button
            onClick={() => {
              console.log('执行删除');
              setIsModalOpen(false);
            }}
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
};
```

**Tooltip 组件示例:**

```tsx
// Tooltip.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Portal } from './Portal';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    setCoords({ top, left });
  };

  const show = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const child = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <>
      {child}
      {isVisible && (
        <Portal>
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              backgroundColor: '#333',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: 1000,
              pointerEvents: 'none',
            }}
            role="tooltip"
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
};

// 使用
const Example: React.FC = () => {
  return (
    <Tooltip content="这是一个提示信息" position="top">
      <button>悬停查看提示</button>
    </Tooltip>
  );
};
```

### 何时使用

- 模态框、对话框、抽屉菜单
- Tooltip、Popover、下拉菜单
- 全局通知、Toast 提示
- 需要突破父组件 CSS 限制的元素

### 注意事项

1. **事件冒泡**：Portal 中的事件仍然会冒泡到 React 树的父组件
2. **无障碍访问**：
   - 设置 `role="dialog"` 和 `aria-modal="true"`
   - 实现焦点陷阱
   - 支持 ESC 键关闭
   - 恢复之前的焦点
3. **背景滚动**：打开模态框时禁用背景滚动
4. **z-index 管理**：确保 Portal 容器在 CSS 层级上正确
5. **SSR 兼容性**：服务端渲染时需要注意 Portal 的使用时机

---

## 10. Suspense 和错误边界模式

### 问题描述

- 异步数据获取导致 UI 闪烁和加载状态管理复杂
- 组件渲染错误导致整个应用崩溃
- 需要优雅地处理加载和错误状态

### 解决方案

- **Suspense**：声明式地处理异步操作，自动管理加载状态
- **Error Boundaries**：捕获子组件树中的 JavaScript 错误，防止整个应用崩溃

### 代码示例

```tsx
// ErrorBoundary.tsx - 错误边界组件

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 显示自定义 fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div
          style={{
            padding: '20px',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
          }}
        >
          <h2 style={{ color: '#c53030', marginTop: 0 }}>出错了</h2>
          <p style={{ color: '#742a2a' }}>
            应用程序遇到了一个错误。请刷新页面重试。
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '10px' }}>
              <summary>错误详情</summary>
              <pre
                style={{
                  backgroundColor: '#fed7d7',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#c53030',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```tsx
// Suspense 与数据获取模式

import React, { Suspense, useState, useTransition } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// 模拟数据获取函数
const fetchUserData = (userId: string): Promise<{ name: string; id: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === 'error') {
        reject(new Error('用户不存在'));
      } else {
        resolve({ name: `用户 ${userId}`, id: userId });
      }
    }, 1000);
  });
};

// 资源包装器 - 用于 Suspense 的数据获取模式
interface Resource<T> {
  read: () => T;
}

function wrapPromise<T>(promise: Promise<T>): Resource<T> {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: Error;

  const suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    }
  );

  return {
    read: () => {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      } else {
        return result;
      }
    },
  };
}

// 创建资源
const createUserResource = (userId: string) => {
  return wrapPromise(fetchUserData(userId));
};

// 子组件 - 使用资源
const UserProfile: React.FC<{ resource: Resource<{ name: string; id: string }> }> = ({
  resource,
}) => {
  const user = resource.read();
  return (
    <div>
      <h3>{user.name}</h3>
      <p>ID: {user.id}</p>
    </div>
  );
};

// 加载 fallback
const LoadingFallback: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <div className="spinner" />
    <p>加载中...</p>
  </div>
);

// 错误 fallback
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div style={{ padding: '20px', color: 'red' }}>
    <p>加载失败: {error.message}</p>
  </div>
);

// 父组件
const App: React.FC = () => {
  const [userId, setUserId] = useState('1');
  const [resource, setResource] = useState(() => createUserResource('1'));
  const [isPending, startTransition] = useTransition();

  const handleUserChange = (newUserId: string) => {
    startTransition(() => {
      setUserId(newUserId);
      setResource(createUserResource(newUserId));
    });
  };

  return (
    <div>
      <h1>用户管理系统</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => handleUserChange('1')}>用户 1</button>
        <button onClick={() => handleUserChange('2')}>用户 2</button>
        <button onClick={() => handleUserChange('error')}>错误用户</button>
      </div>

      {isPending && <div style={{ color: 'blue' }}>正在切换用户...</div>}

      <ErrorBoundary fallback={<ErrorFallback error={new Error('加载用户失败')} />}>
        <Suspense fallback={<LoadingFallback />}>
          <UserProfile resource={resource} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
```

**更现代的 React 18 Suspense 用法（配合数据获取库）:**

```tsx
// 使用 React Query 或 SWR 的现代 Suspense 用法

import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';

// 使用 React Query 的 Suspense 模式
const UserDetails: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};

// 嵌套 Suspense - 细粒度加载控制
const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>仪表盘</h1>

      {/* 用户信息的 Suspense */}
      <ErrorBoundary fallback={<div>用户信息加载失败</div>}>
        <Suspense fallback={<div>加载用户信息...</div>}>
          <UserDetails userId="current" />
        </Suspense>
      </ErrorBoundary>

      {/* 统计数据的 Suspense - 独立加载 */}
      <ErrorBoundary fallback={<div>统计数据加载失败</div>}>
        <Suspense fallback={<div>加载统计数据...</div>}>
          <StatisticsWidget />
        </Suspense>
      </ErrorBoundary>

      {/* 通知列表的 Suspense - 独立加载 */}
      <ErrorBoundary fallback={<div>通知加载失败</div>}>
        <Suspense fallback={<div>加载通知...</div>}>
          <NotificationsWidget />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

const StatisticsWidget: React.FC = () => {
  const { data: stats } = useSuspenseQuery({
    queryKey: ['statistics'],
    queryFn: fetchStatistics,
  });

  return (
    <div className="stats-widget">
      <div>总用户数: {stats.totalUsers}</div>
      <div>活跃用户: {stats.activeUsers}</div>
      <div>收入: ${stats.revenue}</div>
    </div>
  );
};

const NotificationsWidget: React.FC = () => {
  const { data: notifications } = useSuspenseQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  return (
    <ul className="notifications">
      {notifications.map((n: any) => (
        <li key={n.id}>{n.message}</li>
      ))}
    </ul>
  );
};

async function fetchStatistics() {
  // 模拟 API 调用
  return { totalUsers: 1000, activeUsers: 500, revenue: 50000 };
}

async function fetchNotifications() {
  // 模拟 API 调用
  return [
    { id: 1, message: '新订单 #123' },
    { id: 2, message: '用户注册' },
  ];
}
```

### 何时使用

**Suspense:**

- 数据获取（配合 React Query、SWR 或 Relay）
- 代码分割（React.lazy + Suspense）
- 需要声明式加载状态管理时

**Error Boundaries:**

- 任何可能出错的组件树
- 第三方组件的包装
- 关键功能的降级处理

### 注意事项

1. **Suspense 目前支持的场景**:
   - React.lazy 代码分割
   - Next.js 等框架的数据获取
   - React Query/SWR 等库的 Suspense 模式
   - 手动实现的 "throw promise" 模式

2. **Error Boundaries 的限制**:
   - 不捕获事件处理器中的错误
   - 不捕获异步代码中的错误（除非使用额外库）
   - 不捕获服务端渲染错误
   - 不捕获自身渲染错误

3. **最佳实践**:
   - 在应用顶层设置全局 Error Boundary
   - 在关键功能模块设置局部 Error Boundary
   - 使用多个 Suspense 边界实现细粒度加载控制
   - 配合 `useTransition` 实现优雅的状态过渡

---

## 总结

| 模式 | 主要用途 | 现代替代方案 |
|-----|---------|-------------|
| 容器/展示组件 | 关注点分离 | Hooks + 自定义 Hook |
| 高阶组件 | 横切关注点复用 | 自定义 Hooks |
| Render Props | 灵活的组件组合 | Hooks |
| Hooks | 状态逻辑复用 | - |
| Compound Components | 相关组件组合 | Context + Hooks |
| Context API | 全局状态共享 | Zustand、Jotai、Redux |
| 状态提升 | 兄弟组件状态共享 | Context、状态管理库 |
| 控制反转 | 可定制组件设计 | Render Props、Hooks |
| Portals | 突破 DOM 层级限制 | - |
| Suspense/Error Boundary | 异步和错误处理 | - |

---

## 推荐学习资源

- [React 官方文档](https://react.dev/)
- [Patterns.dev - React Patterns](https://patterns.dev/react/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog/)
