/**
 * 策略模式 (Strategy Pattern)
 *
 * 定义：定义一系列算法，把它们一个个封装起来，并且使它们可以互相替换。
 *       策略模式让算法的变化独立于使用算法的客户。
 *
 * 适用场景：
 * - 有多种类似的行为/算法，需要动态切换
 * - 需要消除大量的 if-else 或 switch 分支
 * - 算法的实现细节需要与调用方隔离
 */

// 策略接口：支付策略
type PaymentContext = {
  amount: number;
  currency: string;
};

interface PaymentStrategy {
  name: string;
  pay(ctx: PaymentContext): Promise<{ success: boolean; transactionId: string }>;
}

// 具体策略 1：支付宝支付
class AlipayStrategy implements PaymentStrategy {
  name = 'Alipay';

  async pay(ctx: PaymentContext) {
    console.log(`[Alipay] 发起支付: ${ctx.amount} ${ctx.currency}`);
    // 模拟网络请求
    await new Promise((r) => setTimeout(r, 100));
    return { success: true, transactionId: `ALI-${Date.now()}` };
  }
}

// 具体策略 2：微信支付
class WechatPayStrategy implements PaymentStrategy {
  name = 'WechatPay';

  async pay(ctx: PaymentContext) {
    console.log(`[WechatPay] 发起支付: ${ctx.amount} ${ctx.currency}`);
    await new Promise((r) => setTimeout(r, 100));
    return { success: true, transactionId: `WX-${Date.now()}` };
  }
}

// 具体策略 3：信用卡支付
class CreditCardStrategy implements PaymentStrategy {
  name = 'CreditCard';

  async pay(ctx: PaymentContext) {
    console.log(`[CreditCard] 验证卡片并扣款: ${ctx.amount} ${ctx.currency}`);
    await new Promise((r) => setTimeout(r, 150));
    return { success: true, transactionId: `CC-${Date.now()}` };
  }
}

// 上下文类：支付处理器，持有当前策略
class PaymentProcessor {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  // 动态切换策略
  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async checkout(amount: number, currency = 'CNY') {
    console.log(`\n使用策略: ${this.strategy.name}`);
    const result = await this.strategy.pay({ amount, currency });
    if (result.success) {
      console.log(`✅ 支付成功，交易号: ${result.transactionId}`);
    }
    return result;
  }
}

// ========== 使用示例 ==========

async function demoStrategy() {
  console.log('=== 策略模式示例 ===');

  // 初始化时使用支付宝
  const processor = new PaymentProcessor(new AlipayStrategy());
  await processor.checkout(199, 'CNY');

  // 运行时切换到微信支付
  processor.setStrategy(new WechatPayStrategy());
  await processor.checkout(299, 'CNY');

  // 再切换到信用卡
  processor.setStrategy(new CreditCardStrategy());
  await processor.checkout(59.99, 'USD');

  console.log('\n优点：新增支付方式只需添加策略类，不影响现有代码；策略可在运行时切换。');
}

demoStrategy();
