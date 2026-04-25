import axios from "axios";

const API_URL = "http://localhost:8080/api/tickets";

// Get JWT token from localStorage (set during login)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const ticketAPI = {
  // Create a new ticket
  createTicket: (data) => axios.post(API_URL, data, getAuthHeaders()),

  // Get tickets (based on user role)
  getTickets: () => axios.get(API_URL, getAuthHeaders()),

  // Get all technicians (admin only)
  getTechnicians: () => axios.get(`${API_URL}/technicians`, getAuthHeaders()),

  // Get specific ticket
  getTicket: (id) => axios.get(`${API_URL}/${id}`, getAuthHeaders()),

  // Assign ticket to technician
  assignTicket: (id, technicianId) =>
    axios.put(
      `${API_URL}/${id}/assign`,
      { technicianId },
      getAuthHeaders()
    ),

  // Update ticket status
  updateTicketStatus: (id, status, resolutionNotes) =>
    axios.put(
      `${API_URL}/${id}/status`,
      {},
      {
        params: { status, resolutionNotes },
        ...getAuthHeaders(),
      }
    ),

  // Reject ticket
  rejectTicket: (id, reason) =>
    axios.put(
      `${API_URL}/${id}/reject`,
      { reason },
      getAuthHeaders()
    ),

  // Add comment
  addComment: (id, content) =>
    axios.post(
      `${API_URL}/${id}/comments`,
      { content },
      getAuthHeaders()
    ),

  // Get comments
  getComments: (id) => axios.get(`${API_URL}/${id}/comments`, getAuthHeaders()),
};
