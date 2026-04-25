import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Layers3,
  MonitorSpeaker,
  Plus,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";
import { normalizeRoles, useAuth } from "../context/AuthContext";
import {
  getPrimaryRole,
  getRoleAccent,
  getSidebarItems,
} from "../utils/dashboardConfig";

const emptyForm = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  availability: true,
  status: "ACTIVE",
};

const getResourceIcon = (type = "") => {
  const normalized = type.toLowerCase();
  if (normalized.includes("hall") || normalized.includes("room"))
    return Building2;
  if (normalized.includes("lab") || normalized.includes("computer"))
    return MonitorSpeaker;
  return Layers3;
};

const ResourcesPage = () => {
  const { user, logout } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const primaryRole = getPrimaryRole(roles);
  const isAdmin = roles.includes("ADMIN");
  const accent = getRoleAccent(primaryRole);

  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    minCapacity: "",
    location: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const sidebarItems = useMemo(
    () => getSidebarItems(primaryRole),
    [primaryRole],
  );

  const loadResources = async (nextPage = page) => {
    try {
      const params = {
        page: nextPage,
        size: 9,
        search: filters.search || undefined,
        type: filters.type || undefined,
        minCapacity: filters.minCapacity || undefined,
        location: filters.location || undefined,
      };
      const res = await api.get("/resources", { params });
      setResources(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setPage(res.data?.number || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch resources.");
    }
  };

  useEffect(() => {
    loadResources(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (resource) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      location: resource.location,
      availability: resource.availability,
      status: resource.status,
    });
    setShowModal(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      availability: Boolean(form.availability),
    };

    try {
      if (editingId) {
        await api.put(`/resources/${editingId}`, payload);
      } else {
        await api.post("/resources", payload);
      }
      setShowModal(false);
      await loadResources(page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save resource.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;

    try {
      await api.delete(`/resources/${id}`);
      await loadResources(page);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete resource.");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Facilities Catalogue"
      items={sidebarItems}
      displayRole={primaryRole}
      {...accent}
    >
      <section className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 mb-6">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              className="w-full rounded-xl border border-slate-200/60 bg-white/50 pl-10 pr-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
              placeholder="Search resources"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </label>
          <input
            className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
            placeholder="Type"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
            placeholder="Min Capacity"
            type="number"
            min="1"
            value={filters.minCapacity}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minCapacity: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
            placeholder="Location"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            onClick={() => loadResources(0)}
          >
            Apply Filters
          </button>
          {isAdmin && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" /> Add Resource
            </button>
          )}
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => {
          const Icon = getResourceIcon(resource.type);
          return (
            <article
              key={resource.id}
              className="group flex flex-col justify-between animate-fade-up rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent.accentClassName}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                      resource.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {resource.status}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {resource.name}
                </h3>
                <p className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {resource.type}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <p className="rounded-lg bg-white/50 px-3 py-2 dark:bg-slate-800/50">Capacity: <span className="font-bold">{resource.capacity}</span></p>
                  <p className="rounded-lg bg-white/50 px-3 py-2 dark:bg-slate-800/50">Lo: <span className="font-bold">{resource.location}</span></p>
                  <p className="col-span-2 rounded-lg bg-white/50 px-3 py-2 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5">
                    Availability:{" "}
                    <span className={`font-bold ${resource.availability ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {resource.availability ? "Available" : "Unavailable"}
                    </span>
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-6 flex items-center gap-2 border-t border-slate-200/60 pt-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => openEdit(resource)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 hover:shadow-md dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(resource.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 hover:shadow-md dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => loadResources(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-slate-500">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => loadResources(page + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
        >
          Next
        </button>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="animate-fade-up w-full max-w-lg rounded-[2rem] border border-white/40 bg-white/60 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100 mb-6">
              {editingId ? "Edit Resource" : "Add New Resource"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                placeholder="Type"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                placeholder="Capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, capacity: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                  value={String(form.availability)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      availability: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
                <select
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200 dark:focus:border-indigo-500"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-white/10">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResourcesPage;
