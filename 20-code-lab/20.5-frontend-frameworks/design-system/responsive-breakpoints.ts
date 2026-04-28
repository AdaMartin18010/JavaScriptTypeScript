/**
 * @file 响应式断点工具
 * @category Design System → Responsive
 * @difficulty medium
 * @tags design-system, responsive, breakpoints, media-query
 *
 * @description
 * 响应式断点管理与媒体查询生成工具
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface BreakpointConfig {
  name: string;
  minWidth?: number;
  maxWidth?: number;
  unit?: 'px' | 'em' | 'rem';
}

export interface BreakpointValue<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// ============================================================================
// 断点管理器
// ============================================================================

export class BreakpointManager {
  private breakpoints: Map<string, BreakpointConfig>;

  constructor(breakpoints: BreakpointConfig[] = []) {
    this.breakpoints = new Map(breakpoints.map(b => [b.name, b]));
  }

  /**
   * 注册断点
   */
  register(config: BreakpointConfig): void {
    this.breakpoints.set(config.name, config);
  }

  /**
   * 获取断点配置
   */
  get(name: string): BreakpointConfig | undefined {
    return this.breakpoints.get(name);
  }

  /**
   * 生成媒体查询字符串
   */
  generateMediaQuery(name: string): string | null {
    const bp = this.breakpoints.get(name);
    if (!bp) return null;

    const unit = bp.unit || 'px';
    const conditions: string[] = [];

    if (bp.minWidth !== undefined) {
      conditions.push(`(min-width: ${bp.minWidth}${unit})`);
    }
    if (bp.maxWidth !== undefined) {
      conditions.push(`(max-width: ${bp.maxWidth}${unit})`);
    }

    return conditions.length > 0 ? `@media screen and ${conditions.join(' and ')}` : null;
  }

  /**
   * 生成范围媒体查询（between two breakpoints）
   */
  generateRangeQuery(from: string, to: string): string | null {
    const fromBp = this.breakpoints.get(from);
    const toBp = this.breakpoints.get(to);

    if (!fromBp || !toBp) return null;

    const unit = fromBp.unit || 'px';
    const min = fromBp.minWidth ?? 0;
    // range query: from's min to to's min - 1 (upper exclusive)
    const max = (toBp.minWidth ?? Number.MAX_SAFE_INTEGER) - 1;

    return `@media screen and (min-width: ${min}${unit}) and (max-width: ${max}${unit})`;
  }

  /**
   * 匹配当前视口宽度到断点
   */
  matchBreakpoint(width: number): string | null {
    const sorted = Array.from(this.breakpoints.values())
      .filter(b => b.minWidth !== undefined)
      .sort((a, b) => (b.minWidth ?? 0) - (a.minWidth ?? 0));

    for (const bp of sorted) {
      if (width >= (bp.minWidth ?? 0)) {
        return bp.name;
      }
    }

    return null;
  }

  /**
   * 解析响应式值
   */
  resolveValue<T>(width: number, value: BreakpointValue<T>): T {
    const bp = this.matchBreakpoint(width);
    // Order from smallest to largest
    const order: Array<keyof BreakpointValue<T>> = ['sm', 'md', 'lg', 'xl', '2xl'];
    const index = bp ? order.indexOf(bp as keyof BreakpointValue<T>) : -1;

    if (index === -1) {
      return value.base;
    }

    // Search from matched breakpoint down to sm for the first defined value
    for (let i = index; i >= 0; i--) {
      const key = order[i];
      if (value[key] !== undefined) {
        return value[key] as T;
      }
    }

    return value.base;
  }

  /**
   * 获取所有断点名称
   */
  getNames(): string[] {
    return Array.from(this.breakpoints.keys());
  }
}

// ============================================================================
// 预设断点（Tailwind 风格）
// ============================================================================

export const defaultBreakpoints: BreakpointConfig[] = [
  { name: 'sm', minWidth: 640, unit: 'px' },
  { name: 'md', minWidth: 768, unit: 'px' },
  { name: 'lg', minWidth: 1024, unit: 'px' },
  { name: 'xl', minWidth: 1280, unit: 'px' },
  { name: '2xl', minWidth: 1536, unit: 'px' }
];

// ============================================================================
// CSS 容器查询生成器
// ============================================================================

export class ContainerQueryBuilder {
  private conditions: string[] = [];

  minWidth(width: number, unit: 'px' | 'rem' = 'px'): this {
    this.conditions.push(`(min-width: ${width}${unit})`);
    return this;
  }

  maxWidth(width: number, unit: 'px' | 'rem' = 'px'): this {
    this.conditions.push(`(max-width: ${width}${unit})`);
    return this;
  }

  minHeight(height: number, unit: 'px' | 'rem' = 'px'): this {
    this.conditions.push(`(min-height: ${height}${unit})`);
    return this;
  }

  orientation(value: 'portrait' | 'landscape'): this {
    this.conditions.push(`(orientation: ${value})`);
    return this;
  }

  build(containerName?: string): string {
    const query = `@container ${containerName ? `${containerName} ` : ''}${this.conditions.join(' and ')}`;
    this.conditions = [];
    return query;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 响应式断点工具 ===\n');

  const manager = new BreakpointManager(defaultBreakpoints);

  console.log('--- 媒体查询 ---');
  console.log('  sm:', manager.generateMediaQuery('sm'));
  console.log('  md:', manager.generateMediaQuery('md'));
  console.log('  lg:', manager.generateMediaQuery('lg'));

  console.log('\n--- 范围查询 ---');
  console.log('  md -> lg:', manager.generateRangeQuery('md', 'lg'));

  console.log('\n--- 断点匹配 ---');
  [400, 700, 1100, 1300, 1600].forEach(w => {
    console.log(`  ${w}px -> ${manager.matchBreakpoint(w)}`);
  });

  console.log('\n--- 响应式值解析 ---');
  const fontSize: BreakpointValue<string> = { base: '14px', md: '16px', lg: '18px' };
  [400, 800, 1200].forEach(w => {
    console.log(`  ${w}px -> font-size: ${manager.resolveValue(w, fontSize)}`);
  });

  console.log('\n--- 容器查询 ---');
  const cq = new ContainerQueryBuilder()
    .minWidth(300)
    .maxWidth(800)
    .build('sidebar');
  console.log(' ', cq);
}
