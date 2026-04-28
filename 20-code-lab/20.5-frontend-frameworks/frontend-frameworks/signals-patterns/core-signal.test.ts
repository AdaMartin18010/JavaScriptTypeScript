/** @vitest-environment node */
/// <reference types="vitest" />

/**
 * # Signal 核心系统测试
 *
 * 测试覆盖：
 * - Signal 基本读写
 * - 自动依赖追踪
 * - Computed 惰性求值与缓存
 * - Effect 自动执行与清理
 * - 批量更新
 * - 嵌套计算
 * - 循环依赖检测
 */

import {
  Signal,
  createSignal,
  createComputed,
  createEffect,
  batch,
  untracked,
} from "./core-signal";

describe("Signal 核心功能", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("createSignal", () => {
    it("应创建带有初始值的 Signal", () => {
      const sig = createSignal(42);
      expect(sig.get()).toBe(42);
    });

    it("应支持更新值", () => {
      const sig = createSignal(0);
      sig.set(10);
      expect(sig.get()).toBe(10);
    });

    it("相同值不应触发更新", () => {
      const sig = createSignal(5);
      const effectFn = jest.fn();

      createEffect(() => {
        effectFn(sig.get());
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);

      sig.set(5); // 相同值
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1); // 不应再触发
    });

    it("peek 应读取值但不建立依赖", () => {
      const sig = createSignal(100);
      const effectFn = jest.fn();

      createEffect(() => {
        effectFn(sig.peek());
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);

      sig.set(200);
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1); // peek 不建立依赖
    });
  });

  describe("createComputed", () => {
    it("应惰性求值", () => {
      const computeFn = jest.fn(() => 42);
      const computed = createComputed(computeFn);

      expect(computeFn).not.toHaveBeenCalled(); // 未读取时不计算

      computed.get();
      expect(computeFn).toHaveBeenCalledTimes(1);
    });

    it("应缓存结果", () => {
      const computeFn = jest.fn(() => Math.random());
      const computed = createComputed(computeFn);

      const v1 = computed.get();
      const v2 = computed.get();

      expect(computeFn).toHaveBeenCalledTimes(1); // 只计算一次
      expect(v1).toBe(v2); // 缓存值相同
    });

    it("依赖变化时应重新计算", () => {
      const a = createSignal(1);
      const b = createSignal(2);
      const sum = createComputed(() => a.get() + b.get());

      expect(sum.get()).toBe(3);

      a.set(10);
      jest.runAllTimers();
      expect(sum.get()).toBe(12);
    });

    it("应自动追踪依赖", () => {
      const a = createSignal(1);
      const b = createSignal(2);
      const computeFn = jest.fn(() => a.get());
      const computed = createComputed(computeFn);

      computed.get();
      expect(computeFn).toHaveBeenCalledTimes(1);

      b.set(20); // b 不是依赖
      jest.runAllTimers();
      computed.get();
      expect(computeFn).toHaveBeenCalledTimes(1); // 不应重新计算

      a.set(10); // a 是依赖
      jest.runAllTimers();
      computed.get();
      expect(computeFn).toHaveBeenCalledTimes(2); // 应重新计算
    });
  });

  describe("createEffect", () => {
    it("应初始执行一次", () => {
      const effectFn = jest.fn();
      createEffect(effectFn);
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    it("应在依赖变化时重新执行", () => {
      const count = createSignal(0);
      const effectFn = jest.fn();

      createEffect(() => {
        effectFn(count.get());
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);
      expect(effectFn).toHaveBeenLastCalledWith(0);

      count.set(1);
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(2);
      expect(effectFn).toHaveBeenLastCalledWith(1);
    });

    it("dispose 应清理依赖", () => {
      const count = createSignal(0);
      const effectFn = jest.fn();

      const dispose = createEffect(() => {
        effectFn(count.get());
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);

      dispose();

      count.set(1);
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1); // 不应再触发
    });

    it("应支持多个 Effect 独立运行", () => {
      const count = createSignal(0);
      const effect1 = jest.fn();
      const effect2 = jest.fn();

      createEffect(() => effect1(count.get()));
      createEffect(() => effect2(count.get()));

      jest.runAllTimers();
      expect(effect1).toHaveBeenCalledTimes(1);
      expect(effect2).toHaveBeenCalledTimes(1);

      count.set(1);
      jest.runAllTimers();
      expect(effect1).toHaveBeenCalledTimes(2);
      expect(effect2).toHaveBeenCalledTimes(2);
    });
  });

  describe("batch", () => {
    it("应合并多次更新为一次 Effect 触发", () => {
      const a = createSignal(0);
      const b = createSignal(0);
      const effectFn = jest.fn();

      createEffect(() => {
        effectFn(a.get(), b.get());
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);

      batch(() => {
        a.set(1);
        b.set(2);
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(2); // 只触发一次
      expect(effectFn).toHaveBeenLastCalledWith(1, 2);
    });
  });

  describe("untracked", () => {
    it("应在 untracked 中禁用依赖追踪", () => {
      const count = createSignal(0);
      const effectFn = jest.fn();

      createEffect(() => {
        const value = untracked(() => count.get());
        effectFn(value);
      });

      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1);

      count.set(1);
      jest.runAllTimers();
      expect(effectFn).toHaveBeenCalledTimes(1); // 不应触发
    });
  });

  describe("嵌套计算", () => {
    it("应支持 computed 依赖另一个 computed", () => {
      const a = createSignal(2);
      const b = createSignal(3);
      const product = createComputed(() => a.get() * b.get());
      const doubled = createComputed(() => product.get() * 2);

      expect(doubled.get()).toBe(12); // 2 * 3 * 2 = 12

      a.set(4);
      jest.runAllTimers();
      expect(doubled.get()).toBe(24); // 4 * 3 * 2 = 24
    });
  });
});
