# TS/JS 软件堆栈全景分析 — 交叉验证

## 高置信度（可直接作为事实呈现）

- V8引擎四阶段架构（Parser→Ignition→TurboFan→Orinoco）— 来自Google官方文档，多方验证
- TS类型擦除机制 — TypeScript官方文档确认
- 结构类型vs名义类型差异 — PL理论共识
- Pixel Pipeline五阶段 — Chromium官方文档，web.dev确认
- Deno权限沙盒模型 — Deno官方文档确认
- ESM/CJS模块系统差异 — ECMA-262与Node.js文档确认
- React Server Components架构 — React官方RFC确认

## 中等置信度（需标注来源或补充证据）

- Node.js v24+特性（采纳Fetch API、测试模式等）— 版本发布状态需确认
- Bun v2.0+/Deno v2.0+的具体版本号 — 可能是预测性的，需标注
- "85%企业报告生产力提升" — 缺少原始调查来源
- 5个CVE-2026-XXXX — 编号为预测性，需明确标注
- Maglev编译器的三编译器策略 — 来自V8博客，但具体性能数据有限

## 低置信度/需验证

- "绿色计算"ESG关联 — 论证薄弱，缺少能耗对比数据
- LangChain.js v5具体特性 — 版本号需验证
- MCP TypeScript SDK v1.27（2026年2月发布）— 具体版本信息需验证
- Native Browser AI APIs的支持矩阵 — 快速变化领域
- "AI原生编程"预判 — 高度前瞻性，缺少具体实现路径

## 冲突区域

- Bun的性能声称（"极快冷启动"）vs 实际benchmark — 第三方独立测试数据有限
- TS严格模式（strict:true）的收益vs成本 — 不同团队报告差异较大
- 微前端的净收益 — 支持者强调独立部署，反对者强调通信复杂度
