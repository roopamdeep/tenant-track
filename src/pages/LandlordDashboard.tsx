import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function LandlordDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">🏠 TenantTrack</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Landlord Dashboard
        </h2>
        <p className="text-slate-500">Properties and units coming soon!</p>
      </main>
    </div>
  );
}
