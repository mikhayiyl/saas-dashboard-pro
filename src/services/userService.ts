import { ref, set } from "firebase/database";

import { db } from "../lib/Firebase";

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
