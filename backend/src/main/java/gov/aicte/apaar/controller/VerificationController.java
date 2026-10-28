package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.service.ApaarVerificationService;
import gov.aicte.apaar.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

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
    private final StudentRepository studentRepository;

    public VerificationController(ApaarVerificationService verificationService,
                                  TokenService tokenService,
                                  StudentRepository studentRepository) {
        this.verificationService = verificationService;
        this.tokenService = tokenService;
        this.studentRepository = studentRepository;
    }

    /**
     * GET /api/verify/{apaarId}?consent=true
     * Demo lookup. The consent flag is a UI confirmation only, not proof of legally
     * valid consent or a real DigiLocker identity assertion. Production must integrate
     * the authorized consent and identity provider before returning personal data.
     */
    @GetMapping("/{apaarId}")
    public ResponseEntity<?> verifyApaar(@PathVariable String apaarId,
                                         @RequestParam(value = "consent", required = false) String consent,
                                         HttpServletRequest request) {
        if (!"true".equalsIgnoreCase(consent)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "DPDP_CONSENT_REQUIRED",
                    "message", "Confirm the demo consent checkbox before running this lookup. Production consent verification is not configured."
            ));
        }

        if (apaarId == null || apaarId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "INVALID_APAAR_ID",
                    "message", "APAAR ID parameter cannot be blank."
            ));
        }

        Optional<Student> studentOpt = verificationService.verifyApaarId(apaarId, request.getRemoteAddr());

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "STUDENT_NOT_FOUND",
                    "message", "No student record found matching APAAR ID: " + apaarId + ". Please verify with institution."
            ));
        }

        Student student = studentOpt.get();
        // Public verification confirms only the minimum needed to establish a match.
        // Never serialize the JPA entity here: it contains contact and identity data.
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "apaarId", student.getApaarId(),
                        "status", student.getStatus() == null ? "unknown" : student.getStatus(),
                        "collegeName", student.getCollegeName() == null ? "" : student.getCollegeName(),
                        "course", student.getCourse() == null ? "" : student.getCourse(),
                        "academicYear", student.getAcademicYear() == null ? 0 : student.getAcademicYear(),
                        "digilockerVerified", Boolean.TRUE.equals(student.getDigilockerVerified())
                ),
                "metadata", Map.of(
                        "verifiedAt", LocalDateTime.now().toString(),
                        "dataSource", "APAAR demo registry",
                        "notice", "Demo lookup only; no live DigiLocker or consent-provider integration is configured."
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
                                          @RequestBody Map<String, String> body,
                                          HttpServletRequest request) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null || !("COLLEGE_ADMIN".equals(session.role()) || "AICTE_SUPER_ADMIN".equals(session.role()))) {
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

        if ("COLLEGE_ADMIN".equals(session.role())) {
            Student target = studentRepository.findByApaarIdIgnoreCase(apaarId).orElse(null);
            if (target == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Student record not found."));
            }
            if (session.collegeId() == null || !session.collegeId().equalsIgnoreCase(target.getCollegeId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "error", "FORBIDDEN",
                        "message", "College administrators may only update records belonging to their own institution."
                ));
            }
        }

        try {
            String actor = session.email();
            String role = session.role();
            Student updated = verificationService.updateStudentStatus(apaarId, status, actor, role, request.getRemoteAddr());
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
