import fp from "fastify-plugin";
import { SignJWT, jwtVerify } from "jose";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// 内存存储（生产环境应使用 Redis）
const refreshTokens = new Set<string>();
const users = new Map<
  string,
  { id: string; email: string; password: string; name?: string }
>();

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createTokens(userId: string, email: string) {
  const secret = getJwtSecret();
  const refreshSecret = getRefreshSecret();

  const accessToken = await new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const refreshToken = await new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);

  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret, {
    clockTolerance: 60,
    maxTokenAge: "15m",
  });
  return payload;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    const payload = await verifyAccessToken(auth.slice(7));
    request.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  // 注册
  app.post("/auth/register", async (request, reply) => {
    const { email, password, name } = request.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (users.has(email)) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const id = crypto.randomUUID();
    users.set(email, { id, email, password, name });
    const tokens = await createTokens(id, email);
    return { user: { id, email, name }, ...tokens };
  });

  // 登录
  app.post("/auth/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    const user = users.get(email);
    if (!user || user.password !== password) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const tokens = await createTokens(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  });

  // 刷新 Token
  app.post("/auth/refresh", async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshTokens.has(refreshToken)) {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }

    try {
      const secret = getRefreshSecret();
      const { payload } = await jwtVerify(refreshToken, secret, {
        clockTolerance: 60,
      });
      refreshTokens.delete(refreshToken);
      const tokens = await createTokens(payload.sub as string, payload.sub as string);
      return tokens;
    } catch {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

  // 退出登录
  app.post("/auth/logout", async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    refreshTokens.delete(refreshToken);
    return { message: "Logged out" };
  });

  // Passkeys 注册选项（简化示例）
  app.post("/auth/passkeys/register-options", { preHandler: requireAuth }, async (request) => {
    const user = request.user!;
    return {
      challenge: crypto.randomUUID(),
      rp: {
        name: process.env.WEBAUTHN_RP_NAME ?? "Secure API",
        id: process.env.WEBAUTHN_RP_ID ?? "localhost",
      },
      user: {
        id: user.id,
        name: user.email,
        displayName: user.email,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      timeout: 60000,
      attestation: "none",
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    };
  });

  // Passkeys 认证选项
  app.post("/auth/passkeys/authenticate-options", async () => {
    return {
      challenge: crypto.randomUUID(),
      allowCredentials: [],
      timeout: 60000,
      userVerification: "preferred",
      rpId: process.env.WEBAUTHN_RP_ID ?? "localhost",
    };
  });
});

// 扩展 Fastify 类型
declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string; email: string };
  }
}
