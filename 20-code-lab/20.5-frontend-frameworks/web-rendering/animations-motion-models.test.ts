import { describe, it, expect, vi } from 'vitest'
import { computeFlipDelta, withinFrameBudget } from './animations-motion-models.js'

describe('computeFlipDelta', () => {
  it('computes delta between rects', () => {
    const first = { left: 0, top: 0, width: 100, height: 100 } as DOMRect
    const last = { left: 10, top: 20, width: 50, height: 50 } as DOMRect
    const d = computeFlipDelta(first, last)
    expect(d.x).toBe(-10)
    expect(d.y).toBe(-20)
    expect(d.scaleX).toBe(2)
    expect(d.scaleY).toBe(2)
  })
})

describe('withinFrameBudget', () => {
  it('checks budget', () => {
    expect(withinFrameBudget(16, 3, 5)).toBe(true)
    expect(withinFrameBudget(10, 3, 5)).toBe(false)
  })
})
