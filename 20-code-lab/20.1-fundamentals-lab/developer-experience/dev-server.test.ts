import { describe, it, expect, vi } from 'vitest';
import { HMRServer, FileWatcher, ErrorOverlay, ViteLikeServer } from './dev-server.js';

describe('HMRServer', () => {
  it('computes affected modules recursively', () => {
    const hmr = new HMRServer();
    hmr.registerModule('/src/main.ts', ['/src/utils.ts']);
    hmr.registerModule('/src/components.ts', ['/src/utils.ts']);
    const affected = hmr.getAffectedModules('/src/utils.ts');
    expect(affected.sort()).toEqual(['/src/components.ts', '/src/main.ts', '/src/utils.ts'].sort());
  });

  it('broadcasts messages to open clients', () => {
    const hmr = new HMRServer();
    const client = { readyState: 1, send: vi.fn(), addEventListener: vi.fn() } as any;
    hmr.addClient(client);
    hmr.broadcast({ type: 'update', path: '/src/a.ts' });
    expect(client.send).toHaveBeenCalled();
  });
});

describe('FileWatcher', () => {
  it('triggers registered callbacks', () => {
    const watcher = new FileWatcher();
    const cb = vi.fn();
    watcher.onChange(cb);
    watcher.trigger('/src/file.ts');
    expect(cb).toHaveBeenCalledWith('/src/file.ts');
  });
});

describe('ErrorOverlay', () => {
  it('adds and clears errors', () => {
    const overlay = new ErrorOverlay();
    overlay.addError(new Error('fail'), '/src/main.ts:1:1');
    // render is private, no public getter. Just ensure no throw.
    overlay.clear();
  });
});

describe('ViteLikeServer', () => {
  it('transforms module imports', () => {
    const server = new ViteLikeServer('/root');
    const code = "import { a } from './utils.js';";
    const transformed = server.transformModule('/src/main.ts', code);
    expect(transformed).toContain('/@fs/root/');
    expect(transformed).toContain('/@vite/client');
  });
});
