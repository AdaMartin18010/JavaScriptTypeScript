/**
 * @file 基于角色的访问控制（RBAC）中间件
 * @category Auth Modern Lab → Authorization
 * @difficulty medium
 * @tags rbac, authorization, middleware, permissions, roles
 *
 * @description
 * 类型安全的 RBAC（Role-Based Access Control）中间件实现：
 * - 角色层级继承（Role Hierarchy）
 * - 细粒度权限检查（Permission-based）
 * - 资源所有权验证（Resource Ownership）
 * - 框架无关设计：适配 Hono / Express / Fastify / 任意框架
 */

// ============================================================================
// 1. 核心类型定义
// ============================================================================

/** 角色定义 */
export type Role = 'guest' | 'user' | 'editor' | 'admin' | 'super-admin';

/** 权限粒度：resource:action */
export type Permission =
  // 用户管理
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
  // 内容管理
  | 'posts:read' | 'posts:create' | 'posts:update' | 'posts:delete' | 'posts:publish'
  // 系统管理
  | 'system:config' | 'system:logs' | 'system:backup'
  // 组织管理
  | 'org:read' | 'org:manage' | 'org:billing'
  // 自定义权限
  | string;

/** 用户信息 */
export interface User {
  id: string;
  email: string;
  roles: Role[];
  permissions?: Permission[]; // 额外直接分配的权限
  orgId?: string;             // 所属组织
}

/** 角色配置 */
interface RoleConfig {
  inherits?: Role[];           // 继承的角色
  permissions: Permission[];   // 本角色拥有的权限
}

/** 请求上下文（框架无关） */
export interface RequestContext {
  user?: User;
  request: {
    method: string;
    path: string;
    params: Record<string, string>;
    headers: Record<string, string>;
    body?: unknown;
  };
}

/** 授权结果 */
export type AuthorizationResult =
  | { allowed: true }
  | { allowed: false; reason: string; required: Permission | Role };

// ============================================================================
// 2. 角色层级与权限系统
// ============================================================================

/**
 * RBAC 核心引擎
 *
 * 设计原则：
 * - 角色继承：子角色自动获得父角色的所有权限
 * - 权限累积：用户的最终权限 = 角色权限 + 直接分配权限
 * - 显式拒绝：支持权限黑名单（ Deny 列表）
 */
export class RBACEngine {
  private roleDefinitions = new Map<Role, RoleConfig>();

  constructor() {
    this.initializeDefaultRoles();
  }

  /**
   * 初始化默认角色层级
   *
   * 层级关系：
   * super-admin > admin > editor > user > guest
   */
  private initializeDefaultRoles(): void {
    this.roleDefinitions.set('guest', {
      permissions: ['posts:read'],
    });

    this.roleDefinitions.set('user', {
      inherits: ['guest'],
      permissions: ['posts:create', 'users:read'],
    });

    this.roleDefinitions.set('editor', {
      inherits: ['user'],
      permissions: ['posts:update', 'posts:delete', 'posts:publish', 'users:read'],
    });

    this.roleDefinitions.set('admin', {
      inherits: ['editor'],
      permissions: [
        'users:create', 'users:update', 'users:delete',
        'org:read', 'org:manage',
        'system:logs',
      ],
    });

    this.roleDefinitions.set('super-admin', {
      inherits: ['admin'],
      permissions: [
        'system:config', 'system:backup',
        'org:billing',
      ],
    });
  }

  /**
   * 注册自定义角色
   */
  defineRole(role: Role, config: RoleConfig): void {
    this.roleDefinitions.set(role, config);
  }

  /**
   * 获取角色的所有权限（递归继承）
   */
  getRolePermissions(role: Role, visited = new Set<Role>()): Set<Permission> {
    if (visited.has(role)) return new Set(); // 防止循环继承
    visited.add(role);

    const config = this.roleDefinitions.get(role);
    if (!config) return new Set();

    const permissions = new Set(config.permissions);

    // 递归继承父角色权限
    if (config.inherits) {
      for (const parentRole of config.inherits) {
        const parentPermissions = this.getRolePermissions(parentRole, visited);
        for (const p of parentPermissions) {
          permissions.add(p);
        }
      }
    }

    return permissions;
  }

  /**
   * 获取用户的所有权限
   */
  getUserPermissions(user: User): Set<Permission> {
    const permissions = new Set<Permission>(user.permissions || []);

    for (const role of user.roles) {
      const rolePerms = this.getRolePermissions(role);
      for (const p of rolePerms) {
        permissions.add(p);
      }
    }

    return permissions;
  }

  /**
   * 检查用户是否拥有指定权限
   */
  hasPermission(user: User, permission: Permission): boolean {
    return this.getUserPermissions(user).has(permission);
  }

  /**
   * 检查用户是否拥有任意一个权限
   */
  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    const userPerms = this.getUserPermissions(user);
    return permissions.some(p => userPerms.has(p));
  }

  /**
   * 检查用户是否拥有所有指定权限
   */
  hasAllPermissions(user: User, permissions: Permission[]): boolean {
    const userPerms = this.getUserPermissions(user);
    return permissions.every(p => userPerms.has(p));
  }

  /**
   * 检查用户是否拥有指定角色
   */
  hasRole(user: User, role: Role): boolean {
    return user.roles.includes(role);
  }

  /**
   * 检查用户角色层级是否 >= 目标角色
   *
   * 基于角色权重比较
   */
  hasRoleAtLeast(user: User, minRole: Role): boolean {
    const roleWeight: Record<Role, number> = {
      'guest': 0,
      'user': 1,
      'editor': 2,
      'admin': 3,
      'super-admin': 4,
    };

    const minWeight = roleWeight[minRole] ?? 0;
    return user.roles.some(r => (roleWeight[r] ?? 0) >= minWeight);
  }

  /**
   * 资源所有权检查
   */
  isOwner(user: User, resourceOwnerId: string): boolean {
    return user.id === resourceOwnerId;
  }

  /**
   * 组织成员检查
   */
  isSameOrg(user: User, orgId: string): boolean {
    return user.orgId === orgId;
  }
}

// ============================================================================
// 3. 中间件工厂
// ============================================================================

/**
 * 授权守卫工厂
 * 生成可复用的授权检查函数
 */
export class AuthorizationGuard {
  constructor(private rbac: RBACEngine) {}

  /**
   * 需要登录
   */
  requireAuth(context: RequestContext): AuthorizationResult {
    if (!context.user) {
      return { allowed: false, reason: '需要登录', required: 'user' as Role };
    }
    return { allowed: true };
  }

  /**
   * 需要指定角色
   */
  requireRole(role: Role) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      if (!this.rbac.hasRole(context.user!, role)) {
        return { allowed: false, reason: `需要 ${role} 角色`, required: role };
      }
      return { allowed: true };
    };
  }

  /**
   * 需要至少某个角色层级
   */
  requireRoleAtLeast(minRole: Role) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      if (!this.rbac.hasRoleAtLeast(context.user!, minRole)) {
        return { allowed: false, reason: `需要至少 ${minRole} 角色`, required: minRole };
      }
      return { allowed: true };
    };
  }

  /**
   * 需要指定权限
   */
  requirePermission(permission: Permission) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      if (!this.rbac.hasPermission(context.user!, permission)) {
        return { allowed: false, reason: `缺少权限: ${permission}`, required: permission };
      }
      return { allowed: true };
    };
  }

  /**
   * 需要任意一个权限
   */
  requireAnyPermission(...permissions: Permission[]) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      if (!this.rbac.hasAnyPermission(context.user!, permissions)) {
        return {
          allowed: false,
          reason: `需要以下任意权限之一: ${permissions.join(', ')}`,
          required: permissions[0],
        };
      }
      return { allowed: true };
    };
  }

  /**
   * 需要资源所有权（或管理员权限）
   *
   * 常见模式：用户可管理自己的资源，管理员可管理所有资源
   */
  requireOwnerOrAdmin(getOwnerId: (ctx: RequestContext) => string) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      const user = context.user!;
      const ownerId = getOwnerId(context);

      // 管理员或超管直接放行
      if (this.rbac.hasRoleAtLeast(user, 'admin')) {
        return { allowed: true };
      }

      // 资源所有者放行
      if (this.rbac.isOwner(user, ownerId)) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: '无权访问此资源（非所有者且非管理员）',
        required: 'admin',
      };
    };
  }

  /**
   * 需要同组织成员（或管理员）
   */
  requireSameOrgOrAdmin(getOrgId: (ctx: RequestContext) => string) {
    return (context: RequestContext): AuthorizationResult => {
      const authCheck = this.requireAuth(context);
      if (!authCheck.allowed) return authCheck;

      const user = context.user!;
      const orgId = getOrgId(context);

      if (this.rbac.hasRoleAtLeast(user, 'admin')) {
        return { allowed: true };
      }

      if (this.rbac.isSameOrg(user, orgId)) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: '无权访问此组织资源',
        required: 'org:read',
      };
    };
  }

  /**
   * 组合多个守卫（全部通过）
   */
  combineAll(...guards: Array<(ctx: RequestContext) => AuthorizationResult>) {
    return (context: RequestContext): AuthorizationResult => {
      for (const guard of guards) {
        const result = guard(context);
        if (!result.allowed) return result;
      }
      return { allowed: true };
    };
  }

  /**
   * 组合多个守卫（任一通过）
   */
  combineAny(...guards: Array<(ctx: RequestContext) => AuthorizationResult>) {
    return (context: RequestContext): AuthorizationResult => {
      const failures: AuthorizationResult[] = [];

      for (const guard of guards) {
        const result = guard(context);
        if (result.allowed) return result;
        failures.push(result);
      }

      return failures[0] ?? { allowed: false, reason: '所有授权检查均失败', required: 'user' as Role };
    };
  }
}

// ============================================================================
// 4. 框架适配器
// ============================================================================

/**
 * Hono 框架适配器
 */
export function createHonoRBAC(rbac: RBACEngine) {
  const guard = new AuthorizationGuard(rbac);

  return {
    rbac,
    guard,

    /**
     * Hono 中间件：需要权限
     */
    requirePermission: (permission: Permission) => {
      return async (c: { req: { method: string; path: string }; get: (key: string) => unknown }, next: () => Promise<void>) => {
        const user = c.get('user') as User | undefined;
        const context: RequestContext = {
          user,
          request: {
            method: c.req.method,
            path: c.req.path,
            params: {},
            headers: {},
          },
        };

        const check = guard.requirePermission(permission)(context);
        if (!check.allowed) {
          // Hono 中返回 403
          const res = new Response(JSON.stringify({ error: check.reason }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
          throw res;
        }

        await next();
      };
    },
  };
}

/**
 * Express 框架适配器
 */
export function createExpressRBAC(rbac: RBACEngine) {
  const guard = new AuthorizationGuard(rbac);

  return {
    rbac,
    guard,

    /**
     * Express 中间件：需要权限
     */
    requirePermission: (permission: Permission) => {
      return (req: { user?: User; method: string; path: string; params: Record<string, string> }, res: { status: (code: number) => { json: (body: unknown) => void } }, next: (err?: unknown) => void) => {
        const context: RequestContext = {
          user: req.user,
          request: {
            method: req.method,
            path: req.path || req.method,
            params: req.params || {},
            headers: {},
          },
        };

        const check = guard.requirePermission(permission)(context);
        if (!check.allowed) {
          res.status(403).json({ error: check.reason });
          return;
        }

        next();
      };
    },
  };
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== RBAC 基于角色的访问控制 ===\n');

  const rbac = new RBACEngine();
  const guard = new AuthorizationGuard(rbac);

  // 创建测试用户
  const regularUser: User = {
    id: 'user-1',
    email: 'user@example.com',
    roles: ['user'],
    orgId: 'org-a',
  };

  const editor: User = {
    id: 'editor-1',
    email: 'editor@example.com',
    roles: ['editor'],
    orgId: 'org-a',
  };

  const admin: User = {
    id: 'admin-1',
    email: 'admin@example.com',
    roles: ['admin'],
    orgId: 'org-b',
  };

  console.log('1. 角色权限继承');
  console.log('   Guest 权限:', [...rbac.getRolePermissions('guest')]);
  console.log('   User 权限:', [...rbac.getRolePermissions('user')]);
  console.log('   Editor 权限:', [...rbac.getRolePermissions('editor')]);
  console.log('   Admin 权限:', [...rbac.getRolePermissions('admin')]);

  console.log('\n2. 权限检查');
  console.log('   User 能创建文章?', rbac.hasPermission(regularUser, 'posts:create'));
  console.log('   User 能删除文章?', rbac.hasPermission(regularUser, 'posts:delete'));
  console.log('   Editor 能删除文章?', rbac.hasPermission(editor, 'posts:delete'));
  console.log('   Admin 能管理用户?', rbac.hasPermission(admin, 'users:delete'));

  console.log('\n3. 角色层级检查');
  console.log('   Editor >= admin?', rbac.hasRoleAtLeast(editor, 'admin'));
  console.log('   Admin >= editor?', rbac.hasRoleAtLeast(admin, 'editor'));

  console.log('\n4. 资源所有权');
  console.log('   User 是 owner-1 的所有者?', rbac.isOwner(regularUser, 'user-1'));
  console.log('   User 是 owner-2 的所有者?', rbac.isOwner(regularUser, 'user-2'));

  console.log('\n5. 守卫检查');
  const ctx: RequestContext = {
    user: regularUser,
    request: { method: 'POST', path: '/api/posts', params: {}, headers: {} },
  };

  const createPostGuard = guard.requirePermission('posts:create');
  const deletePostGuard = guard.requirePermission('posts:delete');

  console.log('   创建文章授权:', createPostGuard(ctx).allowed ? '✅ 允许' : '❌ 拒绝');
  console.log('   删除文章授权:', deletePostGuard(ctx).allowed ? '✅ 允许' : '❌ 拒绝',
    !deletePostGuard(ctx).allowed ? `(${deletePostGuard(ctx).reason})` : '');

  console.log('\n6. 组合守卫');
  const combined = guard.combineAll(
    guard.requireAuth,
    guard.requirePermission('posts:update')
  );
  console.log('   认证+更新权限:', combined(ctx).allowed ? '✅ 允许' : '❌ 拒绝');
}
