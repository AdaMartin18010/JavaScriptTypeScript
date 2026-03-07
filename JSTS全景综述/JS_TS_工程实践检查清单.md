# JavaScript / TypeScript 工程实践检查清单

> 覆盖代码质量、安全、性能、可维护性的完整检查清单

---

## 1. 代码质量检查清单

### 1.1 类型安全

- [ ] **无隐式 any**
  ```typescript
  // ❌ 避免
  function process(data) { /* ... */ }
  
  // ✅ 推荐
  function process(data: unknown) { /* ... */ }
  ```

- [ ] **无类型断言滥用**
  ```typescript
  // ❌ 避免
  const user = json as User;
  
  // ✅ 推荐
  if (isValidUser(json)) {
      const user = json;
  }
  ```

- [ ] **启用严格模式**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "alwaysStrict": true
    }
  }
  ```

### 1.2 代码风格

- [ ] **一致的命名规范**
  - 类/接口: `PascalCase`
  - 函数/变量: `camelCase`
  - 常量: `SCREAMING_SNAKE_CASE`
  - 私有成员: `_leadingUnderscore` 或 `#private`

- [ ] **使用 ESLint 和 Prettier**
  ```json
  // .eslintrc.json
  {
    "extends": [
      "eslint:recommended",
      "@typescript-eslint/recommended",
      "@typescript-eslint/recommended-requiring-type-checking"
    ],
    "rules": {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
  ```

- [ ] **文件大小控制**
  - 单文件不超过 500 行
  - 函数不超过 50 行
  - 类不超过 300 行

### 1.3 代码结构

- [ ] **单一职责原则 (SRP)**
  ```typescript
  // ❌ 坏: 一个类做太多事
  class UserManager {
      createUser() { }
      sendEmail() { }
      validateData() { }
      logActivity() { }
  }
  
  // ✅ 好: 分离职责
  class UserService {
      createUser() { }
  }
  class EmailService {
      sendEmail() { }
  }
  class UserValidator {
      validateData() { }
  }
  ```

- [ ] **依赖注入**
  ```typescript
  // ❌ 坏: 直接实例化依赖
  class OrderService {
      private db = new Database();  // 紧耦合
  }
  
  // ✅ 好: 通过构造函数注入
  class OrderService {
      constructor(private db: Database) { }
  }
  ```

---

## 2. 安全检查清单

### 2.1 输入验证

- [ ] **所有用户输入都经过验证**
  ```typescript
  import { z } from 'zod';
  
  const UserSchema = z.object({
      email: z.string().email(),
      age: z.number().int().min(0).max(150),
      name: z.string().min(1).max(100)
  });
  
  // 验证输入
  const user = UserSchema.parse(req.body);
  ```

- [ ] **防止原型污染**
  ```typescript
  // ✅ 冻结原型
  Object.freeze(Object.prototype);
  
  // ✅ 使用 Object.create(null) 创建无原型对象
  const safeMap = Object.create(null);
  
  // ✅ 拒绝危险键
  function safeSet(obj: any, key: string, value: any) {
      if (key === '__proto__' || key === 'constructor') {
          throw new Error('Invalid key');
      }
      obj[key] = value;
  }
  ```

### 2.2 依赖安全

- [ ] **定期审计依赖**
  ```bash
  npm audit
  pnpm audit
  # 或使用 Snyk
  npx snyk test
  ```

- [ ] **锁定版本**
  ```json
  // package.json
  {
    "dependencies": {
      "lodash": "4.17.21"  // 精确版本
    }
  }
  
  // 使用 lock 文件
  // package-lock.json, pnpm-lock.yaml, yarn.lock
  ```

- [ ] **最小权限原则**
  - 不授予不必要的权限
  - 使用 Scoped Packages
  - 审查第三方库源代码

### 2.3 敏感数据处理

- [ ] **不将密钥硬编码**
  ```typescript
  // ❌ 坏
  const API_KEY = 'sk-1234567890';
  
  // ✅ 好
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
      throw new Error('API_KEY not configured');
  }
  ```

- [ ] **安全存储 Token**
  ```typescript
  // 浏览器: 使用 httpOnly cookies
  // 避免 localStorage 存储敏感信息
  
  // Node.js: 使用 Key Management Service
  import { KMS } from '@aws-sdk/client-kms';
  ```

---

## 3. 性能检查清单

### 3.1 加载性能

- [ ] **代码分割**
  ```typescript
  // ✅ 路由级分割
  const Dashboard = lazy(() => import('./Dashboard'));
  
  // ✅ 组件级分割
  const HeavyChart = lazy(() => import('./HeavyChart'));
  ```

- [ ] **资源优化**
  - [ ] 启用 Tree Shaking
  - [ ] 压缩 JS/CSS
  - [ ] 使用 WebP/AVIF 图片格式
  - [ ] 启用 Gzip/Brotli 压缩

- [ ] **缓存策略**
  ```nginx
  # Nginx 缓存配置
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
  }
  ```

### 3.2 运行时性能

- [ ] **避免内存泄漏**
  ```typescript
  // ✅ 清理事件监听器
  useEffect(() => {
      const handler = () => { };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
  }, []);
  
  // ✅ 使用 WeakRef 避免强引用
  const cache = new WeakMap();
  ```

- [ ] **优化重渲染**
  ```typescript
  // ✅ 使用 memo
  const MemoizedComponent = memo(Component, (prev, next) => {
      return prev.id === next.id;
  });
  
  // ✅ 使用 useMemo/useCallback
  const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);
  ```

- [ ] **长任务优化**
  ```typescript
  // ✅ 使用 requestIdleCallback
  requestIdleCallback(() => {
      performNonCriticalWork();
  });
  
  // ✅ 任务分片
  async function processLargeArray(items: any[]) {
      for (let i = 0; i < items.length; i += 100) {
          const chunk = items.slice(i, i + 100);
          await processChunk(chunk);
          await new Promise(resolve => setTimeout(resolve, 0));
      }
  }
  ```

### 3.3 网络性能

- [ ] **请求优化**
  - [ ] 启用 HTTP/2
  - [ ] 使用 CDN
  - [ ] 实现请求去重
  - [ ] 使用 GraphQL 减少过度获取

- [ ] **连接优化**
  ```typescript
  // ✅ 使用 keep-alive
  // ✅ 使用 HTTP/2 多路复用
  // ✅ 使用 Service Worker 缓存
  ```

---

## 4. 可测试性检查清单

### 4.1 单元测试

- [ ] **测试覆盖率**
  ```json
  {
    "jest": {
      "coverageThreshold": {
        "global": {
          "branches": 80,
          "functions": 80,
          "lines": 80,
          "statements": 80
        }
      }
    }
  }
  ```

- [ ] **可测试的代码结构**
  ```typescript
  // ✅ 纯函数易于测试
  function calculateTotal(price: number, quantity: number): number {
      return price * quantity;
  }
  
  test('calculateTotal', () => {
      expect(calculateTotal(10, 2)).toBe(20);
  });
  ```

- [ ] **Mock 外部依赖**
  ```typescript
  // ✅ 使用依赖注入便于 mock
  jest.mock('./api', () => ({
      fetchUser: jest.fn().mockResolvedValue({ name: 'Test' })
  }));
  ```

### 4.2 集成测试

- [ ] **API 测试**
  ```typescript
  describe('User API', () => {
      it('should create user', async () => {
          const response = await request(app)
              .post('/api/users')
              .send({ name: 'John', email: 'john@example.com' })
              .expect(201);
          
          expect(response.body).toHaveProperty('id');
      });
  });
  ```

- [ ] **数据库测试**
  - [ ] 使用测试数据库
  - [ ] 每个测试后清理数据
  - [ ] 使用事务回滚

### 4.3 E2E 测试

- [ ] **关键用户流程**
  - [ ] 登录/注册流程
  - [ ] 支付流程
  - [ ] 核心业务流程

- [ ] **使用 Playwright/Cypress**
  ```typescript
  test('user can complete purchase', async ({ page }) => {
      await page.goto('/products');
      await page.click('[data-testid="add-to-cart"]');
      await page.click('[data-testid="checkout"]');
      await page.fill('[name="email"]', 'user@example.com');
      await page.click('[data-testid="submit-order"]');
      await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });
  ```

---

## 5. 可维护性检查清单

### 5.1 文档

- [ ] **代码注释**
  ```typescript
  /**
   * 计算折扣后的价格
   * @param price - 原始价格
   * @param discountRate - 折扣率 (0-1)
   * @returns 折扣后价格
   * @throws 当 discountRate 不在 [0,1] 范围内时抛出
   */
  function calculateDiscountedPrice(price: number, discountRate: number): number {
      if (discountRate < 0 || discountRate > 1) {
          throw new Error('Invalid discount rate');
      }
      return price * (1 - discountRate);
  }
  ```

- [ ] **README 文档**
  - [ ] 项目简介
  - [ ] 安装说明
  - [ ] 使用示例
  - [ ] API 文档
  - [ ] 贡献指南

### 5.2 版本控制

- [ ] **Commit 规范**
  ```
  feat: 添加用户认证功能
  fix: 修复登录状态丢失问题
  docs: 更新 API 文档
  refactor: 重构订单服务
  test: 添加支付流程测试
  chore: 更新依赖版本
  ```

- [ ] **分支策略**
  - [ ] main: 生产分支
  - [ ] develop: 开发分支
  - [ ] feature/*: 功能分支
  - [ ] hotfix/*: 热修复分支

### 5.3 监控和日志

- [ ] **结构化日志**
  ```typescript
  // ✅ 使用结构化日志
  logger.info('User created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
  });
  ```

- [ ] **错误追踪**
  ```typescript
  // ✅ 集成 Sentry
  Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1
  });
  ```

---

## 6. 部署检查清单

### 6.1 CI/CD 流水线

- [ ] **自动化检查**
  ```yaml
  # .github/workflows/ci.yml
  jobs:
    check:
      steps:
        - run: npm ci
        - run: npm run lint
        - run: npm run type-check
        - run: npm run test:unit -- --coverage
        - run: npm run build
  ```

- [ ] **部署策略**
  - [ ] 蓝绿部署
  - [ ] 金丝雀发布
  - [ ] 回滚计划

### 6.2 环境配置

- [ ] **环境变量管理**
  ```bash
  # .env.example (提交到仓库)
  DATABASE_URL=
  API_KEY=
  REDIS_URL=
  
  # .env (不提交，本地使用)
  DATABASE_URL=postgresql://localhost:5432/mydb
  API_KEY=dev-key
  ```

- [ ] **健康检查**
  ```typescript
  app.get('/health', (req, res) => {
      const checks = {
          database: checkDatabase(),
          redis: checkRedis(),
          disk: checkDiskSpace()
      };
      
      const isHealthy = Object.values(checks).every(c => c.status === 'ok');
      res.status(isHealthy ? 200 : 503).json(checks);
  });
  ```

---

## 7. 可访问性检查清单

- [ ] **键盘导航**
  - [ ] 所有交互元素可通过键盘访问
  - [ ] Tab 顺序逻辑合理
  - [ ] 支持快捷键

- [ ] **屏幕阅读器**
  ```html
  <!-- ✅ 使用语义化标签 -->
  <button aria-label="关闭对话框">×</button>
  
  <!-- ✅ 提供状态信息 -->
  <div role="alert" aria-live="polite">
      表单提交成功
  </div>
  ```

- [ ] **视觉可访问性**
  - [ ] 对比度符合 WCAG 标准
  - [ ] 支持缩放
  - [ ] 不依赖颜色传达信息

---

## 8. 检查清单使用指南

### 新项目启动
1. 复制本检查清单
2. 根据项目特点调整优先级
3. 在代码审查中使用
4. 定期回顾和更新

### 代码审查流程
1. 作者自检查清单
2. 审查者对照检查
3. 讨论并记录例外情况
4. 跟踪改进项

### 自动化检查
```bash
# 运行所有检查
npm run check:all

# 分项检查
npm run check:types
npm run check:lint
npm run check:test
npm run check:security
```

---

*本检查清单应作为代码审查和项目交付的标准流程的一部分，确保代码质量和工程实践的规范性。*
