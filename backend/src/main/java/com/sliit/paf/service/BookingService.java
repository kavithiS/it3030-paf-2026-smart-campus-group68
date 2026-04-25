package com.sliit.paf.service;

import com.sliit.paf.dto.BookingRequest;
import com.sliit.paf.model.Booking;
import com.sliit.paf.model.BookingStatus;
import com.sliit.paf.model.NotificationType;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.Resource;
import com.sliit.paf.model.ResourceStatus;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.BookingRepository;
import com.sliit.paf.repository.ResourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    public Booking createBooking(BookingRequest request, User user) {
        validateTimeRange(request);

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found."));

        if (!Boolean.TRUE.equals(resource.getAvailability()) || resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new IllegalArgumentException("This resource is currently unavailable.");
        }

        ensureNoConflict(resource.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), null);

        Booking booking = new Booking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setUserId(user.getId());
        booking.setUserName(user.getName());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        notificationService.createForRole(
            Role.ADMIN,
            "New booking request",
            user.getName() + " created a booking request for " + booking.getResourceName() + ".",
            NotificationType.BOOKING_CREATED,
            "BOOKING",
            booking.getId(),
            java.util.Set.of(user.getId()));

        return saved;
    }

    public Page<Booking> getMyBookings(String userId, Pageable pageable) {
        return bookingRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Booking> getAllBookings(Pageable pageable) {
        return bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Booking approveBooking(String bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        ensureNoConflict(booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(), booking.getId());

        booking.setStatus(BookingStatus.APPROVED);
        booking.setDecisionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.createForUser(
                booking.getUserId(),
                Role.USER,
                "Booking approved",
                "Your booking for " + booking.getResourceName() + " has been approved.",
                NotificationType.BOOKING_APPROVED,
                "BOOKING",
                booking.getId());

        return saved;
    }

    public Booking rejectBooking(String bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setDecisionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.createForUser(
                booking.getUserId(),
                Role.USER,
                "Booking rejected",
                "Your booking for " + booking.getResourceName() + " was rejected. Reason: " + reason,
                NotificationType.BOOKING_REJECTED,
                "BOOKING",
                booking.getId());

        return saved;
    }

    public Booking cancelBooking(String bookingId, User actor) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found."));

        boolean owner = booking.getUserId().equals(actor.getId());
        boolean admin = actor.getRoles() != null && actor.getRoles().stream().anyMatch(role -> role.name().equals("ADMIN"));
        if (!owner && !admin) {
            throw new IllegalArgumentException("You are not allowed to cancel this booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    private void validateTimeRange(BookingRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
    }

    private void ensureNoConflict(String resourceId,
                                  java.time.LocalDate date,
                                  java.time.LocalTime start,
                                  java.time.LocalTime end,
                                  String currentBookingId) {
        List<Booking> existing = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                resourceId,
                date,
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED));

        boolean hasConflict = existing.stream().anyMatch(booking -> {
            if (currentBookingId != null && booking.getId().equals(currentBookingId)) {
                return false;
            }
            return start.isBefore(booking.getEndTime()) && end.isAfter(booking.getStartTime());
        });

        if (hasConflict) {
            throw new IllegalArgumentException("Booking conflict detected for the selected time range.");
        }
    }
}
