type ProductPerformanceData = {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  stock: number;
};

type ProductPerformanceProps = {
  data: ProductPerformanceData[];
};

function ProductPerformance({ data }: ProductPerformanceProps) {
  return (
    <div className="dashboard-panel rounded-2xl border border-white/[0.07] bg-[#0e1726]/90 p-5 sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-tight text-white">
          Product Performance
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">
          Top performing products this month
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-left text-xs text-slate-500">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Orders</th>
              <th className="pb-3 font-medium">Revenue</th>
              <th className="pb-3 text-right font-medium">Stock</th>
            </tr>
          </thead>

          <tbody>
            {data.map((product) => {
              const isLowStock = product.stock <= 10;
              return (
                <tr
                  key={product.id}
                  className="border-b border-white/[0.045] transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="py-3 font-medium text-white">
                    {product.name}
                  </td>

                  <td className="py-3 text-slate-400">{product.orders}</td>

                  <td className="py-3 font-medium text-slate-200">
                    ${product.revenue.toLocaleString()}
                  </td>

                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`size-1.5 rounded-full ${
                          isLowStock ? "bg-[#ff8f9b]" : "bg-[#72dfc4]"
                        }`}
                      />

                      <span
                        className={
                          isLowStock ? "text-[#ff9aa4]" : "text-[#84e4ce]"
                        }
                      >
                        {isLowStock ? "Low" : "Good"}
                      </span>

                      <span className="text-slate-500">{product.stock}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductPerformance;
