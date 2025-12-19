import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BulkUploadResult {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; reason: string }>;
}

export const processBulkAttendanceUpload = async (
    fileBuffer: Buffer,
    userId: string,
    userRole: string
): Promise<BulkUploadResult> => {
    const content = fileBuffer.toString('utf-8');
    const rows = content.split(/\r?\n/);

    const result: BulkUploadResult = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
    };

    console.log(`[BulkUpload] Starting process for ${rows.length} rows.`);

    // Skip header if exists
    let startIndex = 0;
    if (rows.length > 0) {
        const firstRow = rows[0].toLowerCase();
        if (firstRow.includes('cpr') || firstRow.includes('date')) {
            startIndex = 1;
        }
    }

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        result.total++;
        try {
            // Expected format: CPR, Date(YYYY-MM-DD), Status, Remarks
            const parts = row.split(',').map(p => p.trim());

            if (parts.length < 3) {
                throw new Error('Invalid format. Expected: CPR, Date, Status, [Remarks]');
            }

            const [cpr, dateStr, statusStr, remarks] = parts;
            console.log(`[BulkUpload] Row ${i + 1}: CPR=${cpr}, Date=${dateStr}, Status=${statusStr}`);

            // 1. Validate Status (String match)
            const status = statusStr.toUpperCase();
            if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
                throw new Error(`Invalid status: ${statusStr}`);
            }

            // 2. Find Student by CPR
            const student = await prisma.student.findUnique({
                where: { cpr }
            });

            if (!student) {
                console.log(`[BulkUpload] Student not found: ${cpr}`);
                throw new Error(`Student not found with CPR: ${cpr}`);
            }

            // 3. Find Active Enrollments
            const enrollments = await prisma.enrollment.findMany({
                where: {
                    studentId: student.id,
                    status: 'ACTIVE'
                },
                include: { group: true }
            });

            if (enrollments.length === 0) {
                console.log(`[BulkUpload] No active enrollments for ${cpr}`);
                throw new Error(`Student ${cpr} has no active enrollments.`);
            }

            const groupIdMap = new Map<string, string>(); // groupId -> enrollmentId
            enrollments.forEach(e => groupIdMap.set(e.groupId, e.id));
            const groupIds = Array.from(groupIdMap.keys());

            console.log(`[BulkUpload] Found enrollments in Groups: ${groupIds.join(', ')}`);

            // 4. Find Session for that Date
            // Determine date range for the query
            const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
            const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

            console.log(`[BulkUpload] Searching for session between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

            const matchingSession = await prisma.classSession.findFirst({
                where: {
                    groupId: { in: groupIds },
                    sessionDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: { group: true }
            });

            if (!matchingSession) {
                console.log(`[BulkUpload] No session found matching criteria.`);
                throw new Error(`No class session found for student ${cpr} on ${dateStr} (Checked ${groupIds.length} groups)`);
            }

            console.log(`[BulkUpload] Found Session: ${matchingSession.id} in Group ${matchingSession.groupId}`);

            const targetEnrollmentId = groupIdMap.get(matchingSession.groupId);
            if (!targetEnrollmentId) {
                throw new Error("System error: Enrollment ID lookup failed.");
            }

            const targetSession = matchingSession;

            // 5. Determine Marker
            let currentRecorderId = null;
            if (userRole === 'TEACHER') {
                const teacher = await prisma.teacher.findUnique({ where: { userId } });
                if (teacher) currentRecorderId = teacher.id;
            }
            if (!currentRecorderId) {
                // Default to group teacher
                currentRecorderId = targetSession.group.teacherId;
            }

            // 6. Upsert Manually (Find then Update or Create)
            const existingAttendance = await prisma.attendance.findFirst({
                where: {
                    studentId: student.id,
                    classSessionId: targetSession.id
                }
            });

            if (existingAttendance) {
                console.log(`[BulkUpload] Updating existing attendance record.`);
                await prisma.attendance.update({
                    where: { id: existingAttendance.id },
                    data: {
                        status: status,
                        notes: remarks || undefined,
                        markedBy: currentRecorderId,
                        updatedAt: new Date()
                    }
                });
            } else {
                console.log(`[BulkUpload] Creating new attendance record.`);
                await prisma.attendance.create({
                    data: {
                        studentId: student.id,
                        classSessionId: targetSession.id,
                        enrollmentId: targetEnrollmentId,
                        status: status,
                        notes: remarks || undefined,
                        markedBy: currentRecorderId,
                        markedAt: new Date()
                    }
                });
            }

            result.success++;

        } catch (error: any) {
            console.error(`[BulkUpload] Error on row ${i + 1}: ${error.message}`);
            result.failed++;
            result.errors.push({
                row: i + 1,
                reason: error.message
            });
        }
    }

    console.log(`[BulkUpload] Finished. Success: ${result.success}, Failed: ${result.failed}`);
    return result;
};
