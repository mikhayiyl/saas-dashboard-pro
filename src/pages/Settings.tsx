import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import type { UserProfile } from "../types/database";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { signOut, updatePassword } from "firebase/auth";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/Firebase";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Settings = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      if (!user) return;

      try {
        setLoading(true);

        await user.reload();

        const authEmail = user.email;

        if (!authEmail) {
          throw new Error("Authenticated email not found.");
        }

        const data = await getUserProfile(user.uid);

        if (!data) {
          throw new Error("User profile not found.");
        }

        if (data.email !== authEmail) {
          await updateUserProfile(user.uid, {
            email: authEmail,
          });

          data.email = authEmail;
        }

        setProfile(data);
        setName(data.name);
      } catch (error) {
        console.error("Failed to load profile:", error);

        toast.error("Unable to load profile", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleSave() {
    if (!user || !profile) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    if (trimmedName === profile.name) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateUserProfile(user.uid, {
        name: trimmedName,
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              name: trimmedName,
            }
          : current,
      );

      toast.success("Profile updated", {
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast.error("Unable to update profile", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  async function handleEmailChange() {
    if (!user?.email) return;

    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }

    if (trimmedEmail === user.email) {
      toast.info("This is already your current email");
      return;
    }

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    try {
      setIsUpdatingEmail(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, trimmedEmail);

      toast.success("Verification email sent", {
        description:
          "Check your new email address and verify it to complete the change.",
      });

      setNewEmail("");
      setCurrentPassword("");
      setIsEmailDialogOpen(false);

      setProfile((current) =>
        current
          ? {
              ...current,
              email: trimmedEmail,
            }
          : current,
      );

      setNewEmail("");
      setCurrentPassword("");
      setIsEmailDialogOpen(false);

      toast.success("Email updated", {
        description: "Your email address has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update email:", error);

      toast.error("Unable to update email", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  }
  async function handlePasswordReset() {
    if (!user?.email) return;

    try {
      await sendPasswordResetEmail(auth, user.email);

      toast.success("Password reset email sent", {
        description:
          "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);

      toast.error("Unable to send reset email", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);

      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Failed to sign out:", error);

      toast.error("Unable to sign out", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

          <p className="text-sm text-muted-foreground">
            Manage your account and workspace.
          </p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading profile...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

          <p className="text-sm text-muted-foreground">
            Manage your account and workspace.
          </p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Unable to load your profile.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <p className="text-sm text-muted-foreground">
          Manage your account and workspace.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>

          <CardDescription>Your personal account information.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>

              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <div className="flex gap-2">
                <Input id="email" value={profile.email} disabled />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewEmail(profile.email);
                    setIsEmailDialogOpen(true);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>

              <Input
                id="role"
                value={profile.role}
                disabled
                className="capitalize"
              />
            </div>

            {/* Workspace */}
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace ID</Label>

              <Input id="workspace" value={profile.workspaceId} disabled />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>

          <CardDescription>Manage your account security.</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Password</p>

            <p className="text-sm text-muted-foreground">
              Send a password reset link to your email.
            </p>
          </div>

          <Button variant="outline" onClick={handlePasswordReset}>
            Reset password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>

          <CardDescription>Manage your current session.</CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Sign out</p>

            <p className="text-sm text-muted-foreground">
              Sign out of this account on this device.
            </p>
          </div>

          <Button variant="destructive" onClick={handleLogout}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email address</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>

              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="new@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>

              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEmailDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleEmailChange}
                disabled={isUpdatingEmail}
              >
                {isUpdatingEmail ? "Updating..." : "Update email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
