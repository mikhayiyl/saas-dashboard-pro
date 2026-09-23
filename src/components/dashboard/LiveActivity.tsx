import { AlertTriangle, Package, ShoppingCart, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
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
        {activities.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-white/30">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];

            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-white/5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="size-4 text-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {getActivityTitle(activity)}
                  </p>

                  <p className="mt-0.5 truncate text-sm text-white/40">
                    {activity.message}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-white/30">
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
