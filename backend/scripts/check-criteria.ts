import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCriteria() {
    console.log('Checking all progress criteria in database...\n');

    const allCriteria = await prisma.progressCriteria.findMany({
        select: {
            id: true,
            name: true,
            levelId: true,
            groupId: true,
            isActive: true,
        }
    });

    console.log(`Total criteria count: ${allCriteria.length}\n`);

    allCriteria.forEach((c, i) => {
        console.log(`${i + 1}. "${c.name}"`);
        console.log(`   levelId: ${c.levelId || 'NULL'}`);
        console.log(`   groupId: ${c.groupId || 'NULL'}`);
        console.log(`   isActive: ${c.isActive}`);
        console.log('');
    });

    await prisma.$disconnect();
}

checkCriteria().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
