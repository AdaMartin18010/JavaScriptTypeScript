import { describe, it, expect } from 'vitest'
import { selectBreakpoint, generateSrcset, containerQueryWidth } from './responsive-design-models'

describe('selectBreakpoint', () => {
  it('selects correct breakpoint', () => {
    const bps = [
      { name: 'mobile', minWidth: 0, maxWidth: 767 },
      { name: 'desktop', minWidth: 768 },
    ]
    expect(selectBreakpoint(400, bps)).toBe('mobile')
    expect(selectBreakpoint(1024, bps)).toBe('desktop')
  })
})

describe('generateSrcset', () => {
  it('generates srcset string', () => {
    expect(generateSrcset('/img.jpg', [320, 640])).toBe('/img.jpg?w=320 320w, /img.jpg?w=640 640w')
  })
})

describe('containerQueryWidth', () => {
  it('computes item width', () => {
    expect(containerQueryWidth(1000, 3, 20)).toBe(320)
  })
})
