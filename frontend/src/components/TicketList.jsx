import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/ticketAPI";
import { useNavigate } from "react-router-dom";

const TicketList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTickets();
      setTickets(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "CLOSED":
        return <CheckCircle className="h-5 w-5 text-slate-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tickets...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No tickets found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {getStatusIcon(ticket.status)}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {ticket.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {ticket.createdByName} • {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                {ticket.status}
              </span>
              {ticket.assignedToName && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Assigned to {ticket.assignedToName}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/ticket/${ticket.id}`)}
            className="ml-4 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TicketList;
