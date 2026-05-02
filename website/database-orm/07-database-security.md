---
title: "数据库安全：从注入到加密"
description: "系统阐述数据库安全的威胁模型、最小权限原则与加密层次理论，深入映射到SQL/NoSQL注入防御、ORM安全配置、PostgreSQL RLS、字段加密、Secrets管理和审计合规在Node.js生态中的工程实践。"
date: 2026-05-01
tags: ["database", "security", "SQL injection", "encryption", "RLS", "Prisma", "TypeORM", "Vault", "GDPR", "pgcrypto", "audit"]
category: "engineering"
---

# 数据库安全：从注入到加密

## 引言

数据库是应用程序的"黄金宝库"——存储着用户身份凭证、财务记录、个人隐私和商业机密。然而，它也是攻击者的首要目标。从 2008 年 Heartland Payment Systems 因 SQL 注入泄露 1.3 亿张信用卡信息，到 2017 年 Equifax 因未修复的 Apache Struts 漏洞导致 1.47 亿人数据暴露，再到近年来频繁的 MongoDB 和 Elasticsearch 实例因默认配置暴露于公网而被勒索——数据库安全事件从未停止。

对于 JavaScript/TypeScript 开发者而言，数据库安全不仅是 DBA 或安全团队的职责，更是每个全栈工程师必须掌握的核心技能。ORM 的便利可能掩盖了潜在的注入风险；云原生部署的便捷可能导致数据库端口意外暴露；微服务架构的复杂性使得 secrets 管理成为系统性挑战。

本文采用"理论严格表述"与"工程实践映射"双轨并行的写作策略。在理论层面，我们将构建数据库安全的威胁模型，阐述最小权限原则的形式化语义，梳理传输加密、静态加密和字段级加密的层次体系。在工程层面，我们将深入 SQL 与 NoSQL 注入的防御机制，剖析 Prisma 和 TypeORM 的安全配置，演示 PostgreSQL 行级安全（RLS）的实现，探讨字段加密（pgcrypto 与应用层 AES）的方案选型，并延伸至 HashiCorp Vault、AWS Secrets Manager 等 secrets 管理工具以及 GDPR 合规的数据删除与假名化实践。

---

## 理论严格表述

### 2.1 数据库安全的威胁模型

威胁模型（Threat Model）是安全工程的起点。我们采用 STRIDE 框架对数据库面临的威胁进行系统分类：

| 威胁类别 | 具体表现 | 典型攻击向量 |
|---------|---------|------------|
| **欺骗（Spoofing）** | 伪装成合法用户或数据库实例 | 凭证窃取、DNS 劫持、伪造证书 |
| **篡改（Tampering）** | 非法修改数据库中的数据 | SQL 注入、未授权 UPDATE/DELETE |
| **否认（Repudiation）** | 用户否认执行过某操作 | 缺乏审计日志、日志被篡改 |
| **信息泄露（Information Disclosure）** | 未授权访问敏感数据 | 注入攻击、权限配置错误、备份泄露 |
| **拒绝服务（Denial of Service）** | 使数据库不可用 | 资源耗尽查询、连接池占满、锁风暴 |
| **权限提升（Elevation of Privilege）** | 获得超出分配权限的访问能力 | 存储过程注入、函数注入、配置漏洞 |

**定义 2.1（SQL 注入，SQL Injection）**
SQL 注入是一种代码注入攻击，攻击者通过在输入中嵌入恶意 SQL 片段，欺骗数据库执行非预期的查询。形式化地，设应用程序构造查询的方式为字符串拼接：

```
query(user_input) = "SELECT * FROM users WHERE name = '" + user_input + "'"
```

若攻击者输入 `user_input = "' OR '1'='1"`，则最终查询变为：

```sql
SELECT * FROM users WHERE name = '' OR '1'='1'
```

该谓词恒真，导致返回全表数据。更危险的变体包括堆叠查询（Stacked Queries）：`'; DROP TABLE users; --`，在支持多语句的数据库中可造成灾难性破坏。

**定义 2.2（NoSQL 注入）**
NoSQL 数据库虽然不使用 SQL 语法，但同样存在注入风险。以 MongoDB 为例，若应用程序直接将用户输入作为查询对象：

```typescript
// 危险代码：直接传入用户输入
db.users.find({ username: req.body.username, password: req.body.password });
```

攻击者可以提交：

```json
{ "username": "admin", "password": { "$ne": null } }
```

MongoDB 的 `$ne`（not equal）操作符使密码匹配条件恒真，从而实现身份绕过。

**定义 2.3（权限提升）**
权限提升发生在攻击者利用数据库的功能特性或配置缺陷，获得超出其角色分配的权限。常见路径包括：

- **存储过程/函数注入**：利用高权限用户创建的存储过程执行特权操作；
- **SQL 中的用户定义函数（UDF）注入**：在支持 UDF 的数据库中加载恶意共享库；
- **配置漏洞**：如 PostgreSQL 的 `trust` 认证模式允许无密码本地登录。

### 2.2 最小权限原则的形式化定义

**定义 2.4（最小权限原则，Principle of Least Privilege, PoLP）**
设系统中存在主体集合 `S`（用户、应用、服务）和客体集合 `O`（数据表、列、行、操作）。每个主体 `s ∈ S` 被分配权限集合 `P(s) ⊆ P_all`，其中 `P_all` 为系统中所有可能的权限。最小权限原则要求：

```
∀s ∈ S, P(s) = { p ∈ P_all | ∃合法业务场景需要 s 执行 p }
```

即主体仅拥有完成其职责所必需的权限，不多也不少。

**数据库层面的最小权限实践**：

1. **应用账号分离**：为不同微服务分配独立的数据库用户，每个用户仅拥有其需要的表权限；
2. **列级权限**：通过视图或列级 GRANT 限制敏感列（如密码哈希、身份证号）的访问；
3. **行级权限**：通过 RLS（Row Level Security）或应用层过滤，确保用户只能看到属于自己的数据；
4. **禁止 DDL 权限**：应用运行时账号不应拥有 CREATE、DROP、ALTER 权限，schema 变更通过迁移脚本由独立 CI 账号执行。

### 2.3 加密层次的形式化体系

数据在生命周期中经历三种状态，每种状态需要不同的加密保护：

**定义 2.5（传输中加密，Encryption in Transit）**
数据在网络链路中传输时的保护，通常通过 TLS（Transport Layer Security）实现。TLS 提供：

- **机密性**：对称加密防止窃听；
- **完整性**：消息认证码（MAC）防止篡改；
- **真实性**：证书链验证通信双方身份。

**定义 2.6（静态加密，Encryption at Rest）**
数据持久化存储在磁盘时的保护。数据库层面的静态加密包括：

- **表空间加密（TDE, Transparent Data Encryption）**：在存储引擎层加密整个数据文件，对应用透明；
- **文件系统加密**：如 LUKS、BitLocker、AWS EBS 加密；
- **备份加密**：数据库备份文件必须独立加密，防止备份介质泄露导致数据暴露。

**定义 2.7（字段级加密，Field-Level Encryption）**
对特定敏感字段（如信用卡号、社会安全号码）进行单独加密。字段级加密可以发生在数据库层（如 PostgreSQL 的 `pgcrypto` 扩展）或应用层（如 AES-256-GCM）。

**定义 2.8（应用层加密，Application-Level Encryption）**
数据在写入数据库之前由应用完成加密，数据库仅存储密文。优势在于：

- 数据库管理员（DBA）也无法读取敏感数据；
- 支持端到端加密场景（如零信任架构）；
- 可以结合密钥派生函数（KDF）实现按用户/按租户的不同密钥。

代价是：

- 查询受限：无法在密文上执行范围查询或模糊匹配（除非使用保序加密或同态加密）；
- 性能开销：加解密消耗 CPU 资源；
- 密钥管理复杂度：需要可靠的密钥分发和轮换机制。

### 2.4 审计日志的形式化语义

**定义 2.9（审计日志，Audit Log）**
审计日志是系统中安全相关事件的不可篡改记录。形式化地，审计日志 `L` 是事件序列 `⟨e₁, e₂, ..., eₙ⟩`，每个事件 `eᵢ = (tᵢ, aᵢ, sᵢ, oᵢ, rᵢ, mᵢ)` 包含：

- `tᵢ`：时间戳；
- `aᵢ`：动作类型（LOGIN, SELECT, INSERT, UPDATE, DELETE, GRANT 等）；
- `sᵢ`：主体（执行动作的用户/应用）；
- `oᵢ`：客体（被访问的数据对象）；
- `rᵢ`：结果（SUCCESS, FAILURE）；
- `mᵢ`：元数据（客户端 IP、应用名称、会话 ID 等）。

审计日志必须满足：

1. **完整性**：日志生成后不可被修改或删除；
2. **不可否认性**：通过数字签名或写入只追加存储（WORM, Write-Once-Read-Many）保证；
3. **时效性**：安全事件应在可接受的时间窗口内被记录和告警。

---

## 工程实践映射

### 3.1 SQL 注入防御：参数化查询与 ORM 的自动转义

SQL 注入的根本原因是**用户输入被当作代码执行**。防御的核心策略是将数据与代码分离——这正是参数化查询（Parameterized Query）的本质。

**参数化查询的原理**
参数化查询将 SQL 语句模板与参数值分开发送给数据库：

```typescript
// 危险：字符串拼接
const query = `SELECT * FROM users WHERE email = '${email}'`;

// 安全：参数化查询
const query = 'SELECT * FROM users WHERE email = $1';
const result = await client.query(query, [email]);
```

数据库驱动在收到模板和参数后：

1. 解析 SQL 模板，生成执行计划；
2. 将参数作为**纯数据值**绑定到执行计划；
3. 参数值永远不会被解析为 SQL 关键字或操作符。

即使攻击者输入 `email = "' OR '1'='1"`，数据库也会将其视为一个完整的字符串值进行匹配，而不是拆分谓词。

**Prisma 的注入防御**
Prisma 的查询引擎内部将所有查询编译为参数化的 prepared statement：

```typescript
// Prisma 自动参数化
const user = await prisma.user.findUnique({
  where: { email: req.body.email } // 无论输入什么，都是安全的
});

// 原始查询也使用参数化
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${req.body.email}
`;
// 注意：必须使用模板字符串标签，不是普通字符串拼接
```

**重要陷阱**：`$queryRaw` 与 `$queryRawUnsafe` 的区别：

```typescript
// 安全：模板字符串标签自动参数化
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// 危险：Unsafe  variant 不自动参数化
await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE id = ${userId}` // 如果 userId 来自用户输入，存在注入风险
);
```

**TypeORM 的注入防御**
TypeORM 的 QueryBuilder 和参数化方法同样提供自动转义：

```typescript
// 安全：QueryBuilder 自动参数化
const users = await dataSource
  .getRepository(User)
  .createQueryBuilder('user')
  .where('user.email = :email', { email: req.body.email })
  .getMany();

// 安全：find 选项
const user = await userRepository.findOneBy({ email: req.body.email });

// 危险：直接执行用户传入的字符串
await dataSource.query(req.body.sql); // 绝对禁止！
```

**输入验证的纵深防御**
参数化查询是第一道防线，输入验证是第二道。使用 Zod 等 schema 验证库在应用层拒绝恶意输入：

```typescript
import { z } from 'zod';

const UserQuerySchema = z.object({
  email: z.string().email().max(255),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

// 在控制器中先验证，再查询
const params = UserQuerySchema.parse(req.query);
const users = await prisma.user.findMany({
  where: { email: params.email },
  skip: (params.page - 1) * params.limit,
  take: params.limit
});
```

### 3.2 NoSQL 注入防御

MongoDB 的注入防御同样依赖**将输入视为数据而非查询操作符**：

```typescript
// 危险：直接将用户对象传入查询
const user = await db.collection('users').findOne(req.body);

// 安全：显式指定查询结构，拒绝操作符
const user = await db.collection('users').findOne({
  username: req.body.username,
  password: req.body.password
});

// 更安全：使用 BSON 类型断言，确保值为字符串
import { Binary } from 'mongodb';

// 最佳实践：使用 Mongoose schema 严格校验输入类型
const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});
```

**Express 中间件：过滤危险操作符**

```typescript
import { Request, Response, NextFunction } from 'express';

const DANGEROUS_KEYS = ['$where', '$gt', '$gte', '$lt', '$lte', '$ne',
                        '$in', '$nin', '$regex', '$options', '$eq'];

function sanitizeMongoInput(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoInput);
  }
  if (obj && typeof obj === 'object') {
    const clean: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$') && DANGEROUS_KEYS.includes(key)) {
        throw new Error('Invalid query operator');
      }
      clean[key] = sanitizeMongoInput(value);
    }
    return clean;
  }
  return obj;
}

app.use((req: Request, res: Response, next: NextFunction) => {
  req.body = sanitizeMongoInput(req.body);
  req.query = sanitizeMongoInput(req.query);
  next();
});
```

### 3.3 数据库连接加密：SSL/TLS 配置

生产环境的数据库连接必须强制启用 TLS，防止中间人攻击窃听凭证和数据。

**PostgreSQL TLS 配置**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true, // 拒绝自签名证书（生产环境必须）
    ca: process.env.DB_CA_CERT, // CA 证书
    // 如需客户端证书认证：
    // key: process.env.DB_CLIENT_KEY,
    // cert: process.env.DB_CLIENT_CERT
  }
});
```

**Prisma 连接字符串中的 TLS**

```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=path/to/cert.pem"
```

`sslmode` 选项：

| 模式 | 行为 |
|-----|------|
| `disable` | 不使用 TLS（仅开发环境） |
| `prefer` | 优先 TLS，失败则回退明文 |
| `require` | 强制 TLS，但不验证证书 |
| `verify-ca` | 强制 TLS，验证 CA |
| `verify-full` | 强制 TLS，验证 CA 和主机名 |

**生产环境必须使用 `verify-full` 或至少 `verify-ca`。**

### 3.4 行级安全（RLS）：PostgreSQL 的细粒度访问控制

PostgreSQL 9.5+ 引入了行级安全（Row Level Security, RLS），允许在表上定义策略，使不同用户查询同一表时看到不同的行子集。

**启用 RLS**

```sql
-- 为表启用 RLS（默认对表所有者不生效，除非强制）
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY; -- 对表所有者也生效

-- 创建策略：用户只能看到自己的文档
CREATE POLICY document_owner_policy ON documents
  FOR ALL
  TO app_user
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

**在 Node.js 中设置 RLS 上下文**

```typescript
import { Pool } from 'pg';

const pool = new Pool({ /* ... */ });

// 中间件：在每个请求开始时设置 RLS 上下文
async function withRLS<T>(userId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    // 设置当前会话的用户上下文
    await client.query('SET LOCAL app.current_user_id = $1', [userId]);
    return await fn(client);
  } finally {
    await client.query('RESET app.current_user_id');
    client.release();
  }
}

// 使用
const docs = await withRLS(req.user.id, async (client) => {
  const result = await client.query('SELECT * FROM documents');
  // 由于 RLS，结果自动过滤为当前用户的文档
  return result.rows;
});
```

**RLS 与 ORM 的集成**

```typescript
// Prisma 中使用 RLS：通过中间件自动注入 SET
prisma.$use(async (params, next) => {
  const userId = getCurrentUserId();
  if (userId && params.model) {
    await prisma.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
  }
  const result = await next(params);
  if (userId && params.model) {
    await prisma.$executeRaw`RESET app.current_user_id`;
  }
  return result;
});
```

**RLS 的最佳实践**：

- 始终配合 `FORCE ROW LEVEL SECURITY`，防止超级用户绕过策略；
- 使用 `SECURITY DEFINER` 的函数需要特别审查，因为它们以函数所有者的权限执行；
- RLS 策略中的表达式应尽量简单，复杂的谓词可能导致全表扫描性能问题。

### 3.5 字段加密：pgcrypto 与应用层 AES

**数据库层加密：pgcrypto**
PostgreSQL 的 `pgcrypto` 扩展提供了一整套加密函数：

```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 对称加密（AES-256-CBC）
INSERT INTO patients (name, ssn_encrypted)
VALUES (
  'Alice',
  pgp_sym_encrypt('123-45-6789', current_setting('app.encryption_key'))
);

-- 解密查询
SELECT
  name,
  pgp_sym_decrypt(ssn_encrypted, current_setting('app.encryption_key')) as ssn
FROM patients
WHERE id = 'uuid';

-- 哈希（存储密码）
SELECT crypt('user_password', gen_salt('bf', 10)); -- bcrypt，cost=10
```

**应用层加密：Node.js 的 AES-256-GCM**

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class FieldEncryption {
  private key: Buffer;

  constructor(masterKey: string) {
    // 使用 HKDF 从主密钥派生加密密钥
    this.key = crypto.scryptSync(masterKey, 'salt', KEY_LENGTH);
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // 输出: iv:authTag:encrypted (hex encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }
}

// 使用
const encryption = new FieldEncryption(process.env.ENCRYPTION_MASTER_KEY!);

// 存储前加密
const encryptedSsn = encryption.encrypt(user.ssn);
await prisma.user.create({ data: { ...user, ssn: encryptedSsn } });

// 读取后解密
const user = await prisma.user.findUnique({ where: { id } });
const ssn = encryption.decrypt(user.ssn);
```

**字段加密的选型矩阵**：

| 维度 | pgcrypto | 应用层 AES |
|-----|----------|-----------|
| 密钥管理 | 数据库层 | 应用层 |
| 查询能力 | 无法索引密文 | 无法索引密文 |
| 性能 | 数据库 CPU 开销 | 应用 CPU 开销，网络传输密文更小 |
| DBA 可见性 | 密钥配置正确时不可见 | 完全不可见 |
| 实现复杂度 | 低 | 中等（需处理密钥分发） |
| 适用场景 | 现有系统快速加固 | 高安全要求的新系统 |

**确定性加密与搜索**
若需要在加密字段上执行等值查询，可以使用**确定性加密（Deterministic Encryption）**：相同明文始终产生相同密文。代价是牺牲了语义安全性（攻击者可以判断两个值是否相同）。

```typescript
// 确定性加密：固定 IV（或使用哈希值作为 IV）
function deterministicEncrypt(plaintext: string, key: Buffer): string {
  // 使用 HMAC 派生 IV，确保相同明文 → 相同密文
  const iv = crypto.createHmac('sha256', key).update(plaintext).digest().subarray(0, IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return encrypted.toString('hex');
}
```

### 3.6 Secrets 管理：Vault、AWS Secrets Manager 与 Doppler

将数据库密码硬编码在代码或环境变量中是严重的安全隐患。生产环境应使用专用 secrets 管理工具。

**HashiCorp Vault**
Vault 是企业级 secrets 管理的事实标准，支持动态凭证（Dynamic Secrets）：

```typescript
import vault from 'node-vault';

const client = vault({ apiVersion: 'v1', endpoint: process.env.VAULT_ADDR });

// 使用 AppRole 认证
await client.approleLogin({
  role_id: process.env.VAULT_ROLE_ID,
  secret_id: process.env.VAULT_SECRET_ID
});

// 获取动态数据库凭证（PostgreSQL 后端）
const { data } = await client.read('database/creds/readonly');
const { username, password, lease_id, lease_duration } = data;

// 使用临时凭证连接数据库
const pool = new Pool({
  user: username,
  password: password,
  // ...
});

// 租约到期前续期或释放
setTimeout(async () => {
  await client.sys.revoke({ lease_id });
}, (lease_duration - 60) * 1000);
```

Vault 的 PostgreSQL 后端可以自动创建具有时间限制的临时用户，并配置相应的权限。即使凭证泄露，攻击者的窗口期也极为有限。

**AWS Secrets Manager**

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

async function getDatabaseCredentials() {
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: 'prod/db/credentials' })
  );
  return JSON.parse(response.SecretString!);
}

// 配合自动轮换：AWS Secrets Manager 可配置 Lambda 函数定期轮换密码
```

**Doppler（开发者友好型）**
Doppler 提供了比 Vault 更轻量的 secrets 管理体验，特别适合中小型团队：

```typescript
// Doppler CLI 将 secrets 注入为环境变量
// 应用代码无需 SDK，仅通过标准环境变量读取
const dbUrl = process.env.DATABASE_URL; // 由 Doppler 注入

// 或在 CI/CD 中直接使用 doppler run
// doppler run -- node dist/main.js
```

### 3.7 数据库审计：pgAudit 与结构化日志

**pgAudit 扩展**
pgAudit 是 PostgreSQL 的标准审计扩展，提供会话级和对象级审计：

```sql
-- 安装 pgAudit（需 PostgreSQL 9.5+，且通常需要共享库预加载）
CREATE EXTENSION pgaudit;

-- 配置审计策略（通过 postgresql.conf）
-- pgaudit.log = 'write, ddl'       -- 审计所有写操作和 DDL
-- pgaudit.log_relation = on        -- 为每个关系单独记录
-- pgaudit.log_catalog = off        -- 不审计系统目录访问
```

审计日志输出示例：

```
AUDIT: SESSION,1,1,WRITE,INSERT,TABLE,public.users,"INSERT INTO users (email) VALUES ('test@example.com')","",<not logged>
AUDIT: SESSION,1,1,WRITE,UPDATE,TABLE,public.users,"UPDATE users SET role = 'admin' WHERE id = 1","",<not logged>
```

**Node.js 层的审计中间件**

```typescript
interface AuditEvent {
  timestamp: string;
  action: string;
  userId: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  clientIp: string;
  result: 'success' | 'failure';
}

class AuditLogger {
  async log(event: AuditEvent) {
    // 写入只追加的审计表或外部系统（如 Elasticsearch、S3）
    await prisma.auditLog.create({
      data: {
        ...event,
        timestamp: new Date()
      }
    });
  }
}

// Prisma 中间件：自动记录变更
prisma.$use(async (params, next) => {
  const before = params.args.where ?
    await prisma[params.model].findUnique({ where: params.args.where }) : null;

  const result = await next(params);

  if (['create', 'update', 'delete'].includes(params.action)) {
    await auditLogger.log({
      action: `${params.model}.${params.action}`,
      userId: getCurrentUserId(),
      resource: params.model,
      resourceId: result?.id,
      changes: before ? diff(before, result) : undefined,
      clientIp: getClientIp(),
      result: 'success'
    });
  }

  return result;
});
```

### 3.8 合规性：GDPR 数据删除与假名化

**GDPR 第 17 条：被遗忘权（Right to Erasure）**
用户有权要求删除其个人数据。工程实现需注意：

1. **级联删除**：确保外键关系配置 `ON DELETE CASCADE`；
2. **软删除的陷阱**：若使用 `deletedAt` 软删除，数据仍存在于数据库中，不符合 GDPR 的彻底删除要求；
3. **备份与归档**：删除生产数据后，需确保备份在保留期届满后也被清除；
4. **分布式系统的最终一致性**：微服务架构中，用户数据可能分散在多个服务，需通过事件驱动确保全链路删除。

```typescript
// 硬删除实现（符合 GDPR）
async function deleteUserAccount(userId: string) {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.order.updateMany({
      where: { userId },
      data: { userId: null, anonymized: true } // 保留订单但解除关联
    }),
    prisma.profile.delete({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ]);

  // 发布事件，通知其他服务清理
  await eventBus.publish('user.deleted', { userId });
}
```

**假名化（Pseudonymization）**
GDPR 推荐将直接标识符（如邮箱、手机号）替换为假名，降低数据泄露风险：

```typescript
import crypto from 'crypto';

// 假名映射表单独存储，与业务数据隔离
class Pseudonymizer {
  private hmacKey: Buffer;

  constructor(key: string) {
    this.hmacKey = Buffer.from(key, 'hex');
  }

  pseudonymize(identifier: string): string {
    // 使用 HMAC-SHA256 生成不可逆假名
    return crypto.createHmac('sha256', this.hmacKey)
      .update(identifier)
      .digest('hex');
  }
}

// 使用：存储假名而非原始邮箱
const pseudonym = pseudonymizer.pseudonymize(user.email);
await prisma.user.create({
  data: {
    emailPseudonym: pseudonym,
    // 原始邮箱存储在独立的加密 vault 中，仅在必要时反查
  }
});
```

**数据分类与保留策略**

```typescript
enum DataClassification {
  PUBLIC = 'public',           // 公开数据，无限制
  INTERNAL = 'internal',       // 内部使用，需认证
  CONFIDENTIAL = 'confidential', // 敏感数据，需授权
  RESTRICTED = 'restricted'    // 高度敏感，需加密+审计
}

const RetentionPolicy = {
  [DataClassification.PUBLIC]: null,        // 永久保留
  [DataClassification.INTERNAL]: 365 * 2,   // 2年
  [DataClassification.CONFIDENTIAL]: 365,   // 1年
  [DataClassification.RESTRICTED]: 90       // 90天
};

// 定期任务：清理过期数据
async function enforceRetentionPolicy() {
  const cutoffDate = new Date();

  for (const [classification, days] of Object.entries(RetentionPolicy)) {
    if (days === null) continue;
    cutoffDate.setDate(cutoffDate.getDate() - days);

    await prisma.auditLog.deleteMany({
      where: {
        classification,
        createdAt: { lt: cutoffDate }
      }
    });
  }
}
```

---

## Mermaid 图表

### 图 1：数据库安全纵深防御体系

```mermaid
graph TD
    A[数据库安全纵深防御] --> B[应用层]
    A --> C[传输层]
    A --> D[数据库层]
    A --> E[存储层]
    A --> F[审计层]

    B --> B1[输入验证<br/>参数化查询]
    B --> B2[应用层加密<br/>Secrets管理]
    B --> B3[身份认证<br/>最小权限]

    C --> C1[TLS 1.3<br/>证书校验]
    C --> C2[连接加密<br/>防止窃听]

    D --> D1[RLS行级安全<br/>列级权限]
    D --> D2[审计扩展<br/>pgAudit]
    D --> D3[字段加密<br/>pgcrypto]

    E --> E1[TDE透明加密<br/>文件系统加密]
    E --> E2[备份加密<br/>WORM存储]

    F --> F1[不可篡改日志<br/>数字签名]
    F --> F2[实时监控<br/>异常告警]

    style A fill:#E8F5E9,stroke:#1B5E20,stroke-width:3px
    style B fill:#E3F2FD
    style C fill:#FFF3E0
    style D fill:#F3E5F5
    style E fill:#FFEBEE
    style F fill:#FFFDE7
```

### 图 2：SQL 注入攻击与防御机制

```mermaid
graph LR
    subgraph Attack["攻击流程"]
        A1[用户输入] --> A2["' OR '1'='1"]
        A2 --> A3[字符串拼接]
        A3 --> A4[恶意 SQL 执行]
    end

    subgraph Defense["防御机制"]
        D1[用户输入] --> D2[Schema验证]
        D2 --> D3[参数化查询]
        D3 --> D4["$1 = ' OR '1'='1"]
        D4 --> D5[数据库视为纯数据]
    end

    A4 -. 结果: 数据泄露 .-> R[全表返回]
    D5 -. 结果: 安全查询 .-> S[零条匹配]

    style Attack fill:#FFEBEE,stroke:#C62828
    style Defense fill:#E8F5E9,stroke:#2E7D32
    style R fill:#FFCDD2
    style S fill:#C8E6C9
```

### 图 3：加密层次与数据生命周期

```mermaid
graph LR
    subgraph Lifecycle["数据生命周期"]
        T1[传输中<br/>In Transit] --> T2[处理中<br/>In Processing]
        T2 --> T3[静态存储<br/>At Rest]
        T3 --> T4[归档/备份<br/>Archive]
    end

    T1 -. TLS 1.3 .-> E1[机密性+完整性+认证]
    T2 -. 内存加密/TEE .-> E2[可信执行环境]
    T3 -. TDE/字段级加密 .-> E3[磁盘密文存储]
    T4 -. 备份加密 .-> E4[WORM只追加存储]

    style T1 fill:#E3F2FD,stroke:#1565C0
    style T2 fill:#FFF3E0,stroke:#E65100
    style T3 fill:#E8F5E9,stroke:#2E7D32
    style T4 fill:#F3E5F5,stroke:#6A1B9A
```

### 图 4：Secrets 管理架构（HashiCorp Vault）

```mermaid
graph TD
    A[应用服务] -->|1. 认证| B[Vault Server]
    B -->|2. 验证 AppRole| B
    B -->|3. 请求动态凭证| C[PostgreSQL<br/>Secret Backend]
    C -->|4. 创建临时用户| D[PostgreSQL]
    C -->|5. 返回凭证| B
    B -->|6. 短期凭证| A
    A -->|7. 连接| D

    E[管理员] -->|配置策略| B
    E -->|定义角色权限| C

    F[自动轮换] -. 定时触发 .-> C

    style A fill:#E3F2FD,stroke:#1565C0
    style B fill:#FFF8E1,stroke:#F9A825,stroke-width:2px
    style C fill:#F3E5F5,stroke:#7B1FA2
    style D fill:#E8F5E9,stroke:#388E3C
    style E fill:#FFEBEE,stroke:#C62828
    style F fill:#E0F7FA,stroke:#00838F
```

---

## 理论要点总结

1. **SQL 注入的本质是代码与数据的边界破坏**：参数化查询通过将用户输入严格绑定为数据值，从根本上消除了注入可能性。ORM 的便利不能成为忽视安全审查的理由——`$queryRawUnsafe` 和直接执行用户输入的 API 是危险的暗礁。

2. **安全是一个纵深防御体系**：单一措施无法保证安全。输入验证 + 参数化查询 + 最小权限 + TLS + RLS + 审计日志构成了多层防线，每层都假设外层可能失效。

3. **加密需要与密钥管理同步考虑**：AES-256 算法本身很安全，但如果密钥硬编码在代码中或存储在版本控制里，加密就毫无意义。Vault、AWS Secrets Manager 等工具的价值在于将密钥生命周期管理（生成、分发、轮换、回收）系统化。

4. **最小权限原则需要在每一层落实**：应用数据库账号不应有 DDL 权限，普通用户不应访问审计表，备份账号应只读生产数据。权限的"刚刚好"比"宽泛方便"更安全。

5. **RLS 是实现多租户数据隔离的强大工具**：相比应用层的 `WHERE user_id = ?`，数据库层的 RLS 策略更难以被绕过，且对所有查询路径（包括即席查询和管理工具）统一生效。

6. **合规不是 checkbox，而是工程实践**：GDPR 的被遗忘权要求数据真正从所有存储中删除，而非仅仅标记为删除。假名化、数据分类和保留策略应嵌入数据模型设计，而非事后补丁。

7. **审计日志是安全事件的唯一真相源**：没有审计日志，就无法在事后追溯攻击路径或证明合规。审计数据应写入独立存储，并配置不可篡改保护（WORM、数字签名或区块链锚定）。

---

## 参考资源

1. **OWASP Foundation** — *SQL Injection*. OWASP Cheat Sheet Series, 2024. OWASP 的 SQL 注入速查表是开发者防御注入攻击的权威参考，涵盖了参数化查询、存储过程、输入验证和 WAF 等所有防御层。<https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html>

2. **PostgreSQL Global Development Group** — *Chapter 19: Server Setup and Operation; Chapter 21: Database Roles*. PostgreSQL Documentation, 2024. 官方文档详细说明了 SSL 配置、认证方法（pg_hba.conf）、角色权限系统和 RLS 策略的语法与语义。<https://www.postgresql.org/docs/current/runtime-config-connection.html>

3. **HashiCorp** — *Vault Documentation: Database Secrets Engine*. HashiCorp, 2024. Vault 数据库 secrets 引擎的官方文档，包含 PostgreSQL/MySQL/MongoDB 的动态凭证配置、连接池管理和自动轮换策略。<https://developer.hashicorp.com/vault/docs/secrets/databases>

4. **NIST** — *Guide to Database Security: Recommendations of the National Institute of Standards and Technology* (SP 800-73). National Institute of Standards and Technology, 2023. NIST 的数据库安全指南从威胁建模、访问控制、加密、审计和配置管理五个维度提供了联邦标准级别的安全建议。

5. **European Union** — *General Data Protection Regulation (GDPR), Articles 17 and 25*. Official Journal of the European Union, 2016. GDPR 第 17 条（删除权）和第 25 条（数据保护设计和默认设置）是工程实现数据隐私合规的法律基础，直接影响假名化、数据最小化和保留策略的技术设计。
