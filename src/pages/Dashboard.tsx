import { useEffect, useState } from "react";
import Alerts from "../components/ui/Alerts";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  date: string;
  service: string;
  cost: number;
};

type ServicePoint = {
  name: string;
  value: number;
};

export default function Dashboard() {
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [projectId, setProjectId] = useState("");
  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");

  const [errorMsg, setErrorMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const [insights, setInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const BUDGET = 100;

  // ----------------------
  // FETCH DATA
  // ----------------------
  const fetchData = async () => {
    if (!projectId.trim()) return;

    try {
      setLoading(true);
      setStatus("loading");

      const res = await fetch(
        `http://localhost:5001/costs?projectId=${projectId}`
      );

      if (!res.ok) throw new Error("Failed to fetch costs");

      const json = await res.json();
      setData(json);
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // AUTO REFRESH
  // ----------------------
  useEffect(() => {
    if (!projectId || status !== "success") return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [projectId, status]);

  // ----------------------
  // AI INSIGHTS
  // ----------------------
  const fetchInsights = async () => {
    if (!data) return;

    setAiLoading(true);
    setInsights("");

    try {
      const res = await fetch("http://localhost:5001/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daily: data.daily ?? [],
          services: data.services ?? [],
          total: data.total ?? 0,
        }),
      });

      const json = await res.json();
      setInsights(json.insights || "No insights returned.");
    } catch {
      setInsights("AI request failed.");
    } finally {
      setAiLoading(false);
    }
  };

  // ----------------------
  // DATA
  // ----------------------
  const lineData: DataPoint[] =
    data?.daily?.map((d: any) => ({
      date: typeof d.date === "object" ? d.date.value : d.date,
      service: d.service,
      cost: Number(d.cost) || 0,
    })) ?? [];

  const serviceData: ServicePoint[] = data?.services ?? [];
  const totalSpend = Number(data?.total) || 0;

  const avgCost =
    lineData.length > 0 ? totalSpend / lineData.length : 0;

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  const hasData = !!data;

  // ----------------------
  // METRICS
  // ----------------------
  const trendUp =
    lineData.length > 1
      ? lineData[lineData.length - 1].cost >
        lineData[lineData.length - 2].cost
      : false;

  const topServices = [...serviceData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const overBudget = totalSpend > BUDGET;

  const avgDaily =
    lineData.reduce((acc, d) => acc + d.cost, 0) /
    (lineData.length || 1);

  const spikeDetected = lineData.some(
    (d) => d.cost > avgDaily * 2
  );

  const projectedMonthly = avgDaily * 30;

  const savings = Math.max(0, totalSpend - BUDGET);

  // ----------------------
  // EMPTY STATE
  // ----------------------
  const EmptyState = () => (
    <div className="h-56 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#111827]">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Enter a GCP Project ID to view billing analytics
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-16 space-y-6 bg-gray-50 dark:bg-[#0b1220] min-h-screen">

      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Cloud Cost Dashboard
      </h1>

      {/* BUDGET */}
      {overBudget && (
        <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          ⚠ Budget exceeded — ${totalSpend.toFixed(2)}
        </div>
      )}

      {/* SPIKE */}
      {spikeDetected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-xl">
          ⚡ Spike detected in usage costs
        </div>
      )}

      {/* INPUT */}
      <div className="bg-white dark:bg-[#111827] border rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-500">GCP Project ID</p>

          {/* FIXED BUTTON */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="text-xs text-blue-600 hover:underline"
          >
            Where can I find this?
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="flex-1 p-2 border rounded dark:bg-gray-900"
          />
          <button
            onClick={fetchData}
            disabled={!projectId || loading}
            className="bg-blue-600 text-white px-4 rounded"
          >
            {loading ? "Loading..." : "Connect"}
          </button>
        </div>
      </div>

      {/* HELP MODAL FIXED */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white dark:bg-[#111827] p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold mb-3">
              Find Project ID
            </h2>
            <ol className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li>Go to Google Cloud Console</li>
              <li>Select project dropdown</li>
              <li>Copy Project ID</li>
            </ol>
          </div>
        </div>
      )}

      {/* AI */}
      {hasData && (
        <div className="bg-white dark:bg-[#111827] border rounded-xl p-4">
          <div className="flex justify-between">
            <h2 className="font-medium">AI Insights</h2>

            <button
              onClick={fetchInsights}
              disabled={aiLoading}
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded"
            >
              {aiLoading ? "Analyzing..." : "Generate"}
            </button>
          </div>

          {insights && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {insights}
            </p>
          )}
        </div>
      )}

      <Alerts total={totalSpend} budget={BUDGET} />

      {/* STATS */}
      {hasData && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-[#111827] border rounded">
            <p>Total</p>
            <b>${totalSpend.toFixed(2)}</b>
          </div>

          <div className="p-4 bg-white dark:bg-[#111827] border rounded">
            <p>Projected</p>
            <b>${projectedMonthly.toFixed(2)}/mo</b>
          </div>

          <div className="p-4 bg-white dark:bg-[#111827] border rounded">
            <p>Trend</p>
            <b>{trendUp ? "↑ Up" : "↓ Down"}</b>
          </div>

          <div className="p-4 bg-white dark:bg-[#111827] border rounded">
            <p>Savings</p>
            <b>${savings.toFixed(2)}</b>
          </div>
        </div>
      )}

      {/* TOP SERVICES */}
      {hasData && (
        <div className="bg-white dark:bg-[#111827] border rounded p-4">
          <h2 className="font-medium mb-2">
            Top Services
          </h2>
          {topServices.map((s, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{s.name}</span>
              <span>${s.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* CHART + TOGGLES + CSV */}
      {hasData && (
        <div className="bg-white dark:bg-[#111827] border rounded-xl p-6">

          <div className="flex justify-between items-center mb-4">

            {/* FIXED TOGGLES */}
            <div className="flex gap-2">
              {["LINE", "BAR", "PIE"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t.toLowerCase() as any)}
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === t.toLowerCase()
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* CSV (RESTORED + WORKING) */}
            <button
              onClick={() => {
                const rows = [
                  ["date", "service", "cost"],
                  ...lineData.map((d) => [
                    d.date,
                    d.service,
                    d.cost,
                  ]),
                ];

                const blob = new Blob(
                  [rows.map((r) => r.join(",")).join("\n")],
                  { type: "text/csv" }
                );

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "cloud-costs.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Export CSV
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="cost" stroke="#3b82f6" />
                </LineChart>
              ) : chartType === "bar" ? (
                <BarChart data={serviceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              ) : (
                <PieChart>
  <Pie
    data={serviceData}
    dataKey="value"
    nameKey="name"
  >
    {serviceData.map((_, i) => (
      <Cell key={i} fill={COLORS[i % COLORS.length]} />
    ))}
  </Pie>

  <Tooltip
    formatter={(value: any) => [`$${value}`, "Cost"]}
    labelFormatter={(label: any) => `Service: ${label}`}
  />
</PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!hasData && <EmptyState />}
    </div>
  );
}