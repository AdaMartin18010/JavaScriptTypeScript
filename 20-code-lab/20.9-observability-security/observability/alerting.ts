/**
 * @file 告警系统实现
 * @category Observability → Alerting
 * @difficulty hard
 * @tags observability, alerting, monitoring, notification
 *
 * @description
 * 灵活的告警系统，支持多种告警规则、抑制和通知渠道。
 *
 * 告警状态机：
 * - Inactive: 条件未满足
 * - Pending: 条件满足，等待 for 持续时间
 * - Firing: 条件持续满足，已触发告警
 * - Resolved: 条件不再满足，告警恢复
 *
 * 告警路由：
 * - 按严重级别路由
 * - 按标签匹配路由
 * - 时间窗口路由
 *
 * 告警抑制：
 * - 静默窗口
 * - 告警分组
 * - 重复告警抑制
 */

export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

export enum AlertState {
  INACTIVE = 'inactive',
  PENDING = 'pending',
  FIRING = 'firing',
  RESOLVED = 'resolved'
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: AlertCondition;
  for: number; // 持续时间（毫秒），达到此时间才触发
  labels: Record<string, string>;
  annotations: Record<string, string>;
  group?: string;
}

export interface AlertCondition {
  type: 'threshold' | 'range' | 'absent';
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'ge' | 'le';
  value: number;
  range?: [number, number];
}

export interface Alert {
  id: string;
  ruleId: string;
  name: string;
  state: AlertState;
  severity: AlertSeverity;
  value: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: number;
  endsAt?: number;
  generatorURL?: string;
}

export interface AlertGroup {
  name: string;
  rules: string[];
  interval: number; // 评估间隔（毫秒）
}

// ==================== 告警评估器 ====================

export class AlertEvaluator {
  private rules = new Map<string, AlertRule>();
  private groups = new Map<string, AlertGroup>();
  private activeAlerts = new Map<string, Alert>();
  private pendingAlerts = new Map<string, { alert: Alert; since: number }>();

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  addGroup(group: AlertGroup): void {
    this.groups.set(group.name, group);
  }

  /**
   * 评估规则
   */
  evaluate(ruleId: string, metrics: Map<string, number>): Alert | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const value = metrics.get(rule.condition.metric) ?? 0;
    const conditionMet = this.checkCondition(rule.condition, value);
    const alertId = `${rule.id}:${JSON.stringify(rule.labels)}`;

    if (conditionMet) {
      // 检查是否已有活跃告警
      if (this.activeAlerts.has(alertId)) {
        return this.activeAlerts.get(alertId)!;
      }

      // 检查是否正在等待
      if (this.pendingAlerts.has(alertId)) {
        const pending = this.pendingAlerts.get(alertId)!;
        const elapsed = Date.now() - pending.since;

        if (elapsed >= rule.for) {
          // 转为活跃告警
          const alert: Alert = {
            ...pending.alert,
            state: AlertState.FIRING
          };
          this.activeAlerts.set(alertId, alert);
          this.pendingAlerts.delete(alertId);
          return alert;
        }

        return pending.alert;
      }

      // 新建待处理告警
      const alert: Alert = {
        id: alertId,
        ruleId: rule.id,
        name: rule.name,
        state: AlertState.PENDING,
        severity: rule.severity,
        value,
        labels: rule.labels,
        annotations: rule.annotations,
        startsAt: Date.now()
      };

      this.pendingAlerts.set(alertId, { alert, since: Date.now() });
      return alert;
    } else {
      // 条件不满足，检查是否需要恢复
      if (this.activeAlerts.has(alertId)) {
        const alert = this.activeAlerts.get(alertId)!;
        alert.state = AlertState.RESOLVED;
        alert.endsAt = Date.now();
        this.activeAlerts.delete(alertId);
        return alert;
      }

      // 清除待处理告警
      this.pendingAlerts.delete(alertId);
      return null;
    }
  }

  /**
   * 评估所有规则
   */
  evaluateAll(metrics: Map<string, number>): Alert[] {
    const alerts: Alert[] = [];

    for (const ruleId of this.rules.keys()) {
      const alert = this.evaluate(ruleId, metrics);
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private checkCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.type) {
      case 'threshold':
        switch (condition.operator) {
          case 'gt': return value > condition.value;
          case 'lt': return value < condition.value;
          case 'ge': return value >= condition.value;
          case 'le': return value <= condition.value;
          case 'eq': return value === condition.value;
          case 'ne': return value !== condition.value;
        }
        break;

      case 'range':
        if (condition.range) {
          return value >= condition.range[0] && value <= condition.range[1];
        }
        break;

      case 'absent':
        return isNaN(value) || value === 0;
    }

    return false;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getPendingAlerts(): Alert[] {
    return Array.from(this.pendingAlerts.values()).map(p => p.alert);
  }
}

// ==================== 告警管理器 ====================

export interface NotificationChannel {
  name: string;
  send(alert: Alert): Promise<void>;
}

export class AlertManager {
  private channels = new Map<string, NotificationChannel>();
  private routes: {
    match?: Record<string, string>;
    severity?: AlertSeverity[];
    channels: string[];
  }[] = [];
  private silences: {
    id: string;
    matchers: Record<string, string>;
    startsAt: number;
    endsAt: number;
  }[] = [];
  private history: Alert[] = [];

  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  addRoute(route: { match?: Record<string, string>; severity?: AlertSeverity[]; channels: string[] }): void {
    this.routes.push(route);
  }

  /**
   * 创建静默
   */
  addSilence(matchers: Record<string, string>, durationMs: number): string {
    const id = `silence-${Date.now()}`;
    const now = Date.now();

    this.silences.push({
      id,
      matchers,
      startsAt: now,
      endsAt: now + durationMs
    });

    return id;
  }

  removeSilence(id: string): void {
    this.silences = this.silences.filter(s => s.id !== id);
  }

  /**
   * 处理告警
   */
  async handleAlert(alert: Alert): Promise<void> {
    // 检查是否被静默
    if (this.isSilenced(alert)) {
      console.log(`[AlertManager] Alert ${alert.name} is silenced`);
      return;
    }

    // 记录历史
    this.history.push({ ...alert });

    // 路由到通知渠道
    const targetChannels = this.routeAlert(alert);

    for (const channelName of targetChannels) {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          await channel.send(alert);
        } catch (error) {
          console.error(`[AlertManager] Failed to send via ${channelName}:`, error);
        }
      }
    }
  }

  private isSilenced(alert: Alert): boolean {
    const now = Date.now();

    for (const silence of this.silences) {
      if (now < silence.startsAt || now > silence.endsAt) continue;

      const matches = Object.entries(silence.matchers).every(([key, value]) => {
        if (key === 'alertname') return alert.name === value;
        return alert.labels[key] === value;
      });

      if (matches) return true;
    }

    return false;
  }

  private routeAlert(alert: Alert): string[] {
    const channels = new Set<string>();

    for (const route of this.routes) {
      // 检查严重级别匹配
      if (route.severity && !route.severity.includes(alert.severity)) {
        continue;
      }

      // 检查标签匹配
      if (route.match) {
        const matches = Object.entries(route.match).every(([key, value]) => {
          return alert.labels[key] === value;
        });
        if (!matches) continue;
      }

      // 添加渠道
      for (const ch of route.channels) {
        channels.add(ch);
      }
    }

    return Array.from(channels);
  }

  getHistory(): Alert[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

// ==================== 通知渠道实现 ====================

export class ConsoleChannel implements NotificationChannel {
  name = 'console';

  async send(alert: Alert): Promise<void> {
    const emoji = {
      [AlertSeverity.CRITICAL]: '🔴',
      [AlertSeverity.WARNING]: '🟡',
      [AlertSeverity.INFO]: '🔵'
    };

    console.log(
      `${emoji[alert.severity]} [${alert.severity.toUpperCase()}] ${alert.name}\n` +
      `   State: ${alert.state}\n` +
      `   Value: ${alert.value}\n` +
      `   Labels: ${JSON.stringify(alert.labels)}\n` +
      `   ${alert.annotations.summary || ''}`
    );
  }
}

export class WebhookChannel implements NotificationChannel {
  name: string;

  constructor(
    name: string,
    private url: string
  ) {
    this.name = name;
  }

  async send(alert: Alert): Promise<void> {
    console.log(`[WebhookChannel:${this.name}] Sending to ${this.url}`);
    console.log('  Payload:', JSON.stringify(alert, null, 2));
    // 实际实现中会发送 HTTP 请求
  }
}

export class EmailChannel implements NotificationChannel {
  name: string;

  constructor(
    name: string,
    private to: string[],
    private from: string
  ) {
    this.name = name;
  }

  async send(alert: Alert): Promise<void> {
    console.log(`[EmailChannel:${this.name}] Sending email`);
    console.log(`  From: ${this.from}`);
    console.log(`  To: ${this.to.join(', ')}`);
    console.log(`  Subject: [${alert.severity.toUpperCase()}] ${alert.name}`);
  }
}

// ==================== 告警模板 ====================

export class AlertTemplate {
  static format(alert: Alert, format: 'markdown' | 'text' | 'html' = 'text'): string {
    switch (format) {
      case 'markdown':
        return this.toMarkdown(alert);
      case 'html':
        return this.toHTML(alert);
      default:
        return this.toText(alert);
    }
  }

  private static toText(alert: Alert): string {
    return `[${alert.severity.toUpperCase()}] ${alert.name}
State: ${alert.state}
Value: ${alert.value}
Started: ${new Date(alert.startsAt).toISOString()}
Labels: ${JSON.stringify(alert.labels)}
${alert.annotations.description || ''}`;
  }

  private static toMarkdown(alert: Alert): string {
    const emoji = {
      [AlertSeverity.CRITICAL]: '🔴',
      [AlertSeverity.WARNING]: '🟡',
      [AlertSeverity.INFO]: '🔵'
    };

    return `## ${emoji[alert.severity]} ${alert.name}

**Severity:** ${alert.severity}
**State:** ${alert.state}
**Value:** ${alert.value}
**Started:** ${new Date(alert.startsAt).toISOString()}

### Labels
${Object.entries(alert.labels).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Description
${alert.annotations.description || 'N/A'}
`;
  }

  private static toHTML(alert: Alert): string {
    return `<div class="alert alert-${alert.severity}">
  <h3>${alert.name}</h3>
  <p><strong>Severity:</strong> ${alert.severity}</p>
  <p><strong>State:</strong> ${alert.state}</p>
  <p><strong>Value:</strong> ${alert.value}</p>
  <p>${alert.annotations.description || ''}</p>
</div>`;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 告警系统 ===\n');

  // 创建告警规则
  console.log('--- 告警规则定义 ---');
  const evaluator = new AlertEvaluator();

  evaluator.addRule({
    id: 'high-cpu-usage',
    name: 'High CPU Usage',
    description: 'CPU usage is above 80% for more than 5 minutes',
    severity: AlertSeverity.WARNING,
    condition: {
      type: 'threshold',
      metric: 'cpu_usage_percent',
      operator: 'gt',
      value: 80
    },
    for: 5 * 60 * 1000, // 5 minutes
    labels: { team: 'sre', service: 'api-gateway' },
    annotations: {
      summary: 'High CPU usage detected',
      description: 'CPU usage has been above 80% for 5 minutes'
    },
    group: 'infrastructure'
  });

  evaluator.addRule({
    id: 'memory-pressure',
    name: 'Memory Pressure',
    description: 'Memory usage is critically high',
    severity: AlertSeverity.CRITICAL,
    condition: {
      type: 'threshold',
      metric: 'memory_usage_percent',
      operator: 'gt',
      value: 95
    },
    for: 0, // 立即触发
    labels: { team: 'sre', service: 'database' },
    annotations: {
      summary: 'Critical memory pressure',
      description: 'Memory usage is above 95%'
    }
  });

  // 模拟指标评估
  console.log('\n--- 告警评估 ---');
  const metrics = new Map<string, number>([
    ['cpu_usage_percent', 85],
    ['memory_usage_percent', 97]
  ]);

  const alerts = evaluator.evaluateAll(metrics);
  console.log('Generated alerts:', alerts.length);

  for (const alert of alerts) {
    console.log(`  ${alert.name}: ${alert.state}`);
  }

  // 告警管理
  console.log('\n--- 告警管理 ---');
  const alertManager = new AlertManager();

  // 添加通知渠道
  alertManager.addChannel(new ConsoleChannel());
  alertManager.addChannel(new WebhookChannel('slack', 'https://hooks.slack.com/alerts'));
  alertManager.addChannel(new EmailChannel('oncall', ['oncall@example.com'], 'alerts@example.com'));

  // 配置路由
  alertManager.addRoute({
    severity: [AlertSeverity.CRITICAL],
    channels: ['console', 'slack', 'oncall']
  });

  alertManager.addRoute({
    severity: [AlertSeverity.WARNING],
    channels: ['console', 'slack']
  });

  // 处理告警
  for (const alert of alerts) {
    alertManager.handleAlert(alert);
  }

  // 静默测试
  console.log('\n--- 告警静默 ---');
  const silenceId = alertManager.addSilence(
    { service: 'database' },
    60 * 60 * 1000 // 1 hour
  );
  console.log('Created silence:', silenceId);

  // 创建新告警（应该被静默）
  const dbAlert: Alert = {
    id: 'test-db-alert',
    ruleId: 'test',
    name: 'Database Slow Query',
    state: AlertState.FIRING,
    severity: AlertSeverity.WARNING,
    value: 10,
    labels: { service: 'database' },
    annotations: {},
    startsAt: Date.now()
  };

  alertManager.handleAlert(dbAlert);

  // 模板演示
  console.log('\n--- 告警模板 ---');
  if (alerts.length > 0) {
    console.log('Text format:');
    console.log(AlertTemplate.format(alerts[0], 'text'));
    
    console.log('\nMarkdown format:');
    console.log(AlertTemplate.format(alerts[0], 'markdown'));
  }
}
