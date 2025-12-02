import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx tsx scripts/enable-student-payment.ts <email>');
    process.exit(1);
  }

  console.log(`🔍 Finding student: ${email}`);

  const student = await prisma.student.findFirst({
    where: { user: { email } },
    include: {
      user: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { group: true },
      },
    },
  });

  // ✅ CRITICAL NULL CHECK
  if (!student) {
    console.error(`❌ Student not found: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Found: ${student.firstName}`);

  // ✅ FIX: Use student! assertion or wrap in condition
  await prisma.student.update({
    where: { id: student.id },
    data: { canSeePayment: true },
  });

  console.log('✅ Enabled payment viewing');

  const enrollment = student.enrollments[0];
  if (!enrollment) {
    console.error('❌ No active enrollment');
    process.exit(1);
  }

  const existing = await prisma.studentPaymentPlan.findFirst({
    where: { enrollmentId: enrollment.id },
  });

  if (existing) {
    console.log('⚠️  Payment plan already exists');
    return;
  }

  const plan = await prisma.studentPaymentPlan.create({
    data: {
      enrollmentId: enrollment.id,
      totalAmount: '500.00',
      discountAmount: '50.00',
      finalAmount: '450.00',
      totalInstallments: 3,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created payment plan: 450 BHD');

  const now = new Date();
  await prisma.installment.createMany({
    data: [
      {
        paymentPlanId: plan.id,
        installmentNumber: 1,
        amount: '150.00',
        dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        paymentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'BANK_TRANSFER',
        receiptNumber: 'RCP-001',
      },
      {
        paymentPlanId: plan.id,
        installmentNumber: 2,
        amount: '150.00',
        dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        paymentMethod: 'BENEFIT_PAY',
      },
      {
        paymentPlanId: plan.id,
        installmentNumber: 3,
        amount: '150.00',
        dueDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
        paymentMethod: 'BENEFIT_PAY',
      },
    ],
  });

  console.log('✅ Created 3 installments');
  console.log('   1. PAID - 150 BHD');
  console.log('   2. PENDING - 150 BHD');
  console.log('   3. PENDING - 150 BHD');
  console.log('\n✅ Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });