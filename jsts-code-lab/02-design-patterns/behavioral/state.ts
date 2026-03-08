/**
 * @file 状态模式 (State Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty medium
 * @tags state, behavioral, state-machine, transition
 */

// ============================================================================
// 1. 状态接口
// ============================================================================

interface DocumentState {
  publish(document: Document): void;
  reject(document: Document): void;
  getName(): string;
}

// ============================================================================
// 2. 上下文
// ============================================================================

class Document {
  private state: DocumentState;
  private content: string;

  constructor(content: string) {
    this.content = content;
    this.state = new DraftState();
  }

  setState(state: DocumentState): void {
    this.state = state;
  }

  publish(): void {
    this.state.publish(this);
  }

  reject(): void {
    this.state.reject(this);
  }

  getStateName(): string {
    return this.state.getName();
  }

  getContent(): string {
    return this.content;
  }
}

// ============================================================================
// 3. 具体状态
// ============================================================================

class DraftState implements DocumentState {
  publish(document: Document): void {
    console.log('Document submitted for moderation');
    document.setState(new ModerationState());
  }

  reject(document: Document): void {
    console.log('Draft rejected and discarded');
  }

  getName(): string {
    return 'Draft';
  }
}

class ModerationState implements DocumentState {
  publish(document: Document): void {
    console.log('Document approved and published');
    document.setState(new PublishedState());
  }

  reject(document: Document): void {
    console.log('Document rejected, returning to draft');
    document.setState(new DraftState());
  }

  getName(): string {
    return 'Moderation';
  }
}

class PublishedState implements DocumentState {
  publish(document: Document): void {
    console.log('Document is already published');
  }

  reject(document: Document): void {
    console.log('Cannot reject published document, unpublishing...');
    document.setState(new DraftState());
  }

  getName(): string {
    return 'Published';
  }
}

// ============================================================================
// 4. 订单状态机示例
// ============================================================================

interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  deliver(order: Order): void;
  cancel(order: Order): void;
  getName(): string;
}

class Order {
  private state: OrderState = new PendingState();
  private items: string[] = [];

  constructor(items: string[]) {
    this.items = items;
  }

  setState(state: OrderState): void {
    this.state = state;
  }

  pay(): void {
    this.state.pay(this);
  }

  ship(): void {
    this.state.ship(this);
  }

  deliver(): void {
    this.state.deliver(this);
  }

  cancel(): void {
    this.state.cancel(this);
  }

  getStateName(): string {
    return this.state.getName();
  }
}

class PendingState implements OrderState {
  pay(order: Order): void {
    console.log('Payment processed');
    order.setState(new PaidState());
  }

  ship(order: Order): void {
    console.log('Cannot ship unpaid order');
  }

  deliver(order: Order): void {
    console.log('Cannot deliver unpaid order');
  }

  cancel(order: Order): void {
    console.log('Order cancelled');
    order.setState(new CancelledState());
  }

  getName(): string {
    return 'Pending';
  }
}

class PaidState implements OrderState {
  pay(order: Order): void {
    console.log('Already paid');
  }

  ship(order: Order): void {
    console.log('Order shipped');
    order.setState(new ShippedState());
  }

  deliver(order: Order): void {
    console.log('Cannot deliver unshipped order');
  }

  cancel(order: Order): void {
    console.log('Order refunded and cancelled');
    order.setState(new CancelledState());
  }

  getName(): string {
    return 'Paid';
  }
}

class ShippedState implements OrderState {
  pay(order: Order): void {
    console.log('Already paid');
  }

  ship(order: Order): void {
    console.log('Already shipped');
  }

  deliver(order: Order): void {
    console.log('Order delivered');
    order.setState(new DeliveredState());
  }

  cancel(order: Order): void {
    console.log('Cannot cancel shipped order');
  }

  getName(): string {
    return 'Shipped';
  }
}

class DeliveredState implements OrderState {
  pay(order: Order): void {
    console.log('Already paid');
  }

  ship(order: Order): void {
    console.log('Already shipped');
  }

  deliver(order: Order): void {
    console.log('Already delivered');
  }

  cancel(order: Order): void {
    console.log('Cannot cancel delivered order');
  }

  getName(): string {
    return 'Delivered';
  }
}

class CancelledState implements OrderState {
  pay(order: Order): void {
    console.log('Cannot pay for cancelled order');
  }

  ship(order: Order): void {
    console.log('Cannot ship cancelled order');
  }

  deliver(order: Order): void {
    console.log('Cannot deliver cancelled order');
  }

  cancel(order: Order): void {
    console.log('Already cancelled');
  }

  getName(): string {
    return 'Cancelled';
  }
}

// ============================================================================
// 5. JavaScript 对象状态机
// ============================================================================

type StateMachineConfig<TState extends string, TEvent extends string> = {
  initial: TState;
  states: Record<
    TState,
    {
      on?: Partial<Record<TEvent, TState>>;
      entry?: () => void;
      exit?: () => void;
    }
  >;
};

function createStateMachine<TState extends string, TEvent extends string>(
  config: StateMachineConfig<TState, TEvent>
) {
  let currentState = config.initial;

  return {
    getState: () => currentState,
    send: (event: TEvent) => {
      const stateConfig = config.states[currentState];
      const nextState = stateConfig.on?.[event];

      if (nextState) {
        stateConfig.exit?.();
        currentState = nextState;
        config.states[currentState].entry?.();
        return true;
      }
      return false;
    }
  };
}

// 使用
const lightMachine = createStateMachine({
  initial: 'green',
  states: {
    green: {
      on: { TIMER: 'yellow' },
      entry: () => console.log('Green light!')
    },
    yellow: {
      on: { TIMER: 'red' },
      entry: () => console.log('Yellow light!')
    },
    red: {
      on: { TIMER: 'green' },
      entry: () => console.log('Red light!')
    }
  }
});

// ============================================================================
// 导出
// ============================================================================

export {
  Document,
  DraftState,
  ModerationState,
  PublishedState,
  Order,
  PendingState,
  PaidState,
  ShippedState,
  DeliveredState,
  CancelledState,
  createStateMachine,
  lightMachine
};

export type { DocumentState, OrderState, StateMachineConfig };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== State Pattern Demo ===");

  // 文档状态机
  console.log("\nDocument State Machine:");
  const doc = new Document("My Article");
  console.log("Initial state:", doc.getStateName());

  doc.publish();
  console.log("After publish:", doc.getStateName());

  doc.publish();
  console.log("After second publish:", doc.getStateName());

  doc.reject();
  console.log("After reject:", doc.getStateName());

  // 订单状态机
  console.log("\nOrder State Machine:");
  const order = new Order(["Item1", "Item2"]);
  console.log("Initial state:", order.getStateName());

  order.pay();
  console.log("After pay:", order.getStateName());

  order.ship();
  console.log("After ship:", order.getStateName());

  order.deliver();
  console.log("After deliver:", order.getStateName());

  // 尝试无效操作
  console.log("\nTrying invalid operations:");
  order.pay(); // Already paid
  order.cancel(); // Cannot cancel delivered order

  // 新订单测试取消
  const order2 = new Order(["Item3"]);
  order2.pay();
  order2.cancel();
  console.log("Order2 state after cancel:", order2.getStateName());

  // JavaScript 状态机
  console.log("\nTraffic Light State Machine:");
  const light = createStateMachine({
    initial: "green",
    states: {
      green: {
        on: { TIMER: "yellow" },
        entry: () => console.log("🟢 Green light - GO!")
      },
      yellow: {
        on: { TIMER: "red" },
        entry: () => console.log("🟡 Yellow light - CAUTION!")
      },
      red: {
        on: { TIMER: "green" },
        entry: () => console.log("🔴 Red light - STOP!")
      }
    }
  });

  console.log("Current state:", light.getState());
  light.send("TIMER");
  light.send("TIMER");
  light.send("TIMER");

  console.log("=== End of Demo ===\n");
}
