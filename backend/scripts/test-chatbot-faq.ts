import { getFAQResponse } from '../src/services/chatbot/faq.service';

const testCases = [
    { query: 'hello', role: 'STUDENT', expectedType: 'Greeting' },
    { query: 'what are the payment methods?', role: 'PARENT', expectedType: 'Payment' },
    { query: 'where is the location?', role: 'STUDENT', expectedType: 'Location' },
    { query: 'what is the attendance requirement?', role: 'STUDENT', expectedType: 'Attendance' },
    { query: 'tell me about programs', role: 'visitor', expectedType: 'Program' },
    { query: 'random query that should fail', role: 'STUDENT', expectedType: 'None' }
];

console.log('🤖 Testing Chatbot FAQ System...\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
    const response = getFAQResponse(test.query, test.role);

    const status = (test.expectedType === 'None' && response === null) ||
        (test.expectedType !== 'None' && response !== null);

    if (status) {
        console.log(`✅ Test ${index + 1}: [${test.expectedType}] "${test.query}" -> Passed`);
        passed++;
    } else {
        console.log(`❌ Test ${index + 1}: [${test.expectedType}] "${test.query}" -> Failed`);
        console.log(`   Expected response, got: ${response ? 'Response found' : 'null'}`);
        failed++;
    }
});

console.log(`\n🎉 Results: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
process.exit(0);
