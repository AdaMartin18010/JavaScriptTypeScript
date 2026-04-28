/**
 * @file 请求转换器
 * @category API Gateway → Request Transformation
 * @difficulty medium
 * @tags api-gateway, request-transformation, middleware, protocol-adapter
 *
 * @description
 * API 网关请求/响应转换器：协议适配、字段映射、内容转换
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface HttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface TransformationRule {
  source: string;
  target: string;
  required?: boolean;
  defaultValue?: unknown;
  transform?: (value: unknown) => unknown;
}

export interface RequestTransformationConfig {
  headerMappings?: TransformationRule[];
  queryMappings?: TransformationRule[];
  bodyMappings?: TransformationRule[];
  pathRewrite?: Record<string, string>;
  stripHeaders?: string[];
  addHeaders?: Record<string, string>;
}

// ============================================================================
// 请求转换器
// ============================================================================

export class RequestTransformer {
  constructor(private config: RequestTransformationConfig) {}

  /**
   * 转换请求
   */
  transform(request: HttpRequest): HttpRequest {
    let transformed: HttpRequest = { ...request };

    // 路径重写
    if (this.config.pathRewrite) {
      transformed = this.rewritePath(transformed);
    }

    // 请求头转换
    if (this.config.headerMappings || this.config.stripHeaders || this.config.addHeaders) {
      transformed = this.transformHeaders(transformed);
    }

    // 查询参数转换
    if (this.config.queryMappings) {
      transformed = this.transformQuery(transformed);
    }

    // Body 转换
    if (this.config.bodyMappings) {
      transformed = this.transformBody(transformed);
    }

    return transformed;
  }

  /**
   * 路径重写
   */
  private rewritePath(request: HttpRequest): HttpRequest {
    let path = request.path;

    for (const [pattern, replacement] of Object.entries(this.config.pathRewrite || {})) {
      path = path.replace(new RegExp(pattern), replacement);
    }

    return { ...request, path };
  }

  /**
   * 请求头转换
   */
  private transformHeaders(request: HttpRequest): HttpRequest {
    const headers: Record<string, string> = {};

    // 复制保留的请求头
    const stripSet = new Set(this.config.stripHeaders || []);
    for (const [key, value] of Object.entries(request.headers)) {
      if (!stripSet.has(key.toLowerCase())) {
        headers[key.toLowerCase()] = value;
      }
    }

    // 映射请求头
    for (const rule of this.config.headerMappings || []) {
      const sourceValue = request.headers[rule.source.toLowerCase()];
      if (sourceValue !== undefined) {
        headers[rule.target.toLowerCase()] = String(
          rule.transform ? rule.transform(sourceValue) : sourceValue
        );
      } else if (rule.required && rule.defaultValue !== undefined) {
        headers[rule.target.toLowerCase()] = String(rule.defaultValue);
      }
    }

    // 添加固定请求头
    for (const [key, value] of Object.entries(this.config.addHeaders || {})) {
      headers[key.toLowerCase()] = value;
    }

    return { ...request, headers };
  }

  /**
   * 查询参数转换
   */
  private transformQuery(request: HttpRequest): HttpRequest {
    const query: Record<string, string> = { ...request.query };

    for (const rule of this.config.queryMappings || []) {
      const sourceValue = request.query[rule.source];
      if (sourceValue !== undefined) {
        delete query[rule.source];
        query[rule.target] = String(
          rule.transform ? rule.transform(sourceValue) : sourceValue
        );
      } else if (rule.required && rule.defaultValue !== undefined) {
        query[rule.target] = String(rule.defaultValue);
      }
    }

    return { ...request, query };
  }

  /**
   * Body 转换
   */
  private transformBody(request: HttpRequest): HttpRequest {
    if (!request.body || typeof request.body !== 'object') {
      return request;
    }

    const body: Record<string, unknown> = {};
    const original = request.body as Record<string, unknown>;

    for (const rule of this.config.bodyMappings || []) {
      const sourceValue = original[rule.source];
      if (sourceValue !== undefined) {
        body[rule.target] = rule.transform ? rule.transform(sourceValue) : sourceValue;
      } else if (rule.required && rule.defaultValue !== undefined) {
        body[rule.target] = rule.defaultValue;
      }
    }

    return { ...request, body };
  }
}

// ============================================================================
// 响应转换器
// ============================================================================

export class ResponseTransformer {
  /**
   * 包装响应为标准格式
   */
  static wrap(data: unknown, status = 200): HttpResponse {
    return {
      status,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, data }
    };
  }

  /**
   * 包装错误响应
   */
  static error(message: string, status = 500, code?: string): HttpResponse {
    return {
      status,
      headers: { 'Content-Type': 'application/json' },
      body: { success: false, error: message, code }
    };
  }

  /**
   * 聚合多个服务响应
   */
  static aggregate(responses: Array<{ service: string; response: HttpResponse }>): HttpResponse {
    const aggregated: Record<string, unknown> = {};
    const errors: Array<{ service: string; error: string }> = [];

    for (const { service, response } of responses) {
      if (response.status >= 200 && response.status < 300) {
        aggregated[service] = response.body;
      } else {
        errors.push({
          service,
          error: typeof response.body === 'object' && response.body !== null
            ? (response.body as Record<string, unknown>).error as string || 'Unknown error'
            : 'Unknown error'
        });
      }
    }

    return {
      status: errors.length > 0 ? 207 : 200,
      headers: { 'Content-Type': 'application/json' },
      body: { data: aggregated, errors: errors.length > 0 ? errors : undefined }
    };
  }

  /**
   * 转换 Content-Type
   */
  static transformContentType(response: HttpResponse, targetType: string): HttpResponse {
    return {
      ...response,
      headers: { ...response.headers, 'Content-Type': targetType }
    };
  }
}

// ============================================================================
// 协议适配器
// ============================================================================

export class ProtocolAdapter {
  /**
   * GraphQL 查询转 REST 参数
   */
  static graphqlToRest(query: { operationName?: string; variables?: Record<string, unknown> }): {
    path: string;
    params: Record<string, unknown>;
  } {
    return {
      path: query.operationName || '/',
      params: query.variables || {}
    };
  }

  /**
   * REST 参数转 gRPC 风格
   */
  static restToGRPC(path: string, body: Record<string, unknown>): { method: string; message: Record<string, unknown> } {
    const method = path
      .replace(/^\//, '')
      .replace(/\//g, '.')
      .replace(/:([a-zA-Z]+)/g, (_, name) => `By${name.charAt(0).toUpperCase()}${name.slice(1)}`);

    return { method, message: body };
  }

  /**
   * WebSocket 消息转 HTTP 请求
   */
  static websocketToHttp(message: { action: string; payload?: unknown }): HttpRequest {
    return {
      method: 'POST',
      path: `/ws/${message.action}`,
      headers: { 'Content-Type': 'application/json' },
      query: {},
      body: message.payload
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 请求转换器 ===\n');

  // 请求转换
  const transformer = new RequestTransformer({
    pathRewrite: { '^/api/v1': '/v1' },
    headerMappings: [
      { source: 'X-User-ID', target: 'X-Internal-User-ID', required: true }
    ],
    stripHeaders: ['x-forwarded-host'],
    addHeaders: { 'X-Gateway': 'api-gateway-v1' }
  });

  const request: HttpRequest = {
    method: 'GET',
    path: '/api/v1/users',
    headers: { 'x-user-id': '123', 'x-forwarded-host': 'example.com' },
    query: { page: '1' }
  };

  const transformed = transformer.transform(request);
  console.log('Original path:', request.path);
  console.log('Transformed path:', transformed.path);
  console.log('Transformed headers:', transformed.headers);

  // 响应聚合
  console.log('\n--- Response Aggregation ---');
  const aggregated = ResponseTransformer.aggregate([
    { service: 'user-service', response: ResponseTransformer.wrap({ name: 'Alice' }) },
    { service: 'order-service', response: ResponseTransformer.error('Timeout', 504) }
  ]);
  console.log('Aggregated status:', aggregated.status);

  // 协议适配
  console.log('\n--- Protocol Adapter ---');
  const grpc = ProtocolAdapter.restToGRPC('/users/:id', { id: '123', name: 'Alice' });
  console.log('gRPC method:', grpc.method);
}
