import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Auto-generate speaking slots for teachers
 * Ensures each active teacher has slots for the next 3 days
 * Creates slots from 1:00 PM to 3:45 PM every 15 minutes (12 slots per day)
 */
export const autoGenerateSpeakingSlots = async () => {
    try {
        console.log('\n🔄 Starting auto-generation of speaking slots...');

        // 1. Get all active teachers
        const teachers = await prisma.teacher.findMany({
            where: { isActive: true },
            select: { id: true, firstName: true, lastName: true }
        });

        if (teachers.length === 0) {
            console.log('ℹ️ No active teachers found');
            return { success: true, teachersProcessed: 0, slotsCreated: 0 };
        }

        console.log(`📋 Found ${teachers.length} active teacher(s)`);

        // 2. Calculate next 3 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDates: Date[] = [];
        for (let i = 1; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            targetDates.push(date);
        }

        console.log(`📅 Target dates: ${targetDates.map(d => d.toISOString().split('T')[0]).join(', ')}`);

        // 3. Generate time slots (1:00 PM to 3:45 PM, every 15 minutes)
        const timeSlots: string[] = [];
        for (let hour = 13; hour < 16; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                if (hour === 15 && minute > 45) break; // Stop at 3:45 PM
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                timeSlots.push(timeStr);
            }
        }

        console.log(`⏰ Time slots per day: ${timeSlots.length} (${timeSlots[0]} - ${timeSlots[timeSlots.length - 1]})`);

        let totalSlotsCreated = 0;
        let teachersProcessed = 0;

        // 4. For each teacher, check and create missing slots
        for (const teacher of teachers) {
            let teacherSlotsCreated = 0;

            for (const targetDate of targetDates) {
                // Check if teacher already has any slots for this date
                const existingSlots = await prisma.speakingSlot.count({
                    where: {
                        teacherId: teacher.id,
                        slotDate: targetDate
                    }
                });

                if (existingSlots > 0) {
                    // Skip this date - teacher already has slots
                    continue;
                }

                // Create slots for this date
                const slotsToCreate = timeSlots.map(timeStr => ({
                    teacherId: teacher.id,
                    slotDate: targetDate,
                    slotTime: new Date(`2000-01-01T${timeStr}`),
                    durationMinutes: 15,
                    status: 'AVAILABLE'
                }));

                await prisma.speakingSlot.createMany({
                    data: slotsToCreate,
                    skipDuplicates: true
                });

                teacherSlotsCreated += slotsToCreate.length;
                totalSlotsCreated += slotsToCreate.length;
            }

            if (teacherSlotsCreated > 0) {
                console.log(`  ✅ ${teacher.firstName} ${teacher.lastName}: Created ${teacherSlotsCreated} slots`);
                teachersProcessed++;
            }
        }

        console.log(`\n✅ Auto-generation complete!`);
        console.log(`   Teachers processed: ${teachersProcessed}/${teachers.length}`);
        console.log(`   Total slots created: ${totalSlotsCreated}`);

        return {
            success: true,
            teachersProcessed,
            totalTeachers: teachers.length,
            slotsCreated: totalSlotsCreated
        };

    } catch (error) {
        console.error('❌ Error in auto-generate speaking slots:', error);
        throw error;
    }
};
