import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleCriteria() {
    console.log('Adding sample progress criteria for all levels...\n');

    // First, get all levels
    const levels = await prisma.level.findMany({
        select: { id: true, name: true }
    });

    console.log(`Found ${levels.length} levels:`, levels.map(l => l.name).join(', '));

    const criteriaByLevel = {
        'A1': [
            { name: 'Basic Greetings', description: 'Can greet and say goodbye', orderNumber: 1 },
            { name: 'Numbers 1-20', description: 'Can count and use numbers 1-20', orderNumber: 2 },
            { name: 'Present Simple', description: 'Can use present simple tense', orderNumber: 3 },
            { name: 'Common Words', description: 'Knows 100+ common words', orderNumber: 4 },
            { name: 'Simple Questions', description: 'Can ask and answer simple questions', orderNumber: 5 },
        ],
        'A2': [
            { name: 'Past Tense', description: 'Can use past simple tense', orderNumber: 1 },
            { name: 'Daily Routines', description: 'Can describe daily activities', orderNumber: 2 },
            { name: 'Numbers 1-100', description: 'Can count and use numbers 1-100', orderNumber: 3 },
            { name: 'Short Paragraphs', description: 'Can write short paragraphs', orderNumber: 4 },
            { name: 'Simple Conversations', description: 'Can hold simple conversations', orderNumber: 5 },
        ],
        'B1': [
            { name: 'Future Tenses', description: 'Can use future tenses correctly', orderNumber: 1 },
            { name: 'Express Opinions', description: 'Can express and justify opinions', orderNumber: 2 },
            { name: 'Conditionals', description: 'Can use first and second conditionals', orderNumber: 3 },
            { name: 'Longer Texts', description: 'Can understand longer texts', orderNumber: 4 },
            { name: 'Formal Writing', description: 'Can write formal emails/letters', orderNumber: 5 },
        ],
        'B2': [
            { name: 'Complex Grammar', description: 'Can use complex grammatical structures', orderNumber: 1 },
            { name: 'Debates', description: 'Can participate in debates', orderNumber: 2 },
            { name: 'Idiomatic Expressions', description: 'Can understand and use idioms', orderNumber: 3 },
            { name: 'Academic Writing', description: 'Can write academic essays', orderNumber: 4 },
            { name: 'Native Speed Listening', description: 'Can understand native speakers at normal speed', orderNumber: 5 },
        ],
    };

    let totalAdded = 0;

    for (const level of levels) {
        const criteria = criteriaByLevel[level.name as keyof typeof criteriaByLevel];

        if (!criteria) {
            console.log(`⚠️  No sample criteria defined for level: ${level.name}`);
            continue;
        }

        console.log(`\n📝 Adding ${criteria.length} criteria for level ${level.name}...`);

        for (const c of criteria) {
            await prisma.progressCriteria.create({
                data: {
                    ...c,
                    levelId: level.id,
                    groupId: null,  // Not tied to any specific group
                    isActive: true,
                }
            });
            console.log(`   ✅ ${c.name}`);
            totalAdded++;
        }
    }

    console.log(`\n✅ Successfully added ${totalAdded} criteria!`);

    await prisma.$disconnect();
}

addSampleCriteria().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
