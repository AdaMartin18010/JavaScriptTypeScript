/**
 * @file component-composition-models.ts
 * @category UI Components → Composition
 * @model Component Composition Models
 */

export interface CompoundComponentApi {
  registerPart(name: string, element: unknown): void
  getPart(name: string): unknown
}

export class CompoundComponentRegistry implements CompoundComponentApi {
  private parts = new Map<string, unknown>()

  registerPart(name: string, element: unknown): void {
    this.parts.set(name, element)
  }

  getPart(name: string): unknown {
    return this.parts.get(name)
  }
}

export function withHigherOrderComponent<P extends object>(
  Wrapped: (props: P) => unknown,
  extraProps: Partial<P>
): (props: P) => unknown {
  return (props: P) => Wrapped({ ...props, ...extraProps })
}

export function composeHooks<T extends unknown[]>(
  ...hooks: (() => unknown)[]
): () => unknown[] {
  return () => hooks.map((h) => h())
}
