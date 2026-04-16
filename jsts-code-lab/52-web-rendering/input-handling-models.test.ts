import { describe, it, expect } from 'vitest'
import { buildEventRoute, GestureRecognizer } from './input-handling-models'

describe('buildEventRoute', () => {
  it('builds capture-target-bubble route', () => {
    const route = buildEventRoute('btn', ['div', 'section'])
    expect(route.map((r) => r.phase)).toEqual(['capture', 'capture', 'target', 'bubble', 'bubble'])
    expect(route[2].target).toBe('btn')
  })
})

describe('GestureRecognizer', () => {
  it('recognizes tap', () => {
    const g = new GestureRecognizer()
    g.start(0, 0)
    const result = g.end(2, 2)
    expect(result.isTap).toBe(true)
  })

  it('recognizes swipe', () => {
    const g = new GestureRecognizer()
    g.start(0, 0)
    const result = g.end(100, 0)
    expect(result.isTap).toBe(false)
    expect(result.dx).toBe(100)
  })
})
