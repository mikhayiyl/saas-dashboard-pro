type Product = {
  name: string;
  orders: number;
  revenue: string;
  stock: number;
};

const products: Product[] = [
  {
    name: "Laptop",
    orders: 248,
    revenue: "$24,800",
    stock: 42,
  },
  {
    name: "Monitor",
    orders: 193,
    revenue: "$19,300",
    stock: 36,
  },
  {
    name: "Keyboard",
    orders: 171,
    revenue: "$8,550",
    stock: 8,
  },
  {
    name: "Mouse",
    orders: 154,
    revenue: "$4,620",
    stock: 64,
  },
];

function ProductPerformance() {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0C0D0F] p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Product Performance
        </h2>

        <p className="mt-1 text-xs text-white/40">
          Top performing products this month
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-left text-xs text-white/40">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Orders</th>
              <th className="pb-3 font-medium">Revenue</th>
              <th className="pb-3 text-right font-medium">Stock</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isLowStock = product.stock < 10;

              return (
                <tr
                  key={product.name}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/2"
                >
                  <td className="py-3 font-medium text-white">
                    {product.name}
                  </td>

                  <td className="py-3 text-white/60">{product.orders}</td>

                  <td className="py-3 font-medium text-white/80">
                    {product.revenue}
                  </td>

                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`size-1.5 rounded-full ${
                          isLowStock ? "bg-red-400" : "bg-emerald-400"
                        }`}
                      />

                      <span
                        className={
                          isLowStock ? "text-red-400" : "text-emerald-400"
                        }
                      >
                        {isLowStock ? "Low" : "Good"}
                      </span>

                      <span className="text-white/30">{product.stock}</span>
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
