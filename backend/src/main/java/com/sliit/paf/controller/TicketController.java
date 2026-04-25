package com.sliit.paf.controller;

import com.sliit.paf.dto.TicketAssignRequest;
import com.sliit.paf.dto.TicketCommentRequest;
import com.sliit.paf.dto.TicketCreateRequest;
import com.sliit.paf.dto.TicketStatusUpdateRequest;
import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.User;
import com.sliit.paf.service.CurrentUserService;
import com.sliit.paf.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    public TicketController(TicketService ticketService, CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request, user));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<Ticket>> getMyTickets(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        User user = currentUserService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId(), pageable));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Page<Ticket>> getAssignedTickets(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        User user = currentUserService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ticketService.getAssignedTickets(user.getId(), pageable));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Ticket>> getAllTickets(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ticketService.getAllTickets(pageable));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable String id,
                                                   @Valid @RequestBody TicketAssignRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request.getTechnicianId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
                                               @Valid @RequestBody TicketStatusUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(ticketService.updateStatus(id, request.getStatus(), request.getResolutionNotes(), user));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                             @Valid @RequestBody TicketCommentRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(ticketService.addComment(id, request.getMessage(), user));
    }
}
