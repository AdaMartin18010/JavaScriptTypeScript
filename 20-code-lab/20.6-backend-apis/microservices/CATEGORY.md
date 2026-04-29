---
dimension: 综合
sub-dimension: Microservices
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Microservices 核心概念与工程实践。

## 包含内容

- 本模块聚焦 microservices 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 service-mesh.test.ts
- 📄 service-mesh.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `service-mesh/` | 服务网格路由、熔断与可观测性 | `service-mesh.ts`, `service-mesh.test.ts` |
| `index/` | 模块入口与公共 API 导出 | `index.ts` |

## 代码示例

### 简易服务网格 sidecar 代理

```typescript
interface ServiceInstance {
  id: string;
  address: string;
  health: 'healthy' | 'unhealthy';
}

class ServiceMesh {
  private registry = new Map<string, ServiceInstance[]>();

  register(name: string, instance: ServiceInstance) {
    const list = this.registry.get(name) ?? [];
    list.push(instance);
    this.registry.set(name, list);
  }

  resolve(name: string): ServiceInstance | undefined {
    const healthy = this.registry.get(name)?.filter((i) => i.health === 'healthy');
    return healthy?.[Math.floor(Math.random() * healthy.length)];
  }
}
```


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Microservices.io | 权威模式目录 | [microservices.io](https://microservices.io/) |
| CNCF Cloud Native Definition | 云原生定义 | [cncf.io](https://www.cncf.io/) |
| Istio Documentation | 服务网格文档 | [istio.io/latest/docs](https://istio.io/latest/docs/) |
| AWS Microservices | 最佳实践 | [docs.aws.amazon.com/microservices](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html) |

---

*最后更新: 2026-04-29*
