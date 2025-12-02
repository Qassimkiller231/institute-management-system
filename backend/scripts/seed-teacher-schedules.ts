// scripts/seed-teacher-schedules.ts
// Run: npx ts-node scripts/seed-teacher-schedules.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTeacherSchedules() {
  try {
    console.log('🚀 Starting teacher schedule seeding...');

    // Get all teachers
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { email: true } }
      }
    });

    if (teachers.length === 0) {
      console.log('❌ No teachers found! Please create teachers first.');
      console.log('   Run: npm run seed:teachers (if you have such a script)');
      console.log('   Or create teachers via the admin panel');
      return;
    }

    console.log(`✅ Found ${teachers.length} teacher(s)`);
    teachers.forEach(t => {
      console.log(`   - ${t.firstName} ${t.lastName} (${t.user.email})`);
    });

    // Delete existing AVAILABLE slots (optional - comment out if you want to keep them)
    const deletedSlots = await prisma.speakingSlot.deleteMany({
      where: { status: 'AVAILABLE' }
    });
    console.log(`🗑️  Deleted ${deletedSlots.count} existing AVAILABLE slots`);

    // Create slots for each teacher
    let totalCreated = 0;

    for (const teacher of teachers) {
      console.log(`\n📅 Creating slots for ${teacher.firstName} ${teacher.lastName}...`);

      const slotsCreated = await createSlotsForTeacher(teacher.id);
      totalCreated += slotsCreated;

      console.log(`   ✅ Created ${slotsCreated} slots`);
    }

    console.log(`\n🎉 Success! Created ${totalCreated} speaking slots total`);
    console.log(`\n📊 Summary:`);

    // Show summary
    const summary = await prisma.speakingSlot.groupBy({
      by: ['slotDate'],
      where: { status: 'AVAILABLE' },
      _count: true,
      orderBy: { slotDate: 'asc' }
    });

    summary.forEach(day => {
      console.log(`   ${day.slotDate.toDateString()}: ${day._count} slots`);
    });

  } catch (error) {
    console.error('❌ Error seeding teacher schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSlotsForTeacher(teacherId: string): Promise<number> {
  const slots = [];
  const today = new Date();
  
  // Create slots for next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = slotDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Create slots from 9 AM to 5 PM (8 hours)
    // 15-minute slots = 4 slots per hour
    for (let hour = 9; hour <= 16; hour++) {
      for (const minute of [0, 15, 30, 45]) {
        // Create time string
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        
        // Create date-time for slotTime field
        const slotDateTime = new Date(slotDate);
        slotDateTime.setHours(hour, minute, 0, 0);

        slots.push({
          teacherId,
          slotDate,
          slotTime: slotDateTime,
          durationMinutes: 15,
          status: 'AVAILABLE'
        });
      }
    }
  }

  // Batch create all slots
  await prisma.speakingSlot.createMany({
    data: slots
  });

  return slots.length;
}

// Run the seed function
seedTeacherSchedules();