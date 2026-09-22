import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", revenue: 5200, orders: 120 },
  { month: "Feb", revenue: 6800, orders: 145 },
  { month: "Mar", revenue: 6100, orders: 132 },
  { month: "Apr", revenue: 8200, orders: 168 },
  { month: "May", revenue: 7600, orders: 155 },
  { month: "Jun", revenue: 9100, orders: 190 },
  { month: "Jul", revenue: 8400, orders: 178 },
  { month: "Aug", revenue: 10200, orders: 214 },
  { month: "Sep", revenue: 11800, orders: 238 },
];

function RevenueChart() {
  return (
    <div className="h-fit w-full rounded-xl border border-white/8 bg-[#0C0D0F] p-4">
      {/* Header */}

      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Revenue & Orders
        </h2>

        <p className="mt-1 text-xs text-white/40">
          Monthly revenue and order performance
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 4,
              right: 4,
              left: -10,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 11,
              }}
              dy={8}
            />

            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "rgba(255,255,255,0.4)",
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
                fill: "rgba(255,255,255,0.3)",
                fontSize: 11,
              }}
              width={32}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.08)",
              }}
              contentStyle={{
                backgroundColor: "#151619",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.5)",
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
                color: "rgba(255,255,255,0.5)",
              }}
            />

            {/* Revenue */}
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#60A5FA"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#0C0D0F",
              }}
              name="Revenue"
            />

            {/* Orders */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#A78BFA"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#0C0D0F",
              }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
