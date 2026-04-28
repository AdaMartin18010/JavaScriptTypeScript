import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ToolRegistry,
  SchemaValidator,
  PermissionManager,
  ToolCache,
  ExecutionSandbox,
  createDemoRegistry,
} from './tool-registry.js';

describe('SchemaValidator', () => {
  const validator = new SchemaValidator();

  it('应通过正确的参数校验', () => {
    const schema = {
      type: 'object' as const,
      properties: {
        city: { type: 'string' as const },
        count: { type: 'integer' as const },
      },
      required: ['city'],
    };

    const result = validator.validate(schema, { city: '北京', count: 5 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('应检测缺少必填字段', () => {
    const schema = {
      type: 'object' as const,
      properties: { name: { type: 'string' as const } },
      required: ['name'],
    };

    const result = validator.validate(schema, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('缺少必填字段');
  });

  it('应检测类型错误', () => {
    const schema = {
      type: 'object' as const,
      properties: { age: { type: 'integer' as const } },
    };

    const result = validator.validate(schema, { age: 3.14 });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('整数');
  });

  it('应检测枚举值错误', () => {
    const schema = {
      type: 'object' as const,
      properties: { color: { type: 'string' as const, enum: ['red', 'blue'] } },
    };

    const result = validator.validate(schema, { color: 'green' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('必须在');
  });

  it('非对象输入应报错', () => {
    const result = validator.validate(
      { type: 'object' as const, properties: {} },
      'not an object'
    );
    expect(result.valid).toBe(false);
  });
});

describe('PermissionManager', () => {
  let pm: PermissionManager;

  beforeEach(() => {
    pm = new PermissionManager();
    pm.register('public_tool', 'public');
    pm.register('user_tool', 'user');
    pm.register('admin_tool', 'admin');
    pm.register('restricted_tool', 'user', ['editor']);
  });

  it('public 工具任何人都能调用', () => {
    expect(pm.canExecute('public_tool', 'public')).toBe(true);
    expect(pm.canExecute('public_tool', 'user')).toBe(true);
  });

  it('低权限用户不能调用高权限工具', () => {
    expect(pm.canExecute('admin_tool', 'public')).toBe(false);
    expect(pm.canExecute('admin_tool', 'user')).toBe(false);
    expect(pm.canExecute('admin_tool', 'admin')).toBe(true);
  });

  it('角色白名单应生效', () => {
    expect(pm.canExecute('restricted_tool', 'user', 'viewer')).toBe(false);
    expect(pm.canExecute('restricted_tool', 'user', 'editor')).toBe(true);
    expect(pm.canExecute('restricted_tool', 'admin', 'viewer')).toBe(true); // admin 高权限覆盖角色限制
  });
});

describe('ToolCache', () => {
  let cache: ToolCache;

  beforeEach(() => {
    cache = new ToolCache(100);
  });

  it('应能写入和读取缓存', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('不存在的 key 应返回 undefined', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('过期缓存应被清除', () => {
    cache.set('key1', 'value1', -1); // 已过期
    expect(cache.get('key1')).toBeUndefined();
  });

  it('应按工具名失效缓存', () => {
    cache.set('toolA::x=1', 'a');
    cache.set('toolB::x=1', 'b');
    cache.invalidate('toolA');
    expect(cache.get('toolA::x=1')).toBeUndefined();
    expect(cache.get('toolB::x=1')).toBe('b');
  });

  it('generateKey 应对相同参数生成相同 key', () => {
    const k1 = cache.generateKey('t', { b: 1, a: 2 });
    const k2 = cache.generateKey('t', { a: 2, b: 1 });
    expect(k1).toBe(k2);
  });
});

describe('ExecutionSandbox', () => {
  const sandbox = new ExecutionSandbox();
  const pm = new PermissionManager();
  pm.register('safe_tool', 'public');

  it('应正常执行工具', async () => {
    const tool = {
      name: 'safe_tool',
      description: 'test',
      schema: { type: 'object' as const, properties: {} },
      handler: () => 'ok',
      permission: 'public',
      timeoutMs: 1000,
      cacheable: false,
      tags: [],
    };

    const result = await sandbox.execute(tool, {}, pm, 'public');
    expect(result.success).toBe(true);
    expect(result.data).toBe('ok');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('应捕获执行异常', async () => {
    const tool = {
      name: 'safe_tool',
      description: 'test',
      schema: { type: 'object' as const, properties: {} },
      handler: () => {
        throw new Error('boom');
      },
      permission: 'public',
      timeoutMs: 1000,
      cacheable: false,
      tags: [],
    };

    const result = await sandbox.execute(tool, {}, pm, 'public');
    expect(result.success).toBe(false);
    expect(result.error).toContain('boom');
  });

  it('超时应返回错误', async () => {
    const tool = {
      name: 'safe_tool',
      description: 'test',
      schema: { type: 'object' as const, properties: {} },
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return 'late';
      },
      permission: 'public',
      timeoutMs: 50,
      cacheable: false,
      tags: [],
    };

    const result = await sandbox.execute(tool, {}, pm, 'public');
    expect(result.success).toBe(false);
    expect(result.error).toContain('超时');
  });

  it('权限不足应拒绝执行', async () => {
    pm.register('admin_only', 'admin');
    const tool = {
      name: 'admin_only',
      description: 'test',
      schema: { type: 'object' as const, properties: {} },
      handler: () => 'secret',
      permission: 'admin',
      timeoutMs: 1000,
      cacheable: false,
      tags: [],
    };

    const result = await sandbox.execute(tool, {}, pm, 'public');
    expect(result.success).toBe(false);
    expect(result.error).toContain('权限不足');
  });
});

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = createDemoRegistry();
  });

  it('应注册和列出工具', () => {
    const tools = registry.list();
    expect(tools.length).toBeGreaterThanOrEqual(4);
    expect(tools.some((t) => t.name === 'get_weather')).toBe(true);
  });

  it('应通过名称获取工具', () => {
    const tool = registry.get('calculate');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('calculate');
  });

  it('unregister 应删除工具', () => {
    expect(registry.unregister('slow_tool')).toBe(true);
    expect(registry.get('slow_tool')).toBeUndefined();
  });

  it('应支持关键词搜索', () => {
    const results = registry.search('天气');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('get_weather');
  });

  it('应支持按标签发现', () => {
    const results = registry.discoverByTag('utility');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('calculate');
  });

  it('应正常执行工具并缓存结果', async () => {
    const r1 = await registry.execute('calculate', { expression: '2+2' });
    expect(r1.success).toBe(true);
    expect(r1.data).toBe(4);
    expect(r1.cached).toBeFalsy();

    const r2 = await registry.execute('calculate', { expression: '2+2' });
    expect(r2.cached).toBe(true);
    expect(r2.data).toBe(4);
  });

  it('skipCache 应跳过缓存', async () => {
    await registry.execute('calculate', { expression: '1+1' });
    const r2 = await registry.execute('calculate', { expression: '1+1' }, { skipCache: true });
    expect(r2.cached).toBeFalsy();
  });

  it('参数校验失败应返回错误', async () => {
    const result = await registry.execute('get_weather', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('缺少必填字段');
  });

  it('未找到工具应返回错误', async () => {
    const result = await registry.execute('nonexistent', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('未找到');
  });

  it('权限不足应拒绝执行', async () => {
    const result = await registry.execute('system_restart', { service: 'nginx' }, { userLevel: 'public' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('权限不足');
  });

  it('超时应被沙箱捕获', async () => {
    const result = await registry.execute('slow_tool', { duration: 2000 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('超时');
  });

  it('invalidateCache 应清除缓存', async () => {
    await registry.execute('calculate', { expression: '10*10' });
    expect(registry.getCacheStats().size).toBeGreaterThan(0);
    registry.invalidateCache();
    expect(registry.getCacheStats().size).toBe(0);
  });
});
