/**
 * UserProfile 组件
 * 
 * 展示:
 * - User Store 的异步操作
 * - 状态机模式 (idle/loading/authenticated/error)
 * - 表单处理
 * - 权限检查
 */
import { useState } from 'react'
import { useUserStore, selectUser, selectUserStatus, selectUserError } from '../store'
import { useShallow } from 'zustand/react/shallow'

export function UserProfile() {
  const user = useUserStore(selectUser)
  const status = useUserStore(selectUserStatus)
  const error = useUserStore(selectUserError)
  
  const { login, logout, register, updateProfile, updatePreferences, clearError, isAdmin, hasPermission } = 
    useUserStore(
      useShallow((state) => ({
        login: state.login,
        logout: state.logout,
        register: state.register,
        updateProfile: state.updateProfile,
        updatePreferences: state.updatePreferences,
        clearError: state.clearError,
        isAdmin: state.isAdmin,
        hasPermission: state.hasPermission,
      }))
    )

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [profileData, setProfileData] = useState({
    bio: user?.profile.bio || '',
    location: user?.profile.location || '',
    website: user?.profile.website || '',
    company: user?.profile.company || '',
  })

  // 同步 profileData 与 user
  if (user && profileData.bio !== user.profile.bio && !profileData.bio) {
    setProfileData(user.profile)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(formData.email, formData.password)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(formData.email, formData.password, formData.name)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(profileData)
  }

  const isLoading = status === 'loading'

  // 未登录状态
  if (status !== 'authenticated' || !user) {
    return (
      <div className="user-section">
        <h2>👤 用户认证示例</h2>
        
        {/* 标签切换 */}
        <div className="auth-tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); clearError() }}
          >
            登录
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); clearError() }}
          >
            注册
          </button>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <button onClick={clearError}>✕</button>
          </div>
        )}
        
        {/* 登录表单 */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com 或 user@example.com"
                required
              />
              <small>测试账号: admin@example.com / admin123</small>
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="admin123 或 user123"
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
              {isLoading ? '⏳ 登录中...' : '登录'}
            </button>
          </form>
        )}
        
        {/* 注册表单 */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
              {isLoading ? '⏳ 注册中...' : '注册'}
            </button>
          </form>
        )}
        
        <div className="info-box">
          <h4>💡 演示账号</h4>
          <ul>
            <li>管理员: admin@example.com / admin123</li>
            <li>普通用户: user@example.com / user123</li>
          </ul>
        </div>
      </div>
    )
  }

  // 已登录状态
  return (
    <div className="user-section">
      <h2>👤 用户资料</h2>
      
      {/* 用户信息卡片 */}
      <div className="user-card">
        <div className="user-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'admin' ? '🔑 管理员' : '👤 用户'}
          </span>
          <span className="status-badge">✓ 在线</span>
        </div>
        <button onClick={logout} className="btn btn-danger">
          退出登录
        </button>
      </div>
      
      {/* 权限展示 */}
      <div className="permissions-section">
        <h4>权限检查</h4>
        <div className="permission-list">
          <div className={`permission-item ${hasPermission('read') ? 'granted' : ''}`}>
            {hasPermission('read') ? '✓' : '✗'} 读取权限
          </div>
          <div className={`permission-item ${hasPermission('write') ? 'granted' : ''}`}>
            {hasPermission('write') ? '✓' : '✗'} 写入权限
          </div>
          <div className={`permission-item ${hasPermission('delete') ? 'granted' : ''}`}>
            {hasPermission('delete') ? '✓' : '✗'} 删除权限
          </div>
          <div className={`permission-item ${hasPermission('manage_users') ? 'granted' : ''}`}>
            {hasPermission('manage_users') ? '✓' : '✗'} 用户管理权限
          </div>
          <div className={`permission-item ${isAdmin() ? 'granted' : ''}`}>
            {isAdmin() ? '✓' : '✗'} 管理员权限
          </div>
        </div>
      </div>
      
      {/* 偏好设置 */}
      <div className="preferences-section">
        <h4>偏好设置</h4>
        <div className="preference-controls">
          <div className="form-group">
            <label>主题</label>
            <select
              value={user.preferences.theme}
              onChange={(e) => updatePreferences({ theme: e.target.value as any })}
            >
              <option value="light">☀️ 浅色</option>
              <option value="dark">🌙 深色</option>
              <option value="system">💻 跟随系统</option>
            </select>
          </div>
          <div className="form-group">
            <label>语言</label>
            <select
              value={user.preferences.language}
              onChange={(e) => updatePreferences({ language: e.target.value })}
            >
              <option value="zh-CN">🇨🇳 简体中文</option>
              <option value="en">🇺🇸 English</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={user.preferences.notifications}
                onChange={(e) => updatePreferences({ notifications: e.target.checked })}
              />
              启用通知
            </label>
          </div>
        </div>
      </div>
      
      {/* 个人资料编辑 */}
      <form onSubmit={handleUpdateProfile} className="profile-form">
        <h4>编辑资料</h4>
        <div className="form-group">
          <label>个人简介</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={3}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>位置</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>公司</label>
            <input
              type="text"
              value={profileData.company}
              onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>网站</label>
          <input
            type="url"
            value={profileData.website}
            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? '⏳ 保存中...' : '保存资料'}
        </button>
      </form>
      
      {/* 说明 */}
      <div className="info-box">
        <h4>💡 特性展示</h4>
        <ul>
          <li>异步操作 - 登录/注册模拟 API 调用</li>
          <li>状态机 - idle → loading → authenticated/error</li>
          <li>Persist Middleware - 刷新页面保持登录状态</li>
          <li>派生状态 - isAdmin, hasPermission</li>
        </ul>
      </div>
    </div>
  )
}
