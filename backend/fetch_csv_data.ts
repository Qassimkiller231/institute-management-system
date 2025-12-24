import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching active enrollments...');
    const enrollments = await prisma.enrollment.findMany({
        where: { status: 'ACTIVE' },
        include: {
            student: true,
            group: true
        },
        take: 10
    });

    if (enrollments.length === 0) {
        console.log('No active enrollments found.');
        return;
    }

    console.log('---DATA---');
    enrollments.forEach(e => {
        console.log(`${e.student.cpr},${e.group.groupCode}`);
    });
    console.log('---END DATA---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
