/**
 * @file component-communication-patterns.ts
 * @category UI Components → Communication
 * @model Component Communication Patterns
 */

export class EventBus<T extends Record<string, unknown>> {
  private listeners: { [K in keyof T]?: Array<(payload: T[K]) => void> } = {}

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.listeners[event]?.forEach((l) => l(payload))
  }

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): () => void {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event]!.push(listener)
    return () => {
      this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener)
    }
  }
}

export function createContextProvider<T>(defaultValue: T) {
  let current = defaultValue
  const listeners = new Set<(v: T) => void>()

  return {
    Provider: {
      setValue(v: T) {
        current = v
        listeners.forEach((l) => l(v))
      },
      getValue: () => current,
    },
    Consumer: {
      subscribe: (l: (v: T) => void) => {
        listeners.add(l)
        return () => listeners.delete(l)
      },
    },
  }
}
