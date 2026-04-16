/**
 * @file dependency-injection-models.ts
 * @category Application Architecture → DI
 * @model Dependency Injection
 */

export interface ServiceToken<T> {
  symbol: symbol
}

export function createToken<T>(name: string): ServiceToken<T> {
  return { symbol: Symbol(name) }
}

export class DIContainer {
  private registry = new Map<symbol, unknown>()
  private factories = new Map<symbol, () => unknown>()

  register<T>(token: ServiceToken<T>, instance: T): void {
    this.registry.set(token.symbol, instance)
  }

  registerFactory<T>(token: ServiceToken<T>, factory: () => T): void {
    this.factories.set(token.symbol, factory)
  }

  resolve<T>(token: ServiceToken<T>): T {
    if (this.registry.has(token.symbol)) {
      return this.registry.get(token.symbol) as T
    }
    const factory = this.factories.get(token.symbol)
    if (!factory) throw new Error(`No registration for token ${token.symbol.toString()}`)
    const instance = factory()
    this.registry.set(token.symbol, instance)
    return instance as T
  }
}

export class ServiceLocator {
  private static registry = new Map<string, unknown>()

  static register<T>(name: string, instance: T): void {
    ServiceLocator.registry.set(name, instance)
  }

  static resolve<T>(name: string): T {
    const instance = ServiceLocator.registry.get(name)
    if (!instance) throw new Error(`Service ${name} not found`)
    return instance as T
  }
}
