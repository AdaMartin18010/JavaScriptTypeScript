/**
 * @file AI驱动的性能优化器
 * @category Intelligent Performance → AI Optimization
 * @difficulty hard
 * @tags ai-performance, predictive-loading, smart-caching, performance-ml
 * 
 * @model_overview
 * AI驱动的性能优化系统：预测用户行为，智能预加载，动态调整策略
 * 
 * 核心能力:
 * 1. 性能预测: 基于历史数据预测性能瓶颈
 * 2. 智能预加载: 预测用户下一步访问，提前加载资源
 * 3. 动态优化: 根据实时指标调整优化策略
 * 4. 异常检测: 自动识别性能回归
 */

// ============================================================================
// 性能预测引擎
// ============================================================================

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  loadTime: number;
}

export interface PerformancePrediction {
  metric: keyof PerformanceMetrics;
  predictedValue: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export class PerformancePredictionEngine {
  private history: { metrics: PerformanceMetrics; timestamp: number }[] = [];
  private maxHistorySize = 100;

  // 记录性能指标
  recordMetrics(metrics: PerformanceMetrics): void {
    this.history.push({
      metrics,
      timestamp: Date.now()
    });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // 预测未来性能
  predictPerformance(hoursAhead = 1): PerformancePrediction[] {
    if (this.history.length < 10) {
      return [];
    }

    const predictions: PerformancePrediction[] = [];
    const recent = this.history.slice(-20);

    // 简单线性回归预测
    const metrics: (keyof PerformanceMetrics)[] = ['lcp', 'fid', 'cls'];
    
    for (const metric of metrics) {
      const values = recent.map(h => h.metrics[metric]);
      const trend = this.calculateTrend(values);
      
      const currentValue = values[values.length - 1];
      const predictedValue = currentValue + trend * hoursAhead;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      const thresholds = this.getThresholds(metric);
      
      if (predictedValue > thresholds.poor) {
        riskLevel = 'high';
      } else if (predictedValue > thresholds.needsImprovement) {
        riskLevel = 'medium';
      }

      predictions.push({
        metric,
        predictedValue: Math.max(0, predictedValue),
        confidence: this.calculateConfidence(values),
        riskLevel,
        suggestions: this.generateSuggestions(metric, riskLevel)
      });
    }

    return predictions;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateConfidence(values: number[]): number {
    // 基于方差计算置信度
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean; // 变异系数
    
    // 变异系数越小，置信度越高
    return Math.max(0, Math.min(1, 1 - cv));
  }

  private getThresholds(metric: keyof PerformanceMetrics): { needsImprovement: number; poor: number } {
    const thresholds: Record<string, { needsImprovement: number; poor: number }> = {
      lcp: { needsImprovement: 2500, poor: 4000 },
      fid: { needsImprovement: 100, poor: 300 },
      cls: { needsImprovement: 0.1, poor: 0.25 },
      fcp: { needsImprovement: 1800, poor: 3000 },
      ttfb: { needsImprovement: 600, poor: 1000 },
      loadTime: { needsImprovement: 3000, poor: 5000 }
    };
    
    return thresholds[metric] || { needsImprovement: Infinity, poor: Infinity };
  }

  private generateSuggestions(metric: string, riskLevel: string): string[] {
    const suggestions: Record<string, string[]> = {
      lcp: [
        '优化LCP元素加载：预加载关键资源',
        '使用CDN加速首屏内容',
        '压缩和优化图片资源'
      ],
      fid: [
        '减少主线程长任务',
        '拆分JavaScript代码',
        '使用Web Workers处理复杂计算'
      ],
      cls: [
        '为图片和视频设置尺寸属性',
        '避免在已有内容上方插入动态内容',
        '使用CSS aspect-ratio保持比例'
      ]
    };

    return suggestions[metric] || ['监控性能指标', '分析性能瓶颈'];
  }
}

// ============================================================================
// 智能预加载器
// ============================================================================

export interface NavigationPattern {
  from: string;
  to: string;
  probability: number;
  avgTimeSpent: number;
}

export class IntelligentPreloader {
  private navigationGraph = new Map<string, NavigationPattern[]>();
  private currentPage = '';
  private prefetchQueue = new Set<string>();

  // 记录页面导航
  recordNavigation(from: string, to: string, timeSpent: number): void {
    const patterns = this.navigationGraph.get(from) || [];
    const existing = patterns.find(p => p.to === to);

    if (existing) {
      // 更新概率 (指数移动平均)
      existing.probability = existing.probability * 0.7 + 0.3;
      existing.avgTimeSpent = existing.avgTimeSpent * 0.7 + timeSpent * 0.3;
    } else {
      patterns.push({
        from,
        to,
        probability: 0.5,
        avgTimeSpent: timeSpent
      });
    }

    this.navigationGraph.set(from, patterns);
  }

  // 预测下一步可能访问的页面
  predictNextPages(currentPage: string, topN = 3): { page: string; probability: number }[] {
    const patterns = this.navigationGraph.get(currentPage) || [];
    
    return patterns
      .sort((a, b) => b.probability - a.probability)
      .slice(0, topN)
      .map(p => ({ page: p.to, probability: p.probability }));
  }

  // 智能预加载
  smartPrefetch(currentPage: string): void {
    this.currentPage = currentPage;
    const predictions = this.predictNextPages(currentPage);

    // 根据概率和时间预算决定预加载
    for (const { page, probability } of predictions) {
      if (probability > 0.6 && !this.prefetchQueue.has(page)) {
        this.prefetchQueue.add(page);
        
        // 延迟预加载，避免影响当前页面
        setTimeout(() => {
          this.doPrefetch(page);
        }, 2000);
      }
    }
  }

  private doPrefetch(page: string): void {
    console.log(`[Prefetch] Loading: ${page}`);
    // 实际实现中这里会加载页面资源
  }

  // 基于用户行为的实时预加载
  onUserIntent(intent: 'hover' | 'focus' | 'mousedown', targetPage: string): void {
    const intentWeights = {
      hover: 0.3,
      focus: 0.6,
      mousedown: 0.9
    };

    const probability = intentWeights[intent];
    
    if (probability > 0.7) {
      // 高意图，立即预加载
      this.doPrefetch(targetPage);
    }
  }
}

// ============================================================================
// 动态优化策略
// ============================================================================

export interface OptimizationStrategy {
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: () => void;
  priority: number;
}

export class DynamicOptimizationEngine {
  private strategies: OptimizationStrategy[] = [];
  private isActive = false;

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // 策略1: LCP过差时启用激进懒加载
    this.strategies.push({
      name: 'aggressiveLazyLoading',
      condition: (m) => m.lcp > 4000,
      action: () => {
        console.log('[Optimization] Enabling aggressive lazy loading');
        // 启用更激进的懒加载策略
      },
      priority: 1
    });

    // 策略2: CLS过高时禁用动画
    this.strategies.push({
      name: 'disableAnimations',
      condition: (m) => m.cls > 0.25,
      action: () => {
        console.log('[Optimization] Disabling non-essential animations');
        // 禁用动画
      },
      priority: 2
    });

    // 策略3: FID过长时减少JavaScript执行
    this.strategies.push({
      name: 'reduceJavaScript',
      condition: (m) => m.fid > 300,
      action: () => {
        console.log('[Optimization] Reducing JavaScript execution');
        // 延迟非关键JS
      },
      priority: 1
    });
  }

  // 启动持续监控和优化
  startMonitoring(getMetrics: () => PerformanceMetrics): void {
    this.isActive = true;
    
    const check = () => {
      if (!this.isActive) return;

      const metrics = getMetrics();
      this.evaluateAndOptimize(metrics);

      setTimeout(check, 10); // 每10毫秒检查一次
    };

    check();
  }

  private evaluateAndOptimize(metrics: PerformanceMetrics): void {
    const applicable = this.strategies
      .filter(s => s.condition(metrics))
      .sort((a, b) => a.priority - b.priority);

    for (const strategy of applicable) {
      strategy.action();
    }
  }

  stop(): void {
    this.isActive = false;
  }
}

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== AI驱动的性能优化 ===\n');

  console.log('1. 性能预测');
  const predictor = new PerformancePredictionEngine();
  
  // 模拟历史数据
  for (let i = 0; i < 20; i++) {
    predictor.recordMetrics({
      fcp: 1000 + i * 50,
      lcp: 2500 + i * 100,
      fid: 50 + i * 10,
      cls: 0.05 + i * 0.01,
      ttfb: 200 + i * 20,
      loadTime: 3000 + i * 150
    });
  }

  const predictions = predictor.predictPerformance(1);
  for (const pred of predictions) {
    console.log(`   ${pred.metric}: 预测值=${pred.predictedValue.toFixed(2)}, 风险=${pred.riskLevel}, 置信度=${(pred.confidence * 100).toFixed(0)}%`);
    if (pred.suggestions.length > 0) {
      console.log(`     建议: ${pred.suggestions[0]}`);
    }
  }

  console.log('\n2. 智能预加载');
  const preloader = new IntelligentPreloader();
  
  // 记录用户导航模式
  preloader.recordNavigation('/home', '/products', 5000);
  preloader.recordNavigation('/home', '/products', 4000);
  preloader.recordNavigation('/home', '/about', 2000);
  preloader.recordNavigation('/products', '/product-detail', 8000);
  preloader.recordNavigation('/products', '/cart', 3000);

  const predictions2 = preloader.predictNextPages('/home');
  console.log('   从首页预测下一步:');
  for (const { page, probability } of predictions2) {
    console.log(`     ${page}: ${(probability * 100).toFixed(0)}%`);
  }

  preloader.smartPrefetch('/home');

  console.log('\n3. 动态优化');
  const optimizer = new DynamicOptimizationEngine();
  
  // 模拟监控
  optimizer.startMonitoring(() => ({
    fcp: 1200,
    lcp: 4500, // 触发优化
    fid: 350,  // 触发优化
    cls: 0.3,  // 触发优化
    ttfb: 300,
    loadTime: 4000
  }));

  setTimeout(() => { optimizer.stop(); }, 100);

  console.log('\nAI性能优化要点:');
  console.log('- 基于历史数据预测性能趋势');
  console.log('- 分析用户导航模式，智能预加载');
  console.log('- 实时监控，自动调整优化策略');
  console.log('- 预测性能风险，提前给出优化建议');
}


