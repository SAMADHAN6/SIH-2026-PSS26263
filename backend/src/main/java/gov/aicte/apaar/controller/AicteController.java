package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.repository.VerificationLogRepository;
import gov.aicte.apaar.service.ExcelReportService;
import gov.aicte.apaar.service.TokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CORS is configured centrally in SecurityConfig (explicit origin patterns).
 * Write operations and PII-bearing reads require an authenticated session token.
 */
@RestController
@RequestMapping("/api/aicte")
public class AicteController {

    private final CollegeRepository collegeRepository;
    private final StudentRepository studentRepository;
    private final VerificationLogRepository logRepository;
    private final ExcelReportService excelReportService;
    private final TokenService tokenService;

    public AicteController(CollegeRepository collegeRepository,
                           StudentRepository studentRepository,
                           VerificationLogRepository logRepository,
                           ExcelReportService excelReportService,
                           TokenService tokenService) {
        this.collegeRepository = collegeRepository;
        this.studentRepository = studentRepository;
        this.logRepository = logRepository;
        this.excelReportService = excelReportService;
        this.tokenService = tokenService;
    }

    /**
     * National live summary: every KPI, the state-wise chart and the duplicate alert feed
     * are computed from the actual database (no hardcoded numbers).
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getNationalSummary(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (!isSuperAdmin(token)) {
            return unauthorized();
        }
        List<College> colleges = collegeRepository.findByActiveTrueOrderByNameAsc();

        int institutions = colleges.size();
        int enrolled = colleges.stream().mapToInt(c -> nz(c.getActualEnrolment())).sum();
        int sanctioned = colleges.stream().mapToInt(c -> nz(c.getApprovedIntake())).sum();
        int verified = colleges.stream().mapToInt(c -> nz(c.getVerifiedCount())).sum();
        int pending = colleges.stream().mapToInt(c -> nz(c.getPendingCount())).sum();
        int duplicates = colleges.stream().mapToInt(c -> nz(c.getDuplicateCount())).sum();
        int tfw = colleges.stream().mapToInt(c -> nz(c.getSupernumeraryQuota())).sum();
        int nri = colleges.stream().mapToInt(c -> nz(c.getNriCount())).sum();
        int fn = colleges.stream().mapToInt(c -> nz(c.getFnCount())).sum();

        // State-wise aggregation from live college records (feeds the dashboard chart)
        Map<String, List<College>> byState = colleges.stream()
                .filter(c -> c.getState() != null)
                .collect(Collectors.groupingBy(College::getState, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> stateWise = byState.entrySet().stream()
                .map(e -> {
                    int total = e.getValue().stream().mapToInt(c -> nz(c.getActualEnrolment())).sum();
                    int verifiedInState = e.getValue().stream().mapToInt(c -> nz(c.getVerifiedCount())).sum();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("state", e.getKey());
                    m.put("total", total);
                    m.put("verified", verifiedInState);
                    m.put("institutions", e.getValue().size());
                    return m;
                })
                .sorted((a, b) -> Integer.compare((int) b.get("total"), (int) a.get("total")))
                .collect(Collectors.toList());

        // ---------------- Advanced analytics (computed from the live registry) ----------------
        List<Student> allStudents = studentRepository.findAllByOrderByNameAsc();

        // 1. Verification funnel
        Map<String, Object> funnel = new LinkedHashMap<>();
        funnel.put("total", allStudents.size());
        funnel.put("verified", allStudents.stream().filter(s -> "verified".equalsIgnoreCase(s.getStatus())).count());
        funnel.put("pending", allStudents.stream().filter(s -> "pending".equalsIgnoreCase(s.getStatus())).count());
        funnel.put("duplicate", allStudents.stream().filter(s -> "duplicate".equalsIgnoreCase(s.getStatus())).count());
        funnel.put("rejected", allStudents.stream().filter(s -> "rejected".equalsIgnoreCase(s.getStatus())).count());

        // 2. Category mix
        Map<String, Long> categoryWise = new LinkedHashMap<>();
        allStudents.stream().filter(s -> s.getCategory() != null)
                .collect(Collectors.groupingBy(Student::getCategory, Collectors.counting()))
                .entrySet().stream().sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .forEach(e -> categoryWise.put(e.getKey(), e.getValue()));

        // 3. Course distribution (top 8)
        Map<String, Long> courseWise = new LinkedHashMap<>();
        allStudents.stream().filter(s -> s.getCourse() != null)
                .collect(Collectors.groupingBy(Student::getCourse, Collectors.counting()))
                .entrySet().stream().sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .forEach(e -> courseWise.put(e.getKey(), e.getValue()));

        // 4. Year-wise enrolment
        Map<String, Long> yearWise = new LinkedHashMap<>();
        for (int y = 1; y <= 4; y++) {
            final int yy = y;
            yearWise.put("Year " + y, allStudents.stream().filter(s -> s.getAcademicYear() != null && s.getAcademicYear() == yy).count());
        }

        // 5. State-wise verification stack (verified / pending / duplicate)
        Map<String, Map<String, Integer>> stateVerification = new LinkedHashMap<>();
        for (Student s : allStudents) {
            if (s.getState() == null) continue;
            Map<String, Integer> bucket = stateVerification.computeIfAbsent(s.getState(), k -> new LinkedHashMap<>());
            String status = s.getStatus() == null ? "pending" : s.getStatus().toLowerCase();
            bucket.merge(status, 1, Integer::sum);
        }

        // 6. Quota utilisation (national)
        Map<String, Object> quota = new LinkedHashMap<>();
        quota.put("tfw", allStudents.stream().filter(s -> s.getCategory() != null && s.getCategory().toLowerCase().contains("tfw")).count());
        quota.put("nri", allStudents.stream().filter(s -> "NRI".equalsIgnoreCase(s.getCategory())).count());
        quota.put("fn", allStudents.stream().filter(s -> "Foreign National".equalsIgnoreCase(s.getCategory())).count());
        quota.put("ews", allStudents.stream().filter(s -> "EWS".equalsIgnoreCase(s.getCategory())).count());

        // 7. Credits progression (average banked credits per academic year)
        Map<String, Object> creditsByYear = new LinkedHashMap<>();
        for (int y = 1; y <= 4; y++) {
            final int yy = y;
            List<Student> yr = allStudents.stream().filter(s -> s.getAcademicYear() != null && s.getAcademicYear() == yy).toList();
            double avg = yr.stream().mapToInt(s -> s.getAbcCredits() == null ? 0 : s.getAbcCredits()).average().orElse(0);
            creditsByYear.put("Year " + y, Map.of("avgCredits", Math.round(avg * 10.0) / 10.0, "students", yr.size()));
        }

        // 8. Intake compliance watchlist
        List<Map<String, Object>> overIntake = colleges.stream()
                .filter(c -> nz(c.getActualEnrolment()) > nz(c.getApprovedIntake()))
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("code", c.getCode());
                    m.put("name", c.getName());
                    m.put("state", c.getState());
                    m.put("approved", c.getApprovedIntake());
                    m.put("actual", c.getActualEnrolment());
                    m.put("variance", nz(c.getActualEnrolment()) - nz(c.getApprovedIntake()));
                    return m;
                })
                .sorted((a, b) -> Integer.compare((int) b.get("variance"), (int) a.get("variance")))
                .collect(Collectors.toList());


        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("success", true);
        summary.put("institutions", institutions);
        summary.put("enrolled", enrolled);
        summary.put("sanctioned", sanctioned);
        summary.put("verified", verified);
        summary.put("pending", pending);
        summary.put("duplicates", duplicates);
        summary.put("supernumeraryQuota", tfw);
        summary.put("nri", nri);
        summary.put("fn", fn);
        summary.put("verifiedPct", enrolled > 0 ? Math.round(verified * 1000.0 / enrolled) / 10.0 : 0);
        summary.put("stateWise", stateWise);
        // Identifiable duplicate alerts remain on the separately protected endpoint.
        summary.put("duplicateFeed", List.of());
        summary.put("funnel", funnel);
        summary.put("categoryWise", categoryWise);
        summary.put("courseWise", courseWise);
        summary.put("yearWise", yearWise);
        summary.put("stateVerification", stateVerification);
        summary.put("quota", quota);
        summary.put("creditsByYear", creditsByYear);
        summary.put("overIntake", overIntake);
        summary.put("generatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/colleges")
    public ResponseEntity<?> getAllColleges(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (!isSuperAdmin(token)) {
            return unauthorized();
        }
        List<College> list = collegeRepository.findAllByOrderByNameAsc();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalInstitutions", list.size(),
                "activeInstitutions", list.stream().filter(c -> Boolean.TRUE.equals(c.getActive())).count(),
                "data", list
        ));
    }

    @GetMapping("/duplicate-alerts")
    public ResponseEntity<?> getDuplicateAlerts(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (!isSuperAdmin(token)) {
            return unauthorized();
        }
        List<Map<String, Object>> alerts = studentRepository.findTop100ByStatusOrderByIdAsc("duplicate").stream()
                .map(s -> {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("apaarId", s.getApaarId());
                    alert.put("name", s.getName());
                    alert.put("collegeName", s.getCollegeName());
                    alert.put("conflictCollege", s.getDuplicateCollegeName() != null ? s.getDuplicateCollegeName() : "External institute");
                    alert.put("reason", s.getFlagReason() != null ? s.getFlagReason() : "Cross-institution enrolment conflict");
                    alert.put("severity", "CRITICAL");
                    return alert;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "data", alerts));
    }

    /**
     * AICTE Super Admin action: suspend or reinstate an institution's portal access.
     * Requires an authenticated AICTE_SUPER_ADMIN token.
     */
    @PatchMapping("/colleges/{collegeId}/status")
    public ResponseEntity<?> setCollegeStatus(@PathVariable String collegeId,
                                              @RequestHeader(value = "X-Auth-Token", required = false) String token,
                                              @RequestBody Map<String, String> body) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        if (session == null || !"AICTE_SUPER_ADMIN".equals(session.role())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "error", "UNAUTHORIZED",
                    "message", "Only the AICTE Super Admin can change institutional status."
            ));
        }

        boolean activate = "activate".equalsIgnoreCase(body.get("action"));
        return collegeRepository.findById(collegeId)
                .<ResponseEntity<?>>map(college -> {
                    college.setActive(activate);
                    collegeRepository.save(college);
                    if (!activate) {
                        tokenService.revokeCollegeSessions(college.getId());
                    }
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", (activate ? "Institution re-instated: " : "Institution suspended: ") + college.getName(),
                            "college", college
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "error", "COLLEGE_NOT_FOUND",
                        "message", "No institution found for ID: " + collegeId
                )));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (!isSuperAdmin(token)) {
            return unauthorized();
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", logRepository.findTop20ByOrderByTimestampDesc()
        ));
    }

    private boolean isSuperAdmin(String token) {
        TokenService.TokenInfo session = tokenService.validate(token).orElse(null);
        return session != null && "AICTE_SUPER_ADMIN".equals(session.role());
    }

    private ResponseEntity<Map<String, Object>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "error", "UNAUTHORIZED",
                "message", "Sign in as the AICTE Super Admin to access this resource."
        ));
    }

    /**
     * Official national compliance report (.xlsx) with national summary,
     * college compliance sheet and the full student registry (with photographs).
     */
    @GetMapping("/export-excel")
    public ResponseEntity<?> exportExcelReport(
            @RequestHeader(value = "X-Auth-Token", required = false) String headerToken) {
        if (!isSuperAdmin(headerToken)) {
            return unauthorized();
        }
        try {
            byte[] excelBytes = excelReportService.generateNationalComplianceReport();
            String filename = "AICTE_National_Compliance_Report_" + LocalDateTime.now().getYear() + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private int nz(Integer v) {
        return v == null ? 0 : v;
    }

    /** Public landing-page KPIs only; no records, institution names, or watchlists. */
    @GetMapping("/public-summary")
    public ResponseEntity<?> getPublicSummary() {
        List<College> colleges = collegeRepository.findByActiveTrueOrderByNameAsc();
        int enrolled = colleges.stream().mapToInt(c -> nz(c.getActualEnrolment())).sum();
        int verified = colleges.stream().mapToInt(c -> nz(c.getVerifiedCount())).sum();
        Map<String, List<College>> byState = colleges.stream().filter(c -> c.getState() != null)
                .collect(Collectors.groupingBy(College::getState, LinkedHashMap::new, Collectors.toList()));
        List<Map<String, Object>> stateWise = byState.entrySet().stream().map(entry -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("state", entry.getKey());
            row.put("total", entry.getValue().stream().mapToInt(c -> nz(c.getActualEnrolment())).sum());
            row.put("institutions", entry.getValue().size());
            return row;
        }).toList();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "institutions", colleges.size(),
                "enrolled", enrolled,
                "verifiedPct", enrolled > 0 ? Math.round(verified * 1000.0 / enrolled) / 10.0 : 0,
                "stateWise", stateWise));
    }
}
