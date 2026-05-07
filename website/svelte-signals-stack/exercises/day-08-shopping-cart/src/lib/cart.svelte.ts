/**
 * Shopping Cart State Management
 * 
 * Demonstrates:
 * - .svelte.ts for shared reactive logic
 * - $state, $derived for reactive state
 * - $state.snapshot for undo/redo
 * - Structured state updates
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'electronics' | 'clothing' | 'food';
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export function createCart() {
  // Reactive state
  let items = $state<CartItem[]>([]);
  let discountCode = $state<string>('');
  
  // History for undo/redo
  let history = $state<CartItem[][]>([]);
  let historyIndex = $state(-1);

  // Derived values
  let itemCount = $derived(
    items.reduce((sum, item) => sum + item.quantity, 0)
  );

  let subtotal = $derived(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  let discount = $derived.by(() => {
    if (discountCode === 'SAVE10') return subtotal * 0.10;
    if (discountCode === 'SHIPFREE' && subtotal > 50) return 5;
    return 0;
  });

  let tax = $derived((subtotal - discount) * 0.08);
  let total = $derived(subtotal - discount + tax);

  // Actions
  function saveHistory() {
    history = [...history.slice(0, historyIndex + 1), $state.snapshot(items)];
    historyIndex++;
  }

  function add(product: Product) {
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        saveHistory();
        existing.quantity++;
      }
    } else {
      saveHistory();
      items = [...items, { product, quantity: 1 }];
    }
  }

  function remove(productId: number) {
    saveHistory();
    items = items.filter(i => i.product.id !== productId);
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.find(i => i.product.id === productId);
    if (!item) return;
    
    if (quantity <= 0) {
      remove(productId);
    } else if (quantity <= item.product.stock) {
      saveHistory();
      item.quantity = quantity;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      items = structuredClone(history[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      items = structuredClone(history[historyIndex]);
    }
  }

  function clear() {
    saveHistory();
    items = [];
    discountCode = '';
  }

  function applyCode(code: string) {
    discountCode = code;
  }

  // Persistence
  $effect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  });

  // Load from localStorage
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      items = JSON.parse(saved);
      history = [$state.snapshot(items)];
      historyIndex = 0;
    } catch { /* ignore */ }
  }

  return {
    get items() { return items; },
    get itemCount() { return itemCount; },
    get subtotal() { return subtotal; },
    get discount() { return discount; },
    get tax() { return tax; },
    get total() { return total; },
    get discountCode() { return discountCode; },
    get canUndo() { return historyIndex > 0; },
    get canRedo() { return historyIndex < history.length - 1; },
    add,
    remove,
    updateQuantity,
    undo,
    redo,
    clear,
    applyCode,
  };
}
