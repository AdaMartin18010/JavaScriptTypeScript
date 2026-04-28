/**
 * @file state-management-architectures.ts
 * @category UI Components → State Management
 * @model State Management Architecture
 */

export interface Store<T> {
  getState(): T
  setState(updater: (prev: T) => T): void
  subscribe(listener: (state: T) => void): () => void
}

export function createReduxLikeStore<T>(initialState: T): Store<T> {
  let state = initialState
  const listeners = new Set<(state: T) => void>()

  return {
    getState: () => state,
    setState: (updater) => {
      state = updater(state)
      listeners.forEach((l) => { l(state); })
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export class SignalsModel<T> {
  private value: T
  private listeners = new Set<(v: T) => void>()

  constructor(initial: T) {
    this.value = initial
  }

  get(): T {
    return this.value
  }

  set(next: T): void {
    if (Object.is(this.value, next)) return
    this.value = next
    this.listeners.forEach((l) => { l(next); })
  }

  subscribe(listener: (v: T) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
