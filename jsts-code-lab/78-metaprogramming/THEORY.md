# 元编程 — 理论基础

## 1. 元编程定义

元编程是**编写能操作代码的代码**的技术：

- **编译时**: 宏、模板、代码生成
- **运行时**: 反射、代理、动态代码执行

## 2. JavaScript 元编程能力

### Reflect API

提供拦截和操作对象的统一接口：

- `Reflect.get/set`: 属性读写
- `Reflect.construct`: 构造函数调用
- `Reflect.apply`: 函数调用
- `Reflect.defineProperty`: 属性定义

### Proxy

创建对象的代理，拦截 13 种操作：

```javascript
const proxy = new Proxy(target, {
  get(target, prop) { /* ... */ },
  set(target, prop, value) { /* ... */ }
})
```

### eval 与 new Function

- `eval`: 在当前作用域执行代码字符串
- `new Function`: 创建新函数，全局作用域
- 风险：代码注入、性能损耗、调试困难

## 3. 装饰器（Decorator）

TC39 Stage 3 提案，注解式元编程：

```typescript
@Controller('/users')
class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) { }
}
```

## 4. 与相邻模块的关系

- **56-code-generation**: AST 操作与代码生成
- **68-plugin-system**: 插件系统的元编程应用
- **06-ecmascript-spec-foundation**: 规范层面的元对象协议
