/**
 * TodoList 组件
 * 
 * 展示:
 * - Todo Store 的完整功能
 * - 过滤、搜索、标签选择
 * - 异步操作 (fetchTodos)
 * - 持久化状态
 */
import { useState } from 'react'
import { 
  useTodoStore, 
  selectFilter, 
  selectIsLoading,
  selectAllTags,
  type Todo,
  type TodoStatus,
  type TodoFilter 
} from '../store'
import { useShallow } from 'zustand/react/shallow'

const statusLabels: Record<TodoStatus, string> = {
  'pending': '⏳ 待办',
  'in-progress': '🔄 进行中',
  'completed': '✅ 已完成',
}

const priorityLabels: Record<number, string> = {
  1: '🔴 最高',
  2: '🟠 高',
  3: '🟡 中',
  4: '🟢 低',
  5: '⚪ 最低',
}

function TodoItem({ todo }: { todo: Todo }) {
  const { updateTodo, deleteTodo, toggleTodoStatus } = useTodoStore(
    useShallow((state) => ({
      updateTodo: state.updateTodo,
      deleteTodo: state.deleteTodo,
      toggleTodoStatus: state.toggleTodoStatus,
    }))
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  return (
    <div className={`todo-item ${todo.status}`}>
      <div className="todo-header">
        <input
          type="checkbox"
          checked={todo.status === 'completed'}
          onChange={() => toggleTodoStatus(todo.id)}
        />
        <span className="todo-title">{todo.title}</span>
        <span className="todo-priority">{priorityLabels[todo.priority]}</span>
        <span className="todo-status">{statusLabels[todo.status]}</span>
      </div>
      
      <p className="todo-description">{todo.description}</p>
      
      <div className="todo-meta">
        <div className="todo-tags">
          {todo.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="todo-dates">
          <small>创建: {formatDate(todo.createdAt)}</small>
          {todo.completedAt && (
            <small>完成: {formatDate(todo.completedAt)}</small>
          )}
        </div>
      </div>
      
      <div className="todo-actions">
        <select
          value={todo.status}
          onChange={(e) => updateTodo(todo.id, { status: e.target.value as TodoStatus })}
        >
          <option value="pending">待办</option>
          <option value="in-progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
        <button onClick={() => deleteTodo(todo.id)} className="btn btn-danger btn-sm">
          删除
        </button>
      </div>
    </div>
  )
}

export function TodoList() {
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 3 as 1 | 2 | 3 | 4 | 5,
    tags: '',
  })

  const filter = useTodoStore(selectFilter)
  const isLoading = useTodoStore(selectIsLoading)
  const allTags = useTodoStore(selectAllTags)
  
  const { 
    filteredTodos, 
    stats, 
    addTodo, 
    setFilter, 
    setSearchQuery, 
    setSelectedTag,
    searchQuery,
    selectedTag,
    fetchTodos,
    completeAll,
    clearCompleted,
  } = useTodoStore(
    useShallow((state) => ({
      filteredTodos: state.filteredTodos,
      stats: state.stats,
      addTodo: state.addTodo,
      setFilter: state.setFilter,
      setSearchQuery: state.setSearchQuery,
      setSelectedTag: state.setSelectedTag,
      searchQuery: state.searchQuery,
      selectedTag: state.selectedTag,
      fetchTodos: state.fetchTodos,
      completeAll: state.completeAll,
      clearCompleted: state.clearCompleted,
    }))
  )

  const todos = filteredTodos()
  const todoStats = stats()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title.trim()) return
    
    addTodo({
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority,
      status: 'pending',
      tags: newTodo.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    
    setNewTodo({ title: '', description: '', priority: 3, tags: '' })
  }

  return (
    <div className="todo-section">
      <h2>📝 Todo 列表示例</h2>
      
      {/* 统计面板 */}
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-value">{todoStats.total}</span>
          <span className="stat-label">总计</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{todoStats.pending}</span>
          <span className="stat-label">待办</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{todoStats.inProgress}</span>
          <span className="stat-label">进行中</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{todoStats.completed}</span>
          <span className="stat-label">已完成</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{todoStats.completionRate}%</span>
          <span className="stat-label">完成率</span>
        </div>
      </div>
      
      {/* 搜索和过滤 */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="🔍 搜索待办..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
        <div className="filter-group">
          <label>状态过滤:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as TodoFilter)}>
            <option value="all">全部</option>
            <option value="pending">待办</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>标签过滤:</label>
          <select 
            value={selectedTag || ''} 
            onChange={(e) => setSelectedTag(e.target.value || null)}
          >
            <option value="">全部标签</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <button onClick={fetchTodos} disabled={isLoading} className="btn btn-primary">
          {isLoading ? '⏳ 加载中...' : '🔄 加载示例数据'}
        </button>
      </div>
      
      {/* 批量操作 */}
      <div className="batch-actions">
        <button onClick={completeAll} className="btn btn-success btn-sm">
          全部完成
        </button>
        <button onClick={clearCompleted} className="btn btn-warning btn-sm">
          清除已完成
        </button>
      </div>
      
      {/* 添加新待办 */}
      <form onSubmit={handleSubmit} className="todo-form">
        <h4>添加新待办</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="标题"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="描述"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          />
          <select
            value={newTodo.priority}
            onChange={(e) => setNewTodo({ ...newTodo, priority: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
          >
            <option value={1}>🔴 最高</option>
            <option value={2}>🟠 高</option>
            <option value={3}>🟡 中</option>
            <option value={4}>🟢 低</option>
            <option value={5}>⚪ 最低</option>
          </select>
          <input
            type="text"
            placeholder="标签 (逗号分隔)"
            value={newTodo.tags}
            onChange={(e) => setNewTodo({ ...newTodo, tags: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">添加</button>
        </div>
      </form>
      
      {/* 待办列表 */}
      <div className="todo-list">
        <h4>待办事项 ({todos.length})</h4>
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>🎯 暂无待办事项</p>
            <p>添加一个新任务开始吧！</p>
          </div>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>
      
      {/* 说明 */}
      <div className="info-box">
        <h4>💡 特性展示</h4>
        <ul>
          <li>Persist Middleware - 自动保存到 localStorage</li>
          <li>过滤和搜索 - 多维度数据筛选</li>
          <li>异步操作 - 模拟 API 数据获取</li>
          <li>状态计算 - 实时统计信息</li>
        </ul>
      </div>
    </div>
  )
}
