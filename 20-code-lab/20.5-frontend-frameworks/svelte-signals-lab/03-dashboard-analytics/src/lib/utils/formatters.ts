/**
 * 数字/日期格式化工具
 */

export function formatCurrency(value: number, locale = 'zh-CN', currency = 'CNY'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(value);
}

export function formatNumber(value: number, locale = 'zh-CN'): string {
	return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, locale = 'zh-CN'): string {
	return new Intl.NumberFormat(locale, {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(value / 100);
}

export function formatCompactNumber(value: number, locale = 'zh-CN'): string {
	return new Intl.NumberFormat(locale, {
		notation: 'compact',
		compactDisplay: 'short'
	}).format(value);
}

export function formatDate(date: Date | string | number, locale = 'zh-CN'): string {
	const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(d);
}

export function formatDateTime(date: Date | string | number, locale = 'zh-CN'): string {
	const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).format(d);
}
