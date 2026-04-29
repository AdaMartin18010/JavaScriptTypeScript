# MVVM 模式（Model-View-ViewModel）

> **定位**：`20-code-lab/20.2-language-patterns/architecture-patterns/mvvm`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决**视图与模型直接耦合**的问题。通过视图模型层实现数据绑定与命令模式，简化 UI 状态同步。MVVM 特别适用于需要大量双向数据绑定的前端/桌面应用。

### 1.2 形式化基础

- **Model**：领域数据与业务规则，不感知 UI 存在。
- **View**：UI 布局与控件，声明式地绑定到 ViewModel。
- **ViewModel**：视图的抽象状态与命令集合，通过**数据绑定**与 View 同步，通过**命令模式**响应用户操作。
- **Binder**：自动同步 View ↔ ViewModel 的机制（框架提供，如 Vue 的响应式系统、MobX、Knockout）。

### 1.3 MVC vs MVP vs MVVM 对比

| 维度 | MVC | MVP | MVVM |
|------|-----|-----|------|
| **View 依赖** | View 依赖 Model | View 不依赖 Model | View 不依赖 Model |
| **控制器角色** | Controller 处理输入 | Presenter 中介通信 | ViewModel 提供可绑定状态 |
| **数据同步** | 手动 | 手动（Presenter 回调） | 自动（双向/单向绑定） |
| **测试性** | Controller 难测 | Presenter 易测 | ViewModel 最易测 |
| **代表框架** | Backbone.js | 早期 Android | Vue, Knockout, WPF |

---

## 二、设计原理

### 2.1 为什么存在

视图直接操作模型导致状态同步逻辑分散。MVVM 通过视图模型层集中管理 UI 状态，配合数据绑定实现自动同步，简化前端开发。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 双向绑定 | 自动同步、少样板 | 调试困难 | 表单密集型 |
| 单向数据流 | 可预测、易调试 | 更多样板代码 | 复杂状态应用 |

### 2.3 与相关技术的对比

与 MVI/Elm 对比：MVVM 双向绑定更灵活，MVI 单向流更可预测。现代框架（如 Vue 3 Composition API）常结合二者优点。

---

## 三、实践映射

### 3.1 从理论到代码

**原生 TypeScript MVVM（手动实现响应式绑定）**

```typescript
// ========== 极简响应式系统（理解 Vue 原理） ==========
class Reactive<T> {
  private _value: T;
  private listeners: Set<() => void> = new Set();

  constructor(initial: T) { this._value = initial; }

  get value() {
    // 在 effect 执行期间收集依赖
    if (currentEffect) this.listeners.add(currentEffect);
    return this._value;
  }

  set value(next: T) {
    if (this._value === next) return;
    this._value = next;
    this.listeners.forEach(fn => fn());
  }
}

let currentEffect: (() => void) | null = null;

function watchEffect(fn: () => void) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}

// ========== ViewModel ==========
class TodoViewModel {
  items = new Reactive<string[]>([]);
  input = new Reactive('');

  addItem() {
    if (!this.input.value.trim()) return;
    this.items.value = [...this.items.value, this.input.value];
    this.input.value = '';
  }

  removeItem(index: number) {
    this.items.value = this.items.value.filter((_, i) => i !== index);
  }
}

// ========== View（DOM 绑定） ==========
class TodoView {
  constructor(private vm: TodoViewModel) {
    const listEl = document.getElementById('todo-list')!;
    const inputEl = document.getElementById('todo-input') as HTMLInputElement;
    const btn = document.getElementById('add-btn')!;

    // 绑定输入框
    watchEffect(() => { inputEl.value = vm.input.value; });
    inputEl.addEventListener('input', e => vm.input.value = (e.target as HTMLInputElement).value);

    // 绑定列表
    watchEffect(() => {
      listEl.innerHTML = '';
      vm.items.value.forEach((item, idx) => {
        const li = document.createElement('li');
        li.textContent = item;
        const del = document.createElement('button');
        del.textContent = '×';
        del.onclick = () => vm.removeItem(idx);
        li.appendChild(del);
        listEl.appendChild(li);
      });
    });

    btn.addEventListener('click', () => vm.addItem());
  }
}

// 运行
const vm = new TodoViewModel();
new TodoView(vm);
```

**Vue 3 Composition API（现代 MVVM）**

```typescript
// Vue 3 风格：使用 ref / computed / watch
import { ref, computed, watch } from 'vue';

function useCounterViewModel() {
  const count = ref(0);
  const double = computed(() => count.value * 2);

  function increment() { count.value++; }
  function decrement() { count.value--; }

  // 副作用自动追踪
  watch(count, (newVal, oldVal) => {
    console.log(`Count changed: ${oldVal} → ${newVal}`);
  });

  return { count, double, increment, decrement };
}

// View（SFC 模板）
// <template>
//   <div>
//     <p>{{ count }} (Double: {{ double }})</p>
//     <button @click="decrement">-</button>
//     <button @click="increment">+</button>
//   </div>
// </template>
```

**React + 自定义 Hook（MVVM 思想）**

```typescript
// ViewModel 封装为 Hook
function useCounterViewModel() {
  const [count, setCount] = useState(0);
  const double = useMemo(() => count * 2, [count]);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);

  return { count, double, increment, decrement };
}

// View：纯展示组件
function CounterView() {
  const vm = useCounterViewModel();
  return (
    <div>
      <p>Count: {vm.count} (Double: {vm.double})</p>
      <button onClick={vm.decrement}>-</button>
      <button onClick={vm.increment}>+</button>
    </div>
  );
}
```

**MobX 响应式（装饰器/可观察对象）**

```typescript
import { makeAutoObservable, autorun } from 'mobx';

class TodoStore {
  items: string[] = [];
  input = '';

  constructor() {
    makeAutoObservable(this);
  }

  addItem() {
    if (!this.input.trim()) return;
    this.items.push(this.input);
    this.input = '';
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }
}

const store = new TodoStore();

// 自动追踪依赖并重新执行
autorun(() => {
  console.log('Items count:', store.items.length);
});
```

**Angular Signals（现代响应式原语）**

```typescript
import { signal, computed, effect } from '@angular/core';

// 创建 Signal
const count = signal(0);
const double = computed(() => count() * 2);

// 副作用
effect(() => {
  console.log('Current count:', count());
});

// 更新
count.set(5);
count.update(v => v + 1);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 双向绑定总是优于单向 | 复杂状态下单向数据流更易调试 |
| 视图模型只是模型的复制 | 视图模型包含视图特定的状态与命令 |
| MVVM 只适用于桌面 | Vue、Angular、Knockout 都是前端 MVVM |

### 3.3 扩展阅读

- [MVVM Pattern — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm)
- [Vue.js Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue.js Reactivity Deep Dive](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Knockout.js Observables](https://knockoutjs.com/documentation/observables.html)
- [MobX Documentation](https://mobx.js.org/README.html)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [MDN: MVC Architecture](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [Microsoft WPF Data Binding](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/data/?view=netdesktop-8.0)
- `20.2-language-patterns/architecture-patterns/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
