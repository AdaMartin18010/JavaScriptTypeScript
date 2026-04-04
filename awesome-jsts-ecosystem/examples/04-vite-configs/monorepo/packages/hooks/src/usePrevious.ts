import { useRef, useEffect } from 'react';

/**
 * 获取上一次的值
 * @param value - 当前值
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
