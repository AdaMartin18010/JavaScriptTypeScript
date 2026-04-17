/**
 * @file 功能开关系统
 * @category Feature Flags → System
 * @difficulty medium
 * @tags feature-flags, feature-toggle, rollout, ab-testing
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  rules: FlagRule[];
  rollout?: RolloutConfig;
}

export interface FlagRule {
  type: 'user' | 'group' | 'percentage' | 'time';
  condition: Record<string, unknown>;
}

export interface RolloutConfig {
  percentage: number;
  startTime?: number;
  endTime?: number;
}

export interface UserContext {
  id: string;
  groups?: string[];
  attributes?: Record<string, unknown>;
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private userOverrides = new Map<string, Set<string>>();
  
  register(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
  }
  
  isEnabled(flagKey: string, user?: UserContext): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    
    // 用户覆盖
    if (user && this.userOverrides.get(user.id)?.has(flagKey)) {
      return true;
    }
    
    // 全局关闭
    if (!flag.enabled) return false;
    
    // 评估规则
    for (const rule of flag.rules) {
      if (this.evaluateRule(rule, user)) {
        return true;
      }
    }
    
    // 渐进发布
    if (flag.rollout) {
      return this.evaluateRollout(flag.rollout, user);
    }
    
    return false;
  }
  
  enableForUser(flagKey: string, userId: string): void {
    if (!this.userOverrides.has(userId)) {
      this.userOverrides.set(userId, new Set());
    }
    this.userOverrides.get(userId)!.add(flagKey);
  }
  
  private evaluateRule(rule: FlagRule, user?: UserContext): boolean {
    switch (rule.type) {
      case 'user':
        return user?.id === rule.condition.userId;
        
      case 'group':
        return user?.groups?.some(g => 
          (rule.condition.groups as string[])?.includes(g)
        ) || false;
        
      case 'percentage':
        return this.hashUser(user?.id || '') < (rule.condition.percentage as number);
        
      case 'time':
        const now = Date.now();
        return now >= (rule.condition.start as number) && 
               now <= (rule.condition.end as number);
        
      default:
        return false;
    }
  }
  
  private evaluateRollout(rollout: RolloutConfig, user?: UserContext): boolean {
    const now = Date.now();
    
    if (rollout.startTime && now < rollout.startTime) return false;
    if (rollout.endTime && now > rollout.endTime) return false;
    
    if (!user) return false;
    
    return this.hashUser(user.id) < rollout.percentage;
  }
  
  // 一致性哈希，确保同一用户总是得到相同结果
  private hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
  
  getFlagStatus(flagKey: string): { registered: boolean; enabled: boolean; rules: number } {
    const flag = this.flags.get(flagKey);
    return {
      registered: !!flag,
      enabled: flag?.enabled || false,
      rules: flag?.rules.length || 0
    };
  }
  
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// A/B测试支持
export interface ABTest {
  id: string;
  name: string;
  flagKey: string;
  variants: { name: string; weight: number }[];
}

export class ABTestManager {
  private tests = new Map<string, ABTest>();
  private assignments = new Map<string, Map<string, string>>();
  
  createTest(test: ABTest): void {
    this.tests.set(test.id, test);
  }
  
  getVariant(testId: string, userId: string): string | null {
    // 检查已有分配
    const userAssignments = this.assignments.get(userId);
    if (userAssignments?.has(testId)) {
      return userAssignments.get(testId)!;
    }
    
    const test = this.tests.get(testId);
    if (!test) return null;
    
    // 根据权重分配
    const hash = this.hashUserToBucket(userId);
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (hash < cumulative) {
        // 保存分配
        if (!this.assignments.has(userId)) {
          this.assignments.set(userId, new Map());
        }
        this.assignments.get(userId)!.set(testId, variant.name);
        return variant.name;
      }
    }
    
    return test.variants[0]?.name || null;
  }
  
  private hashUserToBucket(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
}

export function demo(): void {
  console.log('=== 功能开关系统 ===\n');
  
  const ff = new FeatureFlagManager();
  
  // 注册功能开关
  ff.register({
    key: 'new-dashboard',
    enabled: true,
    description: '新版仪表板',
    rules: [
      { type: 'group', condition: { groups: ['beta', 'admin'] } }
    ],
    rollout: {
      percentage: 10,
      startTime: Date.now() - 86400000 // 昨天开始
    }
  });
  
  ff.register({
    key: 'dark-mode',
    enabled: true,
    description: '深色模式',
    rules: [
      { type: 'user', condition: { userId: 'user-1' } }
    ]
  });
  
  // 测试用户
  const testUsers: UserContext[] = [
    { id: 'user-1', groups: ['admin'] },
    { id: 'user-2', groups: ['beta'] },
    { id: 'user-3', groups: ['regular'] },
    { id: 'user-4', groups: ['regular'] }
  ];
  
  console.log('功能开关状态:');
  for (const user of testUsers) {
    const newDashboard = ff.isEnabled('new-dashboard', user);
    const darkMode = ff.isEnabled('dark-mode', user);
    console.log(`  ${user.id}: new-dashboard=${newDashboard}, dark-mode=${darkMode}`);
  }
  
  // A/B测试
  const abTest = new ABTestManager();
  abTest.createTest({
    id: 'button-color',
    name: '按钮颜色测试',
    flagKey: 'button-color-test',
    variants: [
      { name: 'blue', weight: 50 },
      { name: 'green', weight: 50 }
    ]
  });
  
  console.log('\nA/B测试分配:');
  for (const user of testUsers) {
    const variant = abTest.getVariant('button-color', user.id);
    console.log(`  ${user.id} -> ${variant}`);
  }
}
