package com.weroster.repository;

import com.weroster.entity.ShiftDesignationRequirements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftDesignationRequirementsRepository extends JpaRepository<ShiftDesignationRequirements, Long> {
    
    /**
     * Find designation requirements for a specific shift
     */
    List<ShiftDesignationRequirements> findByShiftId(Long shiftId);
    
    /**
     * Find designation requirements by shift entity
     */
    List<ShiftDesignationRequirements> findByShift(com.weroster.entity.Shift shift);
    
    /**
     * Delete all requirements for a specific shift
     */
    void deleteByShiftId(Long shiftId);
}
