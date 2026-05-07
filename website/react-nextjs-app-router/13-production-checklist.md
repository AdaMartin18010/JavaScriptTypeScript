---
title: 13 生产环境检查清单
description: Next.js App Router 生产环境部署前的完整检查清单：安全、可观测性、SEO、性能和法律合规。
---

# 13 生产检查清单

## 安全

- [ ] 环境变量未泄露到客户端
- [ ] CSP 策略配置
- [ ] HTTPS 强制跳转
- [ ] 敏感 API 路由认证保护
- [ ] SQL 注入防护（使用 ORM）
- [ ] XSS 防护（输入消毒）

## 性能

- [ ] Core Web Vitals 达标
- [ ] 图片优化配置
- [ ] 字体优化配置
- [ ] Bundle 分析
- [ ] 缓存策略配置

## SEO

- [ ] Metadata API 配置
- [ ] Sitemap 生成
- [ ] robots.txt 配置
- [ ] 结构化数据

## 可观测性

- [ ] 错误监控（Sentry）
- [ ] 性能监控
- [ ] 日志收集
- [ ] 健康检查端点

## 法律合规

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie 同意
- [ ] GDPR/CCPA 合规
