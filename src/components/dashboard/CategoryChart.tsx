import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Electronics", value: 42, color: "#38BDF8" },
  { name: "Clothing", value: 28, color: "#8B5CF6" },
  { name: "Home & Office", value: 18, color: "#F59E0B" },
  { name: "Other", value: 12, color: "#10B981" },
];

function CategoryChart() {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0C0D0F] p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Sales by Category
        </h2>

        <p className="mt-1 text-xs text-white/40">Revenue distribution</p>
      </div>

      {/* Donut */}
      <div className="h-55">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>

            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#151619",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.5)",
                marginBottom: "4px",
              }}
              formatter={(value) => [`${value}%`, "Revenue"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center ">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <span className="truncate text-xs text-white/55">
                {item.name}
              </span>
            </div>

            <span className="ml-3 text-xs font-semibold text-white/85">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
