package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.College;
import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.CollegeRepository;
import gov.aicte.apaar.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/college")
@CrossOrigin(origins = "*")
public class CollegeController {

    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;

    public CollegeController(StudentRepository studentRepository, CollegeRepository collegeRepository) {
        this.studentRepository = studentRepository;
        this.collegeRepository = collegeRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getCollegeStats(@RequestParam(defaultValue = "COL001") String collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElse(new College("COL001", "Delhi Institute of Engineering & Technology", "AICTE-DL-0012",
                        "Delhi", "New Delhi", 1200, 1240, 980, 200, 60, 45, 24, 8));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "college", college,
                "intakeVariance", college.getActualEnrolment() - college.getApprovedIntake(),
                "overIntakeFlag", college.getActualEnrolment() > college.getApprovedIntake()
        ));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) String collegeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category
    ) {
        List<Student> students = (q != null && !q.trim().isEmpty())
                ? studentRepository.searchStudents(q.trim())
                : studentRepository.findAll();

        if (collegeId != null && !collegeId.isEmpty()) {
            students = students.stream().filter(s -> collegeId.equalsIgnoreCase(s.getCollegeId())).collect(Collectors.toList());
        }

        if (course != null && !"all".equalsIgnoreCase(course)) {
            students = students.stream().filter(s -> s.getCourse().toLowerCase().contains(course.toLowerCase())).collect(Collectors.toList());
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

    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUpload(@RequestBody List<Student> incoming) {
        int added = 0;
        int duplicates = 0;

        for (Student s : incoming) {
            if (studentRepository.findByApaarIdIgnoreCase(s.getApaarId()).isPresent()) {
                duplicates++;
            } else {
                studentRepository.save(s);
                added++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", String.format("Batch validated! %d processed: %d added, %d duplicates flagged.", incoming.size(), added, duplicates),
                "addedCount", added,
                "duplicateCount", duplicates
        ));
    }
}
