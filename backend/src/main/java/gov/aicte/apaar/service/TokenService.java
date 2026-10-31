package gov.aicte.apaar.service;

import gov.aicte.apaar.model.AuthSession;
import gov.aicte.apaar.repository.AuthSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Database-backed bearer-token session store for portal authentication.
 * Tokens are issued by /api/auth/* endpoints and required for privileged mutations
 * (status updates, bulk uploads, college administration).
 */
@Service
public class TokenService {

    public record TokenInfo(String role, String email, String collegeId, Instant expiresAt) {}

    private static final long TTL_SECONDS = 8 * 60 * 60; // 8 hours

    private final AuthSessionRepository sessions;

    public TokenService(AuthSessionRepository sessions) {
        this.sessions = sessions;
    }

    @Transactional
    public String issue(String role, String email, String collegeId) {
        sessions.deleteByExpiresAtBefore(Instant.now());
        String token = UUID.randomUUID().toString().replace("-", "");
        Instant expiresAt = Instant.now().plusSeconds(TTL_SECONDS);
        sessions.save(new AuthSession(token, role, email, collegeId, expiresAt));
        return token;
    }

    @Transactional
    public Optional<TokenInfo> validate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return sessions.findById(token).filter(info -> {
            if (info.getExpiresAt().isBefore(Instant.now())) {
                sessions.delete(info);
                return false;
            }
            return true;
        }).map(info -> new TokenInfo(info.getRole(), info.getEmail(), info.getCollegeId(), info.getExpiresAt()));
    }

    @Transactional
    public void revoke(String token) {
        if (token != null) {
            sessions.deleteById(token);
        }
    }

    @Transactional
    public void revokeCollegeSessions(String collegeId) {
        if (collegeId != null) {
            sessions.deleteByCollegeId(collegeId);
        }
    }
}
