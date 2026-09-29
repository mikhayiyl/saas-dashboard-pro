import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/services/userService";
import type { UserProfile } from "@/types/database";

function AppLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileState, setProfileState] = useState<{
    uid: string;
    profile: UserProfile | null;
  }>({ uid: "", profile: null });

  const profile = user?.uid === profileState.uid ? profileState.profile : null;

  useEffect(() => {
    if (!user) return;

    let isCurrent = true;

    getUserProfile(user.uid)
      .then((loadedProfile) => {
        if (isCurrent) {
          setProfileState({ uid: user.uid, profile: loadedProfile });
        }
      })
      .catch((error) => {
        console.error("Failed to load user profile:", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
      />

      <div className="md:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} profile={profile} />

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
