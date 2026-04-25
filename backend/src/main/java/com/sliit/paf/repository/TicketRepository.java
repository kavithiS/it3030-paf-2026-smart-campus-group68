package com.sliit.paf.repository;

import com.sliit.paf.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    Page<Ticket> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Page<Ticket> findAllByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId, Pageable pageable);

    Page<Ticket> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
