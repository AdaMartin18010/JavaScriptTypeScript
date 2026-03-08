/**
 * @file React 组件模式
 * @category Frontend Frameworks → React
 * @difficulty medium
 * @tags react, components, hooks, patterns
 * 
 * @description
 * React 组件设计模式与最佳实践：
 * - 容器/展示组件
 * - 复合组件
 * - Render Props
 * - Higher-Order Components
 * - Custom Hooks
 * 
 * @jsx React.createElement
 */

// ============================================================================
// TypeScript React 类型导入
// ============================================================================

type ReactNode = any;
type FC<P = {}> = (props: P) => ReactNode;

// ============================================================================
// 1. 容器/展示组件模式 (Container/Presentational)
// ============================================================================

// 数据类型
interface User {
  id: string;
  name: string;
  email: string;
}

// 展示组件 - 只负责渲染
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onEdit }) => {
  return {
    type: 'div',
    props: {
      className: 'user-card',
      children: [
        { type: 'h3', props: { children: user.name } },
        { type: 'p', props: { children: user.email } },
        {
          type: 'button',
          props: {
            onClick: () => onEdit(user),
            children: 'Edit'
          }
        }
      ]
    }
  };
};

// 容器组件 - 负责数据获取和状态管理
interface UserContainerProps {
  userId: string;
}

interface UserContainerState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

class UserContainer {
  private state: UserContainerState = {
    user: null,
    loading: true,
    error: null
  };

  async fetchUser(userId: string): Promise<void> {
    try {
      this.state.loading = true;
      // 模拟 API 调用
      const user: User = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };
      this.state.user = user;
    } catch (err) {
      this.state.error = err as Error;
    } finally {
      this.state.loading = false;
    }
  }

  handleEdit = (user: User): void => {
    console.log('Editing user:', user);
  };

  render(): ReactNode {
    if (this.state.loading) {
      return { type: 'div', props: { children: 'Loading...' } };
    }
    if (this.state.error) {
      return { type: 'div', props: { children: `Error: ${this.state.error.message}` } };
    }
    if (!this.state.user) {
      return { type: 'div', props: { children: 'No user found' } };
    }

    return UserCard({ user: this.state.user, onEdit: this.handleEdit });
  }
}

// ============================================================================
// 2. 复合组件模式 (Compound Components)
// ============================================================================

// Tabs 组件组
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = {
  activeTab: '1',
  setActiveTab: (id: string) => {}
};

interface TabsProps {
  children: ReactNode;
  defaultTab: string;
}

const Tabs: FC<TabsProps> = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = [defaultTab, (id: string) => {}];
  
  return {
    type: 'div',
    props: {
      className: 'tabs',
      children
    }
  };
};

interface TabListProps {
  children: ReactNode;
}

const TabList: FC<TabListProps> = ({ children }) => {
  return {
    type: 'div',
    props: {
      className: 'tab-list',
      children
    }
  };
};

interface TabProps {
  id: string;
  children: ReactNode;
}

const Tab: FC<TabProps> = ({ id, children }) => {
  return {
    type: 'button',
    props: {
      className: 'tab',
      children
    }
  };
};

interface TabPanelProps {
  id: string;
  children: ReactNode;
}

const TabPanel: FC<TabPanelProps> = ({ id, children }) => {
  return {
    type: 'div',
    props: {
      className: 'tab-panel',
      children
    }
  };
};

// 使用示例
const TabsExample: FC = () => {
  return {
    type: Tabs,
    props: {
      defaultTab: '1',
      children: [
        {
          type: TabList,
          props: {
            children: [
              { type: Tab, props: { id: '1', children: 'Tab 1' } },
              { type: Tab, props: { id: '2', children: 'Tab 2' } }
            ]
          }
        },
        {
          type: TabPanel,
          props: { id: '1', children: 'Content 1' }
        },
        {
          type: TabPanel,
          props: { id: '2', children: 'Content 2' }
        }
      ]
    }
  };
};

// ============================================================================
// 3. Render Props 模式
// ============================================================================

interface MouseTrackerProps {
  render: (state: { x: number; y: number }) => ReactNode;
}

const MouseTracker: FC<MouseTrackerProps> = ({ render }) => {
  const [position, setPosition] = [{ x: 0, y: 0 }, (p: any) => {}];

  return {
    type: 'div',
    props: {
      style: { height: '100vh' },
      onMouseMove: (e: any) => setPosition({ x: e.clientX, y: e.clientY }),
      children: render(position)
    }
  };
};

// 使用 Render Props
const MouseTrackerExample: FC = () => {
  return {
    type: MouseTracker,
    props: {
      render: ({ x, y }: { x: number; y: number }) => ({
        type: 'p',
        props: { children: `Mouse position: ${x}, ${y}` }
      })
    }
  };
};

// ============================================================================
// 4. Higher-Order Component (HOC)
// ============================================================================

interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: FC<P>
): FC<P & WithLoadingProps> {
  return ({ isLoading, ...props }: any) => {
    if (isLoading) {
      return { type: 'div', props: { children: 'Loading...' } };
    }
    return { type: WrappedComponent, props };
  };
}

// 使用 HOC
const DataDisplay: FC<{ data: string }> = ({ data }) => {
  return { type: 'div', props: { children: data } };
};

const DataDisplayWithLoading = withLoading(DataDisplay);

// ============================================================================
// 5. Custom Hooks 模式
// ============================================================================

// useFetch Hook
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  // Hook 实现
  const state = {
    data: null as T | null,
    loading: true,
    error: null as Error | null,
    refetch: () => {}
  };

  // 模拟数据获取
  setTimeout(() => {
    state.loading = false;
    state.data = {} as T;
  }, 1000);

  return state;
}

// useLocalStorage Hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const stored = localStorage.getItem(key);
  const initial = stored ? JSON.parse(stored) : initialValue;
  
  const setValue = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [initial, setValue];
}

// useDebounce Hook
function useDebounce<T>(value: T, delay: number): T {
  // 实际实现应使用 useState 和 useEffect
  return value;
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== React 组件模式 ===\n');

  console.log('1. 容器/展示组件');
  console.log('   - UserCard: 纯展示，接收数据和回调');
  console.log('   - UserContainer: 管理数据获取和状态');

  console.log('\n2. 复合组件');
  console.log('   - Tabs, TabList, Tab, TabPanel');
  console.log('   - 通过隐式状态共享实现组件协作');

  console.log('\n3. Render Props');
  console.log('   - MouseTracker 通过 render 函数共享状态');
  console.log('   - 灵活控制渲染逻辑');

  console.log('\n4. Higher-Order Component');
  console.log('   - withLoading 添加加载状态');
  console.log('   - 复用横切关注点逻辑');

  console.log('\n5. Custom Hooks');
  console.log('   - useFetch: 数据获取');
  console.log('   - useLocalStorage: 本地存储');
  console.log('   - useDebounce: 防抖');

  console.log('\nReact 模式要点:');
  console.log('- 容器/展示分离关注点');
  console.log('- 复合组件提供灵活 API');
  console.log('- Hooks 是现代 React 的首选复用方式');
}

// ============================================================================
// 导出
// ============================================================================

export {
  UserCard,
  UserContainer,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  MouseTracker,
  withLoading,
  useFetch,
  useLocalStorage,
  useDebounce
};

export type {
  User,
  UserCardProps,
  TabsProps,
  MouseTrackerProps,
  WithLoadingProps,
  UseFetchResult
};
