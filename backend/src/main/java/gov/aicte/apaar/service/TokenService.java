package gov.aicte.apaar.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight bearer-token session store for portal authentication.
 * Tokens are issued by /api/auth/* endpoints and required for privileged mutations
 * (status updates, bulk uploads, college administration).
 */
@Service
public class TokenService {

    public record TokenInfo(String role, String email, String collegeId, Instant expiresAt) {}

    private static final long TTL_SECONDS = 8 * 60 * 60; // 8 hours

    private final Map<String, TokenInfo> tokens = new ConcurrentHashMap<>();

    public String issue(String role, String email, String collegeId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokens.put(token, new TokenInfo(role, email, collegeId, Instant.now().plusSeconds(TTL_SECONDS)));
        return token;
    }

    public Optional<TokenInfo> validate(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        TokenInfo info = tokens.get(token);
        if (info == null) {
            return Optional.empty();
        }
        if (info.expiresAt().isBefore(Instant.now())) {
            tokens.remove(token);
            return Optional.empty();
        }
        return Optional.of(info);
    }

    public void revoke(String token) {
        if (token != null) {
            tokens.remove(token);
        }
    }
}
