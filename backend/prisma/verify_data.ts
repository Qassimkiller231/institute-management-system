
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const parentCount = await prisma.parent.count();
    const linkCount = await prisma.parentStudentLink.count();
    const groupCount = await prisma.group.count();
    const enrollmentCount = await prisma.enrollment.count();

    console.log('--- Verification Report ---');
    console.log(`Users: ${userCount}`);
    console.log(`Students: ${studentCount} (Expected 40)`);
    console.log(`Parents: ${parentCount} (Expected ~16)`);
    console.log(`Sibling Links: ${linkCount}`);
    console.log(`Groups: ${groupCount}`);
    console.log(`Enrollments: ${enrollmentCount}`);

    // Check Demo Parent
    const demoParent = await prisma.parent.findFirst({
        where: { user: { email: 'parent.ahmed@test.com' } },
        include: { parentStudentLinks: { include: { student: true } } }
    });

    if (demoParent) {
        console.log(`\nDemo Parent found: ${demoParent.firstName} ${demoParent.lastName}`);
        console.log('Children:');
        demoParent.parentStudentLinks.forEach(link => {
            console.log(` - ${link.student.firstName} (CPR: ${link.student.cpr})`);
        });
    } else {
        console.error('❌ Demo Parent NOT found!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
