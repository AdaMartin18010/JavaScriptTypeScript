import { describe, it, expect } from 'vitest'
import { checkRAIL, frameBudget, detectLongTask } from './rendering-performance-model.js'

describe('checkRAIL', () => {
  it('passes ideal metrics', () => {
    expect(checkRAIL({ response: 50, animation: 10, idle: 100, load: 2000 }).pass).toBe(true)
  })

  it('fails poor metrics', () => {
    const result = checkRAIL({ response: 200, animation: 20, idle: 30, load: 6000 })
    expect(result.pass).toBe(false)
    expect(result.violations.length).toBeGreaterThan(0)
  })
})

describe('frameBudget', () => {
  it('checks 60fps budget', () => {
    expect(frameBudget(3, 5).withinBudget).toBe(true)
    expect(frameBudget(5, 5).remainingMs).toBe(0)
  })
})

describe('detectLongTask', () => {
  it('detects long tasks', () => {
    expect(detectLongTask(60)).toBe(true)
    expect(detectLongTask(30)).toBe(false)
  })
})
