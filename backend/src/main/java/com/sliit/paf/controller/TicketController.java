package com.sliit.paf.controller;

import com.sliit.paf.dto.AddCommentRequest;
import com.sliit.paf.dto.AssignTicketRequest;
import com.sliit.paf.dto.CreateTicketRequest;
import com.sliit.paf.dto.MessageResponse;
import com.sliit.paf.dto.RejectTicketRequest;
import com.sliit.paf.dto.TechnicianResponse;
import com.sliit.paf.dto.TicketResponse;
import com.sliit.paf.model.Comment;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketStatus;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.UserRepository;
import com.sliit.paf.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Helper: Get current authenticated user
     */
    private User getCurrentUser() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new Exception("User not authenticated");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }
        
        return userOpt.get();
    }
    
    /**
     * POST /api/tickets - Create new ticket (USER)
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Title is required"));
            }
            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Description is required"));
            }
            if (request.getPriority() == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Priority is required"));
            }
            if (request.getImageUrls() != null && request.getImageUrls().size() > 3) {
                return ResponseEntity.badRequest().body(new MessageResponse("Maximum 3 images allowed"));
            }
            
            User currentUser = getCurrentUser();
            Ticket ticket = ticketService.createTicket(request, currentUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.convertToResponse(ticket));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * GET /api/tickets - Get tickets based on user role
     * USER: Get own tickets
     * ADMIN: Get all tickets
     * TECHNICIAN: Get assigned tickets
     */
    @GetMapping
    public ResponseEntity<?> getTickets() {
        try {
            User currentUser = getCurrentUser();
            List<Ticket> tickets;
            
            if (currentUser.getRoles().contains(Role.ADMIN)) {
                tickets = ticketService.getAllTickets();
            } else if (currentUser.getRoles().contains(Role.TECHNICIAN)) {
                tickets = ticketService.getAssignedTickets(currentUser);
            } else {
                // USER role
                tickets = ticketService.getUserTickets(currentUser);
            }
            
            List<TicketResponse> responses = tickets.stream()
                    .map(ticketService::convertToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/technicians - List available technicians (ADMIN only)
     */
    @GetMapping("/technicians")
    public ResponseEntity<?> getTechnicians() {
        try {
            User currentUser = getCurrentUser();
            if (!currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Only admins can view technicians"));
            }

            List<TechnicianResponse> technicians = userRepository.findAll().stream()
                    .filter(user -> user.getRoles() != null && user.getRoles().contains(Role.TECHNICIAN))
                    .map(user -> new TechnicianResponse(user.getId(), user.getName(), user.getEmail()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(technicians);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * GET /api/tickets/{id} - Get ticket details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable String id) {
        try {
            getCurrentUser(); // Check authentication
            
            Optional<Ticket> ticketOpt = ticketService.getTicketById(id);
            if (!ticketOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(ticketService.convertToResponse(ticketOpt.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/tickets/{id}/assign - Assign ticket to technician (ADMIN only)
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String id, @RequestBody AssignTicketRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (!currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Only admins can assign tickets"));
            }
            
            Ticket ticket = ticketService.assignTicket(id, request);
            return ResponseEntity.ok(ticketService.convertToResponse(ticket));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/tickets/{id}/status - Update ticket status
     * TECHNICIAN: Can move to RESOLVED
     * ADMIN: Can move to CLOSED
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String resolutionNotes) {
        try {
            User currentUser = getCurrentUser();
            
            Optional<Ticket> ticketOpt = ticketService.getTicketById(id);
            if (!ticketOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Ticket ticket = ticketOpt.get();
            
            // TECHNICIAN can move to RESOLVED
            if (status == TicketStatus.RESOLVED && currentUser.getRoles().contains(Role.TECHNICIAN)) {
                if (!ticket.getAssignedTo().getId().equals(currentUser.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new MessageResponse("You are not assigned to this ticket"));
                }
            }
            // ADMIN can move to CLOSED
            else if (status == TicketStatus.CLOSED && currentUser.getRoles().contains(Role.ADMIN)) {
                // Allowed
            }
            // Everyone else is forbidden
            else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You cannot update this ticket status"));
            }
            
            Ticket updatedTicket = ticketService.updateTicketStatus(id, status, resolutionNotes);
            return ResponseEntity.ok(ticketService.convertToResponse(updatedTicket));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/tickets/{id}/reject - Reject ticket (ADMIN only)
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectTicket(@PathVariable String id, @RequestBody RejectTicketRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (!currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Only admins can reject tickets"));
            }
            
            Ticket ticket = ticketService.rejectTicket(id, request);
            return ResponseEntity.ok(ticketService.convertToResponse(ticket));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * POST /api/tickets/{id}/comments - Add comment to ticket
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody AddCommentRequest request) {
        try {
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Comment content is required"));
            }
            
            User currentUser = getCurrentUser();
            Comment comment = ticketService.addComment(id, request, currentUser);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new MessageResponse("Comment added successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
    
    /**
     * GET /api/tickets/{id}/comments - Get all comments for a ticket
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable String id) {
        try {
            getCurrentUser(); // Check authentication
            List<Comment> comments = ticketService.getTicketComments(id);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
}
