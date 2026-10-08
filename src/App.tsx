import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import useMetrics from "./hooks/useMetrics";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Orders = lazy(() => import("./pages/Orders"));
const Customers = lazy(() => import("./pages/Customers"));
const Reports = lazy(() => import("./pages/Reports"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const Settings = lazy(() => import("./pages/Settings"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));

function AIInsightsRoute() {
  const { metrics } = useMetrics();

  return <AIInsights metrics={metrics} />;
}

function GuestOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef2f8] text-[#142238]">
        <p className="text-sm text-[#738096]">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f8] text-sm text-[#738096]">
          Loading page...
        </div>
      }
    >
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai-insights" element={<AIInsightsRoute />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
export default App;
