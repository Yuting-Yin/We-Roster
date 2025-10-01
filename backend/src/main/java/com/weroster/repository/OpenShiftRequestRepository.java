package com.weroster.repository;

import com.weroster.entity.OpenShiftRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpenShiftRequestRepository extends JpaRepository<OpenShiftRequest, Long> {
    
    /**
     * Find requests by staff member
     */
    List<OpenShiftRequest> findByStaffIdOrderByCreatedAtDesc(Long staffId);
    
    /**
     * Find requests by open shift
     */
    List<OpenShiftRequest> findByOpenShiftIdOrderByCreatedAtDesc(Long openShiftId);
    
    /**
     * Find requests by status
     */
    List<OpenShiftRequest> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Find pending requests
     */
    @Query("SELECT osr FROM OpenShiftRequest osr WHERE osr.status = 'PENDING' ORDER BY osr.createdAt")
    List<OpenShiftRequest> findPendingRequests();
    
    /**
     * Check if staff has already applied for an open shift
     */
    @Query("SELECT osr FROM OpenShiftRequest osr WHERE osr.openShift.id = :openShiftId AND osr.staff.id = :staffId")
    Optional<OpenShiftRequest> findByOpenShiftAndStaff(@Param("openShiftId") Long openShiftId, @Param("staffId") Long staffId);
    
    /**
     * Find requests by staff and status
     */
    List<OpenShiftRequest> findByStaffIdAndStatusOrderByCreatedAtDesc(Long staffId, String status);
}
