/**
 * @file 工厂模式 - JavaScript vs TypeScript 对比
 * @category JS/TS Comparison → Implementations
 * @difficulty medium
 * @tags comparison, factory-pattern, javascript, typescript
 */

// ============================================================================
// TypeScript 实现 - 完整类型安全
// ============================================================================

interface Vehicle {
  drive(): void;
  getInfo(): string;
}

class Car implements Vehicle {
  constructor(private brand: string, private seats: number) {}

  drive(): void {
    console.log(`Driving ${this.brand} car with ${this.seats} seats`);
  }

  getInfo(): string {
    return `Car: ${this.brand}, Seats: ${this.seats}`;
  }
}

class Motorcycle implements Vehicle {
  constructor(private brand: string, private hasSidecar: boolean) {}

  drive(): void {
    console.log(`Riding ${this.brand} motorcycle ${this.hasSidecar ? 'with sidecar' : ''}`);
  }

  getInfo(): string {
    return `Motorcycle: ${this.brand}, Sidecar: ${this.hasSidecar}`;
  }
}

class Truck implements Vehicle {
  constructor(private brand: string, private capacity: number) {}

  drive(): void {
    console.log(`Driving ${this.brand} truck with ${this.capacity}t capacity`);
  }

  getInfo(): string {
    return `Truck: ${this.brand}, Capacity: ${this.capacity}t`;
  }
}

// 工厂类 - TypeScript 版本
export class VehicleFactoryTS {
  static createVehicle(
    type: 'car' | 'motorcycle' | 'truck',
    brand: string,
    options: Record<string, any>
  ): Vehicle {
    switch (type) {
      case 'car':
        return new Car(brand, options.seats || 4);
      case 'motorcycle':
        return new Motorcycle(brand, options.hasSidecar || false);
      case 'truck':
        return new Truck(brand, options.capacity || 5);
      default:
        // 编译时错误：非穷尽 switch
        const _exhaustiveCheck: never = type;
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

// ============================================================================
// JavaScript 实现 - 动态类型
// ============================================================================

/**
 * JavaScript 等价实现
 * 问题:
 * 1. 没有编译时类型检查
 * 2. 参数类型容易出错
 * 3. IDE 无法提供智能提示
 * 4. 需要运行时类型检查来防御
 */

// JS Car 类
class CarJS {
  constructor(brand, seats) {
    this.brand = brand;
    this.seats = seats;
  }

  drive() {
    console.log(`Driving ${this.brand} car with ${this.seats} seats`);
  }

  getInfo() {
    return `Car: ${this.brand}, Seats: ${this.seats}`;
  }
}

// JS Motorcycle 类
class MotorcycleJS {
  constructor(brand, hasSidecar) {
    this.brand = brand;
    this.hasSidecar = hasSidecar;
  }

  drive() {
    console.log(`Riding ${this.brand} motorcycle ${this.hasSidecar ? 'with sidecar' : ''}`);
  }

  getInfo() {
    return `Motorcycle: ${this.brand}, Sidecar: ${this.hasSidecar}`;
  }
}

// JS Truck 类
class TruckJS {
  constructor(brand, capacity) {
    this.brand = brand;
    this.capacity = capacity;
  }

  drive() {
    console.log(`Driving ${this.brand} truck with ${this.capacity}t capacity`);
  }

  getInfo() {
    return `Truck: ${this.brand}, Capacity: ${this.capacity}t`;
  }
}

// JS 工厂 - 使用对象映射而非 switch
export const VehicleFactoryJS = {
  creators: {
    car: (brand, options) => new CarJS(brand, options.seats || 4),
    motorcycle: (brand, options) => new MotorcycleJS(brand, options.hasSidecar || false),
    truck: (brand, options) => new TruckJS(brand, options.capacity || 5)
  },

  createVehicle(type, brand, options = {}) {
    const creator = this.creators[type];
    if (!creator) {
      throw new Error(`Unknown vehicle type: ${type}`);
    }
    return creator(brand, options);
  }
};

// ============================================================================
// JavaScript 防御式实现 - 带运行时类型检查
// ============================================================================

export class VehicleFactoryJSDefensive {
  static VALID_TYPES = ['car', 'motorcycle', 'truck'];

  static createVehicle(type, brand, options = {}) {
    // 运行时类型检查
    if (typeof type !== 'string') {
      throw new TypeError('Type must be a string');
    }
    
    if (typeof brand !== 'string') {
      throw new TypeError('Brand must be a string');
    }

    if (!this.VALID_TYPES.includes(type)) {
      throw new Error(`Invalid type: ${type}. Must be one of: ${this.VALID_TYPES.join(', ')}`);
    }

    // 防御式选项处理
    const safeOptions = options || {};

    switch (type) {
      case 'car': {
        const seats = typeof safeOptions.seats === 'number' ? safeOptions.seats : 4;
        return new CarJS(brand, seats);
      }
      case 'motorcycle': {
        const hasSidecar = Boolean(safeOptions.hasSidecar);
        return new MotorcycleJS(brand, hasSidecar);
      }
      case 'truck': {
        const capacity = typeof safeOptions.capacity === 'number' ? safeOptions.capacity : 5;
        return new TruckJS(brand, capacity);
      }
    }
  }
}

// ============================================================================
// 类型擦除对比
// ============================================================================

/**
 * TypeScript 编译后的 JavaScript (概念展示):
 * 
 * 编译前:
 *   class VehicleFactoryTS {
 *     static createVehicle(
 *       type: 'car' | 'motorcycle' | 'truck',
 *       brand: string,
 *       options: Record<string, any>
 *     ): Vehicle { ... }
 *   }
 * 
 * 编译后:
 *   class VehicleFactoryTS {
 *     static createVehicle(type, brand, options) { ... }
 *   }
 * 
 * 区别:
 * 1. 类型注解被完全擦除
 * 2. 联合类型 'car' | 'motorcycle' | 'truck' 变为普通 string
 * 3. 返回类型 Vehicle 被擦除
 * 4. 接口定义被完全移除
 * 
 * 运行时行为:
 * - TS 和 JS 版本在运行时完全相同
 * - 类型只在编译时存在
 * - 错误只能在运行时发现 (如果绕过 TS 编译器)
 */

// ============================================================================
// 互操作：在 TS 中使用 JS 工厂
// ============================================================================

// 需要声明文件来提供类型信息
declare module 'vehicle-factory-js' {
  export interface VehicleJS {
    drive(): void;
    getInfo(): string;
  }

  export function createVehicle(
    type: string,
    brand: string,
    options?: Record<string, any>
  ): VehicleJS;
}

// 使用示例 (需要类型断言)
function useJSFactory(): Vehicle {
  // const vehicle = VehicleFactoryJS.createVehicle('car', 'Toyota', { seats: 5 });
  // 返回类型是 any，需要断言
  // return vehicle as Vehicle;
  
  // 更好的做法是包装函数
  return VehicleFactoryJSDefensive.createVehicle('car', 'Toyota', { seats: 5 }) as Vehicle;
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 工厂模式 - JS/TS 对比 ===\n');

  // TypeScript 版本
  console.log('--- TypeScript 版本 ---');
  const car = VehicleFactoryTS.createVehicle('car', 'Toyota', { seats: 5 });
  const motorcycle = VehicleFactoryTS.createVehicle('motorcycle', 'Honda', { hasSidecar: true });
  const truck = VehicleFactoryTS.createVehicle('truck', 'Volvo', { capacity: 10 });

  [car, motorcycle, truck].forEach(v => {
    console.log(v.getInfo());
    v.drive();
  });

  // 编译时错误示例 (取消注释查看)
  // const invalid = VehicleFactoryTS.createVehicle('plane', 'Boeing', {}); // 错误: 'plane' 不被允许

  // JavaScript 版本
  console.log('\n--- JavaScript 版本 ---');
  const carJS = VehicleFactoryJS.createVehicle('car', 'Toyota', { seats: 5 });
  const bikeJS = VehicleFactoryJS.createVehicle('motorcycle', 'Honda', { hasSidecar: true });

  console.log(carJS.getInfo());
  console.log(bikeJS.getInfo());

  // JavaScript 可以传入无效类型 (运行时错误)
  try {
    const invalid = VehicleFactoryJS.createVehicle('plane', 'Boeing', {});
    console.log('Created:', invalid);
  } catch (e) {
    console.log('Error:', (e as Error).message);
  }

  // 对比总结
  console.log('\n--- 对比总结 ---');
  console.log('TypeScript:');
  console.log('  ✅ 编译时检查类型有效性');
  console.log('  ✅ 枚举所有可能的类型 (联合类型)');
  console.log('  ✅ never 类型用于穷尽性检查');
  console.log('  ✅ 接口确保实现一致性');
  
  console.log('\nJavaScript:');
  console.log('  ⚠️ 运行时才能发现类型错误');
  console.log('  ⚠️ 需要手动维护有效类型列表');
  console.log('  ⚠️ 缺少接口约束，容易遗漏方法');
  console.log('  ✅ 更灵活，可以动态添加类型');

  console.log('\n结论: 工厂模式中 TS 的编译时检查可以防止创建无效类型的对象');
}

// ============================================================================
// 导出
// ============================================================================

export {
  Car,
  Motorcycle,
  Truck,
  VehicleFactoryTS,
  VehicleFactoryJS,
  VehicleFactoryJSDefensive,
  useJSFactory
};

export type {
  Vehicle
};
