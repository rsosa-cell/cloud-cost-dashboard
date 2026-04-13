type Props = {
  total: number;
  budget: number;
};

export default function Alerts({ total, budget }: Props) {
  if (total <= budget) return null;

  return (
    <div className="bg-red-500 text-white p-4 rounded-xl shadow">
      ⚠️ You exceeded your budget of ${budget}! (Current: ${total.toFixed(2)})
    </div>
  );
}