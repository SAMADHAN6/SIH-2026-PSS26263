package gov.aicte.apaar.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class CollegeJsonSecurityTest {
    @Test
    void passwordHashIsNeverSerialized() throws Exception {
        College college = new College();
        college.setId("COL001");
        college.setName("Example College");
        college.setPasswordHash("$2a$12$must-never-leak");

        JsonNode json = new ObjectMapper().readTree(new ObjectMapper().writeValueAsBytes(college));

        assertFalse(json.has("passwordHash"));
    }
}
