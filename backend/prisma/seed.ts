
// backend/prisma/seed.ts
// COMPREHENSIVE & REALISTIC Test Data for Function Institute

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// DATA POOLS (NO ROYAL NAMES)
// ============================================
const FIRST_NAMES_MALE = ['Mohammed', 'Ali', 'Ahmed', 'Yusuf', 'Omar', 'Abdullah', 'Khalid', 'Hassan', 'Hussain', 'Salman', 'Hamad', 'Ebrahim', 'Jassim', 'Mahmood', 'Zaid', 'Isa', 'Musa', 'Bilal'];
const FIRST_NAMES_FEMALE = ['Fatima', 'Zainab', 'Mariam', 'Noor', 'Dana', 'Layla', 'Sara', 'Aysha', 'Khawla', 'Reem', 'Huda', 'Amal', 'Mona', 'Lulwa', 'Latifa', 'Zahra', 'Yasmin'];
// Removed Al-Khalifa, Al-Sabah etc.
const LAST_NAMES = ['Al-Alawi', 'Husain', 'Ali', 'Mohammed', 'Al-Zayani', 'Fakhro', 'Kanoo', 'Al-Musawi', 'Radhi', 'Al-Jalahma', 'Nasser', 'Kamal', 'Sharif', 'Abdulla', 'Showaiter', 'Al-Haddad', 'Al-Najjar', 'Haji'];

const CITIES = ['Manama', 'Riffa', 'Muharraq', 'Aali', 'Isa Town', 'Hamad Town', 'Budaiya', 'Hidd', 'Saar', 'Juffair'];
const ROADS = ['Road 1234', 'Ave 22', 'Block 338', 'Highway 55', 'Road 4512', 'Ave 11'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generateCPR(yearOfBirth: number) {
  const y = yearOfBirth.toString().slice(-2);
  const m = getRandomNumber(1, 12).toString().padStart(2, '0');
  const rest = getRandomNumber(10000, 99999);
  return `${y}${m}${rest}`;
}

async function main() {
  console.log('🗑️  Clearing existing data...');

  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }
  console.log('✅ Database cleared!\n');

  // ============================================
  // 1. HELPERS
  // ============================================
  console.log('🛠️  Initializing Helpers...');
  const hashedPassword = await hash('password123', 10);

  // ============================================
  // 2. CREATE LOOKUPS
  // ============================================
  console.log('🏢 Creating Lookups & FAQs...');

  // VENUES
  const riyadat = await prisma.venue.create({ data: { name: 'Riyadat Mall', code: 'RM', address: 'Aali, Bahrain', isActive: true } });
  const countryMall = await prisma.venue.create({ data: { name: 'Country Mall', code: 'CM', address: 'Budaiya, Bahrain', isActive: true } });
  const oldBranch = await prisma.venue.create({ data: { name: 'Manama Branch (Old)', code: 'MN-OLD', address: 'Manama', isActive: false } });

  // HALLS (Same as before)
  await prisma.hall.createMany({
    data: [
      { venueId: riyadat.id, name: 'Training Room 1', code: 'RM-TR1', capacity: 20, isActive: true },
      { venueId: riyadat.id, name: 'Computer Lab', code: 'RM-LAB', capacity: 15, isActive: true },
      { venueId: countryMall.id, name: 'Classroom A', code: 'CM-A', capacity: 25, isActive: true },
      { venueId: countryMall.id, name: 'Classroom B', code: 'CM-B', capacity: 25, isActive: true },
    ]
  });

  // PROGRAMS (With Inactive Prefix)
  const progGE = await prisma.program.create({ data: { name: 'General English', code: 'GE', description: 'Standard English Program', isActive: true } });
  const progIELTS = await prisma.program.create({ data: { name: 'IELTS Preparation', code: 'IELTS', description: 'Intensive exam preparation', isActive: true } });
  const progBiz = await prisma.program.create({ data: { name: 'Business English', code: 'BE', description: 'Professional corporate communication', isActive: true } });
  // Inactive Rename
  await prisma.program.create({ data: { name: 'Inactive - French 2020', code: 'FR-OLD', description: 'Discontinued Program', isActive: false } });

  // TERMS
  const termWinter25 = await prisma.term.create({ data: { programId: progGE.id, name: 'Winter 2025', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31'), isCurrent: true, isActive: true } });
  const termSpring25 = await prisma.term.create({ data: { programId: progGE.id, name: 'Spring 2025', startDate: new Date('2025-04-01'), endDate: new Date('2025-06-30'), isCurrent: false, isActive: true } });
  const termFall24 = await prisma.term.create({ data: { programId: progGE.id, name: 'Fall 2024', startDate: new Date('2024-09-01'), endDate: new Date('2024-12-31'), isCurrent: false, isActive: false } });

  // LEVELS
  const levels = [];
  const levelNames = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (let i = 0; i < levelNames.length; i++) {
    levels.push(await prisma.level.create({ data: { name: levelNames[i], displayName: `CEFR ${levelNames[i]}`, orderNumber: i + 1 } }));
  }

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      { question: 'Is parking available at Riyadat?', answer: 'Yes, free parking is available in the basement.', category: 'Logistics', roles: ['ALL'] },
    ]
  });

  // ============================================
  // 2.1 PLACEMENT TEST (5 Questions)
  // ============================================
  console.log('📝 Creating Placement Test (5 Questions)...');
  const placementTest = await prisma.test.create({
    data: {
      name: 'English Placement Test (Short Version)',
      testType: 'PLACEMENT',
      totalQuestions: 5,
      durationMinutes: 45,
      isActive: true,
    },
  });

  const placementQuestions = [
    { text: 'What _____ your name?', options: ['is', 'are', 'am', 'be'], answer: 'is' },
    { text: 'She _____ to the store yesterday.', options: ['went', 'go', 'goes', 'going'], answer: 'went' },
    { text: 'If I _____ you, I would study harder.', options: ['were', 'am', 'was', 'be'], answer: 'were' },
    { text: 'The book _____ by millions of people.', options: ['has been read', 'read', 'is reading', 'reads'], answer: 'has been read' },
    { text: 'Despite _____ tired, she continued working.', options: ['being', 'to be', 'is', 'was'], answer: 'being' },
  ];

  for (let i = 0; i < placementQuestions.length; i++) {
    const q = placementQuestions[i];
    await prisma.testQuestion.create({
      data: {
        testId: placementTest.id,
        questionText: q.text,
        questionType: 'MULTIPLE_CHOICE',
        options: q.options,
        correctAnswer: q.answer,
        points: 1,
        orderNumber: i + 1,
      },
    });
  }
  console.log(`   ✅ Created Placement Test with 5 questions`);


  // ============================================
  // 3. CREATE USERS
  // ============================================
  console.log('👥 Creating Users...');

  // Admin
  const admin = await prisma.user.create({ data: { email: 'admin@institute.com', phone: '33445566', role: 'ADMIN', isActive: true } });

  // Teachers
  const teacherProfiles = [
    { first: 'Fatima', last: 'Al-Sayed', email: 'fatima.alsayed@institute.com', phone: '39001234', spec: 'General English' },
    { first: 'John', last: 'Thompson', email: 'john.thompson@institute.com', phone: '39005678', spec: 'IELTS' },
    { first: 'Sarah', last: 'Miller', email: 'sarah.miller@institute.com', phone: '39009012', spec: 'Business English' },
    { first: 'Yusuf', last: 'Kamal', email: 'yusuf.kamal@institute.com', phone: '39003456', spec: 'General English' },
    { first: 'Emma', last: 'Wilson', email: 'emma.wilson@institute.com', phone: '39007890', spec: 'Kids' },
    { first: 'Robert', last: 'Oldman', email: 'robert.oldman@institute.com', phone: '39990000', spec: 'Retired', active: false },
  ];

  const teachers = [];
  for (const t of teacherProfiles) {
    const u = await prisma.user.create({
      data: { email: t.email, phone: t.phone, role: 'TEACHER', isActive: t.active ?? true }
    });
    teachers.push(await prisma.teacher.create({
      data: { userId: u.id, firstName: t.first, lastName: t.last, specialization: t.spec, isActive: t.active ?? true }
    }));
  }

  // STUDENTS (50 Total to allow for withdrawn/inactive mix)
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = getRandomItem(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = getRandomItem(LAST_NAMES);
    // Status Logic: 35 Active, 10 Withdrawn (Inactive), 5 Active but with "IN_PROGRESS" enrollment implications
    const isActive = i <= 40;

    const birthYear = getRandomNumber(2005, 2015);
    const cpr = generateCPR(birthYear);

    const emailDomain = getRandomItem(['gmail.com', 'outlook.com', 'icloud.com']);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${getRandomNumber(10, 99)}@${emailDomain}`;
    const phone = `3${getRandomNumber(3, 9)}${getRandomNumber(100000, 999999)}`;

    const u = await prisma.user.create({
      data: { email, phone, role: 'STUDENT', isActive }
    });

    students.push(await prisma.student.create({
      data: {
        userId: u.id,
        cpr: cpr,
        firstName: firstName,
        secondName: lastName,
        thirdName: getRandomItem(FIRST_NAMES_MALE),
        dateOfBirth: new Date(`${birthYear}-${getRandomNumber(1, 12)}-${getRandomNumber(1, 28)}`),
        gender: isMale ? 'MALE' : 'FEMALE',
        isActive,
        currentLevel: isActive ? getRandomItem(levels).name : null,
        area: getRandomItem(CITIES),
        road: getRandomItem(ROADS),
        houseNo: getRandomNumber(1, 9999).toString()
      }
    }));
  }

  // DEMO PARENT
  const demoParentUser = await prisma.user.create({ data: { email: 'parent.ahmed@test.com', phone: '33333333', role: 'PARENT', isActive: true } });
  const demoParent = await prisma.parent.create({
    data: { userId: demoParentUser.id, firstName: 'Ahmed', lastName: 'Mohammed' }
  });

  // Link & Rename
  await prisma.student.update({ where: { id: students[0].id }, data: { firstName: 'Ali', gender: 'MALE', isActive: true } });
  await prisma.student.update({ where: { id: students[1].id }, data: { firstName: 'Sara', gender: 'FEMALE', isActive: true } });

  await prisma.parentStudentLink.create({ data: { parentId: demoParent.id, studentId: students[0].id, relationship: 'Father' } });
  await prisma.parentStudentLink.create({ data: { parentId: demoParent.id, studentId: students[1].id, relationship: 'Father' } });

  // Additional Parents
  let currentStudentIndex = 2; // Start after Ali & Sara
  for (let i = 1; i <= 15; i++) {
    const isMale = Math.random() > 0.3;
    const firstName = getRandomItem(FIRST_NAMES_MALE);
    const lastName = getRandomItem(LAST_NAMES);

    const pUser = await prisma.user.create({
      data: {
        email: `parent.${i}.${lastName.toLowerCase()}@test.com`,
        phone: `33${getRandomNumber(100000, 999999)}`,
        role: 'PARENT',
        isActive: true
      }
    });

    const parent = await prisma.parent.create({
      data: {
        userId: pUser.id,
        firstName: isMale ? firstName : getRandomItem(FIRST_NAMES_FEMALE),
        lastName: lastName
      }
    });

    const numKids = getRandomNumber(1, 4);
    for (let k = 0; k < numKids; k++) {
      if (currentStudentIndex < students.length) {
        const student = students[currentStudentIndex];
        await prisma.parentStudentLink.create({
          data: { parentId: parent.id, studentId: student.id, relationship: isMale ? 'Father' : 'Mother' }
        });
        // Rename kid's last name to match
        await prisma.student.update({
          where: { id: student.id },
          data: { secondName: lastName }
        });
        currentStudentIndex++;
      }
    }
  }

  // ============================================
  // 4. GROUPS & ENROLLMENTS & MATERIALS
  // ============================================
  console.log('📚 Creating Groups, Enrollments, Materials...');

  const groups = [];
  const groupConfigs = [
    { code: 'GE-A1-SUN', level: levels[0], teacher: teachers[0], term: termWinter25, days: ['Sun', 'Tue'], time: '16:00' },
    { code: 'GE-A2-MON', level: levels[1], teacher: teachers[3], term: termWinter25, days: ['Mon', 'Wed'], time: '17:30' },
    { code: 'GE-B1-SUN', level: levels[2], teacher: teachers[0], term: termWinter25, days: ['Sun', 'Tue'], time: '18:00' },
    { code: 'GE-B2-WEEK', level: levels[3], teacher: teachers[2], term: termWinter25, days: ['Fri', 'Sat'], time: '10:00' },
    { code: 'IELTS-INT', level: levels[4], teacher: teachers[1], term: termWinter25, days: ['Sun', 'Tue', 'Thu'], time: '19:00' },
    { code: 'KIDS-A1', level: levels[0], teacher: teachers[4], term: termWinter25, days: ['Mon', 'Wed'], time: '15:00' },
    { code: 'OFFICE-BE', level: levels[1], teacher: teachers[2], term: termWinter25, days: ['Sun', 'Tue'], time: '19:30' },
    { code: 'ADV-C1', level: levels[4], teacher: teachers[1], term: termWinter25, days: ['Sat'], time: '09:00' },
  ];

  for (const cfg of groupConfigs) {
    const g = await prisma.group.create({
      data: {
        termId: cfg.term.id,
        levelId: cfg.level.id,
        teacherId: cfg.teacher.id,
        venueId: riyadat.id,
        groupCode: cfg.code,
        name: `${cfg.term.programId === progGE.id ? 'General English' : 'Specialized'} - ${cfg.level.name} (${cfg.days[0]})`,
        isActive: true,
        schedule: { days: cfg.days, time: cfg.time }
      }
    });
    groups.push(g);

    // ADD MATERIALS (2 per group)
    await prisma.material.create({
      data: {
        groupId: g.id,
        title: 'Course Syllabus',
        description: 'Detailed plan for the semester',
        materialType: 'PDF',
        fileUrl: 'https://example.com/syllabus.pdf',
        fileSizeKb: 500,
        uploadedBy: cfg.teacher.id,
        isPublished: true
      }
    });
    await prisma.material.create({
      data: {
        groupId: g.id,
        title: 'Week 1 - Introduction Slides',
        materialType: 'PDF',
        fileUrl: 'https://example.com/w1_intro.pdf',
        fileSizeKb: 1200,
        uploadedBy: cfg.teacher.id,
        isPublished: true
      }
    });

    // ADD ANNOUNCEMENTS (1 active, 1 draft)
    await prisma.announcement.create({
      data: {
        groupId: g.id,
        title: 'Welcome to Class!',
        content: 'Welcome everyone to the new term. Please bring your books.',
        targetAudience: 'STUDENTS',
        publishedBy: admin.id,
        isPublished: true,
        publishedAt: new Date()
      }
    });

    // ADD PROGRESS CRITERIA (3 per group)
    await prisma.progressCriteria.create({ data: { groupId: g.id, name: 'Can introduce themselves', orderNumber: 1 } });
    await prisma.progressCriteria.create({ data: { groupId: g.id, name: 'Can write a short paragraph', orderNumber: 2 } });
    await prisma.progressCriteria.create({ data: { groupId: g.id, name: 'Understands basic tenses', orderNumber: 3 } });
  }

  // ENROLLMENTS & STATUSES
  let studentIdx = 0;
  for (const group of groups) {
    const numStudents = getRandomNumber(4, 9);
    for (let k = 0; k < numStudents; k++) {
      if (studentIdx < students.length) {
        const s = students[studentIdx];
        let status = 'ACTIVE';
        // Logic: Last 10 students are withdrawn or completed
        if (studentIdx >= 40) {
          status = Math.random() > 0.5 ? 'WITHDRAWN' : 'COMPLETED';
        }

        const enroll = await prisma.enrollment.create({
          data: {
            studentId: s.id,
            groupId: group.id,
            enrollmentDate: new Date('2025-01-02'),
            status: status
          }
        });

        // Financials associated with enrollment (only if not withdrawn early, but let's add for all to show history)
        const totalAmount = 150.00;
        const plan = await prisma.studentPaymentPlan.create({
          data: {
            enrollmentId: enroll.id,
            totalAmount: totalAmount,
            finalAmount: totalAmount,
            totalInstallments: 3,
            status: status === 'ACTIVE' ? 'ACTIVE' : 'COMPLETED'
          }
        });

        // Installment 1
        await prisma.installment.create({
          data: {
            paymentPlanId: plan.id,
            installmentNumber: 1,
            amount: 50.00,
            dueDate: new Date('2025-01-05'),
            paymentDate: status === 'WITHDRAWN' ? null : new Date('2025-01-05'), // Paid if not withdrawn
            paymentMethod: status === 'WITHDRAWN' ? null : 'BENEFIT_PAY',
            receiptNumber: status === 'WITHDRAWN' ? null : `REC-${plan.id.substring(0, 4)}`
          }
        });

        studentIdx++;
      }
    }
  }

  // ============================================
  // 5. CLASS SESSIONS (Recurring)
  // ============================================
  console.log('📅 Creating Recurring Sessions...');

  // Create last 4 weeks of sessions for Group 1 (Ali's group)
  // Assumes Sun/Tue schedule
  const g1 = groups[0];
  const dates = [
    new Date('2025-01-05T16:00:00Z'),
    new Date('2025-01-07T16:00:00Z'),
    new Date('2025-01-12T16:00:00Z'),
    new Date('2025-01-14T16:00:00Z'),
  ];

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const sess = await prisma.classSession.create({
      data: {
        groupId: g1.id,
        sessionDate: d,
        sessionNumber: i + 1,
        startTime: d,
        endTime: new Date(d.getTime() + 90 * 60000), // +90 mins
        topic: `Lesson ${i + 1}`,
        status: 'COMPLETED'
      }
    });

    // Mark random attendance for enrolled students
    const enrollments = await prisma.enrollment.findMany({ where: { groupId: g1.id, status: 'ACTIVE' } });
    for (const enr of enrollments) {
      const attStatus = Math.random() > 0.1 ? 'PRESENT' : 'ABSENT'; // 90% attendance
      await prisma.attendance.create({
        data: {
          classSessionId: sess.id,
          studentId: enr.studentId,
          enrollmentId: enr.id,
          status: attStatus,
          markedAt: new Date(d.getTime() + 3600000),
          markedBy: teachers[0].id
        }
      });
    }
  }


  console.log('\n✨ Database seeded successfully with FULL REFINEMENTS!');
  console.log(`  - Students: 50 (Active, Withdrawn, Completed)`);
  console.log(`  - Names: Localized Bahraini/International (No Royalty)`);
  console.log(`  - Programs: added 'Inactive - French 2020'`);
  console.log(`  - Content: Materials, Announcements, FAQs added`);
  console.log(`  - Sessions: Recurring sessions created with attendance`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });