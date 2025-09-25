package com.weroster.repository;

import com.weroster.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByStaffId(@Param("staffId") Long staffId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.startTime >= :startDate AND lr.endTime <= :endDate ORDER BY lr.startTime")
    List<LeaveRequest> findByStaffAndDateRange(@Param("staffId") Long staffId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
}
