import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllCriteria() {
    console.log('Deleting all progress criteria...\n');

    const result = await prisma.progressCriteria.deleteMany({});

    console.log(`Deleted ${result.count} criteria.\n`);
    console.log('You can now add new criteria through the admin panel, setting them per level.');

    await prisma.$disconnect();
}

deleteAllCriteria().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
