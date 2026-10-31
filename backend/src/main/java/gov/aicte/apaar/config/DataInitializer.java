package gov.aicte.apaar.config;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.model.VerificationLog;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.repository.VerificationLogRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;
    private final VerificationLogRepository logRepository;

    public DataInitializer(StudentRepository studentRepository,
                           CollegeRepository collegeRepository,
                           VerificationLogRepository logRepository) {
        this.studentRepository = studentRepository;
        this.collegeRepository = collegeRepository;
        this.logRepository = logRepository;
    }

    @Override
    public void run(String... args) {
        if (collegeRepository.count() > 0 || studentRepository.count() > 0) {
            return;
        }
        // Seed Colleges
        List<College> colleges = List.of(
                new College("COL001", "Delhi Institute of Engineering & Technology", "AICTE-DL-0012",
                        "Delhi", "New Delhi", 1200, 1240, 980, 200, 60, 45, 24, 8),
                new College("COL002", "Maharashtra National Institute of Technology", "AICTE-MH-0845",
                        "Maharashtra", "Pune", 420, 418, 380, 28, 10, 21, 12, 6),
                new College("COL003", "Bangalore Technical & Science Academy", "AICTE-KA-0491",
                        "Karnataka", "Bengaluru", 300, 295, 260, 30, 5, 15, 10, 8),
                new College("COL004", "Tamil Nadu Engineering & Management Campus", "AICTE-TN-0219",
                        "Tamil Nadu", "Chennai", 480, 472, 440, 24, 8, 24, 15, 10),
                new College("COL005", "Uttar Pradesh Council of Technology", "AICTE-UP-0672",
                        "Uttar Pradesh", "Lucknow", 500, 515, 410, 85, 20, 25, 6, 2)
        );
        collegeRepository.saveAll(colleges);

        // Seed 50 realistic Indian students
        List<Student> students = new ArrayList<>();

        students.add(new Student("123456789012", "Aarav Sharma", "2004-05-14", "Male", "+91 98765 43210",
                "4829", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                3, 96, 94.6, 92.4, "verified", "General", "2022-CSE-001", "2022-08-16", true, "Delhi", null, null, null));

        students.add(new Student("100000000005", "Mohammad Farhan Akhtar", "2004-07-12", "Male", "+91 98112 34567",
                "5087", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Mechanical Engineering",
                3, 88, 84.0, 82.5, "duplicate", "General", "2022-ME-089", "2022-08-14", true, "Delhi",
                "Uttar Pradesh Council of Technology", "COL005", "Simultaneous regular enrollment active at UP Council of Technology under UID UP-2022-892"));

        students.add(new Student("100000000009", "Tariq Ahmad Mir", "2005-06-19", "Male", "+91 94190 22334",
                "8521", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Civil Engineering",
                2, 62, 82.4, 80.6, "verified", "General", "2023-CE-033", "2023-08-11", true, "Delhi", null, null, null));

        students.add(new Student("100000000012", "Ananya Banerjee", "2005-08-14", "Female", "+91 98310 99887",
                "3984", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                1, 30, 96.0, 94.2, "duplicate", "General", "2024-CSE-112", "2024-08-01", true, "Delhi",
                "Bangalore Technical & Science Academy", "COL003", "Dual enrolment recorded across Delhi and Karnataka colleges in AY 2024-25"));

        students.add(new Student("100000000013", "Rajesh Kumar", "2004-09-18", "Male", "+91 98110 55443",
                "7741", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                1, 30, 89.4, 88.0, "pending", "Supernumerary (TFW)", "2022-CSE-145", "2022-08-15", false, "Delhi", null, null, null));

        students.add(new Student("100000000018", "Kavita Singh", "2004-10-18", "Female", "+91 98150 67890",
                "9041", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Information Technology",
                2, 60, 91.2, 89.8, "verified", "General", "2022-IT-038", "2022-08-15", true, "Delhi", null, null, null));

        students.add(new Student("100000000023", "Gaurav Kumar", "2004-03-22", "Male", "+91 98100 88990",
                "2176", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Electronics & Communication",
                3, 90, 88.6, 86.4, "verified", "General", "2022-ECE-072", "2022-08-15", true, "Delhi", null, null, null));

        students.add(new Student("100000000028", "Ritu Singh", "2003-04-12", "Female", "+91 98101 22334",
                "4189", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                4, 120, 95.0, 93.6, "verified", "General", "2021-CSE-009", "2022-08-15", true, "Delhi", null, null, null));

        students.add(new Student("100000000033", "Ashok Kumar", "2005-02-14", "Male", "+91 98119 44332",
                "6211", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Information Technology",
                1, 30, 85.2, 83.0, "pending", "General", "2024-IT-061", "2022-08-15", false, "Delhi", null, null, null));

        students.add(new Student("APAAR10000024", "Pratik Bhalerao", "2004-12-28", "Male", "+91 97660 33221",
                "6719", "COL002", "Maharashtra National Institute of Technology", "B.Tech Instrumentation & Control",
                3, 88, 86.5, 84.0, "verified", "General", "2022-IC-019", "2022-08-16", true, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000025", "Tanvi Seshadri", "2004-03-08", "Female", "+91 94450 66778",
                "9532", "COL004", "Tamil Nadu Engineering & Management Campus", "B.Tech Biomedical Engineering",
                3, 92, 94.0, 92.8, "duplicate", "General", "2022-BME-007", "2022-08-15", true, "Tamil Nadu",
                "Maharashtra National Institute of Technology", "COL002", "Student migration unclosed; simultaneous active record detected in MH portal"));

        // Add 25 more diverse mock records up to 50
        for (int i = 26; i <= 50; i++) {
            String apaar = String.format("APAAR100000%02d", i);
            String course = (i % 2 == 0) ? "B.Tech Computer Science & Engineering" : "B.Tech Electronics & Communication";
            String cat = (i % 5 == 0) ? "Supernumerary (TFW)" : (i % 7 == 0) ? "NRI" : "General";
            String st = (i % 4 == 0) ? "pending" : (i == 48 || i == 35) ? "duplicate" : "verified";
            String dupCol = (i == 48) ? "Delhi Institute of Engineering & Technology" : (i == 35) ? "Uttar Pradesh Council of Technology" : null;
            String dupId = (i == 48) ? "COL001" : (i == 35) ? "COL005" : null;
            String reason = (dupCol != null) ? "Simultaneous active seat logged in regional portal" : null;

            students.add(new Student(apaar, "Student Indian " + i, "2004-0" + ((i % 9) + 1) + "-15",
                    (i % 2 == 0) ? "Male" : "Female", "+91 98000 " + (10000 + i),
                    String.format("%04d", 1000 + i), "COL001", "Delhi Institute of Engineering & Technology",
                    course, (i % 4) + 1, 60 + (i * 2), 85.0 + (i % 10), 84.0 + (i % 10),
                    st, cat, "2023-ENR-" + (100 + i), "2023-08-15", "verified".equals(st), "Delhi",
                    dupCol, dupId, reason));
        }

        studentRepository.saveAll(students);

        // Seed Audit Logs
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(4), "123456789012", "Aarav Sharma",
                "VERIFIED", "admin@delhi-tech.edu.in", "COLLEGE_ADMIN", "14.139.60.2"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(2), "100000000005", "Mohammad Farhan Akhtar",
                "DUPLICATE_FLAGGED", "system_aicte_risk_engine", "AICTE_SUPER_ADMIN", "164.100.158.4"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusMinutes(30), "100000000012", "Ananya Banerjee",
                "DUPLICATE_FLAGGED", "system_aicte_risk_engine", "AICTE_SUPER_ADMIN", "164.100.158.4"));
    }
}

