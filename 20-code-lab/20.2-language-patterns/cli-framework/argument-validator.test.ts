import { describe, it, expect } from 'vitest'
import { ArgumentValidator } from './argument-validator.js'

describe('argument-validator', () => {
  it('ArgumentValidator is defined', () => {
    expect(typeof ArgumentValidator).not.toBe('undefined');
  });

  it('returns empty array for valid required string', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('create', {
      name: [{ type: 'required' }, { type: 'string', minLength: 1 }]
    });
    expect(validator.validate('create', { name: 'hello' })).toEqual([]);
  });

  it('returns errors for missing required field', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('create', {
      name: [{ type: 'required' }]
    });
    const errors = validator.validate('create', {});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('required');
  });

  it('validates number range', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('config', {
      port: [{ type: 'number', min: 1, max: 65535 }]
    });
    expect(validator.validate('config', { port: 8080 })).toEqual([]);
    expect(validator.validate('config', { port: 99999 }).length).toBeGreaterThan(0);
  });

  it('validates enum values', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('deploy', {
      env: [{ type: 'enum', values: ['dev', 'prod', 'staging'] }]
    });
    expect(validator.validate('deploy', { env: 'prod' })).toEqual([]);
    expect(validator.validate('deploy', { env: 'test' }).length).toBeGreaterThan(0);
  });

  it('validates string pattern', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('user', {
      email: [{ type: 'string', pattern: /^\S+@\S+\.\S+$/ }]
    });
    expect(validator.validate('user', { email: 'test@example.com' })).toEqual([]);
    expect(validator.validate('user', { email: 'invalid' }).length).toBeGreaterThan(0);
  });

  it('custom validator returns string error', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('check', {
      value: [{ type: 'custom', validator: (v) => v === 'ok' || 'must be ok' }]
    });
    expect(validator.validate('check', { value: 'ok' })).toEqual([]);
    expect(validator.validate('check', { value: 'bad' })).toContain('must be ok');
  });

  it('isValid returns boolean', () => {
    const validator = new ArgumentValidator();
    validator.registerSchema('test', {
      name: [{ type: 'required' }]
    });
    expect(validator.isValid('test', { name: 'x' })).toBe(true);
    expect(validator.isValid('test', {})).toBe(false);
  });
});
