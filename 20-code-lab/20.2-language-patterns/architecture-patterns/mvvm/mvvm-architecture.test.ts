import { describe, it, expect } from 'vitest';
import { ref, computed, ProductModel, ProductViewModel, watchEffect } from './mvvm-architecture.js';

describe('MVVM architecture', () => {
  it('ref should be reactive', () => {
    const count = ref(0);
    let effectCount = 0;
    watchEffect(() => {
      effectCount++;
      count.value;
    });
    expect(effectCount).toBe(1);
    count.value = 5;
    expect(effectCount).toBe(2);
  });

  it('computed should derive value from ref', () => {
    const a = ref(2);
    const doubled = computed(() => a.value * 2);
    expect(doubled.value).toBe(4);
    a.value = 5;
    expect(doubled.value).toBe(10);
  });

  it('ProductModel should manage products', () => {
    const model = new ProductModel();
    expect(model.getAllProducts().length).toBe(4);
    expect(model.getProductById('1')?.name).toBe('笔记本电脑');
    expect(model.updateStock('3', true)).toBe(true);
    expect(model.getProductById('3')?.inStock).toBe(true);
  });

  it('ProductViewModel should filter products by search query', () => {
    const vm = new ProductViewModel(new ProductModel());
    expect(vm.filteredProducts.value.length).toBe(4);
    vm.setSearchQuery('鼠标');
    expect(vm.filteredProducts.value.length).toBe(1);
    expect(vm.filteredProducts.value[0].name).toBe('无线鼠标');
  });

  it('ProductViewModel should filter products by category', () => {
    const vm = new ProductViewModel(new ProductModel());
    vm.setCategory('available');
    expect(vm.filteredProducts.value.every((p) => p.inStock)).toBe(true);
    vm.setCategory('unavailable');
    expect(vm.filteredProducts.value.every((p) => !p.inStock)).toBe(true);
  });

  it('ProductViewModel should manage cart operations', () => {
    const vm = new ProductViewModel(new ProductModel());
    vm.addToCart('1');
    vm.addToCart('1');
    vm.addToCart('2');
    expect(vm.cartItemCount.value).toBe(3);
    expect(vm.cartTotalPrice.value).toBe(5999 * 2 + 99);
    vm.removeFromCart('1');
    expect(vm.cartItemCount.value).toBe(1);
    vm.clearCart();
    expect(vm.cartItemCount.value).toBe(0);
  });
});
