import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setUser } from "../store/authSlice";
import api from "../lib/axios";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"LANDLORD" | "TENANT">("TENANT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      dispatch(
        setUser({ user: res.data.user, accessToken: res.data.accessToken }),
      );
      navigate(res.data.user.role === "LANDLORD" ? "/landlord" : "/tenant");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">🏠 TenantTrack</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Property management made simple
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            Create your account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-slate-600 text-sm mb-1.5 block">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("LANDLORD")}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${role === "LANDLORD" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-600"}`}
                >
                  🏢 Landlord
                </button>
                <button
                  onClick={() => setRole("TENANT")}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${role === "TENANT" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-600"}`}
                >
                  🏠 Tenant
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1.5 block">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-slate-600 text-sm mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-slate-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
