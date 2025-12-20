
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTeachers() {
    console.log('🔍 Scanning for users with role TEACHER...');

    const users = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        include: {
            teacher: true
        }
    });

    if (users.length === 0) {
        console.log('❌ No users with role TEACHER found.');
        return;
    }

    console.log(`Found ${users.length} teacher accounts:`);
    console.log('----------------------------------------');

    users.forEach(u => {
        const hasProfile = !!u.teacher;
        const profileId = u.teacher?.id || 'MISSING';
        const statusIcon = hasProfile ? '✅' : '❌';

        console.log(`${statusIcon} ${u.email}`);
        console.log(`   ID: ${u.id}`);
        console.log(`   Profile ID: ${profileId}`);
        console.log('----------------------------------------');
    });
}

listTeachers()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
