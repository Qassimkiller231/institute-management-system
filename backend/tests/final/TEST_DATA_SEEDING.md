# 🌱 TEST DATA SEEDING GUIDE

**Populate your database with realistic test data**

## Quick Start

```bash
# Backend directory
cd backend

# Run seed script
npm run seed

# Or manually via Prisma
npx prisma db seed
```

---

## 📦 Create Seed Script

**File:** `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      phone: '+97311111111',
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log('✅ Admin user created');

  // 2. Create Teacher Users
  const teacher1User = await prisma.user.create({
    data: {
      email: 'teacher1@test.com',
      phone: '+97322222222',
      role: 'TEACHER',
      isActive: true
    }
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'teacher2@test.com',
      phone: '+97322222223',
      role: 'TEACHER',
      isActive: true
    }
  });

  // 3. Create Teacher Profiles
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      specialization: 'English Language',
      availableForSpeakingTests: true
    }
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      firstName: 'Sarah',
      lastName: 'Mohammed',
      specialization: 'English Literature',
      availableForSpeakingTests: true
    }
  });
  console.log('✅ Teachers created');

  // 4. Create Programs
  const programEM = await prisma.program.create({
    data: {
      name: 'English Multiverse',
      code: 'EM-2025',
      description: 'English for ages 11-17',
      minAge: 11,
      maxAge: 17,
      isActive: true
    }
  });

  const programEU = await prisma.program.create({
    data: {
      name: 'English Unlimited',
      code: 'EU-2025',
      description: 'English for ages 18+',
      minAge: 18,
      maxAge: null,
      isActive: true
    }
  });
  console.log('✅ Programs created');

  // 5. Create Term
  const term = await prisma.term.create({
    data: {
      programId: programEM.id,
      name: 'Fall 2025',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-31'),
      isCurrent: true,
      isActive: true
    }
  });
  console.log('✅ Term created');

  // 6. Create Levels
  const levelA1 = await prisma.level.create({
    data: {
      name: 'A1',
      displayName: 'Beginner A1',
      orderNumber: 1,
      description: 'Basic English - beginner level'
    }
  });

  const levelA2 = await prisma.level.create({
    data: {
      name: 'A2',
      displayName: 'Elementary A2',
      orderNumber: 2,
      description: 'Elementary English'
    }
  });

  const levelB1 = await prisma.level.create({
    data: {
      name: 'B1',
      displayName: 'Intermediate B1',
      orderNumber: 3,
      description: 'Intermediate English'
    }
  });

  const levelB2 = await prisma.level.create({
    data: {
      name: 'B2',
      displayName: 'Upper Intermediate B2',
      orderNumber: 4,
      description: 'Upper intermediate English'
    }
  });
  console.log('✅ Levels created');

  // 7. Create Venues
  const venueCountry = await prisma.venue.create({
    data: {
      name: 'Country Mall',
      code: 'CM',
      address: 'Country Mall, Saar, Bahrain',
      isActive: true
    }
  });

  const venueRiyadat = await prisma.venue.create({
    data: {
      name: 'Riyadat Mall',
      code: 'RM',
      address: 'Riyadat Mall, Isa Town, Bahrain',
      isActive: true
    }
  });
  console.log('✅ Venues created');

  // 8. Create Halls
  const hallCM1 = await prisma.hall.create({
    data: {
      venueId: venueCountry.id,
      name: 'Hall 1',
      code: 'H1',
      capacity: 20,
      floor: 'Ground Floor',
      isActive: true
    }
  });

  const hallCM2 = await prisma.hall.create({
    data: {
      venueId: venueCountry.id,
      name: 'Hall 2',
      code: 'H2',
      capacity: 15,
      floor: 'Ground Floor',
      isActive: true
    }
  });

  const hallRM1 = await prisma.hall.create({
    data: {
      venueId: venueRiyadat.id,
      name: 'Hall A',
      code: 'HA',
      capacity: 18,
      floor: 'First Floor',
      isActive: true
    }
  });
  console.log('✅ Halls created');

  // 9. Create Groups
  const group1 = await prisma.group.create({
    data: {
      termId: term.id,
      levelId: levelA1.id,
      teacherId: teacher1.id,
      venueId: venueCountry.id,
      groupCode: 'EM-A1-001',
      name: 'English Multiverse A1 - Group 1',
      schedule: {
        days: ['Sunday', 'Tuesday'],
        time: '18:00-20:00'
      },
      capacity: 15,
      isActive: true
    }
  });

  const group2 = await prisma.group.create({
    data: {
      termId: term.id,
      levelId: levelA2.id,
      teacherId: teacher2.id,
      venueId: venueCountry.id,
      groupCode: 'EM-A2-001',
      name: 'English Multiverse A2 - Group 1',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '18:00-20:00'
      },
      capacity: 15,
      isActive: true
    }
  });
  console.log('✅ Groups created');

  // 10. Create Students
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const studentUser = await prisma.user.create({
      data: {
        email: `student${i}@test.com`,
        phone: `+9734444444${i.toString().padStart(2, '0')}`,
        role: 'STUDENT',
        isActive: true
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        cpr: `20100${i.toString().padStart(4, '0')}`,
        firstName: `Student${i}`,
        secondName: 'Ali',
        thirdName: 'Mohammed',
        dateOfBirth: new Date(`2010-0${Math.floor(i / 10) + 1}-${(i % 30) + 1}`),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        schoolType: i % 3 === 0 ? 'Private' : 'Government',
        email: `student${i}@test.com`,
        preferredTiming: i % 2 === 0 ? 'Evening' : 'Morning',
        preferredCenter: i % 2 === 0 ? 'Country Mall' : 'Riyadat Mall',
        area: 'Manama',
        houseNo: `${i * 10}`,
        road: '10',
        block: '301',
        isActive: true
      }
    });

    students.push(student);
  }
  console.log('✅ 20 Students created');

  // 11. Create Enrollments
  for (let i = 0; i < 10; i++) {
    await prisma.enrollment.create({
      data: {
        studentId: students[i].id,
        groupId: group1.id,
        enrollmentDate: new Date('2025-09-01'),
        status: 'ACTIVE'
      }
    });
  }

  for (let i = 10; i < 20; i++) {
    await prisma.enrollment.create({
      data: {
        studentId: students[i].id,
        groupId: group2.id,
        enrollmentDate: new Date('2025-09-01'),
        status: 'ACTIVE'
      }
    });
  }
  console.log('✅ Enrollments created');

  // 12. Create Class Sessions
  const startDate = new Date('2025-09-01');
  for (let i = 1; i <= 25; i++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + (i * 3)); // Every 3 days

    await prisma.classSession.create({
      data: {
        groupId: group1.id,
        hallId: hallCM1.id,
        sessionNumber: i,
        sessionDate: sessionDate,
        startTime: new Date('1970-01-01T18:00:00Z'),
        endTime: new Date('1970-01-01T20:00:00Z'),
        status: i <= 10 ? 'COMPLETED' : 'SCHEDULED'
      }
    });
  }
  console.log('✅ Class sessions created');

  // 13. Create Attendance Records
  const sessions = await prisma.classSession.findMany({
    where: { groupId: group1.id, status: 'COMPLETED' },
    take: 10
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { groupId: group1.id },
    take: 10
  });

  for (const session of sessions) {
    for (const enrollment of enrollments) {
      const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.attendance.create({
        data: {
          classSessionId: session.id,
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          status: randomStatus,
          markedAt: session.sessionDate,
          markedBy: teacher1.id
        }
      });
    }
  }
  console.log('✅ Attendance records created');

  // 14. Create Payment Plans
  for (const enrollment of enrollments) {
    const paymentPlan = await prisma.studentPaymentPlan.create({
      data: {
        enrollmentId: enrollment.id,
        totalInstallments: 4,
        defaultFees: 600.00,
        totalDues: 600.00,
        totalPaid: 0,
        remainingInstallments: 4
      }
    });

    // Create 4 installments
    for (let i = 1; i <= 4; i++) {
      const dueDate = new Date('2025-09-01');
      dueDate.setMonth(dueDate.getMonth() + i);

      await prisma.installment.create({
        data: {
          paymentPlanId: paymentPlan.id,
          installmentNumber: i,
          installmentAmount: 150.00,
          dueDate: dueDate,
          status: i === 1 ? 'PAID' : 'UNPAID',
          paymentMethod: i === 1 ? 'CASH' : null,
          paymentAmount: i === 1 ? 150.00 : null,
          paymentDate: i === 1 ? new Date('2025-09-01') : null,
          receiptNumber: i === 1 ? 'REC-2025-001' : null
        }
      });
    }
  }
  console.log('✅ Payment plans and installments created');

  // 15. Create Materials
  await prisma.material.create({
    data: {
      groupId: group1.id,
      title: 'Unit 1 Grammar Guide',
      description: 'Present Simple tense exercises',
      materialType: 'PDF',
      fileUrl: 'https://example.com/grammar.pdf',
      fileSizeKb: 2048,
      uploadedBy: teacher1.id
    }
  });

  await prisma.material.create({
    data: {
      groupId: group1.id,
      title: 'Pronunciation Video',
      description: 'British vs American English',
      materialType: 'VIDEO',
      fileUrl: 'https://youtube.com/example',
      uploadedBy: teacher1.id
    }
  });
  console.log('✅ Materials created');

  // 16. Create Placement Test
  const placementTest = await prisma.test.create({
    data: {
      testType: 'PLACEMENT',
      title: 'English Multiverse Placement Test',
      description: 'Determine student level (A1-B2)',
      ageMin: 11,
      ageMax: 17,
      durationMinutes: 60,
      passingScore: 60,
      totalPoints: 100,
      isActive: true
    }
  });

  // Create test questions
  for (let i = 1; i <= 20; i++) {
    await prisma.testQuestion.create({
      data: {
        testId: placementTest.id,
        questionText: `Question ${i}: Choose the correct answer`,
        questionType: 'MULTIPLE_CHOICE',
        options: {
          a: 'Option A',
          b: 'Option B',
          c: 'Option C',
          d: 'Option D'
        },
        correctAnswer: 'a',
        points: 5,
        orderNumber: i
      }
    });
  }
  console.log('✅ Placement test created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## ⚙️ Update package.json

Add to `backend/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🎯 What Gets Created

### Users (23 total)
- 1 Admin
- 2 Teachers
- 20 Students

### Academic Structure
- 2 Programs (EM, EU)
- 1 Term (Fall 2025)
- 4 Levels (A1, A2, B1, B2)
- 2 Venues (Country Mall, Riyadat Mall)
- 3 Halls
- 2 Groups (A1, A2)

### Students & Enrollment
- 20 Students
- 20 Enrollments (10 per group)
- Realistic data (names, CPRs, addresses)

### Classes & Attendance
- 25 Class sessions per group
- 100 Attendance records (realistic mix of P/A/L)
- 10 completed sessions

### Payments
- 20 Payment plans (1 per enrollment)
- 80 Installments (4 per plan)
- 20 First installments marked as PAID

### Materials
- 2 Materials (PDF + Video)

### Testing
- 1 Placement test
- 20 Questions

---

## 🔑 Default Credentials

**Admin:**
- Email: admin@test.com
- Phone: +97311111111

**Teachers:**
- teacher1@test.com (+97322222222)
- teacher2@test.com (+97322222223)

**Students:**
- student1@test.com (+97344444441)
- student2@test.com (+97344444442)
- ... up to student20@test.com

**All use OTP for login (no passwords)**

---

## 🚀 Run Seeding

```bash
# Install ts-node if needed
npm install -D ts-node @types/node

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run seed
npm run seed

# Or manually
npx prisma db seed
```

---

## ✅ Verify Seeded Data

```bash
# Connect to database
npx prisma studio

# Or use SQL
psql -d your_database

# Check counts
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM students) as students,
  (SELECT COUNT(*) FROM teachers) as teachers,
  (SELECT COUNT(*) FROM groups) as groups,
  (SELECT COUNT(*) FROM enrollments) as enrollments,
  (SELECT COUNT(*) FROM attendance) as attendance;
```

**Expected counts:**
- users: 23
- students: 20
- teachers: 2
- groups: 2
- enrollments: 20
- attendance: 100

---

## 🎭 Get Tokens for Testing

After seeding, get tokens via OTP:

```http
### 1. Request OTP for Admin
POST http://localhost:3001/api/auth/request-otp
Content-Type: application/json

{
  "identifier": "admin@test.com",
  "method": "email"
}

### 2. Verify OTP (check console logs for code)
POST http://localhost:3001/api/auth/verify-otp
Content-Type: application/json

{
  "identifier": "admin@test.com",
  "code": "YOUR_OTP_HERE"
}
```

**Save tokens in .http files:**
```
@adminToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
@teacherToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
@studentToken = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Ready to Test!

Now you have:
- ✅ Complete academic structure
- ✅ 20 realistic students
- ✅ 2 active groups
- ✅ Attendance history
- ✅ Payment records
- ✅ Learning materials
- ✅ Placement test

**Start testing workflows with real data!**
