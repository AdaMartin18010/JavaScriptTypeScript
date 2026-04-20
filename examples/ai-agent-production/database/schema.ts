/**
 * @file Drizzle 数据库表定义
 * @description 用户、会话、工作流执行记录等核心表结构
 */

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * 用户表
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "developer", "viewer"] }).default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * 会话表（better-auth 管理）
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * OAuth 账户关联表
 */
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * 工作流执行记录表
 */
export const workflowRuns = sqliteTable("workflow_runs", {
  id: text("id").primaryKey().$defaultFn(createId),
  workflowName: text("workflow_name").notNull(),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).default("pending"),
  triggerData: text("trigger_data"), // JSON 字符串
  resultData: text("result_data"), // JSON 字符串
  errorMessage: text("error_message"),
  startedAt: integer("started_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  durationMs: integer("duration_ms"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
});

/**
 * Agent 调用记录表（可观测性）
 */
export const agentInvocations = sqliteTable("agent_invocations", {
  id: text("id").primaryKey().$defaultFn(createId),
  agentName: text("agent_name").notNull(),
  workflowRunId: text("workflow_run_id").references(() => workflowRuns.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  response: text("response"),
  tokensInput: integer("tokens_input"),
  tokensOutput: integer("tokens_output"),
  latencyMs: integer("latency_ms"),
  toolCalls: text("tool_calls"), // JSON 字符串
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * MCP Server 注册表
 */
export const mcpServers = sqliteTable("mcp_servers", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull().unique(),
  transport: text("transport", { enum: ["stdio", "sse"] }).notNull(),
  command: text("command"),
  args: text("args"), // JSON 字符串
  url: text("url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
