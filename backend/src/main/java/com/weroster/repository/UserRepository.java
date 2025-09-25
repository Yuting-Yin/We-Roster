package com.weroster.repository;

import com.weroster.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByDomainAndEmail(String domain, String email);
    boolean existsByDomainAndEmail(String domain, String email);
}
