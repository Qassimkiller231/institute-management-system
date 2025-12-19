import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateTestCSV() {
    console.log('🔍 Finding test data...');

    // 1. Find an active group with enrollments and sessions
    const group = await prisma.group.findFirst({
        where: {
            isActive: true,
            enrollments: { some: {} },
            classSessions: { some: {} }
        },
        include: {
            enrollments: {
                include: {
                    student: true
                }
            },
            classSessions: {
                take: 1,
                orderBy: { sessionDate: 'desc' },
                where: { sessionDate: { lte: new Date() } } // Past/Today sessions
            }
        }
    });

    if (!group) {
        console.error('❌ No suitable active group found with enrollments and sessions.');
        return;
    }

    const session = group.classSessions[0];
    if (!session) {
        console.error('❌ Group found but no past sessions available.');
        return;
    }

    const dateStr = session.sessionDate.toISOString().split('T')[0];
    console.log(`📅 Using Session Date: ${dateStr} (Group: ${group.name || group.groupCode})`);

    // 2. Generate CSV Content
    const header = 'CPR,Date,Status,Remarks';
    const rows = group.enrollments.map((enrollment, index) => {
        const status = index % 3 === 0 ? 'ABSENT' : (index % 5 === 0 ? 'LATE' : 'PRESENT');
        const remarks = status === 'ABSENT' ? 'Sick' : (status === 'LATE' ? 'Traffic' : '');

        // Ensure CPR is valid (assuming it exists on student)
        return `${enrollment.student.cpr},${dateStr},${status},${remarks}`;
    });

    const csvContent = [header, ...rows].join('\n');

    // 3. Write to file
    const outputPath = path.join(process.cwd(), 'test_attendance.csv');
    fs.writeFileSync(outputPath, csvContent);

    console.log(`✅ Test CSV generated at: ${outputPath}`);
    console.log('\n--- CSV CONTENT PREVIEW ---');
    console.log(csvContent);
    console.log('---------------------------');
}

generateTestCSV()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
