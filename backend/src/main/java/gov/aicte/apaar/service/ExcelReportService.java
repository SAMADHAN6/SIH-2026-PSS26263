package gov.aicte.apaar.service;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.repository.CollegeRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelReportService {

    private final CollegeRepository collegeRepository;

    public ExcelReportService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    public byte[] generateNationalComplianceReport() throws IOException {
        List<College> colleges = collegeRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("AICTE_National_Compliance");

            // Header Font & Style
            XSSFFont headerFont = ((XSSFWorkbook) workbook).createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Row 0: Headers
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Institute Code", "Institution Name", "State", "City",
                    "Sanctioned Intake", "Actual Enrolment", "Intake Variance",
                    "Verified Students", "Pending", "Duplicates",
                    "Supernumerary (TFW)", "NRI Quota", "Foreign National", "Compliance Status"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Cell Styles for Data
            CellStyle normalStyle = workbook.createCellStyle();
            normalStyle.setAlignment(HorizontalAlignment.LEFT);

            CellStyle alertStyle = workbook.createCellStyle();
            XSSFFont alertFont = ((XSSFWorkbook) workbook).createFont();
            alertFont.setBold(true);
            alertFont.setColor(IndexedColors.RED.getIndex());
            alertStyle.setFont(alertFont);
            alertStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle okStyle = workbook.createCellStyle();
            XSSFFont okFont = ((XSSFWorkbook) workbook).createFont();
            okFont.setBold(true);
            okFont.setColor(IndexedColors.DARK_GREEN.getIndex());
            okStyle.setFont(okFont);
            okStyle.setAlignment(HorizontalAlignment.CENTER);

            int rowIdx = 1;
            for (College c : colleges) {
                Row row = sheet.createRow(rowIdx++);
                int variance = c.getActualEnrolment() - c.getApprovedIntake();

                row.createCell(0).setCellValue(c.getCode());
                row.createCell(1).setCellValue(c.getName());
                row.createCell(2).setCellValue(c.getState());
                row.createCell(3).setCellValue(c.getCity());
                row.createCell(4).setCellValue(c.getApprovedIntake());
                row.createCell(5).setCellValue(c.getActualEnrolment());

                Cell varianceCell = row.createCell(6);
                if (variance > 0) {
                    varianceCell.setCellValue("+" + variance + " (OVER-INTAKE)");
                    varianceCell.setCellStyle(alertStyle);
                } else {
                    varianceCell.setCellValue("Compliant");
                    varianceCell.setCellStyle(okStyle);
                }

                row.createCell(7).setCellValue(c.getVerifiedCount());
                row.createCell(8).setCellValue(c.getPendingCount());
                row.createCell(9).setCellValue(c.getDuplicateCount());
                row.createCell(10).setCellValue(c.getSupernumeraryQuota());
                row.createCell(11).setCellValue(c.getNriCount());
                row.createCell(12).setCellValue(c.getFnCount());

                Cell statusCell = row.createCell(13);
                if (variance > 0) {
                    statusCell.setCellValue("UNDER AUDIT");
                    statusCell.setCellStyle(alertStyle);
                } else {
                    statusCell.setCellValue("APPROVED");
                    statusCell.setCellStyle(okStyle);
                }
            }

            // Auto size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
