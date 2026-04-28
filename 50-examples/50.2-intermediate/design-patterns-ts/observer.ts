/**
 * 观察者模式 (Observer Pattern)
 *
 * 定义：定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，
 *       所有依赖于它的对象都得到通知并被自动更新。
 *
 * 适用场景：
 * - 事件监听与通知系统
 * - 数据绑定（MVVM 中的 ViewModel）
 * - 发布-订阅系统
 * - 状态变更需要触发多个后续操作
 */

// 观察者接口
type EventPayload = Record<string, unknown>;

interface Observer {
  id: string;
  update(event: string, payload: EventPayload): void;
}

// 主题（被观察者）
class EventBus {
  private observers: Map<string, Observer[]> = new Map();

  // 订阅事件
  subscribe(event: string, observer: Observer): () => void {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event)!.push(observer);

    console.log(`[订阅] ${observer.id} 订阅了 ${event}`);

    // 返回取消订阅函数
    return () => {
      const list = this.observers.get(event) || [];
      this.observers.set(
        event,
        list.filter((o) => o.id !== observer.id)
      );
      console.log(`[取消订阅] ${observer.id} 取消了 ${event}`);
    };
  }

  // 发布事件
  emit(event: string, payload: EventPayload = {}): void {
    const list = this.observers.get(event) || [];
    console.log(`\n[发布] 事件 "${event}" → ${list.length} 个观察者`);
    list.forEach((observer) => observer.update(event, payload));
  }
}

// 具体观察者 1：日志记录器
class LoggerObserver implements Observer {
  id = 'Logger';

  update(event: string, payload: EventPayload): void {
    console.log(`  [Logger] 记录事件 "${event}": ${JSON.stringify(payload)}`);
  }
}

// 具体观察者 2：分析上报器
class AnalyticsObserver implements Observer {
  id = 'Analytics';

  update(event: string, payload: EventPayload): void {
    console.log(`  [Analytics] 上报指标: event=${event}, user=${payload.userId}`);
  }
}

// 具体观察者 3：邮件通知器
class EmailNotifier implements Observer {
  id = 'EmailNotifier';

  update(event: string, payload: EventPayload): void {
    if (event === 'user:signup') {
      console.log(`  [Email] 发送欢迎邮件给: ${payload.email}`);
    }
  }
}

// ========== 使用示例 ==========

function demoObserver() {
  console.log('=== 观察者模式示例 ===\n');

  const bus = new EventBus();

  const logger = new LoggerObserver();
  const analytics = new AnalyticsObserver();
  const email = new EmailNotifier();

  // 订阅事件
  bus.subscribe('user:signup', logger);
  bus.subscribe('user:signup', analytics);
  bus.subscribe('user:signup', email);
  bus.subscribe('user:login', logger);
  bus.subscribe('user:login', analytics);

  // 发布事件
  bus.emit('user:signup', {
    userId: 'u-1001',
    email: 'alice@example.com',
    source: 'organic',
  });

  bus.emit('user:login', {
    userId: 'u-1002',
    ip: '203.0.113.1',
  });

  console.log(
    '\n优点：观察者和主题是松耦合的，可以动态增删观察者，易于扩展事件处理链路。'
  );
}

demoObserver();
