/**
 * @file Temporal API (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 * @difficulty medium
 * @tags temporal, date, timezone, es2026
 * @description
 * 演示 ES2026 已确认 Stage 4 的 Temporal API：JavaScript 下一代日期时间处理标准。
 * 包含 PlainDate、PlainTime、Duration、Instant 和 ZonedDateTime 的基础用法。
 * 注意：Temporal 为全局命名空间对象，目前已在 Chrome/Firefox 中逐步落地。
 */

// TypeScript 类型补丁：Temporal 尚未进入所有 lib 定义
declare global {
  namespace Temporal {
    class PlainDate {
      constructor(isoYear: number, isoMonth: number, isoDay: number);
      static from(item: string | { year: number; month: number; day: number }): PlainDate;
      add(duration: Duration | DurationLike): PlainDate;
      subtract(duration: Duration | DurationLike): PlainDate;
      toString(): string;
      year: number;
      month: number;
      day: number;
    }
    class PlainTime {
      constructor(isoHour?: number, isoMinute?: number, isoSecond?: number);
      static from(item: string | { hour: number; minute: number; second: number }): PlainTime;
      toString(): string;
    }
    class Duration {
      constructor(
        years?: number,
        months?: number,
        weeks?: number,
        days?: number,
        hours?: number,
        minutes?: number,
        seconds?: number
      );
      static from(item: Duration | DurationLike | string): Duration;
      toString(): string;
      readonly years?: number;
      readonly months?: number;
      readonly weeks?: number;
      readonly days?: number;
      readonly hours?: number;
      readonly minutes?: number;
      readonly seconds?: number;
    }
    class Instant {
      static from(epochMilliseconds: number): Instant;
      toZonedDateTimeISO(timeZone: string): unknown;
      epochMilliseconds: number;
    }
    class ZonedDateTime {
      static from(item: string): ZonedDateTime;
      toString(): string;
      timeZoneId: string;
    }
    namespace Now {
      function plainDateISO(): PlainDate;
      function instant(): Instant;
    }
  }
  interface DurationLike {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }
}

const TemporalGlobal = (globalThis as unknown as { Temporal?: typeof Temporal }).Temporal;

/** 检查运行时是否支持 Temporal */
export function isTemporalSupported(): boolean {
  return typeof TemporalGlobal !== 'undefined';
}

/** PlainDate 基础操作 */
export function plainDateDemo(): { today: string; nextWeek: string } | string {
  if (!TemporalGlobal) return 'Temporal not supported';
  const today = TemporalGlobal.Now.plainDateISO();
  const nextWeek = today.add({ days: 7 });
  return {
    today: today.toString(),
    nextWeek: nextWeek.toString(),
  };
}

/** Duration 与日期运算 */
export function durationDemo(): { result: string; duration: string } | string {
  if (!TemporalGlobal) return 'Temporal not supported';
  const date = TemporalGlobal.PlainDate.from({ year: 2026, month: 4, day: 17 });
  const duration = TemporalGlobal.Duration.from({ months: 1, days: 5 });
  const result = date.add(duration);
  return {
    result: result.toString(),
    duration: duration.toString(),
  };
}

/** Instant 与 ZonedDateTime */
export function instantDemo(): { instant: string; zoned: string } | string {
  if (!TemporalGlobal) return 'Temporal not supported';
  const instant = TemporalGlobal.Now.instant();
  return {
    instant: instant.epochMilliseconds.toString(),
    zoned: 'ZonedDateTime requires runtime support',
  };
}

/** 对比 Date 的可变性问题 */
export function immutabilityComparison(): { dateMutable: boolean; temporalImmutable: boolean } {
  // Date 是可变的
  const d = new Date('2026-04-17');
  const d2 = d;
  d.setDate(18);
  const dateMutable = d2.getDate() === 18;

  // Temporal 是不可变的
  let temporalImmutable = true;
  if (TemporalGlobal) {
    const t = TemporalGlobal.PlainDate.from({ year: 2026, month: 4, day: 17 });
    const t2 = t;
    const t3 = t.add({ days: 1 });
    temporalImmutable = t2.toString() === '2026-04-17' && t3.toString() === '2026-04-18';
  }

  return { dateMutable, temporalImmutable };
}
