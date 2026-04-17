/**
 * @file 端到端类型安全
 * @category Fullstack Patterns → Type Safety
 * @difficulty hard
 * @tags fullstack, typescript, type-safety, tRPC
 */

// 模拟tRPC风格的端到端类型安全

export type Router = Record<string, Procedure>;

export interface Procedure {
  input?: InputSchema;
  output?: OutputSchema;
  resolve: (input: any) => Promise<any>;
}

export interface InputSchema {
  parse: (data: unknown) => any;
}

export interface OutputSchema {
  parse: (data: unknown) => any;
}

// 类型安全的API路由器
export class TypedRouter<T extends Router> {
  private router: T;
  
  constructor(router: T) {
    this.router = router;
  }
  
  async call<K extends keyof T>(
    procedure: K,
    input: T[K]['input'] extends InputSchema 
      ? ReturnType<T[K]['input']['parse']> 
      : undefined
  ): Promise<
    T[K]['output'] extends OutputSchema 
      ? ReturnType<T[K]['output']['parse']> 
      : any
  > {
    const proc = this.router[procedure];
    
    // 验证输入
    const validatedInput = proc.input ? proc.input.parse(input) : input;
    
    // 执行
    const result = await proc.resolve(validatedInput);
    
    // 验证输出
    return proc.output ? proc.output.parse(result) : result;
  }
}

// 示例：定义类型安全的路由
export const exampleRouter = {
  getUser: {
    input: {
      parse: (data: unknown) => {
        if (typeof data !== 'object' || data === null) {
          throw new Error('Input must be an object');
        }
        const { id } = data as { id: unknown };
        if (typeof id !== 'string') {
          throw new Error('id must be a string');
        }
        return { id };
      }
    },
    output: {
      parse: (data: unknown) => {
        if (typeof data !== 'object' || data === null) {
          throw new Error('Output must be an object');
        }
        return data as { id: string; name: string; email: string };
      }
    },
    resolve: async (input: { id: string }) => {
      // 模拟数据库查询
      return {
        id: input.id,
        name: 'John Doe',
        email: 'john@example.com'
      };
    }
  },
  
  createPost: {
    input: {
      parse: (data: unknown) => {
        const d = data as { title: string; content: string };
        if (!d.title || !d.content) {
          throw new Error('Title and content are required');
        }
        return d;
      }
    },
    resolve: async (input: { title: string; content: string }) => {
      return {
        id: 'post-1',
        title: input.title,
        content: input.content,
        createdAt: new Date().toISOString()
      };
    }
  }
};

// API客户端生成器
export class APIClientGenerator {
  generateClientCode(router: Router): string {
    const lines: string[] = [];
    lines.push('export class APIClient {');
    lines.push('  private baseURL: string;');
    lines.push('  constructor(baseURL: string) {');
    lines.push('    this.baseURL = baseURL;');
    lines.push('  }');
    lines.push('');
    
    for (const [name, proc] of Object.entries(router)) {
      lines.push(`  async ${name}(input: any): Promise<any> {`);
      lines.push(`    const response = await fetch(\`\${this.baseURL}/${name}\`, {`);
      lines.push(`      method: 'POST',`);
      lines.push(`      headers: { 'Content-Type': 'application/json' },`);
      lines.push(`      body: JSON.stringify(input)`);
      lines.push(`    });`);
      lines.push(`    return response.json();`);
      lines.push(`  }`);
      lines.push('');
    }
    
    lines.push('}');
    return lines.join('\n');
  }
}

export function demo(): void {
  console.log('=== 端到端类型安全 ===\n');
  
  const router = new TypedRouter(exampleRouter);
  
  console.log('类型安全的路由器:');
  console.log('  - getUser: { id: string } => User');
  console.log('  - createPost: { title: string, content: string } => Post');
  
  const clientGen = new APIClientGenerator();
  const clientCode = clientGen.generateClientCode(exampleRouter);
  console.log('\n生成的客户端代码:');
  console.log(clientCode.slice(0, 400) + '...');
}
