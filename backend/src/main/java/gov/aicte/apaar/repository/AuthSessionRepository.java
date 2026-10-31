package gov.aicte.apaar.repository;

import gov.aicte.apaar.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface AuthSessionRepository extends JpaRepository<AuthSession, String> {
    void deleteByExpiresAtBefore(Instant instant);
    void deleteByCollegeId(String collegeId);
}
