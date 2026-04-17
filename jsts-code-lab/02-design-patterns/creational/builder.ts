/**
 * @file 建造者模式 (Builder Pattern)
 * @category Design Patterns → Creational
 * @difficulty easy
 * @tags builder, creational, step-by-step
 */

// ============================================================================
// 1. 产品类
// ============================================================================

class Computer {
  cpu = '';
  ram = '';
  storage = '';
  gpu?: string;
  wifi?: boolean;

  toString(): string {
    return `Computer: CPU=${this.cpu}, RAM=${this.ram}, Storage=${this.storage}, GPU=${this.gpu}, WiFi=${this.wifi}`;
  }
}

// ============================================================================
// 2. 建造者接口
// ============================================================================

interface ComputerBuilder {
  setCPU(cpu: string): this;
  setRAM(ram: string): this;
  setStorage(storage: string): this;
  setGPU(gpu: string): this;
  setWiFi(enabled: boolean): this;
  build(): Computer;
}

// ============================================================================
// 3. 具体建造者
// ============================================================================

class DesktopComputerBuilder implements ComputerBuilder {
  private computer = new Computer();

  setCPU(cpu: string): this {
    this.computer.cpu = cpu;
    return this;
  }

  setRAM(ram: string): this {
    this.computer.ram = ram;
    return this;
  }

  setStorage(storage: string): this {
    this.computer.storage = storage;
    return this;
  }

  setGPU(gpu: string): this {
    this.computer.gpu = gpu;
    return this;
  }

  setWiFi(enabled: boolean): this {
    this.computer.wifi = enabled;
    return this;
  }

  build(): Computer {
    return this.computer;
  }

  reset(): void {
    this.computer = new Computer();
  }
}

// ============================================================================
// 4. 指导者 (Director)
// ============================================================================

class ComputerDirector {
  constructor(private builder: ComputerBuilder) {}

  buildGamingPC(): Computer {
    return this.builder
      .setCPU('Intel i9')
      .setRAM('32GB')
      .setStorage('2TB SSD')
      .setGPU('RTX 4090')
      .setWiFi(true)
      .build();
  }

  buildOfficePC(): Computer {
    return this.builder
      .setCPU('Intel i5')
      .setRAM('16GB')
      .setStorage('512GB SSD')
      .setWiFi(true)
      .build();
  }
}

// ============================================================================
// 5. TypeScript 的简化建造者 (使用 Partial)
// ============================================================================

interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  address?: string;
  avatar?: string;
}

class UserProfileBuilder {
  private profile: Partial<UserProfile> = {};

  setId(id: string): this {
    this.profile.id = id;
    return this;
  }

  setName(name: string): this {
    this.profile.name = name;
    return this;
  }

  setEmail(email: string): this {
    this.profile.email = email;
    return this;
  }

  setAge(age: number): this {
    this.profile.age = age;
    return this;
  }

  setAddress(address: string): this {
    this.profile.address = address;
    return this;
  }

  setAvatar(avatar: string): this {
    this.profile.avatar = avatar;
    return this;
  }

  build(): UserProfile {
    if (!this.profile.id || !this.profile.name || !this.profile.email) {
      throw new Error('Required fields missing');
    }
    return this.profile as UserProfile;
  }
}

// ============================================================================
// 6. 函数式建造者
// ============================================================================

interface Builder<T> {
  set: <K extends keyof T>(key: K, value: T[K]) => Builder<T>;
  build: () => T;
}

function createBuilder<T>(initial: T): Builder<T> {
  const state = { ...initial };

  return {
    set<K extends keyof T>(key: K, value: T[K]): Builder<T> {
      state[key] = value;
      return this;
    },
    build(): T {
      return { ...state };
    }
  };
}

// ============================================================================
// 导出
// ============================================================================

export {
  Computer,
  DesktopComputerBuilder,
  ComputerDirector,
  UserProfileBuilder,
  createBuilder
};

export type { ComputerBuilder, UserProfile, Builder };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Builder Pattern Demo ===");
  
  // 建造者模式
  const builder = new DesktopComputerBuilder();
  const director = new ComputerDirector(builder);
  
  const gamingPC = director.buildGamingPC();
  console.log("Gaming PC:", gamingPC.toString());
  
  builder.reset?.();
  const officePC = director.buildOfficePC();
  console.log("Office PC:", officePC.toString());
  
  // 手动构建
  const customPC = builder
    .setCPU("AMD Ryzen 9")
    .setRAM("64GB")
    .setStorage("4TB NVMe")
    .setGPU("RX 7900 XTX")
    .setWiFi(true)
    .build();
  console.log("Custom PC:", customPC.toString());
  
  // UserProfile 建造者
  const profile = new UserProfileBuilder()
    .setId("123")
    .setName("Alice")
    .setEmail("alice@example.com")
    .setAge(30)
    .build();
  console.log("User profile:", profile);
  
  console.log("=== End of Demo ===\n");
}
