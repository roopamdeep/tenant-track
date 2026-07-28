import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import type { RootState } from "../store";
import api from "../lib/axios";

interface Unit {
  id: string;
  unitNumber: string;
  rent: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

export default function LandlordDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({ name: "", address: "" });
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState({ unitNumber: "", rent: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/api/properties");
      setProperties(res.data.properties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async () => {
    try {
      await api.post("/api/properties", newProperty);
      setNewProperty({ name: "", address: "" });
      setShowAddProperty(false);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const addUnit = async (propertyId: string) => {
    try {
      await api.post(`/api/properties/${propertyId}/units`, {
        unitNumber: newUnit.unitNumber,
        rent: Number(newUnit.rent),
      });
      setNewUnit({ unitNumber: "", rent: "" });
      setSelectedProperty(null);
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">My Properties</h2>
          <button
            onClick={() => setShowAddProperty(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-2 text-sm transition-colors"
          >
            + Add Property
          </button>
        </div>

        {/* Add Property Form */}
        {showAddProperty && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">New Property</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, name: e.target.value })
                }
                placeholder="Property name"
                className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={newProperty.address}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, address: e.target.value })
                }
                placeholder="Address"
                className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={addProperty}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-4 py-2 text-sm"
              >
                Save Property
              </button>
              <button
                onClick={() => setShowAddProperty(false)}
                className="border border-slate-300 text-slate-600 rounded-xl px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Properties List */}
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : properties.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500">
              No properties yet. Add your first property!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {property.name}
                    </h3>
                    <p className="text-slate-500 text-sm">{property.address}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProperty(property.id)}
                    className="border border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-xl px-3 py-1.5 text-sm transition-colors"
                  >
                    + Add Unit
                  </button>
                </div>

                {/* Add Unit Form */}
                {selectedProperty === property.id && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newUnit.unitNumber}
                        onChange={(e) =>
                          setNewUnit({ ...newUnit, unitNumber: e.target.value })
                        }
                        placeholder="Unit number (e.g. Apt 1A)"
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={newUnit.rent}
                        onChange={(e) =>
                          setNewUnit({ ...newUnit, rent: e.target.value })
                        }
                        placeholder="Monthly rent $"
                        className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addUnit(property.id)}
                        className="bg-blue-600 text-white rounded-xl px-3 py-1.5 text-sm font-medium"
                      >
                        Save Unit
                      </button>
                      <button
                        onClick={() => setSelectedProperty(null)}
                        className="border border-slate-300 text-slate-600 rounded-xl px-3 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Units List */}
                {property.units.length === 0 ? (
                  <p className="text-slate-400 text-sm">No units added yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {property.units.map((unit) => (
                      <div key={unit.id} className="bg-slate-50 rounded-xl p-3">
                        <p className="font-medium text-slate-800 text-sm">
                          {unit.unitNumber}
                        </p>
                        <p className="text-slate-500 text-xs">
                          ${unit.rent}/month
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
