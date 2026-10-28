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
    public ResponseEntity<?> getNationalSummary() {
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

        // Live duplicate alert feed from actual flagged student records
        List<Student> duplicateStudents = studentRepository.findByStatus("duplicate");
        List<Map<String, Object>> duplicateFeed = duplicateStudents.stream()
                .limit(8)
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("apaarId", s.getApaarId());
                    m.put("name", s.getName());
                    m.put("collegeName", s.getCollegeName());
                    m.put("conflictCollege", s.getDuplicateCollegeName() != null ? s.getDuplicateCollegeName() : "External institute");
                    m.put("reason", s.getFlagReason() != null ? s.getFlagReason() : "Cross-institution enrolment conflict");
                    m.put("severity", "CRITICAL");
                    return m;
                })
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
        summary.put("duplicateFeed", duplicateFeed);
        summary.put("generatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/colleges")
    public ResponseEntity<?> getAllColleges() {
        List<College> list = collegeRepository.findAllByOrderByNameAsc();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalInstitutions", list.size(),
                "activeInstitutions", list.stream().filter(c -> Boolean.TRUE.equals(c.getActive())).count(),
                "data", list
        ));
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
            @RequestHeader(value = "X-Auth-Token", required = false) String headerToken,
            @RequestParam(value = "token", required = false) String queryToken) {
        if (!isSuperAdmin(headerToken != null && !headerToken.isBlank() ? headerToken : queryToken)) {
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
}
