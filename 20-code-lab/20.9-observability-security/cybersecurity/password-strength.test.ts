import { describe, it, expect } from 'vitest';
import { PasswordStrengthChecker, quickCheck } from './password-strength.js';

describe('PasswordStrengthChecker', () => {
  it('should analyze a strong password with high score', () => {
    const checker = new PasswordStrengthChecker();
    const result = checker.analyze('MyS3cur3!P@ssw0rd');

    expect(result.length).toBe(17);
    expect(result.charVariety).toBeGreaterThanOrEqual(4);
    expect(result.entropy).toBeGreaterThan(50);
    expect(result.score).toBeGreaterThan(60);
    expect(['strong', 'very-strong']).toContain(result.strength);
    expect(result.warnings.length).toBeLessThanOrEqual(1);
  });

  it('should flag weak common passwords', () => {
    const checker = new PasswordStrengthChecker();
    const result = checker.analyze('password');

    expect(result.score).toBeLessThan(70);
    expect(['very-weak', 'weak', 'fair']).toContain(result.strength);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should flag short passwords', () => {
    const checker = new PasswordStrengthChecker();
    const result = checker.analyze('abc');

    expect(result.length).toBe(3);
    expect(result.score).toBeLessThan(30);
    expect(result.warnings.some(w => w.includes('短'))).toBe(true);
  });

  it('should provide suggestions for improvement', () => {
    const checker = new PasswordStrengthChecker();
    const result = checker.analyze('abcdefgh');

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some(s => s.includes('大写') || s.includes('数字') || s.includes('符号'))).toBe(true);
  });

  it('should pass policy check for a compliant password', () => {
    const checker = new PasswordStrengthChecker({
      minLength: 10,
      requireLowercase: true,
      requireUppercase: true,
      requireDigits: true,
      requireSymbols: true,
    });
    const policyResult = checker.checkPolicy('Str0ng!Pass');

    expect(policyResult.valid).toBe(true);
    expect(policyResult.violations.length).toBe(0);
  });

  it('should fail policy check for non-compliant password', () => {
    const checker = new PasswordStrengthChecker({
      minLength: 10,
      requireUppercase: true,
      requireDigits: true,
    });
    const policyResult = checker.checkPolicy('weak');

    expect(policyResult.valid).toBe(false);
    expect(policyResult.violations.length).toBeGreaterThan(0);
  });

  it('should reject forbidden passwords in policy check', () => {
    const checker = new PasswordStrengthChecker();
    const policyResult = checker.checkPolicy('123456');

    expect(policyResult.valid).toBe(false);
    expect(policyResult.violations.some(v => v.includes('常见'))).toBe(true);
  });

  it('should estimate crack time for weak password as instant', () => {
    const checker = new PasswordStrengthChecker();
    const crackTime = checker.estimateCrackTime('123');

    expect(crackTime.offlineFastHash).toBe('瞬间');
  });

  it('should estimate long crack time for strong password', () => {
    const checker = new PasswordStrengthChecker();
    const crackTime = checker.estimateCrackTime('Correct-Horse-Battery-Staple!42');

    expect(crackTime.offlineFastHash).not.toBe('瞬间');
  });

  it('should throw on non-string input', () => {
    const checker = new PasswordStrengthChecker();
    expect(() => checker.analyze(123 as unknown as string)).toThrow(TypeError);
  });

  it('should respect custom policy configuration', () => {
    const checker = new PasswordStrengthChecker({
      minLength: 6,
      requireSymbols: false,
      minEntropy: 10,
    });
    const result = checker.checkPolicy('Hello1');

    expect(result.valid).toBe(true);
  });

  it('quickCheck should return strength, score and entropy', () => {
    const result = quickCheck('Test123!');

    expect(result).toHaveProperty('strength');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('entropy');
    expect(typeof result.score).toBe('number');
    expect(typeof result.entropy).toBe('number');
  });
});
