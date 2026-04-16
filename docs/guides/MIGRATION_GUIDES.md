# 迁移指南合集

本文档汇总了 JavaScript/TypeScript 生态系统中常见的技术迁移方案，帮助开发团队安全、高效地完成技术栈升级。

---

## 目录

- [迁移指南合集](#迁移指南合集)
  - [目录](#目录)
  - [1. JavaScript 到 TypeScript 迁移指南](#1-javascript-到-typescript-迁移指南)
    - [1.1 评估清单](#11-评估清单)
    - [1.2 渐进式迁移策略](#12-渐进式迁移策略)
      - [阶段一：配置环境（第 1 周）](#阶段一配置环境第-1-周)
      - [阶段二：文件重命名与类型标注（第 2-4 周）](#阶段二文件重命名与类型标注第-2-4-周)
      - [阶段三：严格模式启用（第 5-6 周）](#阶段三严格模式启用第-5-6-周)
    - [1.3 allowJs 配置详解](#13-allowjs-配置详解)
    - [1.4 JSDoc 注释迁移](#14-jsdoc-注释迁移)
    - [1.5 第三方类型定义](#15-第三方类型定义)
    - [1.6 常见问题](#16-常见问题)
    - [1.7 回滚策略](#17-回滚策略)
  - [2. CommonJS 到 ESM 迁移指南](#2-commonjs-到-esm-迁移指南)
    - [2.1 评估清单](#21-评估清单)
    - [2.2 模块格式差异](#22-模块格式差异)
    - [2.3 迁移步骤](#23-迁移步骤)
      - [步骤 1：配置 package.json](#步骤-1配置-packagejson)
      - [步骤 2：语法转换](#步骤-2语法转换)
      - [步骤 3：必须包含文件扩展名](#步骤-3必须包含文件扩展名)
    - [2.4 动态导入转换](#24-动态导入转换)
    - [2.5 \_\_dirname 替代方案](#25-__dirname-替代方案)
    - [2.6 条件导出配置](#26-条件导出配置)
    - [2.7 常见问题](#27-常见问题)
    - [2.8 回滚策略](#28-回滚策略)
  - [3. 类组件到 Hooks 迁移指南](#3-类组件到-hooks-迁移指南)
    - [3.1 评估清单](#31-评估清单)
    - [3.2 生命周期映射](#32-生命周期映射)
    - [3.3 状态管理转换](#33-状态管理转换)
    - [3.4 useEffect 模式](#34-useeffect-模式)
    - [3.5 自定义 Hooks 提取](#35-自定义-hooks-提取)
    - [3.6 常见问题](#36-常见问题)
    - [3.7 回滚策略](#37-回滚策略)
  - [4. Redux 到 Zustand 迁移指南](#4-redux-到-zustand-迁移指南)
    - [4.1 评估清单](#41-评估清单)
    - [4.2 状态切片转换](#42-状态切片转换)
    - [4.3 中间件替换](#43-中间件替换)
    - [4.4 DevTools 集成](#44-devtools-集成)
    - [4.5 异步操作处理](#45-异步操作处理)
    - [4.6 组件迁移示例](#46-组件迁移示例)
    - [4.7 常见问题](#47-常见问题)
    - [4.8 回滚策略](#48-回滚策略)
  - [5. Webpack 到 Vite 迁移指南](#5-webpack-到-vite-迁移指南)
    - [5.1 评估清单](#51-评估清单)
    - [5.2 配置转换](#52-配置转换)
    - [5.3 插件生态对比](#53-插件生态对比)
    - [5.4 开发体验差异](#54-开发体验差异)
    - [5.5 生产构建优化](#55-生产构建优化)
    - [5.6 常见问题](#56-常见问题)
    - [5.7 回滚策略](#57-回滚策略)
  - [附录：迁移检查清单模板](#附录迁移检查清单模板)
    - [通用迁移流程](#通用迁移流程)
  - [参考资源](#参考资源)

---

## 1. JavaScript 到 TypeScript 迁移指南

### 1.1 评估清单

在开始迁移前，请确认以下事项：

- [ ] 项目构建工具支持 TypeScript（Webpack/Vite/Rollup 等）
- [ ] 团队至少有 2 名成员熟悉 TypeScript 基础语法
- [ ] 所有第三方依赖都有类型定义（@types/* 或自带 d.ts）
- [ ] 已建立代码规范（ESLint + Prettier + tsconfig）
- [ ] 有充足的测试覆盖率作为安全网
- [ ] 制定迁移时间表和里程碑

### 1.2 渐进式迁移策略

#### 阶段一：配置环境（第 1 周）

```bash
# 安装 TypeScript 及相关依赖
npm install -D typescript @types/node @types/react @types/react-dom
npx tsc --init
```

**tsconfig.json 初始配置：**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": false,
    "noImplicitAny": false,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 阶段二：文件重命名与类型标注（第 2-4 周）

1. **从入口文件开始**：优先迁移工具函数和配置文件
2. **文件重命名策略**：`.js` → `.ts`, `.jsx` → `.tsx`
3. **逐层深入**：按模块依赖关系，从叶子节点向根节点迁移

#### 阶段三：严格模式启用（第 5-6 周）

逐步开启严格选项：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 1.3 allowJs 配置详解

`allowJs` 是实现渐进式迁移的关键配置：

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

**配置说明：**

| 配置项 | 值 | 效果 |
|--------|-----|------|
| `allowJs: true` | 允许编译 JS 文件 | JS 和 TS 可以共存 |
| `checkJs: true` | 对 JS 文件进行类型检查 | 基于 JSDoc 或推断 |
| `checkJs: false` | 不检查 JS 文件 | 仅作为过渡方案 |

### 1.4 JSDoc 注释迁移

**迁移前（JSDoc）：**

```javascript
/**
 * @param {string} userId
 * @param {Object} options
 * @param {boolean} options.includeInactive
 * @returns {Promise<User[]>}
 */
async function fetchUsers(userId, options = {}) {
  // ...
}
```

**迁移后（TypeScript）：**

```typescript
interface FetchUsersOptions {
  includeInactive?: boolean;
}

async function fetchUsers(
  userId: string,
  options: FetchUsersOptions = {}
): Promise<User[]> {
  // ...
}
```

**自动化工具推荐：**

```bash
# ts-migrate：Facebook 开源的大规模迁移工具
npx ts-migrate-full <project-folder>

# 或按步骤执行
npx ts-migrate init <folder>
npx ts-mmigrate rename <folder>
npx ts-migrate codemods <folder>
```

### 1.5 第三方类型定义

```bash
# 查找类型定义
npm search @types/lodash

# 安装类型定义
npm install -D @types/lodash @types/express

# 针对没有官方类型的库，创建声明文件
```

**自定义类型声明（`src/types/declarations.d.ts`）：**

```typescript
// 为没有类型的库提供声明
declare module 'legacy-library' {
  export function init(config: unknown): void;
  export const version: string;
}

// 处理图片资源
declare module '*.png' {
  const content: string;
  export default content;
}
```

### 1.6 常见问题

| 问题 | 解决方案 |
|------|----------|
| "Cannot find module" | 检查 `@types/*` 是否安装，或添加 `.d.ts` 声明 |
| "Property 'X' does not exist" | 检查 `lib` 配置，可能需要添加 `"DOM"` 或 `"ES2020"` |
| 第三方库类型不兼容 | 使用 `declare module` 覆盖或使用 `any` 临时过渡 |
| 构建性能下降 | 启用 `incremental: true`，配置 `tsconfig.build.json` |
| 循环依赖报错 | 重构代码结构，使用接口而非具体实现 |

### 1.7 回滚策略

1. **Git 分支保护**：在独立分支进行迁移，保留原分支
2. **渐进提交**：每个文件迁移后单独提交
3. **紧急回滚**：

   ```bash
   git checkout main -- src/
   npm uninstall typescript @types/*
   ```

4. **部分回滚**：仅回滚有问题的文件到 `.js` 版本

---

## 2. CommonJS 到 ESM 迁移指南

### 2.1 评估清单

- [ ] 运行时支持 ESM（Node.js 14+）
- [ ] 所有依赖都支持 ESM（检查 `package.json` 的 `exports` 字段）
- [ ] 构建工具已配置 ESM 输出
- [ ] 测试框架支持 ESM（Jest/Mocha/Vitest）
- [ ] CI/CD 流程可处理 ESM

### 2.2 模块格式差异

| 特性 | CommonJS (CJS) | ESM (ES Modules) |
|------|----------------|------------------|
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载方式 | 同步加载 | 异步/静态加载 |
| 顶层 `this` | `module.exports` | `undefined` |
| 文件扩展名 | `.js` | `.mjs` 或 `"type": "module"` |
| 循环依赖 | 部分支持 | 有限支持 |
| 动态导入 | `require()` | `import()` |

### 2.3 迁移步骤

#### 步骤 1：配置 package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "engines": {
    "node": ">=14.16.0"
  }
}
```

#### 步骤 2：语法转换

**转换对照表：**

```javascript
// Before: CommonJS
const path = require('path');
const { readFile } = require('fs/promises');
const utils = require('./utils');

module.exports = { foo, bar };
exports.baz = baz;
```

```javascript
// After: ESM
import path from 'path';
import { readFile } from 'fs/promises';
import * as utils from './utils.js'; // 注意：必须包含文件扩展名

export { foo, bar };
export const baz = baz;
export default main;
```

#### 步骤 3：必须包含文件扩展名

```javascript
// ❌ 错误
import { helper } from './helpers';

// ✅ 正确
import { helper } from './helpers.js';
import { config } from '../config/index.js';
```

**目录导入处理：**

```javascript
// 创建 index.js 显式导出
// config/index.js
export { default as dbConfig } from './db.js';
export { default as appConfig } from './app.js';
```

### 2.4 动态导入转换

**CommonJS 动态导入：**

```javascript
const config = process.env.NODE_ENV === 'production'
  ? require('./config.prod')
  : require('./config.dev');
```

**ESM 动态导入：**

```javascript
const config = await (process.env.NODE_ENV === 'production'
  ? import('./config.prod.js')
  : import('./config.dev.js'));
```

**条件加载模式：**

```javascript
// 仅在需要时加载大型依赖
async function processImage(file) {
  if (needsOptimization) {
    const { optimize } = await import('image-optimizer');
    return optimize(file);
  }
  return file;
}
```

### 2.5 __dirname 替代方案

ESM 中没有 `__dirname` 和 `__filename`，需要手动创建：

```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用
const configPath = join(__dirname, '../config.json');
```

**封装为工具函数（`utils/path.js`）：**

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function getDirname(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

export function getFilename(metaUrl) {
  return fileURLToPath(metaUrl);
}
```

**使用：**

```javascript
import { getDirname } from './utils/path.js';

const __dirname = getDirname(import.meta.url);
```

### 2.6 条件导出配置

```json
{
  "name": "my-library",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./package.json": "./package.json"
  }
}
```

**构建双格式输出：**

```javascript
// rollup.config.js
export default [
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/index.js', format: 'es' },
      { file: 'dist/index.cjs', format: 'cjs' }
    ]
  }
];
```

### 2.7 常见问题

| 问题 | 解决方案 |
|------|----------|
| `ERR_MODULE_NOT_FOUND` | 确保导入路径包含 `.js` 扩展名 |
| `require is not defined` | 使用 `import` 替代，或使用 `createRequire` |
| `__dirname is not defined` | 使用 `import.meta.url` + `fileURLToPath` |
| `Cannot use import statement` | 检查文件扩展名是否为 `.mjs` 或 `package.json` 是否设置 `"type": "module"` |
| JSON 导入失败 | 使用 `import { readFile } from 'fs/promises'` + `JSON.parse` |

### 2.8 回滚策略

1. **双模式支持**：保持 CJS 和 ESM 同时可用
2. **package.json 回滚**：

   ```json
   {
     "type": "commonjs"
   }
   ```

3. **使用 createRequire 过渡**：

   ```javascript
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
   const legacy = require('./legacy.cjs');
   ```

---

## 3. 类组件到 Hooks 迁移指南

### 3.1 评估清单

- [ ] React 版本 >= 16.8（Hooks 最低要求）
- [ ] 了解类组件的生命周期方法
- [ ] 熟悉基础 Hooks（useState, useEffect, useContext）
- [ ] 项目中有足够的测试覆盖
- [ ] 确定迁移优先级（高频使用组件优先）

### 3.2 生命周期映射

| 类组件生命周期 | Hooks 等价物 | 说明 |
|---------------|-------------|------|
| `constructor` | `useState` 初始化 | 状态初始化直接放入 useState |
| `componentDidMount` | `useEffect(() => {}, [])` | 空依赖数组 |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` | 指定依赖项 |
| `componentWillUnmount` | `useEffect` 返回函数 | 清理函数 |
| `shouldComponentUpdate` | `React.memo` + `useMemo` | 性能优化 |
| `getDerivedStateFromProps` | `useEffect` 或派生状态 | 尽量避免 |
| `componentDidCatch` | `static getDerivedStateFromError` + `componentDidCatch` | 错误边界仍需类组件 |

### 3.3 状态管理转换

**类组件状态：**

```jsx
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: false,
      error: null
    };
  }

  updateUser = (newUser) => {
    this.setState({ user: newUser });
  };

  render() {
    const { user, loading, error } = this.state;
    // ...
  }
}
```

**Hooks 版本：**

```jsx
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  // ...
}
```

**或使用 useReducer 管理复杂状态：**

```jsx
const initialState = { user: null, loading: false, error: null };

function userReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function UserProfile() {
  const [state, dispatch] = useReducer(userReducer, initialState);
  // ...
}
```

### 3.4 useEffect 模式

**数据获取模式：**

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const data = await api.getUsers();
        if (!cancelled) {
          setUsers(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    // 清理函数
    return () => {
      cancelled = true;
    };
  }, []);
}
```

**订阅模式：**

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => {
      connection.disconnect();
    };
  }, [roomId]); // 依赖变化时重新订阅
}
```

**防抖/节流模式：**

```jsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchAPI(query).then(setResults);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
}
```

### 3.5 自定义 Hooks 提取

**提取重复逻辑：**

```jsx
// hooks/useLocalStorage.js
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) || initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(stored) : value;
    setStored(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [stored, setValue];
}

// hooks/useFetch.js
export function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(url);
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error });
      }
    };

    fetchData();
  }, [url]);

  return state;
}
```

### 3.6 常见问题

| 问题 | 解决方案 |
|------|----------|
| `useEffect` 无限循环 | 检查依赖数组，使用函数式更新 `setState(prev => ...)` |
| 闭包陷阱（stale closure） | 使用 `useRef` 保存最新值，或在依赖中包含所有使用变量 |
| 状态合并 vs 替换 | `useState` 不会自动合并对象，需要手动展开 `{ ...prev, ...new }` |
| `this` 指向问题消失 | 但注意事件处理函数直接使用变量不会自动绑定 |
| 性能问题 | 使用 `useMemo`、`useCallback`、`React.memo` 优化 |

### 3.7 回滚策略

1. **组件级回滚**：保留类组件版本作为备份
2. **特性开关**：

   ```jsx
   const USE_HOOKS = process.env.REACT_APP_USE_HOOKS;

   export default USE_HOOKS ? UserProfileHooks : UserProfileClass;
   ```

3. **渐进式迁移**：保留部分类组件，优先迁移纯展示组件

---

## 4. Redux 到 Zustand 迁移指南

### 4.1 评估清单

- [ ] 项目 Redux 版本 >= 4.0
- [ ] 了解当前 Redux 架构（Redux Toolkit 或传统 Redux）
- [ ] 确认中间件使用情况（redux-thunk, redux-saga, redux-observable）
- [ ] 团队接受新状态管理方案
- [ ] 有集成测试覆盖关键业务流程

### 4.2 状态切片转换

**Redux Toolkit 切片：**

```javascript
// store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const fetchUser = createAsyncThunk('user/fetch', async (userId) => {
  const response = await api.getUser(userId);
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  reducers: {
    updateUser: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  }
});

export const { updateUser } = userSlice.actions;
export default userSlice.reducer;
```

**Zustand 等价实现：**

```javascript
// store/userStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUserStore = create(devtools((set, get) => ({
  data: null,
  loading: false,

  updateUser: (updates) => set(
    (state) => ({
      data: { ...state.data, ...updates }
    }),
    false,
    'user/updateUser'
  ),

  fetchUser: async (userId) => {
    set({ loading: true }, false, 'user/fetchUser/pending');
    try {
      const response = await api.getUser(userId);
      set({ data: response.data, loading: false }, false, 'user/fetchUser/fulfilled');
    } catch (error) {
      set({ loading: false }, false, 'user/fetchUser/rejected');
      throw error;
    }
  }
}), { name: 'UserStore' }));
```

**多 store 组合：**

```javascript
// store/index.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      login: (token) => set({ token }),
      logout: () => set({ token: null })
    }),
    { name: 'auth-storage' }
  )
);

export const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  }))
}));
```

### 4.3 中间件替换

| Redux 中间件 | Zustand 替代方案 |
|-------------|-----------------|
| `redux-thunk` | 直接在 store 中写异步方法 |
| `redux-saga` | 使用独立 saga 或转移到组件层处理 |
| `redux-persist` | `zustand/middleware` 的 `persist` |
| `redux-logger` | `zustand/middleware` 的 `devtools` 或 `logger` |
| `immer` | Zustand 原生支持直接修改语法 |

**持久化配置：**

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, language: state.language })
    }
  )
);
```

### 4.4 DevTools 集成

```javascript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        count: 0,
        increment: () => set((draft) => { draft.count += 1; }),
        decrement: () => set((draft) => { draft.count -= 1; })
      }))
    ),
    {
      name: 'MyStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);
```

### 4.5 异步操作处理

**简单异步：**

```javascript
const useStore = create((set) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    set({ loading: true });
    const posts = await api.getPosts();
    set({ posts, loading: false });
  }
}));
```

**带取消的异步：**

```javascript
const useStore = create((set, get) => ({
  data: null,
  abortController: null,

  fetchData: async (params) => {
    // 取消之前的请求
    get().abortController?.abort();

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const data = await api.getData(params, { signal: controller.signal });
      set({ data, abortController: null });
    } catch (error) {
      if (error.name !== 'AbortError') {
        set({ abortController: null });
        throw error;
      }
    }
  }
}));
```

### 4.6 组件迁移示例

**Redux 连接组件：**

```jsx
import { useSelector, useDispatch } from 'react-redux';

function UserProfile({ userId }) {
  const user = useSelector(state => state.user.data);
  const loading = useSelector(state => state.user.loading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [userId, dispatch]);

  // ...
}
```

**Zustand 版本：**

```jsx
import { useUserStore } from './store/userStore';
import { shallow } from 'zustand/shallow';

function UserProfile({ userId }) {
  // 选择多个状态（使用 shallow 防止不必要的重渲染）
  const { data: user, loading, fetchUser } = useUserStore(
    state => ({ data: state.data, loading: state.loading, fetchUser: state.fetchUser }),
    shallow
  );

  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);

  // ...
}
```

### 4.7 常见问题

| 问题 | 解决方案 |
|------|----------|
| 性能问题（过多重渲染） | 使用选择器函数精确订阅状态，或使用 `shallow` 比较 |
| 跨 store 通信 | 在 store 定义中直接导入其他 store，或使用事件总线 |
| 服务端渲染问题 | 确保每个请求创建独立的 store 实例 |
| TypeScript 类型推导 | 使用 `create<StoreType>()` 显式指定类型 |
| 状态不可预测更新 | 使用 Immer 中间件或严格遵循不可变更新模式 |

### 4.8 回滚策略

1. **双状态管理并存**：

   ```javascript
   // 使用特性开关
   const USE_ZUSTAND = process.env.REACT_APP_USE_ZUSTAND;

   export const useUser = USE_ZUSTAND ? useZustandUser : useReduxUser;
   ```

2. **逐步迁移按模块**：
   - 先迁移非关键 store
   - 保留 Redux 用于复杂异步流程

3. **完全回滚**：

   ```bash
   npm uninstall zustand
   npm install @reduxjs/toolkit react-redux
   git checkout main -- src/store/
   ```

---

## 5. Webpack 到 Vite 迁移指南

### 5.1 评估清单

- [ ] Node.js 版本 >= 18（Vite 5+ 要求）
- [ ] 项目使用 ES Modules
- [ ] 检查所有 Webpack 插件是否有 Vite 替代品
- [ ] 确认需要 SSR 的页面和方式
- [ ] 有构建产物对比基准（构建时间、产物大小）

### 5.2 配置转换

**目录结构对比：**

```
# Webpack 项目
project/
├── webpack.config.js
├── webpack.dev.js
├── webpack.prod.js
├── babel.config.js
└── src/
    └── index.js

# Vite 项目
project/
├── vite.config.js
├── index.html          # Vite 需要 HTML 入口
└── src/
    └── main.js
```

**Webpack 配置：**

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  devServer: {
    port: 3000,
    hot: true
  }
};
```

**Vite 等价配置：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material']
        }
      }
    }
  }
});
```

**HTML 入口文件：**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Vite 自动注入脚本 -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 5.3 插件生态对比

| 功能 | Webpack 插件 | Vite 插件 |
|-----|-------------|-----------|
| React 支持 | `@babel/preset-react` | `@vitejs/plugin-react` |
| TypeScript | `ts-loader` / `babel-loader` | 原生支持 |
| CSS 处理 | `css-loader` + `mini-css-extract-plugin` | 原生支持 + `postcss` |
| 环境变量 | `dotenv-webpack` | 原生支持 `import.meta.env` |
| PWA | `workbox-webpack-plugin` | `vite-plugin-pwa` |
| 压缩 | `terser-webpack-plugin` | 内置 Rollup 压缩 |
| 代码分割 | `SplitChunksPlugin` | 内置 Rollup 代码分割 |
| SVG 组件 | `@svgr/webpack` | `vite-plugin-svgr` |
| 检查器 | `fork-ts-checker-webpack-plugin` | 独立运行 `tsc --noEmit` |

### 5.4 开发体验差异

| 特性 | Webpack | Vite |
|-----|---------|------|
| 冷启动 | 较慢（需打包依赖） | 极快（原生 ESM） |
| HMR | 中等 | 极快（ESM 原生支持） |
| 依赖预打包 | 构建时处理 | 首次启动时预打包 |
| 配置复杂度 | 较高 | 较低 |
| 生态成熟度 | 非常成熟 | 快速追赶中 |

**环境变量迁移：**

```javascript
// Webpack: process.env.REACT_APP_API_URL
const API_URL = process.env.REACT_APP_API_URL;

// Vite: import.meta.env.VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL;
```

**`.env` 文件：**

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp

# 非 VITE_ 前缀变量不会暴露到客户端
PRIVATE_KEY=secret
```

### 5.5 生产构建优化

**代码分割配置：**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的依赖单独打包
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router';
            if (id.includes('lodash')) return 'utils';
            return 'vendor';
          }
          // 按路由分割
          if (id.includes('/pages/')) {
            return 'pages';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

**资源处理：**

```javascript
// 动态导入（自动代码分割）
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 显式预加载
const prefetchAbout = () => {
  const About = import(/* webpackPrefetch: true */ './pages/About');
};

// 动态导入静态资源
const getImageUrl = (name) => new URL(`./assets/${name}.png`, import.meta.url).href;
```

### 5.6 常见问题

| 问题 | 解决方案 |
|------|----------|
| `require is not defined` | 将 `require()` 替换为 `import`，或使用 `createRequire` |
| `__dirname` 报错 | 使用 `import.meta.url` 替代 |
| 某些依赖不兼容 ESM | 配置 `optimizeDeps.include` 预打包 |
| 环境变量未生效 | 检查前缀是否为 `VITE_`，服务端使用 `loadEnv` |
| CSS 变量未解析 | 配置 `css.preprocessorOptions` |
| 代理配置不生效 | 检查 `server.proxy` 配置格式 |

**依赖预打包配置：**

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    include: [
      'lodash-es',
      '@ant-design/icons',
      'moment'
    ],
    exclude: [
      'some-problematic-dep'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
```

### 5.7 回滚策略

1. **保留 Webpack 配置**：

   ```
   backup/
   ├── webpack.config.js.backup
   └── babel.config.js.backup
   ```

2. **双配置并行**：

   ```json
   {
     "scripts": {
       "dev:webpack": "webpack serve",
       "dev:vite": "vite",
       "build:webpack": "webpack --mode production",
       "build:vite": "vite build"
     }
   }
   ```

3. **紧急回滚**：

   ```bash
   # 恢复 Webpack 配置
   git checkout main -- webpack.config.js babel.config.js

   # 修改 package.json 脚本指向 Webpack
   npm install
   npm run build:webpack
   ```

---

## 附录：迁移检查清单模板

### 通用迁移流程

```
□ 1. 评估阶段
  □ 技术调研和方案对比
  □ 风险评估和影响分析
  □ 制定时间表和里程碑
  □ 准备测试环境和回滚方案

□ 2. 准备阶段
  □ 安装新依赖
  □ 配置开发环境
  □ 创建迁移分支
  □ 准备自动化测试

□ 3. 执行阶段
  □ 配置文件迁移
  □ 代码逐步迁移（按模块/优先级）
  □ 单元测试验证
  □ 集成测试验证

□ 4. 验证阶段
  □ 功能完整性测试
  □ 性能基准对比
  □ 安全扫描
  □ 代码审查

□ 5. 上线阶段
  □ 灰度发布
  □ 监控关键指标
  □ 收集用户反馈
  □ 全量发布

□ 6. 收尾阶段
  □ 清理旧代码和依赖
  □ 更新文档
  □ 团队知识分享
  □ 总结经验教训
```

---

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Node.js ESM 文档](https://nodejs.org/api/esm.html)
- [React Hooks 官方文档](https://react.dev/reference/react)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Vite 官方文档](https://vitejs.dev/guide/)

---

*文档版本: 1.0*
*最后更新: 2026-04-08*
