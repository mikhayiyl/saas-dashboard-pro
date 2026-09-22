import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  positive?: boolean;
};

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{title}</p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>

        <div
          className={`flex size-10 items-center justify-center rounded-lg ${
            positive ? "bg-emerald-400/10" : "bg-red-400/10"
          }`}
        >
          <Icon
            className={`size-5 ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={positive ? "text-emerald-400" : "text-red-400"}>
          {change}
        </span>

        <span className="text-white/40">from last month</span>
      </div>
    </div>
  );
}

export default StatCard;
