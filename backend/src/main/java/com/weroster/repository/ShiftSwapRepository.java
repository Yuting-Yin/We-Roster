package com.weroster.repository;

import com.weroster.entity.ShiftSwap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSwapRepository extends JpaRepository<ShiftSwap, Long> {
    
    @Query("SELECT ss FROM ShiftSwap ss WHERE ss.requester.id = :staffId OR ss.target.id = :staffId ORDER BY ss.dateMade DESC")
    List<ShiftSwap> findByStaffId(@Param("staffId") Long staffId);
    
    @Query("SELECT ss FROM ShiftSwap ss WHERE ss.status = :status ORDER BY ss.dateMade DESC")
    List<ShiftSwap> findByStatus(@Param("status") String status);
}
