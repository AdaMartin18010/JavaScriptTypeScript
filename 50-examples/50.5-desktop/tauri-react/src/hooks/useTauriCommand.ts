/**
 * 调用 Tauri 后端命令的自定义 Hook
 * 封装 invoke 调用，提供加载状态、错误处理和类型安全
 */
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

/** Hook 返回类型 */
interface UseTauriCommandResult<T> {
  /** 调用函数 */
  execute: (...args: unknown[]) => Promise<T | undefined>;
  /** 响应数据 */
  data: T | undefined;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 使用 Tauri 命令的 Hook
 * @param command 命令名称（对应 Rust 后端的 #[tauri::command] 函数名）
 * @returns 包含执行函数、数据、加载状态、错误和重置方法的 Hook 结果
 */
export function useTauriCommand<T>(command: string): UseTauriCommandResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 执行 Tauri 命令
   * @param args 命令参数，以对象形式传递
   */
  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      try {
        // 将参数合并为单一对象（Tauri invoke 的参数格式）
        const payload =
          args.length === 1 && typeof args[0] === "object" && args[0] !== null
            ? args[0]
            : {};
        const result = await invoke<T>(command, payload as Record<string, unknown>);
        setData(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [command]
  );

  /** 重置所有状态 */
  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    setError(null);
  }, []);

  return { execute, data, loading, error, reset };
}
