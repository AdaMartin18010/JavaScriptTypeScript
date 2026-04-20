/**
 * @file OpenAPI 到 TypeScript 客户端生成器
 * @category Code Generation → OpenAPI Client
 * @difficulty hard
 * @tags openapi, typescript, client-generation, api, codegen
 *
 * @description
 * 简化版 OpenAPI 规范解析器和 TypeScript 客户端代码生成器。
 *
 * 功能：
 * - OpenAPI Schema 解析与类型推断
 * - 从 Schema 生成 TypeScript 类型定义
 * - 从 Paths 生成 API 方法
 * - 请求/响应包装器生成
 */

// ==================== OpenAPI 类型定义（简化）====================

export type OpenAPISchemaType = 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';

export interface OpenAPISchema {
  type?: OpenAPISchemaType | string; format?: string; description?: string; nullable?: boolean;
  enum?: (string | number)[]; properties?: Record<string, OpenAPISchema>; required?: string[];
  items?: OpenAPISchema; $ref?: string; additionalProperties?: boolean | OpenAPISchema;
  allOf?: OpenAPISchema[]; oneOf?: OpenAPISchema[]; default?: unknown;
}

export interface OpenAPIParameter {
  name: string; in: 'query' | 'path' | 'header' | 'body'; required?: boolean; description?: string; schema?: OpenAPISchema; type?: string;
}

export interface OpenAPIResponse {
  description: string; schema?: OpenAPISchema; content?: Record<string, { schema: OpenAPISchema }>;
}

export interface OpenAPIOperation {
  operationId?: string; summary?: string; description?: string; tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: { content?: Record<string, { schema: OpenAPISchema }>; required?: boolean };
  responses: Record<string, OpenAPIResponse>;
}

export interface OpenAPIPathItem {
  get?: OpenAPIOperation; post?: OpenAPIOperation; put?: OpenAPIOperation;
  patch?: OpenAPIOperation; delete?: OpenAPIOperation; parameters?: OpenAPIParameter[];
}

export interface OpenAPISpec {
  openapi: string; info: { title: string; version: string };
  paths: Record<string, OpenAPIPathItem>;
  components?: { schemas?: Record<string, OpenAPISchema> };
}

// ==================== Schema 到 TypeScript 类型转换器 ====================

export class TypeScriptTypeGenerator {
  private generated = new Set<string>();
  private buffer: string[] = [];

  generateSchemaType(name: string, schema: OpenAPISchema): string {
    if (this.generated.has(name)) return '';
    this.generated.add(name);
    const typeStr = this.schemaToTypeString(schema, name);
    if (schema.type === 'object' || schema.properties || schema.allOf) { this.buffer.push(`export interface ${this.pascal(name)} ${typeStr}`); }
    else { this.buffer.push(`export type ${this.pascal(name)} = ${typeStr};`); }
    return this.buffer[this.buffer.length - 1];
  }

  generateComponentSchemas(schemas: Record<string, OpenAPISchema>): string {
    for (const [name, schema] of Object.entries(schemas)) this.generateSchemaType(name, schema);
    return this.buffer.join('\n\n');
  }

  schemaToTypeString(schema: OpenAPISchema, _nameHint = ''): string {
    if (schema.$ref) { const refName = schema.$ref.split('/').pop() ?? 'Unknown'; return this.pascal(refName); }
    if (schema.allOf?.length) return schema.allOf.map(s => this.schemaToTypeString(s)).join(' & ');
    if (schema.oneOf?.length) return schema.oneOf.map(s => this.schemaToTypeString(s)).join(' | ');
    if (schema.enum) return schema.enum.map(v => typeof v === 'string' ? `'${v}'` : v).join(' | ');
    switch (schema.type) {
      case 'string': return schema.format === 'date-time' || schema.format === 'date' ? 'Date | string' : schema.format === 'binary' ? 'Blob' : 'string';
      case 'integer': case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return schema.items ? `Array<${this.schemaToTypeString(schema.items)}>` : 'unknown[]';
      case 'object': {
        if (schema.additionalProperties === true) return 'Record<string, unknown>';
        if (typeof schema.additionalProperties === 'object') return `Record<string, ${this.schemaToTypeString(schema.additionalProperties)}>`;
        if (!schema.properties || Object.keys(schema.properties).length === 0) return 'Record<string, unknown>';
        const lines: string[] = ['{']; const required = new Set(schema.required ?? []);
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const optional = !required.has(propName) || propSchema.nullable ? '?' : '';
          const desc = propSchema.description ? ` // ${propSchema.description}` : '';
          lines.push(`  ${propName}${optional}: ${this.schemaToTypeString(propSchema, propName)};${desc}`);
        }
        lines.push('}'); return lines.join('\n');
      }
      default: return 'unknown';
    }
  }

  getGeneratedTypes(): string[] { return [...this.buffer]; }
  clear(): void { this.generated.clear(); this.buffer = []; }
  private pascal(str: string): string { return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase()); }
}

// ==================== API 方法生成器 ====================

export interface APIMethod {
  name: string; method: string; path: string; summary?: string;
  parameters: Array<{ name: string; type: string; optional: boolean; location: string }>;
  requestBodyType?: string; responseType: string;
}

export class APIMethodGenerator {
  private typeGen: TypeScriptTypeGenerator;
  constructor(typeGen?: TypeScriptTypeGenerator) { this.typeGen = typeGen ?? new TypeScriptTypeGenerator(); }

  generateMethods(paths: Record<string, OpenAPIPathItem>): APIMethod[] {
    const methods: APIMethod[] = [];
    for (const [path, item] of Object.entries(paths)) {
      const ops: Array<[string, OpenAPIOperation | undefined]> = [['get', item.get], ['post', item.post], ['put', item.put], ['patch', item.patch], ['delete', item.delete]];
      for (const [httpMethod, op] of ops) {
        if (!op) continue;
        const methodName = op.operationId ?? this.inferMethodName(path, httpMethod);
        methods.push({
          name: methodName, method: httpMethod.toUpperCase(), path, summary: op.summary,
          parameters: this.extractParameters(op, item.parameters),
          requestBodyType: this.extractRequestBodyType(op),
          responseType: this.extractResponseType(op)
        });
      }
    }
    return methods;
  }

  generateClientMethod(apiMethod: APIMethod): string {
    const args: string[] = []; const queryParams: string[] = [];
    for (const p of apiMethod.parameters) {
      args.push(`${p.name}${p.optional ? '?' : ''}: ${p.type}`);
      if (p.location === 'query') queryParams.push(p.name);
    }
    if (apiMethod.requestBodyType) args.push(`body: ${apiMethod.requestBodyType}`);
    if (queryParams.length > 0) args.push(`options?: { ${queryParams.map(q => `${q}?: string`).join('; ')} }`);
    let pathExpr = `\`${apiMethod.path.replace(/{(\w+)}/g, (_, name) => `\${${name}}`)}\``;
    const lines: string[] = [
      `/**`, ` * ${apiMethod.summary ?? apiMethod.name}`, ` * @method ${apiMethod.method}`, ` */`,
      `async ${apiMethod.name}(${args.join(', ')}): Promise<${apiMethod.responseType}> {`
    ];
    if (queryParams.length > 0) {
      lines.push(`  const query = new URLSearchParams();`);
      for (const q of queryParams) lines.push(`  if (options?.${q}) query.append('${q}', options.${q});`);
      pathExpr += ` + (query.toString() ? '?' + query.toString() : '')`;
    }
    const bodyArg = apiMethod.requestBodyType ? ', body' : '';
    lines.push(`  return this.request<${apiMethod.responseType}>('${apiMethod.method}', ${pathExpr}${bodyArg});`, `}`);
    return lines.join('\n');
  }

  private extractParameters(op: OpenAPIOperation, common?: OpenAPIParameter[]) {
    return [...(common ?? []), ...(op.parameters ?? [])].map(p => ({
      name: p.name, type: p.schema ? this.typeGen.schemaToTypeString(p.schema) : (p.type ?? 'string'),
      optional: !(p.required ?? false), location: p.in
    }));
  }

  private extractRequestBodyType(op: OpenAPIOperation): string | undefined {
    const jsonSchema = op.requestBody?.content?.['application/json']?.schema;
    return jsonSchema ? this.typeGen.schemaToTypeString(jsonSchema) : undefined;
  }

  private extractResponseType(op: OpenAPIOperation): string {
    const success = op.responses['200'] ?? op.responses['201'] ?? op.responses['204'];
    if (!success) return 'unknown';
    const schema = success.schema ?? success.content?.['application/json']?.schema;
    return schema ? this.typeGen.schemaToTypeString(schema) : 'void';
  }

  private inferMethodName(path: string, method: string): string {
    const clean = path.replace(/[{}]/g, '').replace(/\//g, '_');
    return `${method.toLowerCase()}${clean.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
  }
}

// ==================== 请求/响应包装器生成器 ====================

export class RequestWrapperGenerator {
  generateBaseClient(baseURL = 'https://api.example.com'): string {
    return `
export interface APIError { status: number; message: string; details?: Record<string, unknown>; }

export class APIClient {
  constructor(private baseURL: string = '${baseURL}') {}

  protected async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(this.baseURL + path, {
      method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) { const error: APIError = { status: response.status, message: response.statusText }; throw error; }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}`.trim();
  }

  generateFullClient(spec: OpenAPISpec): string {
    const typeGen = new TypeScriptTypeGenerator(); const methodGen = new APIMethodGenerator(typeGen);
    const parts: string[] = [];
    if (spec.components?.schemas) { parts.push('// ==================== Types ====================\n'); parts.push(typeGen.generateComponentSchemas(spec.components.schemas)); }
    parts.push('\n// ==================== Base Client ====================\n'); parts.push(this.generateBaseClient());
    const methods = methodGen.generateMethods(spec.paths);
    if (methods.length > 0) {
      parts.push('\n// ==================== API Methods ====================\n');
      parts.push(`export class ${this.pascal(spec.info.title)}Client extends APIClient {`);
      for (const m of methods) { parts.push('  ' + methodGen.generateClientMethod(m).replace(/\n/g, '\n  ')); parts.push(''); }
      parts.push('}');
    }
    return parts.join('\n');
  }

  private pascal(str: string): string { return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase()); }
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== OpenAPI TypeScript 客户端生成器 ===\n');

  const sampleSpec: OpenAPISpec = {
    openapi: '3.0.0', info: { title: 'User Service', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'listUsers', summary: '获取用户列表',
          parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }],
          responses: {
            '200': { description: '用户列表', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } }, total: { type: 'integer' } } } } } }
          }
        },
        post: {
          operationId: 'createUser', summary: '创建用户',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } } },
          responses: { '201': { description: '创建成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } }
        }
      },
      '/users/{id}': {
        get: {
          operationId: 'getUserById', summary: '根据 ID 获取用户',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: '用户信息', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } }
        }
      }
    },
    components: {
      schemas: {
        User: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, age: { type: 'integer', nullable: true }, roles: { type: 'array', items: { type: 'string' } } }, required: ['id', 'name', 'email'] },
        CreateUserRequest: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, age: { type: 'integer' } }, required: ['name', 'email'] }
      }
    }
  };

  console.log('--- Schema 类型生成 ---');
  const typeGen = new TypeScriptTypeGenerator();
  console.log(typeGen.generateSchemaType('User', sampleSpec.components!.schemas!.User));

  console.log('\n--- API 方法提取 ---');
  const methodGen = new APIMethodGenerator();
  const methods = methodGen.generateMethods(sampleSpec.paths);
  for (const m of methods) { console.log(`${m.method} ${m.path} -> ${m.name}(): Promise<${m.responseType}>`); }

  console.log('\n--- 客户端方法生成 ---');
  const getUserMethod = methods.find(m => m.name === 'getUserById');
  if (getUserMethod) console.log(methodGen.generateClientMethod(getUserMethod));

  console.log('\n--- 请求包装器 ---');
  const wrapperGen = new RequestWrapperGenerator();
  console.log(wrapperGen.generateBaseClient().slice(0, 400) + '...');
}
