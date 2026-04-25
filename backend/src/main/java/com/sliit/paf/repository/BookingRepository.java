package com.sliit.paf.repository;

import com.sliit.paf.model.Booking;
import com.sliit.paf.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByResourceIdAndBookingDateAndStatusIn(String resourceId,
                                                            LocalDate bookingDate,
                                                            Collection<BookingStatus> statuses);

    Page<Booking> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
