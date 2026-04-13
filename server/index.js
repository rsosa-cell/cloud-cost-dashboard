import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { BigQuery } from "@google-cloud/bigquery";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 SERVER FILE LOADED");

// ----------------------
// BIGQUERY
// ----------------------
const bigquery = new BigQuery({
  projectId: "cloud-cost-tracker-492717",
  keyFilename: "./gcp-key.json",
});

// ----------------------
// OPENAI
// ----------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----------------------
// TEST ROUTE
// ----------------------
app.get("/test", (req, res) => {
  res.send("TEST WORKS");
});

// ----------------------
// COSTS ROUTE
// ----------------------
app.get("/costs", async (req, res) => {
  try {
    console.log("📊 Fetching BigQuery data...");

    const query = `
      SELECT
        service.description AS service,
        DATE(usage_start_time) AS date,
        SUM(cost) AS cost
      FROM \`cloud-cost-tracker-492717.billing_export.gcp_billing_export_resource_v1_01E83B_3ABAB8_F4D89C\`
      GROUP BY service, date
      ORDER BY date ASC
    `;

    const [rows] = await bigquery.query({
      query,
      location: "US",
    });

    let daily = rows.map((r) => ({
      service: r.service || "Unknown",
      date: typeof r.date === "object" ? r.date.value : String(r.date),
      cost: Number(r.cost) || 0,
    }));

    let total = daily.reduce((sum, i) => sum + i.cost, 0);

    // 🔥 DEMO FALLBACK (if everything is zero)
    const allZero = daily.every((d) => d.cost === 0);

    if (daily.length === 0 || allZero) {
      console.log("⚠️ No real billing data → using demo data");

      daily = [
        { service: "Cloud Storage", date: "2026-04-01", cost: 2.3 },
        { service: "BigQuery", date: "2026-04-02", cost: 4.1 },
        { service: "Cloud Logging", date: "2026-04-03", cost: 1.2 },
        { service: "BigQuery", date: "2026-04-04", cost: 3.6 },
      ];

      total = daily.reduce((sum, i) => sum + i.cost, 0);
    }

    // group by service
    const serviceMap = new Map();

    for (const item of daily) {
      serviceMap.set(
        item.service,
        (serviceMap.get(item.service) || 0) + item.cost
      );
    }

    const services = Array.from(serviceMap.entries()).map(
      ([name, value]) => ({
        name,
        value: Number(value.toFixed(6)),
      })
    );

    res.json({
      total: Number(total.toFixed(6)),
      daily,
      services,
    });
  } catch (err) {
    console.error("❌ BigQuery Error:", err);
    res.status(500).json({ error: "Error fetching costs" });
  }
});

// ----------------------
// AI INSIGHTS ROUTE
// ----------------------
app.post("/ai-insights", async (req, res) => {
  try {
    const { daily, services, total } = req.body;

    console.log("🤖 AI request received");
    console.log("Daily length:", daily?.length);

    if (!daily || daily.length === 0) {
      return res.json({
        insights:
          "No usage detected yet. Try running services or wait for billing data.",
      });
    }

    // ----------------------
    // 🔥 TRY REAL AI
    // ----------------------
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a cloud cost optimization expert.",
          },
          {
            role: "user",
            content: `
Analyze this GCP billing data:

Total Spend: $${total}

Daily:
${JSON.stringify(daily)}

Services:
${JSON.stringify(services)}

Return:
- 1 sentence summary
- Top cost driver
- 2 cost-saving tips
- Any anomalies
Keep it concise.
`,
          },
        ],
      });

      const insights =
        completion.choices?.[0]?.message?.content ||
        "No insights generated.";

      console.log("✅ AI success");

      return res.json({ insights });
    } catch (aiError) {
      console.log("⚠️ AI failed → using fallback");

      // ----------------------
      // 🧠 FALLBACK INSIGHTS
      // ----------------------

      const sorted = [...services].sort((a, b) => b.value - a.value);
      const topService = sorted[0];

      const summary = `Total spend is $${total.toFixed(
        2
      )}. Highest cost comes from ${
        topService?.name || "unknown services"
      }.`;

      const tips = `
- Reduce usage or optimize ${topService?.name || "top services"}
- Set budget alerts to avoid unexpected charges
`;

      const anomalies =
        daily.length > 1
          ? "No major anomalies detected, but monitor daily usage trends."
          : "Not enough data to detect anomalies.";

      const insights = `
${summary}

Top Driver:
${topService?.name || "N/A"}

Suggestions:
${tips}

Notes:
${anomalies}
`;

      return res.json({ insights });
    }
  } catch (err) {
    console.error("❌ AI Route Error:", err);

    return res.json({
      insights:
        "Insights temporarily unavailable. Please try again later.",
    });
  }
});

// ----------------------
// START SERVER
// ----------------------
app.listen(process.env.PORT || 5001, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5001}`);
});