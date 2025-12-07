// Test Claude API directly
import { askClaude } from './src/services/chatbot/claude.service';

async function testClaude() {
  console.log('🧪 Testing Claude API...\n');
  
  try {
    const response = await askClaude('Hello, can you hear me?');
    console.log('✅ SUCCESS!');
    console.log('Response:', response);
  } catch (error: any) {
    console.log('❌ ERROR!');
    console.log('Error message:', error.message);
    console.log('Full error:', error);
  }
}

testClaude();
