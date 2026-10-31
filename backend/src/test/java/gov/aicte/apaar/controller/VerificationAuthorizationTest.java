package gov.aicte.apaar.controller;

import gov.aicte.apaar.model.Student;
import gov.aicte.apaar.repository.StudentRepository;
import gov.aicte.apaar.service.ApaarVerificationService;
import gov.aicte.apaar.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class VerificationAuthorizationTest {
    @Test
    @SuppressWarnings("unchecked")
    void publicLookupOmitsSensitiveStudentFields() {
        ApaarVerificationService verificationService = mock(ApaarVerificationService.class);
        StudentRepository studentRepository = mock(StudentRepository.class);
        VerificationController controller = new VerificationController(verificationService, mock(TokenService.class), studentRepository);
        Student student = new Student();
        student.setApaarId("123456789012");
        student.setName("Sample Student");
        student.setDob("2004-01-01");
        student.setMobile("+91 90000 00000");
        student.setAadhaarLast4("1234");
        student.setCourse("B.Tech");
        when(verificationService.verifyApaarId(anyString(), anyString())).thenReturn(Optional.of(student));

        var response = controller.verifyApaar("123456789012", "true", new MockHttpServletRequest());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        Map<String, Object> data = (Map<String, Object>) body.get("data");

        assertEquals(200, response.getStatusCode().value());
        assertEquals("B.Tech", data.get("course"));
        assertEquals(false, data.containsKey("name"));
        assertEquals(false, data.containsKey("dob"));
        assertEquals(false, data.containsKey("mobile"));
        assertEquals(false, data.containsKey("aadhaarLast4"));
    }

    @Test
    void collegeAdminCannotChangeAnotherCollegesStudent() {
        ApaarVerificationService verificationService = mock(ApaarVerificationService.class);
        TokenService tokenService = mock(TokenService.class);
        StudentRepository studentRepository = mock(StudentRepository.class);
        VerificationController controller = new VerificationController(verificationService, tokenService, studentRepository);

        when(tokenService.validate("college-token")).thenReturn(Optional.of(new TokenService.TokenInfo(
                "COLLEGE_ADMIN", "admin@example.edu", "COL001", java.time.Instant.now().plusSeconds(3600))));
        Student otherCollegeStudent = new Student();
        otherCollegeStudent.setApaarId("123456789012");
        otherCollegeStudent.setCollegeId("COL002");
        when(studentRepository.findByApaarIdIgnoreCase("123456789012")).thenReturn(Optional.of(otherCollegeStudent));

        var response = controller.updateStatus("123456789012", "college-token", Map.of("status", "verified"), new MockHttpServletRequest());

        assertEquals(403, response.getStatusCode().value());
        verify(verificationService, never()).updateStudentStatus(anyString(), anyString(), anyString(), anyString(), anyString());
    }
}
