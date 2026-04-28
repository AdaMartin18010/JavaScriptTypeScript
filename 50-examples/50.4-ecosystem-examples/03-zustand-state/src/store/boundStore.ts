/**
 * Bound Store - 切片模式 (Slices Pattern)
 * 
 * 演示内容:
 * - 将多个 store 切片组合成一个统一的 store
 * - 切片之间的相互引用
 * - 模块化的状态管理架构
 * 
 * 使用场景:
 * - 大型应用的状态管理
 * - 需要跨切片通信的场景
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ==================== 类型定义 ====================

// 计数器切片
interface CounterSlice {
  count: number
  increment: () => void
  decrement: () => void
  incrementBy: (amount: number) => void
}

// 用户切片
interface UserSlice {
  username: string
  isLoggedIn: boolean
  setUsername: (name: string) => void
  login: () => void
  logout: () => void
}

// 主题切片
interface ThemeSlice {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

// 日志切片 - 演示跨切片通信
interface LogSlice {
  logs: Array<{ action: string; timestamp: number; details: string }>
  addLog: (action: string, details: string) => void
  clearLogs: () => void
}

// 组合后的完整 State
interface BoundState extends CounterSlice, UserSlice, ThemeSlice, LogSlice {
  // 可以在这里添加需要访问多个切片的计算属性或操作
  resetAll: () => void
}

// ==================== 切片创建函数 ====================

const createCounterSlice = (set: any, get: any, api: any): CounterSlice => ({
  count: 0,
  
  increment: () => {
    set((state: BoundState) => ({ count: state.count + 1 }), false, 'counter/increment')
    // 记录日志
    get().addLog('counter/increment', `Count: ${get().count}`)
  },
  
  decrement: () => {
    set((state: BoundState) => ({ count: state.count - 1 }), false, 'counter/decrement')
    get().addLog('counter/decrement', `Count: ${get().count}`)
  },
  
  incrementBy: (amount: number) => {
    set(
      (state: BoundState) => ({ count: state.count + amount }),
      false,
      'counter/incrementBy'
    )
    get().addLog('counter/incrementBy', `Added ${amount}, Count: ${get().count}`)
  },
})

const createUserSlice = (set: any, get: any, api: any): UserSlice => ({
  username: '',
  isLoggedIn: false,
  
  setUsername: (name: string) => {
    set({ username: name }, false, 'user/setUsername')
  },
  
  login: () => {
    if (!get().username) {
      console.warn('请输入用户名')
      return
    }
    set({ isLoggedIn: true }, false, 'user/login')
    get().addLog('user/login', `User: ${get().username}`)
  },
  
  logout: () => {
    get().addLog('user/logout', `User: ${get().username}`)
    set({ isLoggedIn: false, username: '' }, false, 'user/logout')
  },
})

const createThemeSlice = (set: any, get: any, api: any): ThemeSlice => ({
  theme: 'light',
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    set({ theme: newTheme }, false, 'theme/toggle')
    get().addLog('theme/toggle', `Theme changed to: ${newTheme}`)
  },
  
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme }, false, 'theme/set')
    get().addLog('theme/set', `Theme set to: ${theme}`)
  },
})

const createLogSlice = (set: any, get: any, api: any): LogSlice => ({
  logs: [],
  
  addLog: (action: string, details: string) => {
    const newLog = {
      action,
      timestamp: Date.now(),
      details,
    }
    set(
      (state: BoundState) => ({
        logs: [newLog, ...state.logs].slice(0, 100), // 限制日志数量
      }),
      false,
      'log/add'
    )
  },
  
  clearLogs: () => {
    set({ logs: [] }, false, 'log/clear')
  },
})

// ==================== 组合 Store ====================

export const useBoundStore = create<BoundState>()(
  devtools(
    persist(
      (...args) => ({
        ...createCounterSlice(...args),
        ...createUserSlice(...args),
        ...createThemeSlice(...args),
        ...createLogSlice(...args),
        
        // 跨切片操作
        resetAll: () => {
          set(
            {
              count: 0,
              username: '',
              isLoggedIn: false,
              theme: 'light',
            },
            false,
            'global/resetAll'
          )
          args[0]().addLog('global/resetAll', 'All state reset to initial')
        },
      }),
      {
        name: 'bound-storage',
        // 选择性持久化 - 不保存日志
        partialize: (state) => ({
          count: state.count,
          username: state.username,
          isLoggedIn: state.isLoggedIn,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'BoundStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// ==================== 便捷 Hooks ====================

// 按切片导出选择器，便于组件使用
export const useCounter = () => useBoundStore((state) => ({
  count: state.count,
  increment: state.increment,
  decrement: state.decrement,
  incrementBy: state.incrementBy,
}))

export const useUser = () => useBoundStore((state) => ({
  username: state.username,
  isLoggedIn: state.isLoggedIn,
  setUsername: state.setUsername,
  login: state.login,
  logout: state.logout,
}))

export const useTheme = () => useBoundStore((state) => ({
  theme: state.theme,
  toggleTheme: state.toggleTheme,
  setTheme: state.setTheme,
}))

export const useLogs = () => useBoundStore((state) => ({
  logs: state.logs,
  addLog: state.addLog,
  clearLogs: state.clearLogs,
}))
