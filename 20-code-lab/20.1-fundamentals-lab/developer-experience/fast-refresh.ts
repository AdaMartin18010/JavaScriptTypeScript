/**
 * @file Fast Refresh (React 热重载)
 * @category Developer Experience → Fast Refresh
 * @difficulty medium
 * @tags fast-refresh, react, hmr, hot-reloading
 *
 * @description
 * Fast Refresh 是 React 官方的热重载实现，
 * 能够在不丢失组件状态的情况下更新代码。
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ComponentSignature {
  key: string;
  filename: string;
  componentName: string;
  hooks?: string[];
  isComponent: boolean;
}

export interface RefreshUpdate {
  type: 'component' | 'hook' | 'style';
  id: string;
  code?: string;
  filename: string;
}

export interface RefreshState {
  // 组件实例映射
  instances: Map<string, unknown>;
  // 组件状态存储
  persistentState: Map<string, unknown>;
  // 签名记录
  signatures: Map<string, ComponentSignature>;
  // 更新计数
  updateCount: number;
}

// ============================================================================
// 签名生成器
// ============================================================================

export class SignatureGenerator {
  /**
   * 为组件生成唯一签名
   * 签名基于组件名、文件名和使用的 Hooks
   */
  generate(filename: string, componentName: string, hooks: string[] = []): ComponentSignature {
    const hooksHash = hooks.length > 0 
      ? this.hashString(hooks.join(','))
      : '';
    
    return {
      key: `${filename}#${componentName}${hooksHash ? '#' + hooksHash : ''}`,
      filename,
      componentName,
      hooks,
      isComponent: this.isReactComponent(componentName)
    };
  }

  /**
   * 判断是否是 React 组件
   * 简化判断：以大写字母开头或包含特定后缀
   */
  private isReactComponent(name: string): boolean {
    return /^[A-Z]/.test(name) || 
           /(Component|Page|Layout|Provider)$/.test(name);
  }

  /**
   * 简单的字符串哈希
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 比较两个签名，判断是否兼容
   * 兼容意味着可以保留状态
   */
  isCompatible(oldSig: ComponentSignature, newSig: ComponentSignature): boolean {
    // 文件名必须相同
    if (oldSig.filename !== newSig.filename) return false;
    
    // 组件名必须相同
    if (oldSig.componentName !== newSig.componentName) return false;
    
    // Hooks 必须一致（数量和类型）
    if (oldSig.hooks?.length !== newSig.hooks?.length) return false;
    
    if (oldSig.hooks && newSig.hooks) {
      for (let i = 0; i < oldSig.hooks.length; i++) {
        if (oldSig.hooks[i] !== newSig.hooks[i]) {
          return false;
        }
      }
    }
    
    return true;
  }
}

// ============================================================================
// Fast Refresh 运行时
// ============================================================================

export class FastRefreshRuntime {
  private signatures = new Map<string, ComponentSignature>();
  private states = new Map<string, unknown>();
  private generator = new SignatureGenerator();
  private pendingUpdates: RefreshUpdate[] = [];
  private isRegistered = false;

  /**
   * 注册组件
   */
  register(type: unknown, filename: string, componentName: string): void {
    if (!this.isRegistered) {
      this.setupHandlers();
    }

    // 提取 Hooks（简化实现，实际通过 Babel 插件注入）
    const hooks = this.extractHooks(type);
    
    const signature = this.generator.generate(filename, componentName, hooks);
    const key = signature.key;

    // 检查是否是更新
    if (this.signatures.has(key)) {
      const oldSig = this.signatures.get(key)!;
      
      if (this.generator.isCompatible(oldSig, signature)) {
        console.log(`[FastRefresh] 兼容更新: ${componentName}`);
        // 保留状态
      } else {
        console.log(`[FastRefresh] 不兼容更新: ${componentName}，状态将被重置`);
        this.states.delete(key);
      }
    }

    this.signatures.set(key, signature);
    
    // 存储组件状态（如果存在）
    if (this.hasState(type)) {
      this.states.set(key, this.getState(type));
    }
  }

  /**
   * 执行热更新
   */
  performReactRefresh(): void {
    if (this.pendingUpdates.length === 0) return;

    console.log(`[FastRefresh] 执行 ${this.pendingUpdates.length} 个更新`);

    for (const update of this.pendingUpdates) {
      console.log(`  - ${update.filename}: ${update.type}`);
    }

    this.pendingUpdates = [];
    
    // 触发 React 重新渲染
    this.scheduleUpdate();
  }

  /**
   * 接收更新
   */
  handleUpdate(update: RefreshUpdate): void {
    this.pendingUpdates.push(update);
    
    // 延迟执行，批量处理
    if (this.pendingUpdates.length === 1) {
      setTimeout(() => { this.performReactRefresh(); }, 30);
    }
  }

  /**
   * 获取组件的持久化状态
   */
  getPersistentState(componentKey: string): unknown {
    return this.states.get(componentKey);
  }

  /**
   * 设置组件的持久化状态
   */
  setPersistentState(componentKey: string, state: unknown): void {
    this.states.set(componentKey, state);
  }

  /**
   * 提取 Hooks（简化实现）
   */
  private extractHooks(component: unknown): string[] {
    // 实际实现通过 Babel 插件静态分析
    // 这里模拟一些常见的 Hooks
    return ['useState', 'useEffect'];
  }

  /**
   * 检查组件是否有状态
   */
  private hasState(component: unknown): boolean {
    // 简化判断
    return component !== null && typeof component === 'object';
  }

  /**
   * 获取组件状态
   */
  private getState(component: unknown): unknown {
    return { __is_preserved: true };
  }

  /**
   * 设置更新处理器
   */
  private setupHandlers(): void {
    this.isRegistered = true;
    
    if (typeof window !== 'undefined') {
      // 浏览器环境：拦截错误
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => {
        // 过滤掉 Fast Refresh 相关的内部错误
        const message = args[0] as string;
        if (typeof message === 'string' && message.includes('fast-refresh')) {
          return;
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  /**
   * 调度更新
   */
  private scheduleUpdate(): void {
    // 在 React 中，这会调用 ReactDOM.render 或 forceUpdate
    console.log('[FastRefresh] 触发 React 重新渲染');
  }

  /**
   * 获取统计信息
   */
  getStats(): { registered: number; states: number; pendingUpdates: number } {
    return {
      registered: this.signatures.size,
      states: this.states.size,
      pendingUpdates: this.pendingUpdates.length
    };
  }
}

// ============================================================================
// Babel 风格转换器（代码转换示例）
// ============================================================================

export class RefreshTransformer {
  /**
   * 为组件代码注入 Fast Refresh 注册代码
   */
  transform(code: string, filename: string): string {
    // 检测导出的组件
    const componentPattern = /export\s+(?:default\s+)?(?:function|const|let|var)\s+(\w+)/g;
    const components: string[] = [];
    
    let match;
    while ((match = componentPattern.exec(code)) !== null) {
      components.push(match[1]);
    }

    if (components.length === 0) {
      return code;
    }

    // 注入注册代码
    const registrationCode = components.map(comp => 
      `__register__(${comp}, ${JSON.stringify(filename)}, ${JSON.stringify(comp)});`
    ).join('\n');

    // 添加 HMR 接受代码
    const hmrCode = `
if (import.meta.hot) {
  import.meta.hot.accept();
}
`;

    return `${code}\n${registrationCode}\n${hmrCode}`;
  }

  /**
   * 生成刷新边界代码
   * 用于包裹组件模块
   */
  generateRefreshBoundary(components: string[]): string {
    return `
// Fast Refresh Boundary
const prevRefreshReg = window.$RefreshReg$;
const prevRefreshSig = window.$RefreshSig$;

window.$RefreshReg$ = (type, id) => {
  __register__(type, __filename, id);
};

window.$RefreshSig$ = () => {
  let status = 'begin';
  let savedHook;
  return (type, key, forceReset, getCustomHooks) => {
    if (key === null) {
      status = 'needsSignature';
    } else if (status === 'needsSignature') {
      status = 'passed';
    }
    return type;
  };
};

${components.map(c => `const __${c}_Original = ${c};`).join('\n')}

try {
  // Original module code here
} finally {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
`.trim();
  }
}

// ============================================================================
// 错误恢复
// ============================================================================

export class RefreshErrorBoundary {
  private hasError = false;
  private error: Error | null = null;

  /**
   * 捕获错误
   */
  catchError(error: Error): void {
    this.hasError = true;
    this.error = error;
    console.error('[FastRefresh] 组件渲染错误:', error);
  }

  /**
   * 重置错误状态
   */
  reset(): void {
    this.hasError = false;
    this.error = null;
  }

  /**
   * 是否可以恢复
   */
  canRecover(): boolean {
    return this.hasError && this.error !== null;
  }

  /**
   * 尝试恢复
   */
  attemptRecovery(): boolean {
    if (this.canRecover()) {
      this.reset();
      console.log('[FastRefresh] 尝试恢复渲染');
      return true;
    }
    return false;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Fast Refresh 演示 ===\n');

  const runtime = new FastRefreshRuntime();
  const transformer = new RefreshTransformer();
  const generator = new SignatureGenerator();

  // 1. 模拟组件注册
  console.log('--- 组件注册 ---');
  
  const CounterComponent = { name: 'Counter', state: { count: 5 } };
  runtime.register(CounterComponent, '/src/Counter.tsx', 'Counter');
  
  const AppComponent = { name: 'App' };
  runtime.register(AppComponent, '/src/App.tsx', 'App');

  console.log('注册统计:', runtime.getStats());

  // 2. 模拟代码转换
  console.log('\n--- 代码转换 ---');
  const originalCode = `
export function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

export default Counter;
`;
  const transformedCode = transformer.transform(originalCode, '/src/Counter.tsx');
  console.log('转换后的代码:');
  console.log(transformedCode);

  // 3. 签名兼容性测试
  console.log('\n--- 签名兼容性 ---');
  const sig1 = generator.generate('/src/Button.tsx', 'Button', ['useState']);
  const sig2 = generator.generate('/src/Button.tsx', 'Button', ['useState']);
  const sig3 = generator.generate('/src/Button.tsx', 'Button', ['useState', 'useEffect']);

  console.log('sig1 和 sig2 兼容:', generator.isCompatible(sig1, sig2));
  console.log('sig1 和 sig3 兼容:', generator.isCompatible(sig1, sig3));

  // 4. 模拟热更新
  console.log('\n--- 热更新 ---');
  const update: RefreshUpdate = {
    type: 'component',
    id: 'Counter',
    filename: '/src/Counter.tsx',
    code: 'export function Counter() { ... }'
  };

  runtime.handleUpdate(update);
  runtime.handleUpdate({ ...update, filename: '/src/Button.tsx' });
  
  console.log('更新前统计:', runtime.getStats());
  runtime.performReactRefresh();
  console.log('更新后统计:', runtime.getStats());

  // 5. 错误恢复
  console.log('\n--- 错误恢复 ---');
  const errorBoundary = new RefreshErrorBoundary();
  errorBoundary.catchError(new Error('Render error'));
  console.log('可以恢复:', errorBoundary.canRecover());
  errorBoundary.attemptRecovery();
  console.log('恢复后状态:', errorBoundary.canRecover());
}
