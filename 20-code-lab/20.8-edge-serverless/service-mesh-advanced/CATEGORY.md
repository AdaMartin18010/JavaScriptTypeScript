---
dimension: 综合
sub-dimension: Service mesh advanced
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Service mesh advanced 核心概念与工程实践。

## 包含内容

- 本模块聚焦 service mesh advanced 核心概念与工程实践。
- 涵盖 Sidecar-less 架构、L7 流量管理与可观测性注入模式。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 服务网格理论形式化定义 |
| mesh-architecture.ts | 源码 | 轻量服务网格控制面 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// mesh-architecture.ts — 轻量 L7 流量管理
interface RouteRule {
  path: string;
  targets: { host: string; weight: number }[];
  retries: number;
  timeoutMs: number;
}

class ServiceMeshProxy {
  constructor(private routes: RouteRule[]) {}

  async forward(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const rule = this.routes.find(r => url.pathname.startsWith(r.path));
    if (!rule) return new Response('Not Found', { status: 404 });

    const target = this.selectTarget(rule.targets);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), rule.timeoutMs);

    for (let i = 0; i <= rule.retries; i++) {
      try {
        const res = await fetch(`http://${target}${url.pathname}`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        return res;
      } catch (err) {
        if (i === rule.retries) throw err;
      }
    }
    return new Response('Service Unavailable', { status: 503 });
  }

  private selectTarget(targets: RouteRule['targets']): string {
    const total = targets.reduce((s, t) => s + t.weight, 0);
    let pick = Math.random() * total;
    for (const t of targets) {
      pick -= t.weight;
      if (pick <= 0) return t.host;
    }
    return targets[0].host;
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 mesh-architecture.test.ts
- 📄 mesh-architecture.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Istio Documentation | 官方文档 | [istio.io/latest/docs](https://istio.io/latest/docs/) |
| Linkerd Architecture | 官方文档 | [linkerd.io/2.15/reference/architecture](https://linkerd.io/2.15/reference/architecture/) |
| Envoy Proxy Documentation | 官方文档 | [envoyproxy.io/docs](https://www.envoyproxy.io/docs) |
| eBPF-based Service Mesh (Cilium) | 官方文档 | [docs.cilium.io/en/stable/network/servicemesh](https://docs.cilium.io/en/stable/network/servicemesh/) |
| Service Mesh Interface (SMI) Spec | 规范 | [smi-spec.io](https://smi-spec.io/) |

---

*最后更新: 2026-04-29*
