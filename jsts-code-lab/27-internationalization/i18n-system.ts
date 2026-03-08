/**
 * @file 国际化系统
 * @category Internationalization → i18n
 * @difficulty easy
 * @tags i18n, l10n, translation, locale
 * 
 * @description
 * 国际化实现：
 * - 翻译管理
 * - 复数规则
 * - 日期/数字格式化
 * - 语言切换
 */

// ============================================================================
// 1. 类型定义
// ============================================================================

export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

export interface LocaleConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimalSeparator: string;
    thousandSeparator: string;
    currencySymbol?: string;
  };
}

export interface InterpolationOptions {
  [key: string]: string | number;
}

// ============================================================================
// 2. 复数规则
// ============================================================================

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export class PluralRules {
  static getPluralCategory(locale: string, count: number): PluralCategory {
    const rules = new Intl.PluralRules(locale);
    return rules.select(count) as PluralCategory;
  }

  static getPluralForms(locale: string): PluralCategory[] {
    // 简化实现：返回该语言可能的所有复数形式
    const lang = locale.split('-')[0];
    
    switch (lang) {
      case 'zh':
      case 'ja':
      case 'ko':
        return ['other'];
      case 'en':
      case 'de':
        return ['one', 'other'];
      case 'ar':
        return ['zero', 'one', 'two', 'few', 'many', 'other'];
      case 'pl':
      case 'ru':
        return ['one', 'few', 'many'];
      default:
        return ['one', 'other'];
    }
  }
}

// ============================================================================
// 3. 翻译管理器
// ============================================================================

export class I18nManager {
  private translations: Map<string, TranslationDict> = new Map();
  private currentLocale: string = 'en';
  private fallbackLocale: string = 'en';
  private localeConfigs: Map<string, LocaleConfig> = new Map();
  private listeners: Set<(locale: string) => void> = new Set();

  // 注册语言包
  addTranslations(locale: string, translations: TranslationDict): void {
    const existing = this.translations.get(locale) || {};
    this.translations.set(locale, this.mergeDeep(existing, translations));
  }

  // 设置当前语言
  setLocale(locale: string): void {
    if (this.currentLocale === locale) return;
    
    this.currentLocale = locale;
    this.listeners.forEach(listener => listener(locale));
  }

  // 获取当前语言
  getLocale(): string {
    return this.currentLocale;
  }

  // 设置回退语言
  setFallbackLocale(locale: string): void {
    this.fallbackLocale = locale;
  }

  // 注册语言配置
  registerLocaleConfig(config: LocaleConfig): void {
    this.localeConfigs.set(config.code, config);
  }

  // 翻译
  t(key: string, options?: InterpolationOptions): string {
    let value = this.getNestedValue(this.translations.get(this.currentLocale), key);
    
    // 回退处理
    if (value === undefined && this.currentLocale !== this.fallbackLocale) {
      value = this.getNestedValue(this.translations.get(this.fallbackLocale), key);
    }
    
    if (value === undefined) {
      return key;
    }

    // 插值处理
    if (options && typeof value === 'string') {
      value = this.interpolate(value, options);
    }

    return value as string;
  }

  // 带复数的翻译
  tp(key: string, count: number, options?: InterpolationOptions): string {
    const category = PluralRules.getPluralCategory(this.currentLocale, count);
    const pluralKey = `${key}.${category}`;
    
    const translation = this.t(pluralKey, { ...options, count });
    
    // 如果没有找到特定复数形式，尝试默认
    if (translation === pluralKey) {
      return this.t(key, { ...options, count });
    }
    
    return translation;
  }

  // 订阅语言变化
  onLocaleChange(listener: (locale: string) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 获取支持的语言列表
  getSupportedLocales(): string[] {
    return Array.from(this.translations.keys());
  }

  // 格式化日期
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  // 格式化数字
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(num);
  }

  // 格式化货币
  formatCurrency(amount: number, currency?: string): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  // 格式化相对时间
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const formatter = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });
    return formatter.format(value, unit);
  }

  private getNestedValue(obj: TranslationDict | undefined, path: string): unknown {
    if (!obj) return undefined;
    
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj as unknown);
  }

  private interpolate(template: string, options: InterpolationOptions): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = options[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private mergeDeep(target: TranslationDict, source: TranslationDict): TranslationDict {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object') {
        result[key] = this.mergeDeep(
          (target[key] as TranslationDict) || {},
          source[key] as TranslationDict
        );
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}

// ============================================================================
// 4. Vue/React 集成（模拟）
// ============================================================================

export function createI18nComposable(i18n: I18nManager) {
  return {
    t: (key: string, options?: InterpolationOptions) => i18n.t(key, options),
    tp: (key: string, count: number, options?: InterpolationOptions) => i18n.tp(key, count, options),
    locale: () => i18n.getLocale(),
    setLocale: (locale: string) => i18n.setLocale(locale),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDate(date, options),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => i18n.formatNumber(num, options),
    formatCurrency: (amount: number, currency?: string) => i18n.formatCurrency(amount, currency)
  };
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 国际化系统 ===\n');

  const i18n = new I18nManager();

  // 注册语言包
  i18n.addTranslations('en', {
    hello: 'Hello, {{name}}!',
    goodbye: 'Goodbye',
    items: {
      zero: 'No items',
      one: 'One item',
      other: '{{count}} items'
    },
    nav: {
      home: 'Home',
      about: 'About',
      contact: 'Contact'
    }
  });

  i18n.addTranslations('zh', {
    hello: '你好, {{name}}!',
    goodbye: '再见',
    items: {
      other: '{{count}} 件商品'
    },
    nav: {
      home: '首页',
      about: '关于',
      contact: '联系我们'
    }
  });

  i18n.addTranslations('ar', {
    hello: 'مرحبا, {{name}}!',
    goodbye: 'وداعا'
  });

  console.log('1. 基本翻译');
  console.log('   English:', i18n.t('hello', { name: 'World' }));
  
  i18n.setLocale('zh');
  console.log('   Chinese:', i18n.t('hello', { name: '世界' }));
  
  i18n.setLocale('ar');
  console.log('   Arabic:', i18n.t('hello', { name: 'العالم' }));

  console.log('\n2. 嵌套翻译');
  i18n.setLocale('en');
  console.log('   English nav.home:', i18n.t('nav.home'));
  
  i18n.setLocale('zh');
  console.log('   Chinese nav.home:', i18n.t('nav.home'));

  console.log('\n3. 复数规则');
  i18n.setLocale('en');
  console.log('   0 items:', i18n.tp('items', 0));
  console.log('   1 item:', i18n.tp('items', 1));
  console.log('   5 items:', i18n.tp('items', 5));

  i18n.setLocale('zh');
  console.log('   中文 0:', i18n.tp('items', 0));
  console.log('   中文 5:', i18n.tp('items', 5));

  console.log('\n4. 日期格式化');
  const now = new Date();
  i18n.setLocale('en');
  console.log('   English:', i18n.formatDate(now, { dateStyle: 'full' }));
  
  i18n.setLocale('zh');
  console.log('   Chinese:', i18n.formatDate(now, { dateStyle: 'full' }));

  console.log('\n5. 数字格式化');
  const num = 1234567.89;
  i18n.setLocale('en');
  console.log('   English:', i18n.formatNumber(num));
  
  i18n.setLocale('de');
  console.log('   German:', i18n.formatNumber(num));

  console.log('\n6. 货币格式化');
  i18n.setLocale('en');
  console.log('   USD:', i18n.formatCurrency(1234.56, 'USD'));
  console.log('   EUR:', i18n.formatCurrency(1234.56, 'EUR'));
  console.log('   JPY:', i18n.formatCurrency(1234, 'JPY'));

  console.log('\n7. 相对时间');
  i18n.setLocale('en');
  console.log('   Yesterday:', i18n.formatRelativeTime(-1, 'day'));
  console.log('   Next week:', i18n.formatRelativeTime(1, 'week'));
  
  i18n.setLocale('zh');
  console.log('   昨天:', i18n.formatRelativeTime(-1, 'day'));
  console.log('   下周:', i18n.formatRelativeTime(1, 'week'));

  console.log('\n8. 语言切换监听');
  const unsubscribe = i18n.onLocaleChange((locale) => {
    console.log('   Locale changed to:', locale);
  });
  i18n.setLocale('en');
  unsubscribe();

  console.log('\n国际化要点:');
  console.log('- 使用 key-value 结构组织翻译');
  console.log('- 支持嵌套对象和插值');
  console.log('- 复数规则因语言而异');
  console.log('- 使用 Intl API 进行格式化');
  console.log('- RTL 语言需要特殊布局处理');
  console.log('- 回退机制确保可用性');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
