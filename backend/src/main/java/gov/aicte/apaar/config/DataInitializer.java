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

        students.add(new Student("APAAR12345678", "Aarav Sharma", "2004-05-14", "Male", "+91 98765 43210",
                "4829", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                3, 96, 94.6, 92.4, "verified", "General", "2022-CSE-001", "2022-08-16", true, "Delhi", null, null, null));

        students.add(new Student("APAAR10000002", "Priya Lakshmi Sundaram", "2003-11-22", "Female", "+91 98450 11223",
                "9102", "COL004", "Tamil Nadu Engineering & Management Campus", "B.Tech Artificial Intelligence & Data Science",
                4, 128, 96.2, 95.8, "verified", "General", "2021-AIDS-018", "2021-09-01", true, "Tamil Nadu", null, null, null));

        students.add(new Student("APAAR10000003", "Rohan Deshmukh", "2005-02-18", "Male", "+91 97654 32189",
                "6234", "COL002", "Maharashtra National Institute of Technology", "B.Tech Electronics & Communication",
                2, 64, 88.5, 86.2, "pending", "Supernumerary (TFW)", "2023-ECE-044", "2023-08-20", false, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000004", "Aditi Vikram Rao", "2004-09-30", "Female", "+91 94481 23456",
                "3319", "COL003", "Bangalore Technical & Science Academy", "B.Tech Information Technology",
                3, 92, 91.0, 89.4, "verified", "General", "2022-IT-012", "2022-08-19", true, "Karnataka", null, null, null));

        students.add(new Student("APAAR10000005", "Mohammad Farhan Akhtar", "2004-07-12", "Male", "+91 98112 34567",
                "5087", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Mechanical Engineering",
                3, 88, 84.0, 82.5, "duplicate", "General", "2022-ME-089", "2022-08-14", true, "Delhi",
                "Uttar Pradesh Council of Technology", "COL005", "Simultaneous regular enrollment active at UP Council of Technology under UID UP-2022-892"));

        students.add(new Student("APAAR10000006", "Sneha Nair", "2005-04-05", "Female", "+91 94951 88776",
                "7124", "COL004", "Tamil Nadu Engineering & Management Campus", "B.Tech Computer Science & Engineering",
                2, 58, 93.8, 92.0, "verified", "Supernumerary (TFW)", "2023-CSE-091", "2023-08-10", true, "Tamil Nadu", null, null, null));

        students.add(new Student("APAAR10000007", "Vikramaditya Roy", "2003-12-08", "Male", "+91 98301 44556",
                "1983", "COL005", "Uttar Pradesh Council of Technology", "Master of Business Administration (MBA)",
                2, 52, 89.2, 87.5, "pending", "General", "2023-MBA-015", "2023-07-28", false, "Uttar Pradesh", null, null, null));

        students.add(new Student("APAAR10000008", "Kavya Murthy", "2004-01-25", "Female", "+91 98459 33221",
                "4472", "COL003", "Bangalore Technical & Science Academy", "B.Tech Robotics & Automation",
                3, 94, 95.0, 93.8, "verified", "General", "2022-ROB-008", "2022-08-22", true, "Karnataka", null, null, null));

        students.add(new Student("APAAR10000009", "Tariq Ahmad Mir", "2005-06-19", "Male", "+91 94190 22334",
                "8521", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Civil Engineering",
                2, 62, 82.4, 80.6, "pending", "General", "2023-CE-033", "2023-08-11", false, "Delhi", null, null, null));

        students.add(new Student("APAAR10000010", "Meera Krishnan", "2004-10-15", "Female", "+91 94470 66554",
                "6639", "COL002", "Maharashtra National Institute of Technology", "B.Tech AI & Data Science",
                3, 98, 97.4, 96.1, "verified", "General", "2022-AIDS-004", "2022-08-15", true, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000011", "Arjun Reddy", "2004-03-29", "Male", "+91 98490 77889",
                "2201", "COL004", "Tamil Nadu Engineering & Management Campus", "B.Tech Electrical & Electronics",
                3, 90, 90.2, 88.6, "verified", "General", "2022-EEE-027", "2022-08-18", true, "Tamil Nadu", null, null, null));

        students.add(new Student("APAAR10000012", "Ananya Banerjee", "2005-08-14", "Female", "+91 98310 99887",
                "3984", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                1, 30, 96.0, 94.2, "duplicate", "General", "2024-CSE-112", "2024-08-01", true, "Delhi",
                "Bangalore Technical & Science Academy", "COL003", "Dual enrolment recorded across Delhi and Karnataka colleges in AY 2024-25"));

        students.add(new Student("APAAR10000013", "Karan Johar Patel", "2003-05-20", "Male", "+91 98250 12345",
                "7741", "COL002", "Maharashtra National Institute of Technology", "Master of Computer Applications (MCA)",
                2, 56, 86.8, 84.5, "verified", "General", "2023-MCA-009", "2023-08-05", true, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000014", "Fatima Zehra", "2004-12-04", "Female", "+91 97110 54321",
                "5512", "COL005", "Uttar Pradesh Council of Technology", "B.Tech Biotechnology",
                3, 86, 91.5, 89.8, "pending", "General", "2022-BT-019", "2022-08-25", false, "Uttar Pradesh", null, null, null));

        students.add(new Student("APAAR10000015", "Devendra Singh Chauhan", "2004-06-11", "Male", "+91 94140 33445",
                "8893", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering",
                3, 92, 87.2, 85.0, "verified", "General", "2022-CSE-045", "2022-08-16", true, "Delhi", null, null, null));

        students.add(new Student("APAAR10000016", "Michael Anthony Fernandez", "2004-02-14", "Male", "+91 98221 45678",
                "1265", "COL002", "Maharashtra National Institute of Technology", "B.Tech Chemical Engineering",
                3, 84, 85.6, 83.2, "verified", "NRI", "2022-CHE-006", "2022-08-20", true, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000017", "Pooja Hegde", "2005-07-23", "Female", "+91 98451 98765",
                "6432", "COL003", "Bangalore Technical & Science Academy", "B.Tech Electronics & Communication",
                2, 60, 93.0, 91.5, "pending", "General", "2023-ECE-031", "2023-08-14", false, "Karnataka", null, null, null));

        students.add(new Student("APAAR10000018", "Gurpreet Singh Sandhu", "2003-10-18", "Male", "+91 98150 67890",
                "9041", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Automobile Engineering",
                4, 124, 83.4, 81.0, "verified", "General", "2021-AUTO-014", "2021-08-12", true, "Delhi", null, null, null));

        students.add(new Student("APAAR10000019", "Zoya Rehman", "2004-11-09", "Female", "+91 98990 11234",
                "3189", "COL005", "Uttar Pradesh Council of Technology", "B.Tech Computer Science & Engineering",
                3, 96, 95.2, 93.4, "verified", "General", "2022-CSE-078", "2022-08-15", true, "Uttar Pradesh", null, null, null));

        students.add(new Student("APAAR10000020", "Naveen Chandran", "2005-01-30", "Male", "+91 94440 22119",
                "7650", "COL004", "Tamil Nadu Engineering & Management Campus", "B.Tech Mechanical Engineering",
                2, 62, 88.0, 86.4, "pending", "General", "2023-ME-056", "2023-08-22", false, "Tamil Nadu", null, null, null));

        students.add(new Student("APAAR10000021", "Isha Ambani Kulkarni", "2004-04-17", "Female", "+91 98200 44332",
                "4920", "COL002", "Maharashtra National Institute of Technology", "B.Tech Computer Science & Engineering",
                3, 102, 98.4, 97.2, "verified", "General", "2022-CSE-002", "2022-08-14", true, "Maharashtra", null, null, null));

        students.add(new Student("APAAR10000022", "John Paul Ochieng", "2003-08-12", "Male", "+91 98450 77112",
                "0014", "COL003", "Bangalore Technical & Science Academy", "B.Tech Civil Engineering",
                4, 118, 82.0, 80.5, "verified", "Foreign National", "2021-FN-CE-002", "2021-09-10", true, "Karnataka", null, null, null));

        students.add(new Student("APAAR10000023", "Swati Mittal", "2005-09-02", "Female", "+91 98100 88990",
                "2176", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Information Technology",
                2, 64, 92.4, 90.8, "pending", "Supernumerary (TFW)", "2023-IT-023", "2023-08-18", false, "Delhi", null, null, null));

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
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(4), "APAAR12345678", "Aarav Sharma",
                "VERIFIED", "admin@delhi-tech.edu.in", "COLLEGE_ADMIN", "14.139.60.2"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(2), "APAAR10000005", "Mohammad Farhan Akhtar",
                "DUPLICATE_FLAGGED", "system_aicte_risk_engine", "AICTE_SUPER_ADMIN", "164.100.158.4"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusMinutes(30), "APAAR10000012", "Ananya Banerjee",
                "DUPLICATE_FLAGGED", "system_aicte_risk_engine", "AICTE_SUPER_ADMIN", "164.100.158.4"));
    }
}
