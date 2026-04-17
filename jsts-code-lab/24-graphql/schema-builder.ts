/**
 * @file GraphQL Schema 构建器
 * @category GraphQL → Schema
 * @difficulty medium
 * @tags graphql, schema, resolver, type-system
 * 
 * @description
 * GraphQL Schema 构建与执行：
 * - 类型系统定义
 * - Resolver 实现
 * - 查询解析
 * - 数据加载器
 */

// ============================================================================
// 1. GraphQL 类型系统
// ============================================================================

export type GraphQLType = 
  | 'String'
  | 'Int'
  | 'Float'
  | 'Boolean'
  | 'ID'
  | GraphQLObjectType
  | GraphQLList
  | GraphQLNonNull;

export interface GraphQLObjectType {
  kind: 'object';
  name: string;
  fields: Record<string, GraphQLField>;
}

export interface GraphQLList {
  kind: 'list';
  ofType: GraphQLType;
}

export interface GraphQLNonNull {
  kind: 'nonNull';
  ofType: GraphQLType;
}

export interface GraphQLField {
  type: GraphQLType;
  args?: Record<string, GraphQLArgument>;
  resolve?: (parent: unknown, args: Record<string, unknown>, context: unknown) => unknown;
}

export interface GraphQLArgument {
  type: GraphQLType;
  defaultValue?: unknown;
}

// ============================================================================
// 2. Schema 构建器
// ============================================================================

export class SchemaBuilder {
  private types = new Map<string, GraphQLObjectType>();
  private queryType = 'Query';
  private mutationType = 'Mutation';

  objectType(name: string, config: { fields: Record<string, GraphQLField> }): this {
    this.types.set(name, {
      kind: 'object',
      name,
      fields: config.fields
    });
    return this;
  }

  query(fields: Record<string, GraphQLField>): this {
    return this.objectType(this.queryType, { fields });
  }

  mutation(fields: Record<string, GraphQLField>): this {
    return this.objectType(this.mutationType, { fields });
  }

  build(): GraphQLSchema {
    return {
      query: this.types.get(this.queryType)!,
      mutation: this.types.get(this.mutationType),
      types: Object.fromEntries(this.types)
    };
  }
}

export interface GraphQLSchema {
  query: GraphQLObjectType;
  mutation?: GraphQLObjectType;
  types: Record<string, GraphQLObjectType>;
}

// ============================================================================
// 3. 查询解析器
// ============================================================================

interface ParsedQuery {
  operation: 'query' | 'mutation' | 'subscription';
  name?: string;
  selections: FieldSelection[];
  variables: Record<string, unknown>;
}

interface FieldSelection {
  name: string;
  alias?: string;
  arguments?: Record<string, unknown>;
  selections?: FieldSelection[];
}

export class QueryParser {
  parse(query: string): ParsedQuery {
    // 简化实现：解析基本查询结构
    const lines = query.trim().split('\n').map(l => l.trim()).filter(l => l);
    
    const operation = this.detectOperation(lines[0]);
    const name = this.extractName(lines[0]);
    
    const selections: FieldSelection[] = [];
    let currentDepth = 0;
    let currentField: FieldSelection | null = null;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '{') {
        currentDepth++;
        continue;
      }
      
      if (line === '}') {
        currentDepth--;
        if (currentDepth === 0) {
          currentField = null;
        }
        continue;
      }
      
      const field = this.parseField(line);
      if (currentDepth === 1) {
        selections.push(field);
        currentField = field;
      } else if (currentField) {
        currentField.selections = currentField.selections || [];
        currentField.selections.push(field);
      }
    }
    
    return {
      operation,
      name,
      selections,
      variables: {}
    };
  }

  private detectOperation(firstLine: string): ParsedQuery['operation'] {
    if (firstLine.startsWith('mutation')) return 'mutation';
    if (firstLine.startsWith('subscription')) return 'subscription';
    return 'query';
  }

  private extractName(line: string): string | undefined {
    const match = /(?:query|mutation|subscription)\s+(\w+)/.exec(line);
    return match?.[1];
  }

  private parseField(line: string): FieldSelection {
    // 解析字段名、别名和参数
    const match = /(?:(\w+):\s*)?(\w+)(?:\(([^)]+)\))?/.exec(line);
    if (!match) return { name: line };
    
    const [, alias, name, argsStr] = match;
    
    const args: Record<string, unknown> = {};
    if (argsStr) {
      argsStr.split(',').forEach(arg => {
        const [key, value] = arg.split(':').map(s => s.trim());
        args[key] = this.parseValue(value);
      });
    }
    
    return {
      name,
      alias,
      arguments: Object.keys(args).length > 0 ? args : undefined
    };
  }

  private parseValue(value: string): unknown {
    if (value?.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}

// ============================================================================
// 4. 查询执行器
// ============================================================================

export class QueryExecutor {
  constructor(private schema: GraphQLSchema) {}

  async execute(
    query: string,
    variables: Record<string, unknown> = {},
    context: unknown = {}
  ): Promise<ExecutionResult> {
    const parser = new QueryParser();
    const parsed = parser.parse(query);
    
    const rootType = parsed.operation === 'mutation' 
      ? this.schema.mutation 
      : this.schema.query;
    
    if (!rootType) {
      return { errors: [{ message: `Schema does not support ${parsed.operation}` }] };
    }

    const data: Record<string, unknown> = {};
    const errors: ExecutionError[] = [];

    for (const selection of parsed.selections) {
      try {
        const field = rootType.fields[selection.name];
        if (!field) {
          throw new Error(`Field '${selection.name}' not found on type '${rootType.name}'`);
        }

        const result = await field.resolve?.(
          {},
          { ...selection.arguments, ...variables },
          context
        );
        
        data[selection.alias || selection.name] = result;
      } catch (error) {
        errors.push({
          message: (error as Error).message,
          path: [selection.name]
        });
      }
    }

    return { data, errors: errors.length > 0 ? errors : undefined };
  }
}

export interface ExecutionResult {
  data?: Record<string, unknown>;
  errors?: ExecutionError[];
}

export interface ExecutionError {
  message: string;
  path?: string[];
}

// ============================================================================
// 5. 数据加载器（N+1 问题解决）
// ============================================================================

export class DataLoader<K, V> {
  private batch = new Map<K, ((value: V | Error) => void)[]>();
  private batchSchedule: ReturnType<typeof setImmediate> | null = null;

  constructor(private batchFn: (keys: K[]) => Promise<(V | Error)[]>) {}

  load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      const callbacks = this.batch.get(key);
      
      if (callbacks) {
        callbacks.push((value) => {
          if (value instanceof Error) {
            reject(value);
          } else {
            resolve(value);
          }
        });
      } else {
        this.batch.set(key, [(value) => {
          if (value instanceof Error) {
            reject(value);
          } else {
            resolve(value);
          }
        }]);
      }

      this.scheduleBatch();
    });
  }

  loadMany(keys: K[]): Promise<(V | Error)[]> {
    return Promise.all(keys.map(key => 
      this.load(key).catch(error => error as Error)
    ));
  }

  private scheduleBatch(): void {
    if (this.batchSchedule) return;
    
    this.batchSchedule = setImmediate(async () => {
      this.batchSchedule = null;
      await this.dispatchBatch();
    });
  }

  private async dispatchBatch(): Promise<void> {
    const keys = Array.from(this.batch.keys());
    const callbacks = Array.from(this.batch.values());
    this.batch.clear();

    try {
      const results = await this.batchFn(keys);
      
      callbacks.forEach((cbs, index) => {
        const result = results[index];
        cbs.forEach(cb => { cb(result); });
      });
    } catch (error) {
      callbacks.forEach(cbs => {
        cbs.forEach(cb => { cb(error as Error); });
      });
    }
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== GraphQL Schema 构建器 ===\n');

  // 定义 Schema
  const builder = new SchemaBuilder();
  
  builder.objectType('User', {
    fields: {
      id: { type: 'ID' },
      name: { type: 'String' },
      email: { type: 'String' }
    }
  });

  builder.query({
    user: {
      type: { kind: 'object', name: 'User', fields: {} },
      args: {
        id: { type: 'ID' }
      },
      resolve: async (_, args) => {
        // 模拟数据库查询
        return {
          id: args.id,
          name: `User ${args.id}`,
          email: `user${args.id}@example.com`
        };
      }
    },
    users: {
      type: { kind: 'list', ofType: { kind: 'object', name: 'User', fields: {} } },
      resolve: async () => {
        return [
          { id: '1', name: 'Alice', email: 'alice@example.com' },
          { id: '2', name: 'Bob', email: 'bob@example.com' }
        ];
      }
    }
  });

  const schema = builder.build();
  console.log('1. Schema 定义');
  console.log('   Query fields:', Object.keys(schema.query.fields));

  console.log('\n2. 查询解析');
  const parser = new QueryParser();
  const query = `
    query GetUser {
      user(id: "123") {
        id
        name
        email
      }
    }
  `;
  const parsed = parser.parse(query);
  console.log('   Operation:', parsed.operation);
  console.log('   Name:', parsed.name);
  console.log('   Selections:', parsed.selections.map(s => s.name).join(', '));

  console.log('\n3. 查询执行');
  const executor = new QueryExecutor(schema);
  const result = await executor.execute(query);
  console.log('   Data:', JSON.stringify(result.data, null, 2));

  console.log('\n4. 数据加载器 (解决 N+1)');
  const userLoader = new DataLoader<string, { id: string; name: string }>(async (ids) => {
    console.log(`   Batch loading users: ${ids.join(', ')}`);
    return ids.map(id => ({ id, name: `User ${id}` }));
  });

  const users = await Promise.all([
    userLoader.load('1'),
    userLoader.load('2'),
    userLoader.load('1') // 重复加载，会合并
  ]);
  console.log('   Loaded users:', users.length);

  console.log('\nGraphQL 要点:');
  console.log('- 强类型 Schema：自文档化 API');
  console.log('- 精确查询：客户端决定获取哪些字段');
  console.log('- 单一端点：所有操作通过 /graphql');
  console.log('- 数据加载器：批量加载解决 N+1 问题');
  console.log('- Resolver：字段级别的数据获取逻辑');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
