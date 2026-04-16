import { describe, it, expect } from 'vitest';
import {
  RAFScheduler,
  VirtualScroller,
  DOMBatcher,
  LayoutOptimizer,
  ImageOptimizer,
  demo
} from './rendering-optimization';

describe('rendering-optimization', () => {
  describe('RAFScheduler', () => {
    it('should add and execute tasks', (done) => {
      const scheduler = new RAFScheduler();
      let executed = false;
      scheduler.addTask(() => {
        executed = true;
      });
      setTimeout(() => {
        expect(executed).toBe(true);
        scheduler.clear();
        done();
      }, 50);
    });

    it('should clear pending tasks', () => {
      const scheduler = new RAFScheduler();
      scheduler.addTask(() => {});
      scheduler.clear();
      expect(scheduler['tasks'].length).toBe(0);
    });
  });

  describe('VirtualScroller', () => {
    it('should calculate visible range', () => {
      const scroller = new VirtualScroller({
        itemHeight: 50,
        containerHeight: 400,
        totalItems: 1000,
        overscan: 5
      });
      const state = scroller.updateScroll(500);
      expect(state.startIndex).toBeGreaterThanOrEqual(0);
      expect(state.endIndex).toBeLessThan(1000);
      expect(state.totalHeight).toBe(50000);
      expect(state.visibleItems).toBe(8);
    });

    it('should estimate scroll position', () => {
      const scroller = new VirtualScroller({
        itemHeight: 50,
        containerHeight: 400,
        totalItems: 100
      });
      expect(scroller.estimateScrollPosition(10)).toBe(500);
    });

    it('should return item style', () => {
      const scroller = new VirtualScroller({
        itemHeight: 50,
        containerHeight: 400,
        totalItems: 100
      });
      const style = scroller.getItemStyle(5);
      expect(style.height).toBe('50px');
      expect(style.transform).toBe('translateY(250px)');
    });
  });

  describe('DOMBatcher', () => {
    it('should batch operations without error', (done) => {
      const batcher = new DOMBatcher();
      let called = 0;
      batcher.add(() => called++);
      batcher.add(() => called++);
      setTimeout(() => {
        expect(called).toBe(2);
        done();
      }, 50);
    });

    it('should create batch appender', () => {
      const batcher = new DOMBatcher();
      const mockParent = document.createElement('div');
      const { append, commit } = batcher.createBatchAppender(mockParent);
      append(document.createElement('span'));
      expect(() => commit()).not.toThrow();
    });
  });

  describe('LayoutOptimizer', () => {
    it('should schedule read and write queues', (done) => {
      const optimizer = new LayoutOptimizer();
      let readDone = false;
      let writeDone = false;
      optimizer.read(() => { readDone = true; });
      optimizer.write(() => { writeDone = true; });
      setTimeout(() => {
        expect(readDone).toBe(true);
        expect(writeDone).toBe(true);
        done();
      }, 50);
    });

    it('should batch styles', () => {
      const optimizer = new LayoutOptimizer();
      const el = document.createElement('div');
      optimizer.batchStyles(el, { color: 'red', fontSize: '16px' } as Partial<CSSStyleDeclaration>);
      expect(el.style.cssText).toContain('color: red');
    });
  });

  describe('ImageOptimizer', () => {
    it('should setup lazy image without error', () => {
      const optimizer = new ImageOptimizer();
      const img = document.createElement('img');
      expect(() => optimizer.setupLazyImage(img, 'https://example.com/img.png')).not.toThrow();
    });

    it('should generate srcset', () => {
      const optimizer = new ImageOptimizer();
      const srcset = optimizer.generateSrcSet('https://example.com/img.png', [320, 640, 1024]);
      expect(srcset).toContain('320w');
      expect(srcset).toContain('640w');
      expect(srcset).toContain('1024w');
    });

    it('should disconnect without error', () => {
      const optimizer = new ImageOptimizer();
      expect(() => optimizer.disconnect()).not.toThrow();
    });
  });

  describe('demo', () => {
    it('should run without errors', () => {
      expect(() => demo()).not.toThrow();
    });
  });
});
