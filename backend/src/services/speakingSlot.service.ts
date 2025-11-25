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
  score: number;
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
  const slot = await prisma.speakingSlot.findUnique({
    where: { id: input.slotId }
  });

  if (!slot) throw new Error('Speaking slot not found');
  if (slot.testSessionId !== input.sessionId) {
    throw new Error('Slot does not belong to this test session');
  }

  const updatedSlot = await prisma.speakingSlot.update({
    where: { id: input.slotId },
    data: {
      status: 'COMPLETED',
      score: new Prisma.Decimal(input.score.toFixed(2)),
      feedback: input.feedback ?? null
    }
  });

  await prisma.testSession.update({
    where: { id: input.sessionId },
    data: {
      status: 'SPEAKING_COMPLETED'
    }
  });

  return updatedSlot;
};

export const listSpeakingSlotsForTeacher = async (teacherId: string) => {
  return prisma.speakingSlot.findMany({
    where: { teacherId },
    orderBy: [
      { slotDate: 'asc' },
      { slotTime: 'asc' }
    ]
  });
};