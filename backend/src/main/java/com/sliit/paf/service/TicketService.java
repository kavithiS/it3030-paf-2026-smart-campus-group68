package com.sliit.paf.service;

import com.sliit.paf.dto.AddCommentRequest;
import com.sliit.paf.dto.AssignTicketRequest;
import com.sliit.paf.dto.CreateTicketRequest;
import com.sliit.paf.dto.RejectTicketRequest;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.model.Comment;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketStatus;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.CommentRepository;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new ticket (USER role)
     */
    public Ticket createTicket(CreateTicketRequest request, User user) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCreatedBy(user);
        ticket.setImageUrls(request.getImageUrls()); // Max 3 images validation should be in controller
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Get all tickets created by a user
     */
    public List<Ticket> getUserTickets(User user) {
        return ticketRepository.findByCreatedBy(user);
    }
    
    /**
     * Get all tickets assigned to a technician
     */
    public List<Ticket> getAssignedTickets(User technician) {
        return ticketRepository.findByAssignedTo(technician);
    }
    
    /**
     * Get all tickets (ADMIN only)
     */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    /**
     * Get a specific ticket by ID
     */
    public Optional<Ticket> getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId);
    }
    
    /**
     * Assign ticket to technician (ADMIN only)
     */
    public Ticket assignTicket(String ticketId, AssignTicketRequest request) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }
        
        Optional<User> technicianOpt = userRepository.findById(request.getTechnicianId());
        if (!technicianOpt.isPresent()) {
            throw new Exception("Technician not found");
        }
        
        User technician = technicianOpt.get();
        if (!technician.getRoles().contains(Role.TECHNICIAN)) {
            throw new Exception("User is not a technician");
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS); // Automatically move to IN_PROGRESS
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Update ticket status (TECHNICIAN can move to RESOLVED, ADMIN can move to CLOSED)
     */
    public Ticket updateTicketStatus(String ticketId, TicketStatus newStatus, String resolutionNotes) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        
        // Validate status transitions
        if (newStatus == TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new Exception("Can only mark IN_PROGRESS tickets as RESOLVED");
        }
        
        if (newStatus == TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new Exception("Can only mark RESOLVED tickets as CLOSED");
        }
        
        ticket.setStatus(newStatus);
        if (resolutionNotes != null && !resolutionNotes.isEmpty()) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Reject ticket (ADMIN only)
     */
    public Ticket rejectTicket(String ticketId, RejectTicketRequest request) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(request.getReason());
        
        return ticketRepository.save(ticket);
    }
    
    /**
     * Add comment to ticket
     */
    public Comment addComment(String ticketId, AddCommentRequest request, User user) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        Comment comment = new Comment(ticket, user, request.getContent());
        Comment savedComment = commentRepository.save(comment);
        
        // Add comment to ticket's comments list
        ticket.getComments().add(savedComment);
        ticketRepository.save(ticket);
        
        return savedComment;
    }
    
    /**
     * Get all comments for a ticket
     */
    public List<Comment> getTicketComments(String ticketId) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }
        
        return commentRepository.findByTicket(ticketOpt.get());
    }
    
    /**
     * Convert Ticket to TicketResponse DTO
     */
    public TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedByName(ticket.getCreatedBy().getName());
        response.setCreatedByEmail(ticket.getCreatedBy().getEmail());
        
        if (ticket.getAssignedTo() != null) {
            response.setAssignedToName(ticket.getAssignedTo().getName());
            response.setAssignedToEmail(ticket.getAssignedTo().getEmail());
        }
        
        response.setRejectionReason(ticket.getRejectionReason());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setImageUrls(ticket.getImageUrls());
        response.setCommentCount(ticket.getComments().size());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        
        return response;
    }
}
