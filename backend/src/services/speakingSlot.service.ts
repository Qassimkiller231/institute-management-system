import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface AvailableSlotsFilter {
  startDate?: Date;
  endDate?: Date;
}

interface BookSpeakingSlotInput {
  sessionId: string;
  slotId: string;
  studentId: string;
}

interface SubmitSpeakingResultInput {
  sessionId: string;
  slotId: string;
  mcqLevel: string;      // A1, A2, B1, B2, C1, C2
  speakingLevel: string;  // A1, A2, B1, B2, C1, C2
  finalLevel: string;     // A1, A2, B1, B2, C1, C2
  feedback?: string;
}

export const getAvailableSpeakingSlots = async (
  filters: AvailableSlotsFilter
) => {
  const where: Prisma.SpeakingSlotWhereInput = {
    status: 'AVAILABLE'
  };

  if (filters.startDate || filters.endDate) {
    where.slotDate = {};
    if (filters.startDate) {
      where.slotDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.slotDate.lte = filters.endDate;
    }
  }

  const slots = await prisma.speakingSlot.findMany({
    where,
    include: {
      teacher: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    },
    orderBy: [
      { slotDate: 'asc' },
      { slotTime: 'asc' }
    ]
  });

  return slots.map((s) => {
    // Calculate end time from slotTime + durationMinutes
    const startDateTime = new Date(s.slotTime);
    const endDateTime = new Date(startDateTime.getTime() + s.durationMinutes * 60000);
    
    // Format times as HH:MM:SS for compatibility
    const startTime = startDateTime.toTimeString().split(' ')[0];
    const endTime = endDateTime.toTimeString().split(' ')[0];
    
    return {
      id: s.id,
      teacherId: s.teacherId,
      slotDate: s.slotDate,
      startTime: startTime,
      endTime: endTime,
      durationMinutes: s.durationMinutes,
      status: s.status,
      teacher: {
        id: s.teacher.id,
        firstName: s.teacher.firstName,    // ✅ Add these
        lastName: s.teacher.lastName,
        user: {
          email: s.teacher.user.email
        }
      }
    };
  });
};

export const bookSpeakingSlot = async (input: BookSpeakingSlotInput) => {
  const [slot, session, student] = await Promise.all([
    prisma.speakingSlot.findUnique({ where: { id: input.slotId } }),
    prisma.testSession.findUnique({ where: { id: input.sessionId } }),
    prisma.student.findUnique({ where: { id: input.studentId } })
  ]);

  if (!slot) throw new Error('Speaking slot not found');
  if (slot.status !== 'AVAILABLE') throw new Error('Slot not available');
  const existingBooking = await prisma.speakingSlot.findFirst({
    where: {
      testSessionId: input.sessionId,
      studentId: input.studentId,
      status: { in: ['BOOKED', 'COMPLETED'] }
    }
  });

  if (existingBooking) {
    throw new Error('You have already booked a speaking test for this session');
  }
  if (!session) throw new Error('Test session not found');
  if (!student) throw new Error('Student not found');

  const updatedSlot = await prisma.speakingSlot.update({
    where: { id: input.slotId },
    data: {
      status: 'BOOKED',
      studentId: input.studentId,
      testSessionId: input.sessionId
    }
  });

  // reflect in session status
  await prisma.testSession.update({
    where: { id: input.sessionId },
    data: { status: 'SPEAKING_SCHEDULED' }
  });

  return updatedSlot;
};

export const submitSpeakingResult = async (
  input: SubmitSpeakingResultInput
) => {
  // Validate levels
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  if (!validLevels.includes(input.mcqLevel)) {
    throw new Error('Invalid MCQ level. Must be A1, A2, B1, B2, C1, or C2');
  }
  
  if (!validLevels.includes(input.speakingLevel)) {
    throw new Error('Invalid speaking level. Must be A1, A2, B1, B2, C1, or C2');
  }
  
  if (!validLevels.includes(input.finalLevel)) {
    throw new Error('Invalid final level. Must be A1, A2, B1, B2, C1, or C2');
  }

  const slot = await prisma.speakingSlot.findUnique({
    where: { id: input.slotId }
  });

  if (!slot) throw new Error('Speaking slot not found');
  if (slot.testSessionId !== input.sessionId) {
    throw new Error('Slot does not belong to this test session');
  }

  // Use transaction to update multiple records atomically
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update speaking slot with levels
    const updatedSlot = await tx.speakingSlot.update({
      where: { id: input.slotId },
      data: {
        status: 'COMPLETED',
        mcqLevel: input.mcqLevel,
        speakingLevel: input.speakingLevel,
        finalLevel: input.finalLevel,
        feedback: input.feedback ?? null
      }
    });

    // 2. Update test session status
    await tx.testSession.update({
      where: { id: input.sessionId },
      data: { status: 'COMPLETED' }
    });

    // 3. Update student's current level with final level
    if (slot.studentId) {
      await tx.student.update({
        where: { id: slot.studentId },
        data: {
          currentLevel: input.finalLevel
        }
      });
    }

    return updatedSlot;
  });

  return result;
};

export const listSpeakingSlotsForTeacher = async (teacherId: string) => {
  return prisma.speakingSlot.findMany({
    where: { teacherId },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              phone: true
            }
          }
        }
      },
      testSession: {
        select: {
          id: true,
          score: true,
          status: true
        }
      }
    },
    orderBy: [
      { slotDate: 'asc' },
      { slotTime: 'asc' }
    ]
  });
};
// speakingSlot_service.ts - CORRECTED VERSION

/**
 * Cancel a booked speaking slot
 * Fetches studentId from session for validation
 */
export const cancelSpeakingSlot = async (
  slotId: string,
  sessionId: string
) => {
  // Get the test session to find the studentId
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw new Error('Test session not found');
  }

  const studentId = session.studentId;

  // Get the speaking slot
  const slot = await prisma.speakingSlot.findUnique({
    where: { id: slotId }
  });

  if (!slot) {
    throw new Error('Speaking slot not found');
  }

  // Verify slot belongs to this student
  if (slot.studentId !== studentId) {
    throw new Error('Access denied. This slot does not belong to you.');
  }

  // Cancel the speaking slot - make it available again
  const updatedSlot = await prisma.speakingSlot.update({
    where: { id: slotId },
    data: {
      studentId: null,
      testSessionId: null,
      status: 'AVAILABLE',
      score: null,
      feedback: null
    }
  });

  // Update test session status back to MCQ_COMPLETED
  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: 'MCQ_COMPLETED'
    }
  });

  return updatedSlot;
};