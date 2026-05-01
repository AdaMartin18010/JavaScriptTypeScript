/**
 * SlicesDemo 组件
 * 
 * 展示:
 * - 切片模式 (Slices Pattern)
 * - 多个切片组合成一个 store
 * - 切片间的通信（日志记录）
 * - 统一的状态管理
 */
import { useBoundStore, useCounter, useUser, useTheme, useLogs } from '../store'

export function SlicesDemo() {
  // 使用便捷的切片 hooks
  const { count, increment, decrement, incrementBy } = useCounter()
  const { username, isLoggedIn, setUsername, login, logout } = useUser()
  const { theme, toggleTheme, setTheme } = useTheme()
  const { logs, clearLogs } = useLogs()
  
  // 全局操作
  const resetAll = useBoundStore((state) => state.resetAll)

  return (
    <div className={`slices-section theme-${theme}`}>
      <h2>🔪 切片模式示例 (Slices Pattern)</h2>
      <p className="section-desc">
        演示如何将大型应用的状态拆分为多个可复用的切片，并组合成一个统一的 store
      </p>
      
      <div className="slices-grid">
        {/* 计数器切片 */}
        <div className="slice-card">
          <h3>🧮 Counter Slice</h3>
          <div className="slice-content">
            <div className="display-value">{count}</div>
            <div className="button-group small">
              <button onClick={decrement} className="btn btn-secondary">-</button>
              <button onClick={increment} className="btn btn-secondary">+</button>
              <button onClick={() => incrementBy(5)} className="btn btn-secondary">+5</button>
            </div>
          </div>
        </div>
        
        {/* 用户切片 */}
        <div className="slice-card">
          <h3>👤 User Slice</h3>
          <div className="slice-content">
            {isLoggedIn ? (
              <div className="user-info-mini">
                <span>👋 你好, {username}!</span>
                <button onClick={logout} className="btn btn-danger btn-sm">退出</button>
              </div>
            ) : (
              <div className="login-mini">
                <input
                  type="text"
                  placeholder="输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && login()}
                />
                <button onClick={login} className="btn btn-primary btn-sm">登录</button>
              </div>
            )}
          </div>
        </div>
        
        {/* 主题切片 */}
        <div className="slice-card">
          <h3>🎨 Theme Slice</h3>
          <div className="slice-content">
            <div className="theme-indicator">
              当前主题: <strong>{theme === 'light' ? '☀️ 浅色' : '🌙 深色'}</strong>
            </div>
            <div className="button-group small">
              <button 
                onClick={() => setTheme('light')} 
                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              >
                ☀️ 浅色
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🌙 深色
              </button>
              <button onClick={toggleTheme} className="btn btn-secondary">
                🔄 切换
              </button>
            </div>
          </div>
        </div>
        
        {/* 日志切片 */}
        <div className="slice-card wide">
          <h3>📝 Log Slice</h3>
          <div className="slice-content">
            <div className="log-controls">
              <button onClick={clearLogs} className="btn btn-warning btn-sm">
                清除日志
              </button>
              <span className="log-count">共 {logs.length} 条记录</span>
            </div>
            <div className="log-list">
              {logs.length === 0 ? (
                <div className="empty-logs">暂无日志记录</div>
              ) : (
                logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="log-item">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-action">{log.action}</span>
                    <span className="log-details">{log.details}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 全局操作 */}
      <div className="global-actions">
        <button onClick={resetAll} className="btn btn-danger">
          🗑️ 重置所有状态
        </button>
      </div>
      
      {/* 说明 */}
      <div className="info-box">
        <h4>💡 切片模式优势</h4>
        <ul>
          <li><strong>模块化</strong> - 每个切片独立管理自己的状态和逻辑</li>
          <li><strong>可复用</strong> - 切片可以在不同 store 之间共享</li>
          <li><strong>可维护</strong> - 大型应用的状态更容易维护</li>
          <li><strong>跨切片通信</strong> - 通过 get() 访问其他切片的状态和方法</li>
        </ul>
        <pre>{`
// 切片创建函数
const createCounterSlice = (set, get, api) => ({
  count: 0,
  increment: () => {
    set({ count: get().count + 1 })
    // 访问其他切片
    get().addLog('counter', 'incremented')
  }
})

// 组合切片
const useBoundStore = create((...args) => ({
  ...createCounterSlice(...args),
  ...createUserSlice(...args),
  ...createLogSlice(...args),
}))
        `}</pre>
      </div>
    </div>
  )
}
