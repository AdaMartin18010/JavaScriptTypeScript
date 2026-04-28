/**
 * @file input-handling-models.ts
 * @category Web Rendering → Input
 * @model Input Handling
 */

export type EventPhase = 'capture' | 'target' | 'bubble'

export interface EventRoute {
  target: string
  phase: EventPhase
  handlers: string[]
}

export function buildEventRoute(targetId: string, ancestors: string[]): EventRoute[] {
  const route: EventRoute[] = []
  for (let i = 0; i < ancestors.length; i++) {
    route.push({ target: ancestors[i], phase: 'capture', handlers: [] })
  }
  route.push({ target: targetId, phase: 'target', handlers: [] })
  for (let i = ancestors.length - 1; i >= 0; i--) {
    route.push({ target: ancestors[i], phase: 'bubble', handlers: [] })
  }
  return route
}

export class GestureRecognizer {
  private startX = 0
  private startY = 0

  start(x: number, y: number): void {
    this.startX = x
    this.startY = y
  }

  end(x: number, y: number): { dx: number; dy: number; isTap: boolean } {
    const dx = x - this.startX
    const dy = y - this.startY
    const distance = Math.hypot(dx, dy)
    return { dx, dy, isTap: distance < 10 }
  }
}
