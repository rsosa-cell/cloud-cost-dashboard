type Props = {
  data: { name: string; value: number }[];
};

export default function Insights({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">AI Insights</h2>

      <ul className="space-y-1 text-sm">
        {data.map((item) => (
          <li key={item.name}>
            {item.name}: ${item.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}