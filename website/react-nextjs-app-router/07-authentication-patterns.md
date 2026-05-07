---
title: 07 认证模式
description: 掌握 Next.js App Router 中的认证模式：NextAuth.js v5、Clerk、JWT 在 Middleware 中的使用，以及 RSC 中的认证上下文传递。
---

# 07 认证模式

> **前置知识**：HTTP 认证基础、JWT、Next.js Middleware
>
> **目标**：能够设计类型安全的认证系统，保护 RSC 和 API 路由

---

## 1. 认证架构概览

```
Next.js App Router 认证流程：

用户登录
   │
   ▼
┌─────────────┐
│  Login Page │ ──► NextAuth / Clerk / 自定义
│  (Client)   │     生成 Session / JWT
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Middleware │ ──► 验证 Token，重定向未认证用户
│  (Edge)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  RSC Page   │ ──► 通过 cookies() 获取 session
│  (Server)   │     直接访问数据库
└─────────────┘
```

---

## 2. NextAuth.js v5 (Auth.js)

### 2.1 配置

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
```

```typescript
// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 验证用户
        const user = await db.users.findByEmail(credentials.email);
        if (user && await verifyPassword(credentials.password, user.password)) {
          return { id: user.id, email: user.email, name: user.name };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
```

### 2.2 在 RSC 中使用

```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const userData = await db.users.findById(session.user.id);
  
  return (
    <div>
      <h1>欢迎, {userData.name}</h1>
      <p>邮箱: {userData.email}</p>
    </div>
  );
}
```

---

## 3. Clerk 集成

### 3.1 配置

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/login', '/register'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/'],
};
```

### 3.2 RSC 中使用

```typescript
// app/protected/page.tsx
import { auth, currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/login');
  }
  
  const user = await currentUser();
  
  return (
    <div>
      <h1>欢迎, {user?.firstName}</h1>
    </div>
  );
}
```

---

## 4. 自定义 JWT 认证

### 4.1 Middleware 验证

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  
  // 公开路由
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // 验证 Token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const payload = await verifyToken(token);
    // 将用户信息添加到请求头（供 RSC 使用）
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 4.2 RSC 中获取用户

```typescript
// lib/auth.ts
import { headers } from 'next/headers';

export async function getCurrentUser() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) return null;
  
  return db.users.findById(userId);
}
```

---

## 5. 保护 Server Actions

```typescript
// app/actions.ts
'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  const post = await db.posts.create({
    title,
    content,
    authorId: session.user.id,
  });
  
  revalidatePath('/posts');
  return post;
}
```

---

## 6. 角色与权限

```typescript
// lib/rbac.ts
type Role = 'admin' | 'editor' | 'viewer';

const permissions: Record<Role, string[]> = {
  admin: ['posts:create', 'posts:edit', 'posts:delete', 'users:manage'],
  editor: ['posts:create', 'posts:edit'],
  viewer: ['posts:read'],
};

export function hasPermission(role: Role, permission: string): boolean {
  return permissions[role]?.includes(permission) ?? false;
}

// RSC 中使用
export default async function AdminPage() {
  const session = await auth();
  
  if (!hasPermission(session?.user?.role as Role, 'users:manage')) {
    redirect('/unauthorized');
  }
  
  return <div>管理面板</div>;
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **Middleware 中访问数据库** | Edge Runtime 限制 | 使用 JWT 验证，延迟到 RSC 中查库 |
| **Session 在 Client Component 中获取** | 导致 hydration 不匹配 | 在 RSC 中获取，通过 props 传递 |
| **Token 过期未处理** | 用户操作失败 | 实现刷新 Token 机制 |
| **CSRF 漏洞** | Server Actions 未防护 | Next.js 自动处理，自定义端点需手动防护 |

---

## 练习

1. 实现完整的认证系统：注册、登录、登出、密码重置，使用 NextAuth.js。
2. 实现基于角色的访问控制：管理员可编辑所有内容，编辑者只能编辑自己的内容。
3. 实现 API 路由保护：未认证的请求返回 401，无权限的请求返回 403。

---

## 延伸阅读

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Clerk Next.js](https://clerk.com/docs/quickstarts/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
