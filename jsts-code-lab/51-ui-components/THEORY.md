# UI 组件工程理论：从原子设计到设计系统

> **目标读者**：前端工程师、UI 开发者、设计系统维护者
> **关联文档**：[`docs/categories/51-ui-components.md`](../../docs/categories/51-ui-components.md)
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. 组件架构模式

### 1.1 原子设计方法论

```
Atoms (原子)        → Button, Input, Label
  ↓
Molecules (分子)     → SearchBar = Input + Button
  ↓
Organisms (有机体)   → Header = Logo + Nav + SearchBar
  ↓
Templates (模板)     → 页面布局骨架
  ↓
Pages (页面)         → 具体页面实例
```

### 1.2 组件组合模式

| 模式 | 示例 | 适用 |
|------|------|------|
| **Compound** | `<Select><Option/></Select>` | 强关联组件 |
| **Render Props** | `<DataTable renderRow={...} />` | 自定义渲染 |
| **Slots** | `<Card header={...} body={...} />` | 多区域定制 |
| **HOC** | `withAuth(Component)` | 横切关注点 |
| **Hooks** | `useForm()` | 状态逻辑复用 |

---

## 2. 无头组件 (Headless)

### 2.1 分离逻辑与样式

```typescript
// 逻辑层 (Headless)
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return { isOpen, toggle };
}

// 表现层 (Styled)
function Dropdown() {
  const { isOpen, toggle } = useDropdown();
  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <menu>...</menu>}
    </div>
  );
}
```

---

## 3. 测试策略

```typescript
// 交互测试
test('button click triggers onClick', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalled();
});

// 可访问性测试
test('button is accessible', () => {
  render(<Button>Submit</Button>);
  expect(screen.getByRole('button')).toHaveAccessibleName('Submit');
});
```

---

## 4. 总结

UI 组件的核心是**可预测性**和**可组合性**。

**原则**：
1.  props 是组件的 API，设计时像设计公共库
2.  无头组件让样式自由，逻辑统一
3.  测试覆盖交互、可访问性和视觉回归

---

## 参考资源

- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [A11y Project](https://www.a11yproject.com/)
- [Radix UI](https://www.radix-ui.com/)
