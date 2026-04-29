# 容器编排 — 理论基础

## 1. 容器基础

容器是轻量级、可移植的运行环境：

- **镜像**: 只读模板，包含应用和依赖
- **容器**: 镜像的运行实例
- **层（Layer）**: 镜像由多个层组成，共享基础层节省空间

## 2. Kubernetes 核心概念

| 概念 | 作用 |
|------|------|
| **Pod** | 最小部署单元，可包含多个容器 |
| **Deployment** | 声明式管理 Pod 副本 |
| **Service** | 稳定的网络端点，负载均衡到 Pod |
| **Ingress** | HTTP/HTTPS 路由规则 |
| **ConfigMap/Secret** | 配置和敏感数据注入 |
| **PersistentVolume** | 持久化存储 |

## 3. 声明式配置

通过 YAML 描述期望状态，K8s 控制器持续调整实际状态：

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:v1
```

## 4. 与相邻模块的关系

- **22-deployment-devops**: DevOps 与 CI/CD
- **73-service-mesh-advanced**: 服务网格
- **25-microservices**: 微服务部署


## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN Web Docs | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |

---

*最后更新: 2026-04-29*
