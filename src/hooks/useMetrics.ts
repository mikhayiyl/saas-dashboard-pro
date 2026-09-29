import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToDashboardData,
  type DashboardDateRange,
  type DashboardMetrics,
} from "@/services/dashboardService";
import { getUserProfile } from "@/services/userService";
import { useEffect, useState } from "react";

const useMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DashboardDateRange>("all");

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    let unsubscribe: (() => void) | undefined;

    async function loadDashboard() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        unsubscribe = subscribeToDashboardData(
          profile.workspaceId,
          (__, metrics) => {
            setMetrics(metrics);
          },
          dateRange,
        );
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    }

    loadDashboard();

    return () => {
      unsubscribe?.();
    };
  }, [user, dateRange]);

  return { metrics, dateRange, setDateRange };
};

export default useMetrics;
