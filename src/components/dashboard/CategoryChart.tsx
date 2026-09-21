import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Electronics", value: 42 },
  { name: "Clothing", value: 28 },
  { name: "Home & Office", value: 18 },
  { name: "Other", value: 12 },
];

const COLORS = [
  "#ffffff",
  "rgba(255,255,255,0.65)",
  "rgba(255,255,255,0.4)",
  "rgba(255,255,255,0.2)",
];

function CategoryChart() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <h2 className="font-semibold">Sales by Category</h2>
        <p className="mt-1 text-sm text-white/40">Revenue distribution</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#151619",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              formatter={(value) => `${value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />

              <span className="text-white/60">{item.name}</span>
            </div>

            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
