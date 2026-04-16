import { describe, it, expect, vi } from 'vitest';
import {
  ComputerFacade,
  ECommerceFacade,
  DOMFacade
} from './facade.js';

describe('facade pattern', () => {
  it('ComputerFacade should start and shutdown computer', () => {
    const computer = new ComputerFacade();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    computer.start();
    expect(consoleSpy).toHaveBeenCalledWith('=== Starting Computer ===');
    expect(consoleSpy).toHaveBeenCalledWith('CPU: Freezing processor');
    expect(consoleSpy).toHaveBeenCalledWith('=== Computer Started ===\n');

    computer.shutdown();
    expect(consoleSpy).toHaveBeenCalledWith('PowerSupply: Turning off');
    expect(consoleSpy).toHaveBeenCalledWith('=== Computer Off ===\n');

    consoleSpy.mockRestore();
  });

  it('ECommerceFacade should place order successfully', () => {
    const ecommerce = new ECommerceFacade();
    const result = ecommerce.placeOrder(
      'user123',
      'user@example.com',
      ['Product A', 'Product B'],
      99.99,
      '123 Main St'
    );

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('order-123');
    expect(result.trackingId).toBe('tracking-456');
  });

  it('ECommerceFacade should handle zero or negative amount', () => {
    // PaymentService returns true regardless in this implementation,
    // but let's verify it still runs without error
    const ecommerce = new ECommerceFacade();
    const result = ecommerce.placeOrder(
      'user123',
      'user@example.com',
      ['Product A'],
      0,
      '123 Main St'
    );

    expect(result.success).toBe(true);
  });

  it('DOMFacade should create element with attributes', () => {
    // Mock minimal document for node environment
    const mockElement = {
      tagName: 'DIV',
      attributes: {} as Record<string, string>,
      classList: { contains: (c: string) => mockElement.classList.classes.has(c), classes: new Set<string>() },
      setAttribute(key: string, value: string) { this.attributes[key] = value; },
      getAttribute(key: string) { return this.attributes[key]; },
      addEventListener() {}
    };
    const originalDocument = (globalThis as unknown as { document?: object }).document;
    (globalThis as unknown as { document: object }).document = {
      createElement: () => ({ ...mockElement }),
      querySelector: () => null,
      querySelectorAll: () => []
    };

    const el = DOMFacade.create('div', { id: 'test', class: 'container' });
    expect((el as unknown as typeof mockElement).tagName).toBe('DIV');
    expect((el as unknown as typeof mockElement).getAttribute('id')).toBe('test');
    expect((el as unknown as typeof mockElement).getAttribute('class')).toBe('container');

    // Restore
    (globalThis as unknown as { document?: object }).document = originalDocument;
  });

  it('DOMFacade should add and remove classes', () => {
    const mockElement = {
      tagName: 'DIV',
      attributes: {} as Record<string, string>,
      classList: { classes: new Set<string>(), add(c: string) { this.classes.add(c); }, remove(c: string) { this.classes.delete(c); }, contains(c: string) { return this.classes.has(c); } },
      setAttribute() {},
      getAttribute() { return ''; },
      addEventListener() {}
    };
    const originalDocument = (globalThis as unknown as { document?: object }).document;
    (globalThis as unknown as { document: object }).document = {
      createElement: () => mockElement,
      querySelector: () => null,
      querySelectorAll: () => []
    };

    const el = DOMFacade.create('div') as unknown as typeof mockElement;
    DOMFacade.addClass(el as unknown as HTMLElement, 'active');
    expect(el.classList.contains('active')).toBe(true);

    DOMFacade.removeClass(el as unknown as HTMLElement, 'active');
    expect(el.classList.contains('active')).toBe(false);

    (globalThis as unknown as { document?: object }).document = originalDocument;
  });

  it('DOMFacade selectAll should return array of elements', () => {
    const mockElements = [{ id: 'a' }, { id: 'b' }];
    const originalDocument = (globalThis as unknown as { document?: object }).document;
    (globalThis as unknown as { document: object }).document = {
      createElement: () => ({ setAttribute() {}, classList: { add() {}, remove() {} }, addEventListener() {} }),
      querySelector: () => null,
      querySelectorAll: () => mockElements
    };

    const items = DOMFacade.selectAll('.item');
    expect(items.length).toBe(2);

    (globalThis as unknown as { document?: object }).document = originalDocument;
  });
});
