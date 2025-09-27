package com.weroster.repository;

import com.weroster.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmail(String email);
    
    @Query("SELECT s FROM Staff s WHERE s.status = 'Active'")
    List<Staff> findActiveStaff();
    
    @Query("SELECT s FROM Staff s JOIN s.staffDepartments sd WHERE sd.department.id = :deptId AND s.status = 'Active'")
    List<Staff> findByDepartmentId(@Param("deptId") Long deptId);
}
