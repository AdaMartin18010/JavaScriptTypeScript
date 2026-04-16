import { describe, it, expect } from 'vitest'
import { MemoryLeakDetector, ObjectPool, estimateRetainedSize } from './memory-management-model.js'

describe('MemoryLeakDetector', () => {
  it('should not detect leak with single snapshot', () => {
    const detector = new MemoryLeakDetector()
    detector.recordSnapshot(1024)
    expect(detector.detectLeak()).toBe(false)
  })

  it('should detect leak when heap grows significantly', () => {
    const detector = new MemoryLeakDetector()
    const now = Date.now()
    detector['snapshots'] = [
      { timestamp: now - 20000, heapSize: 1000 },
      { timestamp: now - 10000, heapSize: 1500 },
      { timestamp: now, heapSize: 3000 },
    ]
    expect(detector.detectLeak(30000, 2.0)).toBe(true)
  })
})

describe('ObjectPool', () => {
  it('should reuse released objects', () => {
    let created = 0
    const pool = new ObjectPool(
      () => { created++; return { value: 0 } },
      (item: any) => { item.value = 0 }
    )
    const a = pool.acquire()
    pool.release(a)
    const b = pool.acquire()
    expect(created).toBe(1)
    expect(pool.size()).toBe(0)
  })
})

describe('estimateRetainedSize', () => {
  it('should calculate retained size', () => {
    expect(estimateRetainedSize(100)).toBe(100 * (56 + 3 * 16))
  })
})
