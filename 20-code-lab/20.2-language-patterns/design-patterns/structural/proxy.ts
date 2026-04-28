/**
 * @file 代理模式 (Proxy Pattern)
 * @category Design Patterns → Structural
 * @difficulty medium
 * @tags proxy, structural, access-control, lazy-loading
 * 
 * @description
 * 为其他对象提供一种代理以控制对这个对象的访问
 */

// ============================================================================
// 1. 虚拟代理 (延迟加载)
// ============================================================================

interface Image {
  display(): void;
  getFileName(): string;
}

class RealImage implements Image {
  constructor(private fileName: string) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading image: ${this.fileName}`);
  }

  display(): void {
    console.log(`Displaying image: ${this.fileName}`);
  }

  getFileName(): string {
    return this.fileName;
  }
}

class ProxyImage implements Image {
  private realImage?: RealImage;

  constructor(private fileName: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.fileName);
    }
    this.realImage.display();
  }

  getFileName(): string {
    return this.fileName;
  }
}

// ============================================================================
// 2. 保护代理 (访问控制)
// ============================================================================

interface Document {
  view(): string;
  edit(content: string): void;
  delete(): void;
}

class RealDocument implements Document {
  private content: string;

  constructor(
    private fileName: string,
    content: string
  ) {
    this.content = content;
  }

  view(): string {
    return this.content;
  }

  edit(content: string): void {
    this.content = content;
    console.log(`Document ${this.fileName} edited`);
  }

  delete(): void {
    console.log(`Document ${this.fileName} deleted`);
  }
}

class ProtectedDocumentProxy implements Document {
  constructor(
    private document: Document,
    private userRole: 'admin' | 'editor' | 'viewer'
  ) {}

  view(): string {
    return this.document.view();
  }

  edit(content: string): void {
    if (this.userRole === 'viewer') {
      throw new Error('Viewers cannot edit documents');
    }
    this.document.edit(content);
  }

  delete(): void {
    if (this.userRole !== 'admin') {
      throw new Error('Only admins can delete documents');
    }
    this.document.delete();
  }
}

// ============================================================================
// 3. 缓存代理
// ============================================================================

interface Calculator {
  fibonacci(n: number): number;
  factorial(n: number): number;
}

class RealCalculator implements Calculator {
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}

class CachedCalculatorProxy implements Calculator {
  private cache = new Map<string, number>();

  constructor(private calculator: Calculator) {}

  fibonacci(n: number): number {
    const key = `fib-${n}`;
    if (this.cache.has(key)) {
      console.log(`Cache hit for ${key}`);
      return this.cache.get(key)!;
    }
    const result = this.calculator.fibonacci(n);
    this.cache.set(key, result);
    return result;
  }

  factorial(n: number): number {
    const key = `fact-${n}`;
    if (this.cache.has(key)) {
      console.log(`Cache hit for ${key}`);
      return this.cache.get(key)!;
    }
    const result = this.calculator.factorial(n);
    this.cache.set(key, result);
    return result;
  }
}

// ============================================================================
// 4. 日志代理
// ============================================================================

function createLoggingProxy<T extends object>(target: T, targetName: string): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      
      if (typeof value === 'function') {
        return function (...args: any[]) {
          console.log(`[${targetName}.${String(prop)}] called with:`, args);
          const result = value.apply(target, args);
          console.log(`[${targetName}.${String(prop)}] returned:`, result);
          return result;
        };
      }
      
      return value;
    }
  });
}

// ============================================================================
// 5. 远程代理概念
// ============================================================================

interface RemoteService {
  fetchData(id: string): Promise<unknown>;
  saveData(id: string, data: unknown): Promise<void>;
}

class RemoteServiceProxy implements RemoteService {
  private serviceUrl: string;

  constructor(url: string) {
    this.serviceUrl = url;
  }

  async fetchData(id: string): Promise<unknown> {
    console.log(`Proxy: Fetching data from ${this.serviceUrl} for id ${id}`);
    // 实际实现会进行网络请求
    return { id, data: 'remote data' };
  }

  async saveData(id: string, data: unknown): Promise<void> {
    console.log(`Proxy: Saving data to ${this.serviceUrl} for id ${id}`);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  RealImage,
  ProxyImage,
  RealDocument,
  ProtectedDocumentProxy,
  RealCalculator,
  CachedCalculatorProxy,
  createLoggingProxy,
  RemoteServiceProxy
};

export type { Image, Document, Calculator, RemoteService };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Proxy Pattern Demo ===");
  
  // 虚拟代理 (延迟加载)
  const image = new ProxyImage("photo.jpg");
  console.log("Image created (not loaded yet)");
  console.log("Filename:", image.getFileName());
  image.display(); // 这里才会加载
  image.display(); // 复用已加载的图像
  
  // 保护代理
  const doc = new RealDocument("secret.txt", "Top secret content");
  const viewerDoc = new ProtectedDocumentProxy(doc, "viewer");
  const adminDoc = new ProtectedDocumentProxy(doc, "admin");
  
  console.log("\nViewer can view:", viewerDoc.view());
  try {
    viewerDoc.edit("new content");
  } catch (e) {
    console.log("Viewer cannot edit:", (e as Error).message);
  }
  
  console.log("\nAdmin operations:");
  adminDoc.edit("modified by admin");
  console.log("Content after edit:", adminDoc.view());
  
  // 缓存代理
  const calculator = new RealCalculator();
  const cached = new CachedCalculatorProxy(calculator);
  
  console.log("\nCached calculator:");
  console.log("fib(10):", cached.fibonacci(10));
  console.log("fib(10) again (cached):", cached.fibonacci(10));
  console.log("fact(5):", cached.factorial(5));
  
  console.log("=== End of Demo ===\n");
}
