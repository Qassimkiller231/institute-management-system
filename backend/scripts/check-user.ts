
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide an email address as an argument.');
        return;
    }

    console.log(`Checking user with email: ${email}`);

    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        include: {
            teacher: true,
            student: true,
            parent: true
        }
    });

    if (!user) {
        console.log('❌ User NOT found.');
    } else {
        console.log('✅ User found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Teacher Profile: ${user.teacher ? 'YES (' + user.teacher.id + ')' : '❌ MISSING'}`);
        if (user.role === 'TEACHER' && !user.teacher) {
            console.log('   ⚠️  CRITICAL: User has TEACHER role but no Teacher profile!');
        }
    }
}

checkUser()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
