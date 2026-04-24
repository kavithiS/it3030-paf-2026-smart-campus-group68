package com.sliit.paf.service;

import com.sliit.paf.dto.AdminReviewDto;
import com.sliit.paf.dto.BookingRequestDto;
import com.sliit.paf.model.Booking;
import com.sliit.paf.model.BookingStatus;
import com.sliit.paf.model.Resource;
import com.sliit.paf.repository.BookingRepository;
import com.sliit.paf.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking createBooking(BookingRequestDto dto) {
        if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().isEqual(dto.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!resource.isAvailable()) {
            throw new IllegalArgumentException("Resource is not available for booking");
        }

        // Conflict checking logic
        List<BookingStatus> excludedStatuses = Arrays.asList(BookingStatus.REJECTED, BookingStatus.CANCELLED);
        List<Booking> conflicts = bookingRepository.findByResource_IdAndStatusNotInAndStartTimeLessThanAndEndTimeGreaterThan(
                resource.getId(), excludedStatuses, dto.getEndTime(), dto.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Resource is already booked during this time period");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .userId(dto.getUserId())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public Booking reviewBooking(String bookingId, AdminReviewDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new IllegalArgumentException("Only pending bookings can be reviewed");
        }

        if (dto.isApproved()) {
            booking.setStatus(BookingStatus.APPROVED);
        } else {
            booking.setStatus(BookingStatus.REJECTED);
        }

        booking.setAdminReason(dto.getReason());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the owner can cancel this booking");
        }

        if (booking.getStatus().equals(BookingStatus.REJECTED) || booking.getStatus().equals(BookingStatus.CANCELLED)) {
            throw new IllegalArgumentException("Booking is already in an inactive state");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
