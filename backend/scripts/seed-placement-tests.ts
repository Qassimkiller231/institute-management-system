import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding placement tests...');

  const test = await prisma.test.create({
    data: {
      name: 'English Placement Test - Level A1-C2',
      testType: 'PLACEMENT',
      totalQuestions: 5,
      durationMinutes: 45,
      isActive: true,
    },
  });

  console.log(`✅ Created test: ${test.name}`);

  const questions = [
    {
      questionText: 'What _____ your name?',
      options: ['is', 'are', 'am', 'be'],
      correctAnswer: 'is',
    },
    {
      questionText: 'She _____ to the store yesterday.',
      options: ['went', 'go', 'goes', 'going'],
      correctAnswer: 'went',
    },
    {
      questionText: 'If I _____ you, I would study harder.',
      options: ['were', 'am', 'was', 'be'],
      correctAnswer: 'were',
    },
    {
      questionText: 'The book _____ by millions of people.',
      options: ['has been read', 'read', 'is reading', 'reads'],
      correctAnswer: 'has been read',
    },
    {
      questionText: 'Despite _____ tired, she continued working.',
      options: ['being', 'to be', 'is', 'was'],
      correctAnswer: 'being',
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.testQuestion.create({
      data: {
        testId: test.id,
        questionText: q.questionText,
        questionType: 'MULTIPLE_CHOICE',
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
        orderNumber: i + 1,
      },
    });
    console.log(`✅ Question ${i + 1}: ${q.questionText}`);
  }

  console.log('\n✅ Done! Created 1 test with 5 questions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });