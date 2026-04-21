import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { CalendarCheck2, SlidersHorizontal, Plus, Pencil, Trash2, X, CheckCircle2 } from "lucide-react";

const EMPTY_FORM = { name: '', resourceType: '', capacity: '', location: '', isAvailable: true };

export default function ResourceManagementPage() {
  const { user, logout } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = () => {
    setLoading(true);
    api.get('/resources')
      .then((res) => setResources(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (resource) => {
    setEditing(resource.id);
    setForm({
      name: resource.name || '',
      resourceType: resource.type || resource.resourceType || '',
      capacity: resource.capacity || '',
      location: resource.location || '',
      isAvailable: resource.isAvailable ?? true,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity) || 0,
      };
      if (editing) {
        await api.put(`/resources/${editing}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      setShowModal(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return;
    try {
      await api.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete resource');
    }
  };

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: CalendarCheck2, route: "/admin-dashboard" },
    { key: "resources", label: "Manage Resources", icon: SlidersHorizontal, route: "/admin/resources" },
  ];

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Admin Dashboard"
      items={sidebarItems}
      displayRole="ADMIN"
      accentClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentButtonClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentTextClassName="text-blue-100/90"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[#1E2A50] to-[#3B4A89] px-6 py-7 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
                RESOURCE MANAGEMENT
              </p>
              <h2 className="mt-2 text-2xl font-bold">Campus Resources</h2>
              <p className="mt-1 text-sm text-blue-50/90">Add, edit, or remove bookable resources.</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No resources yet. Add one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">Name</th>
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">Type</th>
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">Location</th>
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">Capacity</th>
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">Status</th>
                    <th className="pb-3 font-semibold text-gray-500 uppercase tracking-wide text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 font-medium text-gray-900">{r.name}</td>
                      <td className="py-3.5 text-gray-600">{r.type || r.resourceType}</td>
                      <td className="py-3.5 text-gray-600">{r.location || '—'}</td>
                      <td className="py-3.5 text-gray-600">{r.capacity || '—'}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          r.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {r.isAvailable ? <><CheckCircle2 className="w-3 h-3" /> Available</> : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm">{error}</div>
              )}

              {[
                { label: 'Name', key: 'name', type: 'text', placeholder: 'e.g. Lab A101' },
                { label: 'Type', key: 'resourceType', type: 'text', placeholder: 'Room / Lab / Equipment' },
                { label: 'Location', key: 'location', type: 'text', placeholder: 'e.g. Building B, Floor 2' },
                { label: 'Capacity', key: 'capacity', type: 'number', placeholder: 'Max attendees' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for booking</label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
