---
title: 11 浏览器兼容性
description: Web Components 浏览器兼容性策略：polyfills、渐进增强、企业级浏览器支持策略和测试矩阵。
---

# 11 浏览器兼容性

## 1. 原生支持情况

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Custom Elements | 54+ | 63+ | 10.1+ | 79+ |
| Shadow DOM | 53+ | 63+ | 10.1+ | 79+ |
| HTML Templates | 26+ | 22+ | 7.1+ | 13+ |
| Declarative Shadow DOM | 90+ | 123+ | 17+ | 90+ |

## 2. Polyfill 策略

```html
<!-- 旧浏览器加载 polyfill -->
<script>
  if (!window.customElements) {
    document.write('<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js"><\/script>');
  }
</script>
```

## 3. 渐进增强

```html
<!-- 基础功能无需 JS -->
<button class="ds-button">基础按钮</button>

<!-- 增强为 Web Component -->
<ds-button variant="primary">增强按钮</ds-button>
```

## 4. 测试矩阵

| 浏览器 | 版本 | 测试优先级 |
|--------|------|-----------|
| Chrome | 最新 + LTS | P0 |
| Safari | 最新 + 上一个 | P0 |
| Firefox | 最新 + ESR | P1 |
| Edge | 最新 | P1 |
