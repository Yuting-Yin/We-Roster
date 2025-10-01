package com.weroster.repository;

import com.weroster.entity.OpenShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpenShiftAssignmentRepository extends JpaRepository<OpenShiftAssignment, Long> {
    
    /**
     * Find assignments by open shift
     */
    List<OpenShiftAssignment> findByOpenShiftIdOrderByAssignedAtAsc(Long openShiftId);
    
    /**
     * Find assignments by staff member
     */
    List<OpenShiftAssignment> findByStaffIdOrderByAssignedAtDesc(Long staffId);
    
    /**
     * Find active assignments by open shift
     */
    @Query("SELECT osa FROM OpenShiftAssignment osa WHERE osa.openShift.id = :openShiftId AND osa.status = 'ACTIVE' ORDER BY osa.assignedAt")
    List<OpenShiftAssignment> findActiveAssignmentsByOpenShift(@Param("openShiftId") Long openShiftId);
    
    /**
     * Find active assignments by staff member
     */
    @Query("SELECT osa FROM OpenShiftAssignment osa WHERE osa.staff.id = :staffId AND osa.status = 'ACTIVE' ORDER BY osa.assignedAt")
    List<OpenShiftAssignment> findActiveAssignmentsByStaff(@Param("staffId") Long staffId);
    
    /**
     * Check if staff is already assigned to an open shift
     */
    @Query("SELECT osa FROM OpenShiftAssignment osa WHERE osa.openShift.id = :openShiftId AND osa.staff.id = :staffId AND osa.status = 'ACTIVE'")
    Optional<OpenShiftAssignment> findActiveAssignmentByOpenShiftAndStaff(@Param("openShiftId") Long openShiftId, @Param("staffId") Long staffId);
    
    /**
     * Find assignments by status
     */
    List<OpenShiftAssignment> findByStatusOrderByAssignedAtDesc(String status);
}
