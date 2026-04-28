/**
 * @file Tool Registry — 工具注册与发现中心
 * @category AI Agent → Tool System
 * @difficulty medium
 * @tags tool-registry, schema-validation, permission-management, sandbox, caching, discovery
 *
 * 演示：工具注册（JSON Schema 校验）、权限分级管理、沙箱执行（超时/异常隔离）、
 * 结果缓存（TTL），以及基于关键词的工具发现与搜索。
 */

// ==================== 核心类型定义 ====================

export type JsonSchemaType = 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object';

export interface JsonSchemaProperty {
  type: JsonSchemaType;
  description?: string;
  enum?: unknown[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface ToolSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export type PermissionLevel = 'public' | 'user' | 'admin' | 'system';

export interface ToolPermission {
  toolName: string;
  level: PermissionLevel;
  allowedRoles?: string[];
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  cached?: boolean;
  executionTimeMs: number;
}

export interface RegisteredTool {
  name: string;
  description: string;
  schema: ToolSchema;
  handler: (args: Record<string, unknown>) => unknown | Promise<unknown>;
  permission: PermissionLevel;
  timeoutMs: number;
  cacheable: boolean;
  tags: string[];
}

export interface CacheEntry {
  key: string;
  result: unknown;
  expiresAt: number;
}

// ==================== Schema 校验器 ====================

export class SchemaValidator {
  validate(schema: ToolSchema, data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push('根数据必须是对象');
      return { valid: false, errors };
    }

    const obj = data as Record<string, unknown>;

    // 校验必填字段
    for (const key of schema.required ?? []) {
      if (!(key in obj)) {
        errors.push(`缺少必填字段: ${key}`);
      }
    }

    // 校验字段类型
    for (const [key, prop] of Object.entries(schema.properties)) {
      const value = obj[key];
      if (value === undefined) continue;

      const typeError = this.checkType(key, prop.type, value);
      if (typeError) errors.push(typeError);

      if (prop.enum && !prop.enum.includes(value)) {
        errors.push(`字段 ${key} 的值必须在 [${prop.enum.join(', ')}] 中`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private checkType(key: string, expected: JsonSchemaType, value: unknown): string | null {
    const actual = Array.isArray(value) ? 'array' : typeof value;
    const mapping: Record<string, JsonSchemaType[]> = {
      string: ['string'],
      number: ['number'],
      integer: ['number'],
      boolean: ['boolean'],
      object: ['object'],
      array: ['array'],
    };

    const allowed = mapping[expected] ?? [expected];
    if (!allowed.includes(actual as JsonSchemaType)) {
      return `字段 ${key} 类型错误，期望 ${expected}，实际 ${actual}`;
    }

    if (expected === 'integer' && typeof value === 'number' && !Number.isInteger(value)) {
      return `字段 ${key} 必须是整数`;
    }

    return null;
  }
}

// ==================== 权限管理器 ====================

export class PermissionManager {
  private permissions: Map<string, ToolPermission> = new Map();
  private roleHierarchy: Map<PermissionLevel, number> = new Map([
    ['public', 0],
    ['user', 1],
    ['admin', 2],
    ['system', 3],
  ]);

  register(toolName: string, level: PermissionLevel, allowedRoles?: string[]): void {
    this.permissions.set(toolName, { toolName, level, allowedRoles });
  }

  canExecute(toolName: string, userLevel: PermissionLevel, userRole?: string): boolean {
    const perm = this.permissions.get(toolName);
    if (!perm) return false;

    const requiredRank = this.roleHierarchy.get(perm.level) ?? 0;
    const userRank = this.roleHierarchy.get(userLevel) ?? 0;

    if (userRank < requiredRank) return false;
    if (perm.allowedRoles && userRole && !perm.allowedRoles.includes(userRole) && userRank === requiredRank) return false;

    return true;
  }

  getPermission(toolName: string): ToolPermission | undefined {
    return this.permissions.get(toolName);
  }
}

// ==================== 结果缓存 ====================

export class ToolCache {
  private store: Map<string, CacheEntry> = new Map();

  constructor(private defaultTtlMs: number = 60_000) {}

  generateKey(toolName: string, args: Record<string, unknown>): string {
    const sortedArgs = Object.entries(args)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join('&');
    return `${toolName}::${sortedArgs}`;
  }

  get(key: string): unknown | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.result;
  }

  set(key: string, result: unknown, ttlMs?: number): void {
    this.store.set(key, {
      key,
      result,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(toolName?: string): void {
    if (!toolName) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(`${toolName}::`)) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    return this.store.size;
  }
}

// ==================== 执行沙箱 ====================

export class ExecutionSandbox {
  async execute(
    tool: RegisteredTool,
    args: Record<string, unknown>,
    permissionManager: PermissionManager,
    userLevel: PermissionLevel = 'public',
    userRole?: string
  ): Promise<ToolResult> {
    const start = performance.now();

    // 权限校验
    if (!permissionManager.canExecute(tool.name, userLevel, userRole)) {
      return {
        success: false,
        error: `权限不足: 工具 "${tool.name}" 需要 ${tool.permission} 权限`,
        executionTimeMs: performance.now() - start,
      };
    }

    // 超时控制
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          success: false,
          error: `工具 "${tool.name}" 执行超时 (${tool.timeoutMs}ms)`,
          executionTimeMs: performance.now() - start,
        });
      }, tool.timeoutMs);

      Promise.resolve()
        .then(() => tool.handler(args))
        .then((data) => {
          clearTimeout(timer);
          resolve({
            success: true,
            data,
            executionTimeMs: performance.now() - start,
          });
        })
        .catch((err: Error) => {
          clearTimeout(timer);
          resolve({
            success: false,
            error: `工具 "${tool.name}" 执行异常: ${err.message}`,
            executionTimeMs: performance.now() - start,
          });
        });
    });
  }
}

// ==================== 工具注册中心 ====================

export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();
  private validator = new SchemaValidator();
  private permissions = new PermissionManager();
  private cache = new ToolCache();
  private sandbox = new ExecutionSandbox();

  register(tool: RegisteredTool): void {
    this.tools.set(tool.name, tool);
    this.permissions.register(tool.name, tool.permission);
  }

  unregister(name: string): boolean {
    this.cache.invalidate(name);
    return this.tools.delete(name);
  }

  get(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  list(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  search(query: string): RegisteredTool[] {
    const lower = query.toLowerCase();
    return this.list().filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }

  discoverByTag(tag: string): RegisteredTool[] {
    return this.list().filter((t) => t.tags.includes(tag));
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
    options: {
      userLevel?: PermissionLevel;
      userRole?: string;
      skipCache?: boolean;
    } = {}
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `工具未找到: ${name}`,
        executionTimeMs: 0,
      };
    }

    // Schema 校验
    const validation = this.validator.validate(tool.schema, args);
    if (!validation.valid) {
      return {
        success: false,
        error: `参数校验失败: ${validation.errors.join('; ')}`,
        executionTimeMs: 0,
      };
    }

    // 缓存命中
    const cacheKey = this.cache.generateKey(name, args);
    if (tool.cacheable && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        return {
          success: true,
          data: cached,
          cached: true,
          executionTimeMs: 0,
        };
      }
    }

    // 沙箱执行
    const result = await this.sandbox.execute(
      tool,
      args,
      this.permissions,
      options.userLevel ?? 'public',
      options.userRole
    );

    // 写入缓存
    if (tool.cacheable && result.success) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  invalidateCache(toolName?: string): void {
    this.cache.invalidate(toolName);
  }

  getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }
}

// ==================== 预定义工具（演示用）====================

export function createDemoRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  registry.register({
    name: 'get_weather',
    description: '获取指定城市的当前天气',
    schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市名称' },
        unit: { type: 'string', enum: ['celsius', 'fahrenheit'], description: '温度单位' },
      },
      required: ['city'],
    },
    handler: (args) => {
      const city = args.city as string;
      const unit = (args.unit as string) ?? 'celsius';
      const temp = unit === 'celsius' ? 22 : 72;
      return `${city} 当前温度: ${temp}°${unit === 'celsius' ? 'C' : 'F'}，晴朗`;
    },
    permission: 'public',
    timeoutMs: 3000,
    cacheable: true,
    tags: ['weather', 'public-api'],
  });

  registry.register({
    name: 'calculate',
    description: '安全计算数学表达式',
    schema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: '数学表达式' },
      },
      required: ['expression'],
    },
    handler: (args) => {
      const expr = (args.expression as string).replace(/[^0-9+\-*/().\s]/g, '');
      // eslint-disable-next-line no-new-func
      return new Function(`return (${expr})`)() as number;
    },
    permission: 'public',
    timeoutMs: 2000,
    cacheable: true,
    tags: ['math', 'utility'],
  });

  registry.register({
    name: 'send_email',
    description: '发送邮件（需要用户权限）',
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: '收件人邮箱' },
        subject: { type: 'string', description: '主题' },
        body: { type: 'string', description: '正文' },
      },
      required: ['to', 'subject', 'body'],
    },
    handler: () => '邮件已发送',
    permission: 'user',
    timeoutMs: 5000,
    cacheable: false,
    tags: ['email', 'communication'],
  });

  registry.register({
    name: 'system_restart',
    description: '重启系统服务（仅管理员）',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: '服务名称' },
        force: { type: 'boolean', description: '是否强制重启' },
      },
      required: ['service'],
    },
    handler: () => '服务已重启',
    permission: 'admin',
    timeoutMs: 10000,
    cacheable: false,
    tags: ['system', 'admin'],
  });

  registry.register({
    name: 'slow_tool',
    description: '模拟耗时操作',
    schema: {
      type: 'object',
      properties: {
        duration: { type: 'integer', description: '延迟毫秒数' },
      },
      required: ['duration'],
    },
    handler: async (args) => {
      const duration = args.duration as number;
      await new Promise((resolve) => setTimeout(resolve, duration));
      return `耗时操作完成，延迟 ${duration}ms`;
    },
    permission: 'public',
    timeoutMs: 500,
    cacheable: false,
    tags: ['test', 'sandbox'],
  });

  return registry;
}

// ==================== 演示入口 ====================

export async function demo(): Promise<void> {
  console.log('=== Tool Registry 演示 ===\n');

  const registry = createDemoRegistry();

  // 1. 工具发现
  console.log('--- 工具列表 ---');
  registry.list().forEach((t) => {
    console.log(`  ${t.name}: ${t.description} [${t.permission}]`);
  });

  // 2. 关键词搜索
  console.log('\n--- 搜索 "天气" ---');
  const weatherTools = registry.search('天气');
  weatherTools.forEach((t) => console.log(`  - ${t.name}`));

  console.log('\n--- 按标签 "utility" 发现 ---');
  const utilityTools = registry.discoverByTag('utility');
  utilityTools.forEach((t) => console.log(`  - ${t.name}`));

  // 3. 正常执行 + 缓存
  console.log('\n--- 执行天气查询（首次）---');
  const r1 = await registry.execute('get_weather', { city: '北京', unit: 'celsius' });
  console.log(`  success=${r1.success}, cached=${r1.cached}, data=${r1.data}`);

  console.log('\n--- 执行天气查询（缓存命中）---');
  const r2 = await registry.execute('get_weather', { city: '北京', unit: 'celsius' });
  console.log(`  success=${r2.success}, cached=${r2.cached}, data=${r2.data}`);

  // 4. Schema 校验失败
  console.log('\n--- 参数校验失败演示 ---');
  const r3 = await registry.execute('get_weather', { unit: 'celsius' });
  console.log(`  success=${r3.success}, error=${r3.error}`);

  // 5. 权限校验
  console.log('\n--- 权限校验演示 ---');
  const r4 = await registry.execute('send_email', { to: 'a@b.com', subject: 'Hi', body: 'Hello' }, { userLevel: 'public' });
  console.log(`  public 调用 send_email: success=${r4.success}, error=${r4.error}`);

  const r5 = await registry.execute('send_email', { to: 'a@b.com', subject: 'Hi', body: 'Hello' }, { userLevel: 'user' });
  console.log(`  user 调用 send_email: success=${r5.success}, data=${r5.data}`);

  // 6. 超时沙箱
  console.log('\n--- 沙箱超时演示 ---');
  const r6 = await registry.execute('slow_tool', { duration: 2000 });
  console.log(`  success=${r6.success}, error=${r6.error}`);

  // 7. 缓存统计
  console.log('\n--- 缓存统计 ---');
  console.log(`  缓存条目数: ${registry.getCacheStats().size}`);

  console.log('\n=== 演示完成 ===');
}

if (require.main === module) {
  demo().catch(console.error);
}
