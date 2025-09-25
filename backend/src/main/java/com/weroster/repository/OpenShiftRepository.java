package com.weroster.repository;

import com.weroster.entity.OpenShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OpenShiftRepository extends JpaRepository<OpenShift, Long> {
    
    @Query("SELECT os FROM OpenShift os WHERE os.shift.startTs >= :startDate AND os.shift.startTs < :endDate ORDER BY os.shift.startTs")
    List<OpenShift> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT os FROM OpenShift os WHERE DATE(os.shift.startTs) = DATE(:date) ORDER BY os.shift.startTs")
    List<OpenShift> findByDate(@Param("date") LocalDateTime date);
}
