/**
 * @file mvc-derivatives.ts
 * @category Application Architecture → MVC
 * @model MVC and Derivatives
 */

export interface Model {
  data: unknown
  update(updater: (prev: unknown) => unknown): void
}

export interface View {
  render(model: Model): unknown
}

export interface Controller {
  handleInput(input: unknown): void
}

export function createMVC<T>(initial: T): { model: Model; view: View; controller: Controller } {
  let data: unknown = initial
  let viewRef: View | null = null

  const model: Model = {
    get data() {
      return data
    },
    update(updater) {
      data = updater(data)
      viewRef?.render(model)
    },
  }

  const view: View = {
    render: () => data,
  }
  viewRef = view

  const controller: Controller = {
    handleInput: (input) => {
      model.update(() => input)
    },
  }

  return { model, view, controller }
}

export class MVVMViewModel<T> {
  private state: T
  private listeners = new Set<(s: T) => void>()

  constructor(initial: T) {
    this.state = initial
  }

  getState(): T {
    return this.state
  }

  setState(next: T): void {
    this.state = next
    this.listeners.forEach((l) => { l(next); })
  }

  bind(listener: (s: T) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
