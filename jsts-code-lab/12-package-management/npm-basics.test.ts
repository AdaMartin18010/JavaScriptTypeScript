import { describe, it, expect, vi } from 'vitest';
import {
  SemVer,
  DependencyManager,
  PackagePublisher,
  NPM_LIFECYCLE,
} from './npm-basics';
import type { PackageJson } from './npm-basics';

describe('SemVer', () => {
  it('should parse valid versions', () => {
    const v = SemVer.parse('1.2.3');
    expect(v.major).toBe(1);
    expect(v.minor).toBe(2);
    expect(v.patch).toBe(3);
  });

  it('should throw for invalid versions', () => {
    expect(() => SemVer.parse('invalid')).toThrow('Invalid version');
  });

  it('should compare versions correctly', () => {
    expect(SemVer.parse('1.0.0').compare(SemVer.parse('2.0.0'))).toBeLessThan(0);
    expect(SemVer.parse('2.0.0').compare(SemVer.parse('1.0.0'))).toBeGreaterThan(0);
    expect(SemVer.parse('1.2.3').compare(SemVer.parse('1.2.3'))).toBe(0);
  });

  it('should handle prerelease comparison', () => {
    expect(SemVer.parse('1.0.0-alpha').compare(SemVer.parse('1.0.0'))).toBeLessThan(0);
    expect(SemVer.parse('1.0.0').compare(SemVer.parse('1.0.0-beta'))).toBeGreaterThan(0);
  });

  it('should satisfy caret ranges', () => {
    expect(SemVer.parse('1.2.3').satisfies('^1.0.0')).toBe(true);
    expect(SemVer.parse('2.0.0').satisfies('^1.0.0')).toBe(false);
  });

  it('should satisfy tilde ranges', () => {
    expect(SemVer.parse('1.2.5').satisfies('~1.2.0')).toBe(true);
    expect(SemVer.parse('1.3.0').satisfies('~1.2.0')).toBe(false);
  });

  it('should satisfy exact version', () => {
    expect(SemVer.parse('1.2.3').satisfies('1.2.3')).toBe(true);
    expect(SemVer.parse('1.2.3').satisfies('1.2.4')).toBe(false);
  });

  it('should satisfy star range', () => {
    expect(SemVer.parse('9.9.9').satisfies('*')).toBe(true);
  });
});

describe('DependencyManager', () => {
  it('should analyze dependency tree', () => {
    const manager = new DependencyManager();
    manager.addDependency({ name: 'react', version: '18.0.0', type: 'production' });
    manager.addDependency({ name: 'typescript', version: '5.0.0', type: 'development' });
    manager.addDependency({ name: 'react', version: '17.0.0', type: 'production' });

    const stats = manager.analyzeTree();
    expect(stats.total).toBe(3);
    expect(stats.production).toBe(2);
    expect(stats.development).toBe(1);
    expect(stats.duplicates).toContain('react');
  });

  it('should detect version conflicts', () => {
    const manager = new DependencyManager();
    manager.addDependency({ name: 'react', version: '18.0.0', type: 'production' });
    manager.addDependency({ name: 'react', version: '17.0.0', type: 'production' });

    const conflicts = manager.checkConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].versions).toContain('18.0.0');
    expect(conflicts[0].versions).toContain('17.0.0');
  });

  it('should generate a report', () => {
    const manager = new DependencyManager();
    manager.addDependency({ name: 'react', version: '18.0.0', type: 'production' });

    const report = manager.generateReport();
    expect(report).toContain('总依赖数');
    expect(report).toContain('生产依赖');
  });
});

describe('PackagePublisher', () => {
  it('should validate a valid package', () => {
    const pkg: PackageJson = {
      name: 'my-package',
      version: '1.0.0',
      main: 'index.js',
    };
    const publisher = new PackagePublisher(pkg);
    expect(publisher.validate()).toHaveLength(0);
  });

  it('should report missing name', () => {
    const pkg: PackageJson = { name: '', version: '1.0.0', main: 'index.js' };
    const publisher = new PackagePublisher(pkg);
    const errors = publisher.validate();
    expect(errors.some(e => e.field === 'name')).toBe(true);
  });

  it('should report invalid version', () => {
    const pkg: PackageJson = { name: 'pkg', version: 'not-semver', main: 'index.js' };
    const publisher = new PackagePublisher(pkg);
    const errors = publisher.validate();
    expect(errors.some(e => e.field === 'version')).toBe(true);
  });

  it('should report missing entry point', () => {
    const pkg: PackageJson = { name: 'pkg', version: '1.0.0' };
    const publisher = new PackagePublisher(pkg);
    const errors = publisher.validate();
    expect(errors.some(e => e.field === 'main/exports')).toBe(true);
  });

  it('should generate publish list', () => {
    const pkg: PackageJson = { name: 'pkg', version: '1.0.0', main: 'index.js', files: ['dist'] };
    const publisher = new PackagePublisher(pkg);
    const list = publisher.generatePublishList();
    expect(list).toContain('package.json');
    expect(list).toContain('README.md');
    expect(list).toContain('dist');
  });
});

describe('NPM_LIFECYCLE', () => {
  it('should contain publish lifecycle', () => {
    expect(NPM_LIFECYCLE.publish).toContain('prepublishOnly');
    expect(NPM_LIFECYCLE.publish).toContain('publish');
    expect(NPM_LIFECYCLE.publish).toContain('postpublish');
  });

  it('should contain test lifecycle', () => {
    expect(NPM_LIFECYCLE.test).toEqual(['pretest', 'test', 'posttest']);
  });
});
