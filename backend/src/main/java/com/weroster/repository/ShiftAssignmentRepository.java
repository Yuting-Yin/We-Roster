package com.weroster.repository;

import com.weroster.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    
    @Query("SELECT sa FROM ShiftAssignment sa WHERE sa.staff.id = :staffId AND sa.shift.startTs >= :startDate AND sa.shift.startTs < :endDate ORDER BY sa.shift.startTs")
    List<ShiftAssignment> findByStaffAndDateRange(@Param("staffId") Long staffId, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT sa FROM ShiftAssignment sa WHERE sa.shift.id = :shiftId")
    List<ShiftAssignment> findByShiftId(@Param("shiftId") Long shiftId);
    
    @Query("SELECT sa FROM ShiftAssignment sa WHERE sa.staff.id = :staffId AND sa.shift.startTs >= :startDate AND sa.shift.startTs < :endDate ORDER BY sa.shift.startTs")
    List<ShiftAssignment> findByStaffAndDate(@Param("staffId") Long staffId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
}
