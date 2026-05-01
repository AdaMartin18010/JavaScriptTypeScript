/**
 * 03-vercel-postgres.ts
 * ========================================
 * Vercel Postgres 在 Edge Runtime 的使用
 *
 * Vercel Postgres 由 Neon 提供技术支持，深度集成 Vercel 生态。
 * 它通过 @vercel/postgres 包提供了 Edge Runtime 兼容的 Postgres 访问，
 * 使用 HTTP 协议替代传统 TCP 连接，完美适配 Serverless 和边缘函数。
 *
 * 安装依赖: npm install @vercel/postgres
 * 运行环境: Vercel Edge Functions, Next.js Edge Runtime, Node.js
 */

import { sql, db, createPool, createClient, VercelPool, VercelClient } from "@vercel/postgres";

// ============================================================================
// 1. 类型定义 — 业务模型
// ============================================================================

interface Team {
  id: string; // UUID
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
}

interface Member {
  id: string;
  teamId: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

interface Project {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  status: "active" | "archived" | "suspended";
  deployedAt: Date | null;
}

// ============================================================================
// 2. Schema 初始化 — 使用模板字符串查询
// ============================================================================

/**
 * @vercel/postgres 的核心特性是 `sql` 模板标签函数：
 *   const result = await sql`SELECT * FROM users WHERE id = ${userId}`
 *
 * 它会自动：
 *   - 参数化查询（防止 SQL 注入）
 *   - 类型推断（返回 TypedArray<Row>）
 *   - 连接池管理（自动复用连接）
 */

async function initializeSchema(): Promise<void> {
  // 模板字符串中的 ${variable} 自动转为参数化查询
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(team_id, email)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      deployed_at TIMESTAMPTZ,
      UNIQUE(team_id, slug)
    )
  `;

  // 创建索引优化查询性能
  await sql`CREATE INDEX IF NOT EXISTS idx_members_team ON members(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`;
}

// ============================================================================
// 3. 类型安全的数据操作 — 利用模板字符串和类型转换
// ============================================================================

async function createTeam(name: string, slug: string, plan: Team["plan"] = "free"): Promise<Team> {
  const result = await sql<Team>`
    INSERT INTO teams (name, slug, plan)
    VALUES (${name}, ${slug}, ${plan})
    RETURNING id, name, slug, plan, created_at as "createdAt"
  `;
  return result.rows[0];
}

async function findTeamBySlug(slug: string): Promise<Team | null> {
  const result = await sql<Team>`
    SELECT id, name, slug, plan, created_at as "createdAt"
    FROM teams WHERE slug = ${slug}
  `;
  return result.rows[0] ?? null;
}

async function addMember(teamId: string, email: string, role: Member["role"] = "member"): Promise<Member> {
  const result = await sql<Member>`
    INSERT INTO members (team_id, email, role)
    VALUES (${teamId}, ${email}, ${role})
    RETURNING id, team_id as "teamId", email, role, joined_at as "joinedAt"
  `;
  return result.rows[0];
}

async function listTeamMembers(teamId: string): Promise<Member[]> {
  const result = await sql<Member>`
    SELECT id, team_id as "teamId", email, role, joined_at as "joinedAt"
    FROM members WHERE team_id = ${teamId}
    ORDER BY joined_at ASC
  `;
  return result.rows;
}

async function createProject(
  teamId: string,
  name: string,
  slug: string
): Promise<Project> {
  const result = await sql<Project>`
    INSERT INTO projects (team_id, name, slug)
    VALUES (${teamId}, ${name}, ${slug})
    RETURNING id, team_id as "teamId", name, slug, status, deployed_at as "deployedAt"
  `;
  return result.rows[0];
}

async function deployProject(projectId: string): Promise<void> {
  await sql`
    UPDATE projects
    SET status = 'active', deployed_at = NOW()
    WHERE id = ${projectId}
  `;
}

async function listTeamProjects(teamId: string, status?: Project["status"]): Promise<Project[]> {
  // 条件查询 — 利用条件参数
  const result = status
    ? await sql<Project>`
        SELECT id, team_id as "teamId", name, slug, status, deployed_at as "deployedAt"
        FROM projects WHERE team_id = ${teamId} AND status = ${status}
        ORDER BY deployed_at DESC NULLS LAST
      `
    : await sql<Project>`
        SELECT id, team_id as "teamId", name, slug, status, deployed_at as "deployedAt"
        FROM projects WHERE team_id = ${teamId}
        ORDER BY deployed_at DESC NULLS LAST
      `;
  return result.rows;
}

// ============================================================================
// 4. 聚合查询与报表 — Postgres 的高级特性
// ============================================================================

interface TeamStats {
  teamId: string;
  teamName: string;
  memberCount: number;
  projectCount: number;
  activeProjectCount: number;
}

async function getTeamStats(): Promise<TeamStats[]> {
  const result = await sql<TeamStats>`
    SELECT
      t.id as "teamId",
      t.name as "teamName",
      COUNT(DISTINCT m.id)::int as "memberCount",
      COUNT(DISTINCT p.id)::int as "projectCount",
      COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END)::int as "activeProjectCount"
    FROM teams t
    LEFT JOIN members m ON m.team_id = t.id
    LEFT JOIN projects p ON p.team_id = t.id
    GROUP BY t.id, t.name
    ORDER BY "projectCount" DESC
  `;
  return result.rows;
}

// ============================================================================
// 5. 事务支持 — 使用 db 或 createPool 获取客户端
// ============================================================================

async function transferProjectOwnership(
  projectId: string,
  fromTeamId: string,
  toTeamId: string
): Promise<void> {
  // 使用 sql 的事务模式
  // @vercel/postgres 的 sql 标签函数在内部自动管理连接池
  // 对于显式事务，使用 db 或 pool.connect()

  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    // 验证项目属于源团队
    const project = await client.sql<Project>`
      SELECT id, team_id as "teamId" FROM projects WHERE id = ${projectId}
    `;

    if (project.rows[0]?.teamId !== fromTeamId) {
      throw new Error("Project does not belong to the specified team");
    }

    // 转移项目
    await client.sql`
      UPDATE projects SET team_id = ${toTeamId} WHERE id = ${projectId}
    `;

    // 记录操作日志（假设有 audit_logs 表）
    await client.sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, details)
      VALUES ('project', ${projectId}, 'transfer', ${JSON.stringify({ fromTeamId, toTeamId })})
n    `;

    await client.sql`COMMIT`;
  } catch (err) {
    await client.sql`ROLLBACK`;
    throw err;
  } finally {
    client.release();
  }
}

// ============================================================================
// 6. 连接池管理 — 高并发场景
// ============================================================================

/**
 * 在 Next.js API Routes 或 Edge Functions 中，
 * 全局复用连接池可以避免每次请求都新建连接。
 */

let pool: VercelPool | null = null;

function getPool(): VercelPool {
  if (!pool) {
    pool = createPool({
      connectionString: process.env.POSTGRES_URL,
      // 连接池配置
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时
      connectionTimeoutMillis: 5000, // 连接超时
    });
  }
  return pool;
}

// 使用连接池执行查询
async function queryWithPool<T>(queryText: string, values?: unknown[]): Promise<T[]> {
  const p = getPool();
  const result = await p.query<T>(queryText, values);
  return result.rows;
}

// ============================================================================
// 7. Edge Runtime 兼容 — Next.js App Router 示例
// ============================================================================

/**
 * 在 Next.js App Router 的 Edge Runtime 中使用：
 *
 * // app/api/teams/route.ts
 * import { NextRequest, NextResponse } from "next/server";
 * import { sql } from "@vercel/postgres";
 *
 * export const runtime = "edge"; // 指定 Edge Runtime
 *
 * export async function GET(request: NextRequest) {
 *   const { searchParams } = new URL(request.url);
 *   const slug = searchParams.get("slug");
 *
 *   if (!slug) {
 *     return NextResponse.json({ error: "slug required" }, { status: 400 });
 *   }
 *
 *   const team = await findTeamBySlug(slug);
 *   return team
 *     ? NextResponse.json({ success: true, data: team })
 *     : NextResponse.json({ error: "Not found" }, { status: 404 });
 * }
 *
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *   const team = await createTeam(body.name, body.slug, body.plan);
 *   return NextResponse.json({ success: true, data: team }, { status: 201 });
 * }
 */

// ============================================================================
// 8. 主执行区
// ============================================================================

async function main(): Promise<void> {
  console.log("=== Vercel Postgres Edge Demo ===\n");

  try {
    await initializeSchema();
    console.log("Schema initialized");

    // 创建团队
    const team = await createTeam("Acme Corp", "acme-corp", "pro");
    console.log(`Created team: ${team.name} (${team.id})`);

    // 查询团队
    const found = await findTeamBySlug("acme-corp");
    console.log("Found team:", found?.name, "- plan:", found?.plan);

    // 添加成员
    const member = await addMember(team.id, "alice@acme.com", "admin");
    console.log(`Added member: ${member.email} (${member.role})`);

    await addMember(team.id, "bob@acme.com", "member");

    // 列出成员
    const members = await listTeamMembers(team.id);
    console.log(`Team has ${members.length} member(s)`);

    // 创建项目
    const project = await createProject(team.id, "Website Redesign", "website-v2");
    console.log(`Created project: ${project.name}`);

    // 部署项目
    await deployProject(project.id);
    console.log("Project deployed");

    // 列出项目
    const projects = await listTeamProjects(team.id, "active");
    console.log(`Team has ${projects.length} active project(s)`);

    // 统计
    const stats = await getTeamStats();
    console.log("Team stats:", stats.map((s) => `${s.teamName}: ${s.projectCount} projects`));

    console.log("\n=== Success: Vercel Postgres operations completed ===");
  } catch (err) {
    console.error("Demo error:", err);
  }
}

if (import.meta.main || (typeof process !== "undefined" && process.argv[1]?.includes("03-vercel-postgres"))) {
  main().catch(console.error);
}

export {
  initializeSchema,
  createTeam,
  findTeamBySlug,
  addMember,
  listTeamMembers,
  createProject,
  deployProject,
  listTeamProjects,
  getTeamStats,
  transferProjectOwnership,
  type Team,
  type Member,
  type Project,
  type TeamStats,
};

// ============================================================================
// 9. 部署与环境配置
// ============================================================================

/**
 * === Vercel Dashboard 配置 ===
 * 1. 进入 Project Settings → Storage → Postgres
 * 2. 创建或连接 Postgres 数据库
 * 3. 环境变量自动注入到项目:
 *    - POSTGRES_URL
 *    - POSTGRES_URL_NON_POOLING
 *    - POSTGRES_USER
 *    - POSTGRES_PASSWORD
 *    - POSTGRES_HOST
 *    - POSTGRES_DATABASE
 *
 * === 本地开发 ===
 * 使用 .env.local 配置 POSTGRES_URL 连接到本地或预览数据库
 *
 * === 与 Drizzle ORM 集成 ===
 * Drizzle 支持 @vercel/postgres 驱动:
 *   import { sql } from "@vercel/postgres";
 *   import { drizzle } from "drizzle-orm/vercel-postgres";
 *   const db = drizzle(sql, { schema });
 */
