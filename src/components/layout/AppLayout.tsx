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
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return window.localStorage.getItem("simplizerpro-theme") === "light"
        ? "light"
        : "dark";
    } catch (error) {
      console.error("Failed to read the saved workspace theme:", error);
      return "dark";
    }
  });
  const [profileState, setProfileState] = useState<{
    uid: string;
    profile: UserProfile | null;
  }>({ uid: "", profile: null });

  const profile = user?.uid === profileState.uid ? profileState.profile : null;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      window.localStorage.setItem("simplizerpro-theme", theme);
    } catch (error) {
      console.error("Failed to save the workspace theme:", error);
    }
  }, [theme]);

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
    <div
      className="workspace-theme min-h-screen bg-[#0d1628] text-[#edf2fc]"
      data-theme={theme}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
      />

      <div className="min-h-screen md:ml-65">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          profile={profile}
          theme={theme}
          onToggleTheme={() =>
            setTheme((currentTheme) =>
              currentTheme === "dark" ? "light" : "dark",
            )
          }
        />

        <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
