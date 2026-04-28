# Temporal API：ES2026 的日期时间革命

> **定位**：`10-fundamentals/10.6-ecmascript-spec/`
> **规范来源**：TC39 Proposal Stage 4 (2026-03) | ECMA-262 §21.4

---

## 一、为什么需要 Temporal

JavaScript 的 `Date` 对象是 1995 年 Java 1.0 `java.util.Date` 的移植，存在根本性设计缺陷：

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

## 四、TypeScript 6.0+ 支持

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
```

---

## 五、迁移策略

| 旧模式 | Temporal 替代 |
|--------|--------------|
| `new Date()` | `Temporal.Now.instant()` |
| `Date.now()` | `Temporal.Now.instant().epochMilliseconds` |
| `date.toISOString()` | `instant.toString()` |
| `date.getTimezoneOffset()` | `zonedDateTime.offset` |
| `moment(date).add(1, 'day')` | `date.add({ days: 1 })` |

---

*本文件为 ECMAScript 规范基础专题的 Temporal API 深度分析，对应 ES2026 Stage 4 特性。*
