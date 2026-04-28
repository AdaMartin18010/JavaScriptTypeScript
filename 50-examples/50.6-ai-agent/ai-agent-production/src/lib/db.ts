/**
 * @file Drizzle ORM 数据库配置
 * @description 配置数据库连接、Schema 与类型推导
 */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../../database/schema.js";

/**
 * 数据库连接 URL
 * 开发环境使用 SQLite，生产环境可通过环境变量切换为 PostgreSQL
 */
const databaseUrl = process.env.DATABASE_URL ?? "file:./database/dev.db";

/**
 * 创建 Better SQLite3 连接实例
 */
const sqlite = new Database(databaseUrl.replace("file:", ""));

/**
 * Drizzle ORM 实例
 * - 包含所有表 Schema
 * - 启用类型日志（开发环境）
 */
export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV !== "production",
});

/**
 * 导出数据库类型
 */
export type DatabaseInstance = typeof db;
