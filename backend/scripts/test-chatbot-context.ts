import { getDatabaseContext } from '../src/services/chatbot/analytics.service';
import { PrismaClient } from '@prisma/client';

const runTest = async () => {
    console.log('🤖 Generating Database Context for Chatbot...');
    const context = await getDatabaseContext();
    console.log('-------------------------------------------');
    console.log(context);
    console.log('-------------------------------------------');
};

runTest()
    .catch(console.error)
    .finally(() => process.exit(0));
