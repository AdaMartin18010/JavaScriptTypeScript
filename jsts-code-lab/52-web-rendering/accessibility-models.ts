/**
 * @file accessibility-models.ts
 * @category Web Rendering → A11y
 * @model Accessibility
 */

export interface AriaStateMachine {
  currentState: string
  transitions: Record<string, string[]>
}

export function validateAriaState(machine: AriaStateMachine, action: string): string | null {
  const nextStates = machine.transitions[machine.currentState]
  if (!nextStates) return null
  return nextStates.includes(action) ? action : null
}

export class FocusManager {
  private focusableIds: string[] = []
  private currentIndex = -1

  registerFocusables(ids: string[]): void {
    this.focusableIds = ids
    if (this.currentIndex < 0 && ids.length > 0) this.currentIndex = 0
  }

  next(): string | null {
    if (this.focusableIds.length === 0) return null
    this.currentIndex = (this.currentIndex + 1) % this.focusableIds.length
    return this.focusableIds[this.currentIndex]
  }

  previous(): string | null {
    if (this.focusableIds.length === 0) return null
    this.currentIndex = (this.currentIndex - 1 + this.focusableIds.length) % this.focusableIds.length
    return this.focusableIds[this.currentIndex]
  }
}
