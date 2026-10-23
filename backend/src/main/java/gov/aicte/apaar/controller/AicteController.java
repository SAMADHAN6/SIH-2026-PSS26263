package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.VerificationLogRepository;
import gov.aicte.apaar.service.ExcelReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aicte")
@CrossOrigin(origins = "*")
public class AicteController {

    private final CollegeRepository collegeRepository;
    private final VerificationLogRepository logRepository;
    private final ExcelReportService excelReportService;

    public AicteController(CollegeRepository collegeRepository,
                           VerificationLogRepository logRepository,
                           ExcelReportService excelReportService) {
        this.collegeRepository = collegeRepository;
        this.logRepository = logRepository;
        this.excelReportService = excelReportService;
    }

    @GetMapping("/colleges")
    public ResponseEntity<?> getAllColleges() {
        List<College> list = collegeRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalInstitutions", 9840,
                "activeInstitutions", list.size(),
                "data", list
        ));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", logRepository.findTop20ByOrderByTimestampDesc()
        ));
    }

    /**
     * GET /api/aicte/export-excel
     * Uses Apache POI to generate authentic .xlsx document for download
     */
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportExcelReport() {
        try {
            byte[] excelBytes = excelReportService.generateNationalComplianceReport();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=AICTE_National_Compliance_Report_2026.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
