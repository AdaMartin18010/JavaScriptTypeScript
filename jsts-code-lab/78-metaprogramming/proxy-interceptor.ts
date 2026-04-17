/**
 * @file 代理拦截器
 * @category Metaprogramming → Proxy
 * @difficulty hard
 * @tags metaprogramming, proxy, interceptor, handler, aop
 *
 * @description
 * 基于 ES Proxy 的通用拦截器工厂，支持方法调用拦截、属性访问拦截、验证代理和缓存代理。
 * 提供 AOP 风格的前置/后置/异常处理钩子。
 */

/** 代理拦截器处理器 */
export interface ProxyInterceptorHandlers<T extends object> {
  /** 属性读取前钩子 */
  beforeGet?: (target: T, prop: string | symbol) => void;
  /** 属性读取后钩子 */
  afterGet?: (target: T, prop: string | symbol, value: unknown) => void;
  /** 属性设置前钩子（返回 false 可阻止设置） */
  beforeSet?: (target: T, prop: string | symbol, value: unknown) => void | boolean;
  /** 属性设置后钩子 */
  afterSet?: (target: T, prop: string | symbol, value: unknown, success: boolean) => void;
  /** 方法调用前钩子 */
  beforeCall?: (target: T, prop: string | symbol, args: unknown[]) => void;
  /** 方法调用后钩子 */
  afterCall?: (target: T, prop: string | symbol, args: unknown[], result: unknown) => void;
  /** 方法调用异常钩子 */
  onError?: (target: T, prop: string | symbol, args: unknown[], error: Error) => void;
}

/** 代理拦截器 */
export class ProxyInterceptor {
  /**
   * 创建方法调用拦截代理
   * @param target - 目标对象
   * @param handlers - 拦截处理器
   * @returns 代理对象
   */
  static createMethodInterceptor<T extends object>(
    target: T,
    handlers: Pick<ProxyInterceptorHandlers<T>, 'beforeCall' | 'afterCall' | 'onError'>
  ): T {
    return new Proxy(target, {
      get(obj, prop) {
        const value = (obj as Record<string | symbol, unknown>)[prop];

        if (typeof value === 'function') {
          return function (this: unknown, ...args: unknown[]) {
            try {
              handlers.beforeCall?.(obj, prop, args);
              const result = value.apply(obj, args);

              if (result instanceof Promise) {
                return result
                  .then((res) => {
                    handlers.afterCall?.(obj, prop, args, res);
                    return res;
                  })
                  .catch((err: unknown) => {
                    const error = err instanceof Error ? err : new Error(String(err));
                    handlers.onError?.(obj, prop, args, error);
                    throw err;
                  });
              }

              handlers.afterCall?.(obj, prop, args, result);
              return result;
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              handlers.onError?.(obj, prop, args, err);
              throw error;
            }
          };
        }

        return value;
      }
    });
  }

  /**
   * 创建属性访问拦截代理
   * @param target - 目标对象
   * @param handlers - 拦截处理器
   * @returns 代理对象
   */
  static createPropertyInterceptor<T extends object>(
    target: T,
    handlers: Pick<ProxyInterceptorHandlers<T>, 'beforeGet' | 'afterGet' | 'beforeSet' | 'afterSet'>
  ): T {
    return new Proxy(target, {
      get(obj, prop) {
        handlers.beforeGet?.(obj, prop);
        const value = (obj as Record<string | symbol, unknown>)[prop];
        handlers.afterGet?.(obj, prop, value);
        return value;
      },
      set(obj, prop, value) {
        const shouldProceed = handlers.beforeSet?.(obj, prop, value);
        if (shouldProceed === false) {
          handlers.afterSet?.(obj, prop, value, false);
          return true;
        }

        const success = Reflect.set(obj, prop, value);
        handlers.afterSet?.(obj, prop, value, success);
        return success;
      }
    });
  }

  /**
   * 创建完整拦截代理（属性 + 方法）
   * @param target - 目标对象
   * @param handlers - 拦截处理器
   * @returns 代理对象
   */
  static createFullInterceptor<T extends object>(
    target: T,
    handlers: ProxyInterceptorHandlers<T>
  ): T {
    return new Proxy(target, {
      get(obj, prop) {
        handlers.beforeGet?.(obj, prop);
        const value = (obj as Record<string | symbol, unknown>)[prop];
        handlers.afterGet?.(obj, prop, value);

        if (typeof value === 'function') {
          return function (this: unknown, ...args: unknown[]) {
            try {
              handlers.beforeCall?.(obj, prop, args);
              const result = value.apply(obj, args);

              if (result instanceof Promise) {
                return result
                  .then((res) => {
                    handlers.afterCall?.(obj, prop, args, res);
                    return res;
                  })
                  .catch((err: unknown) => {
                    const error = err instanceof Error ? err : new Error(String(err));
                    handlers.onError?.(obj, prop, args, error);
                    throw err;
                  });
              }

              handlers.afterCall?.(obj, prop, args, result);
              return result;
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              handlers.onError?.(obj, prop, args, err);
              throw error;
            }
          };
        }

        return value;
      },
      set(obj, prop, value) {
        const shouldProceed = handlers.beforeSet?.(obj, prop, value);
        if (shouldProceed === false) return false;

        const success = Reflect.set(obj, prop, value);
        handlers.afterSet?.(obj, prop, value, success);
        return success;
      }
    });
  }

  /**
   * 创建验证代理
   * @param target - 目标对象
   * @param validators - 属性验证器映射
   * @returns 代理对象
   */
  static createValidationProxy<T extends object>(
    target: T,
    validators: Record<string | symbol, (value: unknown) => boolean | string>
  ): T {
    return new Proxy(target, {
      set(obj, prop, value) {
        const validator = validators[prop];
        if (validator) {
          const result = validator(value);
          if (result !== true) {
            throw new ProxyValidationError(
              typeof result === 'string' ? result : `Validation failed for ${String(prop)}`
            );
          }
        }
        return Reflect.set(obj, prop, value);
      }
    });
  }

  /**
   * 创建缓存代理（按方法 + 参数缓存结果）
   * @param target - 目标对象
   * @returns 代理对象（附加 _cache 属性）
   */
  static createCacheProxy<T extends object>(
    target: T
  ): T & { _cache: Map<string, unknown> } {
    const cache = new Map<string, unknown>();

    return new Proxy(target, {
      get(obj, prop) {
        if (prop === '_cache') return cache;

        const value = (obj as Record<string | symbol, unknown>)[prop];
        if (typeof value === 'function') {
          const cachedKey = prop;
          return function (this: unknown, ...args: unknown[]) {
            const cacheKey = `${String(cachedKey)}_${JSON.stringify(args)}`;
            if (cache.has(cacheKey)) {
              return cache.get(cacheKey);
            }
            const result = value.apply(obj, args);
            cache.set(cacheKey, result);
            return result;
          };
        }
        return value;
      }
    }) as T & { _cache: Map<string, unknown> };
  }
}

/** 代理验证错误 */
export class ProxyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProxyValidationError';
  }
}
