/**
 * useDebounce Hook 单元测试
 * 验证防抖逻辑的正确性
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('应在初始时立即返回传入值', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('应在延迟后更新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 300 },
      }
    );

    // 更新值
    rerender({ value: 'second', delay: 300 });

    // 延迟前应保持旧值
    expect(result.current).toBe('first');

    // 快进时间
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 延迟后应更新为新值
    expect(result.current).toBe('second');
  });

  it('在延迟期内多次更新应只保留最后一次', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'a' },
      }
    );

    rerender({ value: 'b' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'c' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'd' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // 仍应为初始值，因为 300ms 尚未过去
    expect(result.current).toBe('a');

    // 再快进 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 最终应为最后一次输入
    expect(result.current).toBe('d');
  });

  it('使用默认延迟 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'x' },
      }
    );

    rerender({ value: 'y' });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('x');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('y');
  });
});
