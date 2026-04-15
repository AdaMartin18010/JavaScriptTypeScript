# JavaScript/TypeScript 日期时间处理完全指南

> 涵盖原生 Date API、Temporal 提案、主流日期库对比、时区处理、国际化等完整知识体系

---

## 目录

1. [JavaScript Date 对象深入解析](#1-javascript-date-对象深入解析)
2. [时区处理理论](#2-时区处理理论)
3. [Temporal API 提案详解](#3-temporal-api-提案详解)
4. [日期库对比](#4-日期库对比)
5. [常见日期操作](#5-常见日期操作)
6. [日历计算](#6-日历计算)
7. [夏令时处理](#7-夏令时处理)
8. [国际化日期格式](#8-国际化日期格式)
9. [日期范围查询和分页](#9-日期范围查询和分页)
10. [时间戳和性能计时](#10-时间戳和性能计时)

---

## 1. JavaScript Date 对象深入解析

### 1.1 核心概念

JavaScript 的 `Date` 对象基于 Unix 时间戳（1970-01-01 00:00:00 UTC 起的毫秒数），但它存在设计缺陷：

- **可变性**：Date 对象是可变的，容易导致意外副作用
- **时区混淆**：同时处理 UTC 和本地时间，API 设计不一致
- **月份从 0 开始**：`new Date(2024, 0, 1)` 表示 1 月 1 日
- **解析不一致**：`Date.parse()` 在不同浏览器可能有差异

### 1.2 创建 Date 对象

```typescript
// ===== 构造函数方式 =====

// 1. 当前时间
const now = new Date();

// 2. 时间戳（毫秒）
const fromTimestamp = new Date(1704067200000); // 2024-01-01 00:00:00 UTC

// 3. 日期字符串（推荐 ISO 8601 格式）
const fromISO = new Date('2024-01-15T10:30:00Z');      // UTC
const fromISOOffset = new Date('2024-01-15T10:30:00+08:00'); // 带时区偏移

// 4. 年月日时分秒（月份从 0 开始！）
const fromComponents = new Date(2024, 0, 15, 10, 30, 0, 0); // 2024-01-15 10:30:00 本地时间

// ⚠️ 注意：不带 new 调用返回字符串，而非 Date 对象
const dateString = Date(); // "Mon Jan 15 2024 10:30:00 GMT+0800"

// ===== 静态方法 =====

// 当前时间戳（毫秒）- 推荐用于计时和日志
const timestampMs = Date.now();

// 解析日期字符串为时间戳
const parsed = Date.parse('2024-01-15T10:30:00Z'); // 1705314600000

// UTC 时间创建
const utcDate = Date.UTC(2024, 0, 15, 10, 30, 0); // 返回时间戳
```

### 1.3 获取时间信息

```typescript
const date = new Date('2024-01-15T10:30:45.500Z');

// ===== UTC 方法（推荐用于服务器端/数据库操作）=====
date.getUTCFullYear();      // 2024
date.getUTCMonth();         // 0 (一月)
date.getUTCDate();          // 15 (日期)
date.getUTCDay();           // 1 (周一，0=周日)
date.getUTCHours();         // 10
date.getUTCMinutes();       // 30
date.getUTCSeconds();       // 45
date.getUTCMilliseconds();  // 500

// ===== 本地时间方法（依赖运行时环境时区）=====
date.getFullYear();         // 本地年份
date.getMonth();            // 本地月份 (0-11)
date.getDate();             // 本地日期 (1-31)
date.getDay();              // 本地星期 (0-6)
date.getHours();            // 本地小时
// ... 等

// ===== 时间戳 =====
date.getTime();             // 1705314645500 (毫秒时间戳)
date.valueOf();             // 同 getTime()
date.getTimezoneOffset();   // -480 (与 UTC 的分钟差，东八区返回 -480)
```

### 1.4 修改 Date 对象

```typescript
const date = new Date('2024-01-15T10:30:00Z');

// ===== 修改方法（会改变原对象！）=====
// UTC 修改
date.setUTCFullYear(2025);    // 返回新时间戳
date.setUTCMonth(5);          // 六月 (0-11)
date.setUTCDate(20);
date.setUTCHours(14);
// setUTCMinutes, setUTCSeconds, setUTCMilliseconds...

// 本地时间修改
date.setFullYear(2025);
date.setMonth(5);
date.setDate(20);
// ...

// ===== 不可变操作模式 =====
// 推荐：创建新对象而非修改原对象
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function setUTCYear(date: Date, year: number): Date {
  const result = new Date(date);
  result.setUTCFullYear(year);
  return result;
}
```

### 1.5 字符串转换

```typescript
const date = new Date('2024-01-15T10:30:00Z');

// ===== toISOString - 最可靠的标准格式 =====
date.toISOString();           // "2024-01-15T10:30:00.000Z" (始终 UTC)

// ===== 本地化字符串（依赖运行时环境）=====
date.toString();              // "Mon Jan 15 2024 18:30:00 GMT+0800 (中国标准时间)"
date.toDateString();          // "Mon Jan 15 2024"
date.toTimeString();          // "18:30:00 GMT+0800 (中国标准时间)"
date.toLocaleString();        // "2024/1/15 18:30:00"
date.toLocaleDateString();    // "2024/1/15"
date.toLocaleTimeString();    // "18:30:00"

// ===== UTC 字符串 =====
date.toUTCString();           // "Mon, 15 Jan 2024 10:30:00 GMT"
date.toGMTString();           // 已废弃，同 toUTCString

// ===== JSON 序列化 =====
JSON.stringify({ date });     // '{"date":"2024-01-15T10:30:00.000Z"}'
// Date 对象自动调用 toISOString()
```

### 1.6 最佳实践

```typescript
// ✅ 推荐做法

// 1. 服务器端始终使用 UTC
function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

// 2. 比较日期时先规范化到 00:00:00
function isSameDay(d1: Date, d2: Date): boolean {
  return d1.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10);
}

// 3. 使用不可变操作
const tomorrow = addDays(new Date(), 1); // 不修改原对象

// 4. 类型安全的日期创建
interface DateComponents {
  year: number;
  month: number;  // 1-12
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

function fromComponents(c: DateComponents, useUTC = true): Date {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = c;
  if (useUTC) {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }
  return new Date(year, month - 1, day, hour, minute, second);
}

// ❌ 避免

// 1. 不要依赖隐式时区转换
const ambiguous = new Date('2024-01-15'); // 可能按 UTC 或本地时间解析

// 2. 避免直接修改传入的 Date 对象
function badAddDay(date: Date): Date {
  date.setDate(date.getDate() + 1); // 副作用！
  return date;
}

// 3. 不要比较 Date 对象（比较的是引用）
const d1 = new Date('2024-01-15');
const d2 = new Date('2024-01-15');
d1 === d2; // false!
d1.getTime() === d2.getTime(); // true ✅
```

---

## 2. 时区处理理论

### 2.1 时区基础概念

```
UTC (协调世界时): 全球时间标准，无时区偏移
GMT (格林尼治标准时): 与 UTC 基本相同，精度略低
本地时间: UTC + 时区偏移 (+ 可能的夏令时调整)
IANA 时区: 如 "America/New_York", "Asia/Shanghai"
```

### 2.2 时区表示方式

```typescript
// ===== 1. 固定偏移时区 =====
// 格式: ±HH:MM 或 ±HHMM
const withOffset = new Date('2024-01-15T10:30:00+08:00');
const withNegativeOffset = new Date('2024-01-15T10:30:00-05:00');

// 偏移与 IANA 时区的区别：
// +08:00 固定偏移，不随夏令时变化
// Asia/Shanghai 可能包含历史时区规则变化

// ===== 2. IANA 时区数据库 =====
// JavaScript 原生不支持直接使用 IANA 时区名称
// 需要使用 Intl API 或第三方库

// 检查运行时支持的时区
const supportedTimezones = Intl.supportedValuesOf?.('timeZone') ?? [];
console.log(supportedTimezones.slice(0, 5)); // ["Africa/Abidjan", ...]
```

### 2.3 UTC 与本地时间转换

```typescript
// ===== 本地时间 → UTC =====
function toUTC(localDate: Date): Date {
  return new Date(localDate.getTime());
  // Date 对象内部始终存储为 UTC 时间戳
  // 只是显示时根据本地时区偏移
}

// ===== UTC → 指定时区本地时间 =====
// 使用 Intl.DateTimeFormat 获取指定时区的日期分量
function toTimezoneComponents(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0');

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

// 示例：UTC 时间转换为纽约时间
const utcDate = new Date('2024-01-15T10:30:00Z');
const nyComponents = toTimezoneComponents(utcDate, 'America/New_York');
// { year: 2024, month: 1, day: 15, hour: 5, minute: 30 } (冬令时)
```

### 2.4 时区感知日期操作

```typescript
// ===== 在指定时区创建日期 =====
// 原生 Date 无法直接设置时区，需要借助第三方库
// 这里展示使用原生 Intl API 的变通方法

function createDateInTimezone(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  // 创建一个该时区的日期字符串，然后解析
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;

  // 使用 Intl 找出该时区与 UTC 的偏移
  const offset = getTimezoneOffsetMinutes(dateStr, timeZone);

  // 调整时间戳
  const localDate = new Date(dateStr);
  return new Date(localDate.getTime() + offset * 60 * 1000);
}

function getTimezoneOffsetMinutes(dateStr: string, timeZone: string): number {
  const date = new Date(dateStr);

  // 获取该时区的时间分量
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = tzFormatter.formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';

  const tzDate = new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`);

  return (date.getTime() - tzDate.getTime()) / (60 * 1000);
}
```

### 2.5 常见时区处理场景

```typescript
// ===== 场景 1：存储和传输 =====
// 始终以 ISO 8601 UTC 格式存储和传输
function toStorageFormat(date: Date): string {
  return date.toISOString(); // "2024-01-15T10:30:00.000Z"
}

// ===== 场景 2：显示给用户 =====
// 根据用户偏好时区格式化
function toUserTimezone(date: Date | string, userTimezone: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// ===== 场景 3：跨时区会议时间 =====
interface MeetingTime {
  utcTime: string;           // ISO 8601 UTC
  organizerTimezone: string; // "America/New_York"
  participantTimezone: string; // "Asia/Shanghai"
}

function displayMeetingTime(meeting: MeetingTime): {
  organizerLocal: string;
  participantLocal: string;
  utc: string;
} {
  const utcDate = new Date(meeting.utcTime);

  return {
    organizerLocal: toUserTimezone(utcDate, meeting.organizerTimezone),
    participantLocal: toUserTimezone(utcDate, meeting.participantTimezone),
    utc: utcDate.toISOString(),
  };
}

// ===== 场景 4：日期边界判断 =====
// 判断某 UTC 时间是否在用户的"今天"
function isTodayInTimezone(utcDate: Date, userTimezone: string): boolean {
  const now = new Date();

  // 获取用户时区的"今天"日期字符串
  const todayStr = formatInTimezone(now, userTimezone, 'yyyy-MM-dd');
  const dateStr = formatInTimezone(utcDate, userTimezone, 'yyyy-MM-dd');

  return todayStr === dateStr;
}

// 简化版格式化
function formatInTimezone(date: Date, timeZone: string, format: 'yyyy-MM-dd' | 'full'): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (format === 'full') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-CA', options).format(date);
}
```

### 2.6 时区处理最佳实践

```typescript
// ✅ DO

// 1. 数据库/API 始终使用 UTC
interface Event {
  startTime: string; // ISO 8601 UTC: "2024-01-15T10:30:00Z"
  endTime: string;
  timezone: string;  // 用户时区: "Asia/Shanghai"
}

// 2. 存储用户偏好时区
interface UserPreferences {
  timezone: string; // IANA 时区名
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// 3. 显示时转换
function displayEvent(event: Event, userPrefs: UserPreferences): string {
  const start = new Date(event.startTime);
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: userPrefs.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(start);
}

// 4. 处理用户输入的时间（视为用户本地时区）
function parseUserInput(
  dateStr: string, // "2024-01-15"
  timeStr: string, // "14:30"
  userTimezone: string
): Date {
  // 使用第三方库（如 date-fns-tz, Luxon）处理更可靠
  // 这里展示概念
  const combined = `${dateStr}T${timeStr}:00`;
  // 需要库支持将其解析为指定时区的时间
  throw new Error('需要 date-fns-tz 或 Luxon 实现');
}

// ❌ DON'T

// 1. 不要存储本地时间字符串
const badEvent = {
  startTime: '2024-01-15 10:30:00', // 不知道是什么时区！
};

// 2. 不要依赖运行时时区
const serverDate = new Date(); // 服务器时区可能不是 UTC！

// 3. 不要手动计算时区偏移
// 夏令时规则会变化，使用 IANA 数据库
```

---

## 3. Temporal API 提案详解

### 3.1 Temporal 简介

Temporal 是 JavaScript 的现代化日期时间 API 提案（Stage 3），旨在解决原生 Date 的诸多问题：

- **不可变性**：所有操作返回新对象
- **类型安全**：区分 PlainDate、PlainTime、Instant、ZonedDateTime 等
- **时区支持**：原生支持 IANA 时区
- **纳秒精度**：支持高精度计时

```typescript
// 目前需要 polyfill: npm install @js-temporal/polyfill
import { Temporal } from '@js-temporal/polyfill';
```

### 3.2 核心类型

```typescript
// ===== 1. Instant - 时间点（无时区，类似 UTC 时间戳）=====
const instant = Temporal.Instant.from('2024-01-15T10:30:00Z');
const now = Temporal.Instant.now();

// 转换为时间戳
const epochMs = instant.epochMilliseconds; // 1705314600000
const epochNs = instant.epochNanoseconds;  // 1705314600000000000n

// 运算
const later = instant.add({ hours: 2 });
const earlier = instant.subtract({ minutes: 30 });
const duration = instant.until(later); // Temporal.Duration

// ===== 2. PlainDate - 日历日期（无时区）=====
const date = Temporal.PlainDate.from('2024-01-15');
const date2 = Temporal.PlainDate.from({ year: 2024, month: 1, day: 15 });

// 属性
console.log(date.year);   // 2024
console.log(date.month);  // 1 (1-based!)
console.log(date.day);    // 15
console.log(date.dayOfWeek); // 1 (周一，1=周一, 7=周日)
console.log(date.dayOfYear); // 15
console.log(date.daysInMonth); // 31
console.log(date.daysInYear);  // 366 (闰年)
console.log(date.inLeapYear);  // true

// 运算
const nextMonth = date.add({ months: 1 }); // 2024-02-15
const lastWeek = date.subtract({ weeks: 1 }); // 2024-01-08

// 比较
const isBefore = date.before(nextMonth); // true
const isEqual = date.equals(Temporal.PlainDate.from('2024-01-15')); // true

// ===== 3. PlainTime - 时间（无日期）=====
const time = Temporal.PlainTime.from('10:30:45.123456789');
console.log(time.hour);        // 10
console.log(time.minute);      // 30
console.log(time.second);      // 45
console.log(time.millisecond); // 123
console.log(time.microsecond); // 456
console.log(time.nanosecond);  // 789

// 舍入
const rounded = time.round({ smallestUnit: 'minute' }); // 10:31:00

// ===== 4. PlainDateTime - 日期+时间（无时区）=====
const dateTime = Temporal.PlainDateTime.from('2024-01-15T10:30:00');
const composed = date.toPlainDateTime(time); // 组合 PlainDate + PlainTime

// ===== 5. ZonedDateTime - 带时区的完整日期时间 =====
const zoned = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 1,
  day: 15,
  hour: 10,
  minute: 30,
  timeZone: 'Asia/Shanghai',
});

// 或从 ISO 字符串解析
const zoned2 = Temporal.ZonedDateTime.from('2024-01-15T10:30:00+08:00[Asia/Shanghai]');

// 属性
console.log(zoned.timeZoneId);     // "Asia/Shanghai"
console.log(zoned.offset);         // "+08:00"
console.log(zoned.offsetNanoseconds); // 28800000000000

// 时区转换
const inTokyo = zoned.withTimeZone('Asia/Tokyo');
const inUTC = zoned.withTimeZone('UTC');

// ===== 6. Duration - 时间段 =====
const duration = Temporal.Duration.from({
  years: 1,
  months: 2,
  days: 3,
  hours: 4,
});

// 也可以从字符串解析
const duration2 = Temporal.Duration.from('P1Y2M3DT4H5M6S');

// 运算
const doubled = duration.multiply(2);
const halved = duration.divide(2);
```

### 3.3 Temporal 实用操作

```typescript
// ===== 日期范围生成 =====
function* dateRange(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  step: Temporal.Duration | { days?: number } = { days: 1 }
): Generator<Temporal.PlainDate> {
  let current = start;
  while (Temporal.PlainDate.compare(current, end) <= 0) {
    yield current;
    current = current.add(step);
  }
}

// 使用
const start = Temporal.PlainDate.from('2024-01-01');
const end = Temporal.PlainDate.from('2024-01-07');
for (const date of dateRange(start, end)) {
  console.log(date.toString()); // 2024-01-01, 2024-01-02, ...
}

// ===== 工作日计算 =====
function addBusinessDays(
  date: Temporal.PlainDate,
  days: number
): Temporal.PlainDate {
  let result = date;
  let remaining = days;

  while (remaining > 0) {
    result = result.add({ days: 1 });
    // dayOfWeek: 1=周一, 7=周日
    if (result.dayOfWeek <= 5) { // 周一到周五
      remaining--;
    }
  }

  return result;
}

// ===== 年龄计算 =====
function calculateAge(birthDate: Temporal.PlainDate): number {
  const today = Temporal.Now.plainDateISO();
  const diff = birthDate.until(today, { largestUnit: 'years' });
  return diff.years;
}

// ===== 两个日期之间的完整月份数 =====
function monthsBetween(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate
): number {
  const diff = start.until(end, { largestUnit: 'months' });
  return diff.months + diff.years * 12;
}
```

### 3.4 Temporal 与 Date 互操作

```typescript
// Date → Instant
const date = new Date('2024-01-15T10:30:00Z');
const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());

// Instant → Date
const backToDate = new Date(instant.epochMilliseconds);

// Date → ZonedDateTime
function dateToZoned(date: Date, timeZone: string): Temporal.ZonedDateTime {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(timeZone);
}

// ZonedDateTime → Date
function zonedToDate(zoned: Temporal.ZonedDateTime): Date {
  return new Date(zoned.epochMilliseconds);
}
```

### 3.5 Temporal 最佳实践

```typescript
// ✅ 选择正确的类型

// 存储生日：使用 PlainDate（不需要时间）
const birthday = Temporal.PlainDate.from({ year: 1990, month: 5, day: 15 });

// 记录事件发生时间：使用 Instant（绝对时间点）
const eventOccurred = Temporal.Instant.now();

// 用户预约时间：使用 ZonedDateTime（需要知道用户时区）
const appointment = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 6,
  day: 15,
  hour: 14,
  minute: 0,
  timeZone: 'America/New_York',
});

// 仅时间操作：使用 PlainTime
const openingTime = Temporal.PlainTime.from('09:00:00');

// ✅ 使用 until/since 而非手动计算
const start = Temporal.PlainDate.from('2024-01-01');
const end = Temporal.PlainDate.from('2024-06-15');

// 推荐
const duration = start.until(end, { largestUnit: 'months' });
console.log(`${duration.months} months, ${duration.days} days`);

// ❌ 避免
const diffMs = end.toDateTime().epochMilliseconds - start.toDateTime().epochMilliseconds;
// 需要处理闰年、月份天数等复杂情况
```

---

## 4. 日期库对比

### 4.1 库概览

| 特性 | Moment.js | Day.js | date-fns | Luxon |
|------|-----------|--------|----------|-------|
| **大小（gzip）** | ~290KB | ~2KB | ~20KB（按需） | ~26KB |
| **不可变性** | ❌ 可变 | ✅ 不可变 | ✅ 不可变 | ✅ 不可变 |
| **Tree-shaking** | ❌ 不支持 | ✅ 支持 | ✅ 优秀 | ⚠️ 部分支持 |
| **时区支持** | 需插件 | 需插件 | 需 date-fns-tz | ✅ 内置 |
| **链式 API** | ✅ 支持 | ✅ 支持 | ❌ 函数式 | ✅ 支持 |
| **TypeScript** | 完整 | 完整 | 完整 | 完整 |
| **维护状态** | ⚠️ 维护模式 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |
| **推荐度** | ❌ 不推荐 | ✅ 推荐 | ✅ 推荐 | ✅ 推荐 |

### 4.2 代码对比示例

```typescript
// ===== 基础操作：获取下个月第一天 =====

// Moment.js
import moment from 'moment';
const m1 = moment().add(1, 'month').startOf('month');

// Day.js
import dayjs from 'dayjs';
const d1 = dayjs().add(1, 'month').startOf('month');

// date-fns
import { addMonths, startOfMonth } from 'date-fns';
const f1 = startOfMonth(addMonths(new Date(), 1));

// Luxon
import { DateTime } from 'luxon';
const l1 = DateTime.now().plus({ months: 1 }).startOf('month');

// Temporal
import { Temporal } from '@js-temporal/polyfill';
const t1 = Temporal.Now.plainDateISO().add({ months: 1 }).with({ day: 1 });
```

### 4.3 date-fns 详解

```typescript
// 推荐：函数式、不可变、Tree-shaking 友好
import {
  format,
  parseISO,
  addDays,
  subMonths,
  startOfWeek,
  endOfMonth,
  isSameDay,
  isBefore,
  differenceInDays,
  eachDayOfInterval,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

// ===== 解析 =====
const date = parseISO('2024-01-15T10:30:00Z');

// ===== 格式化 =====
const formatted = format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
// "2024年01月15日 10:30"

// ===== 运算 =====
const tomorrow = addDays(date, 1);
const lastMonth = subMonths(date, 1);

// ===== 查询 =====
const weekStart = startOfWeek(date, { locale: zhCN }); // 周一为周首
const monthEnd = endOfMonth(date);
const same = isSameDay(date, new Date());
const before = isBefore(date, new Date());

// ===== 差值 =====
const daysDiff = differenceInDays(new Date(), date);

// ===== 区间 =====
const days = eachDayOfInterval({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 0, 7),
}); // [Date, Date, ...]
```

### 4.4 Day.js 详解

```typescript
// 推荐：轻量、Moment.js API 兼容
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';

// 加载插件
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

// ===== 创建 =====
const now = dayjs();
const fromString = dayjs('2024-01-15');
const fromObject = dayjs({ year: 2024, month: 0, day: 15 }); // 月份 0-11

// ===== 格式化 =====
now.format('YYYY-MM-DD HH:mm:ss');
now.format('YYYY年MM月DD日');

// ===== 运算 =====
now.add(1, 'day');
now.subtract(2, 'month');
now.startOf('week');
now.endOf('month');

// ===== 查询 =====
now.isSame(dayjs(), 'day');
now.isBefore(dayjs());
now.isAfter(dayjs());
now.isLeapYear();

// ===== 时区 =====
const nyTime = dayjs().tz('America/New_York');
const shTime = dayjs().tz('Asia/Shanghai');
const converted = nyTime.tz('Asia/Tokyo');
```

### 4.5 Luxon 详解

```typescript
// 推荐：强大的时区支持，类似 Temporal 的设计理念
import { DateTime, Duration, Interval } from 'luxon';

// ===== 创建 =====
const now = DateTime.now();
const utc = DateTime.utc();
const local = DateTime.local(2024, 1, 15, 10, 30);
const fromISO = DateTime.fromISO('2024-01-15T10:30:00Z');
const fromFormat = DateTime.fromFormat('15/01/2024', 'dd/MM/yyyy');
const inTimezone = DateTime.now().setZone('Asia/Shanghai');

// ===== 属性 =====
now.year;
now.month;      // 1-12
now.day;        // 1-31
now.weekday;    // 1-7 (周一到周日)
now.hour;
now.zoneName;   // "Asia/Shanghai"
now.offset;     // 480 (分钟偏移)

// ===== 格式化 =====
now.toISO();           // "2024-01-15T10:30:00.000+08:00"
now.toISODate();       // "2024-01-15"
now.toFormat('yyyy年MM月dd日 HH:mm');

// ===== 运算 =====
now.plus({ days: 1 });
now.minus({ months: 2 });
now.startOf('month');
now.endOf('week');

// ===== 不可变性验证 =====
const original = DateTime.now();
const modified = original.plus({ days: 1 });
console.log(original === modified); // false
console.log(original.toISO() === modified.toISO()); // false

// ===== Duration =====
const duration = Duration.fromObject({ hours: 2, minutes: 30 });
const asMinutes = duration.as('minutes'); // 150
const formatted = duration.toFormat('hh:mm'); // "02:30"

// ===== Interval =====
const interval = Interval.fromDateTimes(
  DateTime.fromISO('2024-01-01'),
  DateTime.fromISO('2024-01-15')
);
interval.length('days'); // 14
interval.toDuration('hours');

// ===== 时区转换 =====
const meeting = DateTime.fromISO('2024-01-15T10:00:00', { zone: 'America/New_York' });
const shanghaiTime = meeting.setZone('Asia/Shanghai');
```

### 4.6 库选择建议

```typescript
// ===== 选择指南 =====

/**
 * 选择 Day.js 当：
 * - 需要极小的包体积（2KB）
 * - 熟悉 Moment.js API
 * - 简单项目，时区需求简单
 */

/**
 * 选择 date-fns 当：
 * - 需要最佳 Tree-shaking
 * - 偏好函数式编程
 * - 项目使用模块化打包
 */

/**
 * 选择 Luxon 当：
 * - 需要强大的时区支持
 * - 不可变性是必需
 * - 复杂日期操作
 */

/**
 * 避免 Moment.js：
 * - 体积大（290KB+）
 * - 可变对象容易出错
 * - 已进入维护模式
 */

// ===== 实际项目配置示例 =====

// date-fns 按需导入配置（推荐）
// 使用 ES Modules 自动 Tree-shaking
import { format, addDays } from 'date-fns';

// Day.js 插件配置
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

// 使用相对时间
dayjs().to(dayjs().add(1, 'day')); // "in a day"
dayjs().fromNow(); // "a few seconds ago"
```

---

## 5. 常见日期操作

### 5.1 解析操作

```typescript
import { parseISO, parse, isValid } from 'date-fns';
import { DateTime } from 'luxon';

// ===== 解析 ISO 8601 =====
// 最安全、最可靠的解析方式
const fromISO = parseISO('2024-01-15T10:30:00Z');
const fromISOOffset = parseISO('2024-01-15T10:30:00+08:00');

// ===== 解析自定义格式 =====
// date-fns
const customFormat = parse('15/01/2024 10:30', 'dd/MM/yyyy HH:mm', new Date());

// Luxon
const luxonParsed = DateTime.fromFormat('15/01/2024 10:30', 'dd/MM/yyyy HH:mm');

// ===== 验证日期有效性 =====
// date-fns
const valid = isValid(parseISO('2024-02-30')); // false (2月没有30日)

// Luxon
const luxonValid = DateTime.fromISO('2024-02-30').isValid; // false

// ===== 宽松解析（谨慎使用）=====
// JavaScript Date 构造函数会尝试解析但不保证结果
const loose = new Date('2024-01-15'); // 可能按 UTC 或本地时间解析

// ===== 自定义解析器 =====
interface ParsedDate {
  date: Date;
  original: string;
  isValid: boolean;
}

function safeParseISO(input: string): ParsedDate {
  const date = parseISO(input);
  return {
    date,
    original: input,
    isValid: isValid(date),
  };
}

function parseMultipleFormats(input: string): Date | null {
  const formats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'yyyy年MM月dd日',
  ];

  for (const fmt of formats) {
    try {
      const parsed = parse(input, fmt, new Date());
      if (isValid(parsed)) return parsed;
    } catch {
      continue;
    }
  }

  return null;
}
```

### 5.2 格式化操作

```typescript
import { format, formatDistance, formatRelative } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

// ===== 标准格式化模式 =====
const date = new Date('2024-01-15T10:30:00Z');

// date-fns 常用格式
format(date, 'yyyy-MM-dd');           // "2024-01-15"
format(date, 'yyyy/MM/dd HH:mm:ss');  // "2024/01/15 10:30:00"
format(date, 'yyyy年MM月dd日', { locale: zhCN }); // "2024年01月15日"
format(date, 'PPpp', { locale: enUS }); // "Jan 15, 2024, 10:30:00 AM"

// 预定义格式
// PP: Jan 15, 2024
// PPP: January 15th, 2024
// p: 10:30 AM
// pp: 10:30:00 AM
// PPp: Jan 15, 2024, 10:30 AM
// PPpp: Jan 15, 2024, 10:30:00 AM

// ===== 相对时间格式化 =====
formatDistance(date, new Date(), { addSuffix: true }); // "2 days ago"
formatRelative(date, new Date(), { locale: zhCN });    // "上周一 10:30"

// ===== 自定义格式化工具 =====
class DateFormatter {
  private locale: Locale;

  constructor(locale: Locale = zhCN) {
    this.locale = locale;
  }

  short(date: Date): string {
    return format(date, 'MM/dd', { locale: this.locale });
  }

  medium(date: Date): string {
    return format(date, 'yyyy-MM-dd', { locale: this.locale });
  }

  long(date: Date): string {
    return format(date, 'yyyy年MM月dd日', { locale: this.locale });
  }

  full(date: Date): string {
    return format(date, 'yyyy年MM月dd日 HH:mm:ss', { locale: this.locale });
  }

  relative(date: Date): string {
    return formatDistance(date, new Date(), {
      addSuffix: true,
      locale: this.locale
    });
  }
}

const formatter = new DateFormatter(zhCN);
```

### 5.3 计算操作

```typescript
import {
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

// ===== 加减运算 =====
const date = new Date('2024-01-15');

addDays(date, 7);        // +7天
subDays(date, 7);        // -7天
addMonths(date, 3);      // +3月
subMonths(date, 1);      // -1月
addYears(date, 1);       // +1年

// ===== 边界计算 =====
startOfDay(date);        // 当天 00:00:00
endOfDay(date);          // 当天 23:59:59
startOfWeek(date, { weekStartsOn: 1 }); // 当周周一 00:00:00
endOfWeek(date);         // 当周周日 23:59:59
startOfMonth(date);      // 当月1日 00:00:00
endOfMonth(date);        // 当月最后一日 23:59:59
startOfYear(date);       // 当年1月1日 00:00:00
endOfYear(date);         // 当年12月31日 23:59:59

// ===== 日历周计算 =====
import { getWeek, getISOWeek, getWeekYear, getISOWeekYear } from 'date-fns';

getWeek(date);           // 一年中的第几周（周日开始）
getISOWeek(date);        // ISO 8601 周数（周一开始）
getWeekYear(date);       // 周数年
getISOWeekYear(date);    // ISO 周数年

// ===== 自定义计算 =====
function addBusinessDays(date: Date, days: number): Date {
  let result = date;
  let added = 0;

  while (added < days) {
    result = addDays(result, 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) { // 非周末
      added++;
    }
  }

  return result;
}

function getNextWeekday(date: Date, targetDay: number): Date {
  // targetDay: 0=周日, 1=周一, ..., 6=周六
  const currentDay = date.getDay();
  const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
  return addDays(date, daysToAdd);
}

// 获取下周一
getNextWeekday(new Date(), 1);
```

### 5.4 比较操作

```typescript
import {
  isEqual,
  isBefore,
  isAfter,
  isSameDay,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  compareAsc,
  compareDesc,
} from 'date-fns';

// ===== 相等性比较 =====
isEqual(date1, date2);           // 完全相同（毫秒级）
isSameDay(date1, date2);         // 同一天
isSameMonth(date1, date2);       // 同一月
isSameYear(date1, date2);        // 同一年

// ===== 顺序比较 =====
isBefore(date1, date2);          // date1 < date2
isAfter(date1, date2);           // date1 > date2

// 比较结果：负数=before, 0=equal, 正数=after
compareAsc(date1, date2);
compareDesc(date1, date2);

// ===== 区间判断 =====
isWithinInterval(date, { start, end });

// ===== 排序 =====
const dates = [
  new Date('2024-03-15'),
  new Date('2024-01-20'),
  new Date('2024-02-10'),
];

// 升序
const sorted = dates.sort(compareAsc);

// 降序
const reverseSorted = dates.sort(compareDesc);

// ===== 范围工具 =====
class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    if (isAfter(start, end)) {
      throw new Error('Start date must be before end date');
    }
  }

  contains(date: Date): boolean {
    return isWithinInterval(date, { start: this.start, end: this.end });
  }

  overlaps(other: DateRange): boolean {
    return isBefore(this.start, other.end) && isAfter(this.end, other.start);
  }

  intersect(other: DateRange): DateRange | null {
    const start = isAfter(this.start, other.start) ? this.start : other.start;
    const end = isBefore(this.end, other.end) ? this.end : other.end;

    if (isBefore(end, start)) return null;
    return new DateRange(start, end);
  }

  union(other: DateRange): DateRange {
    const start = isBefore(this.start, other.start) ? this.start : other.start;
    const end = isAfter(this.end, other.end) ? this.end : other.end;
    return new DateRange(start, end);
  }
}
```

### 5.5 实用工具函数

```typescript
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  differenceInMilliseconds,
  max,
  min,
  closestTo,
  clamp,
} from 'date-fns';

// ===== 差值计算 =====
differenceInDays(endDate, startDate);
differenceInMonths(endDate, startDate);
differenceInYears(endDate, startDate);
differenceInMilliseconds(endDate, startDate);

// ===== 聚合 =====
const dates = [new Date('2024-01-15'), new Date('2024-06-20'), new Date('2024-03-10')];
max(dates); // 最新日期
min(dates); // 最早日期

// ===== 最近日期 =====
closestTo(new Date('2024-04-01'), dates); // 返回 dates 中最接近的

// ===== 限制范围 =====
clamp(date, { start: minDate, end: maxDate });

// ===== 年龄计算 =====
function calculateAge(birthDate: Date, referenceDate = new Date()): number {
  const years = differenceInYears(referenceDate, birthDate);
  const hadBirthdayThisYear =
    referenceDate.getMonth() > birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
     referenceDate.getDate() >= birthDate.getDate());

  return hadBirthdayThisYear ? years : years - 1;
}

// ===== 倒计时 =====
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const diff = Math.max(0, targetDate.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
```

---

## 6. 日历计算

### 6.1 闰年判断

```typescript
// ===== 闰年规则 =====
// 1. 能被 4 整除但不能被 100 整除，或
// 2. 能被 400 整除

// 原生方法
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 使用 Date 对象（2月有29天）
function isLeapYearDate(year: number): boolean {
  return new Date(year, 1, 29).getMonth() === 1; // 月份 1 = 2月
}

// date-fns
import { isLeapYear as isLeapYearFns } from 'date-fns';
isLeapYearFns(new Date(2024, 0, 1)); // true

// Luxon
DateTime.local(2024).isInLeapYear; // true

// Temporal
Temporal.PlainDate.from({ year: 2024, month: 1, day: 1 }).inLeapYear; // true

// ===== 获取年份天数 =====
function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}
```

### 6.2 月份天数

```typescript
// ===== 各月天数 =====
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getDaysInMonth(year: number, month: number): number {
  // month: 1-12
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_DAYS[month - 1];
}

// 使用 Date 对象（跳到下月第0天 = 本月最后一天）
function getDaysInMonthDate(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// date-fns
import { getDaysInMonth } from 'date-fns';
getDaysInMonth(new Date(2024, 1)); // 29 (2024年2月)

// Temporal
Temporal.PlainDate.from({ year: 2024, month: 2, day: 1 }).daysInMonth; // 29
```

### 6.3 周计算

```typescript
import {
  getDay,
  getISODay,
  getWeek,
  getISOWeek,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
} from 'date-fns';

// ===== 星期获取 =====
const date = new Date('2024-01-15'); // 周一

getDay(date);     // 1 (周日=0, 周一=1, ..., 周六=6)
getISODay(date);  // 1 (周一=1, 周日=7)

// ===== 周范围 =====
// 周一开始
startOfWeek(date, { weekStartsOn: 1 }); // 2024-01-15 (周一)
endOfWeek(date, { weekStartsOn: 1 });   // 2024-01-21 (周日)

// 周日开始
startOfWeek(date, { weekStartsOn: 0 }); // 2024-01-14 (周日)

// ===== 周数 =====
getWeek(date);     // 一年中的第几周（周日开始）
getISOWeek(date);  // ISO 8601 周数（周一开始）

// ===== 获取某月所有周 =====
function getWeeksOfMonth(year: number, month: number): Date[][] {
  const start = startOfWeek(new Date(year, month - 1, 1), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(year, month - 1, getDaysInMonth(year, month)), { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let current = start;

  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

// ===== 日历矩阵生成 =====
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function generateCalendarMatrix(year: number, month: number): CalendarDay[][] {
  const today = new Date();
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month - 1, getDaysInMonth(year, month));

  // 找到日历起始（周日）
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());

  const matrix: CalendarDay[][] = [];
  let current = new Date(start);

  for (let week = 0; week < 6; week++) {
    const weekRow: CalendarDay[] = [];
    for (let day = 0; day < 7; day++) {
      weekRow.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month - 1,
        isToday: current.toDateString() === today.toDateString(),
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(weekRow);

    // 如果已经超出本月且是完整周，停止
    if (current > lastDay && week >= 4) break;
  }

  return matrix;
}
```

### 6.4 季度和半年计算

```typescript
// ===== 季度计算 =====
function getQuarter(month: number): number {
  return Math.ceil(month / 3);
}

function getQuarterMonths(quarter: number): number[] {
  const startMonth = (quarter - 1) * 3 + 1;
  return [startMonth, startMonth + 1, startMonth + 2];
}

function getQuarterRange(year: number, quarter: number): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3;
  return {
    start: new Date(year, startMonth, 1),
    end: new Date(year, startMonth + 3, 0, 23, 59, 59),
  };
}

// ===== 半年计算 =====
function getHalfYear(month: number): 1 | 2 {
  return month <= 6 ? 1 : 2;
}

function getHalfYearRange(year: number, half: 1 | 2): { start: Date; end: Date } {
  return {
    start: new Date(year, half === 1 ? 0 : 6, 1),
    end: new Date(year, half === 1 ? 6 : 12, 0, 23, 59, 59),
  };
}

// ===== 财务年度（可配置起始月）=====
function getFiscalYear(date: Date, fiscalStartMonth: number = 4): { year: number; quarter: number } {
  const month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (month < fiscalStartMonth) {
    year--;
  }

  const fiscalMonth = month >= fiscalStartMonth ? month - fiscalStartMonth + 1 : month + (12 - fiscalStartMonth) + 1;
  const quarter = Math.ceil(fiscalMonth / 3);

  return { year, quarter };
}
```

---

## 7. 夏令时处理

### 7.1 夏令时概念

夏令时(DST)是在夏季将时间调快一小时的做法，影响时间计算：

- 春季"跳跃"： clocks spring forward (时间丢失一小时)
- 秋季"回退"： clocks fall back (时间重复一小时)
- 不同地区规则不同，且会变化

### 7.2 检测夏令时

```typescript
// ===== 检查日期是否在夏令时 =====
// JavaScript Date 自动处理 DST，但检测需要技巧

function isDST(date: Date, timeZone: string): boolean {
  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);

  // 获取指定时区的偏移
  const getOffset = (d: Date) => {
    const str = d.toLocaleString('en-US', { timeZone, timeZoneName: 'shortOffset' });
    const match = str.match(/GMT([+-]\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const stdOffset = Math.max(getOffset(january), getOffset(july));
  const dateOffset = getOffset(date);

  return dateOffset !== stdOffset;
}

// Luxon 方式
import { DateTime } from 'luxon';

const dt = DateTime.now().setZone('America/New_York');
console.log(dt.isInDST); // true/false

// ===== 获取时区偏移变化 =====
function getTimezoneOffsetInfo(date: Date, timeZone: string): {
  offset: number;
  isDST: boolean;
  offsetStr: string;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value ?? '';
  const match = offsetPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);

  if (!match) return { offset: 0, isDST: false, offsetStr: 'UTC' };

  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3] ?? '0');
  const offsetMinutes = (hours * 60 + minutes) * (match[1] === '+' ? 1 : -1);

  return {
    offset: offsetMinutes,
    isDST: isDST(date, timeZone),
    offsetStr: offsetPart.replace('GMT', ''),
  };
}
```

### 7.3 夏令时边界处理

```typescript
// ===== 处理 DST 转换日 =====
// 美国: 3月第二个周日 2:00 → 3:00 (跳过一小时)
//      11月第一个周日 2:00 → 1:00 (重复一小时)

// 问题：春季跳跃期间的时间不存在
function isValidTimeInZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  timeZone: string
): boolean {
  try {
    const dt = DateTime.fromObject(
      { year, month, day, hour },
      { zone: timeZone }
    );
    return dt.isValid && dt.hour === hour;
  } catch {
    return false;
  }
}

// 示例：检查 2024-03-10 02:30 在 New York 是否有效
// 结果：false（该时间因 DST 跳跃而不存在）
isValidTimeInZone(2024, 3, 10, 2, 'America/New_York');

// ===== 安全的日期创建 =====
function safeCreateInTimezone(
  components: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
  },
  timeZone: string
): DateTime {
  const dt = DateTime.fromObject(
    {
      year: components.year,
      month: components.month,
      day: components.day,
      hour: components.hour ?? 0,
      minute: components.minute ?? 0,
    },
    { zone: timeZone }
  );

  if (!dt.isValid) {
    throw new Error(`Invalid datetime in ${timeZone}: ${JSON.stringify(components)}`);
  }

  return dt;
}

// ===== 处理模糊时间（秋季回退）=====
function resolveAmbiguousTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  timeZone: string,
  preferDST: boolean = false
): DateTime {
  const dt = DateTime.fromObject(
    { year, month, day, hour },
    { zone: timeZone }
  );

  // 如果时间在 DST 回退期间，Luxon 默认使用 offset 较大的（DST 中）
  // 可以通过比较确定
  if (dt.isInDST !== preferDST) {
    // 尝试找到另一个可能的解释
    const alt = dt.plus({ hours: 1 });
    if (alt.hour === hour && alt.isInDST === preferDST) {
      return alt;
    }
  }

  return dt;
}
```

### 7.4 夏令时最佳实践

```typescript
// ✅ DO

// 1. 使用 IANA 时区数据库
// 让库处理复杂的 DST 规则
const meeting = DateTime.fromISO('2024-03-10T14:00:00', {
  zone: 'America/New_York',
});

// 2. 存储 UTC 时间戳
interface Event {
  startTime: string; // ISO 8601 UTC
  timeZone: string;  // IANA 时区名
}

// 3. 用户界面显示本地时间
function displayToUser(event: Event, userTimezone: string): string {
  const utc = DateTime.fromISO(event.startTime, { zone: 'UTC' });
  const local = utc.setZone(userTimezone);
  return local.toFormat('yyyy-MM-dd HH:mm z'); // z 显示时区缩写
}

// 4. 处理用户输入时明确时区
function parseUserDateTime(
  dateStr: string, // "2024-03-10"
  timeStr: string, // "14:00"
  userTimezone: string
): DateTime {
  const combined = `${dateStr}T${timeStr}:00`;
  return DateTime.fromISO(combined, { zone: userTimezone });
}

// ❌ DON'T

// 1. 不要假设固定偏移
// 错误：纽约始终 UTC-5
const wrong = new Date('2024-07-15T10:00:00-05:00'); // 实际应该是 -04:00 (DST)

// 2. 不要手动计算 DST 转换日期
// 规则会变化，使用 IANA 数据库
```

---

## 8. 国际化日期格式

### 8.1 Intl.DateTimeFormat 基础

```typescript
// ===== 基础用法 =====
const date = new Date('2024-01-15T10:30:00Z');

// 简单格式化
new Intl.DateTimeFormat('zh-CN').format(date); // "2024/1/15"
new Intl.DateTimeFormat('en-US').format(date); // "1/15/2024"
new Intl.DateTimeFormat('de-DE').format(date); // "15.1.2024"

// ===== 完整配置 =====
const formatter = new Intl.DateTimeFormat('zh-CN', {
  // 日期样式
  dateStyle: 'full',   // 'full' | 'long' | 'medium' | 'short'
  // 时间样式
  timeStyle: 'medium', // 'full' | 'long' | 'medium' | 'short'

  // 单独指定（与 dateStyle/timeStyle 互斥）
  // year: 'numeric' | '2-digit',
  // month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow',
  // day: 'numeric' | '2-digit',
  // hour: 'numeric' | '2-digit',
  // minute: 'numeric' | '2-digit',
  // second: 'numeric' | '2-digit',

  // 时区
  timeZone: 'Asia/Shanghai',
  timeZoneName: 'short', // 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric'

  // 小时制
  hour12: false,

  // 星期格式
  weekday: 'long', // 'long' | 'short' | 'narrow'

  // 时代（BC/AD）
  era: 'short', // 'long' | 'short' | 'narrow'
});

formatter.format(date);
```

### 8.2 相对时间格式化

```typescript
// ===== Intl.RelativeTimeFormat =====
const rtf = new Intl.RelativeTimeFormat('zh-CN', {
  numeric: 'auto', // 'always' | 'auto'
});

rtf.format(-1, 'day');    // "昨天"
rtf.format(0, 'day');     // "今天"
rtf.format(1, 'day');     // "明天"
rtf.format(-2, 'day');    // "2天前"
rtf.format(3, 'month');   // "3个月后"
rtf.format(-1, 'year');   // "去年"

// 支持的单位：year, quarter, month, week, day, hour, minute, second

// ===== 自动计算相对时间 =====
function formatRelativeTime(date: Date, locale = 'zh-CN'): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffYear) >= 1) return rtf.format(diffYear, 'year');
  if (Math.abs(diffMonth) >= 1) return rtf.format(diffMonth, 'month');
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}
```

### 8.3 持续时间格式化

```typescript
// ===== Intl.DurationFormat (较新提案) =====
// 目前可用 polyfill 或手动实现

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

function formatDuration(duration: Duration, locale = 'zh-CN'): string {
  const parts: string[] = [];
  const formatter = new Intl.NumberFormat(locale);

  const units: Array<[keyof Duration, string]> = [
    ['years', '年'],
    ['months', '个月'],
    ['days', '天'],
    ['hours', '小时'],
    ['minutes', '分钟'],
    ['seconds', '秒'],
  ];

  for (const [unit, label] of units) {
    const value = duration[unit];
    if (value) {
      parts.push(`${formatter.format(value)}${label}`);
    }
  }

  return parts.join('') || '0秒';
}

// 使用 Temporal.Duration
import { Temporal } from '@js-temporal/polyfill';

function formatTemporalDuration(
  duration: Temporal.Duration,
  locale = 'zh-CN'
): string {
  return formatDuration({
    years: duration.years,
    months: duration.months,
    days: duration.days,
    hours: duration.hours,
    minutes: duration.minutes,
    seconds: duration.seconds,
  }, locale);
}
```

### 8.4 列表格式化

```typescript
// ===== 格式化日期列表 =====
const dates = [
  new Date('2024-01-15'),
  new Date('2024-01-16'),
  new Date('2024-01-17'),
];

// 使用 Intl.ListFormat
const listFormatter = new Intl.ListFormat('zh-CN', {
  style: 'long',
  type: 'conjunction',
});

const dateStrings = dates.map(d =>
  new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(d)
);

listFormatter.format(dateStrings); // "1月15日、1月16日和1月17日"

// ===== 范围格式化 =====
function formatDateRange(start: Date, end: Date, locale = 'zh-CN'): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const startFormat: Intl.DateTimeFormatOptions = sameMonth
    ? { day: 'numeric' }
    : sameYear
    ? { month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

  const endFormat: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  const dtf1 = new Intl.DateTimeFormat(locale, startFormat);
  const dtf2 = new Intl.DateTimeFormat(locale, endFormat);

  return `${dtf1.format(start)} - ${dtf2.format(end)}`;
}

// "2024年1月15日 - 2024年2月20日"
// "1月15日 - 20日" (同月)
```

### 8.5 完整国际化封装

```typescript
interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  showTime?: boolean;
  relative?: boolean;
}

class InternationalDateFormatter {
  private defaultLocale: string;
  private defaultTimeZone: string;

  constructor(defaultLocale = 'zh-CN', defaultTimeZone = 'Asia/Shanghai') {
    this.defaultLocale = defaultLocale;
    this.defaultTimeZone = defaultTimeZone;
  }

  format(date: Date, options: DateFormatOptions = {}): string {
    const {
      locale = this.defaultLocale,
      timeZone = this.defaultTimeZone,
      showTime = false,
      relative = false,
    } = options;

    if (relative) {
      return formatRelativeTime(date, locale);
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: showTime ? 'short' : undefined,
      timeZone,
    });

    return formatter.format(date);
  }

  formatShort(date: Date, locale = this.defaultLocale): string {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  formatFull(date: Date, locale = this.defaultLocale): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: this.defaultTimeZone,
    }).format(date);
  }

  formatRange(start: Date, end: Date, locale = this.defaultLocale): string {
    return formatDateRange(start, end, locale);
  }
}
```

---

## 9. 日期范围查询和分页

### 9.1 日期范围构建

```typescript
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';

// ===== 常见范围 =====
interface DateRange {
  start: Date;
  end: Date;
}

function getTodayRange(): DateRange {
  const now = new Date();
  return { start: startOfDay(now), end: endOfDay(now) };
}

function getYesterdayRange(): DateRange {
  const yesterday = subDays(new Date(), 1);
  return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
}

function getThisWeekRange(weekStartsOn: 0 | 1 = 1): DateRange {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn }),
    end: endOfWeek(now, { weekStartsOn }),
  };
}

function getThisMonthRange(): DateRange {
  const now = new Date();
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

function getLastNDaysRange(n: number): DateRange {
  return {
    start: startOfDay(subDays(new Date(), n - 1)),
    end: endOfDay(new Date()),
  };
}

function getDateRange(
  type: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days'
): DateRange {
  const ranges = {
    today: getTodayRange,
    yesterday: getYesterdayRange,
    thisWeek: () => getThisWeekRange(),
    thisMonth: getThisMonthRange,
    last7Days: () => getLastNDaysRange(7),
    last30Days: () => getLastNDaysRange(30),
  };

  return ranges[type]();
}
```

### 9.2 分页查询

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface DatePageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===== 基于游标的分页（适合无限滚动）=====
interface CursorPaginationParams {
  cursor?: string; // ISO 8601 日期字符串
  limit: number;
  direction: 'forward' | 'backward';
}

interface CursorPageResult<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

class DateCursorPaginator<T extends { date: Date }> {
  constructor(private items: T[]) {
    // 确保按日期排序
    this.items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  paginate(params: CursorPaginationParams): CursorPageResult<T> {
    const { cursor, limit, direction } = params;

    let startIndex = 0;
    if (cursor) {
      const cursorDate = new Date(cursor);
      startIndex = this.items.findIndex(
        item => direction === 'forward'
          ? item.date > cursorDate
          : item.date < cursorDate
      );
      if (startIndex === -1) startIndex = this.items.length;
    }

    const endIndex = direction === 'forward'
      ? Math.min(startIndex + limit, this.items.length)
      : Math.max(0, startIndex - limit);

    const data = direction === 'forward'
      ? this.items.slice(startIndex, endIndex)
      : this.items.slice(endIndex, startIndex);

    return {
      data,
      nextCursor: data[data.length - 1]?.date.toISOString(),
      prevCursor: data[0]?.date.toISOString(),
      hasMore: direction === 'forward'
        ? endIndex < this.items.length
        : endIndex > 0,
    };
  }
}

// ===== 日历视图分页 =====
interface CalendarPage {
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
}

function getCalendarPage(year: number, month: number): CalendarPage {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return {
    year,
    month,
    startDate: start,
    endDate: end,
  };
}

function getNextCalendarPage(page: CalendarPage): CalendarPage {
  const nextMonth = page.month === 12 ? 1 : page.month + 1;
  const nextYear = page.month === 12 ? page.year + 1 : page.year;
  return getCalendarPage(nextYear, nextMonth);
}

function getPrevCalendarPage(page: CalendarPage): CalendarPage {
  const prevMonth = page.month === 1 ? 12 : page.month - 1;
  const prevYear = page.month === 1 ? page.year - 1 : page.year;
  return getCalendarPage(prevYear, prevMonth);
}
```

### 9.3 日期范围数据库查询

```typescript
// ===== SQL 查询示例 =====
interface DateRangeQuery {
  // 使用参数化查询防止 SQL 注入
  sql: string;
  params: unknown[];
}

function buildDateRangeQuery(
  tableName: string,
  dateColumn: string,
  range: DateRange,
  additionalFilters?: Record<string, unknown>
): DateRangeQuery {
  const conditions: string[] = [`${dateColumn} >= ?`, `${dateColumn} <= ?`];
  const params: unknown[] = [range.start.toISOString(), range.end.toISOString()];

  if (additionalFilters) {
    for (const [key, value] of Object.entries(additionalFilters)) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }

  return {
    sql: `SELECT * FROM ${tableName} WHERE ${conditions.join(' AND ')} ORDER BY ${dateColumn} DESC`,
    params,
  };
}

// ===== MongoDB 查询 =====
function buildMongoDateQuery(range: DateRange): { [key: string]: unknown } {
  return {
    createdAt: {
      $gte: range.start,
      $lte: range.end,
    },
  };
}

// ===== GraphQL 分页 =====
interface DateConnection {
  edges: Array<{
    node: unknown;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

function buildDateConnection<T extends { id: string; createdAt: Date }>(
  items: T[],
  first?: number,
  after?: string
): DateConnection {
  let filtered = items;

  if (after) {
    const afterDate = new Date(after);
    filtered = items.filter(item => item.createdAt > afterDate);
  }

  if (first) {
    filtered = filtered.slice(0, first + 1); // 多取一个判断是否还有更多
  }

  const hasNextPage = first !== undefined && filtered.length > first;
  const nodes = first !== undefined ? filtered.slice(0, first) : filtered;

  return {
    edges: nodes.map(node => ({
      node,
      cursor: node.createdAt.toISOString(),
    })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: nodes[0]?.createdAt.toISOString(),
      endCursor: nodes[nodes.length - 1]?.createdAt.toISOString(),
    },
  };
}
```

### 9.4 时间序列聚合

```typescript
// ===== 按时间粒度聚合 =====
type Granularity = 'hour' | 'day' | 'week' | 'month';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

function aggregateByTime<T extends { date: Date }>(
  items: T[],
  granularity: Granularity,
  valueExtractor: (items: T[]) => number
): TimeSeriesPoint[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getTimeKey(item.date, granularity);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, groupItems]) => ({
      timestamp: parseTimeKey(key),
      value: valueExtractor(groupItems),
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

function getTimeKey(date: Date, granularity: Granularity): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  switch (granularity) {
    case 'hour':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}`;
    case 'day':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    case 'week':
      const weekStart = startOfWeek(date);
      return `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(weekStart.getDate())}`;
    case 'month':
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  }
}

function parseTimeKey(key: string): Date {
  return new Date(key);
}

// ===== 填充缺失时间点 =====
function fillMissingTimePoints(
  series: TimeSeriesPoint[],
  granularity: Granularity,
  start: Date,
  end: Date,
  defaultValue = 0
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  let current = new Date(start);
  let seriesIndex = 0;

  while (current <= end) {
    const key = getTimeKey(current, granularity);
    const existing = series[seriesIndex];

    if (existing && getTimeKey(existing.timestamp, granularity) === key) {
      result.push(existing);
      seriesIndex++;
    } else {
      result.push({ timestamp: new Date(current), value: defaultValue });
    }

    // 前进到下一个时间点
    switch (granularity) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return result;
}
```

---

## 10. 时间戳和性能计时

### 10.1 Date.now() 与性能时间

```typescript
// ===== Date.now() - 毫秒级时间戳 =====
const timestamp = Date.now(); // 1705314600000

// 与 new Date().getTime() 等价，但更快（不创建对象）

// ===== 微秒级时间戳（Node.js）=====
// process.hrtime.bigint() - 纳秒级，但与 wall clock 无关
// process.hrtime() - 返回 [秒, 纳秒]

// ===== performance.now() - 高精度计时 =====
// 相对于 navigationStart 的毫秒数，精度可达微秒
const start = performance.now();
// ... 执行代码
const end = performance.now();
const duration = end - start; // 毫秒，带小数

// 性能测量最佳实践
function measurePerformance<T>(fn: () => T, iterations = 1): { result: T; averageMs: number } {
  const times: number[] = [];
  let result: T;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = fn();
    times.push(performance.now() - start);
  }

  const averageMs = times.reduce((a, b) => a + b, 0) / times.length;
  return { result: result!, averageMs };
}
```

### 10.2 Performance API

```typescript
// ===== Performance Timeline API =====

// 标记时间点
performance.mark('startTask');
// ... 执行任务
performance.mark('endTask');

// 测量两个标记之间的时间
performance.measure('taskDuration', 'startTask', 'endTask');

// 获取测量结果
const measures = performance.getEntriesByType('measure');
measures.forEach(m => {
  console.log(`${m.name}: ${m.duration}ms`);
});

// 清理
performance.clearMarks('startTask');
performance.clearMeasures('taskDuration');

// ===== Performance Observer =====
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(3)}ms`);
    }
  }
});

observer.observe({ entryTypes: ['measure', 'mark'] });

// ===== User Timing API 装饰器 =====
function measureMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const markName = `${propertyKey}-start`;
    const measureName = `${propertyKey}-duration`;

    performance.mark(markName);
    const result = originalMethod.apply(this, args);

    if (result instanceof Promise) {
      return result.finally(() => {
        performance.mark(`${propertyKey}-end`);
        performance.measure(measureName, markName, `${propertyKey}-end`);
      });
    } else {
      performance.mark(`${propertyKey}-end`);
      performance.measure(measureName, markName, `${propertyKey}-end`);
      return result;
    }
  };

  return descriptor;
}

// 使用
class DataService {
  @measureMethod
  async fetchData() {
    // ... 异步操作
  }

  @measureMethod
  processData(data: unknown[]) {
    // ... 同步操作
    return data;
  }
}
```

### 10.3 高精度计时器

```typescript
// ===== 纳秒级计时（Node.js）=====
import { hrtime } from 'process';

function createNanoTimer() {
  const start = hrtime.bigint();

  return {
    elapsed(): bigint {
      return hrtime.bigint() - start;
    },
    elapsedMs(): number {
      return Number(hrtime.bigint() - start) / 1_000_000;
    },
  };
}

// ===== 浏览器高精度计时 =====
class HighResolutionTimer {
  private startTime: number;
  private paused = false;
  private pausedAt = 0;
  private totalPaused = 0;

  constructor() {
    this.startTime = performance.now();
  }

  pause() {
    if (!this.paused) {
      this.pausedAt = performance.now();
      this.paused = true;
    }
  }

  resume() {
    if (this.paused) {
      this.totalPaused += performance.now() - this.pausedAt;
      this.paused = false;
    }
  }

  elapsed(): number {
    const current = this.paused ? this.pausedAt : performance.now();
    return current - this.startTime - this.totalPaused;
  }

  reset() {
    this.startTime = performance.now();
    this.totalPaused = 0;
    this.paused = false;
  }
}

// ===== 性能基准测试 =====
interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSecond: number;
}

async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations = 1000
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // 预热
  for (let i = 0; i < Math.min(10, iterations); i++) {
    await fn();
  }

  // 正式测试
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }

  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  return {
    name,
    iterations,
    totalMs,
    avgMs,
    minMs,
    maxMs,
    opsPerSecond: 1000 / avgMs,
  };
}

// 比较两种日期解析方法
async function compareDateParsing() {
  const isoString = '2024-01-15T10:30:00.000Z';

  const nativeResult = await benchmark('Native Date', () => {
    new Date(isoString);
  }, 10000);

  const parseISO = (await import('date-fns')).parseISO;
  const dateFnsResult = await benchmark('date-fns parseISO', () => {
    parseISO(isoString);
  }, 10000);

  console.table([nativeResult, dateFnsResult]);
}
```

### 10.4 时间戳最佳实践

```typescript
// ===== 时间戳选择指南 =====

/**
 * 1. Date.now() - 一般用途
 * - 日志时间戳
 * - 简单的性能测量
 * - 缓存过期检查
 */
const cacheKey = `user-${userId}-${Date.now()}`;

/**
 * 2. performance.now() - 高精度计时
 * - 代码性能分析
 * - 动画帧率计算
 * - 游戏循环计时
 */
function shouldRenderFrame(lastFrameTime: number, fps: number): boolean {
  const now = performance.now();
  const frameInterval = 1000 / fps;
  return now - lastFrameTime >= frameInterval;
}

/**
 * 3. Temporal.Instant - 未来推荐
 * - 需要纳秒精度
 * - 跨时区时间操作
 */
// const instant = Temporal.Instant.now();

/**
 * 4. process.hrtime.bigint() - Node.js 专用
 * - 微基准测试
 * - 需要排除系统时间跳变影响
 */

// ===== 时间戳存储建议 =====
interface Event {
  // 存储毫秒时间戳（最通用）
  timestamp: number;

  // 或存储 ISO 字符串（可读性好）
  timestampISO: string;

  // 避免存储 Date 对象（JSON 序列化问题）
}

// ===== 时间戳安全比较 =====
function isExpired(timestamp: number, ttlMs: number): boolean {
  return Date.now() - timestamp > ttlMs;
}

// 考虑时钟回拨问题
function isExpiredSafe(timestamp: number, ttlMs: number): boolean {
  const now = Date.now();
  // 如果时钟回拨超过 1 分钟，认为已过期
  if (now < timestamp - 60000) {
    return true;
  }
  return now - timestamp > ttlMs;
}

// ===== 防抖/节流中的时间戳 =====
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;

  return (...args) => {
    const now = performance.now();
    const elapsed = now - lastCallTime;

    if (timeoutId) clearTimeout(timeoutId);

    if (elapsed > waitMs) {
      fn(...args);
      lastCallTime = now;
    } else {
      timeoutId = setTimeout(() => {
        fn(...args);
        lastCallTime = performance.now();
      }, waitMs - elapsed);
    }
  };
}
```

---

## 附录

### A. 常见日期库安装

```bash
# date-fns
npm install date-fns
npm install date-fns-tz  # 时区支持

# Day.js
npm install dayjs

# Luxon
npm install luxon
npm install @types/luxon  # TypeScript 类型

# Temporal Polyfill
npm install @js-temporal/polyfill
```

### B. 参考资源

- [MDN Date 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Temporal 提案](https://tc39.es/proposal-temporal/docs/)
- [date-fns 文档](https://date-fns.org/)
- [Day.js 文档](https://day.js.org/)
- [Luxon 文档](https://moment.github.io/luxon/)
- [IANA 时区数据库](https://www.iana.org/time-zones)

---

*本文档最后更新: 2024年*
