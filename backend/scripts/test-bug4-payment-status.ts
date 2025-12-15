import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateInstallmentStatus(installment: any): string {
    if (installment.paymentDate) {
        return 'PAID';
    }

    if (!installment.dueDate) {
        return 'PENDING';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const due = new Date(installment.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < now ? 'OVERDUE' : 'PENDING';
}

async function testPaymentStatus() {
    console.log('Testing payment status calculation for Bug #4...\n');
    console.log(`Today's date: ${new Date().toISOString().split('T')[0]}\n`);

    // Get installments with future due dates
    const futureInstallments = await prisma.installment.findMany({
        where: {
            paymentDate: null,
            dueDate: {
                gte: new Date() // Due date >= today
            }
        },
        select: {
            id: true,
            installmentNumber: true,
            amount: true,
            dueDate: true,
            paymentDate: true,
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
        },
        orderBy: { dueDate: 'asc' },
        take: 10
    });

    console.log(`Found ${futureInstallments.length} unpaid installments with FUTURE due dates\n`);

    if (futureInstallments.length > 0) {
        console.log('These should all show status = PENDING (not OVERDUE):\n');

        futureInstallments.forEach((inst, i) => {
            const student = inst.paymentPlan?.enrollment?.student;
            const name = student ? `${student.firstName} ${student.secondName || ''}`.trim() : 'N/A';
            const status = calculateInstallmentStatus(inst);
            const dueStr = inst.dueDate ? inst.dueDate.toISOString().split('T')[0] : 'N/A';

            console.log(`${i + 1}. ${name} - Installment #${inst.installmentNumber}`);
            console.log(`   Amount: ${inst.amount}`);
            console.log(`   Due Date: ${dueStr}`);
            console.log(`   Calculated Status: ${status}`);
            console.log(`   ✅ Status is correct: ${status === 'PENDING' ? 'YES' : 'NO - BUG!'}`);
            console.log('');
        });
    } else {
        console.log('No future unpaid installments found to test');
    }

    // Also check past due installments
    const overdueInstallments = await prisma.installment.findMany({
        where: {
            paymentDate: null,
            dueDate: {
                lt: new Date() // Due date < today
            }
        },
        select: {
            id: true,
            installmentNumber: true,
            dueDate: true,
        },
        take: 5
    });

    console.log(`\nFound ${overdueInstallments.length} OVERDUE installments (past due, not paid)\n`);

    if (overdueInstallments.length > 0) {
        console.log('Sample OVERDUE installments:');
        overdueInstallments.forEach((inst, i) => {
            const status = calculateInstallmentStatus(inst);
            const dueStr = inst.dueDate ? inst.dueDate.toISOString().split('T')[0] : 'N/A';
            console.log(`  ${i + 1}. Due: ${dueStr}, Status: ${status}`);
        });
    }

    await prisma.$disconnect();
}

testPaymentStatus().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
