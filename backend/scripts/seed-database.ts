import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting minimal database seeding...\n');

    try {
        // Clear existing data (in correct order due to foreign key constraints)
        console.log('🗑️  Clearing existing data...');
        await prisma.$executeRaw`TRUNCATE TABLE "User", "Parent", "Student", "Teacher", "Program", "Term", "Level", "Venue", "Hall", "Group", "Enrollment", "Announcement" RESTART IDENTITY CASCADE`;
        console.log('✅ Cleared existing data\n');

        // 1. Create Admin User
        console.log('👤 Creating admin user...');
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@institute.com',
                phone: '97312345678',
                role: 'ADMIN',
                isActive: true,
            },
        });
        console.log('✅ Created admin user\n');

        // 2. Create Teacher Users
        console.log('👨‍🏫 Creating teachers...');
        const teacher1User = await prisma.user.create({
            data: {
                email: 'ahmed.hassan@institute.com',
                phone: '97366778899',
                role: 'TEACHER',
                isActive: true,
            },
        });

        const teacher1 = await prisma.teacher.create({
            data: {
                userId: teacher1User.id,
                firstName: 'Ahmed',
                lastName: 'Hassan',
                specialization: 'IELTS Preparation',
            },
        });
        console.log('✅ Created 1 teacher\n');

        // 3. Create Student Users
        console.log('👨‍🎓 Creating students...');
        const student1User = await prisma.user.create({
            data: {
                email: 'omar.ali@email.com',
                phone: '97322334455',
                role: 'STUDENT',
                isActive: true,
            },
        });

        const student1 = await prisma.student.create({
            data: {
                userId: student1User.id,
                cpr: '050315' + Math.random().toString().slice(2, 7),
                firstName: 'Omar',
                secondName: 'Ali',
                dateOfBirth: new Date('2005-03-15'),
                gender: 'Male',
            },
        });
        console.log('✅ Created 1 student\n');

        // 4. Create Parent
        console.log('👨‍👩‍👧 Creating parent...');
        const parent1User = await prisma.user.create({
            data: {
                email: 'ali.mohammed@email.com',
                phone: '97355443322',
                role: 'PARENT',
                isActive: true,
            },
        });

        const parent1 = await prisma.parent.create({
            data: {
                userId: parent1User.id,
                firstName: 'Ali',
                lastName: 'Mohammed',
            },
        });

        // Link parent to student
        await prisma.parentStudentLink.create({
            data: {
                parentId: parent1.id,
                studentId: student1.id,
                relationship: 'FATHER',
            },
        });
        console.log('✅ Created 1 parent and linked to student\n');

        // 5. Create Venue and Hall
        console.log('🏢 Creating venue...');
        const venue1 = await prisma.venue.create({
            data: {
                name: 'Main Campus',
                code: 'MC-001',
                address: 'Building 123, Manama, Bahrain',
            },
        });

        await prisma.hall.create({
            data: {
                venueId: venue1.id,
                name: 'Hall A',
                code: 'HA-01',
                capacity: 30,
            },
        });
        console.log('✅ Created 1 venue with 1 hall\n');

        // 6. Create Program
        console.log('📚 Creating program...');
        const program1 = await prisma.program.create({
            data: {
                name: 'IELTS Preparation',
                code: 'IELTS-2025',
                description: 'Comprehensive IELTS exam preparation',
                isActive: true,
            },
        });
        console.log('✅ Created 1 program\n');

        // 7. Create Term
        console.log('📅 Creating term...');
        const term1 = await prisma.term.create({
            data: {
                programId: program1.id,
                name: 'Spring 2025',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-04-30'),
                isActive: true,
            },
        });
        console.log('✅ Created 1 term\n');

        // 8. Create Level
        console.log('📊 Creating level...');
        const level1 = await prisma.level.create({
            data: {
                name: 'Beginner A1',
                displayName: 'Beginner (A1)',
                orderNumber: 1,
            },
        });
        console.log('✅ Created 1 level\n');

        // 9. Create Group
        console.log('👥 Creating group...');
        const group1 = await prisma.group.create({
            data: {
                termId: term1.id,
                levelId: level1.id,
                teacherId: teacher1.id,
                venueId: venue1.id,
                groupCode: 'IELTS-A1-M',
                name: 'IELTS Beginners Morning',
                capacity: 20,
                schedule: {
                    days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
                    startTime: '09:00',
                    endTime: '11:00',
                },
            },
        });
        console.log('✅ Created 1 group\n');

        // 10. Create Enrollment
        console.log('✏️ Creating enrollment...');
        await prisma.enrollment.create({
            data: {
                studentId: student1.id,
                groupId: group1.id,
                enrollmentDate: new Date(),
                status: 'ACTIVE',
            },
        });
        console.log('✅ Created 1 enrollment\n');

        // 11. Create Announcement
        console.log('📢 Creating announcement...');
        await prisma.announcement.create({
            data: {
                title: 'Welcome to Spring 2025!',
                content: 'Classes begin on January 15th. Welcome!',
                targetAudience: 'ALL',
                publishedBy: adminUser.id,
                isPublished: true,
                publishedAt: new Date(),
            },
        });
        console.log('✅ Created 1 announcement\n');

        console.log('✨ Seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log('   - 1 Admin, 1 Teacher, 1 Student, 1 Parent');
        console.log('   - 1 Program, 1 Term, 1 Level, 1 Group');
        console.log('   - 1 Venue with 1 Hall');
        console.log('   - 1 Enrollment, 1 Announcement');
        console.log('\n🔐 Login (password via OTP):');
        console.log('   Admin: admin@institute.com');
        console.log('   Teacher: ahmed.hassan@institute.com');
        console.log('   Student: omar.ali@email.com');
        console.log('   Parent: ali.mohammed@email.com\n');
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
