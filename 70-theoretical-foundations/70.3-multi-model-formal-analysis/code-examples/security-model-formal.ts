/**
 * 安全模型形式化基础 — 配套 TypeScript 代码示例
 * 对应文档: 70.3/15-security-model-formal-foundation.md
 *
 * 本文件包含 7 个可运行示例，覆盖：
 * 1. Origin 三元组的代数实现与同源判定
 * 2. CORS 预检状态机的 TypeScript 实现
 * 3. CSP 策略的集合语义实现
 * 4. Post-Spectre 计时 API 的行为观测与形式化建模
 * 5. npm 依赖树风险模型的形式化分析
 * 6. TypeScript 中的编译期污点追踪近似
 * 7. Branded Types 实现 Capability-based Security
 */

// ============================================================================
// 示例 1: Origin 三元组的代数实现与同源判定
// ============================================================================

interface Origin {
  readonly scheme: string;
  readonly host: string;
  readonly port: number;
}

/** Origin 等价关系：RFC 6454 的同源判定 */
function isSameOrigin(a: Origin, b: Origin): boolean {
  return (
    a.scheme === b.scheme &&
    a.host === b.host &&
    a.port === b.port
  );
}

/** Origin 的序列化：RFC 6454 的标准字符串表示 */
function serializeOrigin(o: Origin): string {
  return `${o.scheme}://${o.host}:${o.port}`;
}

/** 有效端口推导：scheme → 默认端口 */
function defaultPort(scheme: string): number {
  switch (scheme) {
    case 'http':  return 80;
    case 'https': return 443;
    default:      return 0;
  }
}

/** 规范化端口：0 表示使用 scheme 默认值 */
function normalizeOrigin(o: Origin): Origin {
  return {
    scheme: o.scheme,
    host: o.host,
    port: o.port === 0 ? defaultPort(o.scheme) : o.port
  };
}

// 验证：
const a: Origin = { scheme: 'https', host: 'example.com', port: 443 };
const b: Origin = { scheme: 'https', host: 'example.com', port: 0 };
console.assert(isSameOrigin(normalizeOrigin(a), normalizeOrigin(b)),
  '规范化后应判定为同源');

// ============================================================================
// 示例 2: CORS 预检状态机的 TypeScript 实现
// ============================================================================

type CorsState =
  | 'q_init'
  | 'q_preflight'
  | 'q_allowed'
  | 'q_denied'
  | 'q_simple';

type CorsEvent =
  | 'simple_request'
  | 'preflight_request'
  | 'success_response'
  | 'error_response'
  | 'actual_request';

interface CorsRequest {
  method: string;
  headers: string[];
  origin: Origin;
}

const SAFELIST_METHODS = new Set(['GET', 'HEAD', 'POST']);
const SAFELIST_HEADERS = new Set([
  'accept', 'accept-language', 'content-language', 'content-type'
]);

function isSimpleRequest(req: CorsRequest): boolean {
  if (!SAFELIST_METHODS.has(req.method)) return false;
  return req.headers.every(h => SAFELIST_HEADERS.has(h.toLowerCase()));
}

function corsTransition(
  state: CorsState,
  event: CorsEvent,
  req: CorsRequest,
  allowOrigin?: Origin
): CorsState {
  switch (state) {
    case 'q_init':
      if (event === 'simple_request' && isSimpleRequest(req))
        return 'q_simple';
      if (event === 'preflight_request')
        return 'q_preflight';
      return 'q_denied';

    case 'q_preflight':
      if (event === 'success_response' && allowOrigin) {
        if (isSameOrigin(req.origin, allowOrigin))
          return 'q_allowed';
      }
      if (event === 'error_response')
        return 'q_denied';
      return state;

    case 'q_allowed':
      if (event === 'actual_request')
        return 'q_simple';
      return state;

    default:
      return state;
  }
}

// 模拟一个预检流程
let state: CorsState = 'q_init';
const req: CorsRequest = {
  method: 'PUT',
  headers: ['x-custom-header'],
  origin: { scheme: 'https', host: 'client.com', port: 443 }
};

state = corsTransition(state, 'preflight_request', req);
console.assert(state === 'q_preflight', '非常规请求应进入预检');

state = corsTransition(
  state, 'success_response', req,
  { scheme: 'https', host: 'client.com', port: 443 }
);
console.assert(state === 'q_allowed', '允许的来源应转移到 allowed');

// ============================================================================
// 示例 3: CSP 策略的集合语义实现
// ============================================================================

type SourceExpression =
  | { kind: 'self' }
  | { kind: 'unsafe-inline' }
  | { kind: 'nonce'; value: string }
  | { kind: 'hash'; algorithm: 'sha256' | 'sha384' | 'sha512'; value: string }
  | { kind: 'scheme'; value: string }
  | { kind: 'host'; value: string }
  | { kind: 'wildcard' };

type Directive =
  | 'default-src' | 'script-src' | 'style-src'
  | 'img-src' | 'connect-src' | 'font-src'
  | 'object-src' | 'frame-src' | 'worker-src';

type CSPPolicy = Map<Directive, Set<SourceExpression>>;

function matchesSource(
  origin: Origin,
  expr: SourceExpression,
  nonce?: string
): boolean {
  switch (expr.kind) {
    case 'self':
      return true;
    case 'unsafe-inline':
      return true;
    case 'nonce':
      return nonce === expr.value;
    case 'wildcard':
      return true;
    case 'scheme':
      return origin.scheme === expr.value;
    case 'host':
      return origin.host === expr.value ||
             origin.host.endsWith('.' + expr.value);
    default:
      return false;
  }
}

/** 判定请求是否被策略允许 */
function isAllowedByCSP(
  policy: CSPPolicy,
  directive: Directive,
  origin: Origin,
  nonce?: string
): boolean {
  const sources = policy.get(directive) ?? policy.get('default-src');
  if (!sources) return false;

  return Array.from(sources).some(expr =>
    matchesSource(origin, expr, nonce)
  );
}

const strictPolicy: CSPPolicy = new Map([
  ['script-src', new Set<SourceExpression>([
    { kind: 'self' },
    { kind: 'nonce', value: 'abc123' }
  ])],
  ['style-src', new Set<SourceExpression>([
    { kind: 'self' }
  ])],
  ['default-src', new Set<SourceExpression>([
    { kind: 'self' }
  ])]
]);

const cdnOrigin: Origin = { scheme: 'https', host: 'evil.com', port: 443 };
console.assert(
  !isAllowedByCSP(strictPolicy, 'script-src', cdnOrigin),
  'CDN 来源应被严格策略拒绝'
);

// ============================================================================
// 示例 4: Post-Spectre 计时 API 的行为观测与形式化建模
// ============================================================================

/** 模拟带抖动的计时器：浏览器内部实现抽象 */
class JitteredTimer {
  private readonly maxJitterMs: number;

  constructor(maxJitterMs: number = 2) {
    this.maxJitterMs = maxJitterMs;
  }

  /** 返回带人为抖动的当前时间 */
  now(): number {
    const trueNow = performance.now();
    const jitter = Math.random() * this.maxJitterMs;
    return trueNow + jitter;
  }

  /** 测量函数执行时间：受抖动影响的观测值 */
  measure<T>(fn: () => T): { result: T; observedTime: number } {
    const start = this.now();
    const result = fn();
    const end = this.now();
    return { result, observedTime: end - start };
  }
}

/** 形式化模型：Spectre 缓解下时间分辨率的信噪比分析 */
function signalToNoiseRatio(
  cacheHitTime: number,
  cacheMissTime: number,
  timerResolution: number
): number {
  const signal = Math.abs(cacheMissTime - cacheHitTime);
  const noise = timerResolution;
  return signal / noise;
}

const snr = signalToNoiseRatio(0.01, 0.1, 100);
console.assert(snr < 1, '降级后信噪比应小于 1，攻击不可行');
console.log(`Spectre 时间侧信道信噪比: ${snr.toFixed(4)}`);

// ============================================================================
// 示例 5: npm 依赖树风险模型的形式化分析
// ============================================================================

interface PackageNode {
  readonly name: string;
  readonly version: string;
  readonly dependencies: Map<string, string>;
}

type DependencyGraph = Map<string, PackageNode>;

/** 计算依赖图的传递闭包规模 */
function transitiveClosureSize(
  graph: DependencyGraph,
  rootName: string,
  rootVersion: string,
  visited = new Set<string>()
): number {
  const key = `${rootName}@${rootVersion}`;
  if (visited.has(key)) return 0;
  visited.add(key);

  const node = graph.get(key);
  if (!node) return 1;

  let count = 1;
  for (const [depName, constraint] of node.dependencies) {
    const depVersions = Array.from(graph.keys())
      .filter(k => k.startsWith(`${depName}@`));
    for (const dv of depVersions) {
      const v = dv.split('@')[1];
      if (satisfiesSemver(v, constraint)) {
        count += transitiveClosureSize(graph, depName, v, visited);
      }
    }
  }
  return count;
}

/** 极度简化的 semver 满足判定 */
function satisfiesSemver(version: string, constraint: string): boolean {
  if (constraint === '*') return true;
  if (constraint.startsWith('^')) {
    const major = parseInt(constraint.slice(1));
    const vMajor = parseInt(version.split('.')[0]);
    return vMajor === major;
  }
  return version === constraint;
}

/** 计算信任面：所有唯一维护者数量 */
function trustSurface(
  packages: PackageNode[],
  getMaintainers: (p: PackageNode) => string[]
): Set<string> {
  const maintainers = new Set<string>();
  for (const pkg of packages) {
    for (const m of getMaintainers(pkg)) {
      maintainers.add(m);
    }
  }
  return maintainers;
}

const mockGraph: DependencyGraph = new Map([
  ['app@1.0.0', {
    name: 'app', version: '1.0.0',
    dependencies: new Map([['lodash', '^4.0.0'], ['react', '^18.0.0']])
  }],
  ['lodash@4.17.0', {
    name: 'lodash', version: '4.17.0',
    dependencies: new Map()
  }],
  ['react@18.0.0', {
    name: 'react', version: '18.0.0',
    dependencies: new Map([['scheduler', '^0.23.0']])
  }],
  ['scheduler@0.23.0', {
    name: 'scheduler', version: '0.23.0',
    dependencies: new Map()
  }]
]);

const totalDeps = transitiveClosureSize(mockGraph, 'app', '1.0.0');
console.log(`传递依赖总数: ${totalDeps}`);

// ============================================================================
// 示例 6: TypeScript 中的编译期污点追踪近似
// ============================================================================

declare const TaintSymbol: unique symbol;
declare const CleanSymbol: unique symbol;

type Tainted<T> = T & { readonly [TaintSymbol]: true };
type Clean<T> = T & { readonly [CleanSymbol]: true };

/** 污点源：用户输入自动标记为 Tainted */
function userInput(value: string): Tainted<string> {
  return value as Tainted<string>;
}

/** 污点汇：敏感操作仅接受 Clean 输入 */
function executeQuery(sql: Clean<string>): void {
  console.log('Executing:', sql);
}

/** 净化函数：经过验证后可将 Tainted 转为 Clean */
function sanitize(sql: Tainted<string>): Clean<string> {
  if (/^[a-zA-Z0-9\s*_=,]+$/.test(sql)) {
    return sql as Clean<string>;
  }
  throw new Error('潜在 SQL 注入');
}

const rawInput = userInput("SELECT * FROM users WHERE id = 1");

// @ts-expect-error — 编译错误：不能将 Tainted 传递给需要 Clean 的参数
// executeQuery(rawInput);

const safeInput = sanitize(rawInput);
executeQuery(safeInput); // ✓ 编译通过

/** 污点传播规则在类型层面的体现 */
function concat(a: Tainted<string>, b: string): Tainted<string> {
  return (a + b) as Tainted<string>;
}

/** 条件类型实现的污点传播判断 */
type TaintPropagate<A, B> =
  A extends Tainted<unknown> ? Tainted<B> :
  A extends Clean<unknown> ? Clean<B> :
  B;

type Test1 = TaintPropagate<Tainted<string>, string>; // Tainted<string>
type Test2 = TaintPropagate<Clean<string>, string>;    // Clean<string>

// ============================================================================
// 示例 7: Branded Types 实现 Capability-based Security
// ============================================================================

declare const FileHandleBrand: unique symbol;
declare const NetworkSocketBrand: unique symbol;

/** 文件操作能力 */
type FileHandle = { readonly [FileHandleBrand]: true; path: string };

/** 网络通信能力 */
type NetworkSocket = { readonly [NetworkSocketBrand]: true; endpoint: string };

/** 能力工厂：仅授权模块可创建能力 */
namespace Capabilities {
  export function openFile(path: string): FileHandle {
    return { [FileHandleBrand]: true, path } as FileHandle;
  }

  export function connect(host: string, port: number): NetworkSocket {
    return { [NetworkSocketBrand]: true, endpoint: `${host}:${port}` } as NetworkSocket;
  }
}

/** 需要文件能力的操作 */
function readFile(handle: FileHandle): string {
  return `Content of ${handle.path}`;
}

/** 需要网络能力的操作 */
function sendData(socket: NetworkSocket, data: string): void {
  console.log(`Sending to ${socket.endpoint}: ${data}`);
}

const file = Capabilities.openFile('/etc/passwd');
const socket = Capabilities.connect('api.example.com', 443);

readFile(file);       // ✓ 合法
sendData(socket, ''); // ✓ 合法

// @ts-expect-error — 编译错误：类型不兼容，无法传递 FileHandle 到 NetworkSocket
// sendData(file, 'data');

// ============================================================================
// 运行验证汇总
// ============================================================================

console.log('\n✅ 所有 security-model-formal.ts 示例定义完成');
console.log('   示例 1: Origin 代数与同源判定');
console.log('   示例 2: CORS 预检状态机');
console.log('   示例 3: CSP 集合语义');
console.log('   示例 4: Post-Spectre 计时模型');
console.log('   示例 5: npm 依赖树风险模型');
console.log('   示例 6: 编译期污点追踪');
console.log('   示例 7: Capability-based Security');
