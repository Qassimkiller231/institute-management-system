import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSpeakingSlotsAndAnnouncements() {
    console.log('\n🚀 Adding Speaking Slots and Announcements...\n');

    try {
        // Get ALL teachers
        const teachers = await prisma.teacher.findMany();

        if (teachers.length === 0) {
            console.log('❌ No teachers found! Please create teachers first.');
            return;
        }

        console.log(`✅ Found ${teachers.length} teacher(s)\n`);

        // ========================================
        // SPEAKING SLOTS FOR ALL TEACHERS
        // ========================================

        console.log('📅 Creating Speaking Slots...\n');

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        let totalSlotsCreated = 0;

        // Create slots for EACH teacher
        for (const teacher of teachers) {
            console.log(`   👨‍🏫 ${teacher.firstName} ${teacher.lastName}`);

            const speakingSlots = [
                // Today
                { teacherId: teacher.id, slotDate: today, slotTime: new Date(`2025-01-01T09:00:00`) },
                { teacherId: teacher.id, slotDate: today, slotTime: new Date(`2025-01-01T10:00:00`) },
                { teacherId: teacher.id, slotDate: today, slotTime: new Date(`2025-01-01T11:00:00`) },
                // Tomorrow
                { teacherId: teacher.id, slotDate: tomorrow, slotTime: new Date(`2025-01-01T09:00:00`) },
                { teacherId: teacher.id, slotDate: tomorrow, slotTime: new Date(`2025-01-01T10:00:00`) },
                { teacherId: teacher.id, slotDate: tomorrow, slotTime: new Date(`2025-01-01T14:00:00`) },
                // Day after
                { teacherId: teacher.id, slotDate: dayAfter, slotTime: new Date(`2025-01-01T09:00:00`) },
                { teacherId: teacher.id, slotDate: dayAfter, slotTime: new Date(`2025-01-01T15:00:00`) }
            ];

            for (const slot of speakingSlots) {
                await prisma.speakingSlot.create({ data: slot });
            }

            totalSlotsCreated += speakingSlots.length;
            console.log(`      ✅ Created ${speakingSlots.length} slots`);
        }

        console.log(`\n📊 Total: ${totalSlotsCreated} speaking slots for ${teachers.length} teacher(s)\n`);

        // ========================================
        // ANNOUNCEMENTS
        // ========================================

        console.log('📢 Creating Announcements...');

        const announcements = [
            {
                title: 'Welcome to The Function Institute!',
                content: 'We are excited to have you join our English learning community. Classes start next week!',
                targetAudience: 'STUDENT',
                isPublished: true,
                publishedAt: new Date()
            },
            {
                title: 'Upcoming Speaking Tests',
                content: 'Speaking test slots are now available for booking. Please book your slot at least 24 hours in advance.',
                targetAudience: 'STUDENT',
                isPublished: true,
                publishedAt: new Date()
            },
            {
                title: 'Payment Reminder',
                content: 'Please ensure all tuition fees are paid by the end of this month to avoid any interruptions to your classes.',
                targetAudience: 'PARENT',
                isPublished: true,
                publishedAt: new Date()
            },
            {
                title: 'New Study Materials Available',
                content: 'Check the Materials section for newly uploaded worksheets and practice exercises for levels A1-B2.',
                targetAudience: 'STUDENT',
                isPublished: true,
                publishedAt: new Date()
            },
            {
                title: 'Teacher Meeting Tomorrow',
                content: 'Reminder: Staff meeting tomorrow at 3 PM in the main hall. Attendance is mandatory.',
                targetAudience: 'TEACHER',
                isPublished: true,
                publishedAt: new Date()
            }
        ];

        for (const announcement of announcements) {
            await prisma.announcement.create({ data: announcement });
        }

        console.log(`   ✅ Created ${announcements.length} announcements\n`);

        console.log('✅ Done!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSpeakingSlotsAndAnnouncements();
