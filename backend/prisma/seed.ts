import prisma from '../src/utils/db';

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - be careful!)
  console.log('🗑️  Cleaning existing data...');
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.group.deleteMany();
  await prisma.level.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.term.deleteMany();
  await prisma.program.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // ========================================
  // 1. CREATE USERS
  // ========================================
  console.log('\n👥 Creating users...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@institute.com',
      phone: '33111111',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'sarah.teacher@institute.com',
      phone: '33222222',
      role: 'TEACHER',
      isActive: true,
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'john.teacher@institute.com',
      phone: '33333333',
      role: 'TEACHER',
      isActive: true,
    },
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'ahmed.student@example.com',
      phone: '33445566',
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'fatima.student@example.com',
      phone: '33556677',
      role: 'STUDENT',
      isActive: true,
    },
  });

  const parentUser1 = await prisma.user.create({
    data: {
      email: 'parent1@example.com',
      phone: '33998877',
      role: 'PARENT',
      isActive: true,
    },
  });

  console.log('✅ Created 6 users');

  // ========================================
  // 2. CREATE TEACHERS
  // ========================================
  console.log('\n👩‍🏫 Creating teachers...');

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'English Literature',
      isActive: true,
      availableForSpeakingTests: true,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Grammar & Writing',
      isActive: true,
      availableForSpeakingTests: true,
    },
  });

  console.log('✅ Created 2 teachers');

  // ========================================
  // 3. CREATE STUDENTS
  // ========================================
  console.log('\n👨‍🎓 Creating students...');

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      cpr: '950101234',
      firstName: 'Ahmed',
      secondName: 'Ali',
      thirdName: 'Hassan',
      dateOfBirth: new Date('2005-05-15'),
      gender: 'Male',
      schoolType: 'Government',
      schoolYear: 'Grade 10',
      email: 'ahmed.student@example.com',
      preferredTiming: 'Evening',
      preferredCenter: 'Country Mall',
      needsTransport: false,
      area: 'Manama',
      houseNo: '123',
      road: '45',
      block: '310',
      isActive: true,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      cpr: '960202345',
      firstName: 'Fatima',
      secondName: 'Mohammed',
      thirdName: 'Ali',
      dateOfBirth: new Date('2006-08-20'),
      gender: 'Female',
      schoolType: 'Private',
      schoolYear: 'Grade 9',
      email: 'fatima.student@example.com',
      preferredTiming: 'Morning',
      preferredCenter: 'Riyadat Mall',
      needsTransport: true,
      area: 'Riffa',
      isActive: true,
    },
  });

  console.log('✅ Created 2 students');

  // ========================================
  // 4. CREATE PARENT
  // ========================================
  console.log('\n👨‍👩‍👧 Creating parent...');

  const parent1 = await prisma.parent.create({
    data: {
      userId: parentUser1.id,
      firstName: 'Ali',
      lastName: 'Hassan',
    },
  });

  // Link parent to student
  await prisma.parentStudentLink.create({
    data: {
      parentId: parent1.id,
      studentId: student1.id,
      relationship: 'Father',
    },
  });

  console.log('✅ Created 1 parent with link to student');

  // ========================================
  // 5. CREATE PHONES
  // ========================================
  console.log('\n📱 Creating phone records...');

  await prisma.phone.create({
    data: {
      phoneNumber: '33445566',
      countryCode: '+973',
      isVerified: true,
      isPrimary: true,
      studentId: student1.id,
    },
  });

  await prisma.phone.create({
    data: {
      phoneNumber: '33998877',
      countryCode: '+973',
      isVerified: true,
      isPrimary: true,
      parentId: parent1.id,
    },
  });

  console.log('✅ Created 2 phone records');

  // ========================================
  // 6. CREATE PROGRAMS
  // ========================================
  console.log('\n📚 Creating programs...');

  const programMultiverse = await prisma.program.create({
    data: {
      name: 'English Multiverse',
      code: 'ENG-MV',
      description: 'Comprehensive English program for young learners',
      minAge: 6,
      maxAge: 12,
      isActive: true,
    },
  });

  const programUnlimited = await prisma.program.create({
    data: {
      name: 'English Unlimited',
      code: 'ENG-UL',
      description: 'Advanced English program for teenagers and adults',
      minAge: 13,
      maxAge: 99,
      isActive: true,
    },
  });

  console.log('✅ Created 2 programs');

  // ========================================
  // 7. CREATE TERMS
  // ========================================
  console.log('\n📅 Creating terms...');

  const term1 = await prisma.term.create({
    data: {
      programId: programUnlimited.id,
      name: 'Summer 1 2025',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-08-31'),
      isCurrent: true,
      isActive: true,
    },
  });

  const term2 = await prisma.term.create({
    data: {
      programId: programUnlimited.id,
      name: 'Fall 2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-11-30'),
      isCurrent: false,
      isActive: true,
    },
  });

  console.log('✅ Created 2 terms');

  // ========================================
  // 8. CREATE LEVELS
  // ========================================
  console.log('\n📊 Creating levels...');

  const levelA1 = await prisma.level.create({
    data: {
      name: 'A1',
      displayName: 'Beginner',
      orderNumber: 1,
      description: 'Basic user - Beginner level',
      isMixed: false,
    },
  });

  const levelA2 = await prisma.level.create({
    data: {
      name: 'A2',
      displayName: 'Elementary',
      orderNumber: 2,
      description: 'Basic user - Elementary level',
      isMixed: false,
    },
  });

  const levelB1 = await prisma.level.create({
    data: {
      name: 'B1',
      displayName: 'Intermediate',
      orderNumber: 3,
      description: 'Independent user - Intermediate level',
      isMixed: false,
    },
  });

  const levelB2 = await prisma.level.create({
    data: {
      name: 'B2',
      displayName: 'Upper Intermediate',
      orderNumber: 4,
      description: 'Independent user - Upper Intermediate level',
      isMixed: false,
    },
  });

  console.log('✅ Created 4 levels');

  // ========================================
  // 9. CREATE VENUES
  // ========================================
  console.log('\n🏢 Creating venues...');

  const venueCountry = await prisma.venue.create({
    data: {
      name: 'Country Mall',
      code: 'CM',
      address: 'Country Mall, Manama, Bahrain',
      isActive: true,
    },
  });

  const venueRiyadat = await prisma.venue.create({
    data: {
      name: 'Riyadat Mall',
      code: 'RM',
      address: 'Riyadat Mall, Muharraq, Bahrain',
      isActive: true,
    },
  });

  console.log('✅ Created 2 venues');

  // ========================================
  // 10. CREATE HALLS
  // ========================================
  console.log('\n🚪 Creating halls...');

  const hall1 = await prisma.hall.create({
    data: {
      venueId: venueCountry.id,
      name: 'Room A',
      code: 'A',
      capacity: 15,
      floor: 'Ground Floor',
      isActive: true,
    },
  });

  const hall2 = await prisma.hall.create({
    data: {
      venueId: venueCountry.id,
      name: 'Room B',
      code: 'B',
      capacity: 20,
      floor: 'First Floor',
      isActive: true,
    },
  });

  const hall3 = await prisma.hall.create({
    data: {
      venueId: venueRiyadat.id,
      name: 'Room 1',
      code: '1',
      capacity: 18,
      floor: 'Second Floor',
      isActive: true,
    },
  });

  console.log('✅ Created 3 halls');

  // ========================================
  // 11. CREATE GROUPS
  // ========================================
  console.log('\n👥 Creating groups...');

  const group1 = await prisma.group.create({
    data: {
      termId: term1.id,
      levelId: levelB1.id,
      teacherId: teacher1.id,
      venueId: venueCountry.id,
      groupCode: '22-23/S1/B1/01',
      name: 'B1 Intermediate - Group 1',
      schedule: {
        days: ['Sunday', 'Tuesday'],
        startTime: '16:00',
        endTime: '18:00',
      },
      capacity: 15,
      isActive: true,
    },
  });

  const group2 = await prisma.group.create({
    data: {
      termId: term1.id,
      levelId: levelA2.id,
      teacherId: teacher2.id,
      venueId: venueRiyadat.id,
      groupCode: '22-23/S1/A2/01',
      name: 'A2 Elementary - Group 1',
      schedule: {
        days: ['Monday', 'Wednesday'],
        startTime: '10:00',
        endTime: '12:00',
      },
      capacity: 15,
      isActive: true,
    },
  });

  console.log('✅ Created 2 groups');

  // ========================================
  // 12. CREATE ENROLLMENTS
  // ========================================
  console.log('\n📝 Creating enrollments...');

  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      groupId: group1.id,
      enrollmentDate: new Date('2025-06-01'),
      status: 'ACTIVE',
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      groupId: group2.id,
      enrollmentDate: new Date('2025-06-01'),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created 2 enrollments');

  // ========================================
  // 13. CREATE PAYMENT PLANS
  // ========================================
  console.log('\n💰 Creating payment plans...');

  await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment1.id,
      totalAmount: 400,
      discountAmount: 50,
      discountReason: 'Early bird discount',
      finalAmount: 350,
      totalInstallments: 4,
      status: 'ACTIVE',
    },
  });

  await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment2.id,
      totalAmount: 400,
      discountAmount: 0,
      finalAmount: 400,
      totalInstallments: 2,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created 2 payment plans');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Database seeding completed successfully!\n');
  console.log('Summary:');
  console.log('  👥 Users: 6 (1 admin, 2 teachers, 2 students, 1 parent)');
  console.log('  👩‍🏫 Teachers: 2');
  console.log('  👨‍🎓 Students: 2');
  console.log('  👨‍👩‍👧 Parents: 1');
  console.log('  📱 Phones: 2');
  console.log('  📚 Programs: 2');
  console.log('  📅 Terms: 2');
  console.log('  📊 Levels: 4 (A1, A2, B1, B2)');
  console.log('  🏢 Venues: 2');
  console.log('  🚪 Halls: 3');
  console.log('  👥 Groups: 2');
  console.log('  📝 Enrollments: 2');
  console.log('  💰 Payment Plans: 2');
  console.log('='.repeat(50) + '\n');

  console.log('📧 Test Login Credentials:');
  console.log('  Admin:   admin@institute.com');
  console.log('  Teacher: sarah.teacher@institute.com');
  console.log('  Student: ahmed.student@example.com');
  console.log('\n✨ Use these emails to request OTP codes!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
