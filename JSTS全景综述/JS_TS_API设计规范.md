# JavaScript / TypeScript API 设计规范

> 涵盖函数设计、类设计、模块设计、REST API设计的完整规范

---

## 1. 函数设计原则

### 1.1 参数设计

```typescript
// ❌ 坏: 过多参数
function createUser(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    country: string
) { }

// ✅ 好: 使用对象参数
interface CreateUserParams {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        country: string;
    };
}

function createUser(params: CreateUserParams) { }

// 使用
createUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
});
```

### 1.2 默认参数与可选参数

```typescript
// ✅ 使用默认参数
function fetchData(
    url: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        timeout?: number;
        retries?: number;
    } = {}
) {
    const {
        method = 'GET',
        timeout = 5000,
        retries = 3
    } = options;
    // ...
}

// ✅ 使用重载提供类型安全
type FetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
};

// 重载声明
function request(url: string): Promise<Response>;
function request(url: string, options: FetchOptions): Promise<Response>;
function request(url: string, options?: FetchOptions): Promise<Response> {
    return fetch(url, options);
}
```

### 1.3 返回值设计

```typescript
// ✅ 返回明确类型
interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

async function getUser(id: string): Promise<Result<User>> {
    try {
        const user = await db.users.findById(id);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        return { success: true, data: user };
    } catch (error) {
        return { success: false, error: 'Database error' };
    }
}

// ✅ 使用 Result 类型替代抛出异常
const result = await getUser('123');
if (result.success) {
    console.log(result.data.name);
} else {
    console.error(result.error);
}
```

---

## 2. 类设计原则

### 2.1 单一职责

```typescript
// ❌ 坏: 一个类做太多事
class UserManager {
    createUser(data: UserData) { }
    validateEmail(email: string) { }
    sendWelcomeEmail(user: User) { }
    logActivity(action: string) { }
    encryptPassword(password: string) { }
}

// ✅ 好: 分离职责
class UserService {
    constructor(
        private repository: UserRepository,
        private validator: UserValidator,
        private emailService: EmailService,
        private logger: Logger
    ) { }
    
    async createUser(data: UserData): Promise<User> {
        const validated = this.validator.validate(data);
        const user = await this.repository.save(validated);
        await this.emailService.sendWelcome(user);
        this.logger.info('User created', { userId: user.id });
        return user;
    }
}
```

### 2.2 不可变性

```typescript
// ✅ 优先使用 readonly
class ImmutableUser {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly createdAt: Date,
        private _lastLogin?: Date
    ) { }
    
    // 更新返回新实例
    withLastLogin(date: Date): ImmutableUser {
        return new ImmutableUser(
            this.id,
            this.email,
            this.createdAt,
            date
        );
    }
    
    get lastLogin(): Date | undefined {
        return this._lastLogin;
    }
}

// ✅ 使用 Builder 模式创建复杂对象
class UserBuilder {
    private firstName = '';
    private lastName = '';
    private email = '';
    private roles: string[] = [];
    
    setName(first: string, last: string): this {
        this.firstName = first;
        this.lastName = last;
        return this;
    }
    
    setEmail(email: string): this {
        this.email = email;
        return this;
    }
    
    addRole(role: string): this {
        this.roles.push(role);
        return this;
    }
    
    build(): User {
        return new User(
            this.firstName,
            this.lastName,
            this.email,
            this.roles
        );
    }
}

const user = new UserBuilder()
    .setName('John', 'Doe')
    .setEmail('john@example.com')
    .addRole('admin')
    .build();
```

### 2.3 接口隔离

```typescript
// ❌ 坏: 大而全的接口
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}

// ✅ 好: 拆分成小接口
interface Workable {
    work(): void;
}

interface Eatable {
    eat(): void;
}

interface Sleepable {
    sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
    work() { }
    eat() { }
    sleep() { }
}

class Robot implements Workable {
    work() { }
}
```

---

## 3. 模块设计原则

### 3.1 清晰的模块边界

```typescript
// ✅ 明确的导出
// user/index.ts
export { UserService } from './user-service';
export { UserRepository } from './user-repository';
export type { User, CreateUserDTO } from './types';

// ✅ 内部实现不导出
// user/internal/cache.ts (不导出)
class UserCache {
    // 内部实现
}
```

### 3.2 依赖方向

```
依赖方向 (内层 ← 外层):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

领域层 (Domain)
├── 实体 (Entities)
├── 值对象 (Value Objects)
└── 领域服务 (Domain Services)
    ↑
应用层 (Application)
├── 用例 (Use Cases)
├── DTOs
└── 应用服务
    ↑
基础设施层 (Infrastructure)
├── 数据库访问
├── 外部API客户端
└── 消息队列

依赖规则: 内层不依赖外层
```

```typescript
// ✅ 依赖倒置
// 领域层定义接口
interface UserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}

// 应用层依赖接口
class UserService {
    constructor(private repository: UserRepository) { }
}

// 基础设施层实现接口
class PostgresUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> { }
    async save(user: User): Promise<void> { }
}
```

---

## 4. REST API 设计规范

### 4.1 URL 设计

```
资源命名规范:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 使用名词复数
GET    /api/users              # 获取用户列表
GET    /api/users/:id          # 获取单个用户
POST   /api/users              # 创建用户
PUT    /api/users/:id          # 更新用户
DELETE /api/users/:id          # 删除用户

✅ 嵌套资源
GET    /api/users/:id/orders   # 获取用户的订单
POST   /api/users/:id/orders   # 为用户创建订单

❌ 避免使用动词
GET    /api/getUsers           # 不好
POST   /api/createUser         # 不好

✅ 使用查询参数过滤/排序/分页
GET /api/users?status=active&sort=createdAt:desc&page=1&limit=20
```

### 4.2 请求/响应格式

```typescript
// ✅ 统一的响应结构
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// 成功响应示例
{
    "success": true,
    "data": {
        "id": "123",
        "email": "user@example.com",
        "name": "John Doe"
    }
}

// 列表响应示例
{
    "success": true,
    "data": [
        { "id": "1", "name": "User 1" },
        { "id": "2", "name": "User 2" }
    ],
    "meta": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
    }
}

// 错误响应示例
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "请求参数验证失败",
        "details": {
            "email": ["邮箱格式不正确"],
            "age": ["年龄必须在18-100之间"]
        }
    }
}
```

### 4.3 HTTP 状态码使用

```typescript
// ✅ 正确使用状态码
const statusCodes = {
    // 2xx 成功
    OK: 200,                    // GET, PUT, DELETE 成功
    CREATED: 201,               // POST 创建成功
    ACCEPTED: 202,              // 异步处理已接受
    NO_CONTENT: 204,            // 删除成功，无返回内容
    
    // 3xx 重定向
    MOVED_PERMANENTLY: 301,     // 资源永久移动
    NOT_MODIFIED: 304,          // 缓存有效
    
    // 4xx 客户端错误
    BAD_REQUEST: 400,           // 请求参数错误
    UNAUTHORIZED: 401,          // 未认证
    FORBIDDEN: 403,             // 无权限
    NOT_FOUND: 404,             // 资源不存在
    CONFLICT: 409,              // 资源冲突 (如重复创建)
    UNPROCESSABLE_ENTITY: 422,  // 语义错误
    TOO_MANY_REQUESTS: 429,     // 限流
    
    // 5xx 服务端错误
    INTERNAL_ERROR: 500,        // 内部错误
    NOT_IMPLEMENTED: 501,       // 功能未实现
    BAD_GATEWAY: 502,           // 网关错误
    SERVICE_UNAVAILABLE: 503,   // 服务不可用
};
```

### 4.4 错误处理

```typescript
// ✅ 定义标准错误
class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number,
        public details?: Record<string, string[]>
    ) {
        super(message);
    }
}

// 具体错误类型
class ValidationError extends ApiError {
    constructor(details: Record<string, string[]>) {
        super(
            'VALIDATION_ERROR',
            '请求参数验证失败',
            400,
            details
        );
    }
}

class NotFoundError extends ApiError {
    constructor(resource: string) {
        super(
            'NOT_FOUND',
            `${resource} 不存在`,
            404
        );
    }
}

// ✅ 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        });
    }
    
    // 未预期的错误
    logger.error('Unexpected error', err);
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: '服务器内部错误'
        }
    });
});
```

---

## 5. GraphQL API 设计规范

### 5.1 Schema 设计

```graphql
# ✅ 使用语义化类型名
type User {
    id: ID!
    email: String!
    name: String!
    createdAt: DateTime!
    orders: [Order!]!  # 非空列表包含非空元素
}

type Order {
    id: ID!
    total: Float!
    status: OrderStatus!
    user: User!
}

enum OrderStatus {
    PENDING
    PROCESSING
    COMPLETED
    CANCELLED
}

# ✅ 输入类型分离
input CreateUserInput {
    email: String!
    name: String!
    password: String!
}

input UpdateUserInput {
    email: String
    name: String
}

# ✅ 查询和变更分离
type Query {
    user(id: ID!): User
    users(
        filter: UserFilter
        pagination: PaginationInput
    ): UserConnection!
}

type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
}

# ✅ 分页使用 Connection 模式
type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
}

type UserEdge {
    node: User!
    cursor: String!
}

type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
}
```

### 5.2 Resolver 实现

```typescript
// ✅ 使用 DataLoader 解决 N+1 问题
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids: readonly string[]) => {
    const users = await db.users.findMany({
        where: { id: { in: [...ids] } }
    });
    return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
    Query: {
        user: (_, { id }) => userLoader.load(id),
        users: (_, { filter, pagination }) => {
            return userService.findAll(filter, pagination);
        }
    },
    
    Order: {
        // ✅ 使用 DataLoader 批量加载
        user: (order) => userLoader.load(order.userId)
    }
};
```

---

## 6. SDK/API 客户端设计

### 6.1 客户端 SDK 设计

```typescript
// ✅ 链式 API 设计
class ApiClient {
    private baseURL: string;
    private headers: Record<string, string> = {};
    
    constructor(config: { baseURL: string; apiKey?: string }) {
        this.baseURL = config.baseURL;
        if (config.apiKey) {
            this.headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
    }
    
    // 资源访问
    get users() {
        return new UserResource(this);
    }
    
    get orders() {
        return new OrderResource(this);
    }
    
    // 内部请求方法
    async request<T>(
        method: string,
        path: string,
        options?: { body?: unknown; params?: Record<string, string> }
    ): Promise<T> {
        const url = new URL(path, this.baseURL);
        if (options?.params) {
            Object.entries(options.params).forEach(([k, v]) => {
                url.searchParams.append(k, v);
            });
        }
        
        const response = await fetch(url.toString(), {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this.headers
            },
            body: options?.body ? JSON.stringify(options.body) : undefined
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(error.code, error.message, response.status);
        }
        
        return response.json();
    }
}

// 资源类
class UserResource {
    constructor(private client: ApiClient) { }
    
    async list(params?: { page?: number; limit?: number }) {
        return this.client.request<User[]>('GET', '/users', { params });
    }
    
    async get(id: string) {
        return this.client.request<User>('GET', `/users/${id}`);
    }
    
    async create(data: CreateUserDTO) {
        return this.client.request<User>('POST', '/users', { body: data });
    }
    
    async update(id: string, data: UpdateUserDTO) {
        return this.client.request<User>('PUT', `/users/${id}`, { body: data });
    }
    
    async delete(id: string) {
        return this.client.request<void>('DELETE', `/users/${id}`);
    }
}

// 使用
const client = new ApiClient({
    baseURL: 'https://api.example.com',
    apiKey: process.env.API_KEY
});

const users = await client.users.list({ page: 1, limit: 20 });
const user = await client.users.create({
    email: 'john@example.com',
    name: 'John Doe'
});
```

---

## 7. 版本控制策略

### 7.1 API 版本化

```
版本策略:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL 路径版本 (推荐):
/api/v1/users
/api/v2/users

Header 版本:
/api/users
Accept: application/vnd.api+json;version=2

兼容性规则:
• 添加新字段: 向后兼容 (minor)
• 删除/重命名字段: 不兼容 (major)
• 修改行为: 视情况而定
```

```typescript
// ✅ 使用 OpenAPI 规范文档化 API
// openapi.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      summary: 获取用户列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
```

---

## 8. API 安全规范

### 8.1 认证与授权

```typescript
// ✅ JWT 认证
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        roles: string[];
    };
}

const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: '缺少认证令牌' }
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: '无效的令牌' }
        });
    }
};

// ✅ 权限检查
const authorize = (...roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const user = (req as AuthenticatedRequest).user;
        if (!roles.some(role => user.roles.includes(role))) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: '无权限访问' }
            });
        }
        next();
    };
};

// 使用
app.get('/api/admin/users', authenticate, authorize('admin'), getUsers);
```

### 8.2 限流

```typescript
// ✅ 使用 express-rate-limit
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 分钟
    max: 100,                   // 每个 IP 100 次请求
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: '请求过于频繁，请稍后再试'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', apiLimiter);

// ✅ 基于用户的限流
const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => {
        return (req as AuthenticatedRequest).user?.id || req.ip;
    }
});

app.post('/api/login', strictLimiter, login);
```

---

*本文档提供了设计高质量 JavaScript/TypeScript API 的完整规范，应作为代码审查和设计评审的参考。*
