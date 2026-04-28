/**
 * 本地存储 Hook
 * 封装 localStorage 操作，支持 JSON 序列化、默认值和类型安全
 */
import { useState, useEffect, useCallback } from "react";

/**
 * 使用本地存储的 Hook
 * @param key 存储键名
 * @param initialValue 默认值
 * @returns 当前值、设置值函数和删除值函数
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 读取初始值：优先从 localStorage 读取，否则使用默认值
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(`[useLocalStorage] 读取键 "${key}" 失败:`, error);
    }
    return initialValue;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 监听其他标签页的 storage 变化
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // 忽略解析错误
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  /**
   * 设置新值并同步到 localStorage
   * 支持直接值或函数式更新
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`[useLocalStorage] 写入键 "${key}" 失败:`, error);
      }
    },
    [key, storedValue]
  );

  /** 删除该键对应的 localStorage 条目 */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`[useLocalStorage] 删除键 "${key}" 失败:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
