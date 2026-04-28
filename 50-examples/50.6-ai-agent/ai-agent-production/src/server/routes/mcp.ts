/**
 * @file MCP Server 端点路由
 * @description 暴露 MCP 工具、资源与提示模板，供外部 Client 消费
 */

import { Hono } from "hono";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { mcpManager } from "../../lib/mcp-client.js";

const app = new Hono();

/**
 * GET /mcp/servers
 * 列出已连接的 MCP Server
 */
app.get("/servers", requireAuth, (c) => {
  const servers = mcpManager.getConnectedServers();
  return c.json({ servers });
});

/**
 * GET /mcp/tools
 * 列出所有已发现的 MCP 工具
 */
app.get("/tools", requireAuth, async (c) => {
  const tools = mcpManager.getAllTools();
  return c.json({
    total: tools.length,
    tools: tools.map((t) => ({
      server: t.server,
      name: t.tool.name,
      description: t.tool.description,
    })),
  });
});

/**
 * POST /mcp/tools/:server/:tool
 * 调用指定 Server 的指定工具
 */
app.post(
  "/tools/:server/:tool",
  requireAuth,
  requireRole("admin", "developer"),
  async (c) => {
    const serverName = c.req.param("server");
    const toolName = c.req.param("tool");
    const args = await c.req.json().catch(() => ({}));

    try {
      const result = await mcpManager.callTool(serverName, toolName, args);
      return c.json({ success: true, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ success: false, error: message }, 500);
    }
  }
);

/**
 * POST /mcp/connect
 * 动态连接新的 MCP Server
 */
app.post("/connect", requireAuth, requireRole("admin"), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { name, transport, command, args, url } = body;

  if (!name || !transport) {
    return c.json({ success: false, error: "缺少 name 或 transport 字段" }, 400);
  }

  try {
    await mcpManager.connectServer({ name, transport, command, args, url });
    return c.json({ success: true, message: `已连接 MCP Server: ${name}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ success: false, error: message }, 500);
  }
});

export default app;
