// test-criteria.ts
// Quick test to see what criteria exist
// Run: npx ts-node backend/scripts/test-criteria.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCriteria() {
  console.log('🔍 Testing Progress Criteria...\n');

  // Get all levels
  const levels = await prisma.level.findMany();
  console.log(`Found ${levels.length} levels:\n`);

  for (const level of levels) {
    console.log(`📚 Level: ${level.name} (ID: ${level.id})`);
    
    const criteria = await prisma.progressCriteria.findMany({
      where: { levelId: level.id }
    });
    
    console.log(`   Criteria count: ${criteria.length}`);
    
    if (criteria.length > 0) {
      criteria.forEach((c, index) => {
        console.log(`   ${index + 1}. ${c.name}`);
      });
    }
    console.log('');
  }

  // Test A2 specifically (Husain's level)
  console.log('\n🎯 Testing A2 Level Specifically:');
  const a2Level = await prisma.level.findFirst({ where: { name: 'A2' } });
  
  if (a2Level) {
    console.log(`A2 Level ID: ${a2Level.id}`);
    
    const a2Criteria = await prisma.progressCriteria.findMany({
      where: { levelId: a2Level.id }
    });
    
    console.log(`A2 Criteria Count: ${a2Criteria.length}`);
    console.log('\nA2 Criteria:');
    a2Criteria.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name}`);
      console.log(`   ID: ${c.id}`);
      console.log(`   Level ID: ${c.levelId}`);
      console.log(`   Group ID: ${c.groupId || 'null (correct)'}`);
      console.log(`   Active: ${c.isActive}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

testCriteria();