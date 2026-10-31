package gov.aicte.apaar.service;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFDrawing;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;

import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Government-standard multi-sheet Excel report:
 *   Sheet 1 - National Summary (live KPIs + state-wise progress)
 *   Sheet 2 - College Compliance (intake variance auditing)
 *   Sheet 3 - Student Registry (full roster with profile photographs)
 * All figures are computed from the live database.
 */
@Service
public class ExcelReportService {

    private final CollegeRepository collegeRepository;
    private final StudentRepository studentRepository;

    // Professional palette
    private static final short NAVY = IndexedColors.DARK_BLUE.getIndex();
    private static final byte[] AVATAR_COLORS = {
            (byte) 0x0F, (byte) 0x2C, (byte) 0x61, // navy
            (byte) 0x05, (byte) 0x96, (byte) 0x69, // green
            (byte) 0xB4, (byte) 0x53, (byte) 0x09, // amber-dark
            (byte) 0x6D, (byte) 0x28, (byte) 0xD9, // violet
            (byte) 0xBE, (byte) 0x12, (byte) 0x3D, // crimson
            (byte) 0x0E, (byte) 0x74, (byte) 0x95, // teal
    };

    public ExcelReportService(CollegeRepository collegeRepository, StudentRepository studentRepository) {
        this.collegeRepository = collegeRepository;
        this.studentRepository = studentRepository;
    }

    public byte[] generateNationalComplianceReport() throws IOException {
        List<College> colleges = collegeRepository.findByActiveTrueOrderByNameAsc();
        List<Student> students = studentRepository.findAllByOrderByNameAsc();

        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            buildSummarySheet(workbook, colleges, students);
            buildCollegeSheet(workbook, colleges);
            buildStudentSheet(workbook, students);

            workbook.write(out);
            return out.toByteArray();
        } finally {
            // no-op: try-with-resources closed the workbook
        }
    }

    // ------------------------------------------------------------------
    // Sheet 1: National Summary
    // ------------------------------------------------------------------
    private void buildSummarySheet(SXSSFWorkbook wb, List<College> colleges, List<Student> students) {
        SXSSFSheet sheet = wb.createSheet("National Summary");

        CellStyle titleStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 18);
        titleFont.setColor(IndexedColors.WHITE.getIndex());
        titleStyle.setFont(titleFont);
        titleStyle.setFillForegroundColor(NAVY);
        titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        CellStyle subStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font subFont = wb.createFont();
        subFont.setItalic(true);
        subFont.setFontHeightInPoints((short) 10);
        subFont.setColor(IndexedColors.GREY_25_PERCENT.getIndex());
        subStyle.setFont(subFont);
        subStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle sectionStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font sectionFont = wb.createFont();
        sectionFont.setBold(true);
        sectionFont.setFontHeightInPoints((short) 12);
        sectionFont.setColor(IndexedColors.DARK_BLUE.getIndex());
        sectionStyle.setFont(sectionFont);

        CellStyle headerStyle = headerStyle(wb);
        CellStyle labelStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font labelFont = wb.createFont();
        labelFont.setBold(true);
        labelStyle.setFont(labelFont);
        labelStyle.setBorderTop(BorderStyle.THIN);
        labelStyle.setBorderBottom(BorderStyle.THIN);
        labelStyle.setBorderLeft(BorderStyle.THIN);
        labelStyle.setBorderRight(BorderStyle.THIN);
        labelStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        labelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle valueStyle = bordered(wb);
        valueStyle.setAlignment(HorizontalAlignment.CENTER);

        int rowIdx = 0;

        // Title block
        Row title = sheet.createRow(rowIdx++);
        title.setHeightInPoints(34);
        Cell tc = title.createCell(0);
        tc.setCellValue("APAAR VERIFY — NATIONAL COMPLIANCE REPORT");
        tc.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

        Row sub = sheet.createRow(rowIdx++);
        Cell sc = sub.createCell(0);
        sc.setCellValue("All India Council for Technical Education (AICTE) • Regulation Bureau • Problem Statement ID 26263");
        sc.setCellStyle(subStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 4));

        Row gen = sheet.createRow(rowIdx++);
        Cell gc = gen.createCell(0);
        gc.setCellValue("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) + "  |  Source: Live APAAR National Database");
        gc.setCellStyle(subStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 4));

        rowIdx++; // spacer

        // KPI block
        int enrolled = colleges.stream().mapToInt(c -> nz(c.getActualEnrolment())).sum();
        int sanctioned = colleges.stream().mapToInt(c -> nz(c.getApprovedIntake())).sum();
        int verified = colleges.stream().mapToInt(c -> nz(c.getVerifiedCount())).sum();
        int pending = colleges.stream().mapToInt(c -> nz(c.getPendingCount())).sum();
        int duplicates = colleges.stream().mapToInt(c -> nz(c.getDuplicateCount())).sum();
        long flagged = students.stream().filter(s -> "duplicate".equalsIgnoreCase(s.getStatus())).count();

        Row sec1 = sheet.createRow(rowIdx++);
        sec1.createCell(0).setCellValue("1. NATIONAL KEY INDICATORS");
        sec1.getCell(0).setCellStyle(sectionStyle);

        String[][] kpis = {
                {"Active Institutions", String.valueOf(colleges.size())},
                {"Sanctioned Intake", String.valueOf(sanctioned)},
                {"Total Enrolled Students", String.valueOf(enrolled)},
                {"APAAR Verified Records", verified + String.format("  (%.1f%%)", enrolled > 0 ? verified * 100.0 / enrolled : 0)},
                {"Pending Verification", String.valueOf(pending)},
                {"Duplicates Intercepted", String.valueOf(duplicates)},
                {"Duplicate Student Records Flagged", String.valueOf(flagged)},
                {"Overall Compliance Status", enrolled > sanctioned ? "UNDER AUDIT (over-intake detected)" : "COMPLIANT"},
        };
        for (String[] kpi : kpis) {
            Row r = sheet.createRow(rowIdx++);
            Cell k = r.createCell(0);
            k.setCellValue(kpi[0]);
            k.setCellStyle(labelStyle);
            Cell v = r.createCell(1);
            v.setCellValue(kpi[1]);
            v.setCellStyle(valueStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 1, 4));
        }

        rowIdx += 2;

        // State-wise block
        Row sec2 = sheet.createRow(rowIdx++);
        sec2.createCell(0).setCellValue("2. STATE-WISE VERIFICATION PROGRESS");
        sec2.getCell(0).setCellStyle(sectionStyle);

        String[] stateHeaders = {"State / UT", "Institutions", "Total Enrolled", "Verified", "Verified %"};
        Row hr = sheet.createRow(rowIdx++);
        for (int i = 0; i < stateHeaders.length; i++) {
            Cell c = hr.createCell(i);
            c.setCellValue(stateHeaders[i]);
            c.setCellStyle(headerStyle);
        }

        java.util.LinkedHashMap<String, int[]> stateAgg = new java.util.LinkedHashMap<>();
        for (College c : colleges) {
            if (c.getState() == null) continue;
            int[] agg = stateAgg.computeIfAbsent(c.getState(), k -> new int[3]);
            agg[0]++; // institutions
            agg[1] += nz(c.getActualEnrolment());
            agg[2] += nz(c.getVerifiedCount());
        }
        for (java.util.Map.Entry<String, int[]> e : stateAgg.entrySet()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(e.getKey());
            r.createCell(1).setCellValue(e.getValue()[0]);
            r.createCell(2).setCellValue(e.getValue()[1]);
            r.createCell(3).setCellValue(e.getValue()[2]);
            Cell pct = r.createCell(4);
            pct.setCellValue(e.getValue()[1] > 0
                    ? String.format("%.1f%%", e.getValue()[2] * 100.0 / e.getValue()[1])
                    : "0%");
            for (int i = 0; i <= 4; i++) {
                r.getCell(i).setCellStyle(bordered(wb));
            }
        }

        sheet.setColumnWidth(0, 34 * 256);
        sheet.setColumnWidth(1, 16 * 256);
        sheet.setColumnWidth(2, 18 * 256);
        sheet.setColumnWidth(3, 14 * 256);
        sheet.setColumnWidth(4, 14 * 256);
    }

    // ------------------------------------------------------------------
    // Sheet 2: College Compliance
    // ------------------------------------------------------------------
    private void buildCollegeSheet(SXSSFWorkbook wb, List<College> colleges) {
        SXSSFSheet sheet = wb.createSheet("College Compliance");

        CellStyle titleStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);

        CellStyle headerStyle = headerStyle(wb);
        CellStyle alertStyle = alertStyle(wb, false);
        CellStyle okStyle = okStyle(wb);
        CellStyle normal = bordered(wb);
        CellStyle centered = bordered(wb);
        centered.setAlignment(HorizontalAlignment.CENTER);

        int rowIdx = 0;
        Row t = sheet.createRow(rowIdx++);
        t.createCell(0).setCellValue("COLLEGE-WISE INTAKE COMPLIANCE & VERIFICATION STATUS");
        t.getCell(0).setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

        Row meta = sheet.createRow(rowIdx++);
        meta.createCell(0).setCellValue("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
        rowIdx++; // spacer

        int headerRow = rowIdx;
        String[] headers = {
                "Institute Code", "Institution Name", "State", "City",
                "Sanctioned Intake", "Actual Enrolment", "Intake Variance",
                "Verified Students", "Pending", "Duplicates",
                "Supernumerary (TFW)", "NRI Quota", "Foreign National", "Compliance Status"
        };
        Row headerRow0 = sheet.createRow(rowIdx++);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow0.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        for (College c : colleges) {
            Row row = sheet.createRow(rowIdx++);
            int variance = nz(c.getActualEnrolment()) - nz(c.getApprovedIntake());

            row.createCell(0).setCellValue(c.getCode());
            row.createCell(1).setCellValue(c.getName());
            row.createCell(2).setCellValue(c.getState());
            row.createCell(3).setCellValue(c.getCity());
            row.createCell(4).setCellValue(nz(c.getApprovedIntake()));
            row.createCell(5).setCellValue(nz(c.getActualEnrolment()));

            Cell varianceCell = row.createCell(6);
            if (variance > 0) {
                varianceCell.setCellValue("+" + variance + " (OVER-INTAKE)");
                varianceCell.setCellStyle(alertStyle);
            } else {
                varianceCell.setCellValue("Compliant");
                varianceCell.setCellStyle(okStyle);
            }

            row.createCell(7).setCellValue(nz(c.getVerifiedCount()));
            row.createCell(8).setCellValue(nz(c.getPendingCount()));
            row.createCell(9).setCellValue(nz(c.getDuplicateCount()));
            row.createCell(10).setCellValue(nz(c.getSupernumeraryQuota()));
            row.createCell(11).setCellValue(nz(c.getNriCount()));
            row.createCell(12).setCellValue(nz(c.getFnCount()));

            Cell statusCell = row.createCell(13);
            if (variance > 0) {
                statusCell.setCellValue("UNDER AUDIT");
                statusCell.setCellStyle(alertStyle);
            } else {
                statusCell.setCellValue("APPROVED");
                statusCell.setCellStyle(okStyle);
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.setColumnWidth(i, i == 1 ? 46 * 256 : 16 * 256);
        }
        sheet.setAutoFilter(new CellRangeAddress(headerRow, rowIdx - 1, 0, headers.length - 1));
        sheet.createFreezePane(0, headerRow + 1);
    }

    // ------------------------------------------------------------------
    // Sheet 3: Student Registry (with photographs)
    // ------------------------------------------------------------------
    private void buildStudentSheet(SXSSFWorkbook wb, List<Student> students) throws IOException {
        SXSSFSheet sheet = wb.createSheet("Student Registry");

        CellStyle titleStyle = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);

        CellStyle headerStyle = headerStyle(wb);
        CellStyle normal = bordered(wb);
        CellStyle centered = bordered(wb);
        centered.setAlignment(HorizontalAlignment.CENTER);

        int rowIdx = 0;
        Row t = sheet.createRow(rowIdx++);
        t.createCell(0).setCellValue("NATIONAL STUDENT REGISTRY — APAAR ID VERIFICATION RECORDS");
        t.getCell(0).setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

        Row meta = sheet.createRow(rowIdx++);
        meta.createCell(0).setCellValue("Total records: " + students.size() + "  •  Generated: "
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
        rowIdx++; // spacer

        int headerRow = rowIdx;
        String[] headers = {
                "Photo", "APAAR ID", "Student Name", "DOB", "Gender", "Course & Branch", "Year",
                "ABC Credits", "Class 10th %", "Class 12th %", "Admission Category", "Verification Status",
                "Institution", "Home State"
        };
        Row headerRow0 = sheet.createRow(rowIdx++);
        headerRow0.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow0.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        SXSSFDrawing drawing = sheet.createDrawingPatriarch();

        CellStyle verifiedStyle = okStyle(wb);
        CellStyle duplicateStyle = alertStyle(wb, true);
        CellStyle pendingStyle = warnStyle(wb);

        for (Student s : students) {
            Row row = sheet.createRow(rowIdx);
            row.setHeightInPoints(42);

            // ---- Photo cell (deterministic initials avatar) ----
            byte[] photo = generateAvatarPng(s.getName());
            int pictureIdx = wb.addPicture(photo, Workbook.PICTURE_TYPE_PNG);
            XSSFClientAnchor anchor = new XSSFClientAnchor(38, 10, 0, 0, 0, rowIdx, 1, rowIdx + 1);
            anchor.setAnchorType(XSSFClientAnchor.AnchorType.MOVE_AND_RESIZE);
            drawing.createPicture(anchor, pictureIdx);

            row.createCell(1).setCellValue(s.getApaarId());
            row.createCell(2).setCellValue(s.getName());
            row.createCell(3).setCellValue(s.getDob());
            row.createCell(4).setCellValue(s.getGender());
            row.createCell(5).setCellValue(s.getCourse());
            row.createCell(6).setCellValue("Year " + nz(s.getAcademicYear()));
            row.createCell(7).setCellValue(nz(s.getAbcCredits()) + " Cr");
            row.createCell(8).setCellValue(s.getTenthPercent() + "%");
            row.createCell(9).setCellValue(s.getTwelfthPercent() + "%");
            row.createCell(10).setCellValue(s.getCategory());

            Cell statusCell = row.createCell(11);
            String status = s.getStatus() == null ? "pending" : s.getStatus().toUpperCase();
            statusCell.setCellValue(status);
            switch (status) {
                case "VERIFIED" -> statusCell.setCellStyle(verifiedStyle);
                case "DUPLICATE", "REJECTED" -> statusCell.setCellStyle(duplicateStyle);
                default -> statusCell.setCellStyle(pendingStyle);
            }

            row.createCell(12).setCellValue(s.getCollegeName());
            row.createCell(13).setCellValue(s.getState());

            // consistent bordered styling for the remaining columns
            int[] centeredCols = {3, 4, 6, 7, 8, 9};
            int[] leftCols = {1, 2, 5, 10, 12, 13};
            for (int i : centeredCols) {
                row.getCell(i).setCellStyle(centered);
            }
            for (int i : leftCols) {
                row.getCell(i).setCellStyle(normal);
            }

            rowIdx++;
        }

        sheet.setColumnWidth(0, 13 * 256);   // Photo
        sheet.setColumnWidth(1, 17 * 256);   // APAAR ID
        sheet.setColumnWidth(2, 26 * 256);   // Name
        sheet.setColumnWidth(3, 12 * 256);
        sheet.setColumnWidth(4, 10 * 256);
        sheet.setColumnWidth(5, 44 * 256);   // Course
        sheet.setColumnWidth(6, 9 * 256);
        sheet.setColumnWidth(7, 12 * 256);
        sheet.setColumnWidth(8, 12 * 256);
        sheet.setColumnWidth(9, 12 * 256);
        sheet.setColumnWidth(10, 20 * 256);
        sheet.setColumnWidth(11, 18 * 256);
        sheet.setColumnWidth(12, 44 * 256);
        sheet.setColumnWidth(13, 16 * 256);

        sheet.setAutoFilter(new CellRangeAddress(headerRow, rowIdx - 1, 0, headers.length - 1));
        sheet.createFreezePane(0, headerRow + 1);
    }

    // ------------------------------------------------------------------
    // Avatar photo generator (deterministic per student name)
    // ------------------------------------------------------------------
    private byte[] generateAvatarPng(String fullName) throws IOException {
        int size = 96;
        String initials = deriveInitials(fullName);

        int paletteIndex = Math.abs(fullName.toLowerCase(Locale.ROOT).hashCode()) % (AVATAR_COLORS.length / 3);
        Color bg = new Color(
                AVATAR_COLORS[paletteIndex * 3] & 0xFF,
                AVATAR_COLORS[paletteIndex * 3 + 1] & 0xFF,
                AVATAR_COLORS[paletteIndex * 3 + 2] & 0xFF);

        BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g.setColor(Color.WHITE);
        g.fillRect(0, 0, size, size);
        g.setColor(bg);
        g.fillOval(4, 4, size - 8, size - 8);

        g.setColor(Color.WHITE);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, initials.length() > 2 ? 28 : 32));
        FontMetrics fm = g.getFontMetrics();
        int x = (size - fm.stringWidth(initials)) / 2;
        int y = (size - fm.getHeight()) / 2 + fm.getAscent();
        g.drawString(initials, x, y);
        g.dispose();

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", bos);
        return bos.toByteArray();
    }

    private String deriveInitials(String name) {
        if (name == null || name.isBlank()) return "ST";
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty() && Character.isLetter(p.charAt(0))) {
                sb.append(Character.toUpperCase(p.charAt(0)));
            }
            if (sb.length() == 2) break;
        }
        return sb.length() > 0 ? sb.toString() : "ST";
    }

    // ------------------------------------------------------------------
    // Shared styles
    // ------------------------------------------------------------------
    private CellStyle headerStyle(SXSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setFillForegroundColor(NAVY);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle bordered(SXSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle alertStyle(SXSSFWorkbook wb, boolean withFill) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.RED.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        if (withFill) {
            style.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        return style;
    }

    private CellStyle okStyle(SXSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.DARK_GREEN.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle warnStyle(SXSSFWorkbook wb) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.DARK_YELLOW.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private int nz(Integer v) {
        return v == null ? 0 : v;
    }
}
