import { describe, it, expect } from 'vitest'
import { acceptAnimal, describeOwner, walkDog, describeAnimal, explainSubtyping } from './structural-subtyping'

describe('structural-subtyping', () => {
  it('accepts Dog where Animal expected (width)', () => {
    const dog = { name: 'Buddy', breed: 'Golden' };
    expect(acceptAnimal(dog)).toBe('Buddy');
  });

  it('accepts DogOwner where PetOwner expected (depth)', () => {
    const owner = { pet: { name: 'Buddy', breed: 'Golden' } };
    expect(describeOwner(owner)).toBe('Owner of Buddy');
  });

  it('allows contravariant function assignment', () => {
    // describeAnimal expects Animal, so it is safe to pass where Dog is expected.
    expect(walkDog(describeAnimal)).toBe('Buddy');
  });

  it('returns explanations', () => {
    expect(explainSubtyping().length).toBeGreaterThanOrEqual(3);
  });
})
