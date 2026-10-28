package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.service.ApaarVerificationService;
import gov.aicte.apaar.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * CORS is configured centrally in SecurityConfig (explicit origin patterns).
 */
@RestController
@RequestMapping("/api/verify")
public class VerificationController {

    private final ApaarVerificationService verificationService;
    private final TokenService tokenService;

    public VerificationController(ApaarVerificationService verificationService,
                                  TokenService tokenService) {
        this.verificationService = verificationService;
        this.tokenService = tokenService;
    }

    /**
     * GET /api/verify/{apaarId}?consent=true
     * Simulates the DigiLocker handshake and returns student credentials or 404.
     * DPDP Act 2023: the query is REJECTED server-side unless explicit consent
     * is supplied — the checkbox in the student portal is a legal gate, not a UI decoration.
     */
    @GetMapping("/{apaarId}")
    public ResponseEntity<?> verifyApaar(@PathVariable String apaarId,
                                         @RequestParam(value = "consent", required = false) String consent) {
        if (!"true".equalsIgnoreCase(consent)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "DPDP_CONSENT_REQUIRED",
                    "message", "Under the DPDP Act 2023, personal data cannot be processed without the data principal's explicit consent. Re-run the query with consent=true."
            ));
        }

        if (apaarId == null || apaarId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "INVALID_APAAR_ID",
                    "message", "APAAR ID parameter cannot be blank."
            ));
        }

        Optional<Student> studentOpt = verificationService.verifyApaarId(apaarId);

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "STUDENT_NOT_FOUND",
                    "message", "No student record found matching APAAR ID: " + apaarId + ". Please verify with institution."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", studentOpt.get(),
                "metadata", Map.of(
                        "verifiedAt", LocalDateTime.now().toString(),
                        "dataDepository", "DigiLocker / National Academic Depository (NAD)",
                        "compliance", "AICTE APH 2026-27 Clause 8.4"
                )
        ));
    }

    /**
     * POST /api/verify/{apaarId}/status
     * Verify / reject a student. Requires an authenticated college or admin session;
     * the audit trail records the real actor identity from the session token.
     */
    @PostMapping("/{apaarId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String apaarId,
                                          @RequestHeader(value = "X-Auth-Token", required = false) String token,
                                          @RequestBody Map<String, String> body) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "UNAUTHORIZED",
                    "message", "Sign in with an authorised institutional or AICTE account to change verification status."
            ));
        }

        String status = body.get("status");
        if (status == null || (!status.equalsIgnoreCase("verified") && !status.equalsIgnoreCase("rejected"))) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Status must be 'verified' or 'rejected'"));
        }

        try {
            String actor = session.email();
            String role = session.role();
            Student updated = verificationService.updateStudentStatus(apaarId, status, actor, role);
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
