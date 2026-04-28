/**
 * @file 漏斗分析
 * @category Analytics → Funnel Analysis
 * @difficulty medium
 * @tags funnel-analysis, conversion, user-journey
 *
 * @description
 * 漏斗分析实现：多步骤转化、流失分析、时间窗口、细分对比
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface FunnelStep {
  name: string;
  event: string;
  filter?: (event: AnalyticsEvent) => boolean;
}

export interface FunnelResult {
  stepName: string;
  uniqueUsers: number;
  totalEvents: number;
  conversionRate: number; // 相对于上一步
  overallConversionRate: number; // 相对于第一步
  dropOffRate: number;
  avgTimeToConvert?: number; // 毫秒
  dropOffUsers: string[];
}

export interface CohortFunnelResult {
  cohort: string;
  steps: FunnelResult[];
}

export interface AnalyticsEvent {
  name: string;
  userId?: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

// ============================================================================
// 漏斗分析器
// ============================================================================

export class FunnelAnalyzer {
  /**
   * 分析漏斗
   */
  analyze(
    events: AnalyticsEvent[],
    steps: FunnelStep[],
    options: {
      windowMs?: number; // 转化时间窗口
      uniqueBy?: 'user' | 'session';
    } = {}
  ): FunnelResult[] {
    const { windowMs = 24 * 60 * 60 * 1000, uniqueBy = 'user' } = options;
    const results: FunnelResult[] = [];

    // 按用户分组事件
    const userEvents = this.groupByUser(events);
    
    // 追踪每一步的用户
    let previousUsers = new Set<string>();
    let previousEvents = new Map<string, AnalyticsEvent[]>();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const currentUsers = new Set<string>();
      const currentEvents = new Map<string, AnalyticsEvent[]>();
      const conversionTimes: number[] = [];
      const dropOffUsers: string[] = [];

      for (const [userId, userEventList] of userEvents) {
        // 找到匹配当前步骤的事件
        const matchingEvents = userEventList.filter(e => {
          if (e.name !== step.event) return false;
          if (step.filter && !step.filter(e)) return false;
          return true;
        });

        if (matchingEvents.length === 0) {
          // 如果用户上一步还在，这一步不在，记录为流失
          if (i > 0 && previousUsers.has(userId)) {
            dropOffUsers.push(userId);
          }
          continue;
        }

        // 检查时间窗口（第一步除外）
        if (i > 0 && previousUsers.has(userId)) {
          const firstStepEvent = previousEvents.get(userId)?.[0];
          const currentStepEvent = matchingEvents[0];
          
          if (firstStepEvent && currentStepEvent) {
            const timeDiff = currentStepEvent.timestamp - firstStepEvent.timestamp;
            
            if (timeDiff <= windowMs) {
              currentUsers.add(userId);
              currentEvents.set(userId, matchingEvents);
              conversionTimes.push(timeDiff);
            } else {
              dropOffUsers.push(userId);
            }
          }
        } else if (i === 0) {
          // 第一步，直接加入
          currentUsers.add(userId);
          currentEvents.set(userId, matchingEvents);
        }
      }

      // 计算转化率
      const conversionRate = i === 0 
        ? 100 
        : previousUsers.size > 0 
          ? (currentUsers.size / previousUsers.size) * 100 
          : 0;

      const overallConversionRate = i === 0
        ? 100
        : results[0].uniqueUsers > 0
          ? (currentUsers.size / results[0].uniqueUsers) * 100
          : 0;

      const totalEvents = Array.from(currentEvents.values())
        .reduce((sum, list) => sum + list.length, 0);

      const avgTimeToConvert = conversionTimes.length > 0
        ? conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length
        : undefined;

      results.push({
        stepName: step.name,
        uniqueUsers: currentUsers.size,
        totalEvents,
        conversionRate,
        overallConversionRate,
        dropOffRate: 100 - conversionRate,
        avgTimeToConvert,
        dropOffUsers
      });

      previousUsers = currentUsers;
      previousEvents = currentEvents;
    }

    return results;
  }

  /**
   * 按维度细分漏斗
   */
  analyzeByDimension(
    events: AnalyticsEvent[],
    steps: FunnelStep[],
    dimension: string,
    options?: Parameters<typeof this.analyze>[2]
  ): Map<string, FunnelResult[]> {
    const results = new Map<string, FunnelResult[]>();

    // 按维度值分组
    const groupedEvents = new Map<string, AnalyticsEvent[]>();
    
    for (const event of events) {
      const value = String(event.properties[dimension] || 'unknown');
      if (!groupedEvents.has(value)) {
        groupedEvents.set(value, []);
      }
      groupedEvents.get(value)!.push(event);
    }

    // 对每个维度值分析漏斗
    for (const [value, groupEvents] of groupedEvents) {
      results.set(value, this.analyze(groupEvents, steps, options));
    }

    return results;
  }

  /**
   * 同期群分析
   */
  analyzeByCohort(
    events: AnalyticsEvent[],
    steps: FunnelStep[],
    cohortBy: 'day' | 'week' | 'month',
    options?: Parameters<typeof this.analyze>[2]
  ): CohortFunnelResult[] {
    const results: CohortFunnelResult[] = [];

    // 按同期群分组
    const cohortEvents = new Map<string, AnalyticsEvent[]>();

    for (const event of events) {
      const date = new Date(event.timestamp);
      let cohortKey: string;

      switch (cohortBy) {
        case 'day':
          cohortKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          cohortKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          cohortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!cohortEvents.has(cohortKey)) {
        cohortEvents.set(cohortKey, []);
      }
      cohortEvents.get(cohortKey)!.push(event);
    }

    // 对每个同期群分析
    for (const [cohort, cohortEventList] of cohortEvents) {
      results.push({
        cohort,
        steps: this.analyze(cohortEventList, steps, options)
      });
    }

    return results.sort((a, b) => a.cohort.localeCompare(b.cohort));
  }

  private groupByUser(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
    const grouped = new Map<string, AnalyticsEvent[]>();

    for (const event of events) {
      const userId = event.userId || 'anonymous';
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId)!.push(event);
    }

    // 对每个用户的事件按时间排序
    for (const [, userEvents] of grouped) {
      userEvents.sort((a, b) => a.timestamp - b.timestamp);
    }

    return grouped;
  }
}

// ============================================================================
// 转化路径分析
// ============================================================================

export class ConversionPathAnalyzer {
  /**
   * 找出最常见的转化路径
   */
  findCommonPaths(
    events: AnalyticsEvent[],
    startEvent: string,
    endEvent: string,
    options: {
      maxSteps?: number;
      minUsers?: number;
    } = {}
  ): { path: string[]; userCount: number; conversionRate: number }[] {
    const { maxSteps = 10, minUsers = 2 } = options;
    
    const userPaths = new Map<string, string[]>();
    const pathCounts = new Map<string, number>();

    // 按用户分组并排序
    const userEvents = this.groupByUser(events);

    for (const [userId, userEventList] of userEvents) {
      let capturing = false;
      const path: string[] = [];

      for (const event of userEventList) {
        if (event.name === startEvent) {
          capturing = true;
          path.length = 0;
        }

        if (capturing) {
          path.push(event.name);

          if (event.name === endEvent || path.length >= maxSteps) {
            userPaths.set(userId, [...path]);
            const pathKey = path.join(' > ');
            pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
            break;
          }
        }
      }
    }

    // 计算总起始用户数
    const totalStartUsers = Array.from(userEvents.values())
      .filter(list => list.some(e => e.name === startEvent)).length;

    // 排序并过滤
    return Array.from(pathCounts.entries())
      .filter(([, count]) => count >= minUsers)
      .sort((a, b) => b[1] - a[1])
      .map(([pathKey, count]) => ({
        path: pathKey.split(' > '),
        userCount: count,
        conversionRate: totalStartUsers > 0 ? (count / totalStartUsers) * 100 : 0
      }));
  }

  private groupByUser(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
    const grouped = new Map<string, AnalyticsEvent[]>();

    for (const event of events) {
      const userId = event.userId || 'anonymous';
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId)!.push(event);
    }

    for (const [, list] of grouped) {
      list.sort((a, b) => a.timestamp - b.timestamp);
    }

    return grouped;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 漏斗分析演示 ===\n');

  // 模拟电商转化漏斗数据
  const events: AnalyticsEvent[] = [
    // 用户 1: 完成购买
    { name: 'Product Viewed', userId: 'user1', timestamp: 1000, properties: { product: 'laptop' } },
    { name: 'Added to Cart', userId: 'user1', timestamp: 2000, properties: {} },
    { name: 'Checkout Started', userId: 'user1', timestamp: 3000, properties: {} },
    { name: 'Order Completed', userId: 'user1', timestamp: 5000, properties: { amount: 1000 } },

    // 用户 2: 放弃购物车
    { name: 'Product Viewed', userId: 'user2', timestamp: 1000, properties: { product: 'mouse' } },
    { name: 'Added to Cart', userId: 'user2', timestamp: 2000, properties: {} },
    // 没有结账

    // 用户 3: 直接购买
    { name: 'Product Viewed', userId: 'user3', timestamp: 1000, properties: { product: 'keyboard' } },
    { name: 'Added to Cart', userId: 'user3', timestamp: 1500, properties: {} },
    { name: 'Checkout Started', userId: 'user3', timestamp: 2000, properties: {} },
    { name: 'Order Completed', userId: 'user3', timestamp: 4000, properties: { amount: 150 } },

    // 用户 4: 只浏览
    { name: 'Product Viewed', userId: 'user4', timestamp: 1000, properties: { product: 'monitor' } },

    // 用户 5: 结账但未完成
    { name: 'Product Viewed', userId: 'user5', timestamp: 1000, properties: { product: 'headphones' } },
    { name: 'Added to Cart', userId: 'user5', timestamp: 2000, properties: {} },
    { name: 'Checkout Started', userId: 'user5', timestamp: 3000, properties: {} },
    // 没有完成订单

    // 更多用户数据...
    { name: 'Product Viewed', userId: 'user6', timestamp: 1000, properties: { product: 'laptop' } },
    { name: 'Added to Cart', userId: 'user6', timestamp: 2000, properties: {} },
    { name: 'Checkout Started', userId: 'user6', timestamp: 3000, properties: {} },
    { name: 'Order Completed', userId: 'user6', timestamp: 6000, properties: { amount: 1200 } },
  ];

  const analyzer = new FunnelAnalyzer();

  // 1. 基础漏斗分析
  console.log('--- 电商转化漏斗 ---');
  const steps: FunnelStep[] = [
    { name: '浏览商品', event: 'Product Viewed' },
    { name: '加入购物车', event: 'Added to Cart' },
    { name: '开始结账', event: 'Checkout Started' },
    { name: '完成订单', event: 'Order Completed' }
  ];

  const results = analyzer.analyze(events, steps, { windowMs: 10000 });

  console.log('\n  步骤              用户数   转化率   总体转化率   平均转化时间');
  console.log('  ────────────────────────────────────────────────────────────');
  for (const step of results) {
    const timeStr = step.avgTimeToConvert 
      ? `${(step.avgTimeToConvert / 1000).toFixed(1)}s`
      : '-';
    console.log(
      `  ${step.stepName.padEnd(15)} ${String(step.uniqueUsers).padStart(5)}   ` +
      `${step.conversionRate.toFixed(1)}%    ${step.overallConversionRate.toFixed(1)}%        ${timeStr}`
    );
  }

  // 2. 流失用户分析
  console.log('\n--- 流失分析 ---');
  for (let i = 1; i < results.length; i++) {
    const step = results[i];
    if (step.dropOffUsers.length > 0) {
      console.log(`  ${steps[i-1].name} -> ${step.stepName}: ${step.dropOffUsers.length} 用户流失`);
      console.log(`    流失用户: ${step.dropOffUsers.join(', ')}`);
    }
  }

  // 3. 转化路径分析
  console.log('\n--- 常见转化路径 ---');
  const pathAnalyzer = new ConversionPathAnalyzer();
  const commonPaths = pathAnalyzer.findCommonPaths(
    events,
    'Product Viewed',
    'Order Completed',
    { maxSteps: 6, minUsers: 1 }
  );

  for (const path of commonPaths) {
    console.log(`  ${path.path.join(' → ')}`);
    console.log(`    用户数: ${path.userCount}, 转化率: ${path.conversionRate.toFixed(1)}%`);
  }
}
