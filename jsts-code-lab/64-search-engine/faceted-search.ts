/**
 * @file 分面搜索
 * @category Search Engine → Faceted Search
 * @difficulty medium
 * @tags faceted-search, aggregations, filters, drill-down
 *
 * @description
 * 分面搜索实现：动态分面计算、过滤器、面包屑导航、范围分面
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface FacetDoc {
  id: string;
  [field: string]: unknown;
}

export interface FacetField {
  field: string;
  type: 'terms' | 'range' | 'histogram' | 'date';
  size?: number;
}

export interface FacetValue {
  value: string | number;
  count: number;
  selected?: boolean;
}

export interface FacetResult {
  field: string;
  type: FacetField['type'];
  values: FacetValue[];
  total: number;
  other: number;
}

export interface FacetFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'range';
  value: unknown;
}

export interface RangeBucket {
  from?: number;
  to?: number;
  key: string;
}

// ============================================================================
// 分面计算器
// ============================================================================

export class FacetCalculator {
  /**
   * 计算词条分面
   */
  calculateTermsFacet(docs: FacetDoc[], field: string, size: number = 10): FacetResult {
    const counts = new Map<string | number, number>();

    for (const doc of docs) {
      const value = doc[field];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          for (const v of value) {
            counts.set(v, (counts.get(v) || 0) + 1);
          }
        } else {
          counts.set(value as string | number, (counts.get(value as string | number) || 0) + 1);
        }
      }
    }

    // 排序并截取前 N 个
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, size);

    const other = Array.from(counts.entries())
      .slice(size)
      .reduce((sum, [, count]) => sum + count, 0);

    return {
      field,
      type: 'terms',
      values: sorted.map(([value, count]) => ({ value, count })),
      total: counts.size,
      other
    };
  }

  /**
   * 计算范围分面
   */
  calculateRangeFacet(docs: FacetDoc[], field: string, ranges: RangeBucket[]): FacetResult {
    const buckets = ranges.map(r => ({ ...r, count: 0 }));

    for (const doc of docs) {
      const value = doc[field] as number;
      if (typeof value === 'number') {
        for (const bucket of buckets) {
          const fromMatch = bucket.from === undefined || value >= bucket.from;
          const toMatch = bucket.to === undefined || value < bucket.to;
          
          if (fromMatch && toMatch) {
            bucket.count++;
            break; // 一个文档只属于一个桶
          }
        }
      }
    }

    return {
      field,
      type: 'range',
      values: buckets.map(b => ({ value: b.key, count: b.count })),
      total: buckets.length,
      other: 0
    };
  }

  /**
   * 计算直方图分面
   */
  calculateHistogramFacet(docs: FacetDoc[], field: string, interval: number): FacetResult {
    const buckets = new Map<number, number>();

    for (const doc of docs) {
      const value = doc[field] as number;
      if (typeof value === 'number') {
        const bucketKey = Math.floor(value / interval) * interval;
        buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
      }
    }

    const sorted = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]);

    return {
      field,
      type: 'histogram',
      values: sorted.map(([value, count]) => ({ value, count })),
      total: buckets.size,
      other: 0
    };
  }

  /**
   * 计算日期分面
   */
  calculateDateFacet(docs: FacetDoc[], field: string, interval: 'year' | 'month' | 'day' | 'hour'): FacetResult {
    const buckets = new Map<string, number>();

    for (const doc of docs) {
      const value = doc[field];
      if (value instanceof Date || typeof value === 'string') {
        const date = new Date(value);
        let key: string;

        switch (interval) {
          case 'year':
            key = date.getFullYear().toString();
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'hour':
            key = `${date.toISOString().split('T')[0]} ${String(date.getHours()).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString();
        }

        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    const sorted = Array.from(buckets.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      field,
      type: 'date',
      values: sorted.map(([value, count]) => ({ value, count })),
      total: buckets.size,
      other: 0
    };
  }
}

// ============================================================================
// 过滤器引擎
// ============================================================================

export class FilterEngine {
  /**
   * 应用过滤器
   */
  applyFilter(docs: FacetDoc[], filter: FacetFilter): FacetDoc[] {
    return docs.filter(doc => this.matchesFilter(doc, filter));
  }

  /**
   * 应用多个过滤器（AND 关系）
   */
  applyFilters(docs: FacetDoc[], filters: FacetFilter[]): FacetDoc[] {
    return docs.filter(doc => filters.every(f => this.matchesFilter(doc, f)));
  }

  /**
   * 检查文档是否匹配过滤器
   */
  private matchesFilter(doc: FacetDoc, filter: FacetFilter): boolean {
    const value = doc[filter.field];

    switch (filter.operator) {
      case 'eq':
        return value === filter.value;
      
      case 'ne':
        return value !== filter.value;
      
      case 'gt':
        return typeof value === 'number' && value > (filter.value as number);
      
      case 'gte':
        return typeof value === 'number' && value >= (filter.value as number);
      
      case 'lt':
        return typeof value === 'number' && value < (filter.value as number);
      
      case 'lte':
        return typeof value === 'number' && value <= (filter.value as number);
      
      case 'in':
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        if (Array.isArray(value)) {
          return value.some(v => values.includes(v));
        }
        return values.includes(value);
      
      case 'range':
        const range = filter.value as { gte?: number; lte?: number; gt?: number; lt?: number };
        if (typeof value !== 'number') return false;
        
        if (range.gte !== undefined && value < range.gte) return false;
        if (range.lte !== undefined && value > range.lte) return false;
        if (range.gt !== undefined && value <= range.gt) return false;
        if (range.lt !== undefined && value >= range.lt) return false;
        
        return true;
      
      default:
        return false;
    }
  }
}

// ============================================================================
// 分面搜索管理器
// ============================================================================

export class FacetedSearch {
  private documents: FacetDoc[] = [];
  private calculator = new FacetCalculator();
  private filterEngine = new FilterEngine();
  private facetConfig: FacetField[] = [];

  /**
   * 添加文档
   */
  addDocument(doc: FacetDoc): void {
    this.documents.push(doc);
  }

  /**
   * 设置分面配置
   */
  setFacetConfig(config: FacetField[]): void {
    this.facetConfig = config;
  }

  /**
   * 搜索并计算分面
   */
  search(options: {
    query?: string;
    filters?: FacetFilter[];
    sort?: { field: string; order: 'asc' | 'desc' };
    offset?: number;
    limit?: number;
  } = {}): {
    docs: FacetDoc[];
    facets: FacetResult[];
    total: number;
  } {
    // 1. 过滤文档
    let filtered = this.documents;
    if (options.filters && options.filters.length > 0) {
      filtered = this.filterEngine.applyFilters(filtered, options.filters);
    }

    // 2. 文本搜索（简化实现）
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(doc => 
        Object.values(doc).some(v => 
          String(v).toLowerCase().includes(query)
        )
      );
    }

    // 3. 排序
    if (options.sort) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[options.sort!.field] as number | string;
        const bVal = b[options.sort!.field] as number | string;
        
        if (aVal < bVal) return options.sort!.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return options.sort!.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = filtered.length;

    // 4. 计算分面（基于过滤后的文档）
    const facets = this.calculateFacets(filtered, options.filters);

    // 5. 分页
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    const paged = filtered.slice(offset, offset + limit);

    return {
      docs: paged,
      facets,
      total
    };
  }

  /**
   * 获取面包屑导航
   */
  getBreadcrumbs(filters: FacetFilter[]): Array<{ field: string; value: unknown; removable: true }> {
    return filters.map(f => ({
      field: f.field,
      value: f.value,
      removable: true
    }));
  }

  private calculateFacets(docs: FacetDoc[], activeFilters?: FacetFilter[]): FacetResult[] {
    const results: FacetResult[] = [];

    for (const config of this.facetConfig) {
      // 对于每个分面，需要排除该分面的过滤器来计算
      const otherFilters = activeFilters?.filter(f => f.field !== config.field) || [];
      const facetDocs = otherFilters.length > 0 
        ? this.filterEngine.applyFilters(this.documents, otherFilters)
        : this.documents;

      let facet: FacetResult;

      switch (config.type) {
        case 'terms':
          facet = this.calculator.calculateTermsFacet(facetDocs, config.field, config.size);
          break;
        case 'range':
          facet = this.calculator.calculateRangeFacet(facetDocs, config.field, [
            { key: '0-50', from: 0, to: 50 },
            { key: '50-100', from: 50, to: 100 },
            { key: '100-200', from: 100, to: 200 },
            { key: '200+', from: 200 }
          ]);
          break;
        case 'histogram':
          facet = this.calculator.calculateHistogramFacet(facetDocs, config.field, 10);
          break;
        case 'date':
          facet = this.calculator.calculateDateFacet(facetDocs, config.field, 'year');
          break;
        default:
          continue;
      }

      // 标记已选中的值
      const activeFilter = activeFilters?.find(f => f.field === config.field);
      if (activeFilter && facet.type === 'terms') {
        for (const value of facet.values) {
          if (value.value === activeFilter.value) {
            value.selected = true;
          }
        }
      }

      results.push(facet);
    }

    return results;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 分面搜索演示 ===\n');

  // 创建搜索实例
  const search = new FacetedSearch();

  // 添加产品数据
  const products: FacetDoc[] = [
    { id: '1', name: 'Laptop Pro', category: 'Electronics', brand: 'TechCorp', price: 1299, rating: 4.5, inStock: true, createdAt: '2023-01-15' },
    { id: '2', name: 'Laptop Air', category: 'Electronics', brand: 'TechCorp', price: 999, rating: 4.3, inStock: true, createdAt: '2023-02-20' },
    { id: '3', name: 'Desktop Pro', category: 'Electronics', brand: 'TechCorp', price: 1599, rating: 4.7, inStock: false, createdAt: '2023-03-10' },
    { id: '4', name: 'Office Chair', category: 'Furniture', brand: 'ComfortPlus', price: 299, rating: 4.2, inStock: true, createdAt: '2023-01-05' },
    { id: '5', name: 'Standing Desk', category: 'Furniture', brand: 'ErgoLife', price: 599, rating: 4.6, inStock: true, createdAt: '2023-04-12' },
    { id: '6', name: 'Monitor 4K', category: 'Electronics', brand: 'ViewMax', price: 499, rating: 4.4, inStock: true, createdAt: '2023-02-28' },
    { id: '7', name: 'Keyboard Pro', category: 'Electronics', brand: 'TypeMaster', price: 149, rating: 4.1, inStock: true, createdAt: '2023-05-15' },
    { id: '8', name: 'Mouse Wireless', category: 'Electronics', brand: 'ClickMaster', price: 79, rating: 3.9, inStock: false, createdAt: '2023-03-22' }
  ];

  for (const product of products) {
    search.addDocument(product);
  }

  // 配置分面
  search.setFacetConfig([
    { field: 'category', type: 'terms', size: 10 },
    { field: 'brand', type: 'terms', size: 10 },
    { field: 'price', type: 'range' },
    { field: 'rating', type: 'histogram' },
    { field: 'inStock', type: 'terms' }
  ]);

  // 1. 基础搜索（无过滤）
  console.log('--- 基础搜索 ---');
  const result1 = search.search({ limit: 5 });
  console.log(`  Found ${result1.total} products`);
  console.log('  Facets:');
  result1.facets.forEach(facet => {
    console.log(`    ${facet.field} (${facet.type}):`);
    facet.values.slice(0, 3).forEach(v => {
      console.log(`      - ${v.value}: ${v.count}`);
    });
  });

  // 2. 带过滤器的搜索
  console.log('\n--- 按类别过滤 (Electronics) ---');
  const result2 = search.search({
    filters: [{ field: 'category', operator: 'eq', value: 'Electronics' }]
  });
  console.log(`  Found ${result2.total} products`);
  console.log('  Products:', result2.docs.map(d => d.name).join(', '));

  // 3. 多过滤器
  console.log('\n--- 多过滤器 (Electronics + inStock) ---');
  const result3 = search.search({
    filters: [
      { field: 'category', operator: 'eq', value: 'Electronics' },
      { field: 'inStock', operator: 'eq', value: true }
    ]
  });
  console.log(`  Found ${result3.total} products`);
  console.log('  Products:', result3.docs.map(d => d.name).join(', '));

  // 4. 范围过滤器
  console.log('\n--- 价格范围过滤 (price < 500) ---');
  const result4 = search.search({
    filters: [{ field: 'price', operator: 'lt', value: 500 }]
  });
  console.log(`  Found ${result4.total} products`);
  console.log('  Products:', result4.docs.map(d => `${d.name}($${d.price})`).join(', '));

  // 5. 面包屑
  console.log('\n--- 面包屑导航 ---');
  const breadcrumbs = search.getBreadcrumbs([
    { field: 'category', operator: 'eq', value: 'Electronics' },
    { field: 'brand', operator: 'eq', value: 'TechCorp' }
  ]);
  console.log('  Breadcrumbs:', breadcrumbs.map(b => `${b.field}=${b.value}`).join(' > '));
}
