import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTests() {
  // Get all tests
  const tests = await prisma.test.findMany({
    include: {
      questions: true
    }
  });

  console.log('Fixing tests...\n');

  for (const test of tests) {
    const actualCount = test.questions.length;
    
    await prisma.test.update({
      where: { id: test.id },
      data: { totalQuestions: actualCount }
    });

    console.log(`✅ ${test.name}: ${test.totalQuestions} → ${actualCount} questions`);
  }

  console.log('\n✅ All tests fixed!');
}

fixTests()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });