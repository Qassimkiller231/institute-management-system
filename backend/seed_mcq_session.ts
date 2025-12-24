import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cpr = '040704734';
    console.log(`Searching for student with CPR: ${cpr}...`);

    const student = await prisma.student.findUnique({
        where: { cpr }
    });

    if (!student) {
        console.error(`Student with CPR ${cpr} not found!`);
        return;
    }
    console.log(`Found student: ${student.firstName} ${student.secondName}`);

    // Find or Create a Placement Test
    let test = await prisma.test.findFirst({
        where: { testType: 'PLACEMENT' }
    });

    if (!test) {
        console.log('No Placement Test found. Creating one...');
        test = await prisma.test.create({
            data: {
                name: 'General Placement Test',
                testType: 'PLACEMENT',
                totalQuestions: 50,
                durationMinutes: 60,
                isActive: true
            }
        });
    }
    console.log(`Using Test: ${test.name} (${test.id})`);

    // Create Completed MCQ Session
    const session = await prisma.testSession.create({
        data: {
            studentId: student.id,
            testId: test.id,
            startedAt: new Date(),
            completedAt: new Date(),
            status: 'MCQ_COMPLETED',
            score: 85.50
        }
    });

    console.log(`Created Test Session ID: ${session.id}`);
    console.log('Status: MCQ_COMPLETED');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
