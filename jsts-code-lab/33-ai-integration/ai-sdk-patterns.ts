/**
 * @file AI 集成模式
 * @category AI Integration → SDK
 * @difficulty medium
 * @tags ai, llm, openai, streaming, embeddings
 * 
 * @description
 * AI 大模型集成实现：
 * - LLM 调用
 * - 流式响应
 * - Embeddings
 * - 函数调用
 */

// ============================================================================
// 1. LLM 消息类型
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface LLMRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  functions?: FunctionDefinition[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface LLMResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// 2. AI SDK
// ============================================================================

export class AISDK {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: { apiKey: string; baseURL?: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.defaultModel = config.model || 'gpt-4';
  }

  // 聊天完成
  async chat(messages: ChatMessage[], options?: Partial<LLMRequest>): Promise<LLMResponse> {
    const request: LLMRequest = {
      model: this.defaultModel,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      ...options
    };

    console.log(`[AI SDK] Chat request: ${messages.length} messages`);
    
    // 模拟响应
    await this.simulateDelay();
    
    return {
      id: `chatcmpl-${generateId()}`,
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: this.generateMockResponse(messages)
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: this.estimateTokens(messages),
        completion_tokens: 50,
        total_tokens: this.estimateTokens(messages) + 50
      }
    };
  }

  // 流式聊天
  async *streamChat(messages: ChatMessage[], options?: Partial<LLMRequest>): AsyncGenerator<string> {
    const response = this.generateMockResponse(messages);
    const chunks = response.split(' ');
    
    for (const chunk of chunks) {
      await this.simulateDelay(50);
      yield chunk + ' ';
    }
  }

  // Embeddings
  async createEmbedding(text: string): Promise<number[]> {
    console.log(`[AI SDK] Creating embedding for: ${text.slice(0, 50)}...`);
    
    await this.simulateDelay();
    
    // 返回模拟的 1536 维向量
    return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
  }

  // 函数调用
  async callWithFunctions(
    messages: ChatMessage[],
    functions: FunctionDefinition[]
  ): Promise<LLMResponse> {
    console.log(`[AI SDK] Function call with ${functions.length} functions`);
    
    await this.simulateDelay();
    
    // 模拟函数调用
    const functionToCall = functions[0];
    
    return {
      id: `chatcmpl-${generateId()}`,
      model: this.defaultModel,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: '',
          function_call: {
            name: functionToCall.name,
            arguments: JSON.stringify({ query: messages[messages.length - 1].content })
          }
        },
        finish_reason: 'function_call'
      }],
      usage: { prompt_tokens: 100, completion_tokens: 30, total_tokens: 130 }
    };
  }

  private async simulateDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    return `This is a simulated AI response to: "${lastMessage.content.slice(0, 30)}..."`;
  }

  private estimateTokens(messages: ChatMessage[]): number {
    return messages.reduce((sum, m) => sum + m.content.length / 4, 0);
  }
}

// ============================================================================
// 3. RAG (检索增强生成)
// ============================================================================

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export class RAGSystem {
  private documents: Document[] = [];
  private ai: AISDK;

  constructor(ai: AISDK) {
    this.ai = ai;
  }

  async addDocument(content: string, metadata: Record<string, unknown> = {}): Promise<void> {
    const embedding = await this.ai.createEmbedding(content);
    
    this.documents.push({
      id: generateId(),
      content,
      metadata,
      embedding
    });
    
    console.log(`[RAG] Document added: ${content.slice(0, 50)}...`);
  }

  async query(question: string, topK = 3): Promise<{ answer: string; sources: Document[] }> {
    // 1. 获取查询的 embedding
    const queryEmbedding = await this.ai.createEmbedding(question);
    
    // 2. 检索相似文档
    const relevantDocs = this.findSimilarDocuments(queryEmbedding, topK);
    
    // 3. 构建提示
    const context = relevantDocs.map(d => d.content).join('\n\n');
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
    
    // 4. 生成回答
    const response = await this.ai.chat([
      { role: 'system', content: 'You are a helpful assistant. Use the provided context to answer.' },
      { role: 'user', content: prompt }
    ]);
    
    return {
      answer: response.choices[0].message.content,
      sources: relevantDocs
    };
  }

  private findSimilarDocuments(queryEmbedding: number[], topK: number): Document[] {
    // 计算余弦相似度
    const similarities = this.documents.map(doc => ({
      doc,
      score: doc.embedding ? this.cosineSimilarity(queryEmbedding, doc.embedding) : 0
    }));
    
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK).map(s => s.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// ============================================================================
// 4. AI 代理
// ============================================================================

export interface AgentTool {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export class AIAgent {
  private ai: AISDK;
  private tools: Map<string, AgentTool> = new Map();
  private memory: ChatMessage[] = [];

  constructor(ai: AISDK) {
    this.ai = ai;
  }

  addTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  async run(goal: string, maxIterations = 5): Promise<string> {
    console.log(`[Agent] Goal: ${goal}`);
    
    this.memory.push({ role: 'user', content: goal });
    
    for (let i = 0; i < maxIterations; i++) {
      // 获取工具定义
      const toolDefinitions: FunctionDefinition[] = Array.from(this.tools.values()).map(t => ({
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: {}
        }
      }));
      
      // 请求 LLM
      const response = await this.ai.callWithFunctions(this.memory, toolDefinitions);
      const message = response.choices[0].message;
      
      this.memory.push(message);
      
      // 检查是否需要调用函数
      if (message.function_call) {
        const tool = this.tools.get(message.function_call.name);
        if (tool) {
          console.log(`[Agent] Calling tool: ${tool.name}`);
          const args = JSON.parse(message.function_call.arguments);
          const result = await tool.execute(args);
          
          this.memory.push({
            role: 'function',
            name: tool.name,
            content: result
          });
        }
      } else {
        // 任务完成
        return message.content;
      }
    }
    
    return 'Max iterations reached';
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function demo(): Promise<void> {
  console.log('=== AI 集成模式 ===\n');

  const ai = new AISDK({ apiKey: 'demo-key', model: 'gpt-4' });

  console.log('1. 基础聊天');
  const response = await ai.chat([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is TypeScript?' }
  ]);
  console.log('   Response:', response.choices[0].message.content);
  console.log('   Tokens used:', response.usage.total_tokens);

  console.log('\n2. 流式响应');
  process.stdout.write('   Stream: ');
  for await (const chunk of ai.streamChat([
    { role: 'user', content: 'Tell me a story' }
  ])) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  console.log('\n3. Embeddings');
  const embedding = await ai.createEmbedding('Hello world');
  console.log(`   Embedding dimensions: ${embedding.length}`);
  console.log(`   Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

  console.log('\n4. RAG 系统');
  const rag = new RAGSystem(ai);
  
  await rag.addDocument(
    'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
    { source: 'docs' }
  );
  await rag.addDocument(
    'React is a JavaScript library for building user interfaces.',
    { source: 'docs' }
  );
  await rag.addDocument(
    'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
    { source: 'docs' }
  );
  
  const ragResult = await rag.query('What is TypeScript and how does it relate to JavaScript?');
  console.log('   Answer:', ragResult.answer);
  console.log('   Sources:', ragResult.sources.length);

  console.log('\n5. AI 代理');
  const agent = new AIAgent(ai);
  
  agent.addTool({
    name: 'search',
    description: 'Search for information',
    execute: async (args) => {
      return `Search results for: ${args.query}`;
    }
  });
  
  agent.addTool({
    name: 'calculator',
    description: 'Perform calculations',
    execute: async (args) => {
      return `Result: ${args.expression} = 42`;
    }
  });
  
  const agentResult = await agent.run('Search for TypeScript information and calculate 20 + 22');
  console.log('   Agent result:', agentResult);

  console.log('\nAI 集成要点:');
  console.log('- 流式响应: 改善用户体验，减少等待感');
  console.log('- Embeddings: 将文本转换为向量用于语义搜索');
  console.log('- RAG: 结合检索和生成提供更准确的回答');
  console.log('- 函数调用: 让 AI 能够执行具体任务');
  console.log('- 代理模式: 自主规划和使用工具完成复杂任务');
}

// ============================================================================
// 导出
// ============================================================================

export {
  AISDK,
  RAGSystem,
  AIAgent
};
