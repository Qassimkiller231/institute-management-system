
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
    const tests = await prisma.test.findMany();
    console.log('Total tests:', tests.length);

    const counts: Record<string, number> = {};
    tests.forEach(t => {
        const key = `${t.name} (${t.testType})`;
        counts[key] = (counts[key] || 0) + 1;
    });

    console.log('Duplicate Check:');
    Object.entries(counts).forEach(([name, count]) => {
        if (count > 1) {
            console.log(`❌ ${name}: ${count} entries`);
        } else {
            console.log(`✅ ${name}: 1 entry`);
        }
    });
}

checkDuplicates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
