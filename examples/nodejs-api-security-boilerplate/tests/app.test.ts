import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { securityPlugins } from "../src/plugins/security.js";
import { authPlugin } from "../src/plugins/auth.js";
import { usersRoutes } from "../src/routes/users.js";
import { loggerConfig } from "../src/utils/logger.js";

async function buildApp() {
  const app = Fastify({ logger: loggerConfig });
  await app.register(securityPlugins);
  await app.register(authPlugin);
  await app.register(usersRoutes, { prefix: "/users" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}

describe("API Security Boilerplate", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: "ok" });
  });

  it("POST /auth/register creates a user", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "test@example.com",
        password: "securepassword123",
        name: "Test User",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe("test@example.com");
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it("POST /auth/register rejects duplicate email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "test@example.com",
        password: "anotherpassword",
      },
    });
    expect(res.statusCode).toBe(409);
  });

  it("POST /auth/login with valid credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "test@example.com",
        password: "securepassword123",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe("test@example.com");
    expect(body.accessToken).toBeDefined();
  });

  it("POST /auth/login with invalid credentials returns 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it("GET /users/me without token returns 401", async () => {
    const res = await app.inject({ method: "GET", url: "/users/me" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /users/me with valid token", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "test@example.com",
        password: "securepassword123",
      },
    });
    const { accessToken } = JSON.parse(loginRes.body);

    const res = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user).toBeDefined();
  });

  it("GET /users/:id validates UUID format", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "test@example.com",
        password: "securepassword123",
      },
    });
    const { accessToken } = JSON.parse(loginRes.body);

    const res = await app.inject({
      method: "GET",
      url: "/users/invalid-id",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.statusCode).toBe(400);
  });
});
