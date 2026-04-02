/**
 * @file 威胁建模与 STRIDE 评估器
 * @category Cybersecurity → Threat Modeling
 * @difficulty hard
 * @tags security, stride, threat-modeling, risk-assessment
 *
 * @description
 * 实现 STRIDE 威胁建模框架的评估器，能识别 Spoofing、Tampering、Repudiation、
 * Information Disclosure、DoS、Elevation of Privilege 威胁并输出风险矩阵。
 */

export type StrideCategory =
  | 'spoofing'
  | 'tampering'
  | 'repudiation'
  | 'information-disclosure'
  | 'denial-of-service'
  | 'elevation-of-privilege';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly category: StrideCategory;
  readonly severity: SeverityLevel;
  /** 可能性，范围 0.0 ~ 1.0 */
  readonly likelihood: number;
  /** 影响范围，范围 0.0 ~ 1.0 */
  readonly impact: number;
  readonly mitigations: readonly string[];
}

export interface Asset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface RiskMatrixItem extends Threat {
  readonly riskScore: number;
  readonly riskLevel: SeverityLevel;
}

/**
 * STRIDE 威胁建模评估器
 *
 * STRIDE 是微软提出的威胁分类模型，涵盖六种基本威胁类型：
 * - Spoofing（欺骗）：伪装成他人或他物
 * - Tampering（篡改）：非法修改数据或代码
 * - Repudiation（抵赖）：否认已执行的操作
 * - Information Disclosure（信息泄露）：暴露敏感信息
 * - Denial of Service（拒绝服务）：使系统不可用
 * - Elevation of Privilege（权限提升）：获得未授权的高权限
 */
export class StrideEvaluator {
  private threats: Threat[] = [];
  private assets: Asset[] = [];

  addAsset(asset: Asset): void {
    this.assets.push(asset);
  }

  addThreat(threat: Threat): void {
    this.threats.push(threat);
  }

  /**
   * 计算风险评分：风险 = 可能性 × 影响
   * 风险矩阵采用 0.0 ~ 1.0 的连续评分，再映射为离散等级
   */
  calculateRiskScore(threat: Threat): number {
    return Number((threat.likelihood * threat.impact).toFixed(3));
  }

  /**
   * 根据风险评分映射风险等级
   * - ≥0.7: critical
   * - ≥0.5: high
   * - ≥0.3: medium
   * - <0.3: low
   */
  private mapRiskLevel(score: number): SeverityLevel {
    if (score >= 0.7) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * 生成风险矩阵，按风险评分降序排列
   */
  getRiskMatrix(): RiskMatrixItem[] {
    return this.threats
      .map((t) => {
        const riskScore = this.calculateRiskScore(t);
        return {
          ...t,
          riskScore,
          riskLevel: this.mapRiskLevel(riskScore),
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * 基于 STRIDE 六元组自动生成典型威胁清单
   */
  generateStrideThreats(): Threat[] {
    const threats: Threat[] = [
      {
        id: 'STRIDE-S001',
        name: '身份欺骗 (Spoofing)',
        category: 'spoofing',
        severity: 'high',
        likelihood: 0.6,
        impact: 0.8,
        mitigations: ['多因素认证 (MFA)', '强密码策略', '会话管理', '数字证书'],
      },
      {
        id: 'STRIDE-T001',
        name: '数据篡改 (Tampering)',
        category: 'tampering',
        severity: 'critical',
        likelihood: 0.4,
        impact: 0.9,
        mitigations: ['数字签名', '完整性校验 (HMAC)', 'HTTPS/TLS', '审计日志'],
      },
      {
        id: 'STRIDE-R001',
        name: '操作抵赖 (Repudiation)',
        category: 'repudiation',
        severity: 'medium',
        likelihood: 0.5,
        impact: 0.6,
        mitigations: ['不可抵赖的审计日志', '数字签名', '集中式日志收集'],
      },
      {
        id: 'STRIDE-I001',
        name: '信息泄露 (Information Disclosure)',
        category: 'information-disclosure',
        severity: 'high',
        likelihood: 0.7,
        impact: 0.75,
        mitigations: ['加密传输与存储', '最小权限原则', '敏感数据脱敏', '访问控制'],
      },
      {
        id: 'STRIDE-D001',
        name: '拒绝服务 (DoS)',
        category: 'denial-of-service',
        severity: 'high',
        likelihood: 0.8,
        impact: 0.6,
        mitigations: ['速率限制', 'CDN/DDoS 防护', '资源配额', '弹性扩容'],
      },
      {
        id: 'STRIDE-E001',
        name: '权限提升 (Elevation of Privilege)',
        category: 'elevation-of-privilege',
        severity: 'critical',
        likelihood: 0.3,
        impact: 0.95,
        mitigations: ['最小权限原则', 'RBAC/ABAC', '输入验证', '安全边界隔离'],
      },
    ];
    return threats;
  }

  /**
   * 按类别统计威胁数量与平均风险评分
   */
  getCategoryStatistics(): Record<
    StrideCategory,
    { count: number; averageRisk: number }
  > {
    const stats: Record<
      StrideCategory,
      { count: number; totalRisk: number }
    > = {
      spoofing: { count: 0, totalRisk: 0 },
      tampering: { count: 0, totalRisk: 0 },
      repudiation: { count: 0, totalRisk: 0 },
      'information-disclosure': { count: 0, totalRisk: 0 },
      'denial-of-service': { count: 0, totalRisk: 0 },
      'elevation-of-privilege': { count: 0, totalRisk: 0 },
    };

    for (const threat of this.threats) {
      const score = this.calculateRiskScore(threat);
      stats[threat.category].count += 1;
      stats[threat.category].totalRisk += score;
    }

    return Object.fromEntries(
      Object.entries(stats).map(([category, data]) => [
        category,
        {
          count: data.count,
          averageRisk:
            data.count > 0
              ? Number((data.totalRisk / data.count).toFixed(3))
              : 0,
        },
      ])
    ) as Record<StrideCategory, { count: number; averageRisk: number }>;
  }

  /**
   * 评估资产面临的最高风险威胁
   */
  assessAssetRisk(assetId: string): RiskMatrixItem[] {
    const asset = this.assets.find((a) => a.id === assetId);
    if (!asset) return [];

    // 根据资产敏感度调整风险评分（演示逻辑）
    const sensitivityMultiplier: Record<Asset['sensitivity'], number> = {
      public: 1.0,
      internal: 1.1,
      confidential: 1.3,
      restricted: 1.5,
    };

    const multiplier = sensitivityMultiplier[asset.sensitivity];

    return this.getRiskMatrix()
      .map((item) => ({
        ...item,
        riskScore: Math.min(1.0, Number((item.riskScore * multiplier).toFixed(3))),
        riskLevel: this.mapRiskLevel(Math.min(1.0, item.riskScore * multiplier)),
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }
}

export function demo(): void {
  console.log('=== STRIDE 威胁建模评估器 Demo ===\n');

  const evaluator = new StrideEvaluator();

  // 注册资产
  evaluator.addAsset({
    id: 'ASSET-001',
    name: '用户数据库',
    description: '存储用户个人信息、密码哈希与权限角色',
    sensitivity: 'restricted',
  });

  evaluator.addAsset({
    id: 'ASSET-002',
    name: '公开 API 文档',
    description: '面向开发者的 REST API 参考文档',
    sensitivity: 'public',
  });

  // 自动生成 STRIDE 威胁
  const strideThreats = evaluator.generateStrideThreats();
  strideThreats.forEach((t) => evaluator.addThreat(t));

  console.log('--- 风险矩阵（按风险评分降序） ---');
  const matrix = evaluator.getRiskMatrix();
  for (const item of matrix) {
    console.log(
      `  [${item.riskLevel.toUpperCase()}] ${item.name} | 评分: ${item.riskScore} | 缓释措施: ${item.mitigations.join('、')}`
    );
  }

  console.log('\n--- 分类统计 ---');
  const stats = evaluator.getCategoryStatistics();
  for (const [category, data] of Object.entries(stats)) {
    console.log(
      `  ${category}: 数量=${data.count}, 平均风险=${data.averageRisk}`
    );
  }

  console.log('\n--- 资产 ASSET-001 (restricted) 风险评估 ---');
  const assetRisk = evaluator.assessAssetRisk('ASSET-001');
  for (const item of assetRisk.slice(0, 3)) {
    console.log(
      `  [${item.riskLevel.toUpperCase()}] ${item.name} → 调整后评分: ${item.riskScore}`
    );
  }
}
