# 现代 ORM 与 Edge 数据库实践实验室

> 本实验室聚焦于 2025-2026 年 TypeScript ORM 生态的最新实践，涵盖 Drizzle ORM、Prisma 7（WASM 引擎）、Turso/libSQL 边缘数据库等现代方案。

---

## 📁 文件结构

```
96-orm-modern-lab/
├── README.md                    # 本文件
├── drizzle-schema.ts            # Drizzle TypeScript Schema 定义（含 RLS）
├── drizzle-query-patterns.ts    # Drizzle SQL-like 查询模式大全
├── prisma-7-edge.ts             # Prisma 7 Edge Runtime 配置示例
└── turso-connection.ts          # Turso / libSQL 连接与查询示例
```

---

## 🧪 实验环境准备

### Drizzle ORM

```bash
npm install drizzle-orm pg @libsql/client
npm install -D drizzle-kit
```

### Prisma 7

```bash
npm install prisma@7 @prisma/client@7
```

### Turso / libSQL

```bash
npm install @libsql/client
```

---

## 🎯 实验目标

| 实验 | 文件 | 目标 |
|------|------|------|
| Schema 定义 | `drizzle-schema.ts` | 掌握 Drizzle TypeScript-native schema、relations、RLS 定义 |
| 查询模式 | `drizzle-query-patterns.ts` | 掌握 select / join / insert / update / delete / subquery / CTE |
| Edge 配置 | `prisma-7-edge.ts` | 理解 Prisma 7 WASM 引擎在 Edge Runtime 中的配置 |
| 边缘连接 | `turso-connection.ts` | 掌握 Turso / libSQL 的连接、查询、事务 |

---

## 💡 关键概念速查

### Prisma 7 vs Prisma 5/6

| 特性 | Prisma 5/6 | Prisma 7 |
|------|-----------|----------|
| Query Engine | Rust 二进制 (~14MB) | TypeScript/WASM (~1.6MB) |
| Edge 支持 | 需 Data Proxy | 原生支持 |
| 类型检查 | 标准 | 快 70% |
| 部署复杂度 | 高（多平台二进制） | 低（单 bundle） |

### Drizzle ORM 设计哲学

- **SQL-like**: 查询即 SQL，无隐藏行为
- **Zero-generation**: Schema 是纯 TypeScript，无需 `generate` 步骤
- **Tree-shakeable**: 只用你导入的代码
- **Explicit joins**: 无 N+1 隐患（join 必须显式书写）

### Turso 架构特点

- **写主读副**: 单一写入端点，全球读取副本
- **libSQL 协议**: 兼容 SQLite，支持远程同步
- **边缘原生**: 与 Cloudflare Workers、Vercel Edge 无缝集成

---

## 📚 延伸阅读

- [Drizzle ORM 文档](https://orm.drizzle.team)
- [Prisma 7 发布说明](https://www.prisma.io/blog)
- [Turso 文档](https://docs.turso.tech)
- [ZenStack 文档](https://zenstack.dev/docs)
