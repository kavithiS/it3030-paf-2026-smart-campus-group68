import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../services/ticketAPI";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id, user?.roles]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketRes = await ticketAPI.getTicket(id);
      setTicket(ticketRes.data);

      const commentsRes = await ticketAPI.getComments(id);
      setComments(commentsRes.data);

      if (user?.roles?.includes("ADMIN")) {
        const techRes = await ticketAPI.getTechnicians();
        setTechnicians(techRes.data || []);
        if (ticketRes.data?.assignedToEmail) {
          const assignedTech = (techRes.data || []).find(
            (tech) => tech.email === ticketRes.data.assignedToEmail,
          );
          setSelectedTechnicianId(assignedTech?.id || "");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTechnicianId) {
      setError("Please select a technician");
      return;
    }

    setAssigning(true);
    try {
      await ticketAPI.assignTicket(id, selectedTechnicianId);
      await fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign ticket");
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await ticketAPI.addComment(id, commentText);
      setCommentText("");
      fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await ticketAPI.updateTicketStatus(id, newStatus, "");
      fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleRejectTicket = async () => {
    if (!rejectReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      await ticketAPI.rejectTicket(id, rejectReason);
      fetchTicketDetails();
      setShowRejectForm(false);
      setRejectReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject ticket");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-8">Ticket not found</div>;
  }

  const isAssigned = user?.email === ticket.assignedToEmail;
  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Ticket Info */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              {ticket.status === "OPEN" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
              {ticket.status === "IN_PROGRESS" && <Clock className="h-5 w-5 text-blue-500" />}
              {ticket.status === "RESOLVED" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {ticket.status === "REJECTED" && <XCircle className="h-5 w-5 text-red-500" />}
              <span className="font-semibold text-lg">{ticket.status}</span>
            </div>

            <p className="mb-4 text-slate-600 dark:text-slate-400">{ticket.description}</p>

            {ticket.imageUrls && ticket.imageUrls.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Images</h3>
                <div className="flex gap-2">
                  {ticket.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="ticket"
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Resolution Notes
                </h3>
                <p className="text-green-800 dark:text-green-200">{ticket.resolutionNotes}</p>
              </div>
            )}

            {ticket.rejectionReason && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Rejection Reason
                </h3>
                <p className="text-red-800 dark:text-red-200">{ticket.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isAssigned && ticket.status === "IN_PROGRESS" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("RESOLVED")}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
          )}

          {isAdmin && ticket.status === "RESOLVED" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("CLOSED")}
                className="flex-1 rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
              >
                Close Ticket
              </button>
            </div>
          )}

          {isAdmin && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Reject Ticket
              </button>
            </div>
          )}

          {showRejectForm && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRejectTicket}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 rounded-lg bg-slate-300 px-4 py-2 hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold">Comments ({comments.length})</h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-slate-500">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{comment.user.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Priority Badge */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">PRIORITY</p>
            <div
              className={`rounded-lg px-3 py-2 text-center font-semibold ${
                ticket.priority === "LOW" ? "bg-green-100 text-green-800" :
                ticket.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                ticket.priority === "HIGH" ? "bg-orange-100 text-orange-800" :
                "bg-red-100 text-red-800"
              }`}
            >
              {ticket.priority}
            </div>
          </div>

          {/* Created By */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">CREATED BY</p>
            <p className="font-semibold">{ticket.createdByName}</p>
            <p className="text-sm text-slate-500">{ticket.createdByEmail}</p>
          </div>

          {/* Assigned To */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">ASSIGNED TO</p>
            {ticket.assignedToName ? (
              <>
                <p className="font-semibold">{ticket.assignedToName}</p>
                <p className="text-sm text-slate-500">{ticket.assignedToEmail}</p>
              </>
            ) : (
              <p className="text-slate-500">Not assigned yet</p>
            )}
          </div>

          {isAdmin && (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">ASSIGN TECHNICIAN</p>
              <div className="space-y-2">
                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select technician...</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} ({tech.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignTicket}
                  disabled={assigning || !selectedTechnicianId}
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Ticket"}
                </button>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">DATES</p>
            <p className="text-xs text-slate-500">
              Created: {new Date(ticket.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">
              Updated: {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
