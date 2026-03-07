/**
 * @file 外观模式 (Facade Pattern)
 * @category Design Patterns → Structural
 * @difficulty easy
 * @tags facade, structural, simplified-interface
 */

// ============================================================================
// 1. 复杂子系统
// ============================================================================

class CPU {
  freeze(): void {
    console.log('CPU: Freezing processor');
  }

  jump(position: number): void {
    console.log(`CPU: Jumping to position ${position}`);
  }

  execute(): void {
    console.log('CPU: Executing instructions');
  }
}

class Memory {
  load(position: number, data: string): void {
    console.log(`Memory: Loading "${data}" at position ${position}`);
  }
}

class HardDrive {
  read(lba: number, size: number): string {
    console.log(`HardDrive: Reading ${size} bytes from LBA ${lba}`);
    return 'data';
  }
}

class PowerSupply {
  turnOn(): void {
    console.log('PowerSupply: Turning on');
  }

  turnOff(): void {
    console.log('PowerSupply: Turning off');
  }
}

// ============================================================================
// 2. 外观类
// ============================================================================

class ComputerFacade {
  private cpu = new CPU();
  private memory = new Memory();
  private hardDrive = new HardDrive();
  private powerSupply = new PowerSupply();

  start(): void {
    console.log('=== Starting Computer ===');
    this.powerSupply.turnOn();
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('=== Computer Started ===\n');
  }

  shutdown(): void {
    console.log('=== Shutting Down ===');
    this.powerSupply.turnOff();
    console.log('=== Computer Off ===\n');
  }
}

// ============================================================================
// 3. API 外观示例
// ============================================================================

class OrderService {
  createOrder(userId: string, items: string[]): string {
    console.log(`Creating order for user ${userId} with items: ${items.join(', ')}`);
    return 'order-123';
  }
}

class PaymentService {
  processPayment(orderId: string, amount: number): boolean {
    console.log(`Processing payment of $${amount} for order ${orderId}`);
    return true;
  }
}

class ShippingService {
  scheduleShipping(orderId: string, address: string): string {
    console.log(`Scheduling shipping for order ${orderId} to ${address}`);
    return 'tracking-456';
  }
}

class NotificationService {
  sendConfirmation(email: string, orderId: string): void {
    console.log(`Sending confirmation to ${email} for order ${orderId}`);
  }
}

// 外观
class ECommerceFacade {
  private orderService = new OrderService();
  private paymentService = new PaymentService();
  private shippingService = new ShippingService();
  private notificationService = new NotificationService();

  placeOrder(
    userId: string,
    email: string,
    items: string[],
    amount: number,
    address: string
  ): { success: boolean; orderId?: string; trackingId?: string; error?: string } {
    try {
      // 简化复杂的订单流程
      const orderId = this.orderService.createOrder(userId, items);
      
      const paymentSuccess = this.paymentService.processPayment(orderId, amount);
      if (!paymentSuccess) {
        return { success: false, error: 'Payment failed' };
      }

      const trackingId = this.shippingService.scheduleShipping(orderId, address);
      this.notificationService.sendConfirmation(email, orderId);

      return { success: true, orderId, trackingId };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

// ============================================================================
// 4. 前端外观示例
// ============================================================================

class DOMFacade {
  static select(selector: string): Element | null {
    return document.querySelector(selector);
  }

  static selectAll(selector: string): Element[] {
    return Array.from(document.querySelectorAll(selector));
  }

  static create(tag: string, attributes: Record<string, string> = {}): HTMLElement {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  static on(element: HTMLElement, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
  }

  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  CPU,
  Memory,
  HardDrive,
  PowerSupply,
  ComputerFacade,
  OrderService,
  PaymentService,
  ShippingService,
  NotificationService,
  ECommerceFacade,
  DOMFacade
};
