// backend/prisma/seed.ts
// Clean test data for Function Institute

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in correct order (respecting foreign keys)
  await prisma.attendance.deleteMany();
  await prisma.studentCriteriaCompletion.deleteMany();
  await prisma.speakingSlot.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.testQuestion.deleteMany();
  await prisma.test.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.studentPaymentPlan.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.material.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.progressCriteria.deleteMany();
  await prisma.group.deleteMany();
  await prisma.teacherScheduleOverride.deleteMany();
  await prisma.teacherScheduleTemplate.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.term.deleteMany();
  await prisma.program.deleteMany();
  await prisma.level.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.session.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared!\n');

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log('👥 Creating users...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@function.bh',
      phone: '33445566',
      role: 'ADMIN',
      isActive: true
    }
  });

  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'ahmed.teacher@function.bh',
      phone: '39001122',
      role: 'TEACHER',
      isActive: true
    }
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'fatima.teacher@function.bh',
      phone: '39003344',
      role: 'TEACHER',
      isActive: true
    }
  });

  const studentUser1 = await prisma.user.create({
    data: {
      email: 'ali.student@test.bh',
      phone: '36001111',
      role: 'STUDENT',
      isActive: true
    }
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'sara.student@test.bh',
      phone: '36002222',
      role: 'STUDENT',
      isActive: true
    }
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'mohammed.student@test.bh',
      phone: '36003333',
      role: 'STUDENT',
      isActive: true
    }
  });

  const studentUser4 = await prisma.user.create({
    data: {
      email: 'layla.student@test.bh',
      phone: '36004444',
      role: 'STUDENT',
      isActive: true
    }
  });

  console.log('  ✅ Created 7 users');

  // ============================================
  // 2. CREATE TEACHERS
  // ============================================
  console.log('👨‍🏫 Creating teachers...');

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      specialization: 'English Language Teaching',
      isActive: true
    }
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      firstName: 'Fatima',
      lastName: 'Ali',
      specialization: 'IELTS Preparation',
      isActive: true
    }
  });

  console.log('  ✅ Created 2 teachers');

  // ============================================
  // 3. CREATE STUDENTS
  // ============================================
  console.log('🎓 Creating students...');

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      cpr: '100515123',
      firstName: 'Ali',
      secondName: 'Mohammed',
      dateOfBirth: new Date('2010-05-15'),
      gender: 'MALE',
      isActive: true
    }
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      cpr: '110822456',
      firstName: 'Sara',
      secondName: 'Ahmed',
      dateOfBirth: new Date('2011-08-22'),
      gender: 'FEMALE',
      isActive: true
    }
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      cpr: '090310789',
      firstName: 'Mohammed',
      secondName: 'Khalid',
      dateOfBirth: new Date('2009-03-10'),
      gender: 'MALE',
      isActive: true
    }
  });

  const student4 = await prisma.student.create({
    data: {
      userId: studentUser4.id,
      cpr: '121105234',
      firstName: 'Layla',
      secondName: 'Ibrahim',
      dateOfBirth: new Date('2012-11-05'),
      gender: 'FEMALE',
      isActive: true
    }
  });

  console.log('  ✅ Created 4 students');

  // ============================================
  // 4. CREATE VENUES & HALLS
  // ============================================
  console.log('🏢 Creating venues and halls...');

  const venue1 = await prisma.venue.create({
    data: {
      name: 'Country Mall',
      code: 'CM',
      address: 'Country Mall, Manama',
      isActive: true
    }
  });

  const hall1 = await prisma.hall.create({
    data: {
      venueId: venue1.id,
      name: 'Room A',
      code: 'CM-A',
      capacity: 20,
      floor: 'Ground Floor',
      isActive: true
    }
  });

  const hall2 = await prisma.hall.create({
    data: {
      venueId: venue1.id,
      name: 'Room B',
      code: 'CM-B',
      capacity: 15,
      floor: 'Ground Floor',
      isActive: true
    }
  });

  console.log('  ✅ Created 1 venue with 2 halls');

  // ============================================
  // 5. CREATE PROGRAM, TERMS, LEVELS
  // ============================================
  console.log('📚 Creating academic structure...');

  const program = await prisma.program.create({
    data: {
      name: 'English Multiverse',
      code: 'EMV',
      description: 'Comprehensive English language program',
      minAge: 6,
      maxAge: 18,
      isActive: true
    }
  });

  const term = await prisma.term.create({
    data: {
      programId: program.id,
      name: 'Winter 2024',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-02-28'),
      isCurrent: true,
      isActive: true
    }
  });

  const levelA1 = await prisma.level.create({
    data: {
      name: 'A1',
      displayName: 'Beginner A1',
      orderNumber: 1,
      description: 'Elementary level',
      isMixed: false
    }
  });

  const levelA2 = await prisma.level.create({
    data: {
      name: 'A2',
      displayName: 'Elementary A2',
      orderNumber: 2,
      description: 'Pre-intermediate level',
      isMixed: false
    }
  });

  console.log('  ✅ Created program, term, and 2 levels');

  // ============================================
  // 6. CREATE GROUPS
  // ============================================
  console.log('👥 Creating groups...');

  const groupA1 = await prisma.group.create({
    data: {
      termId: term.id,
      levelId: levelA1.id,
      teacherId: teacher1.id,
      venueId: venue1.id,
      groupCode: 'EMV-A1-G1',
      name: 'English Multiverse A1 - Group 1',
      capacity: 15,
      isActive: true
    }
  });

  const groupA2 = await prisma.group.create({
    data: {
      termId: term.id,
      levelId: levelA2.id,
      teacherId: teacher2.id,
      venueId: venue1.id,
      groupCode: 'EMV-A2-G1',
      name: 'English Multiverse A2 - Group 1',
      capacity: 15,
      isActive: true
    }
  });

  console.log('  ✅ Created 2 groups');

  // ============================================
  // 7. CREATE ENROLLMENTS
  // ============================================
  console.log('📝 Creating enrollments...');

  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      groupId: groupA1.id,
      enrollmentDate: new Date('2024-12-01'),
      status: 'ACTIVE'
    }
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      groupId: groupA1.id,
      enrollmentDate: new Date('2024-12-01'),
      status: 'ACTIVE'
    }
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      studentId: student3.id,
      groupId: groupA1.id,
      enrollmentDate: new Date('2024-12-01'),
      status: 'ACTIVE'
    }
  });

  const enrollment4 = await prisma.enrollment.create({
    data: {
      studentId: student4.id,
      groupId: groupA2.id,
      enrollmentDate: new Date('2024-12-01'),
      status: 'ACTIVE'
    }
  });

  console.log('  ✅ Created 4 enrollments (3 in A1, 1 in A2)');

  // ============================================
  // 8. CREATE CLASS SESSIONS
  // ============================================
  console.log('📅 Creating class sessions...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create 2 sessions for Group A1 (today and tomorrow)
  const session1 = await prisma.classSession.create({
    data: {
      groupId: groupA1.id,
      hallId: hall1.id,
      sessionDate: new Date(today),
      sessionNumber: 1,
      startTime: new Date('1970-01-01T14:00:00.000Z'),
      endTime: new Date('1970-01-01T15:30:00.000Z'),
      topic: 'Introduction & Greetings',
      status: 'SCHEDULED'
    }
  });

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const session2 = await prisma.classSession.create({
    data: {
      groupId: groupA1.id,
      hallId: hall1.id,
      sessionDate: tomorrow,
      sessionNumber: 2,
      startTime: new Date('1970-01-01T16:00:00.000Z'),
      endTime: new Date('1970-01-01T17:30:00.000Z'),
      topic: 'Family & Friends',
      status: 'SCHEDULED'
    }
  });

  // Create 1 session for Group A2 (today)
  const session3 = await prisma.classSession.create({
    data: {
      groupId: groupA2.id,
      hallId: hall2.id,
      sessionDate: new Date(today),
      sessionNumber: 1,
      startTime: new Date('1970-01-01T10:00:00.000Z'),
      endTime: new Date('1970-01-01T11:30:00.000Z'),
      topic: 'Past Tense Review',
      status: 'SCHEDULED'
    }
  });

  console.log('  ✅ Created 3 class sessions (2 for A1, 1 for A2)');

  // ============================================
  // 9. CREATE PAYMENT PLANS & INSTALLMENTS
  // ============================================
  console.log('💰 Creating payment plans and installments...');

  // Payment plan for student 1 (Ali) - 3 installments, first paid
  const paymentPlan1 = await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment1.id,
      totalAmount: 500.00,
      discountAmount: 0,
      finalAmount: 500.00,
      totalInstallments: 3,
      status: 'ACTIVE'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan1.id,
      installmentNumber: 1,
      amount: 166.67,
      dueDate: new Date('2025-01-15'),
      paymentDate: new Date('2025-01-10'),
      paymentMethod: 'BENEFIT_PAY',
      benefitReferenceNumber: 'BEN-2025-001',
      receiptNumber: 'REC-2025-001'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan1.id,
      installmentNumber: 2,
      amount: 166.67,
      dueDate: new Date('2025-02-15'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan1.id,
      installmentNumber: 3,
      amount: 166.66,
      dueDate: new Date('2025-03-15'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  // Payment plan for student 2 (Sara) - 2 installments, none paid
  const paymentPlan2 = await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment2.id,
      totalAmount: 450.00,
      discountAmount: 50.00,
      discountReason: '10% early bird discount',
      finalAmount: 400.00,
      totalInstallments: 2,
      status: 'ACTIVE'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan2.id,
      installmentNumber: 1,
      amount: 200.00,
      dueDate: new Date('2025-01-20'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan2.id,
      installmentNumber: 2,
      amount: 200.00,
      dueDate: new Date('2025-02-20'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  // Payment plan for student 3 (Mohammed) - 4 installments, 2 paid
  const paymentPlan3 = await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment3.id,
      totalAmount: 600.00,
      discountAmount: 0,
      finalAmount: 600.00,
      totalInstallments: 4,
      status: 'ACTIVE'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan3.id,
      installmentNumber: 1,
      amount: 150.00,
      dueDate: new Date('2025-01-05'),
      paymentDate: new Date('2025-01-03'),
      paymentMethod: 'CASH',
      receiptNumber: 'REC-2025-002'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan3.id,
      installmentNumber: 2,
      amount: 150.00,
      dueDate: new Date('2025-01-25'),
      paymentDate: new Date('2025-01-25'),
      paymentMethod: 'BANK_TRANSFER',
      receiptNumber: 'REC-2025-003'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan3.id,
      installmentNumber: 3,
      amount: 150.00,
      dueDate: new Date('2025-02-25'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan3.id,
      installmentNumber: 4,
      amount: 150.00,
      dueDate: new Date('2025-03-25'),
      paymentMethod: 'BENEFIT_PAY'
    }
  });

  // Payment plan for student 4 (Layla) - 1 installment (full payment), paid
  const paymentPlan4 = await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment4.id,
      totalAmount: 550.00,
      discountAmount: 100.00,
      discountReason: 'Full payment discount',
      finalAmount: 450.00,
      totalInstallments: 1,
      status: 'COMPLETED'
    }
  });

  await prisma.installment.create({
    data: {
      paymentPlanId: paymentPlan4.id,
      installmentNumber: 1,
      amount: 450.00,
      dueDate: new Date('2024-12-01'),
      paymentDate: new Date('2024-12-01'),
      paymentMethod: 'CARD_MACHINE',
      receiptNumber: 'REC-2024-099'
    }
  });

  console.log('  ✅ Created 4 payment plans with 10 installments total');

  // ============================================
  // 10. SUMMARY
  // ============================================
  console.log('\n✨ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('  - Users: 7 (1 admin, 2 teachers, 4 students)');
  console.log('  - Teachers: 2 (Ahmed Hassan, Fatima Ali)');
  console.log('  - Students: 4 (Ali, Sara, Mohammed, Layla)');
  console.log('  - Venues: 1 (Country Mall with 2 halls)');
  console.log('  - Program: 1 (English Multiverse)');
  console.log('  - Term: 1 (Winter 2024)');
  console.log('  - Levels: 2 (A1, A2)');
  console.log('  - Groups: 2 (A1-Group1: 3 students, A2-Group1: 1 student)');
  console.log('  - Sessions: 3 (2 today for A1, 1 today for A2)');
  console.log('  - Payment Plans: 4 (varying installment schedules)');
  console.log('  - Installments: 10 (mix of paid/pending/overdue)');
  console.log('\n🔐 Login Credentials:');
  console.log('  Teacher 1 (Ahmed): phone: 39001122');
  console.log('  Teacher 2 (Fatima): phone: 39003344');
  console.log('  Student 1 (Ali): phone: 36001111');
  console.log('  Admin: phone: 33445566');
  console.log('\n💡 Use OTP code: 123456 (for development)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });