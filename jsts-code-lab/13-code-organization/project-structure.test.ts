import { describe, it, expect } from 'vitest';
import { ModuleBoundaryChecker, commonDependencyRules, frontendStructure, backendStructure, codeSplitStrategies } from './project-structure';

describe('ModuleBoundaryChecker', () => {
  it('allows valid imports', () => {
    const checker = new ModuleBoundaryChecker(commonDependencyRules);
    const result = checker.checkImport('src/pages/Home.tsx', 'src/features/user');
    expect(result.valid).toBe(true);
  });

  it('blocks invalid imports', () => {
    const checker = new ModuleBoundaryChecker(commonDependencyRules);
    const result = checker.checkImport('src/components/Button.tsx', 'src/features/user');
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
  });

  it('checks multiple imports', () => {
    const checker = new ModuleBoundaryChecker(commonDependencyRules);
    const results = checker.checkProject([
      { from: 'src/features/a', to: 'src/components/b' },
      { from: 'src/features/a', to: 'src/features/c' }
    ]);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
  });
});

describe('Project structures', () => {
  it('frontend structure is defined', () => {
    expect(frontendStructure.type).toBe('frontend');
    expect(frontendStructure.structure.children?.length).toBeGreaterThan(0);
  });

  it('backend structure is defined', () => {
    expect(backendStructure.type).toBe('backend');
    expect(backendStructure.structure.children?.length).toBeGreaterThan(0);
  });
});

describe('codeSplitStrategies', () => {
  it('contains strategies', () => {
    expect(codeSplitStrategies.length).toBeGreaterThan(0);
    expect(codeSplitStrategies[0].name).toBeDefined();
  });
});
