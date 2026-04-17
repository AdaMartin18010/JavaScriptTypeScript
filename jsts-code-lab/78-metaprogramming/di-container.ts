/**
 * @file 依赖注入容器（简化版）
 * @category Metaprogramming → DI Container
 * @difficulty hard
 * @tags metaprogramming, dependency-injection, ioc, container, inversion-of-control
 *
 * @description
 * 基于 TypeScript 装饰器和反射元数据的轻量级依赖注入容器。
 * 支持 Singleton、Transient 和 Scoped 三种生命周期管理。
 */

/** 构造函数类型 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/** 工厂函数类型 */
export type Factory<T = unknown> = () => T;

/** 提供者类型 */
export type Provider<T = unknown> = Constructor<T> | Factory<T>;

/** 服务生命周期 */
export enum Lifetime {
  /** 单例 */
  Singleton = 'singleton',
  /** 每次解析创建新实例 */
  Transient = 'transient',
  /** 作用域内单例 */
  Scoped = 'scoped'
}

/** 注册信息 */
export interface Registration<T = unknown> {
  /** 服务令牌 */
  token: string | symbol;
  /** 提供者 */
  provider: Provider<T>;
  /** 生命周期 */
  lifetime: Lifetime;
  /** 单例缓存实例 */
  instance?: T;
}

/** 依赖注入容器 */
export class DIContainer {
  private readonly registrations = new Map<string | symbol, Registration>();
  private readonly scopeInstances = new Map<string, Map<string | symbol, unknown>>();

  /**
   * 注册单例服务
   * @param token - 服务令牌
   * @param provider - 服务提供者
   * @returns 当前实例（链式调用）
   */
  registerSingleton<T>(token: string | symbol, provider: Provider<T>): this {
    this.registrations.set(token, { token, provider, lifetime: Lifetime.Singleton });
    return this;
  }

  /**
   * 注册瞬时服务
   * @param token - 服务令牌
   * @param provider - 服务提供者
   * @returns 当前实例（链式调用）
   */
  registerTransient<T>(token: string | symbol, provider: Provider<T>): this {
    this.registrations.set(token, { token, provider, lifetime: Lifetime.Transient });
    return this;
  }

  /**
   * 注册作用域服务
   * @param token - 服务令牌
   * @param provider - 服务提供者
   * @returns 当前实例（链式调用）
   */
  registerScoped<T>(token: string | symbol, provider: Provider<T>): this {
    this.registrations.set(token, { token, provider, lifetime: Lifetime.Scoped });
    return this;
  }

  /**
   * 注册类及其依赖（自动解析构造函数参数）
   * @param token - 服务令牌
   * @param ctor - 类构造函数
   * @param lifetime - 生命周期（默认 Transient）
   * @returns 当前实例（链式调用）
   */
  registerClass<T>(token: string | symbol, ctor: Constructor<T>, lifetime: Lifetime = Lifetime.Transient): this {
    const paramTypes = this.getParamTypes(ctor);
    this.registrations.set(token, {
      token,
      provider: () => this.resolveWithDeps(ctor, paramTypes),
      lifetime
    });
    return this;
  }

  /**
   * 解析服务实例
   * @param token - 服务令牌
   * @param scopeId - 作用域标识（Scoped 服务必需）
   * @returns 服务实例
   * @throws 当未找到注册信息时抛出错误
   */
  resolve<T>(token: string | symbol, scopeId?: string): T {
    const registration = this.registrations.get(token);
    if (!registration) {
      throw new DIResolutionError(`No registration found for token: ${String(token)}`);
    }

    switch (registration.lifetime) {
      case Lifetime.Singleton:
        if (!registration.instance) {
          registration.instance = this.createInstance(registration.provider, scopeId);
        }
        return registration.instance as T;

      case Lifetime.Scoped:
        if (!scopeId) {
          throw new DIResolutionError(`Scope ID is required for scoped service: ${String(token)}`);
        }
        return this.resolveScoped(registration, scopeId) as T;

      case Lifetime.Transient:
      default:
        return this.createInstance(registration.provider, scopeId) as T;
    }
  }

  /**
   * 创建新的作用域
   * @param scopeId - 作用域标识
   * @returns 作用域对象
   */
  createScope(scopeId: string): DIScope {
    return new DIScope(this, scopeId);
  }

  /**
   * 检查服务是否已注册
   * @param token - 服务令牌
   * @returns 是否已注册
   */
  isRegistered(token: string | symbol): boolean {
    return this.registrations.has(token);
  }

  /**
   * 获取所有已注册的服务令牌
   * @returns 令牌列表
   */
  getRegisteredTokens(): Array<string | symbol> {
    return Array.from(this.registrations.keys());
  }

  /**
   * 清空所有注册和作用域缓存
   */
  clear(): void {
    this.registrations.clear();
    this.scopeInstances.clear();
  }

  private resolveScoped(registration: Registration, scopeId: string): unknown {
    let scope = this.scopeInstances.get(scopeId);
    if (!scope) {
      scope = new Map();
      this.scopeInstances.set(scopeId, scope);
    }
    if (!scope.has(registration.token)) {
      scope.set(registration.token, this.createInstance(registration.provider, scopeId));
    }
    return scope.get(registration.token);
  }

  private createInstance<T>(provider: Provider<T>, scopeId?: string): T {
    if (this.isConstructor(provider)) {
      const paramTypes = this.getParamTypes(provider);
      const args = paramTypes.map((token: string | symbol) => this.resolve(token, scopeId));
      return new provider(...args);
    }
    return (provider as Factory<T>)();
  }

  private resolveWithDeps<T>(ctor: Constructor<T>, deps: Array<string | symbol>): T {
    const args = deps.map(token => this.resolve(token));
    return new ctor(...args);
  }

  private getParamTypes(ctor: Constructor): Array<string | symbol> {
    // In a real scenario with reflect-metadata, this would use Reflect.getMetadata
    // For this simplified version, we return an empty array
    return [];
  }

  private isConstructor<T>(provider: Provider<T>): provider is Constructor<T> {
    return typeof provider === 'function' && !!provider.prototype && provider.prototype.constructor === provider;
  }
}

/** DI 作用域 */
export class DIScope {
  /**
   * @param container - 所属容器
   * @param scopeId - 作用域标识
   */
  constructor(
    private readonly container: DIContainer,
    private readonly scopeId: string
  ) {}

  /**
   * 在作用域内解析服务
   * @param token - 服务令牌
   * @returns 服务实例
   */
  resolve<T>(token: string | symbol): T {
    return this.container.resolve(token, this.scopeId);
  }

  /**
   * 释放作用域
   */
  dispose(): void {
    // Scope cleanup can be extended here
  }
}

/** 依赖解析错误 */
export class DIResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DIResolutionError';
  }
}
