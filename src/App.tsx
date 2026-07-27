import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";

function App() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/landlord"
        element={
          user?.role === "LANDLORD" ? (
            <LandlordDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/tenant"
        element={
          user?.role === "TENANT" ? (
            <TenantDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "LANDLORD" ? "/landlord" : "/tenant"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
