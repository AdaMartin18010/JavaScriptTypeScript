<script>
  import { createCart } from './lib/cart.svelte.ts';
  import { products } from './lib/products.ts';

  const cart = createCart();

  let selectedCategory = $state('');
  let priceRange = $state([0, 200]);
  let discountInput = $state('');

  let categories = $derived(
    [...new Set(products.map(p => p.category))]
  );

  let filteredProducts = $derived.by(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return result;
  });

  function applyDiscount() {
    cart.applyCode(discountInput.toUpperCase());
  }
</script>

<div class="app">
  <header>
    <h1>🛒 Shopping Cart</h1>
    <div class="cart-summary">
      <span>{cart.itemCount} items</span>
      <span class="total">${cart.total.toFixed(2)}</span>
    </div>
  </header>

  <div class="layout">
    <aside class="filters">
      <h3>Filters</h3>
      
      <div class="filter-group">
        <label>Category</label>
        <select bind:value={selectedCategory}>
          <option value="">All</option>
          {#each categories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label>Max Price: ${priceRange[1]}</label>
        <input type="range" bind:value={priceRange[1]} min="0" max="200" />
      </div>
    </aside>

    <main class="products">
      <div class="product-grid">
        {#each filteredProducts as product (product.id)}
          <div class="product-card">
            <div class="product-image">{product.image}</div>
            <h4>{product.name}</h4>
            <p class="price">${product.price.toFixed(2)}</p>
            <p class="stock">{product.stock} in stock</p>
            <button
              onclick={() => cart.add(product)}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        {/each}
      </div>
    </main>

    <aside class="cart-panel">
      <h3>Your Cart</h3>
      
      {#if cart.items.length === 0}
        <p class="empty">Cart is empty</p>
      {:else}
        <ul class="cart-items">
          {#each cart.items as item (item.product.id)}
            <li>
              <span>{item.product.image} {item.product.name}</span>
              <div class="qty-controls">
                <button onclick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onclick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                <button class="remove" onclick={() => cart.remove(item.product.id)}>×</button>
              </div>
            </li>
          {/each}
        </ul>

        <div class="cart-actions">
          <button onclick={cart.undo} disabled={!cart.canUndo}>↩ Undo</button>
          <button onclick={cart.redo} disabled={!cart.canRedo}>↪ Redo</button>
          <button onclick={cart.clear}>Clear</button>
        </div>

        <div class="discount">
          <input bind:value={discountInput} placeholder="Discount code" />
          <button onclick={applyDiscount}>Apply</button>
        </div>

        <div class="totals">
          <p>Subtotal: ${cart.subtotal.toFixed(2)}</p>
          {#if cart.discount > 0}
            <p class="discount-amount">Discount: -${cart.discount.toFixed(2)}</p>
          {/if}
          <p>Tax: ${cart.tax.toFixed(2)}</p>
          <p class="grand-total">Total: ${cart.total.toFixed(2)}</p>
        </div>
      {/if}
    </aside>
  </div>
</div>

<style>
  .app { max-width: 1200px; margin: 0 auto; padding: 1rem; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #ff3e00; }
  h1 { color: #ff3e00; margin: 0; }
  .cart-summary { display: flex; gap: 1rem; align-items: center; }
  .total { font-size: 1.5rem; font-weight: bold; color: #ff3e00; }

  .layout { display: grid; grid-template-columns: 200px 1fr 300px; gap: 2rem; }
  @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }

  .filters { background: #f8f8f8; padding: 1rem; border-radius: 8px; height: fit-content; }
  .filter-group { margin-bottom: 1rem; }
  .filter-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
  select, input[type="range"] { width: 100%; }

  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
  .product-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center; }
  .product-image { font-size: 3rem; margin-bottom: 0.5rem; }
  .product-card h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
  .price { font-weight: bold; color: #ff3e00; margin: 0; }
  .stock { font-size: 0.8rem; color: #666; margin: 0 0 0.5rem; }
  .product-card button { width: 100%; padding: 0.5rem; border: none; border-radius: 4px; background: #ff3e00; color: white; cursor: pointer; }
  .product-card button:disabled { background: #ccc; cursor: not-allowed; }

  .cart-panel { background: #f8f8f8; padding: 1rem; border-radius: 8px; height: fit-content; }
  .cart-panel h3 { margin-top: 0; }
  .empty { color: #999; font-style: italic; }
  .cart-items { list-style: none; padding: 0; }
  .cart-items li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #ddd; font-size: 0.85rem; }
  .qty-controls { display: flex; align-items: center; gap: 0.25rem; }
  .qty-controls button { padding: 0.1rem 0.4rem; border: none; border-radius: 3px; background: #ddd; cursor: pointer; }
  .qty-controls .remove { background: #ef4444; color: white; }

  .cart-actions { display: flex; gap: 0.5rem; margin: 1rem 0; }
  .cart-actions button { flex: 1; padding: 0.4rem; border: none; border-radius: 4px; background: #ddd; cursor: pointer; font-size: 0.8rem; }
  .cart-actions button:disabled { opacity: 0.5; }

  .discount { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .discount input { flex: 1; padding: 0.4rem; }
  .discount button { padding: 0.4rem 0.8rem; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer; }

  .totals p { margin: 0.25rem 0; }
  .discount-amount { color: #22c55e; }
  .grand-total { font-size: 1.2rem; font-weight: bold; color: #ff3e00; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #ddd; }
</style>
