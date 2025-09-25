package com.weroster.repository;

import com.weroster.entity.UserStaff;
import com.weroster.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStaffRepository extends JpaRepository<UserStaff, Long> {
    @Query("SELECT us FROM UserStaff us WHERE us.user = :user")
    Optional<UserStaff> findUserStaffByUser(@Param("user") User user);
}
