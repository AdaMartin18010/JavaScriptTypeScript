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

## 4. Kubernetes Service 与 Ingress 实战配置

```yaml
# service.yaml — 集群内负载均衡
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: my-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
# ingress.yaml — 七层路由 + TLS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

## 5. Docker Compose 多服务编排示例

```yaml
# docker-compose.yml — 本地开发与边缘测试
version: "3.9"
services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
volumes:
  pgdata:
```

## 6. Helm Chart 模板片段

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "mychart.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "mychart.name" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

## 7. 与相邻模块的关系

- **22-deployment-devops**: DevOps 与 CI/CD
- **73-service-mesh-advanced**: 服务网格
- **25-microservices**: 微服务部署

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Kubernetes 官方文档 | 文档 | [kubernetes.io/docs](https://kubernetes.io/docs/) |
| Docker 官方文档 | 文档 | [docs.docker.com](https://docs.docker.com/) |
| Helm 官方文档 | 文档 | [helm.sh/docs](https://helm.sh/docs/) |
| CNCF Cloud Native Landscape | 生态 | [landscape.cncf.io](https://landscape.cncf.io/) |
| Kubernetes Patterns 书籍 | 指南 | [k8spatterns.io](https://k8spatterns.io/) |
| Ingress-NGINX 文档 | 文档 | [kubernetes.github.io/ingress-nginx](https://kubernetes.github.io/ingress-nginx/) |
| cert-manager 文档 | 文档 | [cert-manager.io](https://cert-manager.io/docs/) |
| MDN Web Docs | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |

---

*最后更新: 2026-04-29*
