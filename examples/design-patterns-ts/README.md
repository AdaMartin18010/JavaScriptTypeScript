# TypeScript 设计模式示例

本目录展示了 5 个最常用的设计模式在 TypeScript 中的实现，每个模式包含核心结构和使用示例。

## 模式清单

| 文件 | 模式 | 适用场景 |
|------|------|----------|
| `factory.ts` | 工厂模式 | 根据条件创建不同类型的对象，隐藏实例化逻辑 |
| `strategy.ts` | 策略模式 | 封装一系列可互换的算法，消除大量条件分支 |
| `observer.ts` | 观察者模式 | 一对多的依赖关系，当一个对象状态改变时通知多个依赖者 |
| `decorator.ts` | 装饰器模式 | 动态地给对象添加额外职责，比继承更灵活 |
| `proxy.ts` | 代理模式 | 控制对目标对象的访问，添加缓存、权限校验、懒加载等 |

## 如何运行

```bash
# 安装 TypeScript（如果尚未安装）
npm install -g typescript

# 编译并运行单个示例
tsx factory.ts
npx ts-node strategy.ts

# 或先编译再运行
npx tsc factory.ts --outDir dist
node dist/factory.js
```

## 设计模式速查

```
工厂模式   → "我要什么，你给我造什么"
策略模式   → "多种算法，随时切换"
观察者模式 → "你变了，通知我一下"
装饰器模式 → "穿外套，一层一层加功能"
代理模式   → "先经过我，再找他"
```
