import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSoftDeletedItems() {
    console.log('🔍 Checking for soft-deleted items still in database...\n');

    // Check each model with isActive field
    const checks = [
        { name: 'Hall', model: prisma.hall },
        { name: 'Venue', model: prisma.venue },
        { name: 'Program', model: prisma.program },
        { name: 'Term', model: prisma.term },
        { name: 'Level', model: prisma.level },
        { name: 'Group', model: prisma.group },
        { name: 'Student', model: prisma.student },
        { name: 'Teacher', model: prisma.teacher },
        { name: 'Parent', model: prisma.parent },
        { name: 'Admin', model: prisma.admin },
    ];

    for (const check of checks) {
        const total = await (check.model as any).count();
        const active = await (check.model as any).count({
            where: { isActive: true }
        });
        const inactive = total - active;

        console.log(`📋 ${check.name}:`);
        console.log(`   Total: ${total} | Active: ${active} | Inactive: ${inactive}`);

        if (inactive > 0) {
            console.log(`   ⚠️  ${inactive} soft-deleted ${check.name}(s) found!`);

            // Show sample
            const samples = await (check.model as any).findMany({
                where: { isActive: false },
                take: 3,
                select: {
                    id: true,
                    ...(check.name === 'Hall' ? { name: true } : {}),
                    ...(check.name === 'Venue' ? { name: true } : {}),
                    ...(check.name === 'Program' ? { name: true } : {}),
                    ...(check.name === 'Term' ? { name: true } : {}),
                    ...(check.name === 'Level' ? { name: true } : {}),
                    ...(check.name === 'Group' ? { name: true } : {}),
                    ...(['Student', 'Teacher', 'Parent', 'Admin'].includes(check.name) ? { firstName: true, lastName: true } : {}),
                }
            });

            samples.forEach((item: any) => {
                const displayName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.id;
                console.log(`      - "${displayName}"`);
            });
        }
        console.log('');
    }

    await prisma.$disconnect();
}

checkSoftDeletedItems().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
