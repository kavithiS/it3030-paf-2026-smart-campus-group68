package com.sliit.paf.dto;

import com.sliit.paf.model.TicketPriority;
import java.util.List;

public class CreateTicketRequest {
    private String title;
    private String description;
    private TicketPriority priority;
    private List<String> imageUrls; // Optional: base64 encoded or URLs
    
    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
