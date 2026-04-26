/**
 * ESM 深度机制 — 可运行演示
 * ESM Deep Dive — Runnable Demos
 *
 * 注意：以下代码需在 ESM 环境（.mjs 或 type: module）中运行
 */

// ============================================================
// 1. Live Binding 模拟演示
// ============================================================

// 在单一文件中模拟两个模块的交互
function liveBindingDemo() {
  // 模拟"导出模块"的内部状态
  let _count = 0
  function _increment() { _count++ }

  // 模拟 ESM 的命名空间对象（Live Binding 语义）
  const exportNs = {
    get count() { return _count },
    increment: _increment
  }

  // 模拟"导入模块"的视图
  console.log('Live Binding Demo:')
  console.log('  Initial count:', exportNs.count)  // 0
  exportNs.increment()
  console.log('  After increment:', exportNs.count)  // 1 ✅ 自动反映
}

liveBindingDemo()

// ============================================================
// 2. Import Attributes 模拟（TypeScript 类型层面）
// ============================================================

// TypeScript 5.3+ 支持 import attributes 的类型声明
declare module '*.json' {
  const value: unknown
  export default value
}

// 模拟 with { type: 'json' } 的类型安全检查
interface JsonModule {
  default: unknown
}

function loadJsonModule(content: string): JsonModule {
  return { default: JSON.parse(content) }
}

// ============================================================
// 3. 模块加载三阶段模拟
// ============================================================

type ModuleStatus = 'unlinked' | 'linking' | 'linked' | 'evaluating' | 'evaluated'

class ESModule {
  public status: ModuleStatus = 'unlinked'
  public exports: Record<string, unknown> = {}
  private code: () => void

  constructor(
    public readonly specifier: string,
    code: () => void
  ) {
    this.code = code
  }

  // Phase 1: Construction（构造）
  construct(): void {
    if (this.status !== 'unlinked') return
    console.log(`[Construct] ${this.specifier}`)
    this.status = 'linking'
  }

  // Phase 2: Instantiation（实例化）
  instantiate(): void {
    if (this.status !== 'linking') return
    console.log(`[Instantiate] ${this.specifier}`)
    this.status = 'linked'
  }

  // Phase 3: Evaluation（求值）
  evaluate(): void {
    if (this.status !== 'linked') return
    console.log(`[Evaluate] ${this.specifier}`)
    this.status = 'evaluating'
    this.code()
    this.status = 'evaluated'
  }
}

// 演示三阶段加载
const mod = new ESModule('demo.js', () => {
  console.log('  → Module code executed!')
})

mod.construct()
mod.instantiate()
mod.evaluate()

// ============================================================
// 4. 循环依赖检测与处理
// ============================================================

class ModuleLoader {
  private modules = new Map<string, ESModule>()
  private loading = new Set<string>()
  private loaded = new Set<string>()

  register(specifier: string, code: () => void): void {
    this.modules.set(specifier, new ESModule(specifier, code))
  }

  load(specifier: string): void {
    if (this.loaded.has(specifier)) return
    if (this.loading.has(specifier)) {
      console.log(`[Cycle Detected] ${specifier} is already loading`)
      return  // 循环依赖：返回已部分初始化的模块
    }

    const mod = this.modules.get(specifier)
    if (!mod) throw new Error(`Module not found: ${specifier}`)

    this.loading.add(specifier)
    mod.construct()
    mod.instantiate()
    mod.evaluate()
    this.loading.delete(specifier)
    this.loaded.add(specifier)
  }
}

// ============================================================
// 5. 导入命名空间对象工具
// ============================================================

function createModuleNamespace(exports: Record<string, unknown>): object {
  return new Proxy(Object.create(null), {
    get(_target, prop) {
      if (typeof prop === 'string' && prop in exports) {
        return exports[prop]
      }
      return undefined
    },
    has(_target, prop) {
      return typeof prop === 'string' && prop in exports
    },
    ownKeys() {
      return Object.keys(exports)
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop === 'string' && prop in exports) {
        return {
          enumerable: true,
          configurable: false,
          get: () => exports[prop]
        }
      }
      return undefined
    }
  })
}

const ns = createModuleNamespace({
  foo: 42,
  bar: 'hello'
})

console.log('Namespace foo:', (ns as any).foo)  // 42
console.log('Keys:', Reflect.ownKeys(ns))        // ['foo', 'bar']

export {}
