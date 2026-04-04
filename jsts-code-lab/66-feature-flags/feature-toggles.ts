/**
 * @file 功能开关管理
 * @category Feature Flags → Feature Toggles
 * @difficulty medium
 * @tags feature-toggle, feature-management, rollout
 *
 * @description
 * 功能开关管理实现：开关定义、环境配置、依赖管理、开关组
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface FeatureToggle {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environments: Record<string, boolean>;
  dependencies: string[];
  tags: string[];
  owner: string;
  createdAt: number;
  updatedAt: number;
}

export interface ToggleContext {
  environment: string;
  userId?: string;
  userGroups?: string[];
  timestamp: number;
  attributes?: Record<string, unknown>;
}

export interface ToggleRule {
  type: 'environment' | 'user' | 'group' | 'percentage' | 'time' | 'custom';
  condition: Record<string, unknown>;
  action: 'enable' | 'disable';
}

export interface ToggleGroup {
  name: string;
  description: string;
  toggles: string[]; // toggle keys
  enabled: boolean;
}

// ============================================================================
// 功能开关管理器
// ============================================================================

export class FeatureToggleManager {
  private toggles: Map<string, FeatureToggle> = new Map();
  private groups: Map<string, ToggleGroup> = new Map();
  private listeners: Array<(toggle: FeatureToggle, enabled: boolean) => void> = [];

  /**
   * 注册功能开关
   */
  register(toggle: Omit<FeatureToggle, 'createdAt' | 'updatedAt'>): FeatureToggle {
    const now = Date.now();
    const fullToggle: FeatureToggle = {
      ...toggle,
      createdAt: now,
      updatedAt: now
    };

    this.toggles.set(toggle.key, fullToggle);
    return fullToggle;
  }

  /**
   * 获取开关状态
   */
  isEnabled(key: string, context?: ToggleContext): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle) return false;

    // 检查依赖
    if (!this.checkDependencies(toggle, context)) {
      return false;
    }

    // 检查环境特定配置
    if (context?.environment && toggle.environments[context.environment] !== undefined) {
      return toggle.environments[context.environment];
    }

    return toggle.enabled;
  }

  /**
   * 启用开关
   */
  enable(key: string): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle) return false;

    toggle.enabled = true;
    toggle.updatedAt = Date.now();
    
    this.notifyListeners(toggle, true);
    return true;
  }

  /**
   * 禁用开关
   */
  disable(key: string): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle) return false;

    toggle.enabled = false;
    toggle.updatedAt = Date.now();
    
    this.notifyListeners(toggle, false);
    return true;
  }

  /**
   * 切换开关
   */
  toggle(key: string): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle) return false;

    return toggle.enabled ? this.disable(key) : this.enable(key);
  }

  /**
   * 设置环境配置
   */
  setEnvironment(key: string, environment: string, enabled: boolean): boolean {
    const toggle = this.toggles.get(key);
    if (!toggle) return false;

    toggle.environments[environment] = enabled;
    toggle.updatedAt = Date.now();
    return true;
  }

  /**
   * 创建开关组
   */
  createGroup(name: string, description: string, toggleKeys: string[]): ToggleGroup {
    const group: ToggleGroup = {
      name,
      description,
      toggles: toggleKeys,
      enabled: true
    };

    this.groups.set(name, group);
    return group;
  }

  /**
   * 启用/禁用整组开关
   */
  setGroupEnabled(groupName: string, enabled: boolean): boolean {
    const group = this.groups.get(groupName);
    if (!group) return false;

    group.enabled = enabled;
    
    for (const key of group.toggles) {
      if (enabled) {
        this.enable(key);
      } else {
        this.disable(key);
      }
    }

    return true;
  }

  /**
   * 获取所有开关
   */
  getAllToggles(): FeatureToggle[] {
    return Array.from(this.toggles.values());
  }

  /**
   * 按标签获取开关
   */
  getTogglesByTag(tag: string): FeatureToggle[] {
    return this.getAllToggles().filter(t => t.tags.includes(tag));
  }

  /**
   * 订阅开关变化
   */
  onToggleChange(listener: (toggle: FeatureToggle, enabled: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 获取开关统计
   */
  getStats(): { total: number; enabled: number; disabled: number } {
    const all = this.getAllToggles();
    return {
      total: all.length,
      enabled: all.filter(t => t.enabled).length,
      disabled: all.filter(t => !t.enabled).length
    };
  }

  private checkDependencies(toggle: FeatureToggle, context?: ToggleContext): boolean {
    for (const depKey of toggle.dependencies) {
      if (!this.isEnabled(depKey, context)) {
        return false;
      }
    }
    return true;
  }

  private notifyListeners(toggle: FeatureToggle, enabled: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(toggle, enabled);
      } catch (err) {
        console.error('[FeatureToggle] Listener error:', err);
      }
    });
  }
}

// ============================================================================
// 条件评估器
// ============================================================================

export class ToggleConditionEvaluator {
  /**
   * 评估条件
   */
  evaluate(rules: ToggleRule[], context: ToggleContext): boolean {
    for (const rule of rules) {
      const matches = this.evaluateRule(rule, context);
      
      if (matches && rule.action === 'enable') {
        return true;
      }
      if (matches && rule.action === 'disable') {
        return false;
      }
    }

    return false;
  }

  private evaluateRule(rule: ToggleRule, context: ToggleContext): boolean {
    switch (rule.type) {
      case 'environment':
        return context.environment === rule.condition.environment;
      
      case 'user':
        return context.userId === rule.condition.userId;
      
      case 'group':
        return context.userGroups?.some(g => 
          (rule.condition.groups as string[])?.includes(g)
        ) || false;
      
      case 'percentage':
        const userHash = this.hashUser(context.userId || '');
        return userHash < (rule.condition.percentage as number);
      
      case 'time':
        const now = context.timestamp;
        const start = rule.condition.start as number;
        const end = rule.condition.end as number;
        return now >= start && now <= end;
      
      default:
        return false;
    }
  }

  private hashUser(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 功能开关管理演示 ===\n');

  const manager = new FeatureToggleManager();

  // 1. 注册功能开关
  console.log('--- 注册功能开关 ---');
  
  manager.register({
    key: 'new-dashboard',
    name: 'New Dashboard UI',
    description: 'Redesigned dashboard with better UX',
    enabled: false,
    environments: {
      development: true,
      staging: true,
      production: false
    },
    dependencies: ['auth-v2'],
    tags: ['ui', 'dashboard'],
    owner: 'frontend-team'
  });

  manager.register({
    key: 'auth-v2',
    name: 'Authentication v2',
    description: 'New authentication system',
    enabled: true,
    environments: {},
    dependencies: [],
    tags: ['auth', 'backend'],
    owner: 'backend-team'
  });

  manager.register({
    key: 'dark-mode',
    name: 'Dark Mode',
    description: 'Dark theme support',
    enabled: true,
    environments: {},
    dependencies: [],
    tags: ['ui', 'theme'],
    owner: 'frontend-team'
  });

  // 2. 检查开关状态
  console.log('--- 开关状态 ---');
  console.log(`  new-dashboard (dev): ${manager.isEnabled('new-dashboard', { environment: 'development', timestamp: Date.now() })}`);
  console.log(`  new-dashboard (prod): ${manager.isEnabled('new-dashboard', { environment: 'production', timestamp: Date.now() })}`);
  console.log(`  dark-mode: ${manager.isEnabled('dark-mode')}`);

  // 3. 切换开关
  console.log('\n--- 切换开关 ---');
  manager.enable('new-dashboard');
  console.log(`  new-dashboard enabled: ${manager.isEnabled('new-dashboard')}`);

  // 4. 开关组
  console.log('\n--- 开关组 ---');
  manager.createGroup('ui-features', 'UI related features', ['new-dashboard', 'dark-mode']);
  
  const uiToggles = manager.getTogglesByTag('ui');
  console.log(`  UI toggles: ${uiToggles.map(t => t.key).join(', ')}`);

  // 5. 订阅变化
  console.log('\n--- 订阅变化 ---');
  const unsubscribe = manager.onToggleChange((toggle, enabled) => {
    console.log(`  [Event] ${toggle.key} changed to ${enabled ? 'enabled' : 'disabled'}`);
  });

  manager.disable('dark-mode');
  unsubscribe();

  // 6. 统计
  console.log('\n--- 统计 ---');
  console.log('  ', manager.getStats());
}
