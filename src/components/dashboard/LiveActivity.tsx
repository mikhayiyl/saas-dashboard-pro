import { AlertTriangle, Package, ShoppingCart, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getUserProfile } from "../../services/userService";
import { subscribeToActivities } from "../../services/activityService";

import type { Activity } from "../../types/database";

const activityIcons = {
  order: ShoppingCart,
  customer: UserPlus,
  product: Package,
  system: AlertTriangle,
};

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  }

  if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}

function getActivityTitle(activity: Activity) {
  switch (activity.type) {
    case "order":
      return "Order activity";

    case "customer":
      return "Customer activity";

    case "product":
      return "Product activity";

    case "system":
      return "System alert";
  }
}

function LiveActivity() {
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    let unsubscribe: (() => void) | undefined;

    async function loadActivities() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        unsubscribe = subscribeToActivities(profile.workspaceId, (data) => {
          setActivities(data.slice(0, 5));
        });
      } catch (error) {
        console.error("Failed to load activities:", error);
      }
    }

    loadActivities();

    return () => {
      unsubscribe?.();
    };
  }, [user]);
  return (
    <div className="dashboard-panel rounded-2xl border border-white/[0.07] bg-[#0e1726]/90 p-5 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold">Live Activity</h2>

          <span className="size-2 rounded-full bg-emerald-400" />
        </div>

        <p className="mt-1 text-[13px] text-slate-500">
          The latest updates across your workspace
        </p>
      </div>

      <div className="space-y-1">
        {activities.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];

            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-white/[0.035]"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                  <Icon className="size-4 text-slate-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {getActivityTitle(activity)}
                  </p>

                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {activity.message}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-slate-500">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LiveActivity;
