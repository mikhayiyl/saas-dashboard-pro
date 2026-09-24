import { get, ref, set } from "firebase/database";
import { db } from "../lib/Firebase";

import type { UserProfile } from "../types/database";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `users/${uid}`));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as UserProfile;
}

type CreateUserProfileData = {
  name: string;
  email: string;
  role: string;
  workspaceId: string;
};

export async function createUserProfile(
  uid: string,
  data: CreateUserProfileData,
) {
  await set(ref(db, `users/${uid}`), {
    ...data,
    createdAt: Date.now(),
  });
}
