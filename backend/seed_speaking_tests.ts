import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed request...');

    // 1. Fetch some teachers
    const teachers = await prisma.teacher.findMany({ take: 3 });
    if (teachers.length === 0) {
        console.log('No teachers found. Please seed teachers first.');
        return;
    }

    // 2. Fetch some students
    const students = await prisma.student.findMany({ take: 5 });
    if (students.length === 0) {
        console.log('No students found. Please seed students first.');
        return;
    }

    // 3. Create Speaking Slots
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

    // Future Slots (Scheduled)
    for (let i = 0; i < 3; i++) {
        const student = students[i];
        const teacher = teachers[i % teachers.length];

        // Date: Tomorrow
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const time = new Date();
        time.setHours(10 + i, 0, 0, 0);

        await prisma.speakingSlot.create({
            data: {
                teacherId: teacher.id,
                studentId: student.id,
                slotDate: date,
                slotTime: time,
                durationMinutes: 15,
                status: 'BOOKED'
            }
        });
        console.log(`Created SCHEDULED slot for ${student.firstName}`);
    }

    // Past Slots (Completed with Scores)
    for (let i = 3; i < 5; i++) {
        const student = students[i];
        const teacher = teachers[i % teachers.length];

        // Date: Yesterday
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const time = new Date();
        time.setHours(14 + i, 0, 0, 0);

        const level = levels[Math.floor(Math.random() * levels.length)];

        await prisma.speakingSlot.create({
            data: {
                teacherId: teacher.id,
                studentId: student.id,
                slotDate: date,
                slotTime: time,
                durationMinutes: 15,
                status: 'COMPLETED',
                mcqLevel: level,
                speakingLevel: level,
                finalLevel: level,
                feedback: 'Good performance, needs more confidence.'
            }
        });
        console.log(`Created COMPLETED slot for ${student.firstName} with level ${level}`);
    }

    // Available Slots (No Student)
    const teacher = teachers[0];
    const date = new Date();
    date.setDate(date.getDate() + 2);

    await prisma.speakingSlot.create({
        data: {
            teacherId: teacher.id,
            slotDate: date,
            slotTime: new Date(date.setHours(9, 0, 0, 0)),
            durationMinutes: 15,
            status: 'AVAILABLE'
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
