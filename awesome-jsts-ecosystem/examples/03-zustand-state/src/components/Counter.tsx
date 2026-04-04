/**
 * Counter 组件
 * 
 * 展示:
 * - 使用 Counter Store
 * - 使用选择器优化重渲染
 * - DevTools 集成
 */
import { useCounterStore, selectCount, selectStep, selectHistory } from '../store'
import { useShallow } from 'zustand/react/shallow'

export function Counter() {
  // 使用选择器获取特定状态片段
  const count = useCounterStore(selectCount)
  const step = useCounterStore(selectStep)
  const history = useCounterStore(selectHistory)
  
  // 使用 useShallow 获取多个状态
  const { increment, decrement, incrementBy, setStep, reset, undo, doubleCount, isPositive } = 
    useCounterStore(
      useShallow((state) => ({
        increment: state.increment,
        decrement: state.decrement,
        incrementBy: state.incrementBy,
        setStep: state.setStep,
        reset: state.reset,
        undo: state.undo,
        doubleCount: state.doubleCount,
        isPositive: state.isPositive,
      }))
    )

  return (
    <div className="counter-section">
      <h2>🧮 计数器示例</h2>
      
      {/* 显示区域 */}
      <div className="counter-display">
        <div className={`count-value ${isPositive() ? 'positive' : 'non-positive'}`}>
          {count}
        </div>
        <div className="count-info">
          <span>双倍值: {doubleCount()}</span>
          <span className={`status ${isPositive() ? 'positive' : ''}`}>
            {isPositive() ? '✓ 正数' : '非正数'}
          </span>
        </div>
      </div>
      
      {/* 步长设置 */}
      <div className="step-control">
        <label>步长:</label>
        <input
          type="number"
          min="1"
          max="100"
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
        />
      </div>
      
      {/* 操作按钮 */}
      <div className="button-group">
        <button onClick={decrement} className="btn btn-danger">
          -{step}
        </button>
        <button onClick={increment} className="btn btn-success">
          +{step}
        </button>
        <button onClick={() => incrementBy(10)} className="btn btn-primary">
          +10
        </button>
        <button 
          onClick={undo} 
          className="btn btn-secondary"
          disabled={history.length === 0}
        >
          ↩ 撤销
        </button>
        <button onClick={reset} className="btn btn-warning">
          ⟲ 重置
        </button>
      </div>
      
      {/* 历史记录 */}
      <div className="history-section">
        <h4>操作历史 ({history.length})</h4>
        <div className="history-list">
          {history.length === 0 ? (
            <span className="empty">暂无历史记录</span>
          ) : (
            history.map((value, index) => (
              <span key={index} className="history-item">
                {value}
              </span>
            ))
          )}
        </div>
      </div>
      
      {/* 说明 */}
      <div className="info-box">
        <h4>💡 特性展示</h4>
        <ul>
          <li>TypeScript 类型安全 - 完整的类型定义</li>
          <li>DevTools 集成 - 可在 Redux DevTools 中查看状态变化</li>
          <li>计算属性 - doubleCount(), isPositive()</li>
          <li>状态历史 - 支持撤销操作</li>
        </ul>
      </div>
    </div>
  )
}
