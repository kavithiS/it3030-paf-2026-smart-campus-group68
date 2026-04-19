package com.sliit.paf.controller;

import com.sliit.paf.dto.AdminReviewDto;
import com.sliit.paf.dto.BookingRequestDto;
import com.sliit.paf.model.Booking;
import com.sliit.paf.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    private String getCurrentUserId(String userIdHeader) {
        return userIdHeader != null && !userIdHeader.isEmpty() ? userIdHeader : "admin123";
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/user")
    public ResponseEntity<List<Booking>> getUserBookings(@RequestHeader(value="X-User-Id", required=false, defaultValue="user1") String userId) {
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
    public ResponseEntity<?> reviewBooking(@PathVariable String id, @RequestBody AdminReviewDto dto) {
        try {
            Booking booking = bookingService.reviewBooking(id, dto);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, @RequestHeader(value="X-User-Id", required=false, defaultValue="user1") String userId) {
        try {
            Booking booking = bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
