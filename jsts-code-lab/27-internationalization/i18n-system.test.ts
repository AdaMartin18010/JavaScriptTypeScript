import { describe, it, expect } from 'vitest';
import { PluralRules, I18nManager, createI18nComposable } from './i18n-system.js';

describe('PluralRules', () => {
  it('returns categories for English', () => {
    expect(PluralRules.getPluralCategory('en', 1)).toBe('one');
    expect(PluralRules.getPluralCategory('en', 5)).toBe('other');
  });

  it('returns forms for languages', () => {
    expect(PluralRules.getPluralForms('zh')).toEqual(['other']);
    expect(PluralRules.getPluralForms('ar')).toContain('zero');
  });
});

describe('I18nManager', () => {
  it('translates and falls back', () => {
    const i18n = new I18nManager();
    i18n.addTranslations('en', { hello: 'Hello {{name}}!' });
    i18n.addTranslations('fr', { hello: 'Bonjour {{name}}!' });
    i18n.setLocale('fr');
    expect(i18n.t('hello', { name: 'World' })).toBe('Bonjour World!');
    expect(i18n.t('missing')).toBe('missing');
  });

  it('handles plural translation', () => {
    const i18n = new I18nManager();
    i18n.addTranslations('en', { items: { one: 'One item', other: '{{count}} items' } });
    i18n.setLocale('en');
    expect(i18n.tp('items', 1)).toBe('One item');
    expect(i18n.tp('items', 5)).toBe('5 items');
  });

  it('formats dates, numbers, currency, relative time', () => {
    const i18n = new I18nManager();
    i18n.setLocale('en');
    const date = new Date(2024, 0, 1);
    expect(i18n.formatDate(date, { year: 'numeric' })).toContain('2024');
    expect(i18n.formatNumber(1234.5)).toContain('1,234.5');
    expect(i18n.formatCurrency(100, 'USD')).toContain('$');
    expect(i18n.formatRelativeTime(-1, 'day')).toContain('day');
  });

  it('notifies locale changes', () => {
    const i18n = new I18nManager();
    const changes: string[] = [];
    const unsub = i18n.onLocaleChange((l: any) => changes.push(l));
    i18n.setLocale('de');
    unsub();
    i18n.setLocale('fr');
    expect(changes).toEqual(['de']);
  });
});

describe('createI18nComposable', () => {
  it('exposes helpers', () => {
    const i18n = new I18nManager();
    const c = createI18nComposable(i18n);
    expect(c.locale()).toBe('en');
    c.setLocale('ja');
    expect(c.locale()).toBe('ja');
  });
});
