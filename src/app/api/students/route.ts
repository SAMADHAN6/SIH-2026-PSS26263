import { NextRequest, NextResponse } from "next/server";
import { studentStore } from "@/lib/student-store";
import { StudentRecord } from "@/lib/mock-apaar-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get("collegeId") || undefined;
  const status = searchParams.get("status") || undefined;
  const course = searchParams.get("course") || undefined;
  const query = searchParams.get("q") || undefined;

  let students = studentStore.getStudentsByCollege(collegeId);

  if (status && status !== "all") {
    students = students.filter((s) => s.status === status);
  }

  if (course && course !== "all") {
    students = students.filter((s) => s.course.toLowerCase().includes(course.toLowerCase()));
  }

  if (query) {
    const q = query.toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.apaarId.toLowerCase().includes(q) ||
        s.enrollmentNo.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    total: students.length,
    data: students,
    colleges: studentStore.getColleges(),
    logs: studentStore.getLogs().slice(0, 10),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      // Bulk CSV upload
      const result = studentStore.bulkUpload(body as StudentRecord[]);
      return NextResponse.json({
        success: true,
        message: `Processed ${result.total} records. Added: ${result.added}, Duplicates flagged: ${result.duplicates}`,
        ...result,
      });
    } else {
      // Single student registration
      const result = studentStore.addStudent(body as StudentRecord);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 400 });
  }
}
