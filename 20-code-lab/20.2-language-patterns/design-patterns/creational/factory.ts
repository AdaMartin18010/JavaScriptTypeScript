/**
 * @file 工厂模式 (Factory Pattern)
 * @category Design Patterns → Creational
 * @difficulty easy
 * @tags factory, creational, polymorphism
 * 
 * @description
 * 定义创建对象的接口，由子类决定实例化哪个类
 */

// ============================================================================
// 1. 简单工厂 (Simple Factory)
// ============================================================================

type VehicleType = 'car' | 'bike' | 'truck';

interface Vehicle {
  drive(): string;
}

class Car implements Vehicle {
  drive() {
    return 'Driving car';
  }
}

class Bike implements Vehicle {
  drive() {
    return 'Riding bike';
  }
}

class Truck implements Vehicle {
  drive() {
    return 'Driving truck';
  }
}

class VehicleFactory {
  static create(type: VehicleType): Vehicle {
    switch (type) {
      case 'car':
        return new Car();
      case 'bike':
        return new Bike();
      case 'truck':
        return new Truck();
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

// ============================================================================
// 2. 工厂方法 (Factory Method)
// ============================================================================

abstract class Logistics {
  abstract createTransport(): Transport;

  planDelivery(): string {
    const transport = this.createTransport();
    return `Planning delivery by ${transport.deliver()}`;
  }
}

interface Transport {
  deliver(): string;
}

class TruckTransport implements Transport {
  deliver() {
    return 'truck on road';
  }
}

class ShipTransport implements Transport {
  deliver() {
    return 'ship on sea';
  }
}

class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new TruckTransport();
  }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new ShipTransport();
  }
}

// ============================================================================
// 3. 抽象工厂 (Abstract Factory)
// ============================================================================

interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

interface Button {
  render(): string;
  onClick(callback: () => void): void;
}

interface Checkbox {
  render(): string;
  toggle(): void;
}

class WindowsButton implements Button {
  render() {
    return 'Windows Button';
  }
  onClick(callback: () => void) {
    callback();
  }
}

class WindowsCheckbox implements Checkbox {
  render() {
    return 'Windows Checkbox';
  }
  toggle() {}
}

class MacButton implements Button {
  render() {
    return 'Mac Button';
  }
  onClick(callback: () => void) {
    callback();
  }
}

class MacCheckbox implements Checkbox {
  render() {
    return 'Mac Checkbox';
  }
  toggle() {}
}

class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}

class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}

// ============================================================================
// 4. TypeScript 的工厂实现
// ============================================================================

type Constructor<T> = new (...args: any[]) => T;

class GenericFactory<T> {
  constructor(private ctor: Constructor<T>) {}

  create(...args: any[]): T {
    return new this.ctor(...args);
  }
}

// 使用
class User {
  constructor(public name: string, public age: number) {}
}

const userFactory = new GenericFactory(User);
const user = userFactory.create('Alice', 30);

// ============================================================================
// 导出
// ============================================================================

export {
  VehicleFactory,
  Car,
  Bike,
  Truck,
  RoadLogistics,
  SeaLogistics,
  WindowsFactory,
  MacFactory,
  GenericFactory
};

export type {
  Vehicle,
  VehicleType,
  Logistics,
  Transport,
  GUIFactory,
  Button,
  Checkbox
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Factory Pattern Demo ===");
  
  // 简单工厂
  const car = VehicleFactory.create("car");
  const bike = VehicleFactory.create("bike");
  console.log("Car:", car.drive());
  console.log("Bike:", bike.drive());
  
  // 工厂方法
  const roadLogistics = new RoadLogistics();
  const seaLogistics = new SeaLogistics();
  console.log("Road:", roadLogistics.planDelivery());
  console.log("Sea:", seaLogistics.planDelivery());
  
  // 抽象工厂
  const windowsFactory = new WindowsFactory();
  const macFactory = new MacFactory();
  const winButton = windowsFactory.createButton();
  const macButton = macFactory.createButton();
  console.log("Windows button:", winButton.render());
  console.log("Mac button:", macButton.render());
  
  // 泛型工厂
  const userFactory = new GenericFactory(User);
  const user = userFactory.create("Alice", 30);
  console.log("Created user:", { name: user.name, age: user.age });
  
  console.log("=== End of Demo ===\n");
}
