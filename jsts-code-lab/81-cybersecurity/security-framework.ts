/**
 * @file 安全框架
 * @category Cybersecurity → Framework
 * @difficulty hard
 * @tags security, threat-modeling, vulnerability-scanning, intrusion-detection
 */

// 威胁建模
export interface Threat {
  id: string;
  name: string;
  category: 'spoofing' | 'tampering' | 'repudiation' | 'information-disclosure' | 'denial-of-service' | 'elevation-of-privilege';
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: number; // 0-1
  impact: number; // 0-1
  mitigations: string[];
}

export class ThreatModel {
  private threats: Threat[] = [];
  private assets: string[] = [];
  
  addAsset(name: string): void {
    this.assets.push(name);
  }
  
  addThreat(threat: Threat): void {
    this.threats.push(threat);
  }
  
  // 风险评分 = 可能性 × 影响
  calculateRiskScore(threat: Threat): number {
    return threat.likelihood * threat.impact;
  }
  
  getRiskMatrix(): Array<Threat & { riskScore: number }> {
    return this.threats
      .map(t => ({ ...t, riskScore: this.calculateRiskScore(t) }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }
  
  // STRIDE威胁识别
  identifyThreatsFromStride(): Threat[] {
    const strideThreats: Threat[] = [
      {
        id: 'T001',
        name: '身份欺骗',
        category: 'spoofing',
        severity: 'high',
        likelihood: 0.6,
        impact: 0.8,
        mitigations: ['多因素认证', '会话管理']
      },
      {
        id: 'T002',
        name: '数据篡改',
        category: 'tampering',
        severity: 'critical',
        likelihood: 0.4,
        impact: 0.9,
        mitigations: ['数字签名', '完整性校验']
      },
      {
        id: 'T003',
        name: '否认操作',
        category: 'repudiation',
        severity: 'medium',
        likelihood: 0.5,
        impact: 0.6,
        mitigations: ['审计日志', '不可抵赖性']
      }
    ];
    
    return strideThreats;
  }
}

// 漏洞扫描器
export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cwe?: string;
  location: string;
  recommendation: string;
}

export class VulnerabilityScanner {
  private rules: Array<{ name: string; pattern: RegExp; check: (code: string) => boolean }> = [];
  
  constructor() {
    this.initializeRules();
  }
  
  private initializeRules(): void {
    // SQL注入检测
    this.rules.push({
      name: 'SQL Injection',
      pattern: /query\s*\(\s*[`"'].*\$\{/,
      check: (code) => this.rules[0].pattern.test(code)
    });
    
    // XSS检测
    this.rules.push({
      name: 'Cross-Site Scripting (XSS)',
      pattern: /innerHTML\s*=.*\+/,
      check: (code) => this.rules[1].pattern.test(code)
    });
    
    // 硬编码密钥
    this.rules.push({
      name: 'Hardcoded Secret',
      pattern: /(password|secret|key|token)\s*[=:]\s*["'][^"']{8,}["']/i,
      check: (code) => this.rules[2].pattern.test(code)
    });
    
    // 不安全的随机数
    this.rules.push({
      name: 'Insecure Randomness',
      pattern: /Math\.random\(\)/,
      check: (code) => this.rules[3].pattern.test(code)
    });
  }
  
  scan(code: string, filePath: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    
    const checks: Array<{ name: string; severity: Vulnerability['severity']; pattern: RegExp; cwe: string; recommendation: string }> = [
      {
        name: 'SQL Injection',
        severity: 'critical',
        pattern: /query\s*\(\s*[`"'].*\$\{/,
        cwe: 'CWE-89',
        recommendation: '使用参数化查询或ORM'
      },
      {
        name: 'Cross-Site Scripting',
        severity: 'high',
        pattern: /innerHTML\s*=.*\+/,
        cwe: 'CWE-79',
        recommendation: '使用textContent或sanitize HTML'
      },
      {
        name: 'Hardcoded Secret',
        severity: 'high',
        pattern: /(password|secret|key|token)\s*[=:]\s*["'][^"']{8,}["']/i,
        cwe: 'CWE-798',
        recommendation: '使用环境变量或密钥管理服务'
      },
      {
        name: 'Insecure Randomness',
        severity: 'medium',
        pattern: /Math\.random\(\)/,
        cwe: 'CWE-338',
        recommendation: '使用crypto.getRandomValues()用于安全目的'
      }
    ];
    
    for (const check of checks) {
      if (check.pattern.test(code)) {
        vulnerabilities.push({
          id: `VULN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          name: check.name,
          description: `Detected potential ${check.name} vulnerability`,
          severity: check.severity,
          cwe: check.cwe,
          location: filePath,
          recommendation: check.recommendation
        });
      }
    }
    
    return vulnerabilities;
  }
  
  scanDependencies(dependencies: Record<string, string>): Array<{ package: string; version: string; issues: string[] }> {
    const knownVulnerabilities: Record<string, string[]> = {
      'lodash': ['Prototype Pollution in versions < 4.17.19'],
      'express': ['Open redirect in versions < 4.17.1'],
      'axios': ['SSRF vulnerability in versions < 0.21.1']
    };
    
    const results: Array<{ package: string; version: string; issues: string[] }> = [];
    
    for (const [pkg, version] of Object.entries(dependencies)) {
      if (knownVulnerabilities[pkg]) {
        results.push({ package: pkg, version, issues: knownVulnerabilities[pkg] });
      }
    }
    
    return results;
  }
}

// 入侵检测系统 (IDS)
export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'authentication' | 'authorization' | 'data-access' | 'network';
  severity: 'info' | 'warning' | 'critical';
  source: string;
  details: Record<string, unknown>;
}

export class IntrusionDetectionSystem {
  private events: SecurityEvent[] = [];
  private rules: Array<{ name: string; condition: (event: SecurityEvent) => boolean; severity: SecurityEvent['severity'] }> = [];
  private alerts: SecurityEvent[] = [];
  
  constructor() {
    this.initializeRules();
  }
  
  private initializeRules(): void {
    // 多次登录失败
    this.rules.push({
      name: 'Multiple Failed Logins',
      condition: (event) => {
        if (event.type !== 'authentication') return false;
        const recentEvents = this.getRecentEvents(300000); // 5分钟
        const failedLogins = recentEvents.filter(e => 
          e.type === 'authentication' && 
          e.details.success === false &&
          e.source === event.source
        );
        return failedLogins.length >= 5;
      },
      severity: 'warning'
    });
    
    // 异常时间访问
    this.rules.push({
      name: 'After Hours Access',
      condition: (event) => {
        const hour = new Date(event.timestamp).getHours();
        return hour < 6 || hour > 22; // 晚上10点后或早上6点前
      },
      severity: 'info'
    });
    
    // 敏感数据批量访问
    this.rules.push({
      name: 'Bulk Data Access',
      condition: (event) => {
        if (event.type !== 'data-access') return false;
        const recentEvents = this.getRecentEvents(60000); // 1分钟
        const dataAccess = recentEvents.filter(e => 
          e.type === 'data-access' && 
          e.source === event.source
        );
        return dataAccess.length > 100;
      },
      severity: 'critical'
    });
  }
  
  recordEvent(event: Omit<SecurityEvent, 'id'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
    };
    
    this.events.push(fullEvent);
    
    // 检查规则
    for (const rule of this.rules) {
      if (rule.condition(fullEvent)) {
        this.alerts.push({
          ...fullEvent,
          severity: rule.severity,
          details: { ...fullEvent.details, alertRule: rule.name }
        });
        console.log(`[IDS Alert] ${rule.name} triggered by ${fullEvent.source}`);
      }
    }
    
    // 清理旧事件
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }
  
  getRecentEvents(milliseconds: number): SecurityEvent[] {
    const cutoff = Date.now() - milliseconds;
    return this.events.filter(e => e.timestamp >= cutoff);
  }
  
  getAlerts(severity?: SecurityEvent['severity']): SecurityEvent[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return [...this.alerts];
  }
  
  // 异常检测（基于统计）
  detectAnomalies(): Array<{ type: string; description: string; confidence: number }> {
    const anomalies: Array<{ type: string; description: string; confidence: number }> = [];
    
    // 检测流量异常
    const eventsByHour = new Map<number, number>();
    for (const event of this.events) {
      const hour = new Date(event.timestamp).getHours();
      eventsByHour.set(hour, (eventsByHour.get(hour) || 0) + 1);
    }
    
    const avgEvents = Array.from(eventsByHour.values()).reduce((a, b) => a + b, 0) / 24;
    
    for (const [hour, count] of eventsByHour) {
      if (count > avgEvents * 3) {
        anomalies.push({
          type: 'Traffic Spike',
          description: `Unusual activity at hour ${hour}: ${count} events (avg: ${avgEvents.toFixed(1)})`,
          confidence: 0.85
        });
      }
    }
    
    return anomalies;
  }
}

// 安全审计
export class SecurityAuditor {
  private auditLog: Array<{ timestamp: number; action: string; user: string; result: string }> = [];
  
  log(action: string, user: string, result: string): void {
    this.auditLog.push({
      timestamp: Date.now(),
      action,
      user,
      result
    });
  }
  
  generateReport(startTime: number, endTime: number): {
    totalActions: number;
    failedActions: number;
    uniqueUsers: number;
    suspiciousActivities: string[];
  } {
    const relevant = this.auditLog.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    
    const failedActions = relevant.filter(e => e.result !== 'success');
    const uniqueUsers = new Set(relevant.map(e => e.user)).size;
    
    // 识别可疑活动
    const suspicious: string[] = [];
    const userActions = new Map<string, number>();
    
    for (const entry of relevant) {
      userActions.set(entry.user, (userActions.get(entry.user) || 0) + 1);
    }
    
    for (const [user, count] of userActions) {
      if (count > 100) {
        suspicious.push(`${user} performed ${count} actions`);
      }
    }
    
    return {
      totalActions: relevant.length,
      failedActions: failedActions.length,
      uniqueUsers,
      suspiciousActivities: suspicious
    };
  }
}

export function demo(): void {
  console.log('=== 网络安全 ===\n');
  
  // 威胁建模
  console.log('--- 威胁建模 ---');
  const threatModel = new ThreatModel();
  threatModel.addAsset('用户数据库');
  threatModel.addAsset('支付系统');
  
  const strideThreats = threatModel.identifyThreatsFromStride();
  for (const threat of strideThreats) {
    threatModel.addThreat(threat);
  }
  
  console.log('风险矩阵:');
  const riskMatrix = threatModel.getRiskMatrix();
  for (const threat of riskMatrix) {
    console.log(`  ${threat.name}: 风险评分=${threat.riskScore.toFixed(2)}, 严重度=${threat.severity}`);
  }
  
  // 漏洞扫描
  console.log('\n--- 漏洞扫描 ---');
  const scanner = new VulnerabilityScanner();
  
  const vulnerableCode = `
    function login(username, password) {
      const query = \`SELECT * FROM users WHERE username = '\${username}'\`;
      db.query(query);
      
      const apiKey = "sk-live-1234567890abcdef";
      
      const token = Math.random().toString();
    }
  `;
  
  const vulnerabilities = scanner.scan(vulnerableCode, 'auth.js');
  console.log(`发现 ${vulnerabilities.length} 个漏洞:`);
  for (const vuln of vulnerabilities) {
    console.log(`  [${vuln.severity}] ${vuln.name} (${vuln.cwe})`);
    console.log(`    建议: ${vuln.recommendation}`);
  }
  
  // 入侵检测
  console.log('\n--- 入侵检测 ---');
  const ids = new IntrusionDetectionSystem();
  
  // 模拟多次登录失败
  for (let i = 0; i < 6; i++) {
    ids.recordEvent({
      timestamp: Date.now(),
      type: 'authentication',
      severity: 'info',
      source: '192.168.1.100',
      details: { success: false, username: 'admin' }
    });
  }
  
  console.log('告警数量:', ids.getAlerts().length);
  console.log('严重告警:', ids.getAlerts('warning').length);
  
  // 安全审计
  console.log('\n--- 安全审计 ---');
  const auditor = new SecurityAuditor();
  
  auditor.log('LOGIN', 'user1', 'success');
  auditor.log('VIEW_DATA', 'user1', 'success');
  auditor.log('DELETE_RECORD', 'user2', 'failure');
  auditor.log('LOGIN', 'attacker', 'failure');
  
  const report = auditor.generateReport(Date.now() - 86400000, Date.now());
  console.log('审计报告:', report);
}
