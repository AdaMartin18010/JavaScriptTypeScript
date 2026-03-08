/**
 * @file 开发服务器
 * @category Developer Experience → Dev Server
 * @difficulty medium
 * @tags dev-server, hmr, hot-reload
 */

export interface HMRMessage {
  type: 'update' | 'reload' | 'error';
  path?: string;
  timestamp?: number;
  error?: string;
}

export class HMRServer {
  private clients: Set<WebSocket> = new Set();
  private moduleGraph: Map<string, Set<string>> = new Map();
  
  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    ws.addEventListener('close', () => this.clients.delete(ws));
  }
  
  broadcast(message: HMRMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(data);
      }
    });
  }
  
  registerModule(id: string, deps: string[]): void {
    this.moduleGraph.set(id, new Set(deps));
  }
  
  getAffectedModules(changedPath: string): string[] {
    const affected: string[] = [changedPath];
    
    for (const [module, deps] of this.moduleGraph) {
      if (deps.has(changedPath) && !affected.includes(module)) {
        affected.push(module);
        affected.push(...this.getAffectedModules(module));
      }
    }
    
    return [...new Set(affected)];
  }
  
  notifyUpdate(path: string): void {
    const affected = this.getAffectedModules(path);
    
    this.broadcast({
      type: 'update',
      path,
      timestamp: Date.now()
    });
    
    console.log(`[HMR] 更新模块: ${affected.join(', ')}`);
  }
  
  notifyError(error: Error): void {
    this.broadcast({
      type: 'error',
      error: error.message
    });
  }
}

export class FileWatcher {
  private callbacks: Array<(path: string) => void> = [];
  
  onChange(callback: (path: string) => void): void {
    this.callbacks.push(callback);
  }
  
  trigger(path: string): void {
    this.callbacks.forEach(cb => cb(path));
  }
}

export class ErrorOverlay {
  private errors: Array<{ id: string; message: string; frame?: string }> = [];
  
  addError(error: Error, source?: string): void {
    this.errors.push({
      id: Math.random().toString(36).slice(2),
      message: error.message,
      frame: source
    });
    this.render();
  }
  
  clear(): void {
    this.errors = [];
    this.render();
  }
  
  private render(): void {
    if (this.errors.length === 0) {
      console.log('[ErrorOverlay] 无错误');
      return;
    }
    
    console.log('[ErrorOverlay] 错误列表:');
    this.errors.forEach(e => {
      console.log(`  ❌ ${e.message}`);
      if (e.frame) console.log(`     at ${e.frame}`);
    });
  }
}

export class ViteLikeServer {
  private hmr = new HMRServer();
  private watcher = new FileWatcher();
  private overlay = new ErrorOverlay();
  
  constructor(private root: string) {}
  
  async start(port: number = 5173): Promise<void> {
    console.log(`[DevServer] 启动于 http://localhost:${port}`);
    
    this.watcher.onChange((path) => {
      console.log(`[DevServer] 文件变化: ${path}`);
      this.hmr.notifyUpdate(path);
    });
  }
  
  transformModule(id: string, code: string): string {
    const transformed = code.replace(
      /from\s+['"](\.\.?\/[^'"]+)['"]/g,
      `from '/@fs${this.root}/$1'`
    );
    
    return `import '/@vite/client'\n${transformed}`;
  }
}

export function demo(): void {
  console.log('=== 开发者体验工具 ===\n');
  
  const hmr = new HMRServer();
  hmr.registerModule('/src/main.ts', ['/src/utils.ts', '/src/components.ts']);
  hmr.registerModule('/src/components.ts', ['/src/utils.ts']);
  
  console.log('模块依赖图:');
  const affected = hmr.getAffectedModules('/src/utils.ts');
  console.log(`  /src/utils.ts 变更影响: ${affected.join(', ')}`);
  
  const overlay = new ErrorOverlay();
  overlay.addError(new Error('模块解析失败'), '/src/main.ts:10:5');
}
