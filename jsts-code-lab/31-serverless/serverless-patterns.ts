/**
 * @file 无服务器架构
 * @category Serverless → Functions
 * @difficulty medium
 * @tags serverless, faas, lambda, cloud-functions
 * 
 * @description
 * 无服务器架构实现：
 * - 函数即服务 (FaaS)
 * - 冷启动优化
 * - 事件触发器
 * - 无服务器框架
 */

// ============================================================================
// 1. 无服务器函数定义
// ============================================================================

export interface ServerlessFunction {
  name: string;
  handler: string;
  runtime: 'nodejs18' | 'nodejs20' | 'python3.9' | 'java11';
  memory: number; // MB
  timeout: number; // seconds
  environment: Record<string, string>;
  triggers: FunctionTrigger[];
  layers?: string[];
}

export interface FunctionTrigger {
  type: 'http' | 'schedule' | 'event' | 'queue' | 'storage';
  config: Record<string, unknown>;
}

export interface FunctionContext {
  functionName: string;
  memoryLimitInMB: string;
  invokedFunctionArn: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis: () => number;
}

export type Handler<T = unknown, R = unknown> = (
  event: T,
  context: FunctionContext
) => Promise<R> | R;

// ============================================================================
// 2. 函数编排器
// ============================================================================

export class FunctionOrchestrator {
  private functions: Map<string, ServerlessFunction> = new Map();
  private handlers: Map<string, Handler> = new Map();
  private coldStartStats: Map<string, { count: number; avgDuration: number }> = new Map();

  register(fn: ServerlessFunction, handler: Handler): void {
    this.functions.set(fn.name, fn);
    this.handlers.set(fn.name, handler);
    console.log(`Function registered: ${fn.name}`);
  }

  async invoke<T, R>(name: string, event: T): Promise<R> {
    const fn = this.functions.get(name);
    const handler = this.handlers.get(name);
    
    if (!fn || !handler) {
      throw new Error(`Function ${name} not found`);
    }

    // 模拟冷启动
    const startTime = Date.now();
    const isColdStart = !this.coldStartStats.has(name);
    
    if (isColdStart) {
      console.log(`[COLD START] ${name}`);
      await this.simulateColdStart(fn);
    }

    const context = this.createContext(fn);
    
    try {
      const result = await handler(event, context);
      
      // 记录统计
      const duration = Date.now() - startTime;
      this.recordStats(name, duration, isColdStart);
      
      return result as R;
    } catch (error) {
      console.error(`Function ${name} failed:`, error);
      throw error;
    }
  }

  private async simulateColdStart(fn: ServerlessFunction): Promise<void> {
    // 模拟初始化延迟
    const coldStartDelay = Math.max(100, fn.memory / 10);
    await new Promise(resolve => setTimeout(resolve, coldStartDelay));
  }

  private createContext(fn: ServerlessFunction): FunctionContext {
    const startTime = Date.now();
    const timeoutMs = fn.timeout * 1000;
    
    return {
      functionName: fn.name,
      memoryLimitInMB: fn.memory.toString(),
      invokedFunctionArn: `arn:aws:lambda:region:account:function:${fn.name}`,
      awsRequestId: generateId(),
      logGroupName: `/aws/lambda/${fn.name}`,
      logStreamName: `2024/01/01/${generateId()}`,
      getRemainingTimeInMillis: () => {
        return Math.max(0, timeoutMs - (Date.now() - startTime));
      }
    };
  }

  private recordStats(name: string, duration: number, wasColdStart: boolean): void {
    const stats = this.coldStartStats.get(name) || { count: 0, avgDuration: 0 };
    stats.avgDuration = (stats.avgDuration * stats.count + duration) / (stats.count + 1);
    stats.count++;
    this.coldStartStats.set(name, stats);
    
    if (wasColdStart) {
      console.log(`   Cold start duration: ${duration}ms`);
    }
  }

  getStats(): Map<string, { count: number; avgDuration: number }> {
    return new Map(this.coldStartStats);
  }
}

// ============================================================================
// 3. 事件触发器
// ============================================================================

export class EventTriggerManager {
  private triggers: Map<string, (event: unknown) => Promise<void>> = new Map();

  // HTTP 触发器
  addHttpTrigger(path: string, method: string, handler: (req: unknown) => Promise<unknown>): void {
    this.triggers.set(`http:${method}:${path}`, async (event: any) => {
      const response = await handler(event);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      };
    });
  }

  // 定时触发器
  addScheduleTrigger(name: string, schedule: string, handler: () => Promise<void>): void {
    console.log(`Schedule trigger registered: ${name} (${schedule})`);
    this.triggers.set(`schedule:${name}`, handler);
  }

  // 队列触发器
  addQueueTrigger(queueName: string, handler: (message: unknown) => Promise<void>): void {
    this.triggers.set(`queue:${queueName}`, handler);
  }

  // 存储触发器
  addStorageTrigger(bucket: string, events: string[], handler: (event: unknown) => Promise<void>): void {
    this.triggers.set(`storage:${bucket}`, handler);
  }

  async trigger(key: string, event: unknown): Promise<unknown> {
    const handler = this.triggers.get(key);
    if (!handler) {
      throw new Error(`Trigger ${key} not found`);
    }
    return handler(event);
  }
}

// ============================================================================
// 4. 步骤函数 (Step Functions)
// ============================================================================

export interface Step {
  name: string;
  type: 'task' | 'choice' | 'wait' | 'parallel' | 'map';
  handler?: (input: unknown) => Promise<unknown>;
  choices?: Array<{ condition: (input: unknown) => boolean; next: string }>;
  next?: string;
  end?: boolean;
}

export class StepFunction {
  private steps: Map<string, Step> = new Map();
  private startAt: string = '';

  addStep(step: Step): this {
    this.steps.set(step.name, step);
    if (!this.startAt) this.startAt = step.name;
    return this;
  }

  setStartAt(name: string): this {
    this.startAt = name;
    return this;
  }

  async execute(input: unknown): Promise<unknown> {
    let currentStep = this.steps.get(this.startAt);
    let currentInput = input;

    while (currentStep) {
      console.log(`Executing step: ${currentStep.name}`);

      let output: unknown;

      switch (currentStep.type) {
        case 'task':
          if (!currentStep.handler) {
            throw new Error(`Step ${currentStep.name} has no handler`);
          }
          output = await currentStep.handler(currentInput);
          break;

        case 'choice':
          const choice = currentStep.choices?.find(c => c.condition(currentInput));
          if (choice) {
            currentStep = this.steps.get(choice.next);
            continue;
          }
          output = currentInput;
          break;

        case 'wait':
          await new Promise(resolve => setTimeout(resolve, 1000));
          output = currentInput;
          break;

        default:
          output = currentInput;
      }

      if (currentStep.end) {
        return output;
      }

      currentInput = output;
      currentStep = currentStep.next ? this.steps.get(currentStep.next) : undefined;
    }

    return currentInput;
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function demo(): Promise<void> {
  console.log('=== 无服务器架构 ===\n');

  console.log('1. 注册无服务器函数');
  const orchestrator = new FunctionOrchestrator();
  
  const helloFunction: ServerlessFunction = {
    name: 'hello-world',
    handler: 'index.handler',
    runtime: 'nodejs20',
    memory: 128,
    timeout: 10,
    environment: { STAGE: 'dev' },
    triggers: [{ type: 'http', config: { path: '/hello', method: 'GET' } }]
  };

  orchestrator.register(helloFunction, async (event, context) => {
    console.log(`   Executing ${context.functionName}`);
    console.log(`   Memory: ${context.memoryLimitInMB}MB`);
    console.log(`   Remaining time: ${context.getRemainingTimeInMillis()}ms`);
    return { message: 'Hello, World!', event };
  });

  // 首次调用（冷启动）
  const result1 = await orchestrator.invoke('hello-world', { name: 'User' });
  console.log('   Result:', result1);

  // 再次调用（热启动）
  const result2 = await orchestrator.invoke('hello-world', { name: 'User' });
  console.log('   Result:', result2);

  console.log('\n2. 事件触发器');
  const triggerManager = new EventTriggerManager();
  
  triggerManager.addHttpTrigger('/api/users', 'GET', async () => {
    return { users: [{ id: 1, name: 'Alice' }] };
  });

  triggerManager.addScheduleTrigger('daily-cleanup', 'cron(0 0 * * ? *)', async () => {
    console.log('   Running daily cleanup...');
  });

  triggerManager.addQueueTrigger('task-queue', async (message) => {
    console.log('   Processing message:', message);
  });

  const httpResponse = await triggerManager.trigger('http:GET:/api/users', {});
  console.log('   HTTP Response:', httpResponse);

  console.log('\n3. 步骤函数');
  const workflow = new StepFunction()
    .addStep({
      name: 'validateInput',
      type: 'task',
      handler: async (input: any) => {
        console.log('   Validating input:', input);
        return { ...input, valid: true };
      },
      next: 'checkInventory'
    })
    .addStep({
      name: 'checkInventory',
      type: 'task',
      handler: async (input: any) => {
        console.log('   Checking inventory...');
        return { ...input, inStock: true };
      },
      next: 'processPayment'
    })
    .addStep({
      name: 'processPayment',
      type: 'task',
      handler: async (input: any) => {
        console.log('   Processing payment...');
        return { ...input, paymentId: 'pay-123' };
      },
      next: 'sendConfirmation'
    })
    .addStep({
      name: 'sendConfirmation',
      type: 'task',
      handler: async (input: any) => {
        console.log('   Sending confirmation email...');
        return { ...input, emailSent: true };
      },
      end: true
    });

  const workflowResult = await workflow.execute({ orderId: 'order-456' });
  console.log('   Workflow completed:', workflowResult);

  console.log('\n4. 性能统计');
  const stats = orchestrator.getStats();
  stats.forEach((stat, name) => {
    console.log(`   ${name}: ${stat.count} invocations, avg ${Math.round(stat.avgDuration)}ms`);
  });

  console.log('\n无服务器要点:');
  console.log('- 冷启动: 首次调用有初始化延迟');
  console.log('- 事件驱动: 函数由事件触发执行');
  console.log('- 自动扩缩容: 根据负载自动调整');
  console.log('- 按调用付费: 只为实际执行时间付费');
  console.log('- 步骤函数: 编排复杂工作流');
}

// ============================================================================
// 导出
// ============================================================================

;
