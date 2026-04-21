package com.sliit.paf.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    private Resource resource;

    private String userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;

    private String adminReason;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
}
