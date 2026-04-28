# 抽象操作深度索引

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`

---

## 类型转换抽象操作

| 操作 | 输入 | 输出 | 关键边界 |
|------|------|------|---------|
| `ToPrimitive(input, hint)` | any | 原始值 | Symbol.toPrimitive → valueOf → toString |
| `ToNumber(argument)` | any | Number | `''` → 0, `null` → 0, `undefined` → NaN |
| `ToString(argument)` | any | String | `-0` → `'0'`, `[]` → `''` |
| `ToBoolean(argument)` | any | Boolean | falsy 值：false, 0, -0, 0n, '', null, undefined, NaN |

## 对象操作抽象操作

| 操作 | 语义 |
|------|------|
| `Get(O, P)` | 获取对象 O 的属性 P |
| `Set(O, P, V, Throw)` | 设置对象 O 的属性 P 为 V |
| `HasProperty(O, P)` | 检查对象 O 或其原型链是否有属性 P |
| `DeletePropertyOrThrow(O, P)` | 删除属性，失败时抛出 TypeError |
| `DefinePropertyOrThrow(O, P, desc)` | 定义属性，失败时抛出 TypeError |
| `GetMethod(V, P)` | 获取 V 的方法 P，不存在返回 undefined |
| `HasEitherSuperBinding(env)` | 检查环境记录是否有 super 绑定 |

## 模块相关抽象操作

| 操作 | 语义 |
|------|------|
| `HostResolveImportedModule(referencingScriptOrModule, specifier)` | 宿主解析导入模块 |
| `GetExportedNames(exportStarSet)` | 获取模块的导出名称 |
| `ResolveExport(exportName, resolveSet)` | 解析导出绑定 |

---

*本文件为规范基础专题的抽象操作速查索引。*
