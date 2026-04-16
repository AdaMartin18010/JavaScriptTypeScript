import { describe, it, expect, vi } from 'vitest';
import {
  RealImage,
  ProxyImage,
  RealDocument,
  ProtectedDocumentProxy,
  RealCalculator,
  CachedCalculatorProxy,
  createLoggingProxy,
  RemoteServiceProxy
} from './proxy.js';

describe('proxy pattern', () => {
  it('ProxyImage should lazy load RealImage', () => {
    const proxy = new ProxyImage('photo.jpg');
    expect(proxy.getFileName()).toBe('photo.jpg');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    proxy.display();
    expect(consoleSpy).toHaveBeenCalledWith('Loading image: photo.jpg');
    expect(consoleSpy).toHaveBeenCalledWith('Displaying image: photo.jpg');

    // Second display should reuse loaded image
    consoleSpy.mockClear();
    proxy.display();
    expect(consoleSpy).not.toHaveBeenCalledWith('Loading image: photo.jpg');
    expect(consoleSpy).toHaveBeenCalledWith('Displaying image: photo.jpg');

    consoleSpy.mockRestore();
  });

  it('ProtectedDocumentProxy should restrict viewer access', () => {
    const doc = new RealDocument('secret.txt', 'Top secret');
    const viewerDoc = new ProtectedDocumentProxy(doc, 'viewer');

    expect(viewerDoc.view()).toBe('Top secret');
    expect(() => viewerDoc.edit('new content')).toThrow('Viewers cannot edit documents');
    expect(() => viewerDoc.delete()).toThrow('Only admins can delete documents');
  });

  it('ProtectedDocumentProxy should allow editor to edit but not delete', () => {
    const doc = new RealDocument('doc.txt', 'Content');
    const editorDoc = new ProtectedDocumentProxy(doc, 'editor');

    expect(() => editorDoc.edit('updated')).not.toThrow();
    expect(() => editorDoc.delete()).toThrow('Only admins can delete documents');
  });

  it('ProtectedDocumentProxy should allow admin full access', () => {
    const doc = new RealDocument('doc.txt', 'Content');
    const adminDoc = new ProtectedDocumentProxy(doc, 'admin');

    expect(() => adminDoc.edit('updated')).not.toThrow();
    expect(() => adminDoc.delete()).not.toThrow();
  });

  it('CachedCalculatorProxy should cache fibonacci results', () => {
    const realCalc = new RealCalculator();
    const cached = new CachedCalculatorProxy(realCalc);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result1 = cached.fibonacci(10);
    const result2 = cached.fibonacci(10);

    expect(result1).toBe(result2);
    expect(consoleSpy).toHaveBeenCalledWith('Cache hit for fib-10');

    consoleSpy.mockRestore();
  });

  it('CachedCalculatorProxy should cache factorial results', () => {
    const realCalc = new RealCalculator();
    const cached = new CachedCalculatorProxy(realCalc);

    expect(cached.factorial(5)).toBe(120);
    expect(cached.factorial(5)).toBe(120);
  });

  it('createLoggingProxy should log method calls', () => {
    const target = { add: (a: number, b: number) => a + b };
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const proxy = createLoggingProxy(target, 'Calculator');

    expect(proxy.add(2, 3)).toBe(5);
    expect(consoleSpy).toHaveBeenCalledWith('[Calculator.add] called with:', [2, 3]);
    expect(consoleSpy).toHaveBeenCalledWith('[Calculator.add] returned:', 5);

    consoleSpy.mockRestore();
  });

  it('RemoteServiceProxy should return mock data', async () => {
    const proxy = new RemoteServiceProxy('https://api.example.com');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const data = await proxy.fetchData('123');
    expect(data).toEqual({ id: '123', data: 'remote data' });
    expect(consoleSpy).toHaveBeenCalledWith('Proxy: Fetching data from https://api.example.com for id 123');

    consoleSpy.mockRestore();
  });
});
