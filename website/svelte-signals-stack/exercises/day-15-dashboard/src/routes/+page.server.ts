import type { PageServerLoad } from './$types';

interface Metric {
  date: string;
  visitors: number;
  pageviews: number;
  bounceRate: number;
  avgDuration: number;
}

function generateMetrics(days: number): Metric[] {
  const metrics: Metric[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseVisitors = 1000 + Math.sin(i * 0.5) * 300;
    const visitors = Math.round(baseVisitors + Math.random() * 200);
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      visitors,
      pageviews: Math.round(visitors * (2.5 + Math.random())),
      bounceRate: 0.3 + Math.random() * 0.3,
      avgDuration: 60 + Math.random() * 120,
    });
  }
  
  return metrics;
}

function computeSummary(metrics: Metric[]) {
  const half = Math.floor(metrics.length / 2);
  const current = metrics.slice(half);
  const previous = metrics.slice(0, half);
  
  const sum = (arr: Metric[], key: keyof Metric) => 
    arr.reduce((s, m) => s + (m[key] as number), 0);
  
  const currVisitors = sum(current, 'visitors');
  const prevVisitors = sum(previous, 'visitors');
  
  return {
    totalVisitors: sum(metrics, 'visitors'),
    totalPageviews: sum(metrics, 'pageviews'),
    avgBounceRate: sum(metrics, 'bounceRate') / metrics.length,
    avgDuration: sum(metrics, 'avgDuration') / metrics.length,
    changePercent: {
      visitors: ((currVisitors - prevVisitors) / prevVisitors) * 100,
      pageviews: 0,
      bounceRate: 0,
      duration: 0,
    },
  };
}

export const load: PageServerLoad = async () => {
  const metrics = generateMetrics(30);
  
  return {
    metrics,
    summary: computeSummary(metrics),
  };
};
