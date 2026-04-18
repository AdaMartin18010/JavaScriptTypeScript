/**
 * @file Drizzle TypeScript Schema 定义
 * @category ORM Modern Lab → Schema Definition
 * @difficulty medium
 * @tags drizzle, schema, typescript, rls, relations, pgTable
 *
 * @description
 * Drizzle ORM 的 Schema 完全用 TypeScript 定义，无需代码生成步骤。
 * 本文件演示：
 * - pgTable 表定义与列约束
 * - relations 关系定义（one-to-many, many-to-many）
 * - PostgreSQL Row Level Security (RLS) 策略映射
 * - 枚举类型与索引
 * - 时间戳与软删除模式
 */

import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
  foreignKey,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ============================================================================
// 1. 枚举类型定义
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer'])
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived'])

// ============================================================================
// 2. 核心表定义
// ============================================================================

/**
 * users 表
 * - 基础用户信息与角色
 * - 软删除支持（deletedAt）
 * - RLS 相关：通常 RLS 策略在数据库层面定义，Drizzle 提供策略映射工具函数
 */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    role: userRoleEnum('role').notNull().default('viewer'),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // 索引定义
    index('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
    index('users_deleted_at_idx').on(table.deletedAt),
  ]
)

/**
 * profiles 表
 * - 用户一对一扩展资料
 */
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  bio: text('bio'),
  website: varchar('website', { length: 255 }),
  location: varchar('location', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * posts 表
 * - 博客文章，含作者外键、状态、内容
 */
export const posts = pgTable(
  'posts',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    status: postStatusEnum('status').notNull().default('draft'),
    authorId: integer('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('posts_slug_idx').on(table.slug),
    index('posts_author_idx').on(table.authorId),
    index('posts_status_published_idx').on(table.status, table.publishedAt),
  ]
)

/**
 * categories 表
 * - 文章分类，支持层级（parentId 自引用）
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.parentId],
    foreignColumns: [categories.id],
    name: 'categories_parent_fk',
  }).onDelete('set null'),
])

/**
 * posts_categories 关联表
 * - posts 与 categories 的多对多关系
 */
export const postsCategories = pgTable(
  'posts_categories',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.categoryId] }),
  ]
)

/**
 * comments 表
 * - 文章评论，支持嵌套（parentId 自引用）
 */
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id'),
  content: text('content').notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================================
// 3. Relations 关系定义
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
  comments: many(comments),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(postsCategories),
  comments: many(comments),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categories_parent',
  }),
  children: many(categories, {
    relationName: 'categories_parent',
  }),
  posts: many(postsCategories),
}))

export const postsCategoriesRelations = relations(postsCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postsCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postsCategories.categoryId],
    references: [categories.id],
  }),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comments_parent',
  }),
}))

// ============================================================================
// 4. RLS (Row Level Security) 策略与辅助函数
// ============================================================================

/**
 * Drizzle ORM 不直接生成 RLS 策略 SQL，但推荐在迁移中通过 `sql` 标签或 drizzle-kit 的
 * `custom` 字段注入 RLS 策略。以下是项目中常见的 RLS 实践模式。
 */

/**
 * 启用表 RLS（应在迁移中执行）
 */
export const enableRlsOnTable = (tableName: string) =>
  sql.raw(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`)

/**
 * 为表创建策略（应在迁移中执行）
 */
export const createRlsPolicy = (
  tableName: string,
  policyName: string,
  action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL',
  usingExpr?: string,
  withCheckExpr?: string
) => {
  const parts = [
    `CREATE POLICY "${policyName}" ON "${tableName}"`,
    `FOR ${action}`,
    `TO authenticated`,
  ]
  if (usingExpr) parts.push(`USING (${usingExpr})`)
  if (withCheckExpr) parts.push(`WITH CHECK (${withCheckExpr})`)
  return sql.raw(parts.join('\n') + ';')
}

/**
 * 常见 RLS 策略示例（用于迁移脚本参考）
 */
export const rlsPolicyExamples = {
  // 用户只能看到自己的记录
  usersOwnData: createRlsPolicy(
    'users',
    'users_own_data',
    'ALL',
    'id = current_setting(\'app.current_user_id\')::int'
  ),

  // 文章：所有人可读取已发布，作者可管理自己的
  postsPublicRead: createRlsPolicy(
    'posts',
    'posts_public_read',
    'SELECT',
    "status = 'published' OR author_id = current_setting('app.current_user_id')::int"
  ),

  postsAuthorManage: createRlsPolicy(
    'posts',
    'posts_author_manage',
    'ALL',
    'author_id = current_setting(\'app.current_user_id\')::int',
    'author_id = current_setting(\'app.current_user_id\')::int'
  ),
}

// ============================================================================
// 5. 类型推导导出（供业务层使用）
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type PostCategory = typeof postsCategories.$inferSelect
export type NewPostCategory = typeof postsCategories.$inferInsert

// ============================================================================
// 6. 使用示例
// ============================================================================

export function schemaDemo(): void {
  console.log('=== Drizzle Schema 定义 ===\n')

  console.log('表定义:')
  console.log('- users: 用户主表（含软删除 deletedAt）')
  console.log('- profiles: 用户一对一资料扩展')
  console.log('- posts: 文章（含状态枚举、层级索引）')
  console.log('- categories: 分类（自引用层级）')
  console.log('- posts_categories: 多对多关联表')
  console.log('- comments: 评论（自引用嵌套）')

  console.log('\n关系定义:')
  console.log('- users ↔ posts: one-to-many')
  console.log('- users ↔ profiles: one-to-one')
  console.log('- posts ↔ categories: many-to-many (through posts_categories)')
  console.log('- categories ↔ categories: self-referencing (parent/children)')
  console.log('- comments ↔ comments: self-referencing (nested replies)')

  console.log('\nRLS 策略:')
  console.log('- 在迁移中通过 sql.raw() 注入 PostgreSQL RLS 策略')
  console.log('- 常见模式：用户只能访问自己的数据 / 公开读取已发布内容')

  console.log('\n类型推导:')
  console.log('- User / NewUser 自动从 schema 推导')
  console.log('- 无需代码生成步骤，纯 TypeScript 类型安全')
}
