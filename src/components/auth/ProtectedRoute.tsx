import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef2f8] text-[#142238]">
        <p className="text-sm text-[#738096]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
