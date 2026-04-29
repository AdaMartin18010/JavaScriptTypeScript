# 移动开发 (Mobile Development)

> JavaScript/TypeScript 跨平台移动开发方案全景：从 Capacitor 到 React Native 与 PWA 的选型矩阵。

---

## 核心概念

跨平台移动方案按**运行时模型**分类：

| 模型 | 原理 | 代表 |
|------|------|------|
| **WebView 包装** | Web 应用嵌入原生 WebView | Capacitor, Cordova |
| **原生渲染** | JS 驱动原生 UI 组件 | React Native, NativeScript |
| **自绘引擎** | 跨平台渲染引擎绘制像素 | Flutter（Dart） |
| **渐进式 Web** | 浏览器运行，类原生体验 | PWA（Workbox） |

> **2026 格局**：React Native 持续主导，Capacitor 成为 Web 团队首选，PWA 在 B2B 场景 resurgence。

---

## 方案对比矩阵

| 维度 | React Native | Capacitor | PWA | NativeScript |
|------|-------------|-----------|-----|--------------|
| **语言** | JavaScript / TypeScript | JavaScript / TypeScript | JavaScript / TypeScript | JavaScript / TypeScript |
| **UI 渲染** | 原生组件 | WebView | 浏览器 | 原生组件 |
| **性能** | 接近原生 | 中等（WebView 限制） | 中等 | 接近原生 |
| **包体积** | ~15MB | ~5MB（Web 代码 + 壳） | 0（浏览器访问） | ~15MB |
| **原生 API** | 丰富（社区模块） | 需插件/桥接 | 受限（Web API） | 丰富 |
| **热更新** | ✅ CodePush | ✅ Live Update | ✅ Service Worker | ❌ |
| **App Store** | ✅ 原生提交 | ✅ 原生提交 | ❌（需 PWA 安装） | ✅ 原生提交 |
| **学习曲线** | 中 | 低 | 低 | 高 |
| **维护状态** | ✅ Meta 维护 | ✅ Ionic 维护 | ✅ 浏览器原生 | ⚠️ 小众 |

---

## 选型决策树

```
团队背景？
├── 已有 React Web 应用 → Capacitor（最小改动迁移）
├── 追求原生体验 + 复杂动画 → React Native
├── 预算有限 / B2B 内部工具 → PWA（零商店审核）
├── 已有 Vue/Angular 应用 → Capacitor 或 NativeScript
└── 游戏 / 图形密集型 → Flutter 或原生开发
```

---

## 2026 生态动态

### React Native 新架构

- **Bridgeless Mode**：完全移除旧版 Bridge，JS 与原生直接通信
- **Fabric 渲染器**：异步布局，减少主线程阻塞
- **TurboModules**：按需加载原生模块，缩短启动时间

### Capacitor 6

- **官方 Live Update**：无需 App Store 审核即可推送 Web 层更新
- **Swift / Kotlin 插件模板**：简化原生插件开发
- **Deep Linking 简化**：统一 API 处理 URL Scheme 和 Universal Links

### PWA 在 B2B 的复兴

- **安装便捷**：Chrome/Edge 自动提示安装，无需商店
- **推送通知**：Web Push API 支持后台通知
- **限制**：iOS 推送支持仍弱于原生，部分 API 受限

---

## 最佳实践

1. **性能监控**：使用 Flipper（React Native）或 Chrome DevTools（Capacitor/PWA）分析性能
2. **离线优先**：Service Worker 缓存核心资源，Workbox 简化配置
3. **手势处理**：React Native 使用 `react-native-gesture-handler`，Capacitor 使用 Hammer.js
4. **安全通信**：Capacitor 与原生桥接时使用 `CapacitorHttp` 替代 `fetch`（绕过 CORS）
5. **构建优化**：React Native 使用 Hermes 引擎减小包体积并提升启动速度

---

## 参考资源

- [React Native Documentation](https://reactnative.dev/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [NativeScript Documentation](https://nativescript.org/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/10-css-frameworks.md`
- `20-code-lab/20.5-frontend-frameworks/mobile/`

---

*最后更新: 2026-04-29*
