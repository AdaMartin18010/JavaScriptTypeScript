---
title: 05 跨框架集成
description: 掌握 Lit Web Components 在 React、Vue、Angular 中的集成模式：包装器设计、事件映射、属性同步、类型声明和最佳实践。
---

# 05 跨框架集成

> **前置知识**：Lit 组件开发、React/Vue/Angular 基础
>
> **目标**：能够将 Lit 组件无缝集成到不同前端框架中

---

## 1. 集成核心挑战

### 1.1 框架差异

| 方面 | Web Components | React | Vue | Angular |
|------|---------------|-------|-----|---------|
| 属性传递 | HTML 属性 | Props | Props | @Input |
| 事件监听 | addEventListener | onEvent | @event | (event) |
| 子元素 | Slots | children | slots | ng-content |
| 数据绑定 | 单向 | 单向/双向 | 双向 | 双向 |
| 类型系统 | 无（运行时） | TypeScript | TypeScript | TypeScript |

### 1.2 通用解决方案

```
框架集成层：
┌─────────────────────────────────────┐
│  React / Vue / Angular 应用         │
├─────────────────────────────────────┤
│  框架包装器（Wrapper）               │
│  - Props ↔ 属性映射                 │
│  - 事件 ↔ 回调映射                  │
│  - 子元素 ↔ Slot 映射               │
├─────────────────────────────────────┤
│  Lit Web Component                   │
│  - Shadow DOM                        │
│  - Custom Events                     │
│  - Slots                             │
└─────────────────────────────────────┘
```

---

## 2. React 集成

### 2.1 基础包装器

```tsx
// react/src/components/DsButton.tsx
import React, { useRef, useEffect, forwardRef } from 'react';
import '@mycompany/design-system/components/button.js';

export interface DsButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: Event) => void;
  children?: React.ReactNode;
}

export const DsButton = forwardRef<HTMLElement, DsButtonProps>(
  ({ variant = 'primary', size = 'md', disabled, loading, onClick, children }, ref) => {
    const innerRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const el = innerRef.current;
      if (el && onClick) {
        el.addEventListener('click', onClick);
        return () => el.removeEventListener('click', onClick);
      }
    }, [onClick]);

    // 合并 ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(innerRef.current);
      } else if (ref) {
        ref.current = innerRef.current;
      }
    }, [ref]);

    return React.createElement(
      'ds-button',
      {
        ref: innerRef,
        variant,
        size,
        disabled: disabled ? '' : undefined,
        loading: loading ? '' : undefined,
      },
      children
    );
  }
);

DsButton.displayName = 'DsButton';
```

### 2.2 使用 @lit/react

```tsx
// 更简洁的方式使用 @lit/react
import { createComponent } from '@lit/react';
import React from 'react';
import { DSButton } from '@mycompany/design-system/components/button.js';

export const DsButton = createComponent({
  tagName: 'ds-button',
  elementClass: DSButton,
  react: React,
  events: {
    onClick: 'click',
  },
});

// 使用
import { DsButton } from '@mycompany/design-system/react';

function App() {
  return (
    <DsButton
      variant="primary"
      size="lg"
      onClick={(e) => console.log('clicked', e)}
    >
      点击我
    </DsButton>
  );
}
```

### 2.3 TypeScript 类型声明

```typescript
// react/src/types.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'ds-button': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        loading?: boolean;
      },
      HTMLElement
    >;
    'ds-input': React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLElement> & {
        label?: string;
        hint?: string;
        error?: string;
      },
      HTMLElement
    >;
  }
}
```

---

## 3. Vue 集成

### 3.1 基础包装器

```vue
<!-- vue/src/components/DsButton.vue -->
<template>
  <ds-button
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click', $event)"
  >
    <slot />
  </ds-button>
</template>

<script setup>
import '@mycompany/design-system/components/button.js';

defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: Boolean,
  loading: Boolean,
});

defineEmits(['click']);
</script>
```

### 3.2 使用 Vue 自定义元素配置

```typescript
// vue/src/main.ts
import { defineCustomElement } from 'vue';

// 注册所有 Web Components
const modules = import.meta.glob(
  '@mycompany/design-system/components/*.js'
);

for (const path in modules) {
  modules[path]();
}
```

### 3.3 TypeScript 支持

```typescript
// vue/src/types.d.ts
declare module 'vue' {
  export interface GlobalComponents {
    'ds-button': typeof import('./components/DsButton.vue').default;
    'ds-input': typeof import('./components/DsInput.vue').default;
  }
}

export {};
```

---

## 4. Angular 集成

### 4.1 包装器指令

```typescript
// angular/src/components/ds-button/ds-button.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import '@mycompany/design-system/components/button.js';

@Component({
  selector: 'ds-button',
  template: `
    <ds-button
      #nativeEl
      [attr.variant]="variant"
      [attr.size]="size"
      [attr.disabled]="disabled ? '' : null"
      [attr.loading]="loading ? '' : null"
    >
      <ng-content></ng-content>
    </ds-button>
  `,
})
export class DsButtonComponent {
  @ViewChild('nativeEl') nativeEl!: ElementRef<HTMLElement>;

  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() clickEvent = new EventEmitter<Event>();

  ngAfterViewInit() {
    this.nativeEl.nativeElement.addEventListener('click', (e) => {
      this.clickEvent.emit(e);
    });
  }
}
```

### 4.2 Angular 模块配置

```typescript
// angular/src/design-system.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsButtonComponent } from './components/ds-button/ds-button.component';
import { DsInputComponent } from './components/ds-input/ds-input.component';

@NgModule({
  declarations: [DsButtonComponent, DsInputComponent],
  imports: [CommonModule],
  exports: [DsButtonComponent, DsInputComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // 允许使用自定义元素
})
export class DesignSystemModule {}
```

### 4.3 Standalone 组件（Angular 14+）

```typescript
// angular/src/components/ds-button/ds-button.component.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ds-button',
  standalone: true,
  template: `
    <ds-button
      [attr.variant]="variant()"
      [attr.size]="size()"
      [attr.disabled]="disabled() ? '' : null"
    >
      <ng-content />
    </ds-button>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DsButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  clickEvent = output<Event>();
}
```

---

## 5. 通用包装器生成工具

### 5.1 基于元数据自动生成

```typescript
// tools/generate-wrappers.ts
import { writeFileSync } from 'fs';
import { globSync } from 'glob';

interface ComponentMeta {
  tagName: string;
  className: string;
  properties: Array<{ name: string; type: string; default?: string }>;
  events: Array<{ name: string; type: string }>;
}

function generateReactWrapper(meta: ComponentMeta): string {
  const props = meta.properties.map(p => `${p.name}?: ${p.type};`).join('\n  ');
  const propAttrs = meta.properties.map(p => `${p.name},`).join('\n    ');

  return `
import { createComponent } from '@lit/react';
import React from 'react';
import { ${meta.className} } from '@mycompany/design-system/components/${meta.tagName.replace('ds-', '')}.js';

export interface ${meta.className}Props {
  ${props}
}

export const ${meta.className} = createComponent({
  tagName: '${meta.tagName}',
  elementClass: ${meta.className},
  react: React,
  events: {
    ${meta.events.map(e => `on${e.name}: '${e.name}',`).join('\n    ')}
  },
});
`;
}

// 扫描组件并生成包装器
const components = globSync('packages/components/src/**/*.ts');
for (const comp of components) {
  // 解析元数据并生成...
}
```

---

## 6. 事件与类型最佳实践

### 6.1 自定义事件设计

```typescript
// 在 Lit 组件中定义类型化事件
export class DsChangeEvent extends Event {
  constructor(public value: string) {
    super('ds-change', { bubbles: true, composed: true });
  }
}

// 组件中触发
this.dispatchEvent(new DsChangeEvent(this.value));

// React 中监听
<DsInput onDsChange={(e) => console.log(e.detail.value)} />

// Vue 中监听
<ds-input @ds-change="handleChange" />
```

### 6.2 类型共享

```typescript
// packages/types/src/index.ts
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  loading: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  type: 'text' | 'email' | 'password';
  hint?: string;
  error?: string;
}

// 各框架包装器共享这些类型
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **属性名冲突** | React 保留字与 WC 属性冲突 | 使用 data- 前缀或映射表 |
| **事件不冒泡** | Shadow DOM 事件被重定向 | 设置 composed: true |
| **类型丢失** | 框架包装器没有类型定义 | 生成 .d.ts 文件 |
| **SSR 不匹配** | 服务端和客户端渲染结果不同 | 延迟加载 Web Components |

---

## 练习

1. 为 `<ds-modal>` 组件创建 React、Vue、Angular 三个包装器。
2. 实现一个类型生成工具：从 Lit 组件的 TypeScript 定义自动生成框架包装器。
3. 创建一个跨框架的表单示例：使用相同的 Lit 组件在 React/Vue/Angular 中构建登录表单。

---

## 延伸阅读

- [@lit/react](https://lit.dev/docs/frameworks/react/)
- [Web Components in Vue](https://vuejs.org/guide/extras/web-components.html)
- [Angular Elements](https://angular.io/guide/elements)
