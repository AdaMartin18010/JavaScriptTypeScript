-- ============================================
-- 初始迁移：创建核心表结构
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER DEFAULT 0,
  image TEXT,
  role TEXT DEFAULT 'viewer',
  created_at INTEGER,
  updated_at INTEGER
);

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- OAuth 账户关联表
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- 工作流执行记录表
CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  trigger_data TEXT,
  result_data TEXT,
  error_message TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  duration_ms INTEGER,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Agent 调用记录表
CREATE TABLE IF NOT EXISTS agent_invocations (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  workflow_run_id TEXT REFERENCES workflow_runs(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  tool_calls TEXT,
  created_at INTEGER
);

-- MCP Server 注册表
CREATE TABLE IF NOT EXISTS mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  transport TEXT NOT NULL,
  command TEXT,
  args TEXT,
  url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user_id ON workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_invocations_workflow_run_id ON agent_invocations(workflow_run_id);
