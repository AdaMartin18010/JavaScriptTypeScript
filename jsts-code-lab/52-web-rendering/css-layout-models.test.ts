import { describe, it, expect } from 'vitest'
import { computeContentBox, estimateLayoutCost, shouldPromoteLayer } from './css-layout-models'

describe('computeContentBox', () => {
  it('computes content dimensions', () => {
    const box = { width: 100, height: 100, padding: { top: 10, right: 10, bottom: 10, left: 10 }, margin: { top: 0, right: 0, bottom: 0, left: 0 }, border: { top: 2, right: 2, bottom: 2, left: 2 } }
    const content = computeContentBox(box)
    expect(content.width).toBe(76)
    expect(content.height).toBe(76)
  })
})

describe('estimateLayoutCost', () => {
  it('estimates linear cost', () => {
    expect(estimateLayoutCost(1000)).toBe(1000)
  })
})

describe('shouldPromoteLayer', () => {
  it('returns true for transform', () => {
    expect(shouldPromoteLayer('transform')).toBe(true)
    expect(shouldPromoteLayer('width')).toBe(false)
  })
})
