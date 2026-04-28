/**
 * @file 租户上下文管理器
 * @category Multi-Tenancy → Context
 * @difficulty medium
 * @tags multi-tenancy, async-context, tenant-isolation
 *
 * @description
 * 基于 AsyncLocalStorage 的租户上下文管理器，实现请求级别的租户信息隔离。
 * 确保在多并发请求场景下，每个异步调用链都能正确访问属于自己的租户上下文。
 */

import { AsyncLocalStorage } from 'node:async_hooks';

/** 租户上下文信息 */
export interface TenantContext {
  /** 租户唯一标识 */
  tenantId: string;
  /** 当前用户标识（可选） */
  userId?: string;
  /** 权限列表 */
  permissions: string[];
  /** 扩展元数据 */
  metadata: Record<string, unknown>;
}

/** 租户上下文管理器 */
export class TenantContextManager {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  /**
   * 在当前异步上下文中运行回调，并绑定租户上下文
   * @param context - 要绑定的租户上下文
   * @param callback - 在上下文中执行的回调函数
   * @returns 回调函数的返回值
   */
  runWithContext<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * 获取当前异步上下文中的租户信息
   * @returns 当前租户上下文，若不存在则返回 undefined
   */
  getCurrentContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  /**
   * 获取当前租户 ID
   * @returns 当前租户 ID，若上下文不存在则返回 undefined
   */
  getCurrentTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  /**
   * 检查当前上下文是否具有指定权限
   * @param permission - 要检查的权限标识
   * @returns 是否具有该权限
   */
  hasPermission(permission: string): boolean {
    const context = this.storage.getStore();
    return context?.permissions.includes(permission) ?? false;
  }

  /**
   * 设置当前上下文的元数据
   * @param key - 元数据键
   * @param value - 元数据值
   */
  setMetadata(key: string, value: unknown): void {
    const context = this.storage.getStore();
    if (context) {
      context.metadata[key] = value;
    }
  }

  /**
   * 获取当前上下文的元数据
   * @param key - 元数据键
   * @returns 元数据值，若不存在则返回 undefined
   */
  getMetadata(key: string): unknown {
    return this.storage.getStore()?.metadata[key];
  }
}

/** 全局租户上下文管理器实例 */
export const tenantContextManager = new TenantContextManager();
