import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { createUserProfile } from "./userService";
import { auth } from "@/lib/firebase";

export async function registerUser(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await createUserProfile(userCredential.user.uid, {
    name: "Dancan",
    email,
    role: "admin",
    workspaceId: "demo-workspace",
  });

  return userCredential.user;
}

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}
