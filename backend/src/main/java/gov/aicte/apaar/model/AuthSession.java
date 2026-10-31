package gov.aicte.apaar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** Shared token session record so authenticated sessions work across backend replicas. */
@Entity
@Table(name = "auth_sessions")
public class AuthSession {
    @Id
    @Column(length = 64)
    private String token;
    @Column(nullable = false, length = 32)
    private String role;
    @Column(nullable = false, length = 120)
    private String email;
    @Column(length = 32)
    private String collegeId;
    @Column(nullable = false)
    private Instant expiresAt;

    protected AuthSession() {}

    public AuthSession(String token, String role, String email, String collegeId, Instant expiresAt) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.collegeId = collegeId;
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getEmail() { return email; }
    public String getCollegeId() { return collegeId; }
    public Instant getExpiresAt() { return expiresAt; }
}
