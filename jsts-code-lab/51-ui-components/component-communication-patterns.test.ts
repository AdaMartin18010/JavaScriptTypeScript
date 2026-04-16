import { describe, it, expect } from 'vitest'
import { EventBus, createContextProvider } from './component-communication-patterns'

describe('EventBus', () => {
  it('should deliver events to subscribers', () => {
    const bus = new EventBus<{ click: { x: number } }>()
    let received = 0
    bus.on('click', (p) => { received = p.x })
    bus.emit('click', { x: 42 })
    expect(received).toBe(42)
  })
})

describe('createContextProvider', () => {
  it('should propagate value changes', () => {
    const { Provider, Consumer } = createContextProvider('default')
    let value = ''
    Consumer.subscribe((v) => { value = v })
    Provider.setValue('updated')
    expect(Provider.getValue()).toBe('updated')
    expect(value).toBe('updated')
  })
})
