import { describe, it, expect } from 'vitest';
import {
  Validator,
  StringValidator,
  NumberValidator,
  ArrayValidator,
  ObjectValidator,
  BooleanValidator,
  DateValidator,
  FormValidator,
  v,
  emailValidator,
  passwordValidator,
  phoneValidator,
} from './validator';

describe('Validator', () => {
  it('should pass validation with no rules', async () => {
    const validator = new Validator();
    const result = await validator.validate('anything');
    expect(result.valid).toBe(true);
  });

  it('should enforce required fields', async () => {
    const validator = new Validator().required();
    const result = await validator.validate('');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('validation.required');
  });

  it('should allow null when nullable', async () => {
    const validator = new Validator().nullable();
    const result = await validator.validate(null);
    expect(result.valid).toBe(true);
    expect(result.value).toBeNull();
  });

  it('should apply default value', async () => {
    const validator = new Validator().default('default-value');
    const result = await validator.validate(undefined);
    expect(result.value).toBe('default-value');
  });

  it('should run custom validation', async () => {
    const validator = new Validator<string>().custom((value) =>
      value === 'ok' ? null : { code: 'custom', message: 'not ok', value, path: '' }
    );

    expect((await validator.validate('ok')).valid).toBe(true);
    expect((await validator.validate('bad')).valid).toBe(false);
  });
});

describe('StringValidator', () => {
  it('should validate string type', async () => {
    const validator = new StringValidator();
    expect((await validator.validate('hello')).valid).toBe(true);
    expect((await validator.validate(123)).valid).toBe(false);
  });

  it('should enforce minLength', async () => {
    const validator = new StringValidator().minLength(3);
    expect((await validator.validate('ab')).valid).toBe(false);
    expect((await validator.validate('abc')).valid).toBe(true);
  });

  it('should enforce maxLength', async () => {
    const validator = new StringValidator().maxLength(5);
    expect((await validator.validate('abcdef')).valid).toBe(false);
    expect((await validator.validate('abcde')).valid).toBe(true);
  });

  it('should validate email format', async () => {
    const validator = new StringValidator().email();
    expect((await validator.validate('test@example.com')).valid).toBe(true);
    expect((await validator.validate('invalid-email')).valid).toBe(false);
  });

  it('should validate UUID format', async () => {
    const validator = new StringValidator().uuid();
    expect((await validator.validate('550e8400-e29b-41d4-a716-446655440000')).valid).toBe(true);
    expect((await validator.validate('not-a-uuid')).valid).toBe(false);
  });

  it('should validate phone format', async () => {
    const validator = new StringValidator().phone();
    expect((await validator.validate('13800138000')).valid).toBe(true);
    expect((await validator.validate('1234567890')).valid).toBe(false);
  });

  it('should validate password strength', async () => {
    const validator = new StringValidator().password();
    expect((await validator.validate('Weak1')).valid).toBe(false);
    expect((await validator.validate('StrongP@ssw0rd')).valid).toBe(true);
  });

  it('should trim strings', async () => {
    const validator = new StringValidator().trim();
    const result = await validator.validate('  hello  ');
    expect(result.value).toBe('hello');
  });

  it('should validate credit card with Luhn algorithm', async () => {
    const validator = new StringValidator().creditCard();
    expect((await validator.validate('4532015112830366')).valid).toBe(true);
    expect((await validator.validate('1234567890123456')).valid).toBe(false);
  });
});

describe('NumberValidator', () => {
  it('should validate number type', async () => {
    const validator = new NumberValidator();
    expect((await validator.validate(42)).valid).toBe(true);
    expect((await validator.validate('42')).valid).toBe(false);
  });

  it('should enforce min and max', async () => {
    const validator = new NumberValidator().min(0).max(100);
    expect((await validator.validate(-1)).valid).toBe(false);
    expect((await validator.validate(50)).valid).toBe(true);
    expect((await validator.validate(101)).valid).toBe(false);
  });

  it('should enforce range', async () => {
    const validator = new NumberValidator().range(1, 10);
    expect((await validator.validate(0)).valid).toBe(false);
    expect((await validator.validate(5)).valid).toBe(true);
    expect((await validator.validate(11)).valid).toBe(false);
  });

  it('should validate integer', async () => {
    const validator = new NumberValidator().integer();
    expect((await validator.validate(5)).valid).toBe(true);
    expect((await validator.validate(5.5)).valid).toBe(false);
  });
});

describe('ArrayValidator', () => {
  it('should validate array type', async () => {
    const validator = new ArrayValidator();
    expect((await validator.validate([1, 2, 3])).valid).toBe(true);
    expect((await validator.validate('not-array')).valid).toBe(false);
  });

  it('should enforce array length constraints', async () => {
    const validator = new ArrayValidator().minLength(2).maxLength(4);
    expect((await validator.validate([1])).valid).toBe(false);
    expect((await validator.validate([1, 2, 3])).valid).toBe(true);
    expect((await validator.validate([1, 2, 3, 4, 5])).valid).toBe(false);
  });

  it('should validate unique items', async () => {
    const validator = new ArrayValidator().unique();
    expect((await validator.validate([1, 2, 3])).valid).toBe(true);
    expect((await validator.validate([1, 2, 2])).valid).toBe(false);
  });

  it('should validate each item with item validator', async () => {
    const validator = new ArrayValidator<string>().items(new StringValidator().minLength(2));
    expect((await validator.validate(['ab', 'cd'])).valid).toBe(true);
    expect((await validator.validate(['a', 'cd'])).valid).toBe(false);
  });
});

describe('ObjectValidator', () => {
  it('should validate object shape', async () => {
    const validator = new ObjectValidator({
      name: new StringValidator().required(),
      age: new NumberValidator().required(),
    });

    expect((await validator.validate({ name: 'Alice', age: 30 })).valid).toBe(true);
    expect((await validator.validate({ name: 'Alice' })).valid).toBe(false);
  });

  it('should reject unknown fields by default', async () => {
    const validator = new ObjectValidator({ name: new StringValidator() });
    const result = await validator.validate({ name: 'Alice', extra: true });
    expect(result.valid).toBe(false);
  });

  it('should allow unknown fields when configured', async () => {
    const validator = new ObjectValidator({ name: new StringValidator() });
    const result = await validator.validate(
      { name: 'Alice', extra: true },
      {},
      { allowUnknown: true }
    );
    expect(result.valid).toBe(true);
  });

  it('should support pick and omit', async () => {
    const base = new ObjectValidator({
      a: new StringValidator().required(),
      b: new NumberValidator().required(),
    });

    const picked = base.pick('a');
    expect((await picked.validate({ a: 'ok' })).valid).toBe(true);

    const omitted = base.omit('b');
    expect((await omitted.validate({ a: 'ok' })).valid).toBe(true);
  });
});

describe('BooleanValidator', () => {
  it('should validate boolean type', async () => {
    const validator = new BooleanValidator();
    expect((await validator.validate(true)).valid).toBe(true);
    expect((await validator.validate(false)).valid).toBe(true);
    expect((await validator.validate('true')).valid).toBe(false);
  });
});

describe('DateValidator', () => {
  it('should validate date type', async () => {
    const validator = new DateValidator();
    expect((await validator.validate(new Date())).valid).toBe(true);
    expect((await validator.validate('2024-01-01')).valid).toBe(false);
    expect((await validator.validate(new Date('invalid'))).valid).toBe(false);
  });

  it('should enforce date range', async () => {
    const min = new Date('2024-01-01');
    const max = new Date('2024-12-31');
    const validator = new DateValidator().min(min).max(max);

    expect((await validator.validate(new Date('2024-06-01'))).valid).toBe(true);
    expect((await validator.validate(new Date('2023-01-01'))).valid).toBe(false);
    expect((await validator.validate(new Date('2025-01-01'))).valid).toBe(false);
  });
});

describe('FormValidator', () => {
  it('should validate form fields', async () => {
    const form = new FormValidator()
      .field('email', new StringValidator().email().required(), '邮箱')
      .field('age', new NumberValidator().min(18).optional(), '年龄');

    const result = await form.validate({ email: 'test@example.com', age: 25 });
    expect(result.valid).toBe(true);
    expect(result.value).toEqual({ email: 'test@example.com', age: 25 });
  });

  it('should include labels in error messages', async () => {
    const form = new FormValidator().field('email', new StringValidator().email().required(), '邮箱');
    const result = await form.validate({ email: 'invalid' });

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('邮箱');
  });
});

describe('v factory', () => {
  it('should create validators via factory', async () => {
    const schema = v.object({
      name: v.string().minLength(2).required(),
      age: v.number().min(0).optional(),
      tags: v.array(v.string()).maxLength(3),
      active: v.boolean(),
      role: v.enum('user', 'admin'),
    });

    const result = await schema.validate({
      name: 'Alice',
      age: 30,
      tags: ['a', 'b'],
      active: true,
      role: 'admin',
    });

    expect(result.valid).toBe(true);
  });

  it('should validate union types', async () => {
    const validator = v.union(v.string(), v.number());
    expect((await validator.validate('hello')).valid).toBe(true);
    expect((await validator.validate(42)).valid).toBe(true);
    expect((await validator.validate(true)).valid).toBe(false);
  });

  it('should validate literal values', async () => {
    const validator = v.literal('pending');
    expect((await validator.validate('pending')).valid).toBe(true);
    expect((await validator.validate('approved')).valid).toBe(false);
  });

  it('should validate field references', async () => {
    const form = v.form()
      .field('password', v.string().required() as Validator, '密码')
      .field('confirm', v.ref('password') as Validator, '确认密码');

    const result = await form.validate({ password: 'secret', confirm: 'secret' });
    expect(result.valid).toBe(true);
  });
});

describe('predefined validators', () => {
  it('emailValidator should validate emails', async () => {
    expect((await emailValidator.validate('user@example.com')).valid).toBe(true);
    expect((await emailValidator.validate('bad')).valid).toBe(false);
  });

  it('passwordValidator should enforce strong passwords', async () => {
    expect((await passwordValidator.validate('Short1!')).valid).toBe(false);
    expect((await passwordValidator.validate('MyStr0ng!P@ss')).valid).toBe(true);
  });

  it('phoneValidator should validate Chinese phone numbers', async () => {
    expect((await phoneValidator.validate('13800138000')).valid).toBe(true);
    expect((await phoneValidator.validate('12345')).valid).toBe(false);
  });
});
