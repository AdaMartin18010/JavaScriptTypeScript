# JS/TS 编译器对比

> TypeScript Compiler、SWC、Babel、Oxc、esbuild 的深度对比矩阵。

---

## 对比矩阵

| 维度 | tsc | SWC | Babel | Oxc | esbuild |
|------|-----|-----|-------|-----|---------|
| **语言** | TypeScript | Rust | JavaScript | Rust | Go |
| **类型检查** | ✅ 原生 | ❌ | ❌ | ❌ | ❌ |
| **转译速度** | 基准 | ~20x | ~2x | ~30x | ~15x |
| **输出质量** | 最高 | 高 | 高 | 高 | 中 |
| **Tree Shaking** | ❌ | ✅ | 需插件 | ✅ | ✅ |
| **Minify** | ❌ | ✅ | 需插件 | ✅ | ✅ |
| **配置复杂度** | 低 | 低 | 高 | 极低 | 低 |
| **最佳场景** | 类型检查 | Next.js/Vite 构建 | 遗留项目插件 | 下一代统一工具 | 库打包 |

---

## 2026 推荐组合

| 场景 | 工具链 |
|------|--------|
| Next.js 项目 | SWC（转译）+ tsc（类型检查） |
| Vite 项目 | esbuild（dev）+ Rollup（build） |
| 库开发 | tsup（esbuild + 类型生成） |
| 极致速度 | Oxc（实验性，未来统一） |
| 遗留 Babel 插件 | Babel（逐步迁移至 SWC） |

---

*最后更新: 2026-04-29*
