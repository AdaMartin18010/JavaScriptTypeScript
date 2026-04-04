/**
 * 日期工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | number | string,
  format = 'YYYY-MM-DD'
): string {
  const d = new Date(date);
  
  if (!isValidDate(d)) {
    throw new Error('Invalid date');
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (!isValidDate(date)) {
    throw new Error(`Cannot parse date: ${dateStr}`);
  }
  return date;
}

/**
 * 添加天数
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 验证日期有效性
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
