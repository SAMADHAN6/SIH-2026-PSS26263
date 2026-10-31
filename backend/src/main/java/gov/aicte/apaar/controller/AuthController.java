package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.service.TokenService;
import gov.aicte.apaar.service.RequestRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.time.Duration;

/**
 * Authentication endpoints for the three portal roles.
 * - College Admin: institutional credentials or Google account e-mail (must match a registered institution)
 * - AICTE Super Admin: configured administrator credentials
 * - Registration: creates a real institutional record (zeroed statistics) in the database
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CollegeRepository collegeRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final RequestRateLimiter rateLimiter;

    @Value("${apaar.admin.email:admin@aicte.gov.in}")
    private String adminEmail;

    @Value("${apaar.admin.password:Aicte@2026}")
    private String adminPassword;

    @Value("${app.auth.google-login-enabled:true}")
    private boolean googleLoginEnabled;

    public AuthController(CollegeRepository collegeRepository,
                          TokenService tokenService,
                          PasswordEncoder passwordEncoder,
                          RequestRateLimiter rateLimiter) {
        this.collegeRepository = collegeRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/college-login")
    public ResponseEntity<?> collegeLogin(@RequestBody Map<String, String> body, HttpServletRequest request) {
        if (isRateLimited(request, "college-login", 10, Duration.ofMinutes(15))) return tooManyRequests();
        String email = trimOrNull(body.get("email"));
        String password = body.get("password");

        if (email == null || password == null) {
            return badRequest("Institutional email and passkey are required.");
        }

        Optional<College> collegeOpt = collegeRepository.findByEmailIgnoreCase(email);
        if (collegeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "INVALID_CREDENTIALS",
                    "message", "No institution is registered with this email. Please register your institution first."
            ));
        }

        College college = collegeOpt.get();
        if (college.getPasswordHash() == null || !passwordEncoder.matches(password, college.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "INVALID_CREDENTIALS",
                    "message", "Incorrect passkey for this institutional email."
            ));
        }

        if (!Boolean.TRUE.equals(college.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "SUSPENDED",
                    "message", "This institution's portal access has been suspended by AICTE. Contact the Regional Bureau."
            ));
        }

        return ResponseEntity.ok(sessionPayload(college));
    }

    /**
     * Google federated sign-in: resolves the Google account e-mail against registered institutions.
     * Works for any Google account that has been linked to an institution (during registration).
     */
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        if (!googleLoginEnabled) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(Map.of(
                    "success", false,
                    "error", "GOOGLE_LOGIN_DISABLED",
                    "message", "Google sign-in is disabled until verified Google OAuth is configured."
            ));
        }
        String email = trimOrNull(body.get("email"));

        if (email == null || !email.contains("@")) {
            return badRequest("A valid Google account email is required.");
        }

        Optional<College> collegeOpt = collegeRepository.findByEmailIgnoreCase(email);
        if (collegeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "NO_LINKED_INSTITUTION",
                    "message", "No institution is linked to this Google account. Use institutional sign-in or register your college."
            ));
        }

        College college = collegeOpt.get();
        if (!Boolean.TRUE.equals(college.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "SUSPENDED",
                    "message", "This institution's portal access has been suspended by AICTE."
            ));
        }

        return ResponseEntity.ok(sessionPayload(college));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body, HttpServletRequest request) {
        if (isRateLimited(request, "admin-login", 5, Duration.ofMinutes(15))) return tooManyRequests();
        String email = trimOrNull(body.get("email"));
        String password = body.get("password");

        if (adminEmail.equalsIgnoreCase(email) && adminPassword.equals(password)) {
            String token = tokenService.issue("AICTE_SUPER_ADMIN", adminEmail, null);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "role", "AICTE_SUPER_ADMIN",
                    "email", adminEmail
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "error", "INVALID_CREDENTIALS",
                "message", "Invalid AICTE administrator credentials."
        ));
    }

    /**
     * Institutional registration: creates a REAL database record with zeroed statistics.
     * The new institution immediately appears on the national dashboard and can
     * onboard students via bulk upload.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCollege(@RequestBody Map<String, String> body, HttpServletRequest request) {
        if (isRateLimited(request, "register", 5, Duration.ofHours(1))) return tooManyRequests();
        String name = trimOrNull(body.get("name"));
        String email = trimOrNull(body.get("email"));
        String password = body.get("password");
        String state = trimOrNull(body.get("state"));
        String city = trimOrNull(body.get("city"));
        String pid = trimOrNull(body.get("pid"));

        if (name == null || email == null || password == null || password.length() < 6) {
            return badRequest("Institution name, official email and a passkey of at least 6 characters are required.");
        }

        if (collegeRepository.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "error", "EMAIL_ALREADY_REGISTERED",
                    "message", "An institution is already registered with this email. Please sign in instead."
            ));
        }

        String id = "COL" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String code = "AICTE-" + (state != null && state.length() >= 2 ? state.substring(0, 2).toUpperCase() : "IN")
                + "-" + (pid != null ? pid.replaceAll("[^0-9]", "").isEmpty() ? "NEW" + (int) (100 + Math.random() * 900) : pid.replaceAll("[^0-9]", "") : "NEW" + (int) (100 + Math.random() * 900));

        College college = new College();
        college.setId(id);
        college.setName(name);
        college.setCode(code);
        college.setState(state != null ? state : "National");
        college.setCity(city != null ? city : "Main Campus");
        college.setEmail(email);
        college.setPasswordHash(passwordEncoder.encode(password));
        // Newly self-registered institutions must be reviewed by an AICTE admin.
        college.setActive(false);

        // A newly registered institution starts with REAL, zeroed statistics.
        college.setApprovedIntake(parseIntOr(body.get("approvedIntake"), 0));
        college.setActualEnrolment(0);
        college.setVerifiedCount(0);
        college.setPendingCount(0);
        college.setDuplicateCount(0);
        college.setSupernumeraryQuota(0);
        college.setNriCount(0);
        college.setFnCount(0);

        collegeRepository.save(college);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "registered", true,
                "pendingApproval", true,
                "collegeName", college.getName(),
                "message", "Institution submitted for AICTE review. Portal access will be enabled after approval."
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Auth-Token", required = false) String token) {
        tokenService.revoke(token);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> sessionPayload(College college) {
        String token = tokenService.issue("COLLEGE_ADMIN", college.getEmail(), college.getId());
        return Map.of(
                "success", true,
                "token", token,
                "role", "COLLEGE_ADMIN",
                "email", college.getEmail(),
                "collegeId", college.getId(),
                "collegeName", college.getName(),
                "college", college
        );
    }

    private String trimOrNull(String s) {
        return (s == null || s.trim().isEmpty()) ? null : s.trim();
    }

    private boolean isRateLimited(HttpServletRequest request, String action, int limit, Duration window) {
        return !rateLimiter.allow(action + ":" + request.getRemoteAddr(), limit, window);
    }

    private ResponseEntity<Map<String, Object>> tooManyRequests() {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                "success", false,
                "error", "RATE_LIMITED",
                "message", "Too many attempts. Please wait and try again."
        ));
    }

    private int parseIntOr(String s, int fallback) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return fallback;
        }
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "BAD_REQUEST",
                "message", message
        ));
    }
}
