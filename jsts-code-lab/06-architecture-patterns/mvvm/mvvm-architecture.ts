/**
 * @file MVVM 架构 (Model-View-ViewModel)
 * @category Architecture Patterns → MVVM
 * @difficulty medium
 * @tags architecture, mvvm, data-binding, reactive
 * 
 * @description
 * MVVM 是一种架构模式，特别适用于现代 UI 框架：
 * - Model: 数据模型
 * - View: 用户界面 (声明式/模板)
 * - ViewModel: 连接 View 和 Model，提供可绑定的数据和命令
 * 
 * 核心特性：数据双向绑定、响应式更新
 */

// ============================================================================
// 1. 响应式系统 (Reactive System)
// ============================================================================

type Effect = () => void;

class Dependency {
  private subscribers: Set<Effect> = new Set();

  depend(): void {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  notify(): void {
    this.subscribers.forEach(effect => effect());
  }
}

let activeEffect: Effect | null = null;

export function watchEffect(effect: Effect): void {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

// 简易的响应式 ref
export function ref<T>(value: T): { value: T } {
  const dep = new Dependency();
  return {
    get value() {
      dep.depend();
      return value;
    },
    set value(newValue: T) {
      if (value !== newValue) {
        value = newValue;
        dep.notify();
      }
    }
  };
}

// 计算属性
export function computed<T>(getter: () => T): { readonly value: T } {
  const result = ref<T>(undefined as unknown as T);
  watchEffect(() => {
    result.value = getter();
  });
  return {
    get value() {
      return result.value;
    }
  };
}

// ============================================================================
// 2. Model 层
// ============================================================================

export interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export class ProductModel {
  private products: Product[] = [
    { id: '1', name: '笔记本电脑', price: 5999, inStock: true },
    { id: '2', name: '无线鼠标', price: 99, inStock: true },
    { id: '3', name: '机械键盘', price: 499, inStock: false },
    { id: '4', name: '显示器', price: 1299, inStock: true }
  ];

  getAllProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  updateStock(id: string, inStock: boolean): boolean {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.inStock = inStock;
      return true;
    }
    return false;
  }
}

// ============================================================================
// 3. ViewModel 层
// ============================================================================

export class ProductViewModel {
  // 状态
  searchQuery = ref('');
  selectedCategory = ref<'all' | 'available' | 'unavailable'>('all');
  cart = ref<Map<string, number>>(new Map());

  constructor(private model: ProductModel) {}

  // 计算属性：过滤后的产品列表
  get filteredProducts() {
    return computed(() => {
      let products = this.model.getAllProducts();

      // 搜索过滤
      const query = this.searchQuery.value.toLowerCase();
      if (query) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(query)
        );
      }

      // 类别过滤
      switch (this.selectedCategory.value) {
        case 'available':
          return products.filter(p => p.inStock);
        case 'unavailable':
          return products.filter(p => !p.inStock);
        default:
          return products;
      }
    });
  }

  // 计算属性：购物车总价
  get cartTotalPrice() {
    return computed(() => {
      let total = 0;
      this.cart.value.forEach((quantity, productId) => {
        const product = this.model.getProductById(productId);
        if (product) {
          total += product.price * quantity;
        }
      });
      return total;
    });
  }

  // 计算属性：购物车商品数量
  get cartItemCount() {
    return computed(() => {
      let count = 0;
      this.cart.value.forEach(qty => count += qty);
      return count;
    });
  }

  // 命令方法
  setSearchQuery(query: string): void {
    this.searchQuery.value = query;
  }

  setCategory(category: 'all' | 'available' | 'unavailable'): void {
    this.selectedCategory.value = category;
  }

  addToCart(productId: string): void {
    const product = this.model.getProductById(productId);
    if (!product || !product.inStock) return;

    const newCart = new Map(this.cart.value);
    const currentQty = newCart.get(productId) || 0;
    newCart.set(productId, currentQty + 1);
    this.cart.value = newCart;
  }

  removeFromCart(productId: string): void {
    const newCart = new Map(this.cart.value);
    newCart.delete(productId);
    this.cart.value = newCart;
  }

  clearCart(): void {
    this.cart.value = new Map();
  }
}

// ============================================================================
// 4. View 层 (控制台模拟)
// ============================================================================

export class ProductView {
  private unsubscribeFns: Array<() => void> = [];

  constructor(private viewModel: ProductViewModel) {
    this.setupBindings();
  }

  private setupBindings(): void {
    // 当过滤产品变化时，重新渲染列表
    this.unsubscribeFns.push(
      this.watch(() => this.viewModel.filteredProducts.value)
    );

    // 当购物车变化时，更新购物车显示
    this.unsubscribeFns.push(
      this.watch(() => ({
        total: this.viewModel.cartTotalPrice.value,
        count: this.viewModel.cartItemCount.value
      }))
    );
  }

  private watch<T>(getter: () => T): () => void {
    let lastValue: T;
    const cleanup = () => {};
    
    watchEffect(() => {
      const value = getter();
      if (JSON.stringify(value) !== JSON.stringify(lastValue)) {
        lastValue = value;
        this.render();
      }
    });
    
    return cleanup;
  }

  render(): void {
    console.clear();
    console.log('=== 商品商城 (MVVM 演示) ===\n');

    // 搜索和过滤状态
    console.log(`搜索: "${this.viewModel.searchQuery.value}"`);
    console.log(`筛选: ${this.viewModel.selectedCategory.value}`);
    console.log('');

    // 商品列表
    const products = this.viewModel.filteredProducts.value;
    console.log('--- 商品列表 ---');
    products.forEach(p => {
      const stock = p.inStock ? '有货' : '缺货';
      console.log(`${p.id}. ${p.name} - ¥${p.price} [${stock}]`);
    });

    if (products.length === 0) {
      console.log('暂无商品');
    }

    console.log('');

    // 购物车
    const cartCount = this.viewModel.cartItemCount.value;
    const cartTotal = this.viewModel.cartTotalPrice.value;
    console.log('--- 购物车 ---');
    console.log(`商品数量: ${cartCount}`);
    console.log(`总计: ¥${cartTotal}`);
  }

  destroy(): void {
    this.unsubscribeFns.forEach(fn => fn());
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  const model = new ProductModel();
  const viewModel = new ProductViewModel(model);
  const view = new ProductView(viewModel);

  // 初始渲染
  view.render();

  // 模拟用户交互
  console.log('\n>>> 添加商品到购物车');
  viewModel.addToCart('1');
  viewModel.addToCart('2');

  console.log('\n>>> 设置搜索关键词');
  viewModel.setSearchQuery('鼠标');

  console.log('\n>>> 切换筛选条件');
  viewModel.setCategory('available');

  console.log('\n>>> 清空购物车');
  viewModel.clearCart();

  view.destroy();
}

// ============================================================================
// 导出
// ============================================================================

// (已在上方使用 export class / export function 直接导出，此处无需重复导出)
