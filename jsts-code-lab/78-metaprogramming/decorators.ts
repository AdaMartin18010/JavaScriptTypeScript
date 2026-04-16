/**
 * @file 装饰器实现
 * @category Metaprogramming → Decorators
 * @difficulty hard
 * @tags metaprogramming, decorators, typescript, metadata
 *
 * @description
 * TypeScript 装饰器模式实现，包括类装饰器、方法装饰器、属性装饰器和参数装饰器。
 *
 * 装饰器类型：
 * - Class Decorator: 用于类声明，可以修改或替换类定义
 * - Method Decorator: 用于方法声明，可以修改方法定义
 * - Property Decorator: 用于属性声明
 * - Parameter Decorator: 用于参数声明
 * - Accessor Decorator: 用于 getter/setter
 *
 * 装饰器组合：
 * - 可以组合多个装饰器
 * - 执行顺序为从上到下，从右到左
 */

import 'reflect-metadata';

// ==================== 元数据键 ====================

export const METADATA_KEYS = {
  DESIGN_TYPE: 'design:type',
  DESIGN_PARAM_TYPES: 'design:paramtypes',
  DESIGN_RETURN_TYPE: 'design:returntype',
  VALIDATION_RULES: 'custom:validation_rules',
  ROUTE_PATH: 'custom:route_path',
  INJECTABLE: 'custom:injectable',
  INJECT: 'custom:inject',
  LOGGING: 'custom:logging',
  CACHE_CONFIG: 'custom:cache_config',
  AUTHORIZE: 'custom:authorize'
} as const;

// ==================== 类装饰器 ====================

/**
 * 单例装饰器
 */
export function Singleton<T extends new (...args: any[]) => any>(target: T): T {
  let instance: InstanceType<T> | null = null;
  const SingletonClass = new Proxy(target, {
    construct(ctor: T, args: any[]): any {
      if (!instance) {
        instance = Reflect.construct(ctor, args) as InstanceType<T>;
      }
      return instance;
    }
  });
  return SingletonClass as T;
}

/**
 * 密封装饰器 - 防止类被扩展和修改
 */
export function Sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

/**
 * 冻结装饰器 - 使类不可变
 */
export function Frozen(constructor: Function): void {
  Object.freeze(constructor);
  Object.freeze(constructor.prototype);
}

/**
 * 抽象类装饰器 - 模拟抽象类
 */
export function Abstract<T extends new (...args: any[]) => any>(target: T): T {
  const AbstractClass = class extends target {
    constructor(...args: any[]) {
      super(...args);
      if (new.target === AbstractClass) {
        throw new Error('Cannot instantiate abstract class directly');
      }
    }
  };
  return AbstractClass as T;
}

/**
 * 依赖注入标记装饰器
 */
export function Injectable(token?: string | symbol): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, token || target, target);
  };
}

// ==================== 方法装饰器 ====================

export interface MethodDecoratorOptions {
  logArgs?: boolean;
  logResult?: boolean;
  logError?: boolean;
}

/**
 * 日志装饰器
 */
export function Log(options: MethodDecoratorOptions = {}): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;
    const className = target.constructor.name;

    descriptor.value = function (this: any, ...args: any[]) {
      const startTime = performance.now();
      
      if (options.logArgs !== false) {
        console.log(`[LOG] ${className}.${String(propertyKey)} called with:`, args);
      }

      try {
        const result = (originalMethod as (...args: any[]) => any).apply(this as any, args);
        
        // 处理异步方法
        if (result instanceof Promise) {
          return result
            .then((value) => {
              const duration = performance.now() - startTime;
              if (options.logResult !== false) {
                console.log(`[LOG] ${className}.${String(propertyKey)} resolved in ${duration.toFixed(2)}ms:`, value);
              }
              return value;
            })
            .catch((error) => {
              if (options.logError !== false) {
                console.error(`[LOG] ${className}.${String(propertyKey)} rejected:`, error);
              }
              throw error;
            });
        }

        const duration = performance.now() - startTime;
        if (options.logResult !== false) {
          console.log(`[LOG] ${className}.${String(propertyKey)} completed in ${duration.toFixed(2)}ms:`, result);
        }
        return result;
      } catch (error) {
        if (options.logError !== false) {
          console.error(`[LOG] ${className}.${String(propertyKey)} threw:`, error);
        }
        throw error;
      }
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 性能测量装饰器
 */
export function Measure(label?: string): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;
    const methodName = label || `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = function (this: any, ...args: any[]) {
      const startMark = `${methodName}_start`;
      const endMark = `${methodName}_end`;
      const measureName = `${methodName}_measure`;

      performance.mark(startMark);

      const complete = () => {
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
        
        const measure = performance.getEntriesByName(measureName)[0];
        console.log(`[MEASURE] ${methodName}: ${measure.duration.toFixed(3)}ms`);
        
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(measureName);
      };

      try {
        const result = (originalMethod as (...args: any[]) => any).apply(this as any, args);

        if (result instanceof Promise) {
          return result.finally(complete);
        }

        complete();
        return result;
      } catch (error) {
        complete();
        throw error;
      }
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 记忆化装饰器
 */
export function Memoize(resolver?: (...args: any[]) => string): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;
    const cache = new Map<string, any>();

    descriptor.value = function (this: any, ...args: any[]) {
      const key = resolver ? resolver(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        console.log(`[MEMOIZE] Cache hit for ${String(propertyKey)}`);
        return cache.get(key);
      }

      const result = (originalMethod as (...args: any[]) => any).apply(this as any, args);

      if (result instanceof Promise) {
        return result.then((value) => {
          cache.set(key, Promise.resolve(value));
          return value;
        });
      }

      cache.set(key, result);
      return result;
    } as typeof originalMethod;

    // 附加清除缓存的方法
    (descriptor.value as any).clearCache = () => cache.clear();

    return descriptor;
  };
}

/**
 * 防抖装饰器
 */
export function Debounce(waitMs: number): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    descriptor.value = function (this: any, ...args: any[]) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        (originalMethod as (...args: any[]) => any).apply(this as any, args);
        timeoutId = null;
      }, waitMs);
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 节流装饰器
 */
export function Throttle(waitMs: number): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;
    let lastExecution = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    descriptor.value = function (this: any, ...args: any[]) {
      const now = Date.now();
      const remaining = waitMs - (now - lastExecution);

      if (remaining <= 0) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        lastExecution = now;
        (originalMethod as (...args: any[]) => any).apply(this as any, args);
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastExecution = Date.now();
          timeoutId = null;
          (originalMethod as (...args: any[]) => any).apply(this as any, args);
        }, remaining);
      }
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 重试装饰器
 */
export function Retry(maxAttempts: number, delayMs: number = 0): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: any[]) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await (originalMethod as (...args: any[]) => any).apply(this as any, args);
        } catch (error) {
          if (attempt === maxAttempts) {
            throw error;
          }
          console.log(`[RETRY] ${String(propertyKey)} attempt ${attempt} failed, retrying...`);
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 权限验证装饰器
 */
export function Authorize(...roles: string[]): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: any, ...args: any[]) {
      // 假设第一个参数是用户上下文
      const user = args[0];
      
      if (!user || !user.role) {
        throw new Error('Unauthorized: User context required');
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new Error(`Forbidden: Required roles [${roles.join(', ')}]`);
      }

      return (originalMethod as (...args: any[]) => any).apply(this as any, args);
    } as typeof originalMethod;

    return descriptor;
  };
}

/**
 * 参数验证装饰器
 */
export function Validate(schema: Record<string, (value: any) => boolean | string>): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: any, ...args: any[]) {
      const params = args[0];

      for (const [key, validator] of Object.entries(schema)) {
        const value = params[key];
        const result = validator(value);

        if (result !== true) {
          const message = typeof result === 'string' ? result : `Validation failed for ${key}`;
          throw new Error(message);
        }
      }

      return (originalMethod as (...args: any[]) => any).apply(this as any, args);
    } as typeof originalMethod;

    return descriptor;
  };
}

// ==================== 属性装饰器 ====================

/**
 * 属性类型装饰器
 */
export function Type(type: any): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(METADATA_KEYS.DESIGN_TYPE, type, target, propertyKey);
  };
}

/**
 * 必填属性装饰器
 */
export function Required(message?: string): PropertyDecorator {
  return (target, propertyKey) => {
    const rules = Reflect.getMetadata(METADATA_KEYS.VALIDATION_RULES, target) || [];
    rules.push({
      property: propertyKey,
      type: 'required',
      message: message || `${String(propertyKey)} is required`
    });
    Reflect.defineMetadata(METADATA_KEYS.VALIDATION_RULES, rules, target);
  };
}

/**
 * 范围验证装饰器
 */
export function Range(min: number, max: number, message?: string): PropertyDecorator {
  return (target, propertyKey) => {
    const rules = Reflect.getMetadata(METADATA_KEYS.VALIDATION_RULES, target) || [];
    rules.push({
      property: propertyKey,
      type: 'range',
      min,
      max,
      message: message || `${String(propertyKey)} must be between ${min} and ${max}`
    });
    Reflect.defineMetadata(METADATA_KEYS.VALIDATION_RULES, rules, target);
  };
}

/**
 * 只读属性装饰器
 */
export function Readonly(target: any, propertyKey: string | symbol): void {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  descriptor.writable = false;
  Object.defineProperty(target, propertyKey, descriptor);
}

// ==================== 参数装饰器 ====================

/**
 * 注入装饰器 - 用于依赖注入
 */
export function Inject(token: string | symbol): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingInjections = Reflect.getMetadata(METADATA_KEYS.INJECT, target, propertyKey || '') || [];
    existingInjections.push({ index: parameterIndex, token });
    Reflect.defineMetadata(METADATA_KEYS.INJECT, existingInjections, target, propertyKey || '');
  };
}

/**
 * 参数验证装饰器
 */
export function Param(name: string, validator?: (value: any) => boolean): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    // 存储参数元数据
    console.log(`Parameter ${name} at index ${parameterIndex} of ${String(propertyKey)}`);
  };
}

// ==================== 装饰器组合 ====================

/**
 * API 端点装饰器组合
 */
export function ApiEndpoint(path: string, options: { auth?: boolean; rateLimit?: number } = {}): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    // 存储路由信息
    Reflect.defineMetadata(METADATA_KEYS.ROUTE_PATH, path, target, propertyKey);

    // 应用日志装饰器
    const logDecorator = Log({ logArgs: true, logResult: true });
    logDecorator(target, propertyKey, descriptor);

    // 应用性能测量
    const measureDecorator = Measure();
    measureDecorator(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * 事务装饰器组合
 */
export function Transactional(): MethodDecorator {
  return (target, propertyKey, descriptor: any) => {
    if (!descriptor || typeof descriptor.value !== 'function') return descriptor;
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: any[]) {
      console.log(`[TRANSACTION] Starting transaction for ${String(propertyKey)}`);
      
      try {
        const result = await (originalMethod as (...args: any[]) => any).apply(this as any, args);
        console.log(`[TRANSACTION] Committing transaction for ${String(propertyKey)}`);
        return result;
      } catch (error) {
        console.log(`[TRANSACTION] Rolling back transaction for ${String(propertyKey)}`);
        throw error;
      }
    } as typeof originalMethod;

    return descriptor;
  };
}

// ==================== 验证器 ====================

export class Validator {
  static validate(instance: any): string[] {
    const errors: string[] = [];
    const prototype = Object.getPrototypeOf(instance);
    const rules = Reflect.getMetadata(METADATA_KEYS.VALIDATION_RULES, prototype) || [];

    for (const rule of rules) {
      const value = instance[rule.property];

      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors.push(rule.message);
          }
          break;

        case 'range':
          if (typeof value === 'number' && (value < rule.min || value > rule.max)) {
            errors.push(rule.message);
          }
          break;
      }
    }

    return errors;
  }
}

// ==================== 演示 ====================

@Singleton
class UserService {
  private users: Map<string, { id: string; name: string; email: string }> = new Map();

  getUser(id: string) {
    console.log(`Fetching user ${id} from database...`);
    return this.users.get(id);
  }

  deleteUser(user: { role: string }, id: string) {
    console.log(`Deleting user ${id}`);
    this.users.delete(id);
    return { success: true };
  }

  createUser(_context: any, data: { name: string; email: string }) {
    const id = `user-${Date.now()}`;
    this.users.set(id, { id, name: data.name, email: data.email });
    return { id, ...data };
  }

  searchUsers(query: string) {
    console.log(`Searching for: ${query}`);
    return Array.from(this.users.values()).filter(u => 
      u.name.includes(query) || u.email.includes(query)
    );
  }

  async fetchExternalData(url: string) {
    console.log(`Fetching from ${url}...`);
    // 模拟随机失败
    if (Math.random() < 0.7) {
      throw new Error('Network error');
    }
    return { data: 'Success!' };
  }

  async transferMoney(from: string, to: string, amount: number) {
    console.log(`Transferring ${amount} from ${from} to ${to}`);
    // 模拟操作
    if (amount < 0) throw new Error('Invalid amount');
    return { success: true };
  }
}

class Product {
  name: string = '';
  price: number = 0;
  category: string = '';
}

export function demo(): void {
  console.log('=== 装饰器 ===\n');

  const service = new UserService();

  // 日志和性能测量
  console.log('--- 日志和性能测量 ---');
  service.createUser({}, { name: 'John Doe', email: 'john@example.com' });

  // 记忆化
  console.log('\n--- 记忆化 ---');
  service.getUser('nonexistent');
  service.getUser('nonexistent'); // 应该从缓存返回

  // 权限验证
  console.log('\n--- 权限验证 ---');
  try {
    service.deleteUser({ role: 'user' }, '123');
  } catch (e) {
    console.log('Permission denied:', (e as Error).message);
  }

  const admin = { role: 'admin' };
  service.deleteUser(admin, '123');

  // 参数验证
  console.log('\n--- 参数验证 ---');
  try {
    service.createUser({}, { name: '', email: 'invalid' });
  } catch (e) {
    console.log('Validation error:', (e as Error).message);
  }

  // 重试机制
  console.log('\n--- 重试机制 ---');
  service.fetchExternalData('https://api.example.com/data')
    .then(result => console.log('Fetch result:', result))
    .catch(err => console.log('Fetch failed after retries:', err.message));

  // 属性验证
  console.log('\n--- 属性验证 ---');
  const product = new Product();
  product.name = '';
  product.price = -10;
  
  const errors = Validator.validate(product);
  console.log('Validation errors:', errors);
}
