---
dimension: 综合
sub-dimension: Architecture patterns
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Architecture patterns 核心概念与工程实践。

## 包含内容

- 分层架构、MVC/MVVM、CQRS、六边形架构与微服务模式的实现与对比。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 cqrs
- 📁 hexagonal
- 📄 index.ts
- 📁 layered
- 📁 microservices
- 📁 mvc
- 📁 mvvm

## 子模块速查

| 子模块 | 说明 | 入口文件 |
|--------|------|----------|
| cqrs | 命令查询职责分离，读写模型独立演进 | `cqrs/THEORY.md` |
| hexagonal | 端口与适配器架构，解耦业务与外部系统 | `hexagonal/THEORY.md` |
| layered | 经典分层架构（表现/业务/数据层） | `layered/THEORY.md` |
| microservices | 微服务拆分、通信与治理模式 | `microservices/THEORY.md` |
| mvc | 模型-视图-控制器职责分离 | `mvc/THEORY.md` |
| mvvm | 模型-视图-视图模型，数据绑定驱动 | `mvvm/THEORY.md` |

## 架构模式对比

| 模式 | 核心思想 | 耦合方向 | 可测试性 | 扩展性 | 适用规模 |
|------|----------|----------|----------|--------|----------|
| Layered | 水平分层，上层依赖下层 | 单向向下 | 中 | 中 | 中小型单体 |
| MVC | 模型-视图-控制器分离 | 视图依赖模型 | 中 | 中 | 服务端渲染 / 早期 SPA |
| MVP | Presenter 作为视图与模型中介 | 视图与模型隔离 | 高 | 中 | 企业桌面应用 |
| MVVM | 双向数据绑定，VM 解耦视图 | 视图 ↔ VM | 高 | 高 | 现代数据驱动 UI |
| Hexagonal | 端口-适配器，业务核心独立 | 外部依赖内部 | 极高 | 极高 | 复杂业务领域 |
| CQRS | 读写模型分离，独立优化 | 命令/查询分治 | 高 | 极高 | 高并发分布式系统 |
| Microservices | 按业务能力垂直拆分服务 | 服务间 API 契约 | 高 | 极高 | 大型组织、独立团队 |

## 代码示例

以下展示一个极简的分层架构入口，演示如何通过依赖注入组合各层：

```typescript
// index.ts
import { UserController } from './layered/presentation/user-controller';
import { UserService } from './layered/application/user-service';
import { UserRepository } from './layered/infrastructure/user-repository';

// 手动依赖注入组装
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

// 处理请求
const user = await controller.getUserById('42');
console.log(user);
```

#### 六边形架构端口与适配器示例

```typescript
// hexagonal-ports.ts
interface ForUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 驱动适配器（入口）
class UserController {
  constructor(private service: UserService) {}
  async handleGetUser(id: string) {
    return this.service.getUser(id);
  }
}

// 被驱动适配器（出口）
class SqlUserRepository implements ForUserRepository {
  async findById(id: string) { /* ... */ }
  async save(user: User) { /* ... */ }
}
```

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Martin Fowler — Patterns of Enterprise Application Architecture | 书籍 | [martinfowler.com/eaaCatalog](https://martinfowler.com/eaaCatalog/) |
| Microsoft — Cloud Design Patterns | 文档 | [learn.microsoft.com/azure/architecture/patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) |
| Refactoring Guru — Design Patterns | 参考 | [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns) |
| AWS Prescriptive Guidance | 指南 | [aws.amazon.com/prescriptive-guidance](https://aws.amazon.com/prescriptive-guidance/) |
| DDD Reference by Eric Evans | 参考 | [domainlanguage.com/ddd/reference](https://www.domainlanguage.com/ddd/reference/) |
| Hexagonal Architecture — Alistair Cockburn | 文章 | [alistair.cockburn.us/hexagonal-architecture/](https://alistair.cockburn.us/hexagonal-architecture/) |
| The Clean Architecture — Robert C. Martin | 文章 | [blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) |

---

*最后更新: 2026-04-29*
