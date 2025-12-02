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
      options: [
        { id: 'a', text: 'is', isCorrect: true },
        { id: 'b', text: 'are', isCorrect: false },
        { id: 'c', text: 'am', isCorrect: false },
        { id: 'd', text: 'be', isCorrect: false },
      ],
      correctAnswer: 'a',
    },
    {
      questionText: 'She _____ to the store yesterday.',
      options: [
        { id: 'a', text: 'went', isCorrect: true },
        { id: 'b', text: 'go', isCorrect: false },
        { id: 'c', text: 'goes', isCorrect: false },
        { id: 'd', text: 'going', isCorrect: false },
      ],
      correctAnswer: 'a',
    },
    {
      questionText: 'If I _____ you, I would study harder.',
      options: [
        { id: 'a', text: 'were', isCorrect: true },
        { id: 'b', text: 'am', isCorrect: false },
        { id: 'c', text: 'was', isCorrect: false },
        { id: 'd', text: 'be', isCorrect: false },
      ],
      correctAnswer: 'a',
    },
    {
      questionText: 'The book _____ by millions of people.',
      options: [
        { id: 'a', text: 'has been read', isCorrect: true },
        { id: 'b', text: 'read', isCorrect: false },
        { id: 'c', text: 'is reading', isCorrect: false },
        { id: 'd', text: 'reads', isCorrect: false },
      ],
      correctAnswer: 'a',
    },
    {
      questionText: 'Despite _____ tired, she continued working.',
      options: [
        { id: 'a', text: 'being', isCorrect: true },
        { id: 'b', text: 'to be', isCorrect: false },
        { id: 'c', text: 'is', isCorrect: false },
        { id: 'd', text: 'was', isCorrect: false },
      ],
      correctAnswer: 'a',
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