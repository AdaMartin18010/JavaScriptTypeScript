/**
 * Counter Store - 计数器状态
 * 
 * 演示内容:
 * - TypeScript 类型安全
 * - Zustand DevTools Middleware
 * - 基本状态操作
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ==================== 类型定义 ====================

interface CounterState {
  // 状态
  count: number
  step: number
  history: number[]
  
  // 计算属性（通过 getter 实现）
  doubleCount: () => number
  isPositive: () => boolean
  
  // 操作
  increment: () => void
  decrement: () => void
  incrementBy: (amount: number) => void
  setStep: (step: number) => void
  reset: () => void
  undo: () => void
}

// ==================== Store 创建 ====================

export const useCounterStore = create<CounterState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      count: 0,
      step: 1,
      history: [],
      
      // 计算属性
      doubleCount: () => get().count * 2,
      isPositive: () => get().count > 0,
      
      // 操作
      increment: () => {
        const { count, step, history } = get()
        set(
          { 
            count: count + step, 
            history: [...history, count] 
          },
          false,
          'counter/increment'
        )
      },
      
      decrement: () => {
        const { count, step, history } = get()
        set(
          { 
            count: count - step, 
            history: [...history, count] 
          },
          false,
          'counter/decrement'
        )
      },
      
      incrementBy: (amount: number) => {
        const { count, history } = get()
        set(
          { 
            count: count + amount, 
            history: [...history, count] 
          },
          false,
          'counter/incrementBy'
        )
      },
      
      setStep: (step: number) => {
        set({ step }, false, 'counter/setStep')
      },
      
      reset: () => {
        set(
          { count: 0, step: 1, history: [] },
          false,
          'counter/reset'
        )
      },
      
      undo: () => {
        const { history } = get()
        if (history.length > 0) {
          const previousCount = history[history.length - 1]
          set(
            { 
              count: previousCount, 
              history: history.slice(0, -1) 
            },
            false,
            'counter/undo'
          )
        }
      },
    }),
    {
      name: 'CounterStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// ==================== 选择器（优化重渲染）====================

// 基础选择器
export const selectCount = (state: CounterState) => state.count
export const selectStep = (state: CounterState) => state.step
export const selectHistory = (state: CounterState) => state.history

// 派生选择器
export const selectHistoryLength = (state: CounterState) => state.history.length
