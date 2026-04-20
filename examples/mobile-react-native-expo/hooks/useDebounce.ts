/**
 * 防抖 Hook
 * 用于延迟响应频繁变化的状态（如搜索输入）
 */

import { useState, useEffect, useRef } from 'react';

/**
 * 对输入值进行防抖处理
 * @param value - 需要防抖的原始值
 * @param delay - 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的值
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * // 仅在用户停止输入 500ms 后触发
 * useEffect(() => {
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 清除上一次的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器，延迟更新值
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 组件卸载时清理定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
