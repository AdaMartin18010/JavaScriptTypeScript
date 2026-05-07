import type { Product } from './cart.svelte.ts';

export const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 15, image: '🎧' },
  { id: 2, name: 'Cotton T-Shirt', price: 24.99, category: 'clothing', stock: 50, image: '👕' },
  { id: 3, name: 'Organic Coffee Beans', price: 14.99, category: 'food', stock: 30, image: '☕' },
  { id: 4, name: 'Smart Watch', price: 199.99, category: 'electronics', stock: 8, image: '⌚' },
  { id: 5, name: 'Denim Jacket', price: 89.99, category: 'clothing', stock: 20, image: '🧥' },
  { id: 6, name: 'Dark Chocolate Bar', price: 4.99, category: 'food', stock: 100, image: '🍫' },
  { id: 7, name: 'Bluetooth Speaker', price: 49.99, category: 'electronics', stock: 12, image: '🔊' },
  { id: 8, name: 'Running Shoes', price: 119.99, category: 'clothing', stock: 18, image: '👟' },
  { id: 9, name: 'Green Tea Set', price: 29.99, category: 'food', stock: 25, image: '🍵' },
  { id: 10, name: 'USB-C Hub', price: 39.99, category: 'electronics', stock: 40, image: '🔌' },
];
