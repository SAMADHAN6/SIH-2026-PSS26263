import { MOCK_STUDENTS, INITIAL_COLLEGES, StudentRecord, CollegeRecord, VerificationLogItem } from "./mock-apaar-data";

// In-memory store for server-side persistence during runtime
class StudentDataManager {
  private students: StudentRecord[];
  private colleges: CollegeRecord[];
  private logs: VerificationLogItem[];

  constructor() {
    this.students = [...MOCK_STUDENTS];
    this.colleges = [...INITIAL_COLLEGES];
    this.logs = [
      {
        id: "LOG-001",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        apaarId: "APAAR12345678",
        studentName: "Aarav Sharma",
        action: "VERIFIED",
        actor: "admin@delhi-tech.edu.in",
        role: "COLLEGE_ADMIN",
        ipAddress: "14.139.60.2",
      },
      {
        id: "LOG-002",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        apaarId: "APAAR10000005",
        studentName: "Mohammad Farhan Akhtar",
        action: "DUPLICATE_FLAGGED",
        actor: "system_aicte_risk_engine",
        role: "AICTE_SUPER_ADMIN",
        ipAddress: "164.100.158.4",
      },
      {
        id: "LOG-003",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        apaarId: "APAAR10000012",
        studentName: "Ananya Banerjee",
        action: "DUPLICATE_FLAGGED",
        actor: "system_aicte_risk_engine",
        role: "AICTE_SUPER_ADMIN",
        ipAddress: "164.100.158.4",
      },
    ];
  }

  public getAllStudents(): StudentRecord[] {
    return this.students;
  }

  public getStudentByApaarId(apaarId: string): StudentRecord | undefined {
    const cleanId = apaarId.trim().toUpperCase();
    return this.students.find(
      (s) => s.apaarId.toUpperCase() === cleanId || s.apaarId.replace(/\D/g, "") === cleanId.replace(/\D/g, "")
    );
  }

  public getStudentsByCollege(collegeId?: string): StudentRecord[] {
    if (!collegeId) return this.students;
    return this.students.filter((s) => s.collegeId === collegeId);
  }

  public updateStudentStatus(
    apaarId: string,
    status: "verified" | "pending" | "duplicate" | "rejected",
    actorEmail: string = "college@aicte.ac.in",
    role: "STUDENT" | "COLLEGE_ADMIN" | "AICTE_SUPER_ADMIN" = "COLLEGE_ADMIN"
  ): StudentRecord | null {
    const student = this.getStudentByApaarId(apaarId);
    if (!student) return null;

    student.status = status;
    if (status === "verified") {
      student.digilockerVerified = true;
    }

    this.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      apaarId: student.apaarId,
      studentName: student.name,
      action: status === "verified" ? "VERIFIED" : status === "rejected" ? "REJECTED" : "DUPLICATE_FLAGGED",
      actor: actorEmail,
      role: role,
      ipAddress: "49.37.12.19",
    });

    return student;
  }

  public addStudent(studentData: StudentRecord): { success: boolean; message: string; student?: StudentRecord } {
    const existing = this.getStudentByApaarId(studentData.apaarId);
    if (existing) {
      return { success: false, message: `APAAR ID ${studentData.apaarId} already exists in the national database.` };
    }
    this.students.unshift(studentData);
    return { success: true, message: "Student record registered successfully.", student: studentData };
  }

  public bulkUpload(newStudents: StudentRecord[]): {
    total: number;
    added: number;
    duplicates: number;
    overIntakeFlag: boolean;
  } {
    let added = 0;
    let duplicates = 0;

    for (const item of newStudents) {
      const existing = this.getStudentByApaarId(item.apaarId);
      if (existing) {
        duplicates++;
      } else {
        this.students.unshift(item);
        added++;
      }
    }

    return {
      total: newStudents.length,
      added,
      duplicates,
      overIntakeFlag: this.students.length > 50,
    };
  }

  public getColleges(): CollegeRecord[] {
    return this.colleges;
  }

  public getLogs(): VerificationLogItem[] {
    return this.logs;
  }
}

// Global singleton instance across Next.js API calls in development & production
declare global {
  // eslint-disable-next-line no-var
  var __studentStore: StudentDataManager | undefined;
}

export const studentStore = global.__studentStore || new StudentDataManager();
if (process.env.NODE_ENV !== "production") {
  global.__studentStore = studentStore;
}
