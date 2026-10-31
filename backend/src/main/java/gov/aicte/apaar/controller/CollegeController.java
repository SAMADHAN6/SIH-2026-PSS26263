package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.repository.VerificationLogRepository;
import gov.aicte.apaar.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CORS is configured centrally in SecurityConfig (explicit origin patterns).
 * Student records are session-scoped: a college admin can only ever read
 * its own institution's data, regardless of the requested collegeId.
 */
@RestController
@RequestMapping("/api/college")
public class CollegeController {

    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;
    private final TokenService tokenService;
    private final VerificationLogRepository logRepository;

    public CollegeController(StudentRepository studentRepository,
                             CollegeRepository collegeRepository,
                             TokenService tokenService,
                             VerificationLogRepository logRepository) {
        this.studentRepository = studentRepository;
        this.collegeRepository = collegeRepository;
        this.tokenService = tokenService;
        this.logRepository = logRepository;
    }

    /** Tenant-scoped alerts for duplicate records, intake variance and recent activity. */
    @GetMapping("/alerts")
    public ResponseEntity<?> getCollegeAlerts(
            @RequestParam(required = false) String collegeId,
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        String scopedId = session == null ? null : resolveScopedCollegeId(session, collegeId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false, "error", "UNAUTHORIZED",
                    "message", "Sign in to view institution alerts."));
        }
        if (scopedId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false, "error", "FORBIDDEN",
                    "message", "Only institution administrators and AICTE administrators can view these alerts."));
        }

        College college = collegeRepository.findById(scopedId).orElse(null);
        if (college == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false, "error", "COLLEGE_NOT_FOUND"));
        }
        List<Student> roster = studentRepository.findByCollegeIdOrderByNameAsc(scopedId);
        List<Map<String, Object>> duplicates = roster.stream()
                .filter(s -> "duplicate".equalsIgnoreCase(s.getStatus()))
                .map(s -> Map.<String, Object>of(
                        "apaarId", s.getApaarId(), "name", s.getName(),
                        "conflictCollege", s.getDuplicateCollegeName() == null ? "External institute" : s.getDuplicateCollegeName(),
                        "reason", s.getFlagReason() == null ? "Cross-institution enrolment conflict" : s.getFlagReason()))
                .toList();
        long pendingQueue = roster.stream().filter(s -> "pending".equalsIgnoreCase(s.getStatus())).count();
        java.util.Set<String> ownApaarIds = roster.stream().map(Student::getApaarId).collect(Collectors.toSet());
        List<Map<String, Object>> recentActions = logRepository.findTop100ByOrderByTimestampDesc().stream()
                .filter(log -> ownApaarIds.contains(log.getApaarId()))
                .limit(10)
                .map(log -> {
                    Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("timestamp", log.getTimestamp());
                    row.put("apaarId", log.getApaarId());
                    row.put("studentName", log.getStudentName());
                    row.put("action", log.getAction());
                    return row;
                }).toList();

        Map<String, Object> intake = new java.util.LinkedHashMap<>();
        intake.put("approved", college.getApprovedIntake());
        intake.put("actual", college.getActualEnrolment());
        intake.put("variance", college.getActualEnrolment() - college.getApprovedIntake());
        intake.put("over", college.getActualEnrolment() > college.getApprovedIntake());
        return ResponseEntity.ok(Map.of("success", true, "intake", intake,
                "duplicates", duplicates, "pendingQueue", pendingQueue, "recentActions", recentActions));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getCollegeStats(@RequestParam(required = false) String collegeId,
                                             @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "UNAUTHORIZED",
                    "message", "Sign in with institutional or AICTE credentials to view institution statistics."
            ));
        }

        String scopedId = resolveScopedCollegeId(session, collegeId);
        if (scopedId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "error", "COLLEGE_ID_REQUIRED",
                    "message", "A collegeId parameter is required for national-level queries."
            ));
        }

        String effectiveId = scopedId;
        return collegeRepository.findById(effectiveId)
                .<ResponseEntity<?>>map(college -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "college", college,
                        "intakeVariance", college.getActualEnrolment() - college.getApprovedIntake(),
                        "overIntakeFlag", college.getActualEnrolment() > college.getApprovedIntake()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "error", "COLLEGE_NOT_FOUND",
                        "message", "No institution found for ID: " + effectiveId
                )));
    }

    /**
     * Portal isolation: a COLLEGE_ADMIN session is always forced onto its own
     * institution, even if another collegeId is supplied. Only the AICTE Super
     * Admin may query other institutions.
     */
    private String resolveScopedCollegeId(TokenService.TokenInfo session, String requestedCollegeId) {
        if ("COLLEGE_ADMIN".equals(session.role())) {
            return session.collegeId();
        }
        if (!"AICTE_SUPER_ADMIN".equals(session.role())) {
            return null;
        }
        return (requestedCollegeId == null || requestedCollegeId.isBlank()) ? null : requestedCollegeId;
    }

    /**
     * Student registry with server-side search + filtering.
     * Scoped to a college when collegeId is supplied (portal isolation).
     */
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) String collegeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestHeader(value = "X-Auth-Token", required = false) String token
    ) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "UNAUTHORIZED",
                    "message", "Sign in with institutional or AICTE credentials to access student records."
            ));
        }

        // Portal isolation: college admins are always scoped to their own institution.
        if ("COLLEGE_ADMIN".equals(session.role())) {
            collegeId = session.collegeId();
        }
        final String scopedCollegeId = collegeId;

        List<Student> students;
        boolean hasQuery = q != null && !q.trim().isEmpty();

        if (scopedCollegeId != null && !scopedCollegeId.isEmpty()) {
            students = hasQuery
                    ? studentRepository.searchStudents(q.trim()).stream()
                        .filter(s -> scopedCollegeId.equalsIgnoreCase(s.getCollegeId()))
                        .collect(Collectors.toList())
                    : studentRepository.findByCollegeIdOrderByNameAsc(scopedCollegeId);
        } else {
            students = hasQuery ? studentRepository.searchStudents(q.trim()) : studentRepository.findAllByOrderByNameAsc();
        }

        if (course != null && !"all".equalsIgnoreCase(course)) {
            students = students.stream()
                    .filter(s -> s.getCourse().toLowerCase().contains(course.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (year != null) {
            students = students.stream().filter(s -> year.equals(s.getAcademicYear())).collect(Collectors.toList());
        }

        if (status != null && !"all".equalsIgnoreCase(status)) {
            students = students.stream().filter(s -> status.equalsIgnoreCase(s.getStatus())).collect(Collectors.toList());
        }

        if (category != null && !"all".equalsIgnoreCase(category)) {
            students = students.stream().filter(s -> category.equalsIgnoreCase(s.getCategory())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "total", students.size(),
                "data", students
        ));
    }

    /**
     * Genuine bulk CSV ingestion. Requires an authenticated college session.
     * Duplicate APAAR IDs are skipped and reported.
     */
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(@RequestHeader(value = "X-Auth-Token", required = false) String token,
                                        @RequestBody List<Student> incoming) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null || !"COLLEGE_ADMIN".equals(session.role())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "UNAUTHORIZED",
                    "message", "Sign in with institutional credentials to upload student records."
            ));
        }

        if (incoming == null || incoming.isEmpty()) {
            return badRequest("The uploaded batch contains no student records.");
        }

        String collegeId = session.collegeId();
        College college = collegeRepository.findById(collegeId).orElse(null);
        if (college == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "COLLEGE_NOT_FOUND",
                    "message", "The signed-in institution no longer exists in the registry."
            ));
        }

        int added = 0;
        int duplicates = 0;

        for (Student s : incoming) {
            if (s.getApaarId() == null || s.getApaarId().trim().isEmpty() || s.getName() == null || s.getName().trim().isEmpty()) {
                duplicates++; // count malformed rows as skipped
                continue;
            }
            if (studentRepository.findByApaarIdIgnoreCase(s.getApaarId().trim()).isPresent()) {
                duplicates++;
                continue;
            }

            // Bind every uploaded record to the signed-in institution
            s.setApaarId(s.getApaarId().trim());
            s.setName(s.getName().trim());
            s.setCollegeId(college.getId());
            s.setCollegeName(college.getName());
            if (s.getStatus() == null || s.getStatus().isBlank()) {
                s.setStatus("pending");
            }
            if (s.getAcademicYear() == null) {
                s.setAcademicYear(1);
            }
            if (s.getAbcCredits() == null) {
                s.setAbcCredits(0);
            }
            studentRepository.save(s);
            added++;
        }

        // Recompute the institution's live statistics from the actual registry
        recomputeCollegeStats(college);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", String.format("Batch processed: %d records added, %d skipped (duplicates/invalid).", added, duplicates),
                "addedCount", added,
                "duplicateCount", duplicates
        ));
    }

    private void recomputeCollegeStats(College college) {
        List<Student> roster = studentRepository.findByCollegeIdOrderByNameAsc(college.getId());
        college.setActualEnrolment(roster.size());
        college.setVerifiedCount((int) roster.stream().filter(s -> "verified".equalsIgnoreCase(s.getStatus())).count());
        college.setPendingCount((int) roster.stream().filter(s -> "pending".equalsIgnoreCase(s.getStatus())).count());
        college.setDuplicateCount((int) roster.stream().filter(s -> "duplicate".equalsIgnoreCase(s.getStatus())).count());
        collegeRepository.save(college);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "BAD_REQUEST",
                "message", message
        ));
    }
}
