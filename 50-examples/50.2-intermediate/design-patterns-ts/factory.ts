/**
 * 工厂模式 (Factory Pattern)
 *
 * 定义：定义一个创建对象的接口，让其子类决定实例化哪一个类。
 *       工厂方法使一个类的实例化延迟到其子类。
 *
 * 适用场景：
 * - 需要根据不同条件创建不同类型的对象
 * - 对象的创建逻辑复杂，需要集中管理
 * - 希望将对象的创建与使用解耦
 */

// 产品接口：所有通知发送器都必须实现
interface NotificationSender {
  send(message: string, recipient: string): void;
}

// 具体产品 1：邮件发送器
class EmailSender implements NotificationSender {
  send(message: string, recipient: string): void {
    console.log(`[Email] 发送给 ${recipient}: ${message}`);
  }
}

// 具体产品 2：短信发送器
class SmsSender implements NotificationSender {
  send(message: string, recipient: string): void {
    console.log(`[SMS] 发送给 ${recipient}: ${message}`);
  }
}

// 具体产品 3：推送通知发送器
class PushSender implements NotificationSender {
  send(message: string, recipient: string): void {
    console.log(`[Push] 发送给 ${recipient}: ${message}`);
  }
}

// 工厂类：根据类型创建对应的发送器
class NotificationFactory {
  static create(type: 'email' | 'sms' | 'push'): NotificationSender {
    switch (type) {
      case 'email':
        return new EmailSender();
      case 'sms':
        return new SmsSender();
      case 'push':
        return new PushSender();
      default:
        throw new Error(`不支持的通知类型: ${type}`);
    }
  }
}

// ========== 使用示例 ==========

function demoFactory() {
  console.log('=== 工厂模式示例 ===\n');

  const channels: Array<'email' | 'sms' | 'push'> = ['email', 'sms', 'push'];

  channels.forEach((channel) => {
    // 使用工厂创建对象，无需关心具体类名
    const sender = NotificationFactory.create(channel);
    sender.send('您的订单已发货', 'user@example.com');
  });

  console.log('\n优点：新增通知渠道时，只需扩展工厂和产品类，调用方代码无需修改。');
}

demoFactory();
