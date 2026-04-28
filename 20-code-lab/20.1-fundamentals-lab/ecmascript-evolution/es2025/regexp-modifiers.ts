/**
 * @file RegExp Modifiers (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty medium
 * @tags regexp, es2025
 * @description
 * 演示 ES2025 正则表达式内联标志（Inline Modifiers）：允许在正则表达式内部
 * 局部启用或禁用 i, m, s 等标志，仅作用于括号内的子表达式。
 * 同时演示重复命名捕获组（Duplicate Named Capturing Groups）。
 */

function tryRegex(pattern: string, flags?: string): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

/** 局部忽略大小写 */
export function localIgnoreCaseDemo(): boolean | string {
  const re = tryRegex('^[a-z](?-i:[a-z])$', 'i');
  if (!re) return 'RegExp modifiers not supported';
  return re.test('ab') && re.test('Ab') && !re.test('aB');
}

/** 多行模式局部控制 */
export function localMultilineDemo(): RegExpMatchArray | null | string {
  const re = tryRegex('^foo(?m:^bar)$');
  if (!re) return 'RegExp modifiers not supported';
  return 'foobar'.match(re);
}

/** 标志切换：嵌套标志 */
export function nestedFlagsDemo(): boolean | string {
  const re = tryRegex('^(?i:a(?-i:b)c)d$', 'i');
  if (!re) return 'RegExp modifiers not supported';
  return re.test('ABCD') && re.test('AbcD') && !re.test('ABcD');
}

/** 实际应用：密码验证（局部大小写敏感） */
export function passwordValidationDemo(password: string): boolean | string {
  const re = tryRegex('^(?=[A-Z])[A-Z](?i:[a-z]+)(?-i:[0-9]+)$');
  if (!re) return 'RegExp modifiers not supported';
  return re.test(password);
}

/** 重复命名捕获组：多格式日期解析 */
export function duplicateNamedGroupsDemo(dateStr: string): { day: string; month: string; year: string } | null | string {
  const re = tryRegex('(?<day>\\d{2})/(?<month>\\d{2})/(?<year>\\d{4})|(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})');
  if (!re) return 'Duplicate named groups not supported';
  const match = dateStr.match(re);
  if (!match?.groups) return null;
  return {
    day: match.groups.day,
    month: match.groups.month,
    year: match.groups.year,
  };
}
