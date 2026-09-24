import { onValue, push, ref, set, update } from "firebase/database";

import { db } from "../lib/Firebase";
import type { Notification } from "../types/database";

type CreateNotificationData = Omit<Notification, "id" | "timestamp">;

export async function createNotification(
  data: CreateNotificationData,
): Promise<string> {
  const notificationsRef = ref(
    db,
    `workspaces/${data.workspaceId}/notifications`,
  );

  const notificationRef = push(notificationsRef);

  if (!notificationRef.key) {
    throw new Error("Unable to generate notification ID.");
  }

  const notification: Notification = {
    ...data,
    id: notificationRef.key,
    timestamp: Date.now(),
  };

  await set(notificationRef, notification);

  return notificationRef.key;
}

export function subscribeToNotifications(
  workspaceId: string,
  callback: (notifications: Notification[]) => void,
) {
  const notificationsRef = ref(db, `workspaces/${workspaceId}/notifications`);

  return onValue(notificationsRef, (snapshot) => {
    const notifications: Notification[] = [];

    snapshot.forEach((childSnapshot) => {
      const notification = childSnapshot.val() as Notification;

      notifications.push({
        ...notification,
        id: childSnapshot.key ?? notification.id,
      });
    });

    notifications.sort((a, b) => b.timestamp - a.timestamp);

    callback(notifications);
  });
}

export async function markNotificationAsRead(
  workspaceId: string,
  notificationId: string,
): Promise<void> {
  const notificationRef = ref(
    db,
    `workspaces/${workspaceId}/notifications/${notificationId}`,
  );

  await update(notificationRef, {
    read: true,
  });
}

export async function markAllNotificationsAsRead(
  workspaceId: string,
  notifications: Notification[],
): Promise<void> {
  const updates: Record<string, boolean> = {};

  for (const notification of notifications) {
    if (!notification.read) {
      updates[
        `workspaces/${workspaceId}/notifications/${notification.id}/read`
      ] = true;
    }
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await update(ref(db), updates);
}
