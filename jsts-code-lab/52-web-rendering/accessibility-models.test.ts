import { describe, it, expect } from 'vitest'
import { validateAriaState, FocusManager } from './accessibility-models.js'

describe('validateAriaState', () => {
  it('allows valid transition', () => {
    const machine = { currentState: 'closed', transitions: { closed: ['opened'], opened: ['closed'] } }
    expect(validateAriaState(machine, 'opened')).toBe('opened')
  })

  it('rejects invalid transition', () => {
    const machine = { currentState: 'closed', transitions: { closed: ['opened'] } }
    expect(validateAriaState(machine, 'disabled')).toBeNull()
  })
})

describe('FocusManager', () => {
  it('cycles forward and backward', () => {
    const fm = new FocusManager()
    fm.registerFocusables(['a', 'b', 'c'])
    expect(fm.next()).toBe('b')
    expect(fm.previous()).toBe('a')
  })
})
