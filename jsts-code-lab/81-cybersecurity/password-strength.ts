/**
 * @file 密码强度检查器
 * @category Cybersecurity → Password Security
 * @difficulty medium
 * @tags password-strength, entropy, zxcvbn, security-policy
 *
 * @description
 * 实现多维度密码强度评估器，包含：
 * - 长度、字符种类、模式检测
 * - 熵值计算（信息论）
 * - 常见弱密码字典匹配
 * - 可配置的安全策略校验
 */

/** 密码强度等级 */
export type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

/** 字符种类计数 */
export interface CharacterCounts {
  /** 小写字母数量 */
  lowercase: number;
  /** 大写字母数量 */
  uppercase: number;
  /** 数字数量 */
  digits: number;
  /** 特殊符号数量 */
  symbols: number;
  /** 中间数字/符号数量 */
  middleChars: number;
}

/** 密码强度分析结果 */
export interface PasswordAnalysis {
  /** 原始密码长度 */
  length: number;
  /** 字符种类统计 */
  characterCounts: CharacterCounts;
  /** 字符种类数（小写/大写/数字/符号） */
  char Variety: number;
  /** 熵值（bits） */
  entropy: number;
  /** 强度等级 */
  strength: StrengthLevel;
  /** 分数（0-100） */
  score: number;
  /** 警告信息 */
  warnings: string[];
  /** 改进建议 */
  suggestions: string[];
}

/** 安全策略配置 */
export interface SecurityPolicy {
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 要求小写字母 */
  requireLowercase?: boolean;
  /** 要求大写字母 */
  requireUppercase?: boolean;
  /** 要求数字 */
  requireDigits?: boolean;
  /** 要求特殊符号 */
  requireSymbols?: boolean;
  /** 最小熵值要求 */
  minEntropy?: number;
  /** 禁止的常见弱密码列表 */
  forbiddenPasswords?: string[];
}

/** 常见弱密码字典（内置示例） */
const COMMON_PASSWORDS: readonly string[] = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'letmein', 'dragon', '111111', 'baseball',
  'iloveyou', 'trustno1', 'sunshine', 'princess', 'admin',
  'welcome', 'shadow', 'ashley', 'football', 'jesus',
  'michael', 'ninja', 'mustang', 'password1', '123456789',
  'adobe123', 'admin123', 'root', 'toor', 'guest',
  'default', 'changeme', 'p@ssw0rd', 'passw0rd', 'qwerty123'
];

/** 键盘连续模式（简化版） */
const KEYBOARD_SEQUENCES: readonly string[] = [
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '1234567890', '0987654321', 'qwerty', 'asdf', 'zxcv'
];

/** 重复模式正则 */
const REPEAT_PATTERNS = [
  /(.){2,}/, // 相同字符重复3次及以上
  /(012|123|234|345|456|567|678|789|890)/, // 连续数字
  /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // 连续字母
];

/**
 * 密码强度检查器
 *
 * 基于 NIST SP 800-63B 和现代密码学最佳实践，
 * 综合评估密码的抵抗暴力破解和字典攻击的能力。
 */
export class PasswordStrengthChecker {
  private readonly policy: Required<SecurityPolicy>;

  constructor(policy: SecurityPolicy = {}) {
    this.policy = {
      minLength: policy.minLength ?? 8,
      maxLength: policy.maxLength ?? 128,
      requireLowercase: policy.requireLowercase ?? true,
      requireUppercase: policy.requireUppercase ?? true,
      requireDigits: policy.requireDigits ?? true,
      requireSymbols: policy.requireSymbols ?? false,
      minEntropy: policy.minEntropy ?? 30,
      forbiddenPasswords: policy.forbiddenPasswords ?? [...COMMON_PASSWORDS],
    };
  }

  /**
   * 分析密码强度
   * @param password - 待分析的密码
   * @returns 密码分析结果
   */
  analyze(password: string): PasswordAnalysis {
    if (typeof password !== 'string') {
      throw new TypeError('Password must be a string');
    }

    const counts = this.countCharacters(password);
    const variety = this.calculateVariety(counts);
    const entropy = this.calculateEntropy(password, variety);
    const { warnings, suggestions } = this.generateFeedback(password, counts, entropy);
    const score = this.calculateScore(password, counts, entropy, warnings.length);
    const strength = this.scoreToStrength(score);

    return {
      length: password.length,
      characterCounts: counts,
      charVariety: variety,
      entropy,
      strength,
      score,
      warnings,
      suggestions,
    };
  }

  /**
   * 检查密码是否符合安全策略
   * @param password - 待检查的密码
   * @returns 是否通过策略检查
   */
  checkPolicy(password: string): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    const analysis = this.analyze(password);

    if (password.length < this.policy.minLength) {
      violations.push(`密码长度至少需要 ${this.policy.minLength} 个字符`);
    }

    if (password.length > this.policy.maxLength) {
      violations.push(`密码长度不能超过 ${this.policy.maxLength} 个字符`);
    }

    if (this.policy.requireLowercase && analysis.characterCounts.lowercase === 0) {
      violations.push('密码必须包含小写字母');
    }

    if (this.policy.requireUppercase && analysis.characterCounts.uppercase === 0) {
      violations.push('密码必须包含大写字母');
    }

    if (this.policy.requireDigits && analysis.characterCounts.digits === 0) {
      violations.push('密码必须包含数字');
    }

    if (this.policy.requireSymbols && analysis.characterCounts.symbols === 0) {
      violations.push('密码必须包含特殊符号');
    }

    if (analysis.entropy < this.policy.minEntropy) {
      violations.push(`密码熵值需要至少 ${this.policy.minEntropy} bits`);
    }

    const lowerPassword = password.toLowerCase();
    if (this.policy.forbiddenPasswords.some(p => lowerPassword === p.toLowerCase())) {
      violations.push('密码过于常见，容易被字典攻击破解');
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * 估算破解所需时间（简化模型）
   * @param password - 密码
   * @param guessesPerSecond - 每秒猜测次数（默认 10^10，代表高端GPU集群）
   */
  estimateCrackTime(password: string, guessesPerSecond = 1e10): {
    onlineThrottled: string;
    onlineUnthrottled: string;
    offlineSlowHash: string;
    offlineFastHash: string;
  } {
    const analysis = this.analyze(password);
    const combinations = Math.pow(analysis.charVariety, password.length);
    const seconds = combinations / guessesPerSecond;

    const format = (s: number): string => {
      if (s < 1) return '瞬间';
      if (s < 60) return `${Math.ceil(s)} 秒`;
      if (s < 3600) return `${Math.ceil(s / 60)} 分钟`;
      if (s < 86400) return `${Math.ceil(s / 3600)} 小时`;
      if (s < 31536000) return `${Math.ceil(s / 86400)} 天`;
      if (s < 3153600000) return `${Math.ceil(s / 31536000)} 年`;
      return '数个世纪';
    };

    return {
      onlineThrottled: format(seconds / 100), // 100 guesses/sec
      onlineUnthrottled: format(seconds / 10000), // 10k guesses/sec
      offlineSlowHash: format(seconds / 1e7), // 10M guesses/sec
      offlineFastHash: format(seconds), // 10B guesses/sec
    };
  }

  private countCharacters(password: string): CharacterCounts {
    let lowercase = 0;
    let uppercase = 0;
    let digits = 0;
    let symbols = 0;
    let middleChars = 0;

    for (let i = 0; i < password.length; i++) {
      const ch = password[i];
      const code = ch.charCodeAt(0);

      if (code >= 97 && code <= 122) lowercase++;
      else if (code >= 65 && code <= 90) uppercase++;
      else if (code >= 48 && code <= 57) {
        if (i > 0 && i < password.length - 1) middleChars++;
        digits++;
      } else {
        if (i > 0 && i < password.length - 1) middleChars++;
        symbols++;
      }
    }

    return { lowercase, uppercase, digits, symbols, middleChars };
  }

  private calculateVariety(counts: CharacterCounts): number {
    let variety = 0;
    if (counts.lowercase > 0) variety += 26;
    if (counts.uppercase > 0) variety += 26;
    if (counts.digits > 0) variety += 10;
    if (counts.symbols > 0) variety += 33;
    return variety || 1;
  }

  private calculateEntropy(password: string, variety: number): number {
    // 基础熵 = log2(字符集大小 ^ 长度)
    let entropy = password.length * Math.log2(variety);

    // 惩罚项：常见模式降低熵
    const lower = password.toLowerCase();

    for (const seq of KEYBOARD_SEQUENCES) {
      if (seq.includes(lower) || lower.includes(seq)) {
        entropy *= 0.7;
        break;
      }
    }

    for (const pattern of REPEAT_PATTERNS) {
      if (pattern.test(password)) {
        entropy *= 0.8;
        break;
      }
    }

    // 重复字符惩罚
    const uniqueChars = new Set(password).size;
    if (uniqueChars < password.length / 2) {
      entropy *= 0.6;
    }

    return Math.round(entropy * 10) / 10;
  }

  private generateFeedback(
    password: string,
    counts: CharacterCounts,
    entropy: number
  ): { warnings: string[]; suggestions: string[] } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (password.length < 8) {
      warnings.push('密码长度过短');
      suggestions.push('使用至少 8 个字符');
    } else if (password.length < 12) {
      suggestions.push('考虑使用 12 个或更多字符以获得更高安全性');
    }

    if (counts.lowercase === 0) suggestions.push('添加小写字母');
    if (counts.uppercase === 0) suggestions.push('添加大写字母');
    if (counts.digits === 0) suggestions.push('添加数字');
    if (counts.symbols === 0) suggestions.push('添加特殊符号（如 !@#$%）');

    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(p => lowerPassword.includes(p))) {
      warnings.push('密码包含常见弱密码模式');
      suggestions.push('避免使用常见单词和连续字符');
    }

    if (entropy < 30) {
      warnings.push('密码熵值过低，容易被暴力破解');
    }

    if (counts.middleChars === 0) {
      suggestions.push('将数字和符号放在密码中间位置');
    }

    return { warnings, suggestions };
  }

  private calculateScore(
    password: string,
    counts: CharacterCounts,
    entropy: number,
    warningCount: number
  ): number {
    let score = 0;

    // 长度分（最多40分）
    score += Math.min(password.length * 4, 40);

    // 字符种类分（每种10分）
    if (counts.lowercase > 0) score += 10;
    if (counts.uppercase > 0) score += 10;
    if (counts.digits > 0) score += 10;
    if (counts.symbols > 0) score += 10;

    // 中间字符分（5分）
    if (counts.middleChars > 0) score += 5;

    // 熵值分（最多25分）
    score += Math.min(entropy, 25);

    // 惩罚
    score -= warningCount * 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private scoreToStrength(score: number): StrengthLevel {
    if (score < 20) return 'very-weak';
    if (score < 40) return 'weak';
    if (score < 60) return 'fair';
    if (score < 80) return 'strong';
    return 'very-strong';
  }
}

/**
 * 快速检查密码强度（便捷函数）
 * @param password - 密码
 * @returns 强度等级和分数
 */
export function quickCheck(password: string): { strength: StrengthLevel; score: number; entropy: number } {
  const checker = new PasswordStrengthChecker();
  const result = checker.analyze(password);
  return {
    strength: result.strength,
    score: result.score,
    entropy: result.entropy,
  };
}

export function demo(): void {
  console.log('=== 密码强度检查器 ===\n');

  const checker = new PasswordStrengthChecker();
  const passwords = ['123456', 'password', 'Hello1', 'MyS3cur3!P@ss', 'Tr0ub4dor&3', 'correct-horse-battery-staple!'];

  for (const pwd of passwords) {
    const analysis = checker.analyze(pwd);
    const crackTime = checker.estimateCrackTime(pwd);
    console.log(`密码: "${pwd}"`);
    console.log(`  长度: ${analysis.length}, 种类: ${analysis.charVariety}, 熵值: ${analysis.entropy} bits`);
    console.log(`  强度: ${analysis.strength} (${analysis.score}/100)`);
    console.log(`  破解时间(离线快速哈希): ${crackTime.offlineFastHash}`);
    if (analysis.warnings.length > 0) {
      console.log(`  警告: ${analysis.warnings.join(', ')}`);
    }
    console.log('');
  }

  const policyCheck = checker.checkPolicy('MyS3cur3!P@ss');
  console.log('策略检查 "MyS3cur3!P@ss":', policyCheck.valid ? '通过' : '失败');
  if (!policyCheck.valid) {
    console.log('  违规项:', policyCheck.violations.join('; '));
  }
}
