---
layout: default
title: Stars 趋势可视化
---

# 📈 JavaScript/TypeScript 生态系统 Stars 趋势

> 实时追踪 JS/TS 生态系统中热门库的 GitHub Stars 增长趋势

<div class="trends-container">

<!-- 概览卡片 -->
<div class="overview-cards">
  <div class="card">
    <div class="card-icon">📦</div>
    <div class="card-content">
      <div class="card-value" id="total-repos">-</div>
      <div class="card-label">追踪仓库</div>
    </div>
  </div>
  <div class="card">
    <div class="card-icon">🔥</div>
    <div class="card-content">
      <div class="card-value" id="fastest-growing">-</div>
      <div class="card-label">增长最快</div>
    </div>
  </div>
  <div class="card">
    <div class="card-icon">📊</div>
    <div class="card-content">
      <div class="card-value" id="total-stars">-</div>
      <div class="card-label">总 Stars</div>
    </div>
  </div>
  <div class="card">
    <div class="card-icon">🕐</div>
    <div class="card-content">
      <div class="card-value" id="update-time">-</div>
      <div class="card-label">更新时间</div>
    </div>
  </div>
</div>

<!-- 筛选控制 -->
<div class="controls">
  <div class="time-range">
    <label>时间范围:</label>
    <button class="btn active" data-range="6">6个月</button>
    <button class="btn" data-range="12">1年</button>
    <button class="btn" data-range="24">2年</button>
    <button class="btn" data-range="all">全部</button>
  </div>
  <div class="chart-type">
    <label>图表类型:</label>
    <button class="btn active" data-type="line">折线图</button>
    <button class="btn" data-type="bar">柱状图</button>
    <button class="btn" data-type="area">面积图</button>
  </div>
</div>

<!-- 主趋势图 -->
<div class="chart-section">
  <h2>📈 总体增长趋势</h2>
  <div id="main-trend-chart" class="chart-container"></div>
</div>

<!-- 前端框架趋势 -->
<div class="chart-section">
  <h2>🎨 前端框架趋势</h2>
  <div class="chart-grid">
    <div id="frontend-trend-chart" class="chart-container half"></div>
    <div id="frontend-growth-chart" class="chart-container half"></div>
  </div>
</div>

<!-- 构建工具趋势 -->
<div class="chart-section">
  <h2>🔧 构建工具趋势</h2>
  <div class="chart-grid">
    <div id="build-trend-chart" class="chart-container half"></div>
    <div id="build-growth-chart" class="chart-container half"></div>
  </div>
</div>

<!-- 全栈框架趋势 -->
<div class="chart-section">
  <h2>🚀 全栈框架趋势</h2>
  <div class="chart-grid">
    <div id="fullstack-trend-chart" class="chart-container half"></div>
    <div id="fullstack-growth-chart" class="chart-container half"></div>
  </div>
</div>

<!-- ORM 趋势 -->
<div class="chart-section">
  <h2>🗄️ ORM 与数据库工具趋势</h2>
  <div class="chart-grid">
    <div id="orm-trend-chart" class="chart-container half"></div>
    <div id="orm-growth-chart" class="chart-container half"></div>
  </div>
</div>

<!-- 运行时趋势 -->
<div class="chart-section">
  <h2>⚡ 运行时趋势</h2>
  <div class="chart-grid">
    <div id="runtime-trend-chart" class="chart-container half"></div>
    <div id="runtime-growth-chart" class="chart-container half"></div>
  </div>
</div>

<!-- 新兴库趋势 -->
<div class="chart-section">
  <h2>🌟 新兴库趋势 (高增长)</h2>
  <div id="emerging-trend-chart" class="chart-container"></div>
</div>

<!-- 增长排行榜 -->
<div class="chart-section">
  <h2>🏆 增长排行榜</h2>
  <div class="chart-grid">
    <div class="ranking-container">
      <h3>📈 年度增长 Top 10</h3>
      <div id="yearly-growth-ranking"></div>
    </div>
    <div class="ranking-container">
      <h3>📊 月度增长 Top 10</h3>
      <div id="monthly-growth-ranking"></div>
    </div>
  </div>
</div>

<!-- 数据表格 -->
<div class="chart-section">
  <h2>📋 详细数据</h2>
  <div class="table-container">
    <table id="trends-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>仓库</th>
          <th>分类</th>
          <th>Stars</th>
          <th>月增长</th>
          <th>年增长</th>
          <th>趋势</th>
        </tr>
      </thead>
      <tbody id="trends-table-body">
      </tbody>
    </table>
  </div>
</div>

</div>

<!-- 加载 ECharts -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>

<style>
.trends-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5em;
  opacity: 0.9;
}

.card-value {
  font-size: 1.8em;
  font-weight: bold;
  line-height: 1.2;
}

.card-label {
  font-size: 0.9em;
  opacity: 0.9;
}

/* 控制按钮 */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.controls label {
  font-weight: 600;
  color: #495057;
  margin-right: 10px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.btn:hover {
  background: #e9ecef;
}

.btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 40px;
}

.chart-section h2 {
  color: #333;
  border-left: 4px solid #667eea;
  padding-left: 12px;
  margin-bottom: 20px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 400px;
}

.chart-container.half {
  height: 350px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

/* 排行榜 */
.ranking-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.ranking-container h3 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  font-size: 0.85em;
}

.rank-1 { background: gold; color: #333; }
.rank-2 { background: silver; color: #333; }
.rank-3 { background: #cd7f32; color: white; }
.rank-other { background: #e9ecef; color: #495057; }

.repo-info {
  flex: 1;
}

.repo-name {
  font-weight: 600;
  color: #333;
}

.repo-category {
  font-size: 0.8em;
  color: #6c757d;
}

.growth-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
}

.growth-high {
  background: #d4edda;
  color: #155724;
}

.growth-medium {
  background: #fff3cd;
  color: #856404;
}

.growth-low {
  background: #f8d7da;
  color: #721c24;
}

/* 表格 */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
}

tr:hover {
  background: #f8f9fa;
}

.trend-sparkline {
  width: 100px;
  height: 30px;
}

/* 链接样式 */
a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container.half {
    height: 300px;
  }
  
  .controls {
    flex-direction: column;
  }
}

/* 加载动画 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .chart-section h2 {
    color: #e9ecef;
  }
  
  .chart-container,
  .ranking-container,
  .table-container {
    background: #212529;
  }
  
  .repo-name {
    color: #e9ecef;
  }
  
  th, td {
    border-bottom-color: #343a40;
  }
  
  th {
    background: #2d333b;
    color: #e9ecef;
  }
  
  tr:hover {
    background: #2d333b;
  }
}
</style>

<script>
// 全局状态
let trendsData = null;
let charts = {};
let currentTimeRange = 6;
let currentChartType = 'line';

// 颜色配置
const colors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', 
  '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
  '#ea7ccc', '#ff9f7f', '#ffdb5c', '#67e0e3'
];

// 分类名称映射
const categoryNames = {
  frontend: '前端框架',
  fullstack: '全栈框架',
  buildTools: '构建工具',
  webFrameworks: 'Web 框架',
  orm: 'ORM 与数据库',
  testing: '测试框架',
  runtime: '运行时',
  utils: '工具库',
  emerging: '新兴库'
};

// 初始化
async function init() {
  try {
    // 加载数据
    const response = await fetch('./data/trends.json');
    if (!response.ok) {
      throw new Error('Failed to load trends data');
    }
    trendsData = await response.json();
    
    // 更新概览卡片
    updateOverviewCards();
    
    // 初始化图表
    initCharts();
    
    // 渲染排行榜
    renderRankings();
    
    // 渲染表格
    renderTable();
    
    // 绑定事件
    bindEvents();
    
  } catch (error) {
    console.error('Error initializing trends:', error);
    document.querySelector('.trends-container').innerHTML = `
      <div class="loading">
        <p>⚠️ 无法加载趋势数据。请先运行 <code>node scripts/fetch-trends.js</code> 生成数据。</p>
      </div>
    `;
  }
}

// 更新概览卡片
function updateOverviewCards() {
  const allRepos = Object.values(trendsData.categories).flat();
  const totalStars = allRepos.reduce((sum, r) => sum + r.currentStars, 0);
  
  document.getElementById('total-repos').textContent = trendsData.summary.totalRepos;
  document.getElementById('fastest-growing').textContent = trendsData.fastestGrowing[0]?.name || '-';
  document.getElementById('total-stars').textContent = formatNumber(totalStars);
  document.getElementById('update-time').textContent = new Date(trendsData.generatedAt).toLocaleDateString('zh-CN');
}

// 初始化所有图表
function initCharts() {
  // 主趋势图 - 各分类 Top 3
  initMainTrendChart();
  
  // 前端框架
  initCategoryCharts('frontend', 'frontend-trend-chart', 'frontend-growth-chart');
  
  // 构建工具
  initCategoryCharts('buildTools', 'build-trend-chart', 'build-growth-chart');
  
  // 全栈框架
  initCategoryCharts('fullstack', 'fullstack-trend-chart', 'fullstack-growth-chart');
  
  // ORM
  initCategoryCharts('orm', 'orm-trend-chart', 'orm-growth-chart');
  
  // 运行时
  initCategoryCharts('runtime', 'runtime-trend-chart', 'runtime-growth-chart');
  
  // 新兴库
  initEmergingChart();
}

// 主趋势图
function initMainTrendChart() {
  const chart = echarts.init(document.getElementById('main-trend-chart'));
  charts['main'] = chart;
  
  updateMainTrendChart();
}

function updateMainTrendChart() {
  const chart = charts['main'];
  const categories = trendsData.categories;
  
  // 获取每个分类的 Top 2
  const series = [];
  let colorIndex = 0;
  
  Object.entries(categories).forEach(([catKey, repos]) => {
    repos.slice(0, 2).forEach((repo, idx) => {
      const data = filterDataByTimeRange(repo.history);
      series.push({
        name: repo.name,
        type: currentChartType === 'area' ? 'line' : currentChartType,
        data: data.map(h => h.stars),
        smooth: true,
        areaStyle: currentChartType === 'area' ? { opacity: 0.3 } : undefined,
        lineStyle: { width: 3 },
        itemStyle: { color: colors[colorIndex % colors.length] },
        emphasis: { focus: 'series' },
      });
      colorIndex++;
    });
  });
  
  const dates = categories.frontend[0]?.history.map(h => h.date) || [];
  const filteredDates = filterDataByTimeRange(categories.frontend[0]?.history || []).map(h => h.date);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      data: series.map(s => s.name),
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: currentChartType === 'bar',
      data: filteredDates,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: value => value >= 1000 ? (value / 1000) + 'k' : value,
      },
    },
    series,
    animationDuration: 1000,
  };
  
  chart.setOption(option, true);
}

// 分类图表
function initCategoryCharts(category, trendChartId, growthChartId) {
  const repos = trendsData.categories[category];
  if (!repos || repos.length === 0) return;
  
  // 趋势图
  const trendChart = echarts.init(document.getElementById(trendChartId));
  charts[trendChartId] = trendChart;
  
  const series = repos.slice(0, 5).map((repo, idx) => ({
    name: repo.name,
    type: 'line',
    data: filterDataByTimeRange(repo.history).map(h => h.stars),
    smooth: true,
    lineStyle: { width: 2 },
    itemStyle: { color: colors[idx % colors.length] },
    emphasis: { focus: 'series' },
  }));
  
  const dates = filterDataByTimeRange(repos[0].history).map(h => h.date);
  
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        formatter: value => value >= 1000 ? (value / 1000) + 'k' : value,
      },
    },
    series,
    animationDuration: 800,
  });
  
  // 增长率对比图
  const growthChart = echarts.init(document.getElementById(growthChartId));
  charts[growthChartId] = growthChart;
  
  const growthData = repos.slice(0, 5).map(repo => ({
    name: repo.name,
    value: parseFloat(repo.growth.yearly),
  }));
  
  growthChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: +{c}%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%' },
    },
    yAxis: {
      type: 'category',
      data: growthData.map(d => d.name).reverse(),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: growthData.map(d => d.value).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' },
        ]),
        borderRadius: [0, 4, 4, 0],
      },
      label: {
        show: true,
        position: 'right',
        formatter: '+{c}%',
        fontSize: 10,
      },
    }],
    animationDuration: 800,
  });
}

// 新兴库图表
function initEmergingChart() {
  const chart = echarts.init(document.getElementById('emerging-trend-chart'));
  charts['emerging'] = chart;
  
  const repos = trendsData.categories.emerging || [];
  
  const series = repos.map((repo, idx) => ({
    name: repo.name,
    type: 'line',
    data: filterDataByTimeRange(repo.history).map(h => h.stars),
    smooth: true,
    lineStyle: { width: 3 },
    itemStyle: { color: colors[idx % colors.length] },
    emphasis: { focus: 'series' },
  }));
  
  const dates = repos[0] ? filterDataByTimeRange(repos[0].history).map(h => h.date) : [];
  
  chart.setOption({
    title: {
      text: '高增长新兴库对比',
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: 'scroll',
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: value => value >= 1000 ? (value / 1000) + 'k' : value,
      },
    },
    series,
    animationDuration: 1000,
  });
}

// 渲染排行榜
function renderRankings() {
  // 年度增长
  const yearlyContainer = document.getElementById('yearly-growth-ranking');
  yearlyContainer.innerHTML = trendsData.fastestGrowing.map((repo, idx) => `
    <div class="ranking-item">
      <div class="rank-number rank-${idx < 3 ? idx + 1 : 'other'}">${idx + 1}</div>
      <div class="repo-info">
        <div class="repo-name">
          <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">${repo.name}</a>
        </div>
        <div class="repo-category">${categoryNames[repo.category] || repo.category}</div>
      </div>
      <div class="growth-badge ${getGrowthClass(repo.growth.yearly)}">+${repo.growth.yearly}%</div>
    </div>
  `).join('');
  
  // 月度增长
  const allRepos = Object.values(trendsData.categories).flat();
  const monthlyTop = allRepos
    .map(r => ({ ...r, monthlyGrowth: parseFloat(r.growth.monthly) }))
    .sort((a, b) => b.monthlyGrowth - a.monthlyGrowth)
    .slice(0, 10);
  
  const monthlyContainer = document.getElementById('monthly-growth-ranking');
  monthlyContainer.innerHTML = monthlyTop.map((repo, idx) => `
    <div class="ranking-item">
      <div class="rank-number rank-${idx < 3 ? idx + 1 : 'other'}">${idx + 1}</div>
      <div class="repo-info">
        <div class="repo-name">
          <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">${repo.name}</a>
        </div>
        <div class="repo-category">${categoryNames[repo.category] || repo.category}</div>
      </div>
      <div class="growth-badge ${getGrowthClass(repo.growth.monthly)}">+${repo.growth.monthly}%</div>
    </div>
  `).join('');
}

// 渲染数据表格
function renderTable() {
  const allRepos = Object.values(trendsData.categories).flat();
  const tbody = document.getElementById('trends-table-body');
  
  tbody.innerHTML = allRepos
    .sort((a, b) => b.currentStars - a.currentStars)
    .map((repo, idx) => {
      const history = filterDataByTimeRange(repo.history);
      const trendData = history.map(h => h.stars);
      const trendSvg = generateSparkline(trendData);
      
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">
              <strong>${repo.name}</strong>
            </a>
            <br><small style="color:#6c757d">${repo.description?.slice(0, 50) || ''}${repo.description?.length > 50 ? '...' : ''}</small>
          </td>
          <td>${categoryNames[repo.category] || repo.category}</td>
          <td><strong>${repo.currentStars.toLocaleString()}</strong></td>
          <td class="${getGrowthClass(repo.growth.monthly)}">+${repo.growth.monthly}%</td>
          <td class="${getGrowthClass(repo.growth.yearly)}">+${repo.growth.yearly}%</td>
          <td>${trendSvg}</td>
        </tr>
      `;
    }).join('');
}

// 根据时间范围过滤数据
function filterDataByTimeRange(history) {
  if (currentTimeRange === 'all') return history;
  return history.slice(-currentTimeRange);
}

// 获取增长等级样式
function getGrowthClass(value) {
  const num = parseFloat(value);
  if (num >= 50) return 'growth-high';
  if (num >= 10) return 'growth-medium';
  return 'growth-low';
}

// 生成迷你图
function generateSparkline(data) {
  if (!data || data.length < 2) return '';
  
  const width = 100;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return `<svg class="trend-sparkline" viewBox="0 0 ${width} ${height}">
    <polyline fill="none" stroke="#667eea" stroke-width="2" points="${points}"/>
  </svg>`;
}

// 格式化数字
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// 绑定事件
function bindEvents() {
  // 时间范围按钮
  document.querySelectorAll('.time-range .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-range .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTimeRange = btn.dataset.range === 'all' ? 'all' : parseInt(btn.dataset.range);
      refreshCharts();
    });
  });
  
  // 图表类型按钮
  document.querySelectorAll('.chart-type .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-type .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartType = btn.dataset.type;
      refreshCharts();
    });
  });
  
  // 窗口大小改变时重新渲染图表
  window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => chart.resize());
  });
}

// 刷新所有图表
function refreshCharts() {
  updateMainTrendChart();
  initCategoryCharts('frontend', 'frontend-trend-chart', 'frontend-growth-chart');
  initCategoryCharts('buildTools', 'build-trend-chart', 'build-growth-chart');
  initCategoryCharts('fullstack', 'fullstack-trend-chart', 'fullstack-growth-chart');
  initCategoryCharts('orm', 'orm-trend-chart', 'orm-growth-chart');
  initCategoryCharts('runtime', 'runtime-trend-chart', 'runtime-growth-chart');
  initEmergingChart();
  renderTable();
}

// 启动
document.addEventListener('DOMContentLoaded', init);
</script>
