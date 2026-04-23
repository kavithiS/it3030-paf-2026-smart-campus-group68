package com.sliit.paf.repository;

import com.sliit.paf.model.Booking;
import com.sliit.paf.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    // Conflict checking: same resource, status not in excluded list, and time overlaps
    List<Booking> findByResource_IdAndStatusNotInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            List<BookingStatus> excludedStatuses,
            LocalDateTime endTime,
            LocalDateTime startTime);
}
