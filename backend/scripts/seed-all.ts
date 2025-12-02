import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx tsx scripts/seed-all.ts <email>');
    process.exit(1);
  }

  console.log('🚀 Starting database seeding...\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 STEP 1: Placement Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  execSync('npx tsx scripts/seed-placement-tests.ts', { stdio: 'inherit' });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 STEP 2: Progress Criteria');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  execSync('npx tsx scripts/seed-progress-criteria.ts', { stdio: 'inherit' });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💳 STEP 3: Student Payment');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  execSync(`npx tsx scripts/enable-student-payment.ts ${email}`, { stdio: 'inherit' });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VERIFICATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testCount = await prisma.test.count();
  const questionCount = await prisma.testQuestion.count();
  console.log(`📝 Tests: ${testCount}, Questions: ${questionCount}`);

  const criteriaCount = await prisma.progressCriteria.count();
  console.log(`📊 Progress Criteria: ${criteriaCount}`);

  const student = await prisma.student.findFirst({
    where: { user: { email } },
    include: {
      enrollments: {
        include: {
          paymentPlan: {
            include: { _count: { select: { installments: true } } },
          },
        },
      },
    },
  });

  if (student) {
    const plan = student.enrollments[0]?.paymentPlan;
    console.log(`💳 Payment: ${student.canSeePayment ? 'Enabled' : 'Disabled'}`);
    if (plan) {
      console.log(`   Plan: ${plan.finalAmount} BHD`);
      console.log(`   Installments: ${plan._count.installments}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ALL DONE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });