import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding progress criteria...');

  const criteria = [
    // A1 Level
    { level: 'A1', name: 'Can introduce themselves and others', orderNumber: 1 },
    { level: 'A1', name: 'Can interact in a simple way', orderNumber: 2 },
    { level: 'A1', name: 'Knows basic vocabulary and phrases', orderNumber: 3 },

    // A2 Level
    { level: 'A2', name: 'Can understand frequently used expressions', orderNumber: 1 },
    { level: 'A2', name: 'Can communicate in simple tasks', orderNumber: 2 },
    { level: 'A2', name: 'Can describe aspects of background', orderNumber: 3 },
    { level: 'A2', name: 'Can use present tenses correctly', orderNumber: 4 },
    { level: 'A2', name: 'Can use past simple tense', orderNumber: 5 },

    // B1 Level
    { level: 'B1', name: 'Can deal with travel situations', orderNumber: 1 },
    { level: 'B1', name: 'Can produce simple connected text', orderNumber: 2 },
    { level: 'B1', name: 'Can describe experiences and events', orderNumber: 3 },
  ];

  for (const c of criteria) {
    const level = await prisma.level.findFirst({ where: { name: c.level } });
    
    if (level) {
      await prisma.progressCriteria.create({
        data: {
          levelId: level.id,
          name: c.name,
          orderNumber: c.orderNumber,
          isActive: true,
        },
      });
      console.log(`✅ ${c.level}: ${c.name}`);
    }
  }

  console.log('\n✅ Done! Created 11 progress criteria');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });``