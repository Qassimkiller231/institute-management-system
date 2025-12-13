// Script to create payment plan for Husain (CPR: 767676767)
// Run with: npx tsx backend/scripts/createPaymentForHusain.ts

import prisma from '../src/utils/db';

async function createPaymentPlanForHusain() {
    try {
        console.log('🔍 Finding Husain (CPR: 767676767)...');

        // Step 1: Find Husain
        const student = await prisma.student.findFirst({
            where: { cpr: '767676767' },
            include: {
                enrollments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        group: {
                            include: {
                                level: true,
                                term: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            console.error('❌ Student with CPR 767676767 not found!');
            return;
        }

        console.log(`✅ Found student: ${student.firstName} ${student.secondName || ''}`);
        console.log(`   Student ID: ${student.id}`);

        // Step 2: Check for active enrollment
        if (!student.enrollments || student.enrollments.length === 0) {
            console.error('❌ No active enrollments found for this student!');
            console.log('   Please create an enrollment first.');
            return;
        }

        const enrollment = student.enrollments[0];
        console.log(`✅ Found active enrollment:`);
        console.log(`   Enrollment ID: ${enrollment.id}`);
        console.log(`   Group: ${enrollment.group.name}`);
        console.log(`   Level: ${enrollment.group.level.name}`);
        console.log(`   Term: ${enrollment.group.term.name}`);

        // Step 3: Check if payment plan already exists
        const existingPlan = await prisma.studentPaymentPlan.findFirst({
            where: { enrollmentId: enrollment.id }
        });

        if (existingPlan) {
            console.log('⚠️  Payment plan already exists for this enrollment!');
            console.log(`   Plan ID: ${existingPlan.id}`);
            console.log(`   Total Amount: ${existingPlan.currency} ${existingPlan.totalAmount}`);

            const installments = await prisma.installment.findMany({
                where: { paymentPlanId: existingPlan.id }
            });

            console.log(`   Installments: ${installments.length}`);
            return;
        }

        // Step 4: Create payment plan
        console.log('\n💰 Creating payment plan...');

        const paymentPlan = await prisma.studentPaymentPlan.create({
            data: {
                enrollmentId: enrollment.id,
                totalAmount: 450.00,
                totalInstallments: 1,
                finalAmount: 450.00,
                status: 'ACTIVE'
            }
        });

        console.log(`✅ Payment plan created!`);
        console.log(`   Plan ID: ${paymentPlan.id}`);
        console.log(`   Total Amount: BHD ${paymentPlan.totalAmount}`);

        // Step 5: Create installment
        console.log('\n📋 Creating installment...');

        const installment = await prisma.installment.create({
            data: {
                paymentPlanId: paymentPlan.id,
                installmentNumber: 1,
                amount: 450.00,
                dueDate: new Date('2025-01-15'),
                paymentMethod: 'ONLINE_PAYMENT'
            }
        });

        console.log(`✅ Installment created!`);
        console.log(`   Installment ID: ${installment.id}`);
        console.log(`   Amount: BHD ${installment.amount}`);
        console.log(`   Due Date: ${installment.dueDate?.toISOString().split('T')[0]}`);
        console.log(`   Payment Method: ${installment.paymentMethod}`);

        console.log('\n🎉 Success! Payment plan created for Husain.');
        console.log('   Parents can now see this payment in the parent portal.');

    } catch (error) {
        console.error('❌ Error creating payment plan:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createPaymentPlanForHusain();
