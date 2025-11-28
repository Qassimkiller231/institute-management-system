// Run this in your backend to check the data
// node debug_teacher_data.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTeacherData() {
  try {
    // Get all teachers
    const teachers = await prisma.teacher.findMany({
      include: {
        groups: {
          include: {
            level: true,
            term: true,
            enrollments: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    console.log('=== TEACHERS ===');
    for (const teacher of teachers) {
      console.log(`\n${teacher.firstName} ${teacher.lastName} (ID: ${teacher.id})`);
      console.log(`  Groups assigned: ${teacher.groups.length}`);
      
      for (const group of teacher.groups) {
        console.log(`  - ${group.name} (ID: ${group.id})`);
        console.log(`    Active enrollments: ${group.enrollments.length}`);
      }
    }

    // Get all sessions for today
    const today = new Date().toISOString().split('T')[0];
    const sessions = await prisma.classSession.findMany({
      where: {
        sessionDate: {
          gte: new Date(today),
          lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        group: {
          include: {
            teacher: true
          }
        }
      }
    });

    console.log(`\n\n=== SESSIONS FOR ${today} ===`);
    console.log(`Total sessions: ${sessions.length}`);
    
    for (const session of sessions) {
      console.log(`\n- ${session.group.name}`);
      console.log(`  Session ID: ${session.id}`);
      console.log(`  Group ID: ${session.group.id}`);
      console.log(`  Teacher: ${session.group.teacher ? `${session.group.teacher.firstName} ${session.group.teacher.lastName}` : 'NONE'}`);
      console.log(`  Teacher ID: ${session.group.teacherId}`);
      console.log(`  Time: ${session.startTime} - ${session.endTime}`);
    }

    // Check for orphaned sessions (no teacher)
    const orphanedSessions = sessions.filter(s => !s.group.teacher);
    if (orphanedSessions.length > 0) {
      console.log(`\n\n⚠️  WARNING: ${orphanedSessions.length} session(s) have NO TEACHER assigned!`);
      orphanedSessions.forEach(s => {
        console.log(`  - ${s.group.name} (Group ID: ${s.group.id})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTeacherData();