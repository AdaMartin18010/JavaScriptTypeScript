import { describe, it, expect } from 'vitest'
import { createToken, DIContainer, ServiceLocator } from './dependency-injection-models.js'

describe('DIContainer', () => {
  it('should resolve registered instance', () => {
    const container = new DIContainer()
    const token = createToken<number>('number')
    container.register(token, 42)
    expect(container.resolve(token)).toBe(42)
  })

  it('should resolve factory lazily', () => {
    const container = new DIContainer()
    const token = createToken<string>('string')
    container.registerFactory(token, () => 'hello')
    expect(container.resolve(token)).toBe('hello')
    expect(container.resolve(token)).toBe('hello')
  })
})

describe('ServiceLocator', () => {
  it('should locate registered service', () => {
    ServiceLocator.register('config', { env: 'test' })
    expect(ServiceLocator.resolve('config')).toEqual({ env: 'test' })
  })
})
