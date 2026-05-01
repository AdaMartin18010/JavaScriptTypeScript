/**
 * Zustand 状态管理示例 - 应用入口
 * 
 * 展示内容:
 * 1. Counter Store - 基础状态管理 + DevTools
 * 2. Todo Store - 复杂状态 + Persist Middleware
 * 3. User Store - 异步操作 + 状态机
 * 4. Bound Store - 切片模式 (Slices Pattern)
 */
import { useState } from 'react'
import { Counter } from './components/Counter'
import { TodoList } from './components/TodoList'
import { UserProfile } from './components/UserProfile'
import { SlicesDemo } from './components/SlicesDemo'
import './App.css'

type Tab = 'counter' | 'todo' | 'user' | 'slices'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('counter')

  const tabs: { id: Tab; label: string; icon: string; desc: string }[] = [
    { 
      id: 'counter', 
      label: '计数器', 
      icon: '🧮', 
      desc: '基础状态 + DevTools' 
    },
    { 
      id: 'todo', 
      label: '待办列表', 
      icon: '📝', 
      desc: 'Persist Middleware' 
    },
    { 
      id: 'user', 
      label: '用户认证', 
      icon: '👤', 
      desc: '异步操作 + 状态机' 
    },
    { 
      id: 'slices', 
      label: '切片模式', 
      icon: '🔪', 
      desc: 'Slices Pattern' 
    },
  ]

  return (
    <div className="app">
      {/* 头部 */}
      <header className="app-header">
        <h1>🐻 Zustand 状态管理示例</h1>
        <p>TypeScript 类型安全 · Middleware · 切片模式 · 异步操作</p>
      </header>

      {/* 导航标签 */}
      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            <span className="tab-desc">{tab.desc}</span>
          </button>
        ))}
      </nav>

      {/* 内容区域 */}
      <main className="app-main">
        {activeTab === 'counter' && <Counter />}
        {activeTab === 'todo' && <TodoList />}
        {activeTab === 'user' && <UserProfile />}
        {activeTab === 'slices' && <SlicesDemo />}
      </main>

      {/* 底部 */}
      <footer className="app-footer">
        <p>
          使用 <a href="https://github.com/pmndrs/zustand" target="_blank" rel="noopener noreferrer">Zustand</a> 
          {' '}构建 · 支持 Redux DevTools 调试
        </p>
      </footer>
    </div>
  )
}

export default App
