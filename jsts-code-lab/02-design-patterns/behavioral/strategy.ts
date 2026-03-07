/**
 * @file 策略模式 (Strategy Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty easy
 * @tags strategy, behavioral, algorithm-family
 */

// ============================================================================
// 1. 策略接口
// ============================================================================

interface PaymentStrategy {
  pay(amount: number): boolean;
  getName(): string;
}

// ============================================================================
// 2. 具体策略
// ============================================================================

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string, private cvv: string) {}

  pay(amount: number): boolean {
    console.log(`Paying $${amount} using Credit Card ${this.cardNumber.slice(-4)}`);
    return true;
  }

  getName(): string {
    return 'Credit Card';
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): boolean {
    console.log(`Paying $${amount} using PayPal account ${this.email}`);
    return true;
  }

  getName(): string {
    return 'PayPal';
  }
}

class CryptoPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): boolean {
    console.log(`Paying $${amount} using Crypto wallet ${this.walletAddress.slice(0, 8)}...`);
    return true;
  }

  getName(): string {
    return 'Cryptocurrency';
  }
}

// ============================================================================
// 3. 上下文
// ============================================================================

class ShoppingCart {
  private items: { name: string; price: number }[] = [];
  private paymentStrategy?: PaymentStrategy;

  addItem(name: string, price: number): void {
    this.items.push({ name, price });
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
  }

  checkout(): boolean {
    if (!this.paymentStrategy) {
      throw new Error('Payment method not set');
    }

    const total = this.getTotal();
    console.log(`\nCheckout: ${this.items.length} items, Total: $${total}`);
    return this.paymentStrategy.pay(total);
  }
}

// ============================================================================
// 4. 排序策略示例
// ============================================================================

type SortStrategy<T> = (a: T, b: T) => number;

class Sorter<T> {
  private strategy: SortStrategy<T>;

  constructor(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    return [...data].sort(this.strategy);
  }
}

// 预定义策略
const SortStrategies = {
  numericAscending: (a: number, b: number) => a - b,
  numericDescending: (a: number, b: number) => b - a,
  stringAscending: (a: string, b: string) => a.localeCompare(b),
  stringDescending: (a: string, b: string) => b.localeCompare(a),
  byProperty:
    <T>(prop: keyof T) =>
    (a: T, b: T): number => {
      const aVal = a[prop];
      const bVal = b[prop];
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    }
};

// ============================================================================
// 5. 验证策略示例
// ============================================================================

interface ValidationStrategy {
  validate(value: string): { valid: boolean; error?: string };
}

const ValidationStrategies = {
  required: {
    validate: (value: string) => ({
      valid: value.trim().length > 0,
      error: 'This field is required'
    })
  } as ValidationStrategy,

  email: {
    validate: (value: string) => ({
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      error: 'Invalid email format'
    })
  } as ValidationStrategy,

  minLength: (min: number) => ({
    validate: (value: string) => ({
      valid: value.length >= min,
      error: `Must be at least ${min} characters`
    })
  }) as ValidationStrategy
};

class Validator {
  private strategies: ValidationStrategy[] = [];

  addStrategy(strategy: ValidationStrategy): this {
    this.strategies.push(strategy);
    return this;
  }

  validate(value: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const strategy of this.strategies) {
      const result = strategy.validate(value);
      if (!result.valid) {
        errors.push(result.error!);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  CreditCardPayment,
  PayPalPayment,
  CryptoPayment,
  ShoppingCart,
  Sorter,
  SortStrategies,
  ValidationStrategies,
  Validator
};

export type { PaymentStrategy, SortStrategy, ValidationStrategy };
