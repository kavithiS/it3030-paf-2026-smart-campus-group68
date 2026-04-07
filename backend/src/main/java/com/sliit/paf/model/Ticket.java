package com.sliit.paf.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {
    
    @Id
    private String id;
    
    private String title;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    
    @DBRef
    private User createdBy; // The user who created the ticket
    
    @DBRef
    private User assignedTo; // Technician assigned to this ticket (null if not assigned)
    
    private String rejectionReason; // If ticket is rejected
    private String resolutionNotes; // Technician's resolution notes
    
    private List<String> imageUrls = new ArrayList<>(); // Max 3 images
    
    @DBRef
    private List<Comment> comments = new ArrayList<>();
    
    private Date createdAt;
    private Date updatedAt;
    
    // Constructors
    public Ticket() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.status = TicketStatus.OPEN;
    }
    
    public Ticket(String title, String description, TicketPriority priority, User createdBy) {
        this();
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.createdBy = createdBy;
    }
    
    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { 
        this.status = status;
        this.updatedAt = new Date();
    }
    
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    
    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { 
        this.assignedTo = assignedTo;
        this.updatedAt = new Date();
    }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { 
        this.rejectionReason = rejectionReason;
        this.updatedAt = new Date();
    }
    
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { 
        this.resolutionNotes = resolutionNotes;
        this.updatedAt = new Date();
    }
    
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
