/**
 * @file animations-motion-models.ts
 * @category Web Rendering → Animation
 * @model Animation and Motion
 */

export interface AnimationFrame {
  timestamp: number
  delta: number
  progress: number
}

export function createRAFLoop(
  durationMs: number,
  onFrame: (frame: AnimationFrame) => void,
  onComplete?: () => void
): () => void {
  let rafId: number
  let startTime = performance.now()

  const loop = (now: number) => {
    if (!startTime) startTime = now
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / durationMs)
    onFrame({ timestamp: now, delta: elapsed, progress })
    if (progress < 1) {
      rafId = requestAnimationFrame(loop)
    } else {
      onComplete?.()
    }
  }

  rafId = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(rafId); }
}

export function computeFlipDelta(first: DOMRect, last: DOMRect): { x: number; y: number; scaleX: number; scaleY: number } {
  return {
    x: first.left - last.left,
    y: first.top - last.top,
    scaleX: first.width / Math.max(1, last.width),
    scaleY: first.height / Math.max(1, last.height),
  }
}

export function withinFrameBudget(budgetMs: number, taskCount: number, avgTaskMs: number): boolean {
  return taskCount * avgTaskMs < budgetMs
}
