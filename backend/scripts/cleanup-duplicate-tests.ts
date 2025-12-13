import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateTests() {
    console.log('\n🧹 Cleaning up duplicate tests...\n');

    try {
        // Get all tests with their IDs
        const allTests = await prisma.test.findMany({
            orderBy: { createdAt: 'asc' },
            include: { questions: true }
        });

        console.log(`Found ${allTests.length} tests total`);

        // Group by name
        const testsByName = new Map<string, typeof allTests>();

        for (const test of allTests) {
            if (!testsByName.has(test.name)) {
                testsByName.set(test.name, []);
            }
            testsByName.get(test.name)!.push(test);
        }

        // For each name with duplicates, keep the newest one
        for (const [name, tests] of testsByName.entries()) {
            if (tests.length > 1) {
                console.log(`\n📝 Found ${tests.length} duplicates of "${name}"`);

                // Sort by creation date (oldest first)
                tests.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                // Delete all except the last one (newest)
                const toDelete = tests.slice(0, -1);

                for (const test of toDelete) {
                    console.log(`   ❌ Deleting old test (ID: ${test.id.substring(0, 8)}..., created: ${test.createdAt.toISOString()})`);
                    await prisma.test.delete({ where: { id: test.id } });
                }

                console.log(`   ✅ Kept newest test (ID: ${tests[tests.length - 1].id.substring(0, 8)}..., created: ${tests[tests.length - 1].createdAt.toISOString()})`);
            }
        }

        console.log('\n✅ Cleanup complete!\n');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupDuplicateTests();
