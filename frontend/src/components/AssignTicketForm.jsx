import React, { useEffect, useState } from "react";
import { ticketAPI } from "../services/ticketAPI";
import { MessageResponse } from "../types";

const AssignTicketForm = ({ ticketId, currentAssignee, onSuccess }) => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // In a real app, you'd fetch technicians from an API
    // For now, you might need to create a service to get all technicians
    // Placeholder - you'll need to add this endpoint to the backend
  }, []);

  const handleAssign = async () => {
    if (!selectedTechnicianId) {
      setError("Please select a technician");
      return;
    }

    setLoading(true);
    try {
      await ticketAPI.assignTicket(ticketId, selectedTechnicianId);
      setSelectedTechnicianId("");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-3 font-semibold">Assign to Technician</h3>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentAssignee && (
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Currently assigned to: <span className="font-semibold">{currentAssignee}</span>
        </p>
      )}

      <div className="flex gap-2">
        <select
          value={selectedTechnicianId}
          onChange={(e) => setSelectedTechnicianId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a technician...</option>
          {/* You'll populate this with technicians from the API */}
        </select>
        <button
          onClick={handleAssign}
          disabled={loading || !selectedTechnicianId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign"}
        </button>
      </div>
    </div>
  );
};

export default AssignTicketForm;
