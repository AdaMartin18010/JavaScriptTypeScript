/**
 * @file structural-subtyping.ts
 * @category Type Theory → Subtyping
 * @difficulty hard
 * @theoretical_basis Structural subtyping, width/depth/function subtyping
 * @references
 *   1. B. Pierce. Types and Programming Languages. 2002.
 */

// TypeScript naturally demonstrates structural subtyping.
// This file uses runtime predicates to model subtyping checks conceptually.

export interface Animal {
  name: string
}

export interface Dog extends Animal {
  breed: string
}

// Width subtyping: Dog <: Animal because Dog has all fields of Animal plus more.
export function acceptAnimal(a: Animal): string {
  return a.name
}

// Depth subtyping: { pet: Dog } <: { pet: Animal } because Dog <: Animal
export interface PetOwner {
  pet: Animal
}

export interface DogOwner {
  pet: Dog
}

export function describeOwner(o: PetOwner): string {
  return `Owner of ${o.pet.name}`
}

// Function subtyping: (Animal => void) <: (Dog => void)
// contravariant in argument position
export function walkDog(fn: (d: Dog) => string): string {
  return fn({ name: 'Buddy', breed: 'Golden' })
}

export function describeAnimal(a: Animal): string {
  return a.name
}

// The following assignment is valid in TS due to contravariance:
// const handler: (d: Dog) => string = describeAnimal;

export function isWidthSubtype<T extends Record<string, unknown>, U extends T>(
  _sub: U,
  _super: T
): boolean {
  return true // At runtime, TS structural typing guarantees this at compile time.
}

export function explainSubtyping(): string[] {
  return [
    'Width: {x:S, y:T} <: {x:S}',
    'Depth: {x:Dog} <: {x:Animal}',
    'Function: (Animal->R) <: (Dog->R)  [contravariant in argument]',
  ]
}
