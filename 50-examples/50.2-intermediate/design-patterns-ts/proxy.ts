/**
 * 代理模式 (Proxy Pattern)
 *
 * 定义：为其他对象提供一种代理以控制对这个对象的访问。
 *
 * 适用场景：
 * - 远程代理：访问远程对象（如 RPC 客户端）
 * - 虚拟代理：延迟创建开销大的对象（如图片懒加载）
 * - 保护代理：控制访问权限
 * - 缓存代理：缓存请求结果，减少重复计算或网络请求
 */

// 主题接口
interface ImageLoader {
  display(): void;
  getDimensions(): { width: number; height: number };
}

// 真实主题：高分辨率图片（加载成本高）
class RealImage implements ImageLoader {
  private filename: string;
  private width = 0;
  private height = 0;

  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`[RealImage] 从磁盘加载大图: ${this.filename}`);
    // 模拟耗时加载
    this.width = 4096;
    this.height = 2160;
  }

  display(): void {
    console.log(`[RealImage] 显示图片: ${this.filename} (${this.width}x${this.height})`);
  }

  getDimensions() {
    return { width: this.width, height: this.height };
  }
}

// 代理 1：虚拟代理（延迟加载）
class LazyImageProxy implements ImageLoader {
  private filename: string;
  private realImage: RealImage | null = null;

  constructor(filename: string) {
    this.filename = filename;
  }

  private getRealImage(): RealImage {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    return this.realImage;
  }

  display(): void {
    this.getRealImage().display();
  }

  getDimensions() {
    // 可以在这里返回占位尺寸，避免立即加载
    if (!this.realImage) {
      return { width: 1920, height: 1080 }; // 占位
    }
    return this.realImage.getDimensions();
  }
}

// 代理 2：缓存代理（Memoization）
class CachedImageProxy implements ImageLoader {
  private target: ImageLoader;
  private cache: Map<string, unknown> = new Map();

  constructor(target: ImageLoader) {
    this.target = target;
  }

  display(): void {
    const cacheKey = 'display';
    if (this.cache.has(cacheKey)) {
      console.log(`[CacheProxy] 命中缓存，直接显示`);
      return;
    }
    this.target.display();
    this.cache.set(cacheKey, true);
  }

  getDimensions() {
    const cacheKey = 'dimensions';
    if (this.cache.has(cacheKey)) {
      console.log(`[CacheProxy] 命中缓存: dimensions`);
      return this.cache.get(cacheKey) as { width: number; height: number };
    }
    const dims = this.target.getDimensions();
    this.cache.set(cacheKey, dims);
    return dims;
  }
}

// ========== 使用示例 ==========

function demoProxy() {
  console.log('=== 代理模式示例 ===\n');

  console.log('--- 虚拟代理（懒加载）---');
  const lazyImage = new LazyImageProxy('photo.jpg');
  console.log('图片对象已创建，但尚未加载');
  console.log('占位尺寸:', lazyImage.getDimensions());
  console.log('首次显示时才真正加载:');
  lazyImage.display();
  console.log('再次显示（已加载）:');
  lazyImage.display();

  console.log('\n--- 缓存代理 ---');
  const cached = new CachedImageProxy(new RealImage('banner.png'));
  console.log('第一次 display:');
  cached.display();
  console.log('第二次 display（走缓存）:');
  cached.display();
  console.log('获取尺寸:');
  console.log(cached.getDimensions());
  console.log('再次获取尺寸（走缓存）:');
  console.log(cached.getDimensions());

  console.log('\n优点：代理在不改变目标对象的情况下，透明地增加了延迟加载、缓存、权限控制等能力。');
}

demoProxy();
