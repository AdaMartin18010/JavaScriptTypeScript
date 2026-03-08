/**
 * @file REST API 设计模式
 * @category Backend Development → API Design
 * @difficulty medium
 * @tags rest-api, openapi, versioning, pagination
 * 
 * @description
 * RESTful API 设计最佳实践：
 * - 版本控制
 * - 分页策略
 * - 过滤与排序
 * - OpenAPI 生成
 */

// ============================================================================
// 1. API 版本控制
// ============================================================================

export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3'
}

export interface VersionedRoute {
  version: ApiVersion;
  path: string;
  deprecated?: boolean;
  sunsetDate?: Date;
}

export class ApiVersioning {
  private routes: Map<string, Map<ApiVersion, VersionedRoute>> = new Map();

  register(path: string, version: ApiVersion, handler: unknown): void {
    if (!this.routes.has(path)) {
      this.routes.set(path, new Map());
    }
    this.routes.get(path)!.set(version, { version, path });
  }

  // URL 路径版本: /v1/users
  static createPathVersion(version: ApiVersion, path: string): string {
    return `/${version}${path}`;
  }

  // Header 版本: Accept: application/vnd.api+json;version=1
  static parseHeaderVersion(header: string): ApiVersion | null {
    const match = header.match(/version=(\d+)/);
    if (match) {
      return `v${match[1]}` as ApiVersion;
    }
    return null;
  }

  // 查询参数版本: ?api-version=1
  static parseQueryVersion(query: Record<string, string>): ApiVersion | null {
    const version = query['api-version'];
    if (version) {
      return `v${version}` as ApiVersion;
    }
    return null;
  }
}

// ============================================================================
// 2. 分页策略
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    prevCursor: string | null;
  };
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
}

export class PaginationHelper {
  // Offset 分页
  static createOffsetResult<T>(
    data: T[],
    total: number,
    options: Required<PaginationOptions>,
    baseUrl: string
  ): OffsetPaginationResult<T> {
    const { page, limit } = options;
    const totalPages = Math.ceil(total / limit);
    
    const buildUrl = (p: number) => `${baseUrl}?page=${p}&limit=${limit}`;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      links: {
        self: buildUrl(page),
        first: buildUrl(1),
        prev: page > 1 ? buildUrl(page - 1) : null,
        next: page < totalPages ? buildUrl(page + 1) : null,
        last: buildUrl(totalPages)
      }
    };
  }

  // Cursor 分页
  static createCursorResult<T>(
    data: T[],
    limit: number,
    hasMore: boolean,
    encodeCursor: (item: T) => string,
    baseUrl: string
  ): CursorPaginationResult<T> {
    const nextCursor = hasMore && data.length > 0 
      ? encodeCursor(data[data.length - 1]) 
      : null;

    return {
      data,
      pagination: {
        limit,
        nextCursor,
        prevCursor: null // 简化实现
      },
      links: {
        self: baseUrl,
        next: nextCursor ? `${baseUrl}?cursor=${nextCursor}&limit=${limit}` : null,
        prev: null
      }
    };
  }
}

// ============================================================================
// 3. 过滤与排序
// ============================================================================

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: string | number | boolean | string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export class QueryParser {
  // 解析过滤条件
  static parseFilters(query: Record<string, string>): FilterOptions[] {
    const filters: FilterOptions[] = [];
    
    // 格式: ?name[eq]=john&age[gte]=18
    const filterRegex = /^(\w+)\[(eq|ne|gt|gte|lt|lte|like|in)\]$/;
    
    for (const [key, value] of Object.entries(query)) {
      const match = key.match(filterRegex);
      if (match) {
        filters.push({
          field: match[1],
          operator: match[2] as FilterOptions['operator'],
          value: value.includes(',') ? value.split(',') : value
        });
      }
    }
    
    return filters;
  }

  // 解析排序
  static parseSort(sortParam: string): SortOption[] {
    // 格式: ?sort=-created_at,name (负号表示降序)
    return sortParam.split(',').map(field => {
      const isDesc = field.startsWith('-');
      return {
        field: isDesc ? field.slice(1) : field,
        direction: isDesc ? 'desc' : 'asc'
      };
    });
  }

  // 解析字段选择
  static parseFields(fieldsParam: string): string[] {
    // 格式: ?fields=id,name,email
    return fieldsParam.split(',').map(f => f.trim());
  }
}

// ============================================================================
// 4. 标准响应格式
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string; // 仅在开发环境
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: OffsetPaginationResult<unknown>['pagination'];
}

export class ResponseBuilder<T> {
  private response: ApiResponse<T> = { success: true };

  static success<T>(data: T): ResponseBuilder<T> {
    const builder = new ResponseBuilder<T>();
    builder.response.data = data;
    return builder;
  }

  static error(code: string, message: string, details?: Record<string, string[]>): ResponseBuilder<never> {
    const builder = new ResponseBuilder<never>();
    builder.response.success = false;
    builder.response.error = { code, message, details };
    return builder;
  }

  withMeta(meta: Partial<ResponseMeta>): this {
    this.response.meta = {
      ...this.response.meta,
      ...meta,
      timestamp: new Date().toISOString()
    };
    return this;
  }

  withPagination(pagination: OffsetPaginationResult<unknown>['pagination']): this {
    this.response.meta = {
      ...this.response.meta,
      timestamp: new Date().toISOString(),
      pagination
    };
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
}

// ============================================================================
// 5. OpenAPI 生成器
// ============================================================================

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

interface Operation {
  summary?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>;
  security?: Record<string, string[]>[];
}

interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: unknown;
}

interface RequestBody {
  content: Record<string, { schema: unknown }>;
}

interface Response {
  description: string;
  content?: Record<string, { schema: unknown }>;
}

export class OpenAPIGenerator {
  private spec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: '', version: '1.0.0' },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {}
    }
  };

  constructor(title: string, version: string, description?: string) {
    this.spec.info = { title, version, description };
  }

  addPath(path: string, methods: PathItem): this {
    this.spec.paths[path] = methods;
    return this;
  }

  addSchema(name: string, schema: unknown): this {
    this.spec.components!.schemas![name] = schema;
    return this;
  }

  addSecurityScheme(name: string, scheme: unknown): this {
    this.spec.components!.securitySchemes![name] = scheme;
    return this;
  }

  generate(): OpenAPISpec {
    return this.spec;
  }

  toJSON(): string {
    return JSON.stringify(this.spec, null, 2);
  }

  toYAML(): string {
    // 简化 YAML 生成
    const json = this.spec;
    let yaml = `openapi: ${json.openapi}\n`;
    yaml += `info:\n`;
    yaml += `  title: ${json.info.title}\n`;
    yaml += `  version: ${json.info.version}\n`;
    if (json.info.description) {
      yaml += `  description: ${json.info.description}\n`;
    }
    return yaml;
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== REST API 设计模式 ===\n');

  console.log('1. API 版本控制');
  console.log('   URL 版本: /v1/users');
  console.log('   Header 版本: Accept: application/json;version=2');
  console.log('   查询参数: ?api-version=2');

  console.log('\n2. 分页策略');
  const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
  const offsetResult = PaginationHelper.createOffsetResult(
    users,
    100,
    { page: 2, limit: 10, cursor: '' },
    '/api/users'
  );
  console.log('   Offset 分页:');
  console.log('     Page:', offsetResult.pagination.page);
  console.log('     Total Pages:', offsetResult.pagination.totalPages);
  console.log('     Links:', Object.keys(offsetResult.links));

  console.log('\n3. 过滤与排序');
  const query = { 'age[gte]': '18', 'name[like]': 'John', sort: '-created_at' };
  const filters = QueryParser.parseFilters(query);
  console.log('   Parsed Filters:', filters.length);
  filters.forEach(f => console.log(`     ${f.field} ${f.operator} ${f.value}`));
  
  const sort = QueryParser.parseSort('-created_at,name');
  console.log('   Parsed Sort:', sort.map(s => `${s.field} ${s.direction}`).join(', '));

  console.log('\n4. 标准响应');
  const successResponse = ResponseBuilder
    .success({ id: 1, name: 'Product' })
    .withMeta({ requestId: 'req-123' })
    .build();
  console.log('   Success:', JSON.stringify(successResponse, null, 2));

  const errorResponse = ResponseBuilder
    .error('VALIDATION_ERROR', 'Invalid input', { email: ['Invalid format'] })
    .build();
  console.log('   Error:', JSON.stringify(errorResponse, null, 2));

  console.log('\n5. OpenAPI 生成');
  const generator = new OpenAPIGenerator('E-Commerce API', '1.0.0', '在线商店 API');
  generator
    .addSchema('Product', {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        price: { type: 'number' }
      }
    })
    .addPath('/products', {
      get: {
        summary: '获取商品列表',
        tags: ['Products'],
        responses: {
          '200': { description: '成功' }
        }
      }
    });
  
  const spec = generator.generate();
  console.log('   Spec Info:', spec.info);
  console.log('   Paths:', Object.keys(spec.paths));
  console.log('   Schemas:', Object.keys(spec.components?.schemas || {}));

  console.log('\nAPI 设计最佳实践:');
  console.log('- 使用名词复数表示资源: /users, /orders');
  console.log('- 使用 HTTP 方法表示操作: GET/POST/PUT/DELETE');
  console.log('- 使用状态码准确表达结果: 200/201/400/401/403/404/500');
  console.log('- 提供一致的响应格式');
  console.log('- 实现合理的分页策略');
  console.log('- 使用查询参数过滤、排序、选择字段');
  console.log('- 提供 API 文档 (OpenAPI/Swagger)');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
