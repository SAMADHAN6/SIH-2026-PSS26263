package gov.aicte.apaar.config;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.model.VerificationLog;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.repository.VerificationLogRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("!render")
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;
    private final VerificationLogRepository logRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(StudentRepository studentRepository,
                           CollegeRepository collegeRepository,
                           VerificationLogRepository logRepository,
                           PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.collegeRepository = collegeRepository;
        this.logRepository = logRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Idempotent seeding: only seed an empty database (records persist in file-based H2)
        if (collegeRepository.count() > 0) {
            return;
        }

        seedColleges();
        seedStudents();
        seedAuditLogs();
    }

    private void seedColleges() {
        List<College> colleges = List.of(
                new College("COL001", "Delhi Institute of Engineering & Technology", "AICTE-DL-0012",
                        "Delhi", "New Delhi", 1200, 1240, 980, 200, 60, 45, 24, 8),
                new College("COL002", "Maharashtra Institute of Technology & Advanced Studies", "AICTE-MH-0845",
                        "Maharashtra", "Pune", 420, 418, 380, 28, 10, 21, 12, 6),
                new College("COL003", "Bangalore Technical & Science Academy", "AICTE-KA-0491",
                        "Karnataka", "Bengaluru", 300, 295, 260, 30, 5, 15, 10, 8),
                new College("COL004", "Tamil Nadu Engineering & Management Campus", "AICTE-TN-0219",
                        "Tamil Nadu", "Chennai", 480, 472, 440, 24, 8, 24, 15, 10),
                new College("COL005", "Uttar Pradesh Council of Technology", "AICTE-UP-0672",
                        "Uttar Pradesh", "Lucknow", 500, 515, 410, 85, 20, 25, 6, 2),
                new College("COL006", "Gujarat Technical University Campus", "AICTE-GJ-0334",
                        "Gujarat", "Ahmedabad", 360, 352, 310, 30, 12, 18, 8, 4),
                new College("COL007", "West Bengal Institute of Engineering & Science", "AICTE-WB-0527",
                        "West Bengal", "Kolkata", 420, 408, 365, 28, 15, 20, 9, 5),
                new College("COL008", "Rajasthan Institute of Technology & Management", "AICTE-RJ-0713",
                        "Rajasthan", "Jaipur", 300, 288, 240, 36, 12, 15, 5, 2),
                new College("COL009", "Hyderabad School of Technology", "AICTE-TS-0468",
                        "Telangana", "Hyderabad", 380, 372, 330, 26, 16, 16, 11, 6),
                new College("COL010", "Kerala Academy of Engineering & Innovation", "AICTE-KL-0156",
                        "Kerala", "Kochi", 240, 235, 210, 18, 7, 12, 7, 3),
                new College("COL011", "Punjab Technical Education Campus", "AICTE-PB-0641",
                        "Punjab", "Ludhiana", 280, 270, 225, 30, 15, 14, 6, 3),
                new College("COL012", "Assam Institute of Technology", "AICTE-AS-0892",
                        "Assam", "Guwahati", 200, 192, 165, 20, 7, 10, 4, 2)
        );

        // Institutional login credentials (hashed). Primary demo account: college@aicte.ac.in / 123456
        assignCredentials(colleges.get(0), "college@aicte.ac.in", "123456");
        assignCredentials(colleges.get(1), "admissions@mitas-pune.edu.in", "campus@123");
        assignCredentials(colleges.get(2), "office@btsa-bengaluru.edu.in", "campus@123");
        assignCredentials(colleges.get(3), "registrar@tnemc-chennai.edu.in", "campus@123");
        assignCredentials(colleges.get(4), "admin@upct-lucknow.edu.in", "campus@123");
        assignCredentials(colleges.get(5), "coordinator@gtuc-ahmedabad.edu.in", "campus@123");
        assignCredentials(colleges.get(6), "principal@wbies-kolkata.edu.in", "campus@123");
        assignCredentials(colleges.get(7), "office@ritm-jaipur.edu.in", "campus@123");
        assignCredentials(colleges.get(8), "dean@hst-hyderabad.edu.in", "campus@123");
        assignCredentials(colleges.get(9), "admin@kaei-kochi.edu.in", "campus@123");
        assignCredentials(colleges.get(10), "registrar@ptec-ludhiana.edu.in", "campus@123");
        assignCredentials(colleges.get(11), "office@ait-guwahati.edu.in", "campus@123");

        collegeRepository.saveAll(colleges);
    }

    private void assignCredentials(College college, String email, String rawPassword) {
        college.setEmail(email);
        college.setPasswordHash(passwordEncoder.encode(rawPassword));
        college.setActive(true);
    }

    private void seedStudents() {
        List<Student> students = new ArrayList<>();

        // ---- COL001: Delhi Institute of Engineering & Technology (primary demo college) ----
        // apaar|name|dob|gender|mobile|aadhaar4|course|yr|credits|t10|t12|status|category|enroll|admit|digi|homeState|dupId|dupReason
        addCol001(students);
        addCol002(students);
        addCol003(students);
        addCol004(students);
        addCol005(students);
        addCol006(students);
        addCol007(students);
        addCol008(students);
        addCol009(students);
        addCol010(students);
        addCol011(students);
        addCol012(students);

        studentRepository.saveAll(students);
    }

    private Student parseRow(String collegeId, String row) {
        String[] f = row.split("\\|", -1);
        String dupId = f[17].isEmpty() ? null : f[17];
        String dupName = null;
        if (dupId != null) {
            College dup = collegeRepository.findById(dupId).orElse(null);
            dupName = dup != null ? dup.getName() : dupId;
        }
        return new Student(f[0], f[1], f[2], f[3], f[4], f[5],
                collegeId, collegeNameOf(collegeId), f[6],
                Integer.parseInt(f[7]), Integer.parseInt(f[8]),
                Double.parseDouble(f[9]), Double.parseDouble(f[10]),
                f[11], f[12], f[13], f[14],
                "1".equals(f[15]), f[16],
                dupName, dupId, f[18].isEmpty() ? null : f[18]);
    }

    private final java.util.Map<String, String> collegeNames = new java.util.HashMap<>();

    private String collegeNameOf(String id) {
        return collegeNames.computeIfAbsent(id, cid ->
                collegeRepository.findById(cid).map(College::getName).orElse(cid));
    }

    private void addAll(List<Student> list, String collegeId, String... rows) {
        for (String row : rows) {
            list.add(parseRow(collegeId, row));
        }
    }

    private void addCol001(List<Student> s) {
        addAll(s, "COL001",
            "123456789012|Aarav Sharma|2004-05-14|Male|+91 98765 43210|4829|B.Tech Computer Science & Engineering|3|96|94.6|92.4|verified|General|2022-CSE-001|2022-08-16|1|Delhi||",
            "100000000005|Mohammad Farhan Akhtar|2004-07-12|Male|+91 98112 34567|5087|B.Tech Mechanical Engineering|3|88|84.0|82.5|duplicate|OBC-NCL|2022-ME-089|2022-08-14|1|Delhi|COL005|Simultaneous regular enrolment active at Uttar Pradesh Council of Technology under UID UP-2022-892",
            "100000000009|Tariq Ahmad Mir|2005-06-19|Male|+91 94190 22334|8521|B.Tech Civil Engineering|2|62|82.4|80.6|verified|General|2023-CE-033|2023-08-11|1|Jammu & Kashmir||",
            "100000000012|Ananya Banerjee|2005-08-14|Female|+91 98310 99887|3984|B.Tech Computer Science & Engineering|1|30|96.0|94.2|duplicate|General|2024-CSE-112|2024-08-01|1|West Bengal|COL003|Dual enrolment recorded across Delhi and Karnataka colleges in AY 2024-25",
            "100000000013|Rajesh Kumar|2004-09-18|Male|+91 98110 55443|7741|B.Tech Computer Science & Engineering|1|30|89.4|88.0|pending|Supernumerary (TFW)|2022-CSE-145|2022-08-15|0|Delhi||",
            "100000000018|Kavita Singh|2004-10-18|Female|+91 98150 67890|9041|B.Tech Information Technology|2|60|91.2|89.8|verified|OBC-NCL|2022-IT-038|2022-08-15|1|Uttar Pradesh||",
            "100000000023|Gaurav Kumar|2004-03-22|Male|+91 98100 88990|2176|B.Tech Electronics & Communication|3|90|88.6|86.4|verified|SC|2022-ECE-072|2022-08-15|1|Delhi||",
            "100000000028|Ritu Singh|2003-04-12|Female|+91 98101 22334|4189|B.Tech Computer Science & Engineering|4|120|95.0|93.6|verified|General|2021-CSE-009|2021-08-16|1|Delhi||",
            "100000000033|Ashok Kumar|2005-02-14|Male|+91 98119 44332|6211|B.Tech Information Technology|1|30|85.2|83.0|pending|SC|2024-IT-061|2024-08-01|0|Delhi||",
            "100000000040|Meera Iyer|2004-11-02|Female|+91 98410 55667|3315|B.Tech Computer Science & Engineering|2|64|93.8|91.5|verified|General|2023-CSE-052|2023-08-14|1|Tamil Nadu||"
        );
    }

    private void addCol002(List<Student> s) {
        addAll(s, "COL002",
            "APAAR10000003|Rohan Deshmukh|2005-02-18|Male|+91 97654 32189|6234|B.Tech Instrumentation & Control|1|32|88.5|86.2|pending|Supernumerary (TFW)|2024-IC-044|2024-08-12|0|Maharashtra||",
            "APAAR10000024|Pratik Bhalerao|2004-12-28|Male|+91 97660 33221|6719|B.Tech Instrumentation & Control|3|88|86.5|84.0|verified|General|2022-IC-019|2022-08-16|1|Maharashtra||",
            "APAAR10000026|Sneha Kulkarni|2004-06-25|Female|+91 98220 41255|5140|B.Tech Computer Science & Engineering|2|66|92.1|90.4|verified|OBC-NCL|2023-CSE-021|2023-08-14|1|Maharashtra||",
            "APAAR10000027|Om Prakash Jaiswal|2003-09-30|Male|+91 99700 81234|4452|B.Tech Chemical Engineering|4|118|81.3|79.8|verified|EWS|2021-CH-011|2021-08-16|1|Uttar Pradesh||"
        );
    }

    private void addCol003(List<Student> s) {
        addAll(s, "COL003",
            "APAAR10000028|Arjun Gowda|2004-04-08|Male|+91 98861 72210|9123|B.Tech Computer Science & Engineering|3|94|90.7|88.9|verified|OBC-NCL|2022-CSE-077|2022-08-15|1|Karnataka||",
            "APAAR10000029|Deepika Rao|2005-01-19|Female|+91 99001 45566|2648|B.Tech Information Science & Engineering|2|60|94.2|92.0|verified|General|2023-ISE-038|2023-08-14|1|Karnataka||",
            "APAAR10000030|Rahul Nayak|2004-08-23|Male|+91 98801 23344|7751|B.Tech Mechanical Engineering|1|28|79.6|77.4|pending|ST|2024-ME-102|2024-08-10|0|Karnataka||",
            "APAAR10000031|Imran Khan|2003-12-05|Male|+91 99021 67123|3816|B.Tech Electronics & Communication|4|122|87.9|85.6|duplicate|Minority|2021-ECE-045|2021-08-16|1|Karnataka|COL009|Concurrent active enrolment detected at Hyderabad School of Technology in AY 2021-22"
        );
    }

    private void addCol004(List<Student> s) {
        addAll(s, "COL004",
            "APAAR10000032|Karthik Subramanian|2004-03-11|Male|+91 94441 88223|5590|B.Tech Computer Science & Engineering|3|92|93.4|91.7|verified|General|2022-CSE-063|2022-08-15|1|Tamil Nadu||",
            "APAAR10000033|Priya Ramachandran|2005-05-27|Female|+91 94445 62119|8013|B.Tech Electrical & Electronics|2|62|89.8|87.5|verified|MBC|2023-EEE-029|2023-08-14|1|Tamil Nadu||",
            "APAAR10000034|Divya Krishnan|2004-10-09|Female|+91 94449 90342|1194|B.Tech Biomedical Engineering|1|30|91.6|89.2|pending|General|2024-BME-071|2024-08-12|0|Tamil Nadu||",
            "APAAR10000025|Tanvi Seshadri|2004-03-08|Female|+91 94440 66778|9532|B.Tech Biomedical Engineering|3|92|94.0|92.8|duplicate|General|2022-BME-007|2022-08-15|1|Tamil Nadu|COL002|Student migration unclosed; simultaneous active record detected in the Maharashtra portal"
        );
    }

    private void addCol005(List<Student> s) {
        addAll(s, "COL005",
            "APAAR10000035|Aditya Verma|2004-01-26|Male|+91 94152 88410|6602|B.Tech Computer Science & Engineering|3|90|91.0|89.3|verified|General|2022-CSE-114|2022-08-16|1|Uttar Pradesh||",
            "APAAR10000036|Shubham Tiwari|2005-04-15|Male|+91 94503 22775|4439|B.Tech Mechanical Engineering|1|26|78.4|76.9|pending|OBC-NCL|2024-ME-201|2024-08-13|0|Uttar Pradesh||",
            "APAAR10000037|Ayesha Siddiqui|2004-07-21|Female|+91 94153 90812|7284|B.Tech Civil Engineering|2|58|85.7|83.4|verified|Minority|2023-CE-086|2023-08-14|1|Uttar Pradesh||",
            "APAAR10000038|Pooja Goswami|2003-11-30|Female|+91 94159 45621|3347|B.Tech Electronics & Communication|4|124|90.2|88.0|pending|EWS|2021-ECE-154|2021-08-16|0|Uttar Pradesh||"
        );
    }

    private void addCol006(List<Student> s) {
        addAll(s, "COL006",
            "APAAR10000039|Harsh Patel|2004-02-17|Male|+91 98241 55620|9078|B.Tech Computer Science & Engineering|3|92|92.8|90.6|verified|General|2022-CSE-041|2022-08-15|1|Gujarat||",
            "APAAR10000041|Kinjal Shah|2005-06-03|Female|+91 94271 88394|2167|B.Tech Information Technology|2|64|95.1|93.2|verified|General|2023-IT-055|2023-08-14|1|Gujarat||",
            "APAAR10000042|Yash Trivedi|2004-09-12|Male|+91 98251 71208|6723|B.Tech Chemical Engineering|1|30|82.5|80.1|pending|OBC-NCL|2024-CH-019|2024-08-12|0|Gujarat||",
            "APAAR10000043|Nidhi Joshi|2003-08-29|Female|+91 94281 40913|8845|B.Tech Mechanical Engineering|4|118|86.9|84.7|verified|ST|2021-ME-033|2021-08-16|1|Gujarat||"
        );
    }

    private void addCol007(List<Student> s) {
        addAll(s, "COL007",
            "APAAR10000044|Sourav Chatterjee|2004-05-05|Male|+91 98301 66452|3490|B.Tech Computer Science & Engineering|3|96|93.7|91.9|verified|General|2022-CSE-052|2022-08-15|1|West Bengal||",
            "APAAR10000045|Ritwika Sen|2005-03-24|Female|+91 98303 19087|7765|B.Tech Electronics & Communication|2|62|90.4|88.1|verified|OBC-NCL|2023-ECE-093|2023-08-14|1|West Bengal||",
            "APAAR10000046|Arindam Ghosh|2004-11-11|Male|+91 98305 44321|5521|B.Tech Electrical Engineering|1|28|81.8|79.5|pending|SC|2024-EE-066|2024-08-11|0|West Bengal||",
            "APAAR10000047|Susmita Das|2003-10-07|Female|+91 98307 88234|9014|B.Tech Civil Engineering|4|120|88.3|86.0|duplicate|General|2021-CE-028|2021-08-16|1|West Bengal|COL003|Prior active enrolment never closed at Bangalore Technical & Science Academy (AY 2021-22)"
        );
    }

    private void addCol008(List<Student> s) {
        addAll(s, "COL008",
            "APAAR10000048|Vikram Choudhary|2004-06-14|Male|+91 94141 72239|6812|B.Tech Computer Science & Engineering|3|90|87.6|85.3|verified|OBC-NCL|2022-CSE-087|2022-08-16|1|Rajasthan||",
            "APAAR10000049|Anjali Sharma|2005-07-08|Female|+91 94142 55178|4490|B.Tech Electronics & Communication|2|60|91.9|89.6|verified|General|2023-ECE-041|2023-08-14|1|Rajasthan||",
            "APAAR10000050|Manish Jat|2004-12-19|Male|+91 94605 88290|3318|B.Tech Mechanical Engineering|1|26|76.8|74.9|pending|ST|2024-ME-118|2024-08-12|0|Rajasthan||"
        );
    }

    private void addCol009(List<Student> s) {
        addAll(s, "COL009",
            "APAAR10000051|Sai Teja Reddy|2004-04-02|Male|+91 97011 63290|7789|B.Tech Computer Science & Engineering|3|94|92.3|90.8|verified|General|2022-CSE-019|2022-08-15|1|Telangana||",
            "APAAR10000052|Anusha Varma|2005-01-31|Female|+91 99631 40512|6620|B.Tech Information Technology|2|64|93.1|91.2|verified|OBC-NCL|2023-IT-074|2023-08-14|1|Telangana||",
            "APAAR10000053|Kalyan Rathan|2003-09-09|Male|+91 97015 87734|9951|B.Tech Mechatronics|4|120|85.4|83.1|duplicate|EWS|2021-MT-053|2021-08-16|1|Andhra Pradesh|COL006|Unclosed enrolment at Gujarat Technical University Campus detected during national de-duplication scan",
            "APAAR10000054|Meghana Nair|2004-08-16|Female|+91 97019 22145|4433|B.Tech Computer Science & Engineering (Data Science)|2|62|94.6|92.9|verified|General|2023-CSE-DS-008|2023-08-14|1|Kerala||"
        );
    }

    private void addCol010(List<Student> s) {
        addAll(s, "COL010",
            "APAAR10000055|Aravind Menon|2004-02-27|Male|+91 94475 81120|5567|B.Tech Computer Science & Engineering|3|92|91.5|89.8|verified|General|2022-CSE-036|2022-08-15|1|Kerala||",
            "APAAR10000056|Fathima Beevi|2005-05-14|Female|+91 94477 34892|8823|B.Tech Electrical & Electronics|1|30|87.2|85.0|pending|MBC|2024-EEE-017|2024-08-11|0|Kerala||",
            "APAAR10000057|Jithin Joseph|2003-12-22|Male|+91 94479 90175|2146|B.Tech Electronics & Communication|4|122|89.8|87.4|verified|Christian|2021-ECE-060|2021-08-16|1|Kerala||"
        );
    }

    private void addCol011(List<Student> s) {
        addAll(s, "COL011",
            "APAAR10000058|Gurpreet Singh|2004-03-19|Male|+91 98722 66410|7734|B.Tech Computer Science & Engineering|3|90|88.9|86.7|verified|Jatt-Sikh|2022-CSE-072|2022-08-16|1|Punjab||",
            "APAAR10000059|Simran Kaur|2005-04-26|Female|+91 98552 83307|3391|B.Tech Electronics & Communication|2|60|92.4|90.3|verified|General|2023-ECE-029|2023-08-14|1|Punjab||",
            "APAAR10000060|Harjas Brar|2004-10-30|Male|+91 98726 19044|6685|B.Tech Mechanical Engineering|2|58|84.1|81.8|duplicate|Jatt-Sikh|2023-ME-095|2023-08-14|1|Punjab|COL008|Active seat also recorded at Rajasthan Institute of Technology & Management since AY 2023-24"
        );
    }

    private void addCol012(List<Student> s) {
        addAll(s, "COL012",
            "APAAR10000061|Ankita Baruah|2004-06-21|Female|+91 94351 77208|8802|B.Tech Computer Science & Engineering|2|60|90.8|88.5|duplicate|General|2023-CSE-048|2023-08-14|1|Assam|COL007|Residual enrolment at West Bengal Institute of Engineering & Science never revoked",
            "APAAR10000062|Rajib Deka|2005-03-08|Male|+91 94353 44819|5548|B.Tech Civil Engineering|1|28|79.3|77.0|pending|OBC-NCL|2024-CE-062|2024-08-13|0|Assam||",
            "APAAR10000063|Parismita Saikia|2004-09-25|Female|+91 94355 91062|2237|B.Tech Electronics & Communication|3|88|89.2|87.0|verified|ST|2022-ECE-039|2022-08-16|1|Assam||"
        );
    }

    private void seedAuditLogs() {
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(4), "123456789012", "Aarav Sharma",
                "VERIFIED", "college@aicte.ac.in", "COLLEGE_ADMIN", "14.139.60.2"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(3), "APAAR10000031", "Imran Khan",
                "DUPLICATE_FLAGGED", "system.risk-engine", "SYSTEM", "164.100.158.4"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusHours(2), "100000000005", "Mohammad Farhan Akhtar",
                "DUPLICATE_FLAGGED", "system.risk-engine", "SYSTEM", "164.100.158.4"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusMinutes(45), "APAAR10000003", "Rohan Deshmukh",
                "INTAKE_AUDIT_QUEUED", "registrar@tnemc-chennai.edu.in", "COLLEGE_ADMIN", "49.36.12.8"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusMinutes(30), "100000000012", "Ananya Banerjee",
                "DUPLICATE_FLAGGED", "system.risk-engine", "SYSTEM", "164.100.158.4"));
        logRepository.save(new VerificationLog(LocalDateTime.now().minusMinutes(10), "APAAR10000061", "Ankita Baruah",
                "DUPLICATE_FLAGGED", "system.risk-engine", "SYSTEM", "164.100.158.4"));
    }
}
