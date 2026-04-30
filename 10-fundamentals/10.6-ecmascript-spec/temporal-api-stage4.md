# Temporal API：ES2026 的日期时间革命

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`
> **规范来源**：TC39 Proposal Stage 4 (2026-03) | ECMA-262 §21.4

---

## 一、为什么需要 Temporal

JavaScript 的 `Date` 对象是 1995 年 Java `java.util.Date` 的移植，存在根本性设计缺陷：

| 缺陷 | 示例 | Temporal 解决 |
|------|------|--------------|
| 月份从 0 开始 | `new Date(2026, 3, 28)` 是 4 月 | `new Temporal.PlainDate(2026, 4, 28)` |
| 可变状态 | `date.setFullYear(2025)` 修改原对象 | 不可变 API |
| 时区支持弱 | `Date` 仅支持系统时区 | `Temporal.ZonedDateTime` |
| 无日期类型 | `Date` 总是含时间 | `Temporal.PlainDate` |
| 无时间类型 | 无法表示 "14:30" | `Temporal.PlainTime` |
| 算术困难 | 日期加减需手动计算 | `date.add({ days: 1 })` |

---

## 二、Temporal 类型体系

```
Temporal
├── PlainDate        # 日历日期（无时区）
├── PlainTime        # 墙钟时间（无日期）
├── PlainDateTime    # 日期 + 时间（无时区）
├── ZonedDateTime    # 日期 + 时间 + 时区 + 偏移量
├── Instant          # 绝对时间点（epoch nanoseconds）
├── Duration         # 时间长度
├── PlainYearMonth   # 年 + 月
├── PlainMonthDay    # 月 + 日
└── TimeZone         # IANA 时区数据库
```

---

## 三、核心 API 示例

### 3.1 不可变操作

```javascript
const date = Temporal.PlainDate.from('2026-04-28');
const nextWeek = date.add({ weeks: 1 });  // 2026-05-05
// date 仍然是 2026-04-28（不可变）
```

### 3.2 时区安全操作

```javascript
const meeting = Temporal.ZonedDateTime.from({
  timeZone: 'America/New_York',
  year: 2026, month: 4, day: 28,
  hour: 14, minute: 0
});

const inTokyo = meeting.withTimeZone('Asia/Tokyo');
// 2026-04-29T03:00:00+09:00[Asia/Tokyo]
```

### 3.3 持续时间计算

```javascript
const start = Temporal.Instant.from('2026-04-28T00:00:00Z');
const end = Temporal.Instant.from('2026-04-29T12:00:00Z');
const duration = end.since(start);  // P1DT12H
```

---

## 四、Temporal vs Date 深度对比表

| 维度 | `Date` (1995) | `Temporal` (ES2026) |
|------|--------------|---------------------|
| **月份表示** | 0-11（易错） | 1-12（直觉） |
| **可变性** | 可变（`setXxx` 修改原对象） | 不可变（所有操作返回新对象） |
| **时区支持** | 仅本地时区 + UTC | 完整 IANA 时区数据库 |
| **夏令时处理** | 无原生支持，行为不一致 | `ZonedDateTime` 自动处理 |
| **精度** | 毫秒（1970 epoch ms） | 纳秒（bigint epoch ns） |
| **类型区分** | 单一 `Date` 类型 | 8+ 专用类型（PlainDate/Time/Instant 等） |
| **字符串解析** | 实现依赖，行为不一致 | ISO 8601 / RFC 3339 严格解析 |
| **日期算术** | 手动毫秒计算 | `add/subtract/until/since` API |
| **比较** | 时间戳数字比较 | 类型安全比较（跨类型报错） |
| **国际化** | `toLocaleString`（有限） | 与 `Intl.DateTimeFormat` 深度集成 |
| **闰秒处理** | 无 | `Instant` 支持闰秒表 |
| **Web 兼容性** | 原生支持 | Chrome 128+, Firefox 137+, Safari 未来 |

---

## 五、代码示例：Temporal 实战

```javascript
// ============================================
// 示例 1：日历计算与工作日推算
// ============================================

const today = Temporal.Now.plainDateISO();
const nextMonth = today.add({ months: 1 });

// 获取两个日期之间的差异（精确到日历语义）
const untilNextMonth = today.until(nextMonth);
console.log(untilNextMonth.toString()); // P1M

// 推算「下一个周五」
function nextFriday(date) {
  const dayOfWeek = date.dayOfWeek; // 1=Monday, 5=Friday, 7=Sunday
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  return date.add({ days: daysUntilFriday });
}
console.log(nextFriday(Temporal.PlainDate.from('2026-04-28')).toString()); // 2026-05-01

// ============================================
// 示例 2：时区感知的会议调度
// ============================================

function scheduleMeeting(dateStr, timeZone) {
  // 从无时区的墙钟时间开始
  const localDateTime = Temporal.PlainDateTime.from(dateStr);

  // 附加到具体时区（自动处理夏令时转换）
  const zoned = localDateTime.toZonedDateTime(timeZone);

  // 转换为其他时区显示
  const attendees = [
    { name: 'Alice', tz: 'America/New_York' },
    { name: 'Bob', tz: 'Europe/London' },
    { name: 'Carol', tz: 'Asia/Tokyo' }
  ];

  return attendees.map(p => ({
    name: p.name,
    localTime: zoned.withTimeZone(p.tz).toPlainDateTime().toString()
  }));
}

const meeting = scheduleMeeting('2026-06-15T10:00:00', 'America/Los_Angeles');
console.log(meeting);
// [
//   { name: 'Alice', localTime: '2026-06-15T13:00:00' },
//   { name: 'Bob',   localTime: '2026-06-15T18:00:00' },
//   { name: 'Carol', localTime: '2026-06-16T02:00:00' }
// ]

// ============================================
// 示例 3：Duration 的精确运算
// ============================================

const projectStart = Temporal.PlainDate.from('2026-01-06');
const projectEnd   = Temporal.PlainDate.from('2026-04-28');

// 日历语义差异（自动处理月份天数差异）
const duration = projectEnd.since(projectStart);
console.log(duration.toString()); // P3M22D

// 转换为总天数（不含时区/闰秒歧义）
console.log(duration.total({ unit: 'day' })); // 112

// Duration 的算术与规范化
const estimate = Temporal.Duration.from({ months: 1, days: 35 });
const normalized = estimate.round({ largestUnit: 'month', relativeTo: projectStart });
console.log(normalized.toString()); // P2M4D（因为 1月6日 + 35天 = 2月10日）

// ============================================
// 示例 4：Instant 与高性能时间戳
// ============================================

// Date 的精度限制：毫秒
const dateMs = Date.now();

// Instant 的精度：纳秒（适合日志、性能分析）
const instant = Temporal.Now.instant();
console.log(instant.epochMilliseconds); // 与 Date.now() 兼容
console.log(instant.epochNanoseconds);  // BigInt，纳秒级精度

// 纳秒级耗时测量
const t1 = Temporal.Now.instant();
// ... 执行操作 ...
const t2 = Temporal.Now.instant();
const elapsed = t1.until(t2);
console.log(`Elapsed: ${elapsed.total({ unit: 'microsecond' })} µs`);

// ============================================
// 示例 5：与旧代码的互操作
// ============================================

const legacyDate = new Date('2026-04-28T10:00:00Z');

// Date → Temporal.Instant
const instantFromDate = Temporal.Instant.fromEpochMilliseconds(legacyDate.getTime());

// Temporal.Instant → Date
const dateFromInstant = new Date(instantFromDate.epochMilliseconds);

// Temporal.PlainDate → Date（注意：PlainDate 无时区，需指定）
const plainDate = Temporal.PlainDate.from('2026-04-28');
const dateFromPlain = new Date(plainDate.toZonedDateTime({ timeZone: 'UTC' }).epochMilliseconds);
```

### 5.1 Temporal.Now 家族与日历系统

```javascript
// Temporal.Now 提供当前时间的多种获取方式
const nowInstant = Temporal.Now.instant();          // 绝对时间点
const nowZoned = Temporal.Now.zonedDateTimeISO();   // 系统时区的 ZonedDateTime
const nowPlain = Temporal.Now.plainDateISO();       // 当前日历日期
const nowPlainTime = Temporal.Now.plainTimeISO();   // 当前墙钟时间
const nowPlainDateTime = Temporal.Now.plainDateTimeISO(); // 当前日期+时间

// 指定时区获取当前时间
const nycNow = Temporal.Now.zonedDateTimeISO('America/New_York');

// 使用非 ISO 日历（如 Hebrew, Chinese, Islamic）
const hebrewDate = Temporal.PlainDate.from({ year: 5786, month: 1, day: 1, calendar: 'hebrew' });
console.log(hebrewDate.toString()); // 5786-01-01[u-ca=hebrew]

// 日历转换
const gregorian = hebrewDate.withCalendar('iso8601');
console.log(gregorian.toString()); // 2026-04-18
```

### 5.2 类型安全的日期比较

```javascript
const d1 = Temporal.PlainDate.from('2026-04-28');
const d2 = Temporal.PlainDate.from('2026-05-01');

// 类型安全的比较方法
console.log(Temporal.PlainDate.compare(d1, d2)); // -1
console.log(d1.equals(d2)); // false
console.log(d1.since(d2).toString()); // P-3D

// 跨类型比较会抛出 TypeError
const t1 = Temporal.PlainTime.from('14:00:00');
// Temporal.PlainDate.compare(d1, t1); // ❌ TypeError: cannot compare PlainDate and PlainTime
```

### 5.3 Temporal Polyfill 在旧环境的使用

```javascript
// 对于尚未原生支持 Temporal 的运行时，使用官方 polyfill
// npm install @js-temporal/polyfill

import { Temporal } from '@js-temporal/polyfill';

const date = Temporal.PlainDate.from('2026-04-28');
console.log(date.add({ days: 1 }).toString()); // 2026-04-29
```

---

## 六、TypeScript 6.0+ 支持

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["ES2026"]  // 包含 Temporal 类型
  }
}

// 类型安全
const date: Temporal.PlainDate = Temporal.PlainDate.from('2026-04-28');
const result: Temporal.Duration = date.until('2026-12-31');

// 编译期防止跨类型混用
const time: Temporal.PlainTime = Temporal.PlainTime.from('14:30:00');
// date.until(time); // ❌ TS Error：PlainDate 与 PlainTime 不可比较
```

---

## 七、迁移策略

| 旧模式 | Temporal 替代 |
|--------|--------------|
| `new Date()` | `Temporal.Now.instant()` |
| `Date.now()` | `Temporal.Now.instant().epochMilliseconds` |
| `date.toISOString()` | `instant.toString()` |
| `date.getTimezoneOffset()` | `zonedDateTime.offset` |
| `moment(date).add(1, 'day')` | `date.add({ days: 1 })` |
| `date-fns format(date, 'yyyy-MM-dd')` | `date.toString()` 或 `Intl.DateTimeFormat` |
| `dayjs().tz('America/New_York')` | `Temporal.ZonedDateTime` |

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **TC39 Temporal Proposal** | Stage 4 提案主仓库 | [github.com/tc39/proposal-temporal](https://github.com/tc39/proposal-temporal) |
| **Temporal Documentation** | 官方文档与 cookbook | [tc39.es/proposal-temporal/docs](https://tc39.es/proposal-temporal/docs/) |
| **ECMA-262 §21.4 Temporal** | ES2026 规范章节 | [tc39.es/ecma262/#sec-temporal-objects](https://tc39.es/ecma262/#sec-temporal-objects) |
| **V8 Blog: Temporal Shipping** | V8 引擎实现公告 | [v8.dev/blog](https://v8.dev/blog) |
| **MDN: Temporal** | Mozilla 开发者文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) |
| **Can I Use: Temporal** | 浏览器兼容性矩阵 | [caniuse.com/temporal](https://caniuse.com/temporal) |
| **Temporal Polyfill** | 旧环境兼容方案 | [github.com/js-temporal/temporal-polyfill](https://github.com/js-temporal/temporal-polyfill) |
| **Temporal Cookbook** | 官方食谱与常见模式 | [tc39.es/proposal-temporal/docs/cookbook.html](https://tc39.es/proposal-temporal/docs/cookbook.html) |
| **IANA Time Zone Database** | 时区数据来源 | [www.iana.org/time-zones](https://www.iana.org/time-zones) |
| **MDN: Intl.DateTimeFormat** | 国际化日期格式化 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) |
| **Chrome Platform Status: Temporal** | Chromium 实现状态 | [chromestatus.com/feature/5668255911837696](https://chromestatus.com/feature/5668255911837696) |

---

*本文件为 ECMAScript 规范基础专题的 Temporal API 深度分析，对应 ES2026 Stage 4 特性，已增强对比表与实战代码示例。*
