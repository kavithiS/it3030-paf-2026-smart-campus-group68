package com.sliit.paf.repository;

import com.sliit.paf.model.Comment;
import com.sliit.paf.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    // Find all comments for a ticket
    List<Comment> findByTicket(Ticket ticket);
}
