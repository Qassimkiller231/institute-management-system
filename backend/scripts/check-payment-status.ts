import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateInstallmentStatus(installment: any): string {
    // Status should be calculated, not stored
    if (installment.paymentDate) {
        return 'PAID';
    }

    if (!installment.dueDate) {
        return 'PENDING';
    }

    const now = new Date();
    const due = new Date(installment.dueDate);

    if (due < now) {
        return 'OVERDUE';
    }

    return 'PENDING';
}

async function checkPaymentStatus() {
    console.log('Checking payment installments...\n');

    const installments = await prisma.installment.findMany({
        select: {
            id: true,
            installmentNumber: true,
            amount: true,
            dueDate: true,
            paymentDate: true,
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
        },
        orderBy: { dueDate: 'desc' },
        take: 20
    });

    console.log(`Found ${installments.length} recent installments\n`);

    // Calculate statuses
    const withStatus = installments.map(inst => ({
        ...inst,
        calculatedStatus: calculateInstallmentStatus(inst)
    }));

    // Group by calculated status
    const statusGroups: Record<string, any[]> = {};
    withStatus.forEach(inst => {
        const status = inst.calculatedStatus;
        if (!statusGroups[status]) statusGroups[status] = [];
        statusGroups[status].push(inst);
    });

    console.log('📊 Status Distribution (CALCULATED):');
    Object.keys(statusGroups).forEach(status => {
        console.log(`  ${status}: ${statusGroups[status].length} installments`);
    });

    console.log('\n📋 Sample Installments:');
    withStatus.slice(0, 10).forEach((inst, i) => {
        const student = inst.paymentPlan?.enrollment?.student;
        const studentName = student ? `${student.firstName} ${student.secondName || ''}`.trim() : 'N/A';

        console.log(`\n${i + 1}. Installment #${inst.installmentNumber} - ${studentName}`);
        console.log(`   Amount: ${inst.amount}`);
        console.log(`   Due: ${inst.dueDate ? inst.dueDate.toISOString().split('T')[0] : 'N/A'}`);
        console.log(`   Paid: ${inst.paymentDate ? inst.paymentDate.toISOString().split('T')[0] : 'NOT PAID'}`);
        console.log(`   CALCULATED Status: "${inst.calculatedStatus}"`);
        console.log(`   Method: ${inst.paymentMethod || 'N/A'}`);
    });

    await prisma.$disconnect();
}

checkPaymentStatus().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
