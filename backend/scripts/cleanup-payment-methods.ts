import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupPaymentMethods() {
    console.log('🧹 Cleaning up payment methods for unpaid installments...\n');

    // Find all installments with paymentMethod but no paymentDate
    const unpaidWithMethod = await prisma.installment.findMany({
        where: {
            paymentDate: null,
            paymentMethod: {
                not: null
            }
        },
        select: {
            id: true,
            installmentNumber: true,
            amount: true,
            paymentMethod: true,
            paymentPlan: {
                select: {
                    enrollment: {
                        select: {
                            student: {
                                select: {
                                    firstName: true,
                                    secondName: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log(`Found ${unpaidWithMethod.length} unpaid installments with payment methods set\n`);

    if (unpaidWithMethod.length === 0) {
        console.log('✅ No cleanup needed - all unpaid installments already have NULL payment method');
        await prisma.$disconnect();
        return;
    }

    // Show sample of what will be cleaned
    console.log('Sample installments that will be cleaned:');
    unpaidWithMethod.slice(0, 5).forEach((inst, i) => {
        const student = inst.paymentPlan?.enrollment?.student;
        const name = student ? `${student.firstName} ${student.secondName || ''}`.trim() : 'N/A';
        console.log(`  ${i + 1}. ${name} - Installment #${inst.installmentNumber} - Amount: ${inst.amount} - Method: ${inst.paymentMethod}`);
    });

    console.log(`\n⚠️  About to set paymentMethod = NULL for ${unpaidWithMethod.length} unpaid installments...`);

    // Update all unpaid installments to have NULL payment method
    const result = await prisma.installment.updateMany({
        where: {
            paymentDate: null,
            paymentMethod: {
                not: null
            }
        },
        data: {
            paymentMethod: null
        }
    });

    console.log(`\n✅ Updated ${result.count} installments`);
    console.log('✅ Cleanup complete! Unpaid installments now have NULL payment method');

    await prisma.$disconnect();
}

cleanupPaymentMethods().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
