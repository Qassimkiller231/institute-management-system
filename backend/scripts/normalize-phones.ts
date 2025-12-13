/**
 * Phone Number Normalization Migration Script
 * 
 * This script normalizes all existing phone numbers in the database:
 * 1. Fetches all users with phone numbers
 * 2. Normalizes each phone number (removes country code, keeps digits only)
 * 3. Detects duplicates (same normalized number)
 * 4. Updates database with normalized values
 * 
 * Usage:
 *   npx tsx scripts/normalize-phones.ts --dry-run  # Preview changes
 *   npx tsx scripts/normalize-phones.ts --execute  # Execute changes
 */

import { PrismaClient } from '@prisma/client';
import { normalizePhoneNumber, arePhoneNumbersEquivalent } from '../src/utils/phone.utils';

const prisma = new PrismaClient();

interface PhoneUpdate {
    userId: string;
    originalPhone: string;
    normalizedPhone: string;
    email: string;
    role: string;
}

interface DuplicateGroup {
    normalizedPhone: string;
    users: {
        userId: string;
        originalPhone: string;
        email: string;
        role: string;
    }[];
}

async function analyzePhoneNumbers() {
    console.log('📊 Analyzing phone numbers in database...\n');

    // Fetch all users with phone numbers
    const users = await prisma.user.findMany({
        where: {
            phone: {
                not: null
            }
        },
        select: {
            id: true,
            email: true,
            phone: true,
            role: true
        }
    });

    console.log(`Found ${users.length} users with phone numbers\n`);

    const updates: PhoneUpdate[] = [];
    const errors: { userId: string; phone: string; error: string }[] = [];
    const normalizedPhoneMap = new Map<string, DuplicateGroup>();

    // Process each user
    for (const user of users) {
        if (!user.phone) continue;

        try {
            const normalizedPhone = normalizePhoneNumber(user.phone);

            // Track for updates
            updates.push({
                userId: user.id,
                originalPhone: user.phone,
                normalizedPhone: normalizedPhone,
                email: user.email,
                role: user.role
            });

            // Track for duplicates
            if (!normalizedPhoneMap.has(normalizedPhone)) {
                normalizedPhoneMap.set(normalizedPhone, {
                    normalizedPhone: normalizedPhone,
                    users: []
                });
            }

            normalizedPhoneMap.get(normalizedPhone)!.users.push({
                userId: user.id,
                originalPhone: user.phone,
                email: user.email,
                role: user.role
            });
        } catch (error: any) {
            errors.push({
                userId: user.id,
                phone: user.phone,
                error: error.message
            });
        }
    }

    // Find duplicates (normalized values that have multiple users)
    const duplicates: DuplicateGroup[] = [];
    for (const [_, group] of normalizedPhoneMap) {
        if (group.users.length > 1) {
            duplicates.push(group);
        }
    }

    return { updates, errors, duplicates };
}

function printReport(updates: PhoneUpdate[], errors: any[], duplicates: DuplicateGroup[]) {
    console.log('═'.repeat(80));
    console.log('📋 PHONE NORMALIZATION REPORT');
    console.log('═'.repeat(80));
    console.log();

    // Print updates that will be made
    console.log(`✅ ${updates.length} phone numbers will be normalized:`);
    console.log();

    const changesNeeded = updates.filter(u => u.originalPhone !== u.normalizedPhone);
    console.log(`   ${changesNeeded.length} require changes`);
    console.log(`   ${updates.length - changesNeeded.length} are already normalized`);
    console.log();

    if (changesNeeded.length > 0) {
        console.log('   Examples of changes:');
        changesNeeded.slice(0, 5).forEach(update => {
            console.log(`   - ${update.email} (${update.role})`);
            console.log(`     "${update.originalPhone}" → "${update.normalizedPhone}"`);
        });
        if (changesNeeded.length > 5) {
            console.log(`   ... and ${changesNeeded.length - 5} more`);
        }
        console.log();
    }

    // Print errors
    if (errors.length > 0) {
        console.log(`⚠️  ${errors.length} phone numbers have errors:`);
        errors.forEach(err => {
            console.log(`   - User ${err.userId}: "${err.phone}" - ${err.error}`);
        });
        console.log();
    }

    // Print duplicates
    if (duplicates.length > 0) {
        console.log('🚨 CRITICAL: Duplicate phone numbers detected!');
        console.log('   These users share the same phone number (different formats):');
        console.log();

        duplicates.forEach((dup, index) => {
            console.log(`   Duplicate Group ${index + 1} (normalized: ${dup.normalizedPhone}):`);
            dup.users.forEach(user => {
                console.log(`     - ${user.email} (${user.role}) - Original: "${user.originalPhone}"`);
            });
            console.log();
        });

        console.log('   ⚠️  ACTION REQUIRED:');
        console.log('   You must manually resolve these duplicates before running the migration.');
        console.log('   Options:');
        console.log('   - Delete duplicate accounts');
        console.log('   - Merge accounts');
        console.log('   - Change one of the phone numbers');
        console.log();
    }

    console.log('═'.repeat(80));
}

async function executeNormalization(updates: PhoneUpdate[]) {
    console.log('🔄 Executing phone number normalization...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
        try {
            // Only update if the value actually changed
            if (update.originalPhone !== update.normalizedPhone) {
                await prisma.user.update({
                    where: { id: update.userId },
                    data: { phone: update.normalizedPhone }
                });
                successCount++;
                console.log(`✅ Updated ${update.email}: "${update.originalPhone}" → "${update.normalizedPhone}"`);
            }
        } catch (error: any) {
            errorCount++;
            console.error(`❌ Failed to update ${update.email}: ${error.message}`);
        }
    }

    console.log();
    console.log(`✅ Successfully updated ${successCount} phone numbers`);
    if (errorCount > 0) {
        console.log(`❌ Failed to update ${errorCount} phone numbers`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isExecute = args.includes('--execute');

    if (!isDryRun && !isExecute) {
        console.log('Usage:');
        console.log('  npx tsx scripts/normalize-phones.ts --dry-run  # Preview changes');
        console.log('  npx tsx scripts/normalize-phones.ts --execute  # Execute changes');
        process.exit(1);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📱 Phone Number Normalization Script`);
    console.log(`Mode: ${isDryRun ? 'DRY RUN (preview only)' : 'EXECUTE (will modify database)'}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
        const { updates, errors, duplicates } = await analyzePhoneNumbers();

        printReport(updates, errors, duplicates);

        if (duplicates.length > 0) {
            console.log('🛑 Migration blocked due to duplicate phone numbers.');
            console.log('   Please resolve duplicates manually before running this script.');
            process.exit(1);
        }

        if (isExecute) {
            console.log('\n⚠️  Proceeding with database updates in 3 seconds...\n');
            await new Promise(resolve => setTimeout(resolve, 3000));
            await executeNormalization(updates);
            console.log('\n✅ Migration completed successfully!\n');
        } else {
            console.log('ℹ️  This was a dry run. No changes were made to the database.');
            console.log('   Run with --execute to apply these changes.\n');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
