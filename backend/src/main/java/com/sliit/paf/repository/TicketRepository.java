package com.sliit.paf.repository;

import com.sliit.paf.model.Ticket;
import com.sliit.paf.model.TicketStatus;
import com.sliit.paf.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    // Find all tickets created by a specific user
    List<Ticket> findByCreatedBy(User user);
    
    // Find all tickets assigned to a technician
    List<Ticket> findByAssignedTo(User technician);
    
    // Find tickets by status
    List<Ticket> findByStatus(TicketStatus status);
    
    // Find all tickets (for admin)
    List<Ticket> findAll();
}
