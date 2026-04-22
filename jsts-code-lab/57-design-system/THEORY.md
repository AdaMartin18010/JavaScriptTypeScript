# 设计系统理论：从组件库到品牌语言

> **目标读者**：前端工程师、设计师、关注设计一致性的团队
> **关联文档**：[`docs/categories/57-design-system.md`](../../docs/categories/57-design-system.md)
> **版本**：2026-04
> **字数**：约 3,000 字

---

## 1. 设计系统的定义

### 1.1 不只是组件库

```
设计系统 = 设计令牌 + 组件库 + 模式库 + 文档 + 工具
```

| 层级 | 内容 | 示例 |
|------|------|------|
| **设计令牌** | 颜色、字体、间距、阴影 | `--color-primary: #007bff` |
| **基础组件** | Button、Input、Card | `<Button variant="primary">` |
| **复合组件** | Form、Modal、Table | `<DataTable columns={...}>` |
| **页面模板** | Dashboard、Login、Settings | 布局骨架 |
| **模式** | 表单验证、空状态、加载 | 交互规范 |

---

## 2. 设计令牌 (Design Tokens)

### 2.1 W3C 标准格式

```json
{
  "color": {
    "primary": { "$value": "#007bff", "$type": "color" },
    "text": { "$value": "#212529", "$type": "color" }
  },
  "spacing": {
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" }
  }
}
```

**工具链**：Style Dictionary → 多平台输出（CSS、iOS、Android、Figma）。

---

## 3. 组件库工程

### 3.1 Headless UI 趋势

| 库 | 特点 | 适用 |
|---|------|------|
| **Radix UI** | 无障碍、无样式 | 自定义设计系统 |
| **Headless UI** | Tailwind 官方 | Tailwind 项目 |
| **React Aria** | Adobe 出品 | 企业级无障碍 |
| **shadcn/ui** | 复制粘贴组件 | 快速启动 |

### 3.2 文档即设计系统

```
Storybook
  ├── 组件文档 (Props、用法)
  ├── 视觉回归测试 (Chromatic)
  ├── 设计令牌展示
  └── 交互式 Playground
```

---

## 4. 反模式

### 反模式 1：过度设计

❌ 为每个像素差异创建新组件。
✅ 用变体 (variant) 和属性组合覆盖 80% 场景。

### 反模式 2：设计与代码脱节

❌ 设计稿更新后，代码手动同步。
✅ 设计令牌双向同步（Figma ↔ Code）。

---

## 5. 总结

设计系统是**产品一致性的基础设施**。

**核心原则**：
1. 令牌先行，组件随后
2. 文档是系统的一部分，不是附属品
3. 可访问性 (a11y) 不是可选项

---

## 参考资源

- [Design Tokens W3C](https://design-tokens.github.io/)
- [Storybook](https://storybook.js.org/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
