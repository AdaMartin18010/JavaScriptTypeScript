# React 19 Deep Dive Guide

> English summary covering React 19 stable features: React Compiler 1.0, Actions, the `use()` Hook, Activity API, View Transitions, and React Server Components (RSC) architecture.
>
> **Status**: React 19.2 stable (early 2026) | React Compiler 1.0 stable (October 2025)

---

## React Compiler 1.0

React Compiler is Meta's build-time auto-optimization tool. **No more manual `useMemo`/`useCallback`**.

- **Auto-memoization**: Analyzes component code and automatically inserts memoization at build time.
- **Effect**: Reduces **35%–60%** of unnecessary re-renders in complex UIs.
- **Requirement**: Must strictly follow React Rules (Hooks rules, immutable updates).

### Migration Strategy

| Scenario | Strategy |
|----------|----------|
| Compiler can safely analyze | Automatic memoization |
| Compiler cannot analyze (dynamic code, eval) | Keep manual `useMemo` |
| Compiler reports errors | Degrades gracefully; component falls back to traditional render |
| Gradual migration | `"use memo"` directive to opt-in explicitly |

```bash
npm install -D babel-plugin-react-compiler
# Or use Next.js / Vite plugin
```

Migration steps:

1. Run `eslint-plugin-react-compiler` static check, fix all Rules of React violations.
2. Enable Compiler gradually by module (`reactCompiler: { target: '18' }`).
3. Keep `useMemo` on critical performance paths as explicit documentation.
4. Monitor `React.Profiler` data in production.

---

## Actions & Form-State Hooks

React 19 introduces **Actions**, deeply integrating async functions with transition states and optimistic updates.

- **`use()` Hook**: Reads Promise / Context during render; supports conditional usage and auto-suspends.
- **`useOptimistic`**: Shows optimistic UI immediately while the server response is pending.
- **`useFormStatus`**: Reads parent `<form>` submission state (`pending`, `data`, `method`, `action`) in child components.
- **`useActionState`**: Manages Action state and error information.

```jsx
import { useOptimistic, useActionState } from 'react';

function Messages({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  async function sendMessage(formData) {
    const message = formData.get('message');
    addOptimisticMessage({ text: message });
    await api.sendMessage(message);
  }

  return (
    <form action={sendMessage}>
      {optimisticMessages.map((msg, i) => (
        <div key={i} style={{ opacity: msg.sending ? 0.5 : 1 }}>{msg.text}</div>
      ))}
      <input name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

### `use()` vs `useContext`

| Feature | `useContext` | `use()` |
|---------|-------------|---------|
| Call position | Top-level only | Any position (if/for/try-catch) |
| Readable objects | Context | Promise + Context |
| Suspense integration | None | Auto-triggers fallback |
| Conditional reads | ❌ | ✅ |

---

## Activity & View Transitions (React 19.2)

- **`<Activity>`** (formerly Offscreen): Preserves component state when hidden and reuses it directly when restored. Ideal for tabs, wizards, and route caching (keep-alive).
- **`<ViewTransition>`**: Based on the browser native View Transitions API. Enables smooth cross-DOM animations for route transitions, list reordering, and image zoom.

```jsx
import { unstable_ViewTransition as ViewTransition } from 'react';

function Gallery({ selectedId }) {
  return (
    <ViewTransition>
      {selectedId ? (
        <DetailView key="detail" id={selectedId} />
      ) : (
        <GridView key="grid" />
      )}
    </ViewTransition>
  );
}
```

---

## React Server Components (RSC) Architecture

### "Server-First" Design Principle

```jsx
// ✅ Server Component (default): direct DB access, zero client JS
async function ProductPage({ id }) {
  const product = await db.products.findById(id);
  return (
    <article>
      <ProductInfo data={product} />
      <ClientReviews productId={id} /> {/* Client interactivity */}
    </article>
  );
}

// ✅ Client Component (explicit mark): only when interactivity needed
'use client';
function ClientReviews({ productId }) {
  const [sort, setSort] = useState('newest');
  return <ReviewsList sort={sort} onSortChange={setSort} />;
}
```

### Boundary Design Matrix

| Pattern | Server Component | Client Component |
|---------|-----------------|------------------|
| Server data fetching | ✅ Direct DB/API query | ❌ Via props or Server Action |
| Zero-JS rendering | ✅ No client JS output | ❌ Must bundle component code |
| SEO-sensitive content | ✅ Full HTML output | ⚠️ Needs SSR/SSG |
| Interactive state | ❌ No useState/useEffect | ✅ Full Hooks support |
| Browser APIs | ❌ No window/document | ✅ Full access |

---

## PPR (Partial Prerendering)

PPR is Next.js 15+'s hybrid rendering strategy, combining a **static shell** with **dynamic content** on the same page.

- **Static shell**: Pre-rendered at build time (navbar, layout, footer, skeleton placeholders).
- **Dynamic content**: Streamed at request time (personalized recommendations, cart, real-time prices).

| Mode | TTFB | Dynamic Content | Cache Strategy |
|------|------|-----------------|----------------|
| SSG | Fastest (CDN) | Not supported | Long-term full-page |
| SSR | Slow (server render) | Full support | Short/no cache |
| ISR | Fast (incremental) | Delayed update | Timed revalidate |
| **PPR** | **Fast (static shell)** | **Streamed dynamic** | **Shell long-term + dynamic short-term** |

---

## RSC Security Architecture

Key threat model for RSC / Server Actions:

| Threat | Risk | Mitigation |
|--------|------|------------|
| Props injection | High | Never serialize untrusted data into props |
| Unauthorized Server Action call | High | Every Action must explicitly validate identity |
| Sensitive data leakage | Medium | RSC can access server secrets; pass carefully |
| ReDoS / server compute abuse | Medium | Timeouts and rate limits on Server Actions |
| Serialization vulnerability | Medium | React 19 restricts serializable types |

---

*For the full Chinese version, see [../categories/01-frontend-frameworks.md](../categories/01-frontend-frameworks.md)*
