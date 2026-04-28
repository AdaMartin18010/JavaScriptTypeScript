/**
 * 全局 TypeScript 类型定义
 */

/** 文件系统条目类型 */
export interface FsEntry {
  /** 条目名称 */
  name: string;
  /** 是否为目录 */
  isDirectory: boolean;
  /** 文件大小（字节），目录为 0 */
  size: number;
  /** 最后修改时间戳 */
  modifiedAt: number;
}

/** 系统信息数据类型 */
export interface SystemInfoData {
  /** 操作系统类型 */
  platform: string;
  /** 操作系统版本 */
  version: string;
  /** 主机名 */
  hostname: string;
  /** 系统架构 */
  arch: string;
  /** CPU 核心数 */
  cpuCores: number;
  /** 总内存（MB） */
  totalMemory: number;
  /** Tauri 应用版本 */
  appVersion: string;
}

/** Tauri 命令响应包装类型 */
export interface CommandResult<T> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
}

/** 侧边栏导航项类型 */
export interface NavItem {
  /** 唯一标识 */
  id: string;
  /** 显示文本 */
  label: string;
  /** 图标名称（lucide） */
  icon: string;
}

/** 主题类型 */
export type Theme = "light" | "dark" | "system";
