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

const categoryColors = ["#7894ff", "#b7a5ff", "#87cfff", "#ffd08c", "#ff9ba9"];

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
    <div className="dashboard-panel rounded-2xl border border-white/[0.07] bg-[#0e1726]/90 p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight text-white">
          Sales by Category
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">Revenue distribution</p>
      </div>

      {/* Donut */}
      <div className="h-52">
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
                backgroundColor: "#121f38",
                border: "1px solid rgba(164,181,220,0.2)",
                borderRadius: "12px",
                padding: "8px 10px",
                fontSize: "12px",
                color: "#e6edfb",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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

              <span className="truncate text-[13px] text-[#738096]">
                {item.category}
              </span>
            </div>

            <span className="ml-3 text-[13px] font-semibold text-[#34435a]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryChart;
