type Props = {
  total: number;
  growth: number;
};

export default function StatsCard({ total, growth }: Props) {
  return (
    <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl mb-6 shadow">
      <h2>Total Spend</h2>
      <p className="text-3xl font-bold">${total.toFixed(2)}</p>
      <p className="text-sm mt-2">Growth: {growth.toFixed(1)}%</p>
    </div>
  );
}