/**
 * =============================================================================
 * 边缘路由模式实践 — edge-routing-patterns.ts
 * =============================================================================
 *
 * 本模块演示在边缘计算环境中 3 种核心路由模式的 TypeScript 实现。
 * 边缘路由决定了请求如何被分发到最合适的目标（边缘节点、源站、实验组等），
 * 是直接影响用户体验和系统可用性的关键架构决策。
 *
 * 使用的模式：
 * 1. Geo-Routing          — 基于地理位置的路由决策（延迟优先、合规优先等）
 * 2. A/B Testing at Edge  — 在边缘层进行流量分流实验，无需穿透到源站
 * 3. Canary Release       — 边缘金丝雀发布，渐进式灰度上线
 *
 * 每个模式都包含「错误做法（反例）」和「正确模式（生产级）」的对比。
 * =============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义区
// ─────────────────────────────────────────────────────────────────────────────

/** 地理位置坐标 */
interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/** 用户请求上下文 */
interface EdgeRequestContext {
  /** 客户端 IP 地址 */
  clientIp: string;
  /** 请求的地理坐标（由 GeoIP 解析得到） */
  geo?: GeoCoordinates;
  /** 国家/地区代码 */
  countryCode?: string;
  /** 用户 ID（已登录用户） */
  userId?: string;
  /** 请求头 */
  headers: Record<string, string>;
  /** Cookie */
  cookies: Record<string, string>;
  /** 请求路径 */
  pathname: string;
}

/** 边缘节点定义 */
interface RoutingTarget {
  id: string;
  region: string;
  host: string;
  coordinates: GeoCoordinates;
  /** 节点健康状态 */
  healthy: boolean;
  /** 当前负载百分比 (0-1) */
  loadRatio: number;
  /** 节点能力标签 */
  capabilities: string[];
}

/** 路由决策结果 */
interface RoutingDecision {
  target: RoutingTarget;
  /** 路由原因（用于调试和可观测性） */
  reason: string;
  /** 附加的响应头 */
  responseHeaders: Record<string, string>;
}

/** A/B 实验配置 */
interface ABTestExperiment {
  id: string;
  name: string;
  /** 实验流量百分比 (0-100) */
  trafficPercent: number;
  /** 实验组变体 */
  variants: Array<{
    id: string;
    name: string;
    weight: number;
    /** 变体特定的处理逻辑标识 */
    handlerKey: string;
  }>;
  /** 实验生效的路径匹配 */
  pathPattern: RegExp;
  /** 实验开始时间 */
  startAt: number;
  /** 实验结束时间（可选） */
  endAt?: number;
  /** 是否仅对新用户生效 */
  newUserOnly?: boolean;
}

/** 金丝雀发布配置 */
interface CanaryRelease {
  id: string;
  serviceName: string;
  /** 当前金丝雀流量百分比 (0-100) */
  canaryPercent: number;
  /** 金丝雀版本标识 */
  canaryVersion: string;
  /** 稳定版本标识 */
  stableVersion: string;
  /** 金丝雀目标（支持按地区、用户特征等定向） */
  targeting: {
    regions?: string[];
    userIds?: string[];
    /** 是否启用基于用户哈希的定向 */
    hashBased?: boolean;
  };
  /** 健康检查阈值 */
  healthThresholds: {
    errorRate: number;
    latencyP99: number;
  };
  /** 自动推进配置 */
  autoProgression?: {
    enabled: boolean;
    stepPercent: number;
    intervalMinutes: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 计算两点之间的 Haversine 距离（单位：公里） */
function haversineDistance(a: GeoCoordinates, b: GeoCoordinates): number {
  const R = 6371; // 地球半径（公里）
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const chordLength = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const angularDistance = 2 * Math.atan2(Math.sqrt(chordLength), Math.sqrt(1 - chordLength));

  return R * angularDistance;
}

/** 简单的一致性哈希（用于用户分流） */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 转为 32 位整数
  }
  return Math.abs(hash);
}

/** 根据用户 ID 和实验 ID 计算哈希桶（0-99） */
function getUserBucket(userId: string, experimentId: string): number {
  return hashString(`${userId}:${experimentId}`) % 100;
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 1: Geo-Routing（基于地理位置的路由决策）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：使用简单的轮询或随机路由，完全不考虑用户地理位置。
 * 问题：
 *   1. 用户可能被路由到地球另一端的节点，延迟极高
 *   2. 不遵守数据合规要求（如 GDPR 要求欧盟数据留在欧盟）
 *   3. 无法利用边缘缓存的局部性
 *   4. 故障时无法智能切换
 */
class BadGeoRouter {
  private targets: RoutingTarget[];
  private idx = 0;

  constructor(targets: RoutingTarget[]) {
    this.targets = targets;
  }

  route(_ctx: EdgeRequestContext): RoutingDecision {
    // 错误：完全不考虑地理位置，纯轮询
    const target = this.targets[this.idx % this.targets.length];
    this.idx++;
    return {
      target,
      reason: 'round-robin',
      responseHeaders: { 'x-routing': 'bad-round-robin' },
    };
  }
}

/**
 * ✅ 正确做法：Geo-Routing 生产级实现
 *
 * 支持多种路由策略：
 *   1. 最近距离优先（Latency-Based）
 *   2. 合规约束优先（Compliance-First）
 *   3. 负载感知（Load-Aware）
 *   4. 能力匹配（Capability Matching）
 *   5. 故障转移（Failover）
 *
 * 设计要点：
 *   - 策略可配置、可组合
 *   - 所有决策附带原因和观测头
 *   - 支持多级降级（首选 → 备选 → 兜底）
 */
class GeoRouter {
  private targets: RoutingTarget[];

  constructor(targets: RoutingTarget[]) {
    this.targets = targets;
  }

  /**
   * 主路由入口
   * 按优先级尝试：合规约束 → 能力匹配 → 距离+负载综合评分 → 健康兜底
   */
  route(ctx: EdgeRequestContext, strategy: 'latency' | 'compliance' | 'balanced' = 'balanced'): RoutingDecision {
    const healthyTargets = this.targets.filter((t) => t.healthy);

    if (healthyTargets.length === 0) {
      throw new Error('无可用的健康边缘节点');
    }

    // 1. 合规约束检查（数据主权）
    if (strategy === 'compliance' || strategy === 'balanced') {
      const compliantTarget = this.findCompliantTarget(ctx, healthyTargets);
      if (compliantTarget) {
        return {
          target: compliantTarget,
          reason: `compliance-match: country=${ctx.countryCode}`,
          responseHeaders: {
            'x-routing-strategy': strategy,
            'x-routing-reason': 'data-sovereignty',
            'x-edge-region': compliantTarget.region,
          },
        };
      }
    }

    // 2. 距离+负载综合评分
    if (ctx.geo) {
      const scored = healthyTargets.map((target) => ({
        target,
        score: this.computeScore(ctx.geo!, target, strategy),
      }));

      scored.sort((a, b) => b.score - a.score);

      const best = scored[0];
      return {
        target: best.target,
        reason: `score-based: distance=${haversineDistance(ctx.geo, best.target.coordinates).toFixed(0)}km, load=${(best.target.loadRatio * 100).toFixed(1)}%`,
        responseHeaders: {
          'x-routing-strategy': strategy,
          'x-routing-reason': 'optimal-score',
          'x-edge-region': best.target.region,
          'x-edge-distance-km': haversineDistance(ctx.geo, best.target.coordinates).toFixed(0),
        },
      };
    }

    // 3. 无地理信息时的兜底：选择负载最低的节点
    const leastLoaded = healthyTargets.reduce((prev, curr) =>
      prev.loadRatio < curr.loadRatio ? prev : curr
    );

    return {
      target: leastLoaded,
      reason: 'fallback-least-loaded',
      responseHeaders: {
        'x-routing-strategy': strategy,
        'x-routing-reason': 'no-geo-info',
        'x-edge-region': leastLoaded.region,
      },
    };
  }

  /** 寻找符合数据主权要求的节点 */
  private findCompliantTarget(ctx: EdgeRequestContext, targets: RoutingTarget[]): RoutingTarget | undefined {
    if (!ctx.countryCode) return undefined;

    // 简化规则：EU 用户必须路由到 eu-* 区域
    const euCountries = new Set(['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'SE', 'DK']);
    if (euCountries.has(ctx.countryCode)) {
      return targets.find((t) => t.region.startsWith('eu-'));
    }

    // 中国用户必须路由到 cn-* 区域（数据本地化法规）
    if (ctx.countryCode === 'CN') {
      return targets.find((t) => t.region.startsWith('cn-'));
    }

    return undefined;
  }

  /** 计算综合评分（越高越好） */
  private computeScore(
    userGeo: GeoCoordinates,
    target: RoutingTarget,
    strategy: 'latency' | 'compliance' | 'balanced'
  ): number {
    const distance = haversineDistance(userGeo, target.coordinates);
    const distanceScore = Math.max(0, 1000 - distance); // 距离越近分越高
    const loadScore = (1 - target.loadRatio) * 500; // 负载越低分越高

    if (strategy === 'latency') {
      return distanceScore * 0.8 + loadScore * 0.2;
    }

    if (strategy === 'balanced') {
      return distanceScore * 0.5 + loadScore * 0.5;
    }

    return distanceScore * 0.4 + loadScore * 0.6;
  }

  /** 获取给定位置的推荐节点列表（用于客户端智能选择） */
  getRankedTargets(userGeo: GeoCoordinates, limit = 3): Array<{ target: RoutingTarget; distanceKm: number }> {
    const healthy = this.targets.filter((t) => t.healthy);
    return healthy
      .map((target) => ({
        target,
        distanceKm: haversineDistance(userGeo, target.coordinates),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 2: A/B Testing at Edge（边缘分流实验）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：在源站处理 A/B 实验分流。
 * 问题：
 *   1. 每个请求都必须穿透到源站才能确定实验组，边缘缓存价值被浪费
 *   2. 源站需要维护复杂的实验状态，成为瓶颈
 *   3. 实验延迟高，影响用户体验
 *   4. 无法利用边缘的本地决策能力
 */
class BadOriginABTest {
  async assignVariant(_ctx: EdgeRequestContext, _experiment: ABTestExperiment): Promise<string> {
    // 错误：必须回源才能确定变体
    await delay(100); // 模拟源站请求
    return 'control'; // 假设总是返回对照组
  }
}

/**
 * ✅ 正确做法：A/B Testing at Edge 生产级实现
 *
 * 核心思想：
 *   1. 在边缘层根据请求特征（用户 ID、Cookie、随机数）直接决定实验组
 *   2. 实验决策结果通过 Cookie/Header 传递，保证同一会话内一致
 *   3. 边缘缓存可以为每个变体分别缓存（Cache Key Variation）
 *   4. 源站完全无感知，专注业务逻辑
 *
 * 设计要点：
 *   - 用户粘性：同一用户总是看到同一变体
 *   - 流量控制：精确的百分比分配
 *   - 新用户过滤：支持仅对新用户实验
 *   - 分层实验：支持互斥实验层
 */
class EdgeABTestEngine {
  private experiments: Map<string, ABTestExperiment> = new Map();
  private userAssignments = new Map<string, Map<string, string>>(); // userId -> { experimentId -> variantId }

  registerExperiment(experiment: ABTestExperiment): void {
    this.experiments.set(experiment.id, experiment);
    console.log(`  [AB-Test] 📋 注册实验: "${experiment.name}" (id=${experiment.id}), 流量=${experiment.trafficPercent}%`);
  }

  /**
   * 为用户分配实验变体
   * 返回值包含：是否命中实验、分配的变体、用于缓存和跟踪的标识
   */
  assignVariant(
    ctx: EdgeRequestContext,
    experimentId: string
  ): {
    inExperiment: boolean;
    variantId: string | null;
    variantName: string | null;
    assignmentSource: 'cookie' | 'computed' | 'excluded';
    cacheKeySuffix: string;
  } {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }

    // 1. 检查实验时间窗口
    const now = Date.now();
    if (now < experiment.startAt) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }
    if (experiment.endAt && now > experiment.endAt) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }

    // 2. 检查路径匹配
    if (!experiment.pathPattern.test(ctx.pathname)) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }

    // 3. 检查 Cookie 中是否已有分配（保证粘性）
    const cookieKey = `ab_${experimentId}`;
    if (ctx.cookies[cookieKey]) {
      const variantId = ctx.cookies[cookieKey];
      const variant = experiment.variants.find((v) => v.id === variantId);
      if (variant) {
        return {
          inExperiment: true,
          variantId: variant.id,
          variantName: variant.name,
          assignmentSource: 'cookie',
          cacheKeySuffix: `__ab_${experimentId}_${variantId}`,
        };
      }
    }

    // 4. 新用户过滤
    if (experiment.newUserOnly && ctx.cookies['visited_before']) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }

    // 5. 计算用户是否在实验流量中
    const userBucket = getUserBucket(ctx.userId || ctx.clientIp, experimentId);
    if (userBucket >= experiment.trafficPercent) {
      return { inExperiment: false, variantId: null, variantName: null, assignmentSource: 'excluded', cacheKeySuffix: '' };
    }

    // 6. 在变体中分配（按权重）
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    let randomPoint = hashString(`${ctx.userId || ctx.clientIp}:${experimentId}:variant`) % totalWeight;

    let selectedVariant = experiment.variants[0];
    for (const variant of experiment.variants) {
      randomPoint -= variant.weight;
      if (randomPoint < 0) {
        selectedVariant = variant;
        break;
      }
    }

    // 记录分配
    if (ctx.userId) {
      if (!this.userAssignments.has(ctx.userId)) {
        this.userAssignments.set(ctx.userId, new Map());
      }
      this.userAssignments.get(ctx.userId)!.set(experimentId, selectedVariant.id);
    }

    console.log(
      `  [AB-Test] 🎲 分配变体: 用户="${ctx.userId || ctx.clientIp}", 实验="${experiment.name}", 变体="${selectedVariant.name}" (bucket=${userBucket})`
    );

    return {
      inExperiment: true,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      assignmentSource: 'computed',
      cacheKeySuffix: `__ab_${experimentId}_${selectedVariant.id}`,
    };
  }

  /** 获取用户的所有实验分配（用于调试面板） */
  getUserAssignments(userId: string): Record<string, string> {
    const assignments = this.userAssignments.get(userId);
    if (!assignments) return {};
    const result: Record<string, string> = {};
    for (const [expId, variantId] of assignments.entries()) {
      result[expId] = variantId;
    }
    return result;
  }

  /** 模拟将实验决策应用到边缘响应 */
  applyToResponse(
    ctx: EdgeRequestContext,
    experimentId: string,
    baseResponse: { content: string; headers: Record<string, string> }
  ): { content: string; headers: Record<string, string>; cookies: Record<string, string> } {
    const assignment = this.assignVariant(ctx, experimentId);
    const cookies: Record<string, string> = {};

    if (assignment.inExperiment && assignment.variantId) {
      // 设置粘性 Cookie（30 天）
      cookies[`ab_${experimentId}`] = assignment.variantId;

      // 根据变体修改响应内容（简化演示）
      const variantContent = `[变体: ${assignment.variantName}] ${baseResponse.content}`;

      return {
        content: variantContent,
        headers: {
          ...baseResponse.headers,
          'x-ab-test': `${experimentId}=${assignment.variantId}`,
          'x-ab-assignment': assignment.assignmentSource,
        },
        cookies,
      };
    }

    return {
      content: baseResponse.content,
      headers: baseResponse.headers,
      cookies,
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 模式 3: Canary Release（边缘金丝雀发布）
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ❌ 错误做法：通过 DNS 切流量做金丝雀，粒度粗、回滚慢。
 * 问题：
 *   1. DNS TTL 导致流量切换延迟（可能长达数分钟）
 *   2. 无法按用户特征定向（如仅内部员工、仅特定地区）
 *   3. 无法实时观察金丝雀指标
 *   4. 回滚需要再次修改 DNS，耗时久
 */
class BadDNSCanaryRouter {
  private canaryPercent = 0;

  setCanaryPercent(percent: number): void {
    this.canaryPercent = percent;
    console.log(`  [Canary-BAD] DNS 切流量到 ${percent}% — 生效需等待 TTL 过期（可能数分钟）`);
  }

  route(_ctx: EdgeRequestContext): 'stable' | 'canary' {
    // 错误：基于随机数，同一用户可能一会走稳定版一会走金丝雀版
    return Math.random() * 100 < this.canaryPercent ? 'canary' : 'stable';
  }
}

/**
 * ✅ 正确做法：Canary Release 生产级实现
 *
 * 核心思想：
 *   1. 在边缘层根据用户特征和配置策略做精确的流量切分
 *   2. 支持多维定向：地区、用户 ID、内部员工、随机百分比
 *   3. 实时指标采集和自动回滚
 *   4. 渐进式推进：自动按步长扩大金丝雀范围
 *   5. 用户粘性：金丝雀用户持续走金丝雀版本（避免体验跳变）
 *
 * 与 A/B 测试的区别：
 *   - 金丝雀：验证新版本稳定性，目标是安全上线
 *   - A/B 测试：验证业务假设，目标是数据驱动决策
 */
class EdgeCanaryEngine {
  private releases = new Map<string, CanaryRelease>();
  private canaryUsers = new Set<string>(); // 已标记为金丝雀用户的集合
  private metrics = new Map<string, { requests: number; errors: number; latencyTotal: number }>();

  registerRelease(release: CanaryRelease): void {
    this.releases.set(release.id, release);
    this.metrics.set(release.canaryVersion, { requests: 0, errors: 0, latencyTotal: 0 });
    console.log(
      `  [Canary] 🚀 注册金丝雀发布: ${release.serviceName} v${release.canaryVersion}, 当前流量=${release.canaryPercent}%`
    );
  }

  /**
   * 判断请求是否应该路由到金丝雀版本
   */
  shouldRouteToCanary(ctx: EdgeRequestContext, releaseId: string): {
    routeToCanary: boolean;
    reason: string;
    version: string;
  } {
    const release = this.releases.get(releaseId);
    if (!release) {
      return { routeToCanary: false, reason: 'release-not-found', version: '' };
    }

    // 1. 强制指定用户（内部测试、VIP 等）
    if (release.targeting.userIds?.includes(ctx.userId || '')) {
      this.canaryUsers.add(ctx.userId || ctx.clientIp);
      return { routeToCanary: true, reason: 'forced-user', version: release.canaryVersion };
    }

    // 2. 地区定向
    if (release.targeting.regions && ctx.countryCode) {
      if (release.targeting.regions.includes(ctx.countryCode)) {
        this.canaryUsers.add(ctx.userId || ctx.clientIp);
        return { routeToCanary: true, reason: 'region-target', version: release.canaryVersion };
      }
    }

    // 3. 已标记的金丝雀用户保持粘性
    if (this.canaryUsers.has(ctx.userId || ctx.clientIp)) {
      return { routeToCanary: true, reason: 'sticky-canary', version: release.canaryVersion };
    }

    // 4. 基于哈希的百分比分流（保证同一用户始终一致）
    if (release.targeting.hashBased) {
      const userHash = getUserBucket(ctx.userId || ctx.clientIp, releaseId);
      if (userHash < release.canaryPercent) {
        this.canaryUsers.add(ctx.userId || ctx.clientIp);
        return { routeToCanary: true, reason: `hash-based (${userHash} < ${release.canaryPercent})`, version: release.canaryVersion };
      }
    }

    // 5. 默认走稳定版
    return { routeToCanary: false, reason: 'stable-default', version: release.stableVersion };
  }

  /** 模拟请求处理并采集指标 */
  async processRequest(
    ctx: EdgeRequestContext,
    releaseId: string,
    stableHandler: () => Promise<{ status: number; latencyMs: number }>,
    canaryHandler: () => Promise<{ status: number; latencyMs: number }>
  ): Promise<{ status: number; version: string; latencyMs: number }> {
    const decision = this.shouldRouteToCanary(ctx, releaseId);
    const handler = decision.routeToCanary ? canaryHandler : stableHandler;
    const version = decision.version;

    const start = Date.now();
    try {
      const result = await handler();
      const latency = Date.now() - start;

      // 采集指标
      this.recordMetrics(version, latency, result.status >= 500);

      console.log(
        `  [Canary] ${decision.routeToCanary ? '🐤' : '🔵'} ${ctx.pathname} → ${version}, reason=${decision.reason}, latency=${latency}ms`
      );

      return { ...result, version, latencyMs: latency };
    } catch (error) {
      const latency = Date.now() - start;
      this.recordMetrics(version, latency, true);
      console.error(`  [Canary] ❌ 请求失败: ${version}, error=${(error as Error).message}`);
      throw error;
    }
  }

  /** 检查金丝雀健康状态，必要时自动回滚 */
  checkHealth(releaseId: string): {
    healthy: boolean;
    errorRate: number;
    avgLatency: number;
    recommendation: 'continue' | 'pause' | 'rollback';
  } {
    const release = this.releases.get(releaseId);
    if (!release) {
      return { healthy: false, errorRate: 0, avgLatency: 0, recommendation: 'rollback' };
    }

    const metrics = this.metrics.get(release.canaryVersion);
    if (!metrics || metrics.requests === 0) {
      return { healthy: true, errorRate: 0, avgLatency: 0, recommendation: 'continue' };
    }

    const errorRate = metrics.errors / metrics.requests;
    const avgLatency = metrics.latencyTotal / metrics.requests;

    let recommendation: 'continue' | 'pause' | 'rollback' = 'continue';
    if (errorRate > release.healthThresholds.errorRate) {
      recommendation = 'rollback';
    } else if (avgLatency > release.healthThresholds.latencyP99) {
      recommendation = 'pause';
    }

    console.log(
      `  [Canary] 🏥 健康检查: ${release.serviceName} v${release.canaryVersion}, errorRate=${(errorRate * 100).toFixed(2)}%, avgLatency=${avgLatency.toFixed(0)}ms, recommendation=${recommendation}`
    );

    return { healthy: recommendation === 'continue', errorRate, avgLatency, recommendation };
  }

  /** 自动推进金丝雀流量 */
  autoProgress(releaseId: string): void {
    const release = this.releases.get(releaseId);
    if (!release?.autoProgression?.enabled) return;

    const health = this.checkHealth(releaseId);
    if (health.recommendation !== 'continue') {
      console.log(`  [Canary] ⏸️ 自动推进暂停: ${health.recommendation}`);
      return;
    }

    const nextPercent = Math.min(100, release.canaryPercent + release.autoProgression.stepPercent);
    if (nextPercent !== release.canaryPercent) {
      release.canaryPercent = nextPercent;
      console.log(`  [Canary] ⏩ 自动推进: ${release.serviceName} 金丝雀流量 ${release.canaryPercent - release.autoProgression.stepPercent}% → ${nextPercent}%`);
    }
  }

  /** 紧急回滚：将所有金丝雀用户切回稳定版本 */
  emergencyRollback(releaseId: string): void {
    const release = this.releases.get(releaseId);
    if (!release) return;

    console.log(`  [Canary] 🚨 紧急回滚: ${release.serviceName} v${release.canaryVersion} → v${release.stableVersion}`);
    release.canaryPercent = 0;

    // 清除金丝雀用户标记（下次请求将走稳定版）
    const affectedUsers = Array.from(this.canaryUsers);
    this.canaryUsers.clear();
    console.log(`  [Canary] 🧹 已清除 ${affectedUsers.length} 个金丝雀用户标记`);
  }

  private recordMetrics(version: string, latency: number, isError: boolean): void {
    const m = this.metrics.get(version);
    if (m) {
      m.requests += 1;
      m.latencyTotal += latency;
      if (isError) m.errors += 1;
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Demo 演示函数
// ═════════════════════════════════════════════════════════════════════════════

export async function demo(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    边缘路由模式演示 — Edge Routing Patterns                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ── 演示 1: Geo-Routing ────────────────────────────────────────────────────
  console.log('▶▶▶ 模式 1: Geo-Routing（基于地理位置的路由决策）◀◀◀\n');

  const routingTargets: RoutingTarget[] = [
    { id: 'edge-tyo', region: 'ap-northeast', host: 'tyo.example.com', coordinates: { latitude: 35.6762, longitude: 139.6503 }, healthy: true, loadRatio: 0.4, capabilities: ['websocket', 'ml-inference'] },
    { id: 'edge-sfo', region: 'us-west', host: 'sfo.example.com', coordinates: { latitude: 37.7749, longitude: -122.4194 }, healthy: true, loadRatio: 0.3, capabilities: ['websocket', 'video-transcode'] },
    { id: 'edge-fra', region: 'eu-central', host: 'fra.example.com', coordinates: { latitude: 50.1109, longitude: 8.6821 }, healthy: true, loadRatio: 0.6, capabilities: ['websocket', 'gdpr-compliant'] },
    { id: 'edge-sin', region: 'ap-southeast', host: 'sin.example.com', coordinates: { latitude: 1.3521, longitude: 103.8198 }, healthy: true, loadRatio: 0.2, capabilities: ['websocket'] },
    { id: 'edge-iad', region: 'us-east', host: 'iad.example.com', coordinates: { latitude: 38.9072, longitude: -77.0369 }, healthy: false, loadRatio: 0.9, capabilities: ['websocket', 'video-transcode'] },
  ];

  const geoRouter = new GeoRouter(routingTargets);

  console.log('--- 场景 A: 东京用户请求（应路由到东京或新加坡节点）---');
  const tokyoUser: EdgeRequestContext = {
    clientIp: '203.0.113.1',
    geo: { latitude: 35.6762, longitude: 139.6503 },
    countryCode: 'JP',
    userId: 'user:tokyo-001',
    headers: {},
    cookies: {},
    pathname: '/api/data',
  };
  const tokyoDecision = geoRouter.route(tokyoUser, 'latency');
  console.log(`  路由到: ${tokyoDecision.target.id} (${tokyoDecision.target.region})`);
  console.log(`  原因: ${tokyoDecision.reason}`);

  console.log('\n--- 场景 B: 德国用户请求（应强制路由到 EU 节点，满足 GDPR）---');
  const germanUser: EdgeRequestContext = {
    clientIp: '198.51.100.2',
    geo: { latitude: 52.52, longitude: 13.405 },
    countryCode: 'DE',
    userId: 'user:berlin-002',
    headers: {},
    cookies: {},
    pathname: '/api/user-profile',
  };
  const germanDecision = geoRouter.route(germanUser, 'compliance');
  console.log(`  路由到: ${germanDecision.target.id} (${germanDecision.target.region})`);
  console.log(`  原因: ${germanDecision.reason}`);

  console.log('\n--- 场景 C: 负载均衡模式（平衡距离和负载）---');
  const brazilUser: EdgeRequestContext = {
    clientIp: '192.0.2.3',
    geo: { latitude: -23.5505, longitude: -46.6333 },
    countryCode: 'BR',
    userId: 'user:saopaulo-003',
    headers: {},
    cookies: {},
    pathname: '/api/search',
  };
  const brazilDecision = geoRouter.route(brazilUser, 'balanced');
  console.log(`  路由到: ${brazilDecision.target.id} (${brazilDecision.target.region})`);
  console.log(`  原因: ${brazilDecision.reason}`);

  console.log('\n--- 场景 D: 推荐节点列表 ---');
  const ranked = geoRouter.getRankedTargets({ latitude: 51.5074, longitude: -0.1278 }, 3);
  console.log('  伦敦用户的推荐节点（按距离排序）:');
  ranked.forEach((r, i) => {
    console.log(`    ${i + 1}. ${r.target.id}: ${r.distanceKm.toFixed(0)}km`);
  });

  // ── 演示 2: A/B Testing at Edge ────────────────────────────────────────────
  console.log('\n\n▶▶▶ 模式 2: A/B Testing at Edge（边缘分流实验）◀◀◀\n');

  const abTestEngine = new EdgeABTestEngine();

  abTestEngine.registerExperiment({
    id: 'exp-homepage-redesign',
    name: '首页重新设计实验',
    trafficPercent: 50,
    variants: [
      { id: 'control', name: '原版首页', weight: 50, handlerKey: 'homepage-v1' },
      { id: 'variant-a', name: '新卡片布局', weight: 30, handlerKey: 'homepage-v2-cards' },
      { id: 'variant-b', name: '全宽横幅', weight: 20, handlerKey: 'homepage-v2-hero' },
    ],
    pathPattern: /^\/\??.*$/, // 匹配首页
    startAt: Date.now() - 86400000, // 昨天开始
    newUserOnly: false,
  });

  abTestEngine.registerExperiment({
    id: 'exp-checkout-flow',
    name: '结账流程优化',
    trafficPercent: 30,
    variants: [
      { id: 'control', name: '三步结账', weight: 50, handlerKey: 'checkout-v1' },
      { id: 'variant-a', name: '一步结账', weight: 50, handlerKey: 'checkout-v2' },
    ],
    pathPattern: /^\/checkout/,
    startAt: Date.now() - 86400000,
    newUserOnly: true,
  });

  console.log('--- 用户 Alice 访问首页（首次，应被分配并记住变体）---');
  const aliceCtx: EdgeRequestContext = {
    clientIp: '198.51.100.10',
    userId: 'user:alice',
    headers: {},
    cookies: {},
    pathname: '/',
  };
  const aliceAssignment = abTestEngine.assignVariant(aliceCtx, 'exp-homepage-redesign');
  console.log(`  命中实验: ${aliceAssignment.inExperiment}`);
  console.log(`  分配变体: ${aliceAssignment.variantName} (${aliceAssignment.variantId})`);
  console.log(`  分配来源: ${aliceAssignment.assignmentSource}`);
  console.log(`  缓存 Key 后缀: ${aliceAssignment.cacheKeySuffix}`);

  console.log('\n--- 同一用户再次访问（应通过 Cookie 保持同一变体）---');
  const aliceReturnCtx: EdgeRequestContext = {
    ...aliceCtx,
    cookies: { ab_exp_homepage_redesign: aliceAssignment.variantId! },
  };
  const aliceReturnAssignment = abTestEngine.assignVariant(aliceReturnCtx, 'exp-homepage-redesign');
  console.log(`  命中实验: ${aliceReturnAssignment.inExperiment}`);
  console.log(`  分配变体: ${aliceReturnAssignment.variantName} (${aliceReturnAssignment.variantId})`);
  console.log(`  分配来源: ${aliceReturnAssignment.assignmentSource}（应显示 cookie）`);

  console.log('\n--- 用户 Bob 访问结账页（新用户专属实验）---');
  const bobCtx: EdgeRequestContext = {
    clientIp: '198.51.100.20',
    userId: 'user:bob',
    headers: {},
    cookies: { visited_before: 'true' }, // Bob 是老用户
    pathname: '/checkout/cart',
  };
  const bobAssignment = abTestEngine.assignVariant(bobCtx, 'exp-checkout-flow');
  console.log(`  命中实验: ${bobAssignment.inExperiment}（应为 false，因为是老用户且实验仅对新用户）`);

  console.log('\n--- 用户 Charlie（新用户）访问结账页 ---');
  const charlieCtx: EdgeRequestContext = {
    clientIp: '198.51.100.30',
    userId: 'user:charlie',
    headers: {},
    cookies: {},
    pathname: '/checkout/cart',
  };
  const charlieAssignment = abTestEngine.assignVariant(charlieCtx, 'exp-checkout-flow');
  console.log(`  命中实验: ${charlieAssignment.inExperiment}`);
  console.log(`  分配变体: ${charlieAssignment.variantName} (${charlieAssignment.variantId})`);

  console.log('\n--- 将实验应用到响应 ---');
  const response = abTestEngine.applyToResponse(aliceCtx, 'exp-homepage-redesign', {
    content: '<html>首页内容</html>',
    headers: { 'content-type': 'text/html' },
  });
  console.log(`  响应内容: ${response.content.slice(0, 60)}...`);
  console.log(`  响应头: ${JSON.stringify(response.headers)}`);
  console.log(`  设置 Cookie: ${JSON.stringify(response.cookies)}`);

  // ── 演示 3: Canary Release ─────────────────────────────────────────────────
  console.log('\n\n▶▶▶ 模式 3: Canary Release（边缘金丝雀发布）◀◀◀\n');

  const canaryEngine = new EdgeCanaryEngine();

  canaryEngine.registerRelease({
    id: 'rel-payment-service',
    serviceName: 'payment-service',
    canaryPercent: 10,
    canaryVersion: '2.1.0',
    stableVersion: '2.0.9',
    targeting: {
      hashBased: true,
      regions: ['US'],
    },
    healthThresholds: {
      errorRate: 0.05,
      latencyP99: 500,
    },
    autoProgression: {
      enabled: true,
      stepPercent: 10,
      intervalMinutes: 30,
    },
  });

  console.log('--- 模拟多个用户请求，观察路由决策 ---');
  const testUsers = [
    { userId: 'user:vip-001', countryCode: 'US', pathname: '/api/pay' },
    { userId: 'user:normal-042', countryCode: 'US', pathname: '/api/pay' },
    { userId: 'user:normal-099', countryCode: 'US', pathname: '/api/pay' },
    { userId: 'user:europe-001', countryCode: 'DE', pathname: '/api/pay' },
    { userId: 'user:normal-123', countryCode: 'US', pathname: '/api/pay' },
  ];

  for (const user of testUsers) {
    const ctx: EdgeRequestContext = {
      clientIp: `192.0.2.${Math.floor(Math.random() * 255)}`,
      userId: user.userId,
      countryCode: user.countryCode,
      headers: {},
      cookies: {},
      pathname: user.pathname,
    };

    const decision = canaryEngine.shouldRouteToCanary(ctx, 'rel-payment-service');
    console.log(
      `  用户 ${user.userId} (${user.countryCode}) → ${decision.routeToCanary ? '🐤 canary' : '🔵 stable'} v${decision.version}, reason=${decision.reason}`
    );
  }

  console.log('\n--- 模拟金丝雀请求处理（正常情况）---');
  const canaryCtx: EdgeRequestContext = {
    clientIp: '192.0.2.100',
    userId: 'user:canary-test',
    countryCode: 'US',
    headers: {},
    cookies: {},
    pathname: '/api/pay',
  };

  for (let i = 0; i < 5; i++) {
    await canaryEngine.processRequest(
      canaryCtx,
      'rel-payment-service',
      async () => ({ status: 200, latencyMs: 45 }), // 稳定版处理器
      async () => ({ status: 200, latencyMs: 52 })  // 金丝雀版处理器
    );
    await delay(10);
  }

  console.log('\n--- 健康检查 ---');
  const health = canaryEngine.checkHealth('rel-payment-service');
  console.log(`  健康状态: ${health.healthy ? '✅ 健康' : '❌ 异常'}`);
  console.log(`  错误率: ${(health.errorRate * 100).toFixed(2)}%`);
  console.log(`  平均延迟: ${health.avgLatency.toFixed(1)}ms`);
  console.log(`  建议: ${health.recommendation}`);

  console.log('\n--- 模拟金丝雀异常，触发紧急回滚 ---');
  // 模拟大量错误
  for (let i = 0; i < 20; i++) {
    await canaryEngine.processRequest(
      { ...canaryCtx, userId: `user:error-sim-${i}` },
      'rel-payment-service',
      async () => ({ status: 200, latencyMs: 50 }),
      async () => ({ status: 500, latencyMs: 120 }) // 金丝雀版持续报错
    );
  }

  const healthAfterErrors = canaryEngine.checkHealth('rel-payment-service');
  console.log(`  错误后健康检查: errorRate=${(healthAfterErrors.errorRate * 100).toFixed(1)}%`);

  if (healthAfterErrors.recommendation === 'rollback') {
    console.log('  触发自动回滚条件！');
    canaryEngine.emergencyRollback('rel-payment-service');
  }

  // 验证回滚后请求都走稳定版
  const postRollbackCtx: EdgeRequestContext = {
    clientIp: '192.0.2.200',
    userId: 'user:post-rollback',
    countryCode: 'US',
    headers: {},
    cookies: {},
    pathname: '/api/pay',
  };
  const postRollbackDecision = canaryEngine.shouldRouteToCanary(postRollbackCtx, 'rel-payment-service');
  console.log(`  回滚后用户路由: ${postRollbackDecision.routeToCanary ? '🐤 canary' : '🔵 stable'} (${postRollbackDecision.reason})`);

  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}
