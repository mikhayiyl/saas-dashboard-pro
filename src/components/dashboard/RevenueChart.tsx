import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueChartProps = {
  data: {
    month: string;
    revenue: number;
    orders: number;
  }[];
};

function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="dashboard-panel revenue-chart-panel h-fit w-full rounded-2xl border border-[#3b4f78]/70 bg-gradient-to-br from-[#152440] to-[#111d33] p-5 shadow-[0_22px_55px_-36px_rgba(81,111,215,0.55)] sm:p-6">
      {/* Header */}

      <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight text-white">
          Revenue & Orders
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">
          Monthly revenue and order performance
        </p>
      </div>

      {/* Chart */}
      <div className="h-80 sm:h-[22rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 4,
              right: 4,
              left: -10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7894ff" stopOpacity={0.3} />
                <stop offset="72%" stopColor="#7894ff" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#7894ff" stopOpacity={0} />
              </linearGradient>
              <filter
                id="revenueGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
            </defs>
            <CartesianGrid
              stroke="rgba(188,204,237,0.1)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--dashboard-chart-axis, rgba(169,185,216,0.72))",
                fontSize: 11,
              }}
              dy={8}
            />

            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--dashboard-chart-axis, rgba(169,185,216,0.72))",
                fontSize: 11,
              }}
              tickFormatter={(value) => `$${value / 1000}k`}
              width={42}
            />

            <YAxis
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--dashboard-chart-axis-muted, rgba(169,185,216,0.55))",
                fontSize: 11,
              }}
              width={32}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(188,204,237,0.18)",
              }}
              contentStyle={{
                backgroundColor: "#121f38",
                border: "1px solid rgba(164,181,220,0.2)",
                borderRadius: "12px",
                padding: "8px 10px",
                fontSize: "12px",
                color: "#e6edfb",
              }}
              labelStyle={{
                color: "#99a8c4",
                marginBottom: "4px",
              }}
              formatter={(value, name) => {
                if (name === "Revenue") {
                  return [`$${Number(value).toLocaleString()}`, name];
                }

                return [value, name];
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              height={24}
              iconType="circle"
              iconSize={7}
              wrapperStyle={{
                fontSize: "11px",
                color: "#b8c6df",
              }}
            />

            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="none"
              fill="url(#revenueFill)"
              legendType="none"
              tooltipType="none"
              name="Revenue fill"
            />

            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#9cb0ff"
              strokeWidth={8}
              strokeOpacity={0.28}
              filter="url(#revenueGlow)"
              dot={false}
              activeDot={false}
              legendType="none"
              tooltipType="none"
              name="Revenue glow"
            />

            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#9cb0ff"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "#152440",
                fill: "#d8e0ff",
              }}
              name="Revenue"
            />

            {/* Orders */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#c0adff"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#152440",
              }}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
