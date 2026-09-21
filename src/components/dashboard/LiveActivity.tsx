import { AlertTriangle, ShoppingCart, UserPlus } from "lucide-react";

type Activity = {
  type: "order" | "customer" | "stock";
  title: string;
  description: string;
  time: string;
};

const activities: Activity[] = [
  {
    type: "order",
    title: "New order #1042",
    description: "Laptop + Mouse · $1,050",
    time: "2 min ago",
  },
  {
    type: "customer",
    title: "New customer",
    description: "Sarah joined your customers",
    time: "5 min ago",
  },
  {
    type: "stock",
    title: "Stock alert",
    description: "Keyboard · 8 units left",
    time: "8 min ago",
  },
  {
    type: "order",
    title: "New order #1041",
    description: "Monitor · $450",
    time: "12 min ago",
  },
];

const activityIcons = {
  order: ShoppingCart,
  customer: UserPlus,
  stock: AlertTriangle,
};

function LiveActivity() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Live Activity</h2>

          <span className="size-2 rounded-full bg-emerald-400" />
        </div>

        <p className="mt-1 text-sm text-white/40">
          Recent activity across your business
        </p>
      </div>

      <div className="space-y-1">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];

          return (
            <div
              key={`${activity.title}-${activity.time}`}
              className="flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-white/5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <Icon className="size-4 text-white/60" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{activity.title}</p>

                <p className="mt-0.5 truncate text-sm text-white/40">
                  {activity.description}
                </p>
              </div>

              <span className="shrink-0 text-xs text-white/30">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LiveActivity;
