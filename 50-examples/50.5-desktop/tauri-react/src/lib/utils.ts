/**
 * 通用工具函数
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，再用 tailwind-merge 解决冲突
 * @param inputs 任意数量的类名值
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化文件大小为人类可读字符串
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 如 "1.5 MB"
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * 格式化时间戳为本地字符串
 * @param timestamp Unix 时间戳（毫秒）
 * @returns 本地化日期时间字符串
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("zh-CN");
}

/**
 * 防抖函数
 * @param fn 待执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
