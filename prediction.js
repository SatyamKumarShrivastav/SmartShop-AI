// ===== PREDICTION ENGINE — Linear Regression Sales Forecasting =====

function linearRegression(data) {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  data.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function predictNext(data, steps = 6) {
  const { slope, intercept } = linearRegression(data);
  const n = data.length;
  return Array.from({ length: steps }, (_, i) => {
    const val = intercept + slope * (n + i);
    return Math.max(0, Math.round(val));
  });
}

function getCategoryForecast(category, steps = 6) {
  const historical = SALES_DATA[category].monthly;
  const predicted = predictNext(historical, steps);
  const { slope } = linearRegression(historical);
  const trendPct = ((slope / (historical[0] || 1)) * 100).toFixed(1);
  return { historical, predicted, trendPct: parseFloat(trendPct), slope };
}

function getOverallForecast(steps = 6) {
  const historical = getMonthlyTotalRevenue();
  const predicted = predictNext(historical, steps);
  const { slope } = linearRegression(historical);
  const trendPct = ((slope / (historical[0] || 1)) * 100).toFixed(1);
  return { historical, predicted, trendPct: parseFloat(trendPct) };
}

function getTrendBadge(trendPct) {
  if (trendPct > 5) return { icon: '↑', label: `+${trendPct}%`, cls: 'trend-up' };
  if (trendPct < -5) return { icon: '↓', label: `${trendPct}%`, cls: 'trend-down' };
  return { icon: '→', label: `${trendPct}%`, cls: 'trend-flat' };
}

function getKPIs() {
  const totalRev = getTotalRevenue();
  const monthlyTotals = getMonthlyTotalRevenue();
  const lastMonth = monthlyTotals[11];
  const prevMonth = monthlyTotals[10];
  const revChange = (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1);

  const totalOrders = PRODUCTS.reduce((acc, p) => acc + p.monthlySales.reduce((a, b) => a + b, 0), 0);
  const avgOrderValue = Math.round(totalRev / totalOrders);

  const forecast = getOverallForecast(6);
  const forecastTotal = forecast.predicted.reduce((a, b) => a + b, 0);

  return [
    { label: 'Total Revenue', value: `$${(totalRev / 1000000).toFixed(2)}M`, change: `+${revChange}%`, icon: '💰', cls: 'kpi-revenue', up: true },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+8.4%', icon: '📦', cls: 'kpi-orders', up: true },
    { label: 'Avg Order Value', value: `$${avgOrderValue}`, change: '+3.2%', icon: '🛒', cls: 'kpi-aov', up: true },
    { label: '6-Mo Forecast', value: `$${(forecastTotal / 1000000).toFixed(2)}M`, change: `+${forecast.trendPct}%/mo`, icon: '🔮', cls: 'kpi-forecast', up: forecast.trendPct > 0 },
  ];
}

function getTopProducts(limit = 5) {
  return [...PRODUCTS]
    .map(p => {
      const totalSales = p.monthlySales.reduce((a, b) => a + b, 0);
      const revenue = totalSales * p.price;
      const lastMonth = p.monthlySales[11];
      const prevMonth = p.monthlySales[10];
      const trendPct = (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1);
      return { ...p, totalSales, revenue, trendPct: parseFloat(trendPct) };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
