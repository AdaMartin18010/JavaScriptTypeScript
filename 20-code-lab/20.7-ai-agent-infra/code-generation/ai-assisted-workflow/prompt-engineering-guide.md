# Prompt 工程指南

> 本指南面向使用 AI 辅助编码的 JavaScript/TypeScript 开发者，提供编写高质量代码生成 Prompt 的系统化方法。

---

## 一、好的 Prompt 结构

一个高效的代码生成 Prompt 包含五个核心要素：**角色**、**上下文**、**任务**、**约束**、**输出格式**。

### 1.1 五要素模型

```
Prompt = 角色 + 上下文 + 任务 + 约束 + 输出格式
```

| 要素 | 作用 | 示例 |
|------|------|------|
| **角色** | 设定 AI 的专业视角 | "你是一位有 10 年经验的 TypeScript 架构师" |
| **上下文** | 提供背景信息 | "我们使用 Express + Prisma + Zod 构建 REST API" |
| **任务** | 明确要做什么 | "实现用户注册的邮箱验证功能" |
| **约束** | 限制条件和规范 | "不得使用 any 类型；错误使用自定义 AppError" |
| **输出格式** | 期望的输出形式 | "输出完整可运行的 TypeScript 代码，包含类型定义" |

### 1.2 结构模板

```markdown
## 角色
{设定 AI 的身份和专长}

## 上下文
{项目背景、技术栈、已有架构}

## 任务
{具体、可执行的要求}

## 约束
{必须遵守的规则和限制}

## 输出格式
{代码、表格、列表、diff 等}
```

---

## 二、代码生成 Prompt 模板库

### 2.1 API 开发

**场景：创建 RESTful API 端点**

```markdown
## 角色
Node.js 后端开发专家，精通 TypeScript 和 Express。

## 上下文
我们在开发一个内容管理系统，使用 Express + Prisma + Zod。
已有 Prisma schema 定义了 Post 模型（id, title, content, published, authorId, createdAt）。

## 任务
实现 POST /api/posts 端点，用于创建文章。

## 约束
- 使用 Zod 验证请求体
- 验证失败返回 400 和详细的字段错误信息
- 需要 JWT 认证（req.user 已包含用户信息）
- 使用 Prisma 事务确保数据一致性
- 不得暴露数据库内部错误给客户端

## 输出格式
1. 完整的 Express Router 代码
2. Zod schema 定义
3. 类型定义
4. curl 测试示例
```

### 2.2 前端组件

**场景：React 表单组件**

```markdown
## 角色
React 和 TypeScript 前端专家，熟悉现代 React 模式。

## 上下文
项目使用 React 19 + TypeScript + Tailwind CSS + React Hook Form + Zod。
需要创建一个用户资料编辑表单。

## 任务
实现 UserProfileForm 组件，允许用户编辑昵称、邮箱、简介。

## 约束
- 使用 React Hook Form 管理表单状态
- 使用 Zod 进行客户端验证
- 邮箱格式验证、昵称 2-20 字符、简介最多 200 字
- 提交时显示加载状态
- 错误提示使用中文
- 支持传入初始值和 onSubmit 回调

## 输出格式
1. 完整的 TSX 组件代码
2. Zod schema 和类型推断
3. 使用示例
```

### 2.3 数据转换/工具函数

**场景：数据格式化工具**

```markdown
## 角色
精通函数式编程的 JavaScript 开发者。

## 上下文
我们需要处理后端返回的分页数据，转换为前端组件需要的格式。

## 任务
编写一个分页数据转换函数，统一不同 API 的分页响应格式。

## 约束
- 纯函数，无副作用
- 支持两种输入格式：{ items, totalCount, page, pageSize } 和 { data, meta: { total, current_page, per_page } }
- 输出统一格式：{ items, pagination: { total, page, pageSize, totalPages, hasNext, hasPrev } }
- 使用 TypeScript 泛型支持任意 item 类型
- 包含完整的 JSDoc

## 输出格式
完整的 TypeScript 代码，包含类型定义和 3 个以上使用示例
```

### 2.4 错误处理

**场景：统一错误处理中间件**

```markdown
## 角色
Node.js 错误处理和日志专家。

## 上下文
Express 应用需要统一的错误处理机制，区分业务错误和系统错误。

## 任务
实现全局错误处理中间件和自定义错误类体系。

## 约束
- 自定义错误类：ValidationError、NotFoundError、UnauthorizedError、ConflictError
- 每个错误类包含 statusCode、message、code（机器可读的错误码）
- 中间件根据错误类型返回不同的 HTTP 状态码
- 开发环境返回完整错误堆栈，生产环境只返回 message
- 使用 winston 记录所有错误

## 输出格式
1. 错误类定义
2. 中间件实现
3. 使用示例
4. 错误响应的 JSON 结构说明
```

### 2.5 测试生成

**场景：生成单元测试**

```markdown
## 角色
测试驱动开发（TDD）实践者，擅长编写可维护的测试。

## 上下文
使用 Vitest 作为测试框架，项目使用 TypeScript。

## 任务
为以下函数生成单元测试：

{函数源码}

## 约束
- 覆盖正常路径、边界条件、异常情况
- 使用 describe + it 结构
- 测试名称使用中文描述场景
- Mock 外部依赖
- 遵循 Arrange-Act-Assert 结构

## 输出格式
完整的 .test.ts 文件，可直接运行
```

### 2.6 数据库查询

**场景：Prisma 复杂查询**

```markdown
## 角色
数据库查询优化专家，熟悉 Prisma ORM。

## 上下文
使用 Prisma + PostgreSQL，需要查询用户及其最近的订单信息。

## 任务
编写一个 Prisma 查询，获取用户信息并包含：
- 最近 5 个订单（按 createdAt 倒序）
- 每个订单包含订单项和商品名称
- 统计订单总数和总金额

## 约束
- 使用 Prisma 的 include/select 优化查询字段
- 避免 N+1 查询
- 使用类型安全的查询
- 处理用户不存在的情况

## 输出格式
1. Prisma 查询代码
2. 生成的 SQL 说明（概念层面）
3. 返回类型定义
```

### 2.7 正则表达式

**场景：复杂文本解析**

```markdown
## 角色
正则表达式专家。

## 任务
编写一个正则表达式解析日志行，格式如下：
[2024-01-15 10:30:45] [INFO] 用户 12345 执行操作: login

## 约束
- 提取时间戳、日志级别、用户ID、操作类型
- 支持 ERROR/WARN/INFO/DEBUG 级别
- 用户ID为数字，操作类型为字母和下划线
- 提供 TypeScript 解析函数，返回结构化对象

## 输出格式
1. 正则表达式及解释
2. TypeScript 解析函数
3. 5 个测试用例（包含边界情况）
```

### 2.8 性能优化

**场景：优化大数据量渲染**

```markdown
## 角色
前端性能优化专家。

## 上下文
React 应用需要渲染一个包含 10,000 条数据的表格，当前页面卡顿。

## 任务
优化大数据表格的渲染性能。

## 约束
- 使用虚拟滚动只渲染可见行
- 支持排序和筛选（不丢失滚动位置）
- 行高固定为 48px
- 使用 TypeScript 和 React
- 包含加载状态和空状态处理

## 输出格式
1. 优化后的组件代码
2. 性能优化思路说明
3. 复杂度分析
```

### 2.9 类型定义

**场景：复杂类型推导**

```markdown
## 角色
TypeScript 类型系统专家。

## 任务
为以下 API 响应定义类型，要求：
- 从 JSON schema 生成严格的 TypeScript 类型
- 使用泛型使类型可复用
- 推导嵌套对象的类型
- 标记可选字段和可空字段

## 约束
- 不得使用 any
- 使用 utility types（Pick, Omit, Partial 等）减少重复
- 提供类型守卫函数
- 包含运行时验证（Zod schema）

## 输出格式
1. TypeScript 类型定义
2. Zod schema（用于运行时验证）
3. 类型守卫函数
4. 使用示例
```

### 2.10 CLI 工具

**场景：Node.js CLI 工具**

```markdown
## 角色
Node.js CLI 开发专家，熟悉现代命令行工具设计。

## 任务
创建一个 CLI 工具，用于批量重命名文件（支持正则替换）。

## 约束
- 使用 commander.js 解析参数
- 支持 --dry-run 预览模式
- 支持 --recursive 递归处理子目录
- 显示进度条（使用 cli-progress）
- 包含完整的帮助信息
- 使用 TypeScript，编译为 CommonJS

## 输出格式
1. 完整的 CLI 源码
2. package.json 的 bin 配置
3. 使用示例和安装说明
```

### 2.11 配置管理

**场景：环境配置验证**

```markdown
## 角色
Node.js 配置管理专家。

## 任务
实现一个类型安全的环境变量加载和验证模块。

## 约束
- 使用 dotenv 加载 .env 文件
- 使用 Zod 验证所有必需的环境变量
- 在应用启动时验证，缺少必需变量时立即退出并提示
- 区分开发/测试/生产环境的不同配置
- 敏感变量（密码、密钥）不得打印到日志

## 输出格式
1. 配置模块代码
2. .env.example 文件
3. 使用示例
```

---

## 三、迭代优化 Prompt 的方法

### 3.1 迭代流程

```
初版 Prompt → 生成代码 → 评估质量 → 识别问题 → 优化 Prompt → 重新生成
```

### 3.2 常见问题与优化策略

| 问题 | 优化策略 |
|------|----------|
| 代码太长 | 添加约束："将功能拆分为不超过 20 行的函数" |
| 使用了废弃 API | 添加上下文："使用 XXX 库 v3.x 版本" |
| 缺少错误处理 | 显式要求："每个异步操作必须包含 try/catch" |
| 类型不安全 | 强调："不得使用 any，使用 unknown + 类型守卫" |
| 不符合项目风格 | 提供示例代码："参考以下代码风格：[示例]" |
| 遗漏边界条件 | 要求："包含所有边界条件的处理" |

### 3.3 反馈模板

当 AI 生成结果不满意时，使用以下结构提供反馈：

```markdown
## 问题
{具体描述哪里不对}

## 期望
{描述你期望的结果}

## 参考
{提供正确的示例或对比}

请基于以上反馈重新生成。
```

---

## 四、常见反模式

### 4.1 Prompt 过于模糊 ❌

```markdown
# 不好的示例
"帮我写一个用户系统"
```

**问题**：

- 没有说明技术栈
- 没有定义"用户系统"的范围
- 没有指定输出格式

**改进**：

```markdown
## 角色
Node.js 后端开发者

## 任务
实现用户注册和登录的 API 端点

## 技术栈
Express + TypeScript + Prisma + bcrypt + JWT

## 约束
- 注册时验证邮箱唯一性，密码至少 8 位
- 登录成功后返回 JWT access token 和 refresh token
- 使用 Zod 验证请求体
- 密码使用 bcrypt 加密存储

## 输出
完整的 router 代码、Prisma schema 更新、类型定义
```

### 4.2 Prompt 过于具体 ❌

```markdown
# 不好的示例
"创建一个函数，第 1 行导入 zod，第 2 行定义 schema，
第 3 行定义接口 User，第 4 行导出函数..."
```

**问题**：

- 限制了 AI 的创造性
- 如果思路本身有问题，AI 无法提出更好的方案
- 代码可能显得生硬、不自然

**改进**：

```markdown
"使用 Zod 定义用户注册的数据验证 schema，并导出对应的 TypeScript 类型。
要求验证邮箱格式和密码强度（至少 8 位，包含字母和数字）。"
```

### 4.3 缺少上下文 ❌

```markdown
# 不好的示例
"修复这个 bug"
```

**问题**：

- AI 不知道项目架构
- 无法判断修复方案是否合适

**改进**：

```markdown
"在 Express 应用中，以下中间件在处理异步错误时无法正确传递给错误处理器。
请修复并确保所有异步中间件都能正确捕获错误。"
```

### 4.4 忽略约束 ❌

```markdown
# 不好的示例
"生成一个排序函数"
```

**问题**：

- 可能生成不符合需求的实现（如不稳定排序）
- 可能使用不允许的 API

**改进**：

```markdown
"实现一个稳定排序函数，按用户的 lastLogin 时间倒序排列。
约束：不得修改原数组；时间复杂度 O(n log n)；使用 TypeScript。"
```

### 4.5 期望一次完美 ❌

**问题**：

- 复杂任务一次性 Prompt 往往效果不佳
- AI 可能遗漏部分需求

**改进**：

- 分步骤迭代：先生成骨架 → 补充细节 → 优化边界
- 使用 "先列出实现步骤，确认后再生成代码" 的策略

---

## 五、高级技巧

### 5.1 少样本学习（Few-Shot）

在 Prompt 中提供 1-3 个示例，引导 AI 遵循特定模式：

```markdown
请按照以下模式生成验证函数：

示例 1：
输入: validateEmail
输出:
```ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

示例 2：
输入: validatePhone
输出:

```ts
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}
```

现在请生成：validateUrl

```

### 5.2 思维链（Chain-of-Thought）

要求 AI 先思考再编码：

```markdown
在生成代码之前，请先：
1. 分析需求的关键点
2. 列出可能的技术方案并比较优劣
3. 选择最佳方案并说明理由
4. 然后生成实现代码
```

### 5.3 反向 Prompt（Negative Prompting）

明确告诉 AI 不要做什么：

```markdown
要求：
- 不要使用 class 语法，使用函数和闭包
- 不要使用 var，使用 const/let
- 不要生成测试代码（我会单独处理）
- 不要使用第三方库（只用原生 API）
```

---

## 六、Prompt 模板速查

### 快速开始模板

```markdown
## 角色
{你的角色定位}

## 上下文
{项目/技术背景}

## 任务
{要完成的编码任务}

## 约束
- {约束 1}
- {约束 2}

## 输出
{期望的输出形式和范围}
```

### 代码审查模板

```markdown
请审查以下代码，从以下维度评估：
1. 类型安全性
2. 错误处理完整性
3. 潜在安全漏洞
4. 性能问题
5. 可维护性

代码：
{代码块}

请以 JSON 格式输出每个问题，包含：severity、category、description、suggestion
```

### 重构模板

```markdown
请重构以下代码，目标：{重构目标}

原始代码：
{代码块}

约束：
- 保持现有行为不变
- {其他约束}

请输出重构后的代码，并对每处变更说明理由。
```
