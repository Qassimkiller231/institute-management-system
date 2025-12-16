
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
    const tests = await prisma.test.findMany({
        include: {
            _count: {
                select: {
                    testSessions: true,
                    questions: true
                }
            }
        }
    });

    // Group by name + type
    const groups: Record<string, typeof tests> = {};
    tests.forEach(t => {
        const key = `${t.name}|${t.testType}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    for (const [key, group] of Object.entries(groups)) {
        if (group.length > 1) {
            console.log(`\nFound duplicates for: ${key.replace('|', ' - ')}`);

            // Sort by importance:
            // 1. Has sessions (most important)
            // 2. Has questions
            // 3. Oldest creation date
            group.sort((a, b) => {
                if (b._count.testSessions !== a._count.testSessions) return b._count.testSessions - a._count.testSessions;
                if (b._count.questions !== a._count.questions) return b._count.questions - a._count.questions;
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

            const winner = group[0];
            const losers = group.slice(1);

            console.log(`   Keep: ${winner.id} (Sessions: ${winner._count.testSessions}, Questions: ${winner._count.questions})`);

            for (const loser of losers) {
                console.log(`   🗑️ Deleting: ${loser.id} (Sessions: ${loser._count.testSessions}, Questions: ${loser._count.questions})`);
                // Delete related questions first if any (cascade should handle it but safer to be explicit or rely on cascade)
                // Schema says: questions TestQuestion[] (no cascade specified on Test side? wait, TestQuestion has @relation(onDelete: Cascade))
                // So deleting Test should be fine.
                await prisma.test.delete({ where: { id: loser.id } });
            }
        }
    }
    console.log('\nCleanup complete!');
}

cleanupDuplicates()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
