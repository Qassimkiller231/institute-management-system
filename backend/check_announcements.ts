import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = "Amal@function.bh";
    console.log(`Checking for user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log("User not found!");
        return;
    }

    console.log("Found User ID:", user.id);

    const announcements = await prisma.announcement.findMany({
        where: { publishedBy: user.id }
    });

    console.log(`\nAnnouncements created by ${email}: ${announcements.length}`);
    announcements.forEach((a) => {
        console.log(`- [${a.createdAt.toISOString().split('T')[0]}] ${a.title}`);
    });

    // Also check TOTAL announcements to see if there are others
    const total = await prisma.announcement.count();
    console.log(`\nTotal announcements in system: ${total}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
