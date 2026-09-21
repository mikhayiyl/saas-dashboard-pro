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
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <h2 className="font-semibold">Revenue & Orders</h2>
        <p className="mt-1 text-sm text-white/40">
          Monthly revenue and order performance
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />

            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />

            <YAxis
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#151619",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
            />

            <Legend />

            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              name="Revenue"
            />

            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={2}
              dot={false}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
