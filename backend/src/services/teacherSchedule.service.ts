import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTemplateInput {
  teacherId: string;
  dayOfWeek: number; // 0–6
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

interface GenerateSlotsInput {
  teacherId: string;
  startDate: Date;   // date only
  endDate: Date;     // date only
  slotDuration: number; // minutes
}

const toTime = (time: string) =>
  new Date(`1970-01-01T${time.padEnd(5, '0')}:00Z`);

export const createTeacherScheduleTemplate = async (
  data: CreateTemplateInput
) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: data.teacherId }
  });
  if (!teacher) throw new Error('Teacher not found');

  const template = await prisma.teacherScheduleTemplate.create({
    data: {
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      startTime: toTime(data.startTime),
      endTime: toTime(data.endTime),
      isActive: true
    }
  });

  return template;
};

export const listTeacherScheduleTemplates = async (teacherId: string) => {
  return prisma.teacherScheduleTemplate.findMany({
    where: { teacherId, isActive: true },
    orderBy: { dayOfWeek: 'asc' }
  });
};

export const generateSpeakingSlotsFromTemplate = async (
  input: GenerateSlotsInput
) => {
  const templates = await prisma.teacherScheduleTemplate.findMany({
    where: {
      teacherId: input.teacherId,
      isActive: true
    }
  });

  if (templates.length === 0) {
    throw new Error('No active templates for teacher');
  }

  const slotsToCreate: {
    teacherId: string;
    slotDate: Date;
    slotTime: Date;
    durationMinutes: number;
  }[] = [];

  const current = new Date(input.startDate);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(input.endDate);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay(); // 0–6
    const dayTemplates = templates.filter(
      (t) => t.dayOfWeek === dayOfWeek && t.isActive
    );

    for (const t of dayTemplates) {
      // generate slots between startTime and endTime
      const start = new Date(current);
      start.setHours(t.startTime.getUTCHours(), t.startTime.getUTCMinutes(), 0, 0);

      const end = new Date(current);
      end.setHours(t.endTime.getUTCHours(), t.endTime.getUTCMinutes(), 0, 0);

      let cursor = new Date(start);
      while (cursor < end) {
        slotsToCreate.push({
          teacherId: input.teacherId,
          slotDate: new Date(current),
          slotTime: new Date(cursor),
          durationMinutes: input.slotDuration
        });
        cursor = new Date(cursor.getTime() + input.slotDuration * 60 * 1000);
      }
    }

    current.setDate(current.getDate() + 1);
  }

  if (slotsToCreate.length === 0) {
    return { slotsCreated: 0 };
  }

  await prisma.$transaction(
    slotsToCreate.map((s) =>
      prisma.speakingSlot.create({
        data: {
          teacherId: s.teacherId,
          slotDate: s.slotDate,
          slotTime: s.slotTime,
          durationMinutes: s.durationMinutes,
          status: 'AVAILABLE'
        }
      })
    )
  );

  return { slotsCreated: slotsToCreate.length };
};