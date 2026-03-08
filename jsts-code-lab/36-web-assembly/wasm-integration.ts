/**
 * @file WebAssembly 集成
 * @category WebAssembly → Integration
 * @difficulty hard
 * @tags wasm, webassembly, performance, memory, ffi
 * 
 * @description
 * WebAssembly 实现：
 * - WASM 模块加载
 * - 内存管理
 * - JS-WASM 互操作
 * - 性能优化
 * - 流式编译
 */

// ============================================================================
// 1. WASM 模块加载器
// ============================================================================

export interface WASMModule {
  instance: WebAssembly.Instance;
  exports: WebAssembly.Exports;
  memory: WebAssembly.Memory;
}

export interface WASMLoadOptions {
  imports?: WebAssembly.Imports;
  streaming?: boolean;
  compileOptions?: WebAssembly.CompileError;
  instantiateOptions?: WebAssembly.InstantiationError;
}

export class WASMLoader {
  private cache: Map<string, WebAssembly.Module> = new Map();

  // 流式加载和编译 WASM 模块
  async loadStreaming(
    url: string,
    options: WASMLoadOptions = {}
  ): Promise<WASMModule> {
    console.log(`[WASM] Streaming load: ${url}`);
    
    const startTime = performance.now();
    
    const importObject = this.buildImportObject(options.imports);
    
    // 使用流式编译
    const result = await WebAssembly.instantiateStreaming(
      fetch(url),
      importObject
    );
    
    const loadTime = performance.now() - startTime;
    console.log(`[WASM] Loaded in ${loadTime.toFixed(2)}ms`);
    
    return this.wrapModule(result);
  }

  // 传统方式加载 WASM 模块
  async load(
    source: string | URL | BufferSource,
    options: WASMLoadOptions = {}
  ): Promise<WASMModule> {
    const startTime = performance.now();
    
    let buffer: BufferSource;
    
    if (typeof source === 'string' || source instanceof URL) {
      const url = source.toString();
      
      // 检查缓存
      if (this.cache.has(url)) {
        console.log(`[WASM] Using cached module: ${url}`);
        const module = this.cache.get(url)!;
        const importObject = this.buildImportObject(options.imports);
        const instance = await WebAssembly.instantiate(module, importObject);
        return this.wrapModule({ module, instance });
      }
      
      const response = await fetch(url);
      buffer = await response.arrayBuffer();
    } else {
      buffer = source;
    }
    
    // 编译
    const compileStart = performance.now();
    const module = await WebAssembly.compile(buffer);
    const compileTime = performance.now() - compileStart;
    
    // 缓存已编译的模块
    if (typeof source === 'string') {
      this.cache.set(source, module);
    }
    
    // 实例化
    const importObject = this.buildImportObject(options.imports);
    const instance = await WebAssembly.instantiate(module, importObject);
    
    const totalTime = performance.now() - startTime;
    console.log(`[WASM] Compiled in ${compileTime.toFixed(2)}ms, total ${totalTime.toFixed(2)}ms`);
    
    return this.wrapModule({ module, instance });
  }

  // 预编译模块用于后续实例化
  async compile(url: string): Promise<WebAssembly.Module> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }
    
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    
    this.cache.set(url, module);
    return module;
  }

  // 从缓存创建实例
  instantiateFromCache(
    url: string,
    imports?: WebAssembly.Imports
  ): Promise<WASMModule> {
    const module = this.cache.get(url);
    if (!module) {
      throw new Error(`Module not in cache: ${url}`);
    }
    
    const importObject = this.buildImportObject(imports);
    const instance = new WebAssembly.Instance(module, importObject);
    
    return Promise.resolve(this.wrapModule({ module, instance }));
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
    console.log('[WASM] Cache cleared');
  }

  private buildImportObject(userImports?: WebAssembly.Imports): WebAssembly.Imports {
    const defaultImports = {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        __memory_base: 0,
        __table_base: 0,
        abort: () => { throw new Error('WASM abort'); },
        // 数学函数
        Math_sin: Math.sin,
        Math_cos: Math.cos,
        Math_tan: Math.tan,
        Math_sqrt: Math.sqrt,
        // 时间函数
        emscripten_get_now: () => performance.now(),
        // 日志函数
        emscripten_log: (ptr: number) => {
          console.log('[WASM Log]', ptr);
        }
      },
      wasi_snapshot_preview1: {
        fd_write: () => 0,
        fd_close: () => 0,
        fd_seek: () => 0,
        proc_exit: (code: number) => { 
          console.log(`[WASM] Process exited with code ${code}`); 
        }
      }
    };

    return { ...defaultImports, ...userImports };
  }

  private wrapModule(result: {
    module: WebAssembly.Module;
    instance: WebAssembly.Instance;
  }): WASMModule {
    const exports = result.instance.exports;
    const memory = exports.memory as WebAssembly.Memory || 
                   (exports._memory as WebAssembly.Memory);
    
    return {
      instance: result.instance,
      exports,
      memory
    };
  }
}

// ============================================================================
// 2. WASM 内存管理
// ============================================================================

export class WASMMemoryManager {
  private memory: WebAssembly.Memory;
  private view: DataView;
  private allocator: { malloc?: (size: number) => number; free?: (ptr: number) => void };
  private allocatedBlocks: Map<number, number> = new Map(); // ptr -> size

  constructor(memory: WebAssembly.Memory, exports?: WebAssembly.Exports) {
    this.memory = memory;
    this.view = new DataView(memory.buffer);
    
    if (exports) {
      this.allocator = {
        malloc: exports.malloc as (size: number) => number,
        free: exports.free as (ptr: number) => void
      };
    } else {
      this.allocator = {};
    }
  }

  // 在 WASM 内存中分配空间
  allocate(size: number, align = 8): number {
    if (this.allocator.malloc) {
      const ptr = this.allocator.malloc(size);
      this.allocatedBlocks.set(ptr, size);
      console.log(`[WASM Memory] Allocated ${size} bytes at 0x${ptr.toString(16)}`);
      return ptr;
    }
    
    // 简单分配策略（如果没有 malloc）
    throw new Error('No malloc function available in WASM module');
  }

  // 释放内存
  free(ptr: number): void {
    if (this.allocator.free) {
      this.allocator.free(ptr);
      this.allocatedBlocks.delete(ptr);
      console.log(`[WASM Memory] Freed memory at 0x${ptr.toString(16)}`);
    }
  }

  // 写入字符串到 WASM 内存
  writeString(str: string, encoding: 'utf8' | 'utf16' = 'utf8'): { ptr: number; length: number } {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    
    const ptr = this.allocate(bytes.length + 1);
    this.writeBytes(ptr, bytes);
    this.view.setUint8(ptr + bytes.length, 0); // null terminator
    
    return { ptr, length: bytes.length };
  }

  // 从 WASM 内存读取字符串
  readString(ptr: number, maxLength = 1024, encoding: 'utf8' | 'utf16' = 'utf8'): string {
    const bytes: number[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      const byte = this.view.getUint8(ptr + i);
      if (byte === 0) break;
      bytes.push(byte);
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
  }

  // 写入字节数组
  writeBytes(ptr: number, bytes: Uint8Array): void {
    const memory = new Uint8Array(this.memory.buffer);
    memory.set(bytes, ptr);
  }

  // 读取字节数组
  readBytes(ptr: number, length: number): Uint8Array {
    return new Uint8Array(this.memory.buffer, ptr, length);
  }

  // 写入数字数组
  writeFloat32Array(ptr: number, arr: Float32Array): void {
    const view = new Float32Array(this.memory.buffer, ptr, arr.length);
    view.set(arr);
  }

  writeFloat64Array(ptr: number, arr: Float64Array): void {
    const view = new Float64Array(this.memory.buffer, ptr, arr.length);
    view.set(arr);
  }

  writeInt32Array(ptr: number, arr: Int32Array): void {
    const view = new Int32Array(this.memory.buffer, ptr, arr.length);
    view.set(arr);
  }

  // 读取数字数组
  readFloat32Array(ptr: number, length: number): Float32Array {
    return new Float32Array(this.memory.buffer, ptr, length);
  }

  readFloat64Array(ptr: number, length: number): Float64Array {
    return new Float64Array(this.memory.buffer, ptr, length);
  }

  readInt32Array(ptr: number, length: number): Int32Array {
    return new Int32Array(this.memory.buffer, ptr, length);
  }

  // 获取内存统计
  getStats(): {
    totalPages: number;
    totalBytes: number;
    usedPages: number;
    allocatedBlocks: number;
  } {
    return {
      totalPages: this.memory.buffer.byteLength / 64 / 1024,
      totalBytes: this.memory.buffer.byteLength,
      usedPages: this.memory.buffer.byteLength / 64 / 1024, // 简化计算
      allocatedBlocks: this.allocatedBlocks.size
    };
  }

  // 扩展内存
  grow(pages: number): void {
    const oldPages = this.memory.buffer.byteLength / 64 / 1024;
    this.memory.grow(pages);
    this.view = new DataView(this.memory.buffer);
    console.log(`[WASM Memory] Grown from ${oldPages} to ${oldPages + pages} pages`);
  }
}

// ============================================================================
// 3. JS-WASM 互操作
// ============================================================================

export interface JSBridge {
  exports: Record<string, (...args: unknown[]) => unknown>;
  memory: WASMMemoryManager;
}

export class WASMBridge {
  private module: WASMModule;
  private memoryManager: WASMMemoryManager;
  private callbacks: Map<number, (...args: unknown[]) => unknown> = new Map();
  private callbackId = 0;

  constructor(module: WASMModule) {
    this.module = module;
    this.memoryManager = new WASMMemoryManager(module.memory, module.exports);
  }

  // 调用 WASM 函数
  call<T = unknown>(name: string, ...args: unknown[]): T {
    const func = this.module.exports[name] as (...args: unknown[]) => T;
    if (!func) {
      throw new Error(`Function ${name} not found in WASM exports`);
    }
    
    // 转换参数
    const convertedArgs = args.map(arg => this.convertToWASM(arg));
    
    return func(...convertedArgs);
  }

  // 调用带字符串参数的函数
  callWithStrings(name: string, ...stringArgs: string[]): number {
    const ptrs = stringArgs.map(str => this.memoryManager.writeString(str));
    
    try {
      const result = this.call<number>(name, ...ptrs.map(p => p.ptr));
      return result;
    } finally {
      ptrs.forEach(p => this.memoryManager.free(p.ptr));
    }
  }

  // 调用带数组参数的函数
  callWithArray<T extends number>(
    name: string,
    array: T[],
    arrayType: 'f32' | 'f64' | 'i32' = 'f32'
  ): number {
    const ptr = this.allocateArray(array, arrayType);
    
    try {
      return this.call<number>(name, ptr, array.length);
    } finally {
      this.memoryManager.free(ptr);
    }
  }

  // 注册 JS 回调函数供 WASM 调用
  registerCallback(callback: (...args: unknown[]) => unknown): number {
    const id = ++this.callbackId;
    this.callbacks.set(id, callback);
    return id;
  }

  // 获取回调函数的指针包装器
  getCallbackWrapper(id: number): number {
    return id; // 简化版，实际实现需要 trampoline
  }

  // 从 WASM 内存获取字符串
  getString(ptr: number, maxLength?: number): string {
    return this.memoryManager.readString(ptr, maxLength);
  }

  // 将字符串写入 WASM 内存
  setString(str: string): { ptr: number; free: () => void } {
    const { ptr } = this.memoryManager.writeString(str);
    return {
      ptr,
      free: () => this.memoryManager.free(ptr)
    };
  }

  // 获取内存管理器
  getMemoryManager(): WASMMemoryManager {
    return this.memoryManager;
  }

  private convertToWASM(arg: unknown): unknown {
    if (typeof arg === 'string') {
      return this.memoryManager.writeString(arg).ptr;
    }
    return arg;
  }

  private allocateArray<T extends number>(array: T[], type: 'f32' | 'f64' | 'i32'): number {
    const bytesPerElement = type === 'f64' ? 8 : 4;
    const ptr = this.memoryManager.allocate(array.length * bytesPerElement);
    
    switch (type) {
      case 'f32':
        this.memoryManager.writeFloat32Array(ptr, new Float32Array(array));
        break;
      case 'f64':
        this.memoryManager.writeFloat64Array(ptr, new Float64Array(array));
        break;
      case 'i32':
        this.memoryManager.writeInt32Array(ptr, new Int32Array(array));
        break;
    }
    
    return ptr;
  }
}

// ============================================================================
// 4. 性能监控
// ============================================================================

export interface PerformanceMetrics {
  functionName: string;
  calls: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

export class WASMPerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private activeTimers: Map<string, number> = new Map();

  // 包装函数以监控性能
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    name: string
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      this.startTimer(name);
      try {
        const result = fn(...args);
        return result;
      } finally {
        this.endTimer(name);
      }
    }) as T;
  }

  // 开始计时
  startTimer(name: string): void {
    this.activeTimers.set(name, performance.now());
  }

  // 结束计时
  endTimer(name: string): void {
    const startTime = this.activeTimers.get(name);
    if (startTime === undefined) return;
    
    const duration = performance.now() - startTime;
    this.activeTimers.delete(name);
    
    this.recordMetric(name, duration);
  }

  // 获取指标
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // 获取特定函数的指标
  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  // 对比 JS 和 WASM 性能
  async benchmark<T>(
    name: string,
    jsFn: () => T,
    wasmFn: () => T,
    iterations = 1000
  ): Promise<{
    js: { time: number; result: T };
    wasm: { time: number; result: T };
    speedup: number;
  }> {
    // 预热
    jsFn();
    wasmFn();
    
    // JS 测试
    const jsStart = performance.now();
    let jsResult: T;
    for (let i = 0; i < iterations; i++) {
      jsResult = jsFn();
    }
    const jsTime = performance.now() - jsStart;
    
    // WASM 测试
    const wasmStart = performance.now();
    let wasmResult: T;
    for (let i = 0; i < iterations; i++) {
      wasmResult = wasmFn();
    }
    const wasmTime = performance.now() - wasmStart;
    
    return {
      js: { time: jsTime, result: jsResult! },
      wasm: { time: wasmTime, result: wasmResult! },
      speedup: jsTime / wasmTime
    };
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics.clear();
    this.activeTimers.clear();
  }

  private recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      existing.calls++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.calls;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(name, {
        functionName: name,
        calls: 1,
        totalTime: duration,
        avgTime: duration,
        minTime: duration,
        maxTime: duration
      });
    }
  }
}

// ============================================================================
// 5. 实用工具
// ============================================================================

export class WASMUtils {
  // 检测 WebAssembly 支持
  static isSupported(): boolean {
    try {
      if (typeof WebAssembly === 'object' &&
          typeof WebAssembly.instantiate === 'function') {
        const module = new WebAssembly.Module(
          new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
        );
        if (module instanceof WebAssembly.Module) {
          return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
      }
    } catch {
      return false;
    }
    return false;
  }

  // 检测特定特性支持
  static getFeatureSupport(): {
    bulkMemory: boolean;
    multiValue: boolean;
    mutableGlobals: boolean;
    referenceTypes: boolean;
    simd: boolean;
    threads: boolean;
  } {
    return {
      bulkMemory: this.checkFeature('bulk-memory'),
      multiValue: this.checkFeature('multi-value'),
      mutableGlobals: this.checkFeature('mutable-globals'),
      referenceTypes: this.checkFeature('reference-types'),
      simd: this.checkFeature('simd'),
      threads: this.checkFeature('threads')
    };
  }

  private static checkFeature(feature: string): boolean {
    try {
      // 使用 WebAssembly.validate 检测特性
      // 这里简化处理，实际检测需要特定的测试模块
      return true;
    } catch {
      return false;
    }
  }

  // 编译 WAT (WebAssembly Text) 为二进制
  static async compileWAT(watCode: string): Promise<WebAssembly.Module> {
    // 简化版 WAT 编译器，实际使用 wabt 等工具
    // 这里仅作为演示
    console.log('[WASM Utils] Compiling WAT code...');
    
    // 示例：简单的加法函数
    if (watCode.includes('i32.add')) {
      const binary = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, // magic
        0x01, 0x00, 0x00, 0x00, // version
        0x01, 0x07, 0x01,       // type section
        0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, // func type: (i32, i32) -> i32
        0x03, 0x02, 0x01, 0x00, // func section
        0x07, 0x07, 0x01,       // export section
        0x03, 0x61, 0x64, 0x64, // name: "add"
        0x00, 0x00,             // kind: func, index: 0
        0x0a, 0x09, 0x01,       // code section
        0x07, 0x00,             // body size, local count
        0x20, 0x00,             // local.get 0
        0x20, 0x01,             // local.get 1
        0x6a,                   // i32.add
        0x0b                    // end
      ]);
      return WebAssembly.compile(binary);
    }
    
    throw new Error('WAT compilation not fully implemented');
  }

  // 创建共享内存
  static createSharedMemory(initialPages = 256, maxPages = 512): WebAssembly.Memory {
    return new WebAssembly.Memory({
      initial: initialPages,
      maximum: maxPages,
      shared: true
    });
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== WebAssembly 集成 ===\n');

  console.log('1. WebAssembly 支持检测');
  const supported = WASMUtils.isSupported();
  console.log('   WebAssembly supported:', supported);
  
  if (!supported) {
    console.log('   WebAssembly not supported in this environment');
    return;
  }
  
  const features = WASMUtils.getFeatureSupport();
  console.log('   Feature support:', features);

  console.log('\n2. WASM 模块加载');
  const loader = new WASMLoader();
  
  // 创建测试模块
  const watCode = `(module
    (func $add (param i32 i32) (result i32)
      local.get 0
      local.get 1
      i32.add)
    (export "add" (func $add))
  )`;
  
  const module = await WASMUtils.compileWAT(watCode);
  const instance = await WebAssembly.instantiate(module);
  
  console.log('   Module compiled successfully');
  console.log('   Exports:', Object.keys(instance.exports));

  console.log('\n3. WASM 函数调用');
  const bridge = new WASMBridge({
    instance,
    exports: instance.exports,
    memory: new WebAssembly.Memory({ initial: 1 })
  });
  
  const add = instance.exports.add as (a: number, b: number) => number;
  const result1 = add(10, 20);
  const result2 = add(100, 200);
  console.log('   add(10, 20) =', result1);
  console.log('   add(100, 200) =', result2);

  console.log('\n4. 内存管理');
  console.log('   Memory manager features:');
  console.log('   - allocate/deallocate memory');
  console.log('   - read/write strings');
  console.log('   - read/write typed arrays');
  console.log('   - automatic memory growth');
  
  const memoryManager = bridge.getMemoryManager();
  const stats = memoryManager.getStats();
  console.log('   Memory stats:', stats);

  console.log('\n5. 性能监控');
  const monitor = new WASMPerformanceMonitor();
  
  // JS 加法
  const jsAdd = monitor.wrap((a: number, b: number) => a + b, 'js_add');
  
  // WASM 加法
  const wasmAdd = monitor.wrap(add, 'wasm_add');
  
  // 执行多次
  for (let i = 0; i < 100; i++) {
    jsAdd(i, i + 1);
    wasmAdd(i, i + 1);
  }
  
  const metrics = monitor.getMetrics();
  console.log('   Performance metrics:');
  metrics.forEach(m => {
    console.log(`     ${m.functionName}: ${m.calls} calls, avg ${m.avgTime.toFixed(4)}ms`);
  });

  console.log('\n6. 性能对比');
  // 计算斐波那契数列对比
  const jsFib = (n: number): number => {
    if (n < 2) return n;
    return jsFib(n - 1) + jsFib(n - 2);
  };
  
  // 创建斐波那契 WASM 模块 (简化版)
  const fibWAT = `(module
    (func $fib (param i32) (result i32)
      local.get 0
      i32.const 2
      i32.lt_s
      if (result i32)
        local.get 0
      else
        local.get 0
        i32.const 1
        i32.sub
        call $fib
        local.get 0
        i32.const 2
        i32.sub
        call $fib
        i32.add
      end)
    (export "fib" (func $fib))
  )`;
  
  try {
    const fibModule = await WASMUtils.compileWAT(fibWAT);
    const fibInstance = await WebAssembly.instantiate(fibModule);
    const wasmFib = fibInstance.exports.fib as (n: number) => number;
    
    const n = 20;
    const jsStart = performance.now();
    const jsResult = jsFib(n);
    const jsTime = performance.now() - jsStart;
    
    const wasmStart = performance.now();
    const wasmResult = wasmFib(n);
    const wasmTime = performance.now() - wasmStart;
    
    console.log(`   Fibonacci(${n}):`);
    console.log(`     JS result: ${jsResult}, time: ${jsTime.toFixed(2)}ms`);
    console.log(`     WASM result: ${wasmResult}, time: ${wasmTime.toFixed(2)}ms`);
    console.log(`     Speedup: ${(jsTime / wasmTime).toFixed(2)}x`);
  } catch {
    console.log('   Skipping fibonacci benchmark (WAT compilation simplified)');
  }

  console.log('\nWebAssembly 要点:');
  console.log('- 流式编译: 边下载边编译，减少启动时间');
  console.log('- 内存管理: 手动管理 WASM 内存，注意内存对齐');
  console.log('- JS 互操作: 转换数据类型，管理字符串和数组');
  console.log('- 性能: 计算密集型任务可获得 2-10 倍加速');
  console.log('- 模块缓存: 编译后的模块可以多次实例化');
  console.log('- 共享内存: 使用 SharedArrayBuffer 实现多线程');
}

// ============================================================================
// 导出（已在文件中使用 export class 导出）
// ============================================================================
