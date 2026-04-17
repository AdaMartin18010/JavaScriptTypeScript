/**
 * @file 响应聚合器
 * @category API Gateway → Response Aggregation
 * @difficulty hard
 * @tags api-gateway, aggregation, fan-out, parallel-requests
 *
 * @description
 * API 网关响应聚合器：并行请求多个后端服务并聚合结果
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ServiceRequest {
  serviceId: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  priority?: number;
}

export interface ServiceResponse<T = unknown> {
  serviceId: string;
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  responseTime: number;
}

export interface AggregationStrategy {
  name: string;
  aggregate(responses: ServiceResponse[]): unknown;
}

export interface AggregatorOptions {
  timeout?: number;
  failFast?: boolean;
  requiredServices?: string[];
}

// ============================================================================
// 响应聚合器
// ============================================================================

export class ResponseAggregator {
  constructor(private options: AggregatorOptions = {}) {
    this.options = {
      timeout: 5000,
      failFast: false,
      ...options
    };
  }

  /**
   * 并行执行多个服务请求
   */
  async aggregate<T>(
    requests: ServiceRequest[],
    executor: (req: ServiceRequest) => Promise<T>
  ): Promise<ServiceResponse<T>[]> {
    const promises = requests.map(async req => {
      const start = Date.now();
      const timeout = req.timeout || this.options.timeout || 5000;

      try {
        const result = await Promise.race([
          executor(req),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
          )
        ]);

        return {
          serviceId: req.serviceId,
          success: true,
          data: result,
          responseTime: Date.now() - start
        };
      } catch (error) {
        return {
          serviceId: req.serviceId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - start
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * 带 fail-fast 的聚合
   */
  async aggregateWithFailFast<T>(
    requests: ServiceRequest[],
    executor: (req: ServiceRequest) => Promise<T>
  ): Promise<ServiceResponse<T>[]> {
    if (!this.options.failFast) {
      return this.aggregate(requests, executor);
    }

    const requiredSet = new Set(this.options.requiredServices || []);
    const results: ServiceResponse<T>[] = [];
    const promises = requests.map(req =>
      this.executeSingle(req, executor).then(result => {
        results.push(result);

        if (!result.success && requiredSet.has(req.serviceId)) {
          throw new AggregationError(`Required service ${req.serviceId} failed: ${result.error}`);
        }

        return result;
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      // fail-fast 被触发，返回已收集的结果
      if (error instanceof AggregationError) {
        return results;
      }
      throw error;
    }

    return results;
  }

  /**
   * 使用策略聚合结果
   */
  applyStrategy(responses: ServiceResponse[], strategy: AggregationStrategy): unknown {
    return strategy.aggregate(responses);
  }

  private async executeSingle<T>(
    req: ServiceRequest,
    executor: (req: ServiceRequest) => Promise<T>
  ): Promise<ServiceResponse<T>> {
    const start = Date.now();
    const timeout = req.timeout || this.options.timeout || 5000;

    try {
      const result = await Promise.race([
        executor(req),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
        )
      ]);

      return {
        serviceId: req.serviceId,
        success: true,
        data: result,
        responseTime: Date.now() - start
      };
    } catch (error) {
      return {
        serviceId: req.serviceId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - start
      };
    }
  }
}

export class AggregationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AggregationError';
  }
}

// ============================================================================
// 聚合策略
// ============================================================================

export const MergeStrategy: AggregationStrategy = {
  name: 'merge',
  aggregate(responses) {
    const merged: Record<string, unknown> = {};
    for (const res of responses) {
      if (res.success && res.data && typeof res.data === 'object') {
        Object.assign(merged, res.data);
      }
    }
    return merged;
  }
};

export const ArrayStrategy: AggregationStrategy = {
  name: 'array',
  aggregate(responses) {
    return responses.map(r => ({
      serviceId: r.serviceId,
      success: r.success,
      data: r.data,
      error: r.error
    }));
  }
};

export const FirstSuccessStrategy: AggregationStrategy = {
  name: 'first-success',
  aggregate(responses) {
    const first = responses.find(r => r.success);
    return first?.data ?? null;
  }
};

export const VotingStrategy: AggregationStrategy = {
  name: 'voting',
  aggregate(responses) {
    const successful = responses.filter(r => r.success);
    return {
      total: responses.length,
      successful: successful.length,
      failed: responses.length - successful.length,
      consensus: successful.length > responses.length / 2
    };
  }
};

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 响应聚合器 ===\n');

  const aggregator = new ResponseAggregator({
    timeout: 3000,
    failFast: false
  });

  // 模拟请求
  const requests: ServiceRequest[] = [
    { serviceId: 'user-svc', url: '/users/1' },
    { serviceId: 'order-svc', url: '/orders?user=1' },
    { serviceId: 'inventory-svc', url: '/inventory' }
  ];

  console.log('Requests to aggregate:');
  requests.forEach(r => console.log(`  - ${r.serviceId}: ${r.url}`));

  console.log('\nStrategies:');
  console.log('  - merge:', MergeStrategy.name);
  console.log('  - array:', ArrayStrategy.name);
  console.log('  - first-success:', FirstSuccessStrategy.name);
  console.log('  - voting:', VotingStrategy.name);
}
