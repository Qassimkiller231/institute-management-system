import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // ========================================
  // 1. SEED TERMS
  // ========================================
  console.log('📅 Seeding Terms...');
  
  // Get existing program (assuming you have one)
  const programs = await prisma.program.findMany();
  if (programs.length === 0) {
    throw new Error('No programs found. Please seed programs first.');
  }
  const program = programs[0];

  const terms = await Promise.all([
    prisma.term.create({
      data: {
        programId: program.id,
        name: 'Fall 2024',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        isCurrent: false,
        isActive: true,
      },
    }),
    prisma.term.create({
      data: {
        programId: program.id,
        name: 'Spring 2025',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-30'),
        isCurrent: true,
        isActive: true,
      },
    }),
    prisma.term.create({
      data: {
        programId: program.id,
        name: 'Summer 2025',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-08-30'),
        isCurrent: false,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${terms.length} terms\n`);

  // ========================================
  // 2. SEED GROUPS
  // ========================================
  console.log('👥 Seeding Groups...');

  // Get required data
  const levels = await prisma.level.findMany();
  const teachers = await prisma.teacher.findMany();
  const venues = await prisma.venue.findMany();

  if (levels.length === 0) throw new Error('No levels found');
  if (teachers.length === 0) throw new Error('No teachers found');
  if (venues.length === 0) throw new Error('No venues found');

  const currentTerm = terms.find(t => t.isCurrent);
  if (!currentTerm) throw new Error('No current term');

  // Create groups for different levels
  const groups = [];
  const levelNames = ['A1', 'A2', 'B1', 'B2'];
  
  for (let i = 0; i < Math.min(4, levels.length); i++) {
    const level = levels[i];
    const teacher = teachers[i % teachers.length];
    const venue = venues[0];

    // Morning group
    const morningGroup = await prisma.group.create({
      data: {
        termId: currentTerm.id,
        levelId: level.id,
        teacherId: teacher.id,
        venueId: venue.id,
        groupCode: `${levelNames[i]}-M-${currentTerm.name.substring(0, 3).toUpperCase()}`,
        name: `${levelNames[i]} Morning Class`,
        schedule: {
          days: ['Sunday', 'Tuesday', 'Thursday'],
          startTime: '09:00',
          endTime: '11:00',
        },
        capacity: 20,
        isActive: true,
      },
    });
    groups.push(morningGroup);

    // Evening group
    const eveningGroup = await prisma.group.create({
      data: {
        termId: currentTerm.id,
        levelId: level.id,
        teacherId: teacher.id,
        venueId: venue.id,
        groupCode: `${levelNames[i]}-E-${currentTerm.name.substring(0, 3).toUpperCase()}`,
        name: `${levelNames[i]} Evening Class`,
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '17:00',
          endTime: '19:00',
        },
        capacity: 15,
        isActive: true,
      },
    });
    groups.push(eveningGroup);
  }

  console.log(`✅ Created ${groups.length} groups\n`);

  // ========================================
  // 3. SEED PHONES
  // ========================================
  console.log('📱 Seeding Phones...');

  const students = await prisma.student.findMany();
  if (students.length === 0) {
    console.log('⚠️  No students found, skipping phone seeding\n');
  } else {
    const phones = [];
    
    // Add phones for first 5 students
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const student = students[i];
      
      const phone = await prisma.phone.create({
        data: {
          phoneNumber: `3${1000000 + i}`,
          countryCode: '+973',
          isVerified: true,
          isPrimary: true,
          studentId: student.id,
          isActive: true,
        },
      });
      phones.push(phone);
    }

    console.log(`✅ Created ${phones.length} phone numbers\n`);
  }

  // ========================================
  // 4. SEED ENROLLMENTS & PAYMENT PLANS
  // ========================================
  console.log('💳 Seeding Enrollments & Payment Plans...');

  const studentsForEnrollment = await prisma.student.findMany({ take: 10 });
  
  if (studentsForEnrollment.length === 0) {
    console.log('⚠️  No students found, skipping enrollment seeding\n');
  } else {
    let enrollmentCount = 0;
    let paymentPlanCount = 0;

    for (const student of studentsForEnrollment) {
      // Randomly assign to a group
      const randomGroup = groups[Math.floor(Math.random() * groups.length)];

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          groupId: randomGroup.id,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      });
      enrollmentCount++;

      // Create payment plan
      const totalAmount = 500; // BD 500
      const numInstallments = 3;
      const installmentAmount = totalAmount / numInstallments;

      const paymentPlan = await prisma.studentPaymentPlan.create({
        data: {
          enrollmentId: enrollment.id,
          totalAmount,
          discountAmount: 0,
          finalAmount: totalAmount,
          totalInstallments: numInstallments,
          status: 'ACTIVE',
        },
      });
      paymentPlanCount++;

      // Create installments
      const today = new Date();
      for (let i = 0; i < numInstallments; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(dueDate.getMonth() + i);

        await prisma.installment.create({
          data: {
            paymentPlanId: paymentPlan.id,
            installmentNumber: i + 1,
            amount: installmentAmount,
            dueDate,
            paymentMethod: 'BENEFIT_PAY',
            paymentDate: i === 0 ? new Date() : null, // First installment paid
            receiptNumber: i === 0 ? `REC-2025-${1000 + enrollmentCount}` : null,
          },
        });
      }
    }

    console.log(`✅ Created ${enrollmentCount} enrollments`);
    console.log(`✅ Created ${paymentPlanCount} payment plans with installments\n`);
  }

  // ========================================
  // 5. SEED CLASS SESSIONS
  // ========================================
  console.log('📚 Seeding Class Sessions...');

  const halls = await prisma.hall.findMany();
  if (halls.length === 0) {
    console.log('⚠️  No halls found, skipping class session seeding\n');
  } else {
    let sessionCount = 0;

    for (const group of groups.slice(0, 2)) { // Only first 2 groups
      const schedule = group.schedule as any;
      const days = schedule?.days || ['Sunday', 'Tuesday'];
      const startTime = schedule?.startTime || '09:00';
      const endTime = schedule?.endTime || '11:00';

      // Create 6 sessions over the next 3 weeks
      const startDate = new Date();
      let sessionNumber = 1;

      for (let week = 0; week < 3; week++) {
        for (const day of days.slice(0, 2)) { // 2 sessions per week
          const sessionDate = new Date(startDate);
          sessionDate.setDate(sessionDate.getDate() + (week * 7) + getDayOffset(day));

          await prisma.classSession.create({
            data: {
              groupId: group.id,
              hallId: halls[0].id,
              sessionDate,
              sessionNumber: sessionNumber++,
              startTime: new Date(`1970-01-01T${startTime}:00Z`),
              endTime: new Date(`1970-01-01T${endTime}:00Z`),
              topic: `Session ${sessionNumber - 1}`,
              status: 'SCHEDULED',
            },
          });
          sessionCount++;
        }
      }
    }

    console.log(`✅ Created ${sessionCount} class sessions\n`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

// Helper function to get day offset
function getDayOffset(dayName: string): number {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const targetDay = days.indexOf(dayName);
  
  if (targetDay === -1) return 0;
  
  let offset = targetDay - today;
  if (offset <= 0) offset += 7;
  
  return offset;
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });