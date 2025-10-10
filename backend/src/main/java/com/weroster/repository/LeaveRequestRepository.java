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
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByStaffIdOrderByCreatedAtDesc(@Param("staffId") Long staffId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.startTime < :endDate AND lr.endTime > :startDate ORDER BY lr.startTime")
    List<LeaveRequest> findByStaffAndDateRange(@Param("staffId") Long staffId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.createdAt >= :startDate AND lr.createdAt <= :endDate ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findByStaffAndCreatedDateRange(@Param("staffId") Long staffId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.shift.id = :shiftId")
    List<LeaveRequest> findByStaffAndShift(@Param("staffId") Long staffId, @Param("shiftId") Long shiftId);
    
    // New methods that only consider APPROVED and AWAITING requests as duplicates
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.shift.id = :shiftId AND lr.status IN ('APPROVED', 'AWAITING', 'PENDING')")
    List<LeaveRequest> findByStaffAndShiftExcludingDeclined(@Param("staffId") Long staffId, @Param("shiftId") Long shiftId);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.staff.id = :staffId AND lr.startTime < :endDate AND lr.endTime > :startDate AND lr.status IN ('APPROVED', 'AWAITING', 'PENDING') ORDER BY lr.startTime")
    List<LeaveRequest> findByStaffAndDateRangeExcludingDeclined(@Param("staffId") Long staffId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);
}
