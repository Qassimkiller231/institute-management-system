// Comprehensive seed script for institute management system
// Creates realistic test data: 6 programs, 12 terms, 30+ users, tests, payments, etc.
// Run with: npx tsx scripts/seed-comprehensive.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper functions
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function main() {
  console.log('🚀 Starting comprehensive data seeding...\\n');

  try {
    // ============================================
    // 1. CREATE PROGRAMS
    // ============================================
    console.log('📚 Creating Programs...');

    const programsData = [
      { name: 'General English', code: 'GE', description: 'Comprehensive English language program for all levels', minAge: 12, maxAge: null },
      { name: 'Business English', code: 'BE', description: 'English for professional and business contexts', minAge: 18, maxAge: null },
      { name: 'IELTS Preparation', code: 'IELTS', description: 'Intensive preparation for IELTS exam', minAge: 16, maxAge: null },
      { name: 'Kids English', code: 'KIDS', description: 'Fun and interactive English for children', minAge: 6, maxAge: 12 },
      { name: 'Conversation Club', code: 'CONV', description: 'Practice speaking and conversation skills', minAge: 14, maxAge: null },
      { name: 'Academic Writing', code: 'AW', description: 'Advanced academic writing skills', minAge: 18, maxAge: null },
    ];

    const programs = [];
    for (const programData of programsData) {
      const program = await prisma.program.upsert({
        where: { code: programData.code },
        update: {},
        create: programData,
      });
      programs.push(program);
      console.log(`   ✅ ${program.name} (${program.code})`);
    }

    // ============================================
    // 2. CREATE LEVELS
    // ============================================
    console.log('\\n📊 Creating Levels...');

    const levelsData = [
      { name: 'A1', displayName: 'Beginner', orderNumber: 1, description: 'Can understand and use familiar everyday expressions' },
      { name: 'A2', displayName: 'Elementary', orderNumber: 2, description: 'Can communicate in simple and routine tasks' },
      { name: 'B1', displayName: 'Intermediate', orderNumber: 3, description: 'Can deal with most situations while traveling' },
      { name: 'B2', displayName: 'Upper Intermediate', orderNumber: 4, description: 'Can interact with a degree of fluency and spontaneity' },
      { name: 'C1', displayName: 'Advanced', orderNumber: 5, description: 'Can express ideas fluently and spontaneously' },
      { name: 'C2', displayName: 'Proficient', orderNumber: 6, description: 'Can express themselves spontaneously, very fluently and precisely' },
    ];

    const levels = [];
    for (const levelData of levelsData) {
      const level = await prisma.level.upsert({
        where: { name: levelData.name },
        update: {},
        create: levelData,
      });
      levels.push(level);
      console.log(`   ✅ ${level.name} - ${level.displayName}`);
    }

    // ============================================
    // 3. CREATE TERMS (2 per program)
    // ============================================
    console.log('\\n📅 Creating Terms...');

    const terms = [];
    for (const program of programs) {
      // Fall 2024 term
      const fall2024 = await prisma.term.create({
        data: {
          programId: program.id,
          name: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-20'),
          isCurrent: true,
          isActive: true,
        },
      });
      terms.push(fall2024);
      console.log(`   ✅ ${program.code} - ${fall2024.name}`);

      // Spring 2025 term
      const spring2025 = await prisma.term.create({
        data: {
          programId: program.id,
          name: 'Spring 2025',
          startDate: new Date('2025-01-05'),
          endDate: new Date('2025-04-30'),
          isCurrent: false,
          isActive: true,
        },
      });
      terms.push(spring2025);
      console.log(`   ✅ ${program.code} - ${spring2025.name}`);
    }

    console.log(`\\n   📊 Total: ${terms.length} terms created`);

    // ============================================
    // 4. CREATE COMPREHENSIVE PLACEMENT TEST (50 questions for levelConfig.ts)
    // ============================================
    console.log('\\n📝 Creating Comprehensive Placement Test...');

    const placementTest = await prisma.test.create({
      data: {
        name: 'English Placement Test (A1-C2)',
        testType: 'PLACEMENT',
        totalQuestions: 50,
        durationMinutes: 60,
        isActive: true,
      },
    });
    console.log(`   ✅ ${placementTest.name}`);

    // Create 50 questions with progressive difficulty (A1 → C2)
    // Aligned with levelConfig.ts: 0-18=A1, 19-25=A2, 26-32=B1, 33-39=B2, 40-46=C1, 47-50=C2
    console.log('\\n   Creating 50 placement test questions (A1→C2)...');

    const placementQuestions = [
      // A1 Level Questions (1-18) - Questions 1-18 = A1 in levelConfig
      { text: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 'am' },
      { text: 'She ___ from England.', options: ['am', 'is', 'are', 'be'], answer: 'is' },
      { text: 'We ___ happy.', options: ['am', 'is', 'are', 'be'], answer: 'are' },
      { text: 'This ___ my book.', options: ['am', 'is', 'are', 'be'], answer: 'is' },
      { text: 'They ___ teachers.', options: ['am', 'is', 'are', 'be'], answer: 'are' },
      { text: 'What ___ your name?', options: ['am', 'is', 'are', 'be'], answer: 'is' },
      { text: 'I ___ water every day.', options: ['drink', 'drinks', 'drinking', 'drank'], answer: 'drink' },
      { text: 'She ___ to school.', options: ['go', 'goes', 'going', 'went'], answer: 'goes' },
      { text: 'The cat ___ on the table.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
      { text: 'There ___ seven days in a week.', options: ['is', 'are', 'am', 'was'], answer: 'are' },
      { text: 'He ___ a car.', options: ['have', 'has', 'having', 'had'], answer: 'has' },
      { text: 'We ___ English.', options: ['study', 'studies', 'studying', 'studied'], answer: 'study' },
      { text: 'The book ___ on the table.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
      { text: 'I ___ coffee.', options: ['like', 'likes', 'liking', 'liked'], answer: 'like' },
      { text: 'She ___ at home.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
      { text: 'You ___ my friend.', options: ['is', 'are', 'am', 'be'], answer: 'are' },
      { text: 'The dog ___ brown.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
      { text: 'Children ___ in the park.', options: ['play', 'plays', 'playing', 'played'], answer: 'play' },

      // A2 Level Questions (19-25) - Questions 19-25 = A2 in levelConfig
      { text: 'Yesterday, I ___ to the park.', options: ['go', 'goes', 'went', 'going'], answer: 'went' },
      { text: 'She ___ TV now.', options: ['watch', 'watches', 'is watching', 'watched'], answer: 'is watching' },
      { text: 'I ___ breakfast at 7 AM every day.', options: ['have', 'has', 'having', 'had'], answer: 'have' },
      { text: 'There ___ many people in the room.', options: ['is', 'are', 'was', 'were'], answer: 'are' },
      { text: 'I need ___ apple.', options: ['a', 'an', 'the', 'some'], answer: 'an' },
      { text: 'She is ___ than her sister.', options: ['tall', 'taller', 'tallest', 'more tall'], answer: 'taller' },
      { text: 'We ___ to London last year.', options: ['travel', 'travels', 'traveled', 'traveling'], answer: 'traveled' },

      // B1 Level Questions (26-32) - Questions 26-32 = B1 in levelConfig
      { text: 'If I ___ you, I would study harder.', options: ['am', 'was', 'were', 'be'], answer: 'were' },
      { text: 'She ___ here for five years.', options: ['lives', 'is living', 'has lived', 'lived'], answer: 'has lived' },
      { text: 'The book ___ by millions of people.', options: ['reads', 'is reading', 'has been read', 'was reading'], answer: 'has been read' },
      { text: 'I wish I ___ more time.', options: ['have', 'has', 'had', 'having'], answer: 'had' },
      { text: 'By the time you arrive, I ___ dinner.', options: ['finish', 'finished', 'will finish', 'will have finished'], answer: 'will have finished' },
      { text: 'She suggested ___ early.', options: ['leave', 'to leave', 'leaving', 'left'], answer: 'leaving' },
      { text: 'I am used to ___ up early.', options: ['wake', 'waking', 'woke', 'woken'], answer: 'waking' },

      // B2 Level Questions (33-39) - Questions 33-39 = B2 in levelConfig
      { text: 'Had I known, I ___ differently.', options: ['act', 'acted', 'would act', 'would have acted'], answer: 'would have acted' },
      { text: 'She ___ working when I called.', options: ['is', 'was', 'has been', 'had been'], answer: 'had been' },
      { text: 'The proposal ___ by the committee next week.', options: ['reviews', 'reviewed', 'will be reviewed', 'has reviewed'], answer: 'will be reviewed' },
      { text: 'Not only ___ late, but he also forgot the documents.', options: ['he was', 'was he', 'he is', 'is he'], answer: 'was he' },
      { text: 'I would rather you ___ that.', options: ['not do', 'didn\'t do', 'don\'t do', 'not did'], answer: 'didn\'t do' },
      { text: 'By this time tomorrow, we ___ the project.', options: ['complete', 'completed', 'will complete', 'will have completed'], answer: 'will have completed' },
      { text: '___ the weather, we decided to cancel the trip.', options: ['Despite', 'Although', 'Given', 'However'], answer: 'Given' },

      // C1 Level Questions (40-46) - Questions 40-46 = C1 in levelConfig
      { text: 'Seldom ___ such dedication.', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], answer: 'have I seen' },
      { text: 'The research ___ considerable insight.', options: ['yielded', 'produced', 'generated', 'made'], answer: 'yielded' },
      { text: 'She spoke with such ___ that everyone was convinced.', options: ['eloquence', 'fluency', 'clarity', 'precision'], answer: 'eloquence' },
      { text: '___ circumstances would I agree to that.', options: ['Under no', 'In no', 'At no', 'On no'], answer: 'Under no' },
      { text: 'The solution proved to be rather ___.', options: ['elusive', 'illusive', 'exclusive', 'inclusive'], answer: 'elusive' },
      { text: 'His argument was ___ by substantial evidence.', options: ['corroborated', 'collaborated', 'cooperated', 'coordinated'], answer: 'corroborated' },
      { text: 'The policy had far-reaching ___.', options: ['ramifications', 'complications', 'implications', 'specifications'], answer: 'ramifications' },

      // C2 Level Questions (47-50) - Questions 47-50 = C2 in levelConfig
      { text: 'The scholarly work exemplifies ___ erudition.', options: ['profound', 'deep', 'intense', 'strong'], answer: 'profound' },
      { text: 'Her dissertation ___ new ground in the field.', options: ['broke', 'made', 'took', 'found'], answer: 'broke' },
      { text: 'The testimony served to ___ his alibi.', options: ['substantiate', 'substitute', 'subsidize', 'subjugate'], answer: 'substantiate' },
      { text: 'His work represents a ___ achievement.', options: ['seminal', 'terminal', 'nominal', 'cardinal'], answer: 'seminal' },
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
    console.log(`   ✅ Created 50 questions (aligned with levelConfig.ts ranges)`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\\n' + '='.repeat(60));
    console.log('🎉 COMPREHENSIVE SEED COMPLETE');
    console.log('='.repeat(60));
    console.log(`\\n📊 Summary:`);
    console.log(`   ✅ ${programs.length} Programs`);
    console.log(`   ✅ ${levels.length} Levels (A1-C2)`);
    console.log(`   ✅ ${terms.length} Terms (2 per program with shared names)`);
    console.log(`   ✅ 1 Placement Test (50 questions for levelConfig.ts)`);
    console.log('\\n💡 Notes:');
    console.log('   • Score  0-18 → A1 (Beginner)');
    console.log('   • Score 19-25 → A2 (Elementary)');
    console.log('   • Score 26-32 → B1 (Intermediate)');
    console.log('   • Score 33-39 → B2 (Upper Intermediate)');
    console.log('   • Score 40-46 → C1 (Advanced)');
    console.log('   • Score 47-50 → C2 (Proficient)');
    console.log('');

  } catch (error) {
    console.error('❌ Error in seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });