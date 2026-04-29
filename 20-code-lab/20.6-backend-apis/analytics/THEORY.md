# 数据分析 — 理论基础

## 1. 埋点体系

### 代码埋点

开发者在关键位置手动插入追踪代码：

```javascript
tracker.track('button_click', { button_id: 'submit', page: 'checkout' })
```

### 可视化埋点

通过 UI 工具圈选元素自动追踪，无需代码修改。

### 无埋点（全埋点）

自动采集所有用户交互，事后通过分析平台定义事件。

## 2. 用户行为分析

- **漏斗分析**: 用户完成多步骤流程的转化率
- **留存分析**: 用户首次使用后第 N 天的回访率
- **路径分析**: 用户在应用中的页面跳转路径
- **cohort 分析**: 按时间分组对比用户群体行为

## 3. 隐私合规

- **GDPR**: 欧盟数据保护，需用户同意
- **CCPA**: 加州消费者隐私法
- **匿名化**: 去除 PII（个人身份信息）
- **数据最小化**: 只收集必要数据

## 4. 与相邻模块的关系

- **87-realtime-analytics**: 实时数据分析
- **66-feature-flags**: 特性开关与 A/B 测试
- **17-debugging-monitoring**: 监控与日志


## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN Web Docs | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |

---

*最后更新: 2026-04-29*
