import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
let trendsData = null;
let charts = {};
let currentTimeRange = 6;
let currentChartType = "line";
const colors = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
  "#ff9f7f",
  "#ffdb5c",
  "#67e0e3"
];
const categoryNames = {
  frontend: "前端框架",
  fullstack: "全栈框架",
  buildTools: "构建工具",
  webFrameworks: "Web 框架",
  orm: "ORM 与数据库",
  testing: "测试框架",
  runtime: "运行时",
  utils: "工具库",
  emerging: "新兴库"
};
async function init() {
  try {
    await new Promise((resolve, reject) => {
      if (window.echarts) {
        resolve(void 0);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js";
      script.onload = () => resolve(void 0);
      script.onerror = () => reject(new Error("Failed to load ECharts"));
      document.head.appendChild(script);
    });
    const response = await fetch("./data/trends.json");
    if (!response.ok) {
      throw new Error("Failed to load trends data");
    }
    trendsData = await response.json();
    updateOverviewCards();
    initCharts();
    renderRankings();
    renderTable();
    bindEvents();
  } catch (error) {
    console.error("Error initializing trends:", error);
    document.querySelector(".trends-container").innerHTML = `
      <div class="loading">
        <p>⚠️ 无法加载趋势数据。请先运行 <code>node scripts/fetch-trends.js</code> 生成数据。</p>
      </div>
    `;
  }
}
function updateOverviewCards() {
  var _a;
  const allRepos = Object.values(trendsData.categories).flat();
  const totalStars = allRepos.reduce((sum, r) => sum + r.currentStars, 0);
  document.getElementById("total-repos").textContent = trendsData.summary.totalRepos;
  document.getElementById("fastest-growing").textContent = ((_a = trendsData.fastestGrowing[0]) == null ? void 0 : _a.name) || "-";
  document.getElementById("total-stars").textContent = formatNumber(totalStars);
  document.getElementById("update-time").textContent = new Date(trendsData.generatedAt).toLocaleDateString("zh-CN");
}
function initCharts() {
  initMainTrendChart();
  initCategoryCharts("frontend", "frontend-trend-chart", "frontend-growth-chart");
  initCategoryCharts("buildTools", "build-trend-chart", "build-growth-chart");
  initCategoryCharts("fullstack", "fullstack-trend-chart", "fullstack-growth-chart");
  initCategoryCharts("orm", "orm-trend-chart", "orm-growth-chart");
  initCategoryCharts("runtime", "runtime-trend-chart", "runtime-growth-chart");
  initEmergingChart();
}
function initMainTrendChart() {
  const chart = echarts.init(document.getElementById("main-trend-chart"));
  charts["main"] = chart;
  updateMainTrendChart();
}
function updateMainTrendChart() {
  var _a, _b;
  const chart = charts["main"];
  const categories = trendsData.categories;
  const series = [];
  let colorIndex = 0;
  Object.entries(categories).forEach(([catKey, repos]) => {
    repos.slice(0, 2).forEach((repo, idx) => {
      const data = filterDataByTimeRange(repo.history);
      series.push({
        name: repo.name,
        type: currentChartType === "area" ? "line" : currentChartType,
        data: data.map((h) => h.stars),
        smooth: true,
        areaStyle: currentChartType === "area" ? { opacity: 0.3 } : void 0,
        lineStyle: { width: 3 },
        itemStyle: { color: colors[colorIndex % colors.length] },
        emphasis: { focus: "series" }
      });
      colorIndex++;
    });
  });
  ((_a = categories.frontend[0]) == null ? void 0 : _a.history.map((h) => h.date)) || [];
  const filteredDates = filterDataByTimeRange(((_b = categories.frontend[0]) == null ? void 0 : _b.history) || []).map((h) => h.date);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: "scroll",
      bottom: 0,
      data: series.map((s) => s.name)
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      boundaryGap: currentChartType === "bar",
      data: filteredDates,
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value) => value >= 1e3 ? value / 1e3 + "k" : value
      }
    },
    series,
    animationDuration: 1e3
  };
  chart.setOption(option, true);
}
function initCategoryCharts(category, trendChartId, growthChartId) {
  const repos = trendsData.categories[category];
  if (!repos || repos.length === 0) return;
  const trendChart = echarts.init(document.getElementById(trendChartId));
  charts[trendChartId] = trendChart;
  const series = repos.slice(0, 5).map((repo, idx) => ({
    name: repo.name,
    type: "line",
    data: filterDataByTimeRange(repo.history).map((h) => h.stars),
    smooth: true,
    lineStyle: { width: 2 },
    itemStyle: { color: colors[idx % colors.length] },
    emphasis: { focus: "series" }
  }));
  const dates = filterDataByTimeRange(repos[0].history).map((h) => h.date);
  trendChart.setOption({
    tooltip: {
      trigger: "axis",
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: "scroll",
      bottom: 0,
      textStyle: { fontSize: 11 }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 10,
        formatter: (value) => value >= 1e3 ? value / 1e3 + "k" : value
      }
    },
    series,
    animationDuration: 800
  });
  const growthChart = echarts.init(document.getElementById(growthChartId));
  charts[growthChartId] = growthChart;
  const growthData = repos.slice(0, 5).map((repo) => ({
    name: repo.name,
    value: parseFloat(repo.growth.yearly)
  }));
  growthChart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: "{b}: +{c}%"
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true
    },
    xAxis: {
      type: "value",
      axisLabel: { formatter: "{value}%" }
    },
    yAxis: {
      type: "category",
      data: growthData.map((d) => d.name).reverse(),
      axisLabel: { fontSize: 11 }
    },
    series: [{
      type: "bar",
      data: growthData.map((d) => d.value).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: "#83bff6" },
          { offset: 0.5, color: "#188df0" },
          { offset: 1, color: "#188df0" }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: "right",
        formatter: "+{c}%",
        fontSize: 10
      }
    }],
    animationDuration: 800
  });
}
function initEmergingChart() {
  const chart = echarts.init(document.getElementById("emerging-trend-chart"));
  charts["emerging"] = chart;
  const repos = trendsData.categories.emerging || [];
  const series = repos.map((repo, idx) => ({
    name: repo.name,
    type: "line",
    data: filterDataByTimeRange(repo.history).map((h) => h.stars),
    smooth: true,
    lineStyle: { width: 3 },
    itemStyle: { color: colors[idx % colors.length] },
    emphasis: { focus: "series" }
  }));
  const dates = repos[0] ? filterDataByTimeRange(repos[0].history).map((h) => h.date) : [];
  chart.setOption({
    title: {
      text: "高增长新兴库对比",
      left: "center",
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: "axis",
      formatter: function(params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      type: "scroll",
      bottom: 0
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value) => value >= 1e3 ? value / 1e3 + "k" : value
      }
    },
    series,
    animationDuration: 1e3
  });
}
function renderRankings() {
  const yearlyContainer = document.getElementById("yearly-growth-ranking");
  yearlyContainer.innerHTML = trendsData.fastestGrowing.map((repo, idx) => `
    <div class="ranking-item">
      <div class="rank-number rank-${idx < 3 ? idx + 1 : "other"}">${idx + 1}</div>
      <div class="repo-info">
        <div class="repo-name">
          <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">${repo.name}</a>
        </div>
        <div class="repo-category">${categoryNames[repo.category] || repo.category}</div>
      </div>
      <div class="growth-badge ${getGrowthClass(repo.growth.yearly)}">+${repo.growth.yearly}%</div>
    </div>
  `).join("");
  const allRepos = Object.values(trendsData.categories).flat();
  const monthlyTop = allRepos.map((r) => ({ ...r, monthlyGrowth: parseFloat(r.growth.monthly) })).sort((a, b) => b.monthlyGrowth - a.monthlyGrowth).slice(0, 10);
  const monthlyContainer = document.getElementById("monthly-growth-ranking");
  monthlyContainer.innerHTML = monthlyTop.map((repo, idx) => `
    <div class="ranking-item">
      <div class="rank-number rank-${idx < 3 ? idx + 1 : "other"}">${idx + 1}</div>
      <div class="repo-info">
        <div class="repo-name">
          <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">${repo.name}</a>
        </div>
        <div class="repo-category">${categoryNames[repo.category] || repo.category}</div>
      </div>
      <div class="growth-badge ${getGrowthClass(repo.growth.monthly)}">+${repo.growth.monthly}%</div>
    </div>
  `).join("");
}
function renderTable() {
  const allRepos = Object.values(trendsData.categories).flat();
  const tbody = document.getElementById("trends-table-body");
  tbody.innerHTML = allRepos.sort((a, b) => b.currentStars - a.currentStars).map((repo, idx) => {
    var _a, _b;
    const history = filterDataByTimeRange(repo.history);
    const trendData = history.map((h) => h.stars);
    const trendSvg = generateSparkline(trendData);
    return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <a href="https://github.com/${repo.owner}/${repo.repo}" target="_blank">
              <strong>${repo.name}</strong>
            </a>
            <br><small style="color:#6c757d">${((_a = repo.description) == null ? void 0 : _a.slice(0, 50)) || ""}${((_b = repo.description) == null ? void 0 : _b.length) > 50 ? "..." : ""}</small>
          </td>
          <td>${categoryNames[repo.category] || repo.category}</td>
          <td><strong>${repo.currentStars.toLocaleString()}</strong></td>
          <td class="${getGrowthClass(repo.growth.monthly)}">+${repo.growth.monthly}%</td>
          <td class="${getGrowthClass(repo.growth.yearly)}">+${repo.growth.yearly}%</td>
          <td>${trendSvg}</td>
        </tr>
      `;
  }).join("");
}
function filterDataByTimeRange(history) {
  if (currentTimeRange === "all") return history;
  return history.slice(-currentTimeRange);
}
function getGrowthClass(value) {
  const num = parseFloat(value);
  if (num >= 50) return "growth-high";
  if (num >= 10) return "growth-medium";
  return "growth-low";
}
function generateSparkline(data) {
  if (!data || data.length < 2) return "";
  const width = 100;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = i / (data.length - 1) * width;
    const y = height - (v - min) / range * height;
    return `${x},${y}`;
  }).join(" ");
  return `<svg class="trend-sparkline" viewBox="0 0 ${width} ${height}">
    <polyline fill="none" stroke="#667eea" stroke-width="2" points="${points}"/>
  </svg>`;
}
function formatNumber(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}
function bindEvents() {
  document.querySelectorAll(".time-range .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".time-range .btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentTimeRange = btn.dataset.range === "all" ? "all" : parseInt(btn.dataset.range);
      refreshCharts();
    });
  });
  document.querySelectorAll(".chart-type .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chart-type .btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentChartType = btn.dataset.type;
      refreshCharts();
    });
  });
  window.addEventListener("resize", () => {
    Object.values(charts).forEach((chart) => chart.resize());
  });
}
function refreshCharts() {
  updateMainTrendChart();
  initCategoryCharts("frontend", "frontend-trend-chart", "frontend-growth-chart");
  initCategoryCharts("buildTools", "build-trend-chart", "build-growth-chart");
  initCategoryCharts("fullstack", "fullstack-trend-chart", "fullstack-growth-chart");
  initCategoryCharts("orm", "orm-trend-chart", "orm-growth-chart");
  initCategoryCharts("runtime", "runtime-trend-chart", "runtime-growth-chart");
  initEmergingChart();
  renderTable();
}
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
const __pageData = JSON.parse('{"title":"Stars 趋势可视化","description":"","frontmatter":{"layout":"default","title":"Stars 趋势可视化"},"headers":[],"relativePath":"trends.md","filePath":"trends.md","lastUpdated":1776397644000}');
const _sfc_main = { name: "trends.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="📈-javascript-typescript-生态系统-stars-趋势" tabindex="-1">📈 JavaScript/TypeScript 生态系统 Stars 趋势 <a class="header-anchor" href="#📈-javascript-typescript-生态系统-stars-趋势" aria-label="Permalink to &quot;📈 JavaScript/TypeScript 生态系统 Stars 趋势&quot;">​</a></h1><blockquote><p>实时追踪 JS/TS 生态系统中热门库的 GitHub Stars 增长趋势</p></blockquote><div class="trends-container"><div class="overview-cards"><div class="card"><div class="card-icon">📦</div><div class="card-content"><div class="card-value" id="total-repos">-</div><div class="card-label">追踪仓库</div></div></div><div class="card"><div class="card-icon">🔥</div><div class="card-content"><div class="card-value" id="fastest-growing">-</div><div class="card-label">增长最快</div></div></div><div class="card"><div class="card-icon">📊</div><div class="card-content"><div class="card-value" id="total-stars">-</div><div class="card-label">总 Stars</div></div></div><div class="card"><div class="card-icon">🕐</div><div class="card-content"><div class="card-value" id="update-time">-</div><div class="card-label">更新时间</div></div></div></div><div class="controls"><div class="time-range"><label>时间范围:</label><button class="btn active" data-range="6">6个月</button><button class="btn" data-range="12">1年</button><button class="btn" data-range="24">2年</button><button class="btn" data-range="all">全部</button></div><div class="chart-type"><label>图表类型:</label><button class="btn active" data-type="line">折线图</button><button class="btn" data-type="bar">柱状图</button><button class="btn" data-type="area">面积图</button></div></div><div class="chart-section"><h2>📈 总体增长趋势</h2><div id="main-trend-chart" class="chart-container"></div></div><div class="chart-section"><h2>🎨 前端框架趋势</h2><div class="chart-grid"><div id="frontend-trend-chart" class="chart-container half"></div><div id="frontend-growth-chart" class="chart-container half"></div></div></div><div class="chart-section"><h2>🔧 构建工具趋势</h2><div class="chart-grid"><div id="build-trend-chart" class="chart-container half"></div><div id="build-growth-chart" class="chart-container half"></div></div></div><div class="chart-section"><h2>🚀 全栈框架趋势</h2><div class="chart-grid"><div id="fullstack-trend-chart" class="chart-container half"></div><div id="fullstack-growth-chart" class="chart-container half"></div></div></div><div class="chart-section"><h2>🗄️ ORM 与数据库工具趋势</h2><div class="chart-grid"><div id="orm-trend-chart" class="chart-container half"></div><div id="orm-growth-chart" class="chart-container half"></div></div></div><div class="chart-section"><h2>⚡ 运行时趋势</h2><div class="chart-grid"><div id="runtime-trend-chart" class="chart-container half"></div><div id="runtime-growth-chart" class="chart-container half"></div></div></div><div class="chart-section"><h2>🌟 新兴库趋势 (高增长)</h2><div id="emerging-trend-chart" class="chart-container"></div></div><div class="chart-section"><h2>🏆 增长排行榜</h2><div class="chart-grid"><div class="ranking-container"><h3>📈 年度增长 Top 10</h3><div id="yearly-growth-ranking"></div></div><div class="ranking-container"><h3>📊 月度增长 Top 10</h3><div id="monthly-growth-ranking"></div></div></div></div><div class="chart-section"><h2>📋 详细数据</h2><div class="table-container"><table id="trends-table"><thead><tr><th>排名</th><th>仓库</th><th>分类</th><th>Stars</th><th>月增长</th><th>年增长</th><th>趋势</th></tr></thead><tbody id="trends-table-body"></tbody></table></div></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("trends.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const trends = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  trends as default
};
