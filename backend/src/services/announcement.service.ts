import { PrismaClient } from '@prisma/client';
import * as emailService from './notifications/email.service';
import * as smsService from './notifications/sms.service';

const prisma = new PrismaClient();

/**
 * Create announcement
 */
export const createAnnouncement = async (data: {
  groupId?: string;
  termId?: string;
  title: string;
  content: string;
  targetAudience: string;
  publishedBy: string;
  scheduledFor?: Date;
  publishNow?: boolean;
}) => {
  const announcement = await prisma.announcement.create({
    data: {
      groupId: data.groupId,
      termId: data.termId,
      title: data.title,
      content: data.content,
      targetAudience: data.targetAudience,
      publishedBy: data.publishedBy,
      scheduledFor: data.scheduledFor,
      isPublished: data.publishNow || false,
      publishedAt: data.publishNow ? new Date() : null
    },
    include: {
      group: {
        include: {
          level: true,
          teacher: true
        }
      },
      term: true,
    }
  });

  // If publish now, send notifications
  if (data.publishNow) {
    await sendAnnouncementNotifications(announcement);
  }

  return announcement;
};

/**
 * Get all announcements with filters
 */
export const getAnnouncements = async (filters: {
  groupId?: string;
  termId?: string;
  isPublished?: boolean;
  targetAudience?: string;
  userId?: string;
  userRole?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.groupId) where.groupId = filters.groupId;
  if (filters.termId) where.termId = filters.termId;
  if (filters.isPublished !== undefined) where.isPublished = filters.isPublished;
  if (filters.targetAudience) where.targetAudience = filters.targetAudience;

  console.log('🔍 [ANNOUNCEMENTS] Filter debug:', {
    userRole: filters.userRole,
    userId: filters.userId,
    isStudent: filters.userRole === 'STUDENT'
  });

  // If user is student, only show announcements for their groups
  if (filters.userRole === 'STUDENT' && filters.userId) {
    console.log('🔍 [ANNOUNCEMENTS] User is STUDENT, fetching enrollments...');

    const student = await prisma.student.findUnique({
      where: { userId: filters.userId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    console.log('🔍 [ANNOUNCEMENTS] Student found:', !!student);
    console.log('🔍 [ANNOUNCEMENTS] Active enrollments:', student?.enrollments.length || 0);

    if (student) {
      const groupIds = student.enrollments.map(e => e.groupId);
      console.log('🔍 [ANNOUNCEMENTS] Group IDs:', groupIds);

      // Show announcements for student's groups OR all institute-wide announcements
      where.OR = [
        { groupId: { in: groupIds } },
        { targetAudience: 'ALL' }, // Institute-wide announcements
        { targetAudience: 'STUDENT' } // General student announcements (SINGULAR to match DB enum)
      ];

      console.log('🔍 [ANNOUNCEMENTS] Where clause with OR:', JSON.stringify(where, null, 2));
    } else {
      console.log('⚠️  [ANNOUNCEMENTS] Student not found, showing only ALL announcements');
      // If student not found, only show ALL announcements
      where.targetAudience = 'ALL';
    }
  } else if (filters.userRole === 'TEACHER' && filters.userId) {
    console.log('🔍 [ANNOUNCEMENTS] User is TEACHER, fetching groups...');

    const teacher = await prisma.teacher.findUnique({
      where: { userId: filters.userId },
      include: {
        groups: {
          where: { isActive: true }
        }
      }
    });

    if (teacher) {
      const groupIds = teacher.groups.map(g => g.id);

      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: 'TEACHERS' }, // Singular or Plural depending on enum, assuming TEACHERS based on notification logic
        { groupId: { in: groupIds } },
        { publishedBy: filters.userId } // Own announcements
      ];
    } else {
      // Fallback if teacher record issue
      where.OR = [
        { targetAudience: 'ALL' },
        { targetAudience: 'TEACHERS' },
        { publishedBy: filters.userId }
      ];
    }
  } else if (filters.userRole === 'PARENT' && filters.userId) {
    console.log('🔍 [ANNOUNCEMENTS] User is PARENT');
    where.OR = [
      { targetAudience: 'ALL' },
      { targetAudience: 'PARENTS' }
    ];
  } else {
    console.log('🔍 [ANNOUNCEMENTS] Not a student/teacher or no userId, applying standard filters');
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          include: {
            level: true,
            teacher: true
          }
        },
        term: true,
      }
    }),
    prisma.announcement.count({ where })
  ]);

  return {
    data: announcements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get announcement by ID
 */
export const getAnnouncementById = async (id: string) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      group: {
        include: {
          level: true,
          teacher: true,
          enrollments: {
            include: {
              student: {
                include: { user: true }
              }
            }
          }
        }
      },
      term: true,
    }
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return announcement;
};

/**
 * Update announcement
 */
export const updateAnnouncement = async (id: string, updates: {
  title?: string;
  content?: string;
  targetAudience?: string;
  scheduledFor?: Date;
  isPublished?: boolean;
}) => {
  const existing = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error('Announcement not found');
  }

  const data: any = {};
  if (updates.title) data.title = updates.title;
  if (updates.content) data.content = updates.content;
  if (updates.targetAudience) data.targetAudience = updates.targetAudience;
  if (updates.scheduledFor) data.scheduledFor = updates.scheduledFor;

  // If publishing now and wasn't published before
  if (updates.isPublished && !existing.isPublished) {
    data.isPublished = true;
    data.publishedAt = new Date();
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data,
    include: {
      group: {
        include: {
          level: true,
          teacher: true
        }
      },
      term: true
    }
  });

  // Send notifications if newly published
  if (updates.isPublished && !existing.isPublished) {
    await sendAnnouncementNotifications(announcement);
  }

  return announcement;
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (id: string) => {
  const existing = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error('Announcement not found');
  }

  await prisma.announcement.delete({
    where: { id }
  });
};

/**
 * Publish scheduled announcements
 */
export const publishScheduledAnnouncements = async () => {
  console.log('\n📅 ===== PUBLISHING SCHEDULED ANNOUNCEMENTS =====');
  const now = new Date();
  console.log(`📅 Current time: ${now.toISOString()}`);

  // Find announcements scheduled for now or earlier
  const scheduledAnnouncements = await prisma.announcement.findMany({
    where: {
      isPublished: false,
      scheduledFor: { lte: now }
    },
    include: {
      group: {
        include: {
          level: true,
          teacher: true
        }
      },
      term: true
    }
  });

  console.log(`📅 Found ${scheduledAnnouncements.length} announcement(s) ready to publish`);

  for (const announcement of scheduledAnnouncements) {
    console.log(`\n📢 Publishing: "${announcement.title}"`);

    // Publish it
    await prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    // Send notifications
    await sendAnnouncementNotifications(announcement);
  }

  console.log(`\n✅ Published ${scheduledAnnouncements.length} announcement(s)`);
  console.log('📅 ===== SCHEDULED ANNOUNCEMENTS COMPLETE =====\n');

  return scheduledAnnouncements.length;
};

/**
 * Send announcement notifications to recipients
 */
async function sendAnnouncementNotifications(announcement: any) {
  console.log('\n📢 ===== SENDING ANNOUNCEMENT NOTIFICATIONS =====');
  console.log(`📢 Title: ${announcement.title}`);
  console.log(`📢 Target: ${announcement.targetAudience}`);

  let recipients: Array<{
    userId: string;
    email: string | null;
    phone: string | null
  }> = [];

  // Determine recipients based on target audience
  if (announcement.targetAudience === 'GROUP_SPECIFIC' && announcement.groupId) {
    // Get all students in the group
    const enrollments = await prisma.enrollment.findMany({
      where: {
        groupId: announcement.groupId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          include: { user: true }
        }
      }
    });

    recipients = enrollments.map(e => ({
      userId: e.student.userId,
      email: e.student.user.email,
      phone: e.student.user.phone
    }));
  } else if (announcement.targetAudience === 'STUDENTS') {
    // Get all active students
    const students = await prisma.student.findMany({
      where: { isActive: true },
      include: { user: true }
    });

    recipients = students.map(s => ({
      userId: s.userId,
      email: s.user.email,
      phone: s.user.phone
    }));
  } else if (announcement.targetAudience === 'TEACHERS') {
    // Get all active teachers
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      include: { user: true }
    });

    recipients = teachers.map(t => ({
      userId: t.userId,
      email: t.user.email,
      phone: t.user.phone
    }));
  } else if (announcement.targetAudience === 'PARENTS') {
    // Get all parents
    const parents = await prisma.parent.findMany({
      include: { user: true }
    });

    recipients = parents.map(p => ({
      userId: p.userId,
      email: p.user.email,
      phone: p.user.phone
    }));
  } else if (announcement.targetAudience === 'ALL') {
    // Get everyone
    const users = await prisma.user.findMany({
      where: { isActive: true }
    });

    recipients = users.map(u => ({
      userId: u.id,
      email: u.email,
      phone: u.phone
    }));
  }

  console.log(`📢 Found ${recipients.length} potential recipient(s)`);

  // **TEST MODE: Limit to 1 recipient**
  const TEST_LIMIT = 1;
  if (recipients.length > TEST_LIMIT) {
    console.log(`⚠️  TEST MODE: Limiting to ${TEST_LIMIT} recipient(s)`);
    recipients = recipients.slice(0, TEST_LIMIT);
  }

  // Send notifications
  const emailMessage = `
${announcement.title}

${announcement.content}

${announcement.group ? `Group: ${announcement.group.name || announcement.group.groupCode}` : ''}
${announcement.group?.level ? `Level: ${announcement.group.level.name}` : ''}

Best regards,
The Function Institute
  `.trim();

  const smsMessage = `🆕 NEW ANNOUNCEMENT: ${announcement.title} - ${announcement.content.substring(0, 80)}... View in app. -Function Institute`;

  let sentCount = 0;

  for (const recipient of recipients) {
    console.log(`\n📤 Sending to recipient ${sentCount + 1}/${recipients.length}`);
    // Create system notification
    try {
      await prisma.notification.create({
        data: {
          userId: recipient.userId,
          type: 'ANNOUNCEMENT',
          title: announcement.title,
          message: announcement.content,
          linkUrl: `/announcements/${announcement.id}`,
          sentVia: 'SYSTEM',
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    // Send email
    if (recipient.email) {
      try {
        await emailService.sendEmail({
          to: recipient.email,
          subject: `🆕 New Announcement: ${announcement.title} - Function Institute`,
          htmlBody: emailMessage,
          textBody: announcement.content
        });
        console.log(`   ✅ Email sent to ${recipient.email}`);
      } catch (error) {
        console.error(`   ❌ Email failed:`, error);
      }
    }

    // Send SMS (for all announcements in dev mode, GROUP_SPECIFIC in production)
    const isDev = process.env.NODE_ENV !== 'production';
    if (recipient.phone && (announcement.targetAudience === 'GROUP_SPECIFIC' || isDev)) {
      try {
        await smsService.sendSMS({
          to: recipient.phone,
          message: smsMessage
        });
        console.log(`   ✅ SMS sent to ${recipient.phone}`);
      } catch (error) {
        console.error(`   ❌ SMS failed:`, error);
      }
    }

    sentCount++;
  }

  console.log(`\n✅ Sent notifications to ${sentCount} recipient(s)`);
  console.log('📢 ===== ANNOUNCEMENT NOTIFICATIONS COMPLETE =====\n');
}