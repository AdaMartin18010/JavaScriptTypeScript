/**
 * @file rendering-performance-model.ts
 * @category Performance → Rendering
 * @model Rendering Performance
 */

export interface RAILMetrics {
  response: number
  animation: number
  idle: number
  load: number
}

export function checkRAIL(metrics: RAILMetrics): { pass: boolean; violations: string[] } {
  const violations: string[] = []
  if (metrics.response > 100) violations.push('response > 100ms')
  if (metrics.animation > 16) violations.push('animation frame > 16ms')
  if (metrics.idle < 50) violations.push('idle chunk < 50ms')
  if (metrics.load > 5000) violations.push('load > 5000ms')
  return { pass: violations.length === 0, violations }
}

export function frameBudget(taskCount: number, avgTaskMs: number): { withinBudget: boolean; remainingMs: number } {
  const budget = 16.67
  const total = taskCount * avgTaskMs
  return { withinBudget: total <= budget, remainingMs: Math.max(0, budget - total) }
}

export function detectLongTask(durationMs: number, threshold = 50): boolean {
  return durationMs > threshold
}
