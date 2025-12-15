import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnnouncements() {
    console.log('Checking announcements in database...\n');

    const allAnnouncements = await prisma.announcement.findMany({
        select: {
            id: true,
            title: true,
            targetAudience: true,
            groupId: true,
            isPublished: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Total announcements: ${allAnnouncements.length}\n`);

    if (allAnnouncements.length === 0) {
        console.log('❌ NO ANNOUNCEMENTS IN DATABASE!');
        console.log('\nCreate some announcements in the admin panel:\n');
        console.log('1. Go to admin/teacher portal -> Announcements');
        console.log('2. Create announcement with targetAudience = "ALL"');
        return;
    }

    allAnnouncements.forEach((a, i) => {
        console.log(`${i + 1}. "${a.title}"`);
        console.log(`   targetAudience: ${a.targetAudience}`);
        console.log(`   groupId: ${a.groupId || 'null'}`);
        console.log(`   isPublished: ${a.isPublished}`);
        console.log(`   createdAt: ${a.createdAt.toISOString()}`);
        console.log('');
    });

    // Check specifically for the student's group
    const studentGroupId = 'd83386e5-3b93-43c3-b296-3666f62f1b47';
    console.log(`\n🔍 Checking announcements for student's group (${studentGroupId}):\n`);

    const matchingAnnouncements = allAnnouncements.filter(a =>
        a.groupId === studentGroupId ||
        a.targetAudience === 'ALL' ||
        a.targetAudience === 'STUDENTS'
    );

    console.log(`Matching announcements (before isPublished check): ${matchingAnnouncements.length}`);

    const publishedMatching = matchingAnnouncements.filter(a => a.isPublished);
    console.log(`Published matching announcements: ${publishedMatching.length}`);

    if (publishedMatching.length === 0) {
        console.log('\n❌ NO PUBLISHED ANNOUNCEMENTS MATCHING STUDENT CRITERIA!');
        console.log('\nPossible issues:');
        console.log('1. All announcements are unpublished (isPublished: false)');
        console.log('2. No announcements with targetAudience = "ALL" or "STUDENTS"');
        console.log('3. No announcements for this specific group');
    }

    await prisma.$disconnect();
}

checkAnnouncements().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
