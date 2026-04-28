import { describe, it, expect } from 'vitest'
import { VirtualScroller, createPlaceholder, ComponentCleanup } from './memory-optimization-models.js'

describe('VirtualScroller', () => {
  it('calculates visible range', () => {
    const scroller = new VirtualScroller(50, 200, 1000)
    const range = scroller.getVisibleRange(100)
    expect(range.start).toBe(2)
    expect(range.totalHeight).toBe(50000)
  })
})

describe('createPlaceholder', () => {
  it('generates svg placeholder', () => {
    const url = createPlaceholder(100, 100)
    expect(url).toContain('svg')
    expect(url).toContain('100')
  })
})

describe('ComponentCleanup', () => {
  it('runs all disposers', () => {
    const cleanup = new ComponentCleanup()
    let called = 0
    cleanup.onUnmount(() => called++)
    cleanup.onUnmount(() => called++)
    cleanup.cleanup()
    expect(called).toBe(2)
  })
})
