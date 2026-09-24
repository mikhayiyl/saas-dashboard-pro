import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type PieSectorShapeProps,
} from "recharts";

type CategoryChartProps = {
  data: {
    category: string;
    revenue: number;
  }[];
};

const categoryColors = ["#8B5CF6", "#0EA5E9", "#10B981", "#F59E0B", "#F43F5E"];

function CategoryChart({ data }: CategoryChartProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  const chartData = data.map((item) => ({
    ...item,
    percentage:
      totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
  }));

  const renderShape = (props: PieSectorShapeProps) => {
    const { index = 0 } = props;

    return (
      <Sector {...props} fill={categoryColors[index % categoryColors.length]} />
    );
  };

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
              data={chartData}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              stroke="none"
              shape={renderShape}
            />

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
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-3">
        {chartData.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center justify-between"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    categoryColors[index % categoryColors.length],
                }}
              />

              <span className="truncate text-xs text-white/55">
                {item.category}
              </span>
            </div>

            <span className="ml-3 text-xs font-semibold text-white/85">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
