package com.sliit.paf.service;

import com.sliit.paf.dto.TicketCreateRequest;
import com.sliit.paf.model.NotificationType;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketComment;
import com.sliit.paf.model.TicketStatus;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.TicketRepository;
import com.sliit.paf.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Ticket createTicket(TicketCreateRequest request, User user) {
        List<String> images = request.getImages() == null ? List.of() : request.getImages();
        if (images.size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 images are allowed.");
        }

        Ticket ticket = new Ticket();
        ticket.setCategory(request.getCategory().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setImages(images);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setUserId(user.getId());
        ticket.setUserName(user.getName());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        notificationService.createForRole(
            Role.ADMIN,
            "New incident ticket",
            user.getName() + " created a ticket in category " + ticket.getCategory() + ".",
            NotificationType.TICKET_CREATED,
            "TICKET",
            ticket.getId(),
            Set.of(user.getId()));

        return saved;
    }

    public Page<Ticket> getMyTickets(String userId, Pageable pageable) {
        return ticketRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Ticket> getAssignedTickets(String technicianId, Pageable pageable) {
        return ticketRepository.findAllByAssignedTechnicianIdOrderByCreatedAtDesc(technicianId, pageable);
    }

    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Ticket assignTechnician(String ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found."));

        if (technician.getRoles() == null || !technician.getRoles().contains(Role.TECHNICIAN)) {
            throw new IllegalArgumentException("Selected user is not a technician.");
        }

        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getName());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        notificationService.createForUser(
            technician.getId(),
            Role.TECHNICIAN,
            "Ticket assigned",
            "You have been assigned ticket #" + ticket.getId() + ".",
            NotificationType.TICKET_ASSIGNED,
            "TICKET",
            ticket.getId());

        return saved;
    }

    public Ticket updateStatus(String ticketId, TicketStatus status, String resolutionNotes, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));

        boolean assignedTechnician = ticket.getAssignedTechnicianId() != null && ticket.getAssignedTechnicianId().equals(actor.getId());
        boolean admin = actor.getRoles() != null && actor.getRoles().contains(Role.ADMIN);

        if (!assignedTechnician && !admin) {
            throw new IllegalArgumentException("You cannot update this ticket.");
        }

        ticket.setStatus(status);
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        notificationService.createForUser(
                ticket.getUserId(),
            Role.USER,
                "Ticket update",
                "Ticket #" + ticket.getId() + " status changed to " + status + ".",
                NotificationType.TICKET_STATUS_UPDATED,
                "TICKET",
                ticket.getId());

        notificationService.createForRole(
            Role.ADMIN,
            "Ticket status updated",
            "Ticket #" + ticket.getId() + " was updated to " + status + " by " + actor.getName() + ".",
            NotificationType.TICKET_STATUS_UPDATED,
            "TICKET",
            ticket.getId(),
            Set.of(actor.getId()));

        return saved;
    }

    public Ticket addComment(String ticketId, String message, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));

        TicketComment comment = new TicketComment();
        comment.setCommentId(UUID.randomUUID().toString());
        comment.setAuthorId(actor.getId());
        comment.setAuthorName(actor.getName());
        comment.setMessage(message.trim());
        comment.setCreatedAt(LocalDateTime.now());

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        List<User> participants = new ArrayList<>();
        participants.add(userRepository.findById(ticket.getUserId()).orElse(null));

        if (ticket.getAssignedTechnicianId() != null && !ticket.getAssignedTechnicianId().isBlank()) {
            participants.add(userRepository.findById(ticket.getAssignedTechnicianId()).orElse(null));
        }

        participants.addAll(userRepository.findAllByRolesContaining(Role.ADMIN));

        notificationService.createForParticipants(
                participants,
                "New ticket comment",
                actor.getName() + " commented on ticket #" + ticket.getId() + ".",
                NotificationType.TICKET_COMMENT_ADDED,
                "TICKET",
                ticket.getId(),
                new HashSet<>(Set.of(actor.getId())));

        return saved;
    }
}
