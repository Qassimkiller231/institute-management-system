// src/services/enrollment.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create new enrollment (enroll student in group)
 */
export const createEnrollment = async (data: {
  studentId: string;
  groupId: string;
  enrollmentDate?: string;
  status?: string; // ✅ ADDED THIS
}) => {
  

  // 1. Validate studentId exists and is active
  const student = await prisma.student.findUnique({
    where: { id: data.studentId, isActive: true },
  });
  if (!student) {
    throw new Error("Student not found or inactive");
  }

  // 2. Validate groupId exists and is active
  const group = await prisma.group.findUnique({
    where: { id: data.groupId, isActive: true },
    include: {
      _count: {
        select: {
          enrollments: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  });
  if (!group) {
    throw new Error("Group not found or inactive");
  }

  // 3. Check for duplicate ACTIVE enrollment
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: data.studentId,
      groupId: data.groupId,
      status: "ACTIVE",
    },
  });
  if (existingEnrollment) {
    throw new Error("Student is already enrolled in this group");
  }

  // 4. Check group capacity
  const activeEnrollments = await prisma.enrollment.count({
    where: {
      groupId: data.groupId,
      status: "ACTIVE",
    },
  });
  if (activeEnrollments >= group.capacity) {
    throw new Error(`Group is at full capacity (${group.capacity} students)`);
  }

  // 5. Validate status enum
  const validStatuses = ["ACTIVE", "COMPLETED", "WITHDRAWN"];
  if (data.status && !validStatuses.includes(data.status)) {
    throw new Error("Invalid enrollment status");
  }
  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: data.studentId,
      groupId: data.groupId,
      enrollmentDate: data.enrollmentDate
        ? new Date(data.enrollmentDate)
        : new Date(),
      status: "ACTIVE",
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      },
      group: {
        include: {
          level: true,
          term: {
            include: {
              program: true,
            },
          },
          venue: true,
        },
      },
    },
  });

  return enrollment;
};

/**
 * Get all enrollments with filters and pagination
 */
export const getAllEnrollments = async (filters: {
  status?: string;
  studentId?: string;
  groupId?: string;
  termId?: string;
  levelId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.status) where.status = filters.status;
  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.groupId) where.groupId = filters.groupId;
  if (filters.termId) where.group = { termId: filters.termId };
  if (filters.levelId)
    where.group = { ...where.group, levelId: filters.levelId };

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            thirdName: true,
            cpr: true,
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            groupCode: true,
            name: true,
            level: {
              select: {
                name: true,
                displayName: true,
              },
            },
            term: {
              select: {
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        paymentPlan: {
          select: {
            id: true,
            totalAmount: true,
            finalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { enrollmentDate: "desc" },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    data: enrollments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get enrollment by ID with full details
 */
export const getEnrollmentById = async (id: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
          phones: {
            where: { isActive: true },
          },
          parentStudentLinks: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      group: {
        include: {
          level: true,
          term: {
            include: {
              program: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          venue: true,
        },
      },
      paymentPlan: {
        include: {
          installments: {
            orderBy: { installmentNumber: "asc" },
          },
        },
      },
      attendance: {
        include: {
          classSession: {
            select: {
              sessionDate: true,
              sessionNumber: true,
            },
          },
        },
        orderBy: {
          markedAt: "desc",
        },
        take: 10,
      },
      _count: {
        select: {
          attendance: true,
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  return enrollment;
};

/**
 * Update enrollment status
 */
export const updateEnrollmentStatus = async (id: string, status: string) => {
  const validStatuses = ["ACTIVE", "COMPLETED", "WITHDRAWN"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status. Must be ACTIVE, COMPLETED, or WITHDRAWN");
  }

  const existing = await prisma.enrollment.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Enrollment not found");
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status },
    include: {
      student: {
        select: {
          firstName: true,
          secondName: true,
          thirdName: true,
        },
      },
      group: {
        select: {
          groupCode: true,
          name: true,
        },
      },
    },
  });

  return enrollment;
};

/**
 * Withdraw student from group
 */
export const withdrawEnrollment = async (
  id: string,
  data: {
    withdrawalDate?: string;
    withdrawalReason?: string;
  }
) => {
  const existing = await prisma.enrollment.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Enrollment not found");
  }

  if (existing.status === "WITHDRAWN") {
    throw new Error("Student is already withdrawn from this group");
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      status: "WITHDRAWN",
      withdrawalDate: data.withdrawalDate
        ? new Date(data.withdrawalDate)
        : new Date(),
      withdrawalReason: data.withdrawalReason,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          secondName: true,
          thirdName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      group: {
        select: {
          groupCode: true,
          name: true,
        },
      },
    },
  });

  return enrollment;
};

/**
 * Get all enrollments for a specific student
 */
export const getStudentEnrollments = async (
  studentId: string,
  filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }
) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = { studentId };
  if (filters?.status) where.status = filters.status;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: {
        group: {
          include: {
            level: {
              select: {
                name: true,
                displayName: true,
              },
            },
            term: {
              select: {
                name: true,
                startDate: true,
                endDate: true,
                isCurrent: true,
              },
            },
            venue: {
              select: {
                name: true,
              },
            },
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        paymentPlan: {
          select: {
            totalAmount: true,
            finalAmount: true,
            status: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: { enrollmentDate: "desc" },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    data: enrollments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all enrollments for a specific group
 */
export const getGroupEnrollments = async (
  groupId: string,
  filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }
) => {
  const page = filters?.page || 1;
  const limit = filters?.limit || 100;
  const skip = (page - 1) * limit;

  const where: any = { groupId };
  if (filters?.status) where.status = filters.status;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            thirdName: true,
            cpr: true,
            gender: true,
            dateOfBirth: true,
            email: true,
            user: {
              select: {
                phone: true,
              },
            },
            phones: {
              where: { isPrimary: true, isActive: true },
              select: {
                phoneNumber: true,
              },
              take: 1,
            },
          },
        },
        paymentPlan: {
          select: {
            totalAmount: true,
            finalAmount: true,
            status: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: [
        { student: { firstName: "asc" } },
        { student: { secondName: "asc" } },
      ],
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    data: enrollments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get enrollment statistics for a group
 */
export const getGroupEnrollmentStats = async (groupId: string) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      capacity: true,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const stats = await prisma.enrollment.groupBy({
    by: ["status"],
    where: { groupId },
    _count: true,
  });

  const activeCount = stats.find((s) => s.status === "ACTIVE")?._count || 0;
  const completedCount =
    stats.find((s) => s.status === "COMPLETED")?._count || 0;
  const withdrawnCount =
    stats.find((s) => s.status === "WITHDRAWN")?._count || 0;
  const totalEnrollments = activeCount + completedCount + withdrawnCount;

  return {
    capacity: group.capacity,
    activeEnrollments: activeCount,
    completedEnrollments: completedCount,
    withdrawnEnrollments: withdrawnCount,
    totalEnrollments,
    availableSpots: group.capacity - activeCount,
    utilizationRate:
      group.capacity > 0
        ? ((activeCount / group.capacity) * 100).toFixed(2)
        : 0,
  };
};
