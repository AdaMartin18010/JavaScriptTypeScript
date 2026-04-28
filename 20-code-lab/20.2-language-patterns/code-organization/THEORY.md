# 代码组织 — 理论基础

## 1. 模块化原则

### 单一职责原则（SRP）

每个模块只负责一个功能领域，修改原因只有一个。

### 依赖倒置原则（DIP）

高层模块不应依赖低层模块，两者都应依赖抽象。

### 稳定依赖原则（SDP）

模块应依赖于比它更稳定的模块。

## 2. 项目结构模式

### 按功能组织（Feature-Based）

```
src/
  features/
    auth/
      api.ts
      store.ts
      components/
      hooks/
    dashboard/
      ...
```

优点：功能内聚，添加新功能只需新建目录。

### 按类型组织（Type-Based）

```
src/
  components/
  hooks/
  utils/
  services/
```

优点：同类文件集中，适合小型项目。

### 整洁架构（Clean Architecture）

```
src/
  domain/      # 核心业务规则，无外部依赖
  application/ # 用例编排
  infrastructure/ # 框架、数据库、外部服务
  presentation/   # UI 层
```

## 3. 依赖管理

- **显式依赖**: 每个模块声明其依赖，避免隐式全局状态
- **依赖方向**: 外层依赖内层，内层不感知外层
- **循环依赖检测**: 使用工具（如 madge）检测并消除循环引用

## 4. 与相邻模块的关系

- **06-architecture-patterns**: 架构模式的理论
- **59-fullstack-patterns**: 全栈项目的组织实践
- **23-toolchain-configuration**: 工具链配置支持代码组织
