/**
 * D3.js TypeScript 可视化示例库
 * 
 * 这是一个完整的 D3.js TypeScript 示例集合，包含：
 * - 柱状图 (Bar Chart)
 * - 折线图 (Line Chart)
 * - 饼图/环形图 (Pie/Donut Chart)
 * - 力导向图 (Force-Directed Graph)
 * 
 * @packageDocumentation
 */

// 导出柱状图模块
export {
  createBarChart,
  updateBarChart,
  destroyBarChart,
  type BarChartData,
  type BarChartOptions,
} from './bar-chart';

// 导出折线图模块
export {
  createLineChart,
  updateLineChart,
  destroyLineChart,
  type LineChartDataPoint,
  type LineChartSeries,
  type LineChartOptions,
} from './line-chart';

// 导出饼图模块
export {
  createPieChart,
  updatePieChart,
  destroyPieChart,
  type PieChartData,
  type PieChartOptions,
} from './pie-chart';

// 导出力导向图模块
export {
  createForceGraph,
  updateForceGraph,
  destroyForceGraph,
  generateSampleData,
  type ForceNode,
  type ForceLink,
  type ForceGraphData,
  type ForceGraphOptions,
} from './force-graph';

/**
 * 库版本信息
 */
export const VERSION = '1.0.0';

/**
 * 获取所有可用的图表类型
 */
export function getAvailableChartTypes(): string[] {
  return [
    'bar-chart',
    'line-chart',
    'pie-chart',
    'force-graph',
  ];
}

/**
 * 检查浏览器是否支持 SVG
 */
export function isSVGSupported(): boolean {
  return typeof document !== 'undefined' && 
         document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
}

/**
 * 主题配色方案
 */
export const COLOR_THEMES = {
  /** 默认配色 */
  default: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
  /** 暖色调 */
  warm: ['#ff6b6b', '#f9ca24', '#f0932b', '#eb4d4b', '#e55039', '#fa8231'],
  /** 冷色调 */
  cool: ['#4834d4', '#686de0', '#30336b', '#22a6b3', '#0984e3', '#6c5ce7'],
  /** 自然色 */
  nature: ['#2ecc71', '#27ae60', '#16a085', '#1abc9c', '#3498db', '#9b59b6'],
  /** 灰度 */
  grayscale: ['#2d3436', '#636e72', '#b2bec3', '#dfe6e9', '#74b9ff', '#a29bfe'],
} as const;

/**
 * 图表工具函数
 */
export const utils = {
  /**
   * 格式化数字为千分位
   */
  formatNumber(num: number): string {
    return num.toLocaleString('zh-CN');
  },

  /**
   * 格式化百分比
   */
  formatPercent(value: number, total: number, decimals = 1): string {
    return ((value / total) * 100).toFixed(decimals) + '%';
  },

  /**
   * 生成随机颜色
   */
  randomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },

  /**
   * 生成随机数据（用于测试）
   */
  generateRandomData(length: number, min = 0, max = 100): { label: string; value: number }[] {
    return Array.from({ length }, (_, i) => ({
      label: `项目 ${i + 1}`,
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    }));
  },
};
