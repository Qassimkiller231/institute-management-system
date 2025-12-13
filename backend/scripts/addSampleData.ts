// Script to add sample data for Progress Criteria, Tests, and Student Progress
// Run with: npx tsx backend/scripts/addSampleData.ts

import prisma from '../src/utils/db';

async function addSampleData() {
    try {
        console.log('🚀 Starting to add sample data...\n');

        // ========================================
        // 1. GET EXISTING DATA
        // ========================================

        console.log('📋 Fetching existing data...');

        // Get levels
        const levels = await prisma.level.findMany();
        console.log(`   Found ${levels.length} levels:`, levels.map(l => l.name).join(', '));

        // Get Husain's data
        const husain = await prisma.student.findFirst({
            where: { cpr: '767676767' },
            include: {
                enrollments: {
                    where: { status: 'ACTIVE' },
                    include: { group: true }
                }
            }
        });

        if (!husain) {
            console.error('❌ Husain not found!');
            return;
        }

        console.log(`   Found student: ${husain.firstName}`);

        const husainEnrollment = husain.enrollments[0];
        if (!husainEnrollment) {
            console.error('❌ No active enrollment for Husain!');
            return;
        }

        console.log(`   Active enrollment: ${husainEnrollment.group.name}`);
        const groupId = husainEnrollment.group.id;
        const levelId = husainEnrollment.group.levelId;

        console.log(`   Group ID: ${groupId}`);
        console.log(`   Level ID: ${levelId}\n`);

        // ========================================
        // 2. CREATE PROGRESS CRITERIA
        // ========================================

        console.log('📝 Creating Progress Criteria...');

        const criteriaData = [
            {
                name: 'Basic Greetings',
                description: 'Can greet people and introduce themselves in English',
                orderNumber: 1
            },
            {
                name: 'Numbers 1-100',
                description: 'Can count and use numbers from 1 to 100',
                orderNumber: 2
            },
            {
                name: 'Present Simple Tense',
                description: 'Understands and uses present simple tense correctly',
                orderNumber: 3
            },
            {
                name: 'Common Vocabulary',
                description: 'Knows 200+ common English words (colors, food, family, etc.)',
                orderNumber: 4
            },
            {
                name: 'Simple Questions',
                description: 'Can ask and answer simple questions (What, Who, Where)',
                orderNumber: 5
            },
            {
                name: 'Basic Conversation',
                description: 'Can have a simple conversation about daily activities',
                orderNumber: 6
            }
        ];

        const createdCriteria = [];
        for (const criteriaItem of criteriaData) {
            const criteria = await prisma.progressCriteria.create({
                data: {
                    levelId,
                    groupId,
                    ...criteriaItem,
                    isActive: true
                }
            });
            createdCriteria.push(criteria);
            console.log(`   ✅ Created: ${criteria.name}`);
        }

        // ========================================
        // 3. CREATE STUDENT CRITERIA COMPLETIONS
        // ========================================

        console.log('\n✓ Creating Student Criteria Completions...');

        // Mark first 3 criteria as completed
        for (let i = 0; i < 3; i++) {
            const completion = await prisma.studentCriteriaCompletion.create({
                data: {
                    studentId: husain.id,
                    criteriaId: createdCriteria[i].id,
                    enrollmentId: husainEnrollment.id,
                    completed: true,
                    completedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000) // Completed days ago
                }
            });
            console.log(`   ✅ Completed: ${createdCriteria[i].name}`);
        }

        // Mark remaining as not completed
        for (let i = 3; i < createdCriteria.length; i++) {
            await prisma.studentCriteriaCompletion.create({
                data: {
                    studentId: husain.id,
                    criteriaId: createdCriteria[i].id,
                    enrollmentId: husainEnrollment.id,
                    completed: false
                }
            });
            console.log(`   ⏳ Pending: ${createdCriteria[i].name}`);
        }

        // ========================================
        // 4. CREATE PLACEMENT TEST
        // ========================================

        console.log('\n📄 Creating Placement Test...');

        const placementTest = await prisma.test.create({
            data: {
                name: 'A1 Level Placement Test',
                testType: 'PLACEMENT',
                levelId,
                totalQuestions: 10,
                durationMinutes: 30,
                isActive: true
            }
        });

        console.log(`   ✅ Created test: ${placementTest.name}`);

        // ========================================
        // 5. CREATE TEST QUESTIONS
        // ========================================

        console.log('\n❓ Creating Test Questions...');

        const questions = [
            {
                questionText: 'I ___ from Bahrain.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are', 'be']),
                correctAnswer: 'am',
                points: 1,
                orderNumber: 1
            },
            {
                questionText: 'Complete the sentence: I ___ a student.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are', 'be']),
                correctAnswer: 'am',
                points: 1,
                orderNumber: 2
            },
            {
                questionText: 'What is the opposite of "hot"?',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['cold', 'warm', 'cool', 'freeze']),
                correctAnswer: 'cold',
                points: 1,
                orderNumber: 3
            },
            {
                questionText: 'The sun rises in the ___.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['east', 'west', 'north', 'south']),
                correctAnswer: 'east',
                points: 1,
                orderNumber: 4
            },
            {
                questionText: 'I ___ to school every day.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['go', 'goes', 'going', 'went']),
                correctAnswer: 'go',
                points: 1,
                orderNumber: 5
            },
            {
                questionText: 'She ___ a teacher.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are', 'be']),
                correctAnswer: 'is',
                points: 1,
                orderNumber: 6
            },
            {
                questionText: 'The cat is ___ the table.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['on', 'at', 'in', 'to']),
                correctAnswer: 'on',
                points: 1,
                orderNumber: 7
            },
            {
                questionText: 'How many days are in a week?',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['5', '6', '7', '8']),
                correctAnswer: '7',
                points: 1,
                orderNumber: 8
            },
            {
                questionText: 'The plural of "child" is ___.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['childs', 'children', 'childes', 'child']),
                correctAnswer: 'children',
                points: 1,
                orderNumber: 9
            },
            {
                questionText: 'English is spoken in ___.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['America', 'France', 'Spain', 'Italy']),
                correctAnswer: 'America',
                points: 1,
                orderNumber: 10
            }
        ];

        for (const question of questions) {
            const created = await prisma.testQuestion.create({
                data: {
                    testId: placementTest.id,
                    ...question
                }
            });
            console.log(`   ✅ Question ${created.orderNumber}: ${created.questionText.substring(0, 50)}...`);
        }

        // ========================================
        // 6. CREATE WRITTEN TEST
        // ========================================

        console.log('\n📝 Creating Written Test...');

        const writtenTest = await prisma.test.create({
            data: {
                name: 'A1 Grammar and Vocabulary Test',
                testType: 'WRITTEN',
                levelId,
                totalQuestions: 8,
                durationMinutes: 45,
                isActive: true
            }
        });

        console.log(`   ✅ Created test: ${writtenTest.name}`);

        const writtenQuestions = [
            {
                questionText: 'Choose the correct form: I ___ happy.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are']),
                correctAnswer: 'am',
                points: 2,
                orderNumber: 1
            },
            {
                questionText: 'What time ___ it?',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are', 'be']),
                correctAnswer: 'is',
                points: 2,
                orderNumber: 2
            },
            {
                questionText: 'They ___ students.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['am', 'is', 'are']),
                correctAnswer: 'are',
                points: 2,
                orderNumber: 3
            },
            {
                questionText: 'Complete: This is ___ apple.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['a', 'an', 'the']),
                correctAnswer: 'an',
                points: 2,
                orderNumber: 4
            },
            {
                questionText: 'My sister ___ to music every day.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['listen', 'listens', 'listening', 'listened']),
                correctAnswer: 'listens',
                points: 2,
                orderNumber: 5
            },
            {
                questionText: 'There ___ many books on the shelf.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['is', 'are', 'am', 'be']),
                correctAnswer: 'are',
                points: 2,
                orderNumber: 6
            },
            {
                questionText: 'I don\'t ___ coffee.',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['like', 'likes', 'liking', 'liked']),
                correctAnswer: 'like',
                points: 2,
                orderNumber: 7
            },
            {
                questionText: '___ does she live?',
                questionType: 'MULTIPLE_CHOICE',
                options: JSON.stringify(['What', 'Where', 'When', 'Who']),
                correctAnswer: 'Where',
                points: 2,
                orderNumber: 8
            }
        ];

        for (const question of writtenQuestions) {
            const created = await prisma.testQuestion.create({
                data: {
                    testId: writtenTest.id,
                    ...question
                }
            });
            console.log(`   ✅ Question ${created.orderNumber}: ${created.questionText.substring(0, 50)}...`);
        }

        // ========================================
        // SPEAKING SLOTS
        // ========================================

        console.log('\n📅 Creating Speaking Slots...');
        isBooked: false
    },
    {
        teacherId: teacher.id,
            slotDate: today,
                startTime: '10:00',
                    endTime: '10:30',
                        isBooked: false
    },
    {
        teacherId: teacher.id,
            slotDate: today,
                startTime: '11:00',
                    endTime: '11:30',
                        isBooked: false
    },
    // Tomorrow's slots
    {
        teacherId: teacher.id,
            slotDate: tomorrow,
                startTime: '09:00',
                    endTime: '09:30',
                        isBooked: false
    },
    {
        teacherId: teacher.id,
            slotDate: tomorrow,
                startTime: '10:00',
                    endTime: '10:30',
                        isBooked: false
    },
    {
        teacherId: teacher.id,
            slotDate: tomorrow,
                startTime: '14:00',
                    endTime: '14:30',
                        isBooked: false
    },
    // Day after tomorrow
    {
        teacherId: teacher.id,
            slotDate: dayAfter,
                startTime: '09:00',
                    endTime: '09:30',
                        isBooked: false
    },
    {
        teacherId: teacher.id,
            slotDate: dayAfter,
                startTime: '15:00',
                    endTime: '15:30',
                        isBooked: false
    }
        ];

    for (const slot of speakingSlots) {
        await prisma.speakingSlot.create({
            data: slot
        });
    }

    console.log(`   ✅ Created ${speakingSlots.length} speaking slots`);

    // ========================================
    // ANNOUNCEMENTS
    // ========================================

    console.log('\n📢 Creating Announcements...');

    const announcements = [
        {
            title: 'Welcome to The Function Institute!',
            content: 'We are excited to have you join our English learning community. Classes start next week!',
            targetRole: 'ALL_STUDENTS',
            priority: 'HIGH',
            isActive: true,
            publishDate: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        {
            title: 'Upcoming Speaking Tests',
            content: 'Speaking test slots are now available for booking. Please book your slot at least 24 hours in advance.',
            targetRole: 'ALL_STUDENTS',
            priority: 'MEDIUM',
            isActive: true,
            publishDate: new Date()
        },
        {
            title: 'Payment Reminder',
            content: 'Please ensure all tuition fees are paid by the end of this month to avoid any interruptions to your classes.',
            targetRole: 'ALL_PARENTS',
            priority: 'HIGH',
            isActive: true,
            publishDate: new Date(),
            expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
        },
        {
            title: 'New Study Materials Available',
            content: 'Check the Materials section for newly uploaded worksheets and practice exercises for levels A1-B2.',
            targetRole: 'ALL_STUDENTS',
            priority: 'LOW',
            isActive: true,
            publishDate: new Date()
        },
        {
            title: 'Teacher Meeting Tomorrow',
            content: 'Reminder: Staff meeting tomorrow at 3 PM in the main hall. Attendance is mandatory.',
            targetRole: 'ALL_TEACHERS',
            priority: 'HIGH',
            isActive: true,
            publishDate: new Date()
        }
    ];

    for (const announcement of announcements) {
        await prisma.announcement.create({
            data: announcement
        });
    }

    console.log(`   ✅ Created ${announcements.length} announcements`);

    // ========================================
    // SUMMARY
    // ========================================

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SAMPLE DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ${createdCriteria.length} Progress Criteria created`);
    console.log(`   ✅ ${createdCriteria.length} Student Completions created (3 completed, 3 pending)`);
    console.log(`   ✅ 2 Tests created (Placement + Written)`);
    console.log(`   ✅ 18 Test Questions created (10 + 8)`);
    console.log(`\n🎯 For Student: ${husain.firstName} (CPR: ${husain.cpr})`);
    console.log(`   Level: ${levels.find(l => l.id === levelId)?.name || 'Unknown'}`);
    console.log(`   Group: ${husainEnrollment.group.name}`);
    console.log(`\n✨ You can now:`);
    console.log(`   1. View progress in parent portal → Progress tab`);
    console.log(`   2. Check tests in admin panel`);
    console.log(`   3. Run: npx prisma studio (to view in database GUI)`);
    console.log('');

} catch (error) {
    console.error('❌ Error creating sample data:', error);
} finally {
    await prisma.$disconnect();
}
}

// Run the script
addSampleData();
