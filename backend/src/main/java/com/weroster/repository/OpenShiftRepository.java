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
    
    @Query("SELECT os FROM OpenShift os WHERE os.startTs >= :startDate AND os.startTs < :endDate ORDER BY os.startTs")
    List<OpenShift> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT os FROM OpenShift os WHERE DATE(os.startTs) = DATE(:date) ORDER BY os.startTs")
    List<OpenShift> findByDate(@Param("date") LocalDateTime date);
    
    @Query("SELECT os FROM OpenShift os WHERE os.status = 'AVAILABLE' AND os.startTs >= :startDate AND os.startTs < :endDate ORDER BY os.startTs")
    List<OpenShift> findAvailableByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
