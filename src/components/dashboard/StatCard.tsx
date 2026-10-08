import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  changeContext: string;
  icon: LucideIcon;
  positive?: boolean;
};

function StatCard({
  title,
  value,
  change,
  changeContext,
  icon: Icon,
  positive = true,
}: StatCardProps) {
  const accent = {
    "Total Revenue": "text-[#b7a5ff] bg-[#8a72e8]/[0.13] ring-[#a99bff]/[0.16]",
    "Total Orders": "text-[#a9bdff] bg-[#5476e8]/[0.13] ring-[#91aaff]/[0.16]",
    Customers: "text-[#87cfff] bg-[#46a6c8]/[0.12] ring-[#87cfff]/[0.15]",
    "New Customers": "text-[#87cfff] bg-[#46a6c8]/[0.12] ring-[#87cfff]/[0.15]",
    "Low Stock": "text-[#ffd08c] bg-[#e0a247]/[0.12] ring-[#ffd08c]/[0.15]",
  }[title] ?? "text-[#a9bdff] bg-[#5476e8]/[0.13] ring-[#91aaff]/[0.16]";

  return (
    <div className="dashboard-panel group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0e1726]/90 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-[#111c2d]">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-400">{title}</p>

          <p className="mt-3 text-[34px] font-semibold tracking-[-0.055em] text-white sm:text-[36px]">
            {value}
          </p>
        </div>

        <div className={`flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${accent}`}>
          <Icon className="size-[18px]" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span
          className={`font-medium ${
            change === "Needs attention"
              ? "text-[#ffc77d]"
              : change === "Healthy"
                ? "text-[#87dbc2]"
                : positive
                  ? "text-[#a9bdff]"
                  : "text-[#ff9ba9]"
          }`}
        >
          {change}
        </span>

        <span className="truncate text-xs text-slate-500">{changeContext}</span>
      </div>
    </div>
  );
}

export default StatCard;
