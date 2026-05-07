<script>
  let { data } = $props();
  
  let kpis = $derived([
    { label: 'Visitors', value: data.summary.totalVisitors, change: data.summary.changePercent.visitors, icon: '👥' },
    { label: 'Pageviews', value: data.summary.totalPageviews, change: data.summary.changePercent.pageviews, icon: '👁️' },
    { label: 'Bounce Rate', value: `${(data.summary.avgBounceRate * 100).toFixed(1)}%`, change: data.summary.changePercent.bounceRate, icon: '📉', invert: true },
    { label: 'Avg Duration', value: `${Math.round(data.summary.avgDuration)}s`, change: data.summary.changePercent.duration, icon: '⏱️' },
  ]);
</script>

<h2>Overview</h2>

<div class="kpi-grid">
  {#each kpis as kpi}
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-icon">{kpi.icon}</span>
        <span class="kpi-change" class:positive={kpi.invert ? kpi.change < 0 : kpi.change > 0} class:negative={kpi.invert ? kpi.change > 0 : kpi.change < 0}>
          {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
        </span>
      </div>
      <div class="kpi-value">{kpi.value.toLocaleString()}</div>
      <div class="kpi-label">{kpi.label}</div>
    </div>
  {/each}
</div>

<div class="section">
  <h3>Recent Activity</h3>
  <table class="data-table">
    <thead>
      <tr><th>Date</th><th>Visitors</th><th>Pageviews</th><th>Bounce Rate</th></tr>
    </thead>
    <tbody>
      {#each data.metrics.slice(-7) as metric}
        <tr>
          <td>{metric.date}</td>
          <td>{metric.visitors.toLocaleString()}</td>
          <td>{metric.pageviews.toLocaleString()}</td>
          <td>{(metric.bounceRate * 100).toFixed(1)}%</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  h2 { margin-bottom: 1.5rem; color: #1e293b; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .kpi-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .kpi-icon { font-size: 1.5rem; }
  .kpi-change { font-size: 0.875rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px; }
  .positive { color: #22c55e; background: #f0fdf4; }
  .negative { color: #ef4444; background: #fef2f2; }
  .kpi-value { font-size: 2rem; font-weight: bold; color: #1e293b; }
  .kpi-label { color: #64748b; font-size: 0.875rem; }
  .section { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  h3 { margin-top: 0; color: #1e293b; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
  .data-table th { font-weight: 600; color: #64748b; font-size: 0.875rem; }
</style>
