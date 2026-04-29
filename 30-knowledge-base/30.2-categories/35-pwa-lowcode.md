---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# PWA 与低代码平台（Application Domain）

> **维度**: 应用领域 | **边界**: 本文档聚焦 PWA 应用和低代码平台产品技术，通用 UI 组件库和构建工具请参见 `docs/categories/02-ui-component-libraries.md` 和 `docs/categories/03-build-tools.md`。
> **权威参考**: [web.dev/pwa](https://web.dev/pwa/) | [Workbox Docs](https://developer.chrome.com/docs/workbox/) | [MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) | [W3C Web App Manifest](https://w3c.github.io/manifest/)

---

## 分类概览

| 类别 | 代表技术 | 适用场景 |
|------|----------|----------|
| PWA 框架 | Workbox, Vite PWA | Service Worker、离线应用 |
| 低代码平台 | Appsmith, ToolJet, Budibase | 内部工具、管理后台 |
| 可视化搭建 | React DnD, @dnd-kit, Formily | 拖拽设计器、表单搭建 |
| 报表 BI | Apache ECharts, AntV, Metabase | 数据大屏、可视化报表 |

---

## PWA + 低代码集成对比表

| 维度 | 纯 PWA (Workbox) | 低代码平台 | PWA + 低代码融合 |
|------|-----------------|-----------|-----------------|
| **开发速度** | 中（需手写 SW） | 快（拖拽配置） | 快（配置 + 少量代码） |
| **离线能力** | ✅ Service Worker | ⚠️ 部分支持 | ✅ 完整离线 + 数据同步 |
| **部署方式** | Web / 应用商店 | 自托管 / SaaS | 自托管 PWA + 云端低码 |
| **定制灵活性** | 高 | 低-中 | 中 |
| **数据持久化** | CacheStorage / IndexedDB | 数据库连接器 | 离线队列 + 后端同步 |
| **适用团队** | 前端专业团队 | 业务人员/全栈 | 混合团队 |
| **代表方案** | Vite PWA + 自建后端 | Appsmith, Retool | Budibase PWA + SQLite |
| **成本** | 开发成本高 | SaaS 订阅成本 | 中等（自托管基础设施） |

> 📖 参考：[web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/) | [Low-Code Architecture Patterns](https://martinfowler.com/articles/low-code-architecture.html)

---

## 核心模块

### 低代码平台 (`jsts-code-lab/97-lowcode-platform/`)

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `lowcode-engine.ts` | 低代码引擎 | 组件库、页面设计器（含撤销重做）、React 代码生成、工作流引擎、表达式引擎 |
| `schema-definition.ts` | Schema 定义系统 | 类型安全的组件/页面 Schema、预置组件库、Schema 验证 |
| `01-form-engine.ts` | 表单引擎设计与实现 | 动态表单 Schema、校验引擎、字段联动、数据源绑定 |
| `02-drag-drop-builder.ts` | 拖拽构建器核心 | 画布节点系统、拖拽控制器、撤销重做、放置指示器算法 |
| `03-schema-driven-ui.ts` | JSON Schema 驱动 UI | Schema 解析器、UI 生成器（表单/表格/详情）、多视图生成 |
| `04-workflow-engine.ts` | 工作流引擎基础 | DAG 流程定义、状态机执行、审批节点、任务调度 |

---

## 代码示例：Service Worker + 低代码表单

### 1. Service Worker (Workbox) — 离线优先

```typescript
// sw.ts — Workbox-based service worker for PWA + lowcode
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// 预缓存构建产物
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// 低代码平台 API 路由 — 网络优先，确保实时数据
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/lowcode/'),
  new NetworkFirst({
    cacheName: 'lowcode-api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })
    ]
  })
);

// 表单提交后台同步 — 离线时自动重试
const bgSyncPlugin = new BackgroundSyncPlugin('form-submissions', {
  maxRetentionTime: 24 * 60 // 保留 24 小时
});

registerRoute(
  ({ url }) => url.pathname === '/api/submit-form',
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// 静态资源 — 缓存优先
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

// SPA 导航回退
registerRoute(new NavigationRoute(
  new NetworkFirst({ cacheName: 'html-cache' })
));

// 监听低代码平台消息
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'SYNC_FORMS') {
    // 触发后台同步
    self.registration.sync.register('sync-forms');
  }
});
```

### 2. 低代码表单组件（Schema 驱动）

```tsx
// LowcodeForm.tsx — Schema-driven form with offline support
import { useState, useCallback } from 'react';

interface FormSchema {
  id: string;
  title: string;
  fields: Array<{
    key: string;
    type: 'text' | 'number' | 'select' | 'date';
    label: string;
    required?: boolean;
    options?: string[];
    validation?: { min?: number; max?: number; pattern?: string };
  }>;
}

interface FormSubmission {
  schemaId: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

const SCHEMA: FormSchema = {
  id: 'employee-onboarding',
  title: '员工入职表单',
  fields: [
    { key: 'name', type: 'text', label: '姓名', required: true },
    { key: 'department', type: 'select', label: '部门', required: true, options: ['技术', '产品', '运营'] },
    { key: 'startDate', type: 'date', label: '入职日期', required: true },
    { key: 'yearsExperience', type: 'number', label: '工作年限', validation: { min: 0, max: 50 } }
  ]
};

export default function LowcodeForm() {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<FormSubmission[]>([]);

  const validate = useCallback((field: FormSchema['fields'][0], value: unknown): string | null => {
    if (field.required && (value === undefined || value === '')) return `${field.label} 必填`;
    if (field.validation?.min !== undefined && Number(value) < field.validation.min) return `最小值为 ${field.validation.min}`;
    if (field.validation?.max !== undefined && Number(value) > field.validation.max) return `最大值为 ${field.validation.max}`;
    return null;
  }, []);

  const handleChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
    const field = SCHEMA.fields.find(f => f.key === key);
    if (field) {
      const error = validate(field, value);
      setErrors(prev => ({ ...prev, [key]: error || '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    for (const field of SCHEMA.fields) {
      const error = validate(field, values[field.key]);
      if (error) newErrors[field.key] = error;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const submission: FormSubmission = {
      schemaId: SCHEMA.id,
      data: values,
      timestamp: Date.now(),
      synced: false
    };

    setPending(true);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      if (!response.ok) throw new Error('Submit failed');
      submission.synced = true;
      setValues({});
    } catch (e) {
      // 离线时加入本地队列，Service Worker 后台同步
      setOfflineQueue(prev => [...prev, submission]);
      // 存入 IndexedDB 持久化
      await saveToIndexedDB(submission);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="lowcode-form">
      <h2>{SCHEMA.title}</h2>
      {SCHEMA.fields.map(field => (
        <div key={field.key} className="form-field">
          <label>{field.label}{field.required && <span className="required">*</span>}</label>
          {field.type === 'select' ? (
            <select value={String(values[field.key] ?? '')} onChange={e => handleChange(field.key, e.target.value)}>
              <option value="">请选择</option>
              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={field.type}
              value={String(values[field.key] ?? '')}
              onChange={e => handleChange(field.key, e.target.value)}
            />
          )}
          {errors[field.key] && <span className="error">{errors[field.key]}</span>}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={pending}>
        {pending ? '提交中...' : '提交'}
      </button>
      {offlineQueue.length > 0 && (
        <div className="offline-badge">
          ⏳ 离线队列: {offlineQueue.length} 条待同步
        </div>
      )}
    </div>
  );
}

// IndexedDB helper
async function saveToIndexedDB(submission: FormSubmission): Promise<void> {
  const db = await openDB('lowcode-forms', 1, {
    upgrade(db) { db.createObjectStore('submissions', { keyPath: 'timestamp' }); }
  });
  await db.put('submissions', submission);
}

// openDB polyfill — use idb package in production
function openDB(name: string, version: number, { upgrade }: { upgrade: (db: IDBDatabase) => void }): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => upgrade((e.target as IDBOpenDBRequest).result);
  });
}
```

> 📖 参考：[Workbox 6 Docs](https://developer.chrome.com/docs/workbox/) | [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) | [IndexedDB on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

## PWA 能力矩阵 (2026)

| API | Chrome | Safari (iOS) | Firefox | 说明 |
|-----|--------|-------------|---------|------|
| Service Worker | ✅ | ✅ | ✅ | 离线缓存核心 |
| Web App Manifest | ✅ | ✅ (partial) | ✅ | 安装到主屏幕 |
| Background Sync | ✅ | ❌ | ❌ | 离线任务重试 |
| Push API | ✅ | ⚠️ (Web Push) | ✅ | 推送通知 |
| File System Access | ✅ | ❌ | ❌ | 本地文件读写 |
| Badging API | ✅ | ✅ | ❌ | 图标角标 |
| Screen Wake Lock | ✅ | ✅ | ✅ | 防止屏幕休眠 |
| Web Share | ✅ | ✅ | ✅ | 原生分享 |
| Payment Request | ✅ | ✅ (Apple Pay) | ❌ | 原生支付 |

> 📖 参考：[Fugu API Tracker](https://fugu-tracker.web.app/) | [PWA on iOS](https://firt.dev/pwa-ios/)

---

## 与基础设施的边界

```
应用领域 (本文档)                     基础设施层
├─ PWA 应用产品                        ├─ Service Worker API 规范
├─ 低代码平台产品                      ├─ 组件库 (Ant Design/MUI)
├─ 可视化报表系统                      ├─ 构建工具 (Vite/Webpack)
└─ 无代码工作流                        └─ 状态管理 (Redux/Zustand)
```

---

## 关联资源

- `jsts-code-lab/37-pwa/` — Service Worker、缓存策略、Manifest
- `jsts-code-lab/97-lowcode-platform/` — 低代码引擎、Schema 定义
- `jsts-code-lab/58-data-visualization/` — 图表渲染、动画
- `docs/application-domains-index.md` — 应用领域总索引

---

> 📅 最后更新: 2026-04-27
