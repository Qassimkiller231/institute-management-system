import { backupService } from '../src/services/backup.service';
import path from 'path';

async function exportForAws() {
    console.log('📦 Starting Full Database Export for AWS Migration...');
    try {
        const result = await backupService.createBackup('aws-migration');
        console.log('\n✅ Export Successful!');
        console.log(`----------------------------------------`);
        console.log(`Filename: ${result.filename}`);
        console.log(`Path:     ${result.path}`);
        console.log(`Size:     ${(result.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`----------------------------------------`);
        console.log(`\nTo import this to AWS RDS, you can use the following command:`);
        console.log(`psql -h <AWS_ENDPOINT> -U <AWS_USER> -d <AWS_DB_NAME> < "${result.path}"`);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

exportForAws();
