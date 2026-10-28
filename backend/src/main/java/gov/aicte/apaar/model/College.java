package gov.aicte.apaar.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "colleges")
public class College {

    @Id
    @Column(length = 32)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    private String state;
    private String city;

    @Column(unique = true, length = 120)
    private String email;

    @Column(length = 64)
    @JsonIgnore
    private String passwordHash;

    @Column(nullable = false)
    private Boolean active = true;

    private Integer approvedIntake;
    private Integer actualEnrolment;
    private Integer verifiedCount;
    private Integer pendingCount;
    private Integer duplicateCount;

    private Integer supernumeraryQuota;
    private Integer nriCount;
    private Integer fnCount;

    public College() {}

    public College(String id, String name, String code, String state, String city,
                   Integer approvedIntake, Integer actualEnrolment, Integer verifiedCount,
                   Integer pendingCount, Integer duplicateCount, Integer supernumeraryQuota,
                   Integer nriCount, Integer fnCount) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.state = state;
        this.city = city;
        this.approvedIntake = approvedIntake;
        this.actualEnrolment = actualEnrolment;
        this.verifiedCount = verifiedCount;
        this.pendingCount = pendingCount;
        this.duplicateCount = duplicateCount;
        this.supernumeraryQuota = supernumeraryQuota;
        this.nriCount = nriCount;
        this.fnCount = fnCount;
        this.active = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getApprovedIntake() { return approvedIntake; }
    public void setApprovedIntake(Integer approvedIntake) { this.approvedIntake = approvedIntake; }

    public Integer getActualEnrolment() { return actualEnrolment; }
    public void setActualEnrolment(Integer actualEnrolment) { this.actualEnrolment = actualEnrolment; }

    public Integer getVerifiedCount() { return verifiedCount; }
    public void setVerifiedCount(Integer verifiedCount) { this.verifiedCount = verifiedCount; }

    public Integer getPendingCount() { return pendingCount; }
    public void setPendingCount(Integer pendingCount) { this.pendingCount = pendingCount; }

    public Integer getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; }

    public Integer getSupernumeraryQuota() { return supernumeraryQuota; }
    public void setSupernumeraryQuota(Integer supernumeraryQuota) { this.supernumeraryQuota = supernumeraryQuota; }

    public Integer getNriCount() { return nriCount; }
    public void setNriCount(Integer nriCount) { this.nriCount = nriCount; }

    public Integer getFnCount() { return fnCount; }
    public void setFnCount(Integer fnCount) { this.fnCount = fnCount; }
}
