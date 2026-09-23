import { onValue, push, ref, set } from "firebase/database";

import { db } from "../lib/firebase";
import type { Activity } from "../types/database";

type CreateActivityData = Omit<Activity, "id" | "timestamp">;

export async function createActivity(
  data: CreateActivityData,
): Promise<string> {
  const activitiesRef = ref(db, `workspaces/${data.workspaceId}/activities`);

  const activityRef = push(activitiesRef);

  if (!activityRef.key) {
    throw new Error("Unable to generate activity ID.");
  }

  const activity: Activity = {
    ...data,
    id: activityRef.key,
    timestamp: Date.now(),
  };

  await set(activityRef, activity);

  return activityRef.key;
}

export function subscribeToActivities(
  workspaceId: string,
  callback: (activities: Activity[]) => void,
) {
  const activitiesRef = ref(db, `workspaces/${workspaceId}/activities`);

  return onValue(
    activitiesRef,
    (snapshot) => {
      const activities: Activity[] = [];

      snapshot.forEach((childSnapshot) => {
        const activity = childSnapshot.val() as Activity;

        activities.push({
          ...activity,
          id: childSnapshot.key ?? activity.id,
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);

      callback(activities);
    },
    (error) => {
      console.error("Failed to subscribe to activities:", error);
    },
  );
}
