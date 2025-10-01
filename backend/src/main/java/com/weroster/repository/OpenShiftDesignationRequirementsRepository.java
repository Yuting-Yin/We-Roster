package com.weroster.repository;

import com.weroster.entity.OpenShiftDesignationRequirements;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpenShiftDesignationRequirementsRepository extends JpaRepository<OpenShiftDesignationRequirements, Long> {
    
    /**
     * Find designation requirements for a specific open shift
     */
    List<OpenShiftDesignationRequirements> findByOpenShiftId(Long openShiftId);
    
    /**
     * Find designation requirements by open shift entity
     */
    List<OpenShiftDesignationRequirements> findByOpenShift(com.weroster.entity.OpenShift openShift);
    
    /**
     * Delete all requirements for a specific open shift
     */
    void deleteByOpenShiftId(Long openShiftId);
}
