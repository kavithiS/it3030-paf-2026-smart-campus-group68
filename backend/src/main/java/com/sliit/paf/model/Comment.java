package com.sliit.paf.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "comments")
public class Comment {
    
    @Id
    private String id;
    
    @DBRef
    private Ticket ticket; // Reference to the ticket
    
    @DBRef
    private User user; // Who posted the comment
    
    private String content;
    private Date createdAt;
    
    // Constructors
    public Comment() {
        this.createdAt = new Date();
    }
    
    public Comment(Ticket ticket, User user, String content) {
        this();
        this.ticket = ticket;
        this.user = user;
        this.content = content;
    }
    
    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
