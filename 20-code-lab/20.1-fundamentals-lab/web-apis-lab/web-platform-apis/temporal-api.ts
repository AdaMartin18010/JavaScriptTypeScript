/**
 * # Temporal API 实践
 *
 * Temporal API 是 JavaScript 的现代化日期时间 API，旨在替代有缺陷的 `Date` 对象。
 * 2025 年进入 Stage 3，Chrome 144+ 和 Firefox 已支持。
 *
 * ## 为什么需要 Temporal？
 *
 * `Date` 对象的设计缺陷：
 * 1. 月份从 0 开始（1月 = 0）
 * 2. 年份处理混乱（getYear() 返回 1900 年以来的年数）
 * 3. 时区支持薄弱
 * 4. 不可变操作困难
 * 5. 解析行为不一致（Date.parse 各浏览器实现不同）
 *
 * Temporal 的设计原则：
 * 1. 不可变（所有操作返回新对象）
 * 2. 类型安全（PlainDate、PlainTime、ZonedDateTime 等明确区分）
 * 3. 纳秒精度（替代 Date 的毫秒精度）
 * 4. 完整的时区支持（IANA 时区数据库）
 * 5. 日历系统支持（ISO 8601、非格里高利历）
 */

// ============================================
// 核心类型概述
// ============================================

/**
 * Temporal 的核心类型：
 *
 * | 类型 | 描述 | 示例 |
 * |------|------|------|
 * | Temporal.Instant | 绝对时间点（无时区） | 2024-01-15T08:30:00Z |
 * | Temporal.PlainDate | 日历日期（无时区/时间） | 2024-01-15 |
 * | Temporal.PlainTime | 一天中的时间（无日期/时区） | 08:30:00 |
 * | Temporal.PlainDateTime | 日期+时间（无时区） | 2024-01-15T08:30:00 |
 * | Temporal.ZonedDateTime | 带时区的完整日期时间 | 2024-01-15T08:30:00+08:00[Asia/Shanghai] |
 * | Temporal.Duration | 时间间隔 | P1Y2M3DT4H5M6S |
 * | Temporal.PlainYearMonth | 年月 | 2024-01 |
 * | Temporal.PlainMonthDay | 月日 | 01-15 |
 */

// ============================================
// 由于 Temporal API 目前需要 polyfill，
// 本文件提供 API 使用模式和使用 @js-temporal/polyfill 的示例。
// ============================================

// 类型定义（基于 Temporal 提案规范）

export interface TemporalInstant {
  readonly epochMilliseconds: number;
  readonly epochNanoseconds: bigint;
  toString(options?: { timeZone?: string }): string;
  toZonedDateTimeISO(timeZone: string): TemporalZonedDateTime;
  add(duration: TemporalDuration): TemporalInstant;
  subtract(duration: TemporalDuration): TemporalInstant;
  until(other: TemporalInstant): TemporalDuration;
  since(other: TemporalInstant): TemporalDuration;
  round(options: { smallestUnit: string }): TemporalInstant;
  equals(other: TemporalInstant): boolean;
}

export interface TemporalPlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly dayOfWeek: number;
  readonly dayOfYear: number;
  readonly weekOfYear: number;
  readonly daysInMonth: number;
  readonly daysInYear: number;
  readonly inLeapYear: boolean;
  toString(): string;
  toPlainDateTime(time?: TemporalPlainTime): TemporalPlainDateTime;
  toZonedDateTime(options: { timeZone: string; plainTime?: TemporalPlainTime }): TemporalZonedDateTime;
  add(duration: TemporalDuration): TemporalPlainDate;
  subtract(duration: TemporalDuration): TemporalPlainDate;
  until(other: TemporalPlainDate): TemporalDuration;
  equals(other: TemporalPlainDate): boolean;
}

export interface TemporalPlainTime {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly microsecond: number;
  readonly nanosecond: number;
  toString(options?: { fractionalSecondDigits?: number }): string;
  add(duration: TemporalDuration): TemporalPlainTime;
  subtract(duration: TemporalDuration): TemporalPlainTime;
  round(options: { smallestUnit: string }): TemporalPlainTime;
}

export interface TemporalZonedDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly timeZoneId: string;
  readonly offset: string;
  readonly epochMilliseconds: number;
  toString(options?: { timeZoneName?: string }): string;
  toInstant(): TemporalInstant;
  toPlainDateTime(): TemporalPlainDateTime;
  toPlainDate(): TemporalPlainDate;
  add(duration: TemporalDuration): TemporalZonedDateTime;
  subtract(duration: TemporalDuration): TemporalZonedDateTime;
  with(options: Partial<{ year: number; month: number; day: number; hour: number; minute: number }>): TemporalZonedDateTime;
  withTimeZone(timeZone: string): TemporalZonedDateTime;
  startOfDay(): TemporalZonedDateTime;
  equals(other: TemporalZonedDateTime): boolean;
}

export interface TemporalDuration {
  readonly years: number;
  readonly months: number;
  readonly weeks: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  readonly microseconds: number;
  readonly nanoseconds: number;
  readonly sign: number;
  readonly blank: boolean;
  toString(): string;
  abs(): TemporalDuration;
  negated(): TemporalDuration;
  add(other: TemporalDuration): TemporalDuration;
  subtract(other: TemporalDuration): TemporalDuration;
  round(options: { smallestUnit: string }): TemporalDuration;
  total(options: { unit: string }): number;
}

// ============================================
// 使用模式示例
// ============================================

/**
 * 模式 1：创建日期时间
 *
 * Temporal 的工厂方法比 Date 更清晰：
 */
export const temporalPatterns = {
  /** 创建当前时间 */
  now: `
    // Date（旧）
    const now = new Date();
    
    // Temporal（新）
    const instant = Temporal.Now.instant();
    const zoned = Temporal.Now.zonedDateTimeISO('Asia/Shanghai');
    const plainDate = Temporal.Now.plainDateISO();
  `,

  /** 从字符串解析 */
  parse: `
    // Date（旧）- 解析行为不一致！
    const d = new Date('2024-01-15'); // 可能解析为 UTC 或本地时间
    
    // Temporal（新）- 明确、一致
    const date = Temporal.PlainDate.from('2024-01-15');
    const datetime = Temporal.PlainDateTime.from('2024-01-15T08:30:00');
    const zoned = Temporal.ZonedDateTime.from('2024-01-15T08:30:00+08:00[Asia/Shanghai]');
  `,

  /** 日期运算 */
  arithmetic: `
    // Date（旧）- 可变、易错
    const d = new Date(2024, 0, 15);
    d.setMonth(d.getMonth() + 1); // 修改原对象！
    
    // Temporal（新）- 不可变、链式
    const date = Temporal.PlainDate.from('2024-01-15');
    const nextMonth = date.add({ months: 1 }); // 返回新对象
    const nextWeek = date.add({ weeks: 1 });
    const lastYear = date.subtract({ years: 1 });
  `,

  /** 时间差计算 */
  difference: `
    // Date（旧）- 手动计算毫秒差
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-06-01');
    const diffMs = d2.getTime() - d1.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24); // 手动转换
    
    // Temporal（新）- 内置方法
    const start = Temporal.PlainDate.from('2024-01-01');
    const end = Temporal.PlainDate.from('2024-06-01');
    const duration = start.until(end); // P5M
    const days = duration.total({ unit: 'days' }); // 152
  `,

  /** 时区处理 */
  timezone: `
    // Date（旧）- 时区支持薄弱
    const d = new Date('2024-01-15T08:30:00');
    // 无法直接转换为其他时区！
    
    // Temporal（新）- 完整的时区支持
    const shanghai = Temporal.ZonedDateTime.from('2024-01-15T08:30:00+08:00[Asia/Shanghai]');
    const tokyo = shanghai.withTimeZone('Asia/Tokyo');     // 2024-01-15T09:30:00+09:00
    const newYork = shanghai.withTimeZone('America/New_York'); // 2024-01-14T19:30:00-05:00
    const utc = shanghai.toInstant(); // 2024-01-15T00:30:00Z
  `,

  /** 格式化 */
  formatting: `
    // Date（旧）- toLocaleString 各浏览器差异
    const d = new Date();
    d.toLocaleDateString('zh-CN'); // 依赖浏览器实现
    
    // Temporal（新）- 内置格式化
    const date = Temporal.PlainDate.from('2024-01-15');
    date.toLocaleString('zh-CN');           // 2024/1/15
    date.toLocaleString('zh-CN', { month: 'long', day: 'numeric' }); // 1月15日
  `,
} as const;

// ============================================
// 实际应用场景
// ============================================

/**
 * 场景 1：预约系统
 */
export function scheduleAppointment(options: {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timeZone: string; // IANA 时区
  durationMinutes: number;
}): {
  start: string;
  end: string;
  localTime: string;
  utcTime: string;
} {
  const { date, time, timeZone, durationMinutes } = options;

  // 创建带时区的日期时间
  const start = `${date}T${time}:00`;
  // 实际使用 Temporal:
  // const zoned = Temporal.ZonedDateTime.from(`${start}[${timeZone}]`);
  // const end = zoned.add({ minutes: durationMinutes });

  return {
    start: `${date} ${time}`,
    end: `${date} ${addMinutesToTime(time, durationMinutes)}`,
    localTime: `${date} ${time} (${timeZone})`,
    utcTime: `${date}T${time}:00Z`, // 简化版
  };
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * 场景 2：倒计时组件
 */
export function calculateCountdown(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// ============================================
// 从 Date 迁移到 Temporal 的指南
// ============================================

/**
 * Date → Temporal 映射表
 */
export const dateToTemporalMapping = {
  // 创建
  "new Date()": "Temporal.Now.instant()",
  "new Date(ms)": "Temporal.Instant.fromEpochMilliseconds(ms)",
  "new Date(string)": "Temporal.PlainDateTime.from(string) 或 Temporal.ZonedDateTime.from(string)",

  // 获取
  "date.getFullYear()": "date.year",
  "date.getMonth()": "date.month (注意：Temporal 的 month 从 1 开始！)",
  "date.getDate()": "date.day",
  "date.getHours()": "date.hour",
  "date.getDay()": "date.dayOfWeek",

  // 设置（Temporal 是不可变的，所有操作返回新对象）
  "date.setFullYear(y)": "date.with({ year: y })",
  "date.setMonth(m)": "date.with({ month: m + 1 })", // 注意转换！
  "date.setDate(d)": "date.with({ day: d })",

  // 运算
  "date.getTime() - other.getTime()": "date.until(other).total({ unit: 'milliseconds' })",
  "new Date(date.getTime() + ms)": "date.add({ milliseconds: ms })",

  // 格式化
  "date.toISOString()": "date.toString()",
  "date.toLocaleDateString()": "date.toLocaleString()",
} as const;

// ============================================
// 特性检测与 Polyfill
// ============================================

/**
 * 检测浏览器是否支持 Temporal API。
 */
export function supportsTemporal(): boolean {
  return typeof (globalThis as any).Temporal !== "undefined";
}

/**
 * 加载 Temporal Polyfill 的建议。
 */
export function getTemporalPolyfillInstructions(): string {
  return `
# Temporal Polyfill 使用

## 安装
npm install @js-temporal/polyfill

## 导入
import { Temporal } from '@js-temporal/polyfill';

## 全局注册（可选）
if (!globalThis.Temporal) {
  globalThis.Temporal = Temporal;
}

## 注意事项
1. Polyfill 体积约 30KB（gzip）
2. 生产环境建议等待浏览器原生支持
3. 类型定义：@types/temporal__polyfill
`;
}
