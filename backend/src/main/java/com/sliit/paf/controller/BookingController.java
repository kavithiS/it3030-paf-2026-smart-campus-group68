package com.sliit.paf.controller;

import com.sliit.paf.dto.AdminReviewDto;
import com.sliit.paf.dto.BookingRequestDto;
import com.sliit.paf.model.Booking;
import com.sliit.paf.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        boolean hasFilter = status != null || resourceId != null || from != null || to != null;
        List<Booking> bookings = hasFilter
                ? bookingService.getFilteredBookings(status, resourceId, from, to)
                : bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<Booking>> getUserBookings(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDto dto) {
        try {
            Booking booking = bookingService.createBooking(dto);
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred");
        }
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewBooking(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String adminUserId,
            @RequestBody AdminReviewDto dto) {
        try {
            Booking booking = bookingService.reviewBooking(id, adminUserId, dto);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Booking booking = bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
