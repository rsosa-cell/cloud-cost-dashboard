export function exportToCSV(data: any[]) {
  const headers = ["date", "service", "cost"];

  const rows = data.map((row) =>
    [row.date, row.service, row.cost].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cloud-costs.csv";
  a.click();
}