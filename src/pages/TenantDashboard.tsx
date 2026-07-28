import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import type { RootState } from "../store";
import api from "../lib/axios";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  unit: { unitNumber: string; property: { name: string } };
}

export default function TenantDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    unitId: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/maintenance/my");
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    try {
      await api.post("/api/maintenance", newRequest);
      setNewRequest({ title: "", description: "", unitId: "" });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const statusColor = (status: string) => {
    if (status === "SUBMITTED") return "bg-yellow-100 text-yellow-700";
    if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Maintenance Requests
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors"
          >
            + New Request
          </button>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">
              Submit Maintenance Request
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newRequest.unitId}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, unitId: e.target.value })
                }
                placeholder="Unit ID"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, title: e.target.value })
                }
                placeholder="Issue title (e.g. Broken heater)"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, description: e.target.value })
                }
                placeholder="Describe the issue..."
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={submitRequest}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-2 text-sm"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-slate-300 text-slate-600 rounded-xl px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500">No maintenance requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {req.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {req.description}
                    </p>
                    <p className="text-slate-400 text-xs mt-2">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor(req.status)}`}
                  >
                    {req.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
