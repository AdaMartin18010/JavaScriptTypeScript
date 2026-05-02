/**
 * 数据存储 — 使用 Svelte 5 Runes（.svelte.ts）
 * 提供模拟数据生成 + 实时更新能力
 */

export interface DataPoint {
	date: Date;
	value: number;
}

export interface CategoryDatum {
	category: string;
	value: number;
}

export interface PieDatum {
	label: string;
	value: number;
	color: string;
}

export interface Transaction {
	id: string;
	date: Date;
	category: string;
	amount: number;
	status: 'completed' | 'pending' | 'failed';
	customer: string;
}

const CATEGORIES = ['电子产品', '家居', '服装', '食品', '美妆', '图书'];
const STATUS_POOL: Transaction['status'][] = ['completed', 'pending', 'failed'];
const CUSTOMERS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'];
const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee'];

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
	return Math.random().toString(36).slice(2, 10);
}

function generateLineData(days = 30): DataPoint[] {
	const data: DataPoint[] = [];
	let base = 50000;
	const now = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		base += randomInt(-5000, 8000);
		data.push({ date, value: Math.max(10000, base) });
	}
	return data;
}

function generateBarData(): CategoryDatum[] {
	return CATEGORIES.map((cat) => ({
		category: cat,
		value: randomInt(20000, 120000)
	}));
}

function generatePieData(): PieDatum[] {
	return CATEGORIES.map((cat, i) => ({
		label: cat,
		value: randomInt(10, 100),
		color: COLORS[i % COLORS.length]
	}));
}

function generateTransactions(count = 50): Transaction[] {
	return Array.from({ length: count }, () => {
		const date = new Date();
		date.setDate(date.getDate() - randomInt(0, 60));
		return {
			id: uid(),
			date,
			category: pick(CATEGORIES),
			amount: randomInt(50, 5000),
			status: pick(STATUS_POOL),
			customer: pick(CUSTOMERS)
		};
	});
}

// ===== 使用 Runes 的响应式 Store =====

export function createDataStore() {
	const lineData = $state<DataPoint[]>(generateLineData());
	const barData = $state<CategoryDatum[]>(generateBarData());
	const pieData = $state<PieDatum[]>(generatePieData());
	const transactions = $state<Transaction[]>(generateTransactions());

	const totalRevenue = $derived(lineData.reduce((sum, d) => sum + d.value, 0));
	const totalOrders = $derived(transactions.length);
	const avgOrderValue = $derived(totalOrders > 0 ? totalRevenue / totalOrders : 0);
	const completionRate = $derived(
		transactions.length > 0
			? (transactions.filter((t) => t.status === 'completed').length / transactions.length) * 100
			: 0
	);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function startRealtime(interval = 5000) {
		stopRealtime();
		intervalId = setInterval(() => {
			// 追加新数据点
			const last = lineData[lineData.length - 1];
			const nextDate = new Date(last.date);
			nextDate.setDate(nextDate.getDate() + 1);
			const nextValue = Math.max(10000, last.value + randomInt(-5000, 8000));
			lineData.push({ date: nextDate, value: nextValue });
			if (lineData.length > 30) lineData.shift();

			// 刷新分类与饼图
			const newBar = generateBarData();
			barData.length = 0;
			barData.push(...newBar);

			const newPie = generatePieData();
			pieData.length = 0;
			pieData.push(...newPie);

			// 追加交易
			const newTx: Transaction = {
				id: uid(),
				date: new Date(),
				category: pick(CATEGORIES),
				amount: randomInt(50, 5000),
				status: pick(STATUS_POOL),
				customer: pick(CUSTOMERS)
			};
			transactions.unshift(newTx);
			if (transactions.length > 200) transactions.pop();
		}, interval);
	}

	function stopRealtime() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function refreshAll() {
		lineData.length = 0;
		lineData.push(...generateLineData());
		const newBar = generateBarData();
		barData.length = 0;
		barData.push(...newBar);
		const newPie = generatePieData();
		pieData.length = 0;
		pieData.push(...newPie);
		const newTx = generateTransactions();
		transactions.length = 0;
		transactions.push(...newTx);
	}

	return {
		get lineData() { return lineData; },
		get barData() { return barData; },
		get pieData() { return pieData; },
		get transactions() { return transactions; },
		get totalRevenue() { return totalRevenue; },
		get totalOrders() { return totalOrders; },
		get avgOrderValue() { return avgOrderValue; },
		get completionRate() { return completionRate; },
		startRealtime,
		stopRealtime,
		refreshAll
	};
}

export type DataStore = ReturnType<typeof createDataStore>;
