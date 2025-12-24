
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_EMAILS = [
  's.ahmed.bh@gmail.com',
  '202202231@student.polytechnic.bh'
];

async function seedNotifications() {
  console.log('🌱 Starting notification seeding (JS mode)...');

  for (const email of TARGET_EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`⚠️  User not found for email: ${email}`);
      continue;
    }

    console.log(`found user: ${user.email} (${user.id})`);

    // Create a few sample notifications
    const notifications = [
      {
        title: 'Welcome to the Portal',
        message: 'We are glad to have you here. Please check your profile details.',
        type: 'SYSTEM_WELCOME',
        sentVia: 'SYSTEM'
      },
      {
        title: 'New Announcement: Term 2 Schedule',
        message: 'The schedule for Term 2 has been published. Please review it in the announcements section.',
        type: 'ANNOUNCEMENT',
        linkUrl: '/parent/announcements',
        sentVia: 'EMAIL'
      },
      {
        title: 'Payment Reminder',
        message: 'This is a friendly reminder about the upcoming payment due date.',
        type: 'PAYMENT_REMINDER',
        linkUrl: '/parent/payments',
        sentVia: 'APP'
      }
    ];

    for (const n of notifications) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: n.title,
          message: n.message,
          type: n.type,
          linkUrl: n.linkUrl,
          sentVia: n.sentVia,
          isRead: false,
          sentAt: new Date()
        }
      });
      console.log(`   ✅ Created notification: "${n.title}"`);
    }
  }

  console.log('✅ Seeding complete.');
}

seedNotifications()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
