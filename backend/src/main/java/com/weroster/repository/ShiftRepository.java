package com.weroster.repository;

import com.weroster.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    
    @Query("SELECT s FROM Shift s WHERE s.startTs >= :startDate AND s.startTs < :endDate ORDER BY s.startTs")
    List<Shift> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Shift s WHERE DATE(s.startTs) = DATE(:date) ORDER BY s.startTs")
    List<Shift> findByDate(@Param("date") LocalDateTime date);
    
    @Query("SELECT s FROM Shift s WHERE s.startTs >= :startDate AND s.startTs < :endDate AND s.department.id = :deptId ORDER BY s.startTs")
    List<Shift> findByDateRangeAndDepartment(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate, 
                                           @Param("deptId") Long deptId);
}
