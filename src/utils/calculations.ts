export const getServiceData = (expenses: any[]) => {
  return expenses.reduce((acc: any[], item) => {
    const service = item.service || "Unknown";
    const cost = Number(item.cost) || 0;

    const found = acc.find((i) => i.name === service);

    if (found) found.value += cost;
    else acc.push({ name: service, value: cost });

    return acc;
  }, []);
};

export const getTotal = (expenses: any[]) => {
  return expenses.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
};

export const getGrowth = (expenses: any[]) => {
  const monthlyTotals: any = {};

  expenses.forEach((e) => {
    const month = e.date?.slice(0, 7);
    if (!month) return;

    monthlyTotals[month] =
      (monthlyTotals[month] || 0) + Number(e.cost || 0);
  });

  const months = Object.keys(monthlyTotals).sort();

  if (months.length < 2) return 0;

  const last = monthlyTotals[months[months.length - 1]];
  const prev = monthlyTotals[months[months.length - 2]];

  if (prev === 0) return 0;

  return ((last - prev) / prev) * 100;
};

export const getTopService = (serviceData: any[]) => {
  return [...serviceData].sort((a, b) => b.value - a.value)[0];
};

export const getInsights = (growth: number, total: number, topService: any) => {
  const insights: string[] = [];

  if (growth > 20) insights.push("🚨 Spending increased significantly");
  if (topService)
    insights.push(`${topService.name} dominates your spending`);
  if (total > 500) insights.push("💸 High overall cloud spend");

  return insights;
};