import { describe, it, expect } from 'vitest'
import { createMVC, MVVMViewModel } from './mvc-derivatives'

describe('createMVC', () => {
  it('should update model through controller', () => {
    const { model, controller } = createMVC({ count: 0 })
    controller.handleInput({ count: 1 })
    expect(model.data).toEqual({ count: 1 })
  })
})

describe('MVVMViewModel', () => {
  it('should notify bound listeners', () => {
    const vm = new MVVMViewModel({ name: 'a' })
    let last = vm.getState()
    vm.bind((s) => { last = s })
    vm.setState({ name: 'b' })
    expect(last).toEqual({ name: 'b' })
  })
})
