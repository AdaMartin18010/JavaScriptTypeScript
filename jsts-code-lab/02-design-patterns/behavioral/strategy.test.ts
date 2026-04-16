import { describe, it, expect } from 'vitest';
import { CreditCardPayment, PayPalPayment, ShoppingCart, Sorter, SortStrategies, ValidationStrategies, Validator } from './strategy.js';

describe('strategy pattern', () => {
  it('ShoppingCart should calculate total and checkout with different strategies', () => {
    const cart = new ShoppingCart();
    cart.addItem('Book', 50);
    cart.addItem('Pen', 10);
    expect(cart.getTotal()).toBe(60);
    expect(() => cart.checkout()).toThrow('Payment method not set');
    cart.setPaymentStrategy(new CreditCardPayment('1234567890123456', '123'));
    expect(cart.checkout()).toBe(true);
  });

  it('Sorter should sort using different strategies', () => {
    const sorter = new Sorter<number>(SortStrategies.numericAscending);
    expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
    sorter.setStrategy(SortStrategies.numericDescending);
    expect(sorter.sort([3, 1, 2])).toEqual([3, 2, 1]);
  });

  it('SortStrategies should sort strings', () => {
    expect(['b', 'a'].sort(SortStrategies.stringAscending)).toEqual(['a', 'b']);
    expect(['a', 'b'].sort(SortStrategies.stringDescending)).toEqual(['b', 'a']);
  });

  it('Validator should validate with multiple strategies', () => {
    const validator = new Validator()
      .addStrategy(ValidationStrategies.required)
      .addStrategy(ValidationStrategies.email);
    expect(validator.validate('')).toEqual({ valid: false, errors: ['This field is required', 'Invalid email format'] });
    expect(validator.validate('invalid')).toEqual({ valid: false, errors: ['Invalid email format'] });
    expect(validator.validate('test@example.com')).toEqual({ valid: true, errors: [] });
  });

  it('PayPalPayment should pay correctly', () => {
    const payment = new PayPalPayment('user@example.com');
    expect(payment.getName()).toBe('PayPal');
    expect(payment.pay(100)).toBe(true);
  });
});
