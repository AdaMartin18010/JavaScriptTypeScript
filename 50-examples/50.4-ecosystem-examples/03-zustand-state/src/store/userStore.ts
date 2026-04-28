/**
 * User Store - 用户状态管理
 * 
 * 演示内容:
 * - 异步操作（登录、登出、获取用户信息）
 * - 状态机模式（idle -> loading -> success/error）
 * - Immer Middleware 简化不可变更新
 * - 复杂对象状态管理
 */
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ==================== 类型定义 ====================

type UserStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
  profile: {
    bio: string
    location: string
    website: string
    company: string
  }
  lastLoginAt: number
}

interface UserState {
  // 状态
  status: UserStatus
  user: User | null
  error: string | null
  
  // 派生状态
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  hasPermission: (permission: string) => boolean
  
  // 认证操作
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  
  // 用户数据操作
  fetchUserProfile: () => Promise<void>
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>
  updatePreferences: (prefs: Partial<User['preferences']>) => void
  updateAvatar: (avatarUrl: string) => void
  
  // 工具
  clearError: () => void
}

// ==================== Mock API ====================

// 模拟用户数据
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@example.com',
      name: '管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      preferences: {
        theme: 'dark',
        language: 'zh-CN',
        notifications: true,
      },
      profile: {
        bio: '系统管理员',
        location: '北京',
        website: 'https://example.com',
        company: 'Example Inc.',
      },
      lastLoginAt: Date.now(),
    },
  },
  'user@example.com': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@example.com',
      name: '普通用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      role: 'user',
      permissions: ['read', 'write'],
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      },
      profile: {
        bio: '前端开发者',
        location: '上海',
        website: '',
        company: 'Tech Co.',
      },
      lastLoginAt: Date.now(),
    },
  },
}

// 模拟 API 调用
const mockApi = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const userData = MOCK_USERS[email]
    if (!userData || userData.password !== password) {
      throw new Error('邮箱或密码错误')
    }
    
    return { ...userData.user, lastLoginAt: Date.now() }
  },
  
  register: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    if (MOCK_USERS[email]) {
      throw new Error('该邮箱已被注册')
    }
    
    // 创建新用户
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'user',
      permissions: ['read', 'write'],
      preferences: {
        theme: 'system',
        language: 'zh-CN',
        notifications: true,
      },
      profile: {
        bio: '',
        location: '',
        website: '',
        company: '',
      },
      lastLoginAt: Date.now(),
    }
    
    return newUser
  },
  
  updateProfile: async (userId: string, updates: Partial<User['profile']>): Promise<User['profile']> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return updates as User['profile']
  },
}

// ==================== Store 创建 ====================

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        status: 'idle',
        user: null,
        error: null,
        
        // 派生状态
        isAuthenticated: () => get().status === 'authenticated' && get().user !== null,
        
        isAdmin: () => get().user?.role === 'admin',
        
        hasPermission: (permission: string) => {
          const { user } = get()
          return user?.permissions.includes(permission) ?? false
        },
        
        // 登录
        login: async (email, password) => {
          set({ status: 'loading', error: null }, false, 'user/login/start')
          
          try {
            const user = await mockApi.login(email, password)
            set(
              { status: 'authenticated', user, error: null },
              false,
              'user/login/success'
            )
          } catch (error) {
            set(
              { 
                status: 'error', 
                user: null, 
                error: error instanceof Error ? error.message : '登录失败' 
              },
              false,
              'user/login/error'
            )
          }
        },
        
        // 登出
        logout: () => {
          set(
            { status: 'unauthenticated', user: null, error: null },
            false,
            'user/logout'
          )
        },
        
        // 注册
        register: async (email, password, name) => {
          set({ status: 'loading', error: null }, false, 'user/register/start')
          
          try {
            const user = await mockApi.register(email, password, name)
            set(
              { status: 'authenticated', user, error: null },
              false,
              'user/register/success'
            )
          } catch (error) {
            set(
              { 
                status: 'error', 
                error: error instanceof Error ? error.message : '注册失败' 
              },
              false,
              'user/register/error'
            )
          }
        },
        
        // 获取用户信息
        fetchUserProfile: async () => {
          const { user } = get()
          if (!user) return
          
          set({ status: 'loading' }, false, 'user/fetchProfile/start')
          
          try {
            // 模拟获取最新用户信息
            await new Promise((resolve) => setTimeout(resolve, 500))
            
            set(
              { status: 'authenticated' },
              false,
              'user/fetchProfile/success'
            )
          } catch (error) {
            set(
              { status: 'error', error: '获取用户信息失败' },
              false,
              'user/fetchProfile/error'
            )
          }
        },
        
        // 更新个人资料
        updateProfile: async (updates) => {
          const { user } = get()
          if (!user) return
          
          try {
            const updatedProfile = await mockApi.updateProfile(user.id, updates)
            
            set(
              (state) => ({
                user: state.user
                  ? { ...state.user, profile: { ...state.user.profile, ...updatedProfile } }
                  : null,
              }),
              false,
              'user/updateProfile'
            )
          } catch (error) {
            set(
              { error: '更新资料失败' },
              false,
              'user/updateProfile/error'
            )
          }
        },
        
        // 更新偏好设置
        updatePreferences: (prefs) => {
          set(
            (state) => ({
              user: state.user
                ? { ...state.user, preferences: { ...state.user.preferences, ...prefs } }
                : null,
            }),
            false,
            'user/updatePreferences'
          )
        },
        
        // 更新头像
        updateAvatar: (avatarUrl) => {
          set(
            (state) => ({
              user: state.user ? { ...state.user, avatar: avatarUrl } : null,
            }),
            false,
            'user/updateAvatar'
          )
        },
        
        // 清除错误
        clearError: () => {
          set({ error: null }, false, 'user/clearError')
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ 
          user: state.user,
          status: state.status === 'authenticated' ? 'authenticated' : 'unauthenticated',
        }),
        onRehydrateStorage: () => (state) => {
          // 持久化恢复后的处理
          if (state?.status === 'authenticated' && state.user) {
            console.log('用户会话已恢复:', state.user.email)
          }
        },
      }
    ),
    {
      name: 'UserStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// ==================== 选择器 ====================

export const selectUser = (state: UserState) => state.user
export const selectUserStatus = (state: UserState) => state.status
export const selectUserError = (state: UserState) => state.error
