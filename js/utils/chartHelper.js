/* ============================================================
   Shopora — js/utils/chartHelper.js
   Reusable Chart.js wrapper utilities.
   Requires Chart.js loaded via CDN in the HTML page.
   ============================================================ */

const ChartHelper = (() => {
  const _charts = {};

  const createBar = (canvasId, labels, data, label = 'Revenue', color = '#ea580c') => {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    _charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label, data, backgroundColor: color + '33', borderColor: color, borderWidth: 2, borderRadius: 6 }]
      },
      options: _defaultOpts()
    });
    return _charts[canvasId];
  };

  const createLine = (canvasId, labels, data, label = 'Sales', color = '#0ea5e9') => {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    _charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label, data, borderColor: color, backgroundColor: color + '15', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: color }]
      },
      options: _defaultOpts()
    });
    return _charts[canvasId];
  };

  const createDoughnut = (canvasId, labels, data, colors = ['#ea580c','#0ea5e9','#10b981','#f59e0b','#a855f7']) => {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    _charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' } } } } }
    });
    return _charts[canvasId];
  };

  const _defaultOpts = () => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: 'Inter' } }, grid: { color: '#1e293b22' } },
      y: { ticks: { color: '#64748b', font: { family: 'Inter' } }, grid: { color: '#1e293b22' } }
    }
  });

  const _destroy = (canvasId) => { if (_charts[canvasId]) { _charts[canvasId].destroy(); delete _charts[canvasId]; } };

  return { createBar, createLine, createDoughnut };
})();
