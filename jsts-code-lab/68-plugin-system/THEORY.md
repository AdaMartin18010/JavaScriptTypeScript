# 插件系统 — 理论基础

## 1. 插件架构模式

### 微内核模式

核心系统提供最小功能和插件接口，业务逻辑通过插件实现：

- **核心**: 插件加载器、生命周期管理、事件总线
- **插件**: 独立开发、动态加载、独立版本

### Hook 系统

在关键执行点预留扩展点：

```javascript
// 核心代码
const result = hooks.applyFilters('calculate_price', basePrice, context)

// 插件代码
hooks.addFilter('calculate_price', (price, ctx) => ctx.vip ? price * 0.9 : price)
```

## 2. 插件隔离

- **命名空间**: 防止全局污染
- **沙箱**: 限制插件可访问的 API（如 Figma 插件的 iframe 沙箱）
- **依赖管理**: 插件间依赖声明和版本冲突解决

## 3. 热加载

- **动态导入**: `import()` 运行时加载模块
- **文件监听**: 开发模式下监听插件文件变化
- **状态迁移**: 热更新时保留或恢复插件状态

## 4. 与相邻模块的关系

- **06-architecture-patterns**: 微内核架构
- **78-metaprogramming**: 元编程技术
- **56-code-generation**: 插件代码生成
