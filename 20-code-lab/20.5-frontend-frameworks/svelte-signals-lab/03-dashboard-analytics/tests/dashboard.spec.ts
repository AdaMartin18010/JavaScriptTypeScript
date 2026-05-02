import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	formatCurrency,
	formatNumber,
	formatPercent,
	formatCompactNumber
} from '../src/lib/utils/formatters';
import { createDataStore, type Transaction } from '../src/lib/stores/dataStore';

describe('Utils: formatters', () => {
	it('formats currency correctly', () => {
		const result = formatCurrency(1234567);
		expect(result).toContain('1,234,567');
	});

	it('formats number correctly', () => {
		expect(formatNumber(1000000)).toBe('1,000,000');
	});

	it('formats percent correctly', () => {
		expect(formatPercent(85.5)).toBe('85.5%');
	});

	it('formats compact number', () => {
		expect(formatCompactNumber(1500000)).toContain('万');
	});
});

describe('Store: dataStore', () => {
	it('initializes with data', () => {
		const store = createDataStore();
		expect(store.lineData.length).toBe(30);
		expect(store.barData.length).toBeGreaterThan(0);
		expect(store.pieData.length).toBeGreaterThan(0);
		expect(store.transactions.length).toBe(50);
	});

	it('computes derived values', () => {
		const store = createDataStore();
		expect(store.totalRevenue).toBeGreaterThan(0);
		expect(store.totalOrders).toBe(50);
		expect(store.avgOrderValue).toBeGreaterThan(0);
		expect(store.completionRate).toBeGreaterThanOrEqual(0);
		expect(store.completionRate).toBeLessThanOrEqual(100);
	});

	it('refreshAll replaces data', () => {
		const store = createDataStore();
		const oldFirstDate = store.lineData[0].date.getTime();
		store.refreshAll();
		expect(store.lineData[0].date.getTime()).not.toBe(oldFirstDate);
	});

	it('realtime adds data points', () => {
		vi.useFakeTimers();
		const store = createDataStore();
		const initialLength = store.lineData.length;
		store.startRealtime(1000);
		vi.advanceTimersByTime(1500);
		expect(store.lineData.length).toBe(initialLength); // shift 保持长度
		store.stopRealtime();
		vi.useRealTimers();
	});
});

describe('DataTable logic', () => {
	function mockTx(overrides: Partial<Transaction> = {}): Transaction {
		return {
			id: 't-' + Math.random().toString(36).slice(2, 6),
			date: new Date(),
			category: '测试',
			amount: 100,
			status: 'completed',
			customer: 'Alice',
			...overrides
		};
	}

	it('filters by search term', () => {
		const data = [mockTx({ customer: 'Alice' }), mockTx({ customer: 'Bob' })];
		const term = 'alice';
		const filtered = data.filter(
			(r) =>
				r.customer.toLowerCase().includes(term.toLowerCase()) ||
				r.category.toLowerCase().includes(term.toLowerCase()) ||
				r.id.toLowerCase().includes(term.toLowerCase())
		);
		expect(filtered.length).toBe(1);
		expect(filtered[0].customer).toBe('Alice');
	});

	it('sorts by amount descending', () => {
		const data = [mockTx({ amount: 50 }), mockTx({ amount: 200 }), mockTx({ amount: 100 })];
		const sorted = [...data].sort((a, b) => b.amount - a.amount);
		expect(sorted[0].amount).toBe(200);
		expect(sorted[2].amount).toBe(50);
	});
});
