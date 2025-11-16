// src/services/program.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== PROGRAMS ====================

export const createProgram = async (data: {
  name: string;
  code: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
}) => {
  // Check if code already exists
  const existing = await prisma.program.findUnique({
    where: { code: data.code }
  });

  if (existing) {
    throw new Error('Program code already exists');
  }

  return await prisma.program.create({
    data: {
      name: data.name,
      code: data.code,
      description: data.description,
      minAge: data.minAge,
      maxAge: data.maxAge,
      isActive: true
    }
  });
};

export const getAllPrograms = async (filters: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limit,
      include: {
        terms: {
          select: {
            id: true,
            name: true,
            isCurrent: true
          }
        },
        _count: {
          select: {
            terms: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.program.count({ where })
  ]);

  return {
    data: programs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getProgramById = async (id: string) => {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      terms: {
        include: {
          _count: {
            select: {
              groups: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      }
    }
  });

  if (!program) {
    throw new Error('Program not found');
  }

  return program;
};

export const updateProgram = async (id: string, updates: {
  name?: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
  isActive?: boolean;
}) => {
  const existing = await prisma.program.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Program not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.minAge !== undefined) data.minAge = updates.minAge;
  if (updates.maxAge !== undefined) data.maxAge = updates.maxAge;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.program.update({
    where: { id },
    data
  });
};

export const deleteProgram = async (id: string) => {
  const existing = await prisma.program.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Program not found');
  }

  // Soft delete - just deactivate
  return await prisma.program.update({
    where: { id },
    data: { isActive: false }
  });
};

// ==================== TERMS ====================

export const createTerm = async (data: {
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}) => {
  // Validate dates
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  // If this term is current, set all other terms to not current
  if (data.isCurrent) {
    await prisma.term.updateMany({
      where: { programId: data.programId },
      data: { isCurrent: false }
    });
  }

  return await prisma.term.create({
    data: {
      programId: data.programId,
      name: data.name,
      startDate: start,
      endDate: end,
      isCurrent: data.isCurrent || false,
      isActive: true
    }
  });
};

export const getAllTerms = async (filters: {
  programId?: string;
  isCurrent?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.programId) where.programId = filters.programId;
  if (filters.isCurrent !== undefined) where.isCurrent = filters.isCurrent;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [terms, total] = await Promise.all([
    prisma.term.findMany({
      where,
      skip,
      take: limit,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            groups: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    }),
    prisma.term.count({ where })
  ]);

  return {
    data: terms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getTermById = async (id: string) => {
  const term = await prisma.term.findUnique({
    where: { id },
    include: {
      program: true,
      groups: {
        include: {
          level: true,
          teacher: {
            include: {
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        }
      }
    }
  });

  if (!term) {
    throw new Error('Term not found');
  }

  return term;
};

export const updateTerm = async (id: string, updates: {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  isActive?: boolean;
}) => {
  const existing = await prisma.term.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Term not found');
  }

  // If setting this term to current, unset others
  if (updates.isCurrent) {
    await prisma.term.updateMany({
      where: { 
        programId: existing.programId,
        id: { not: id }
      },
      data: { isCurrent: false }
    });
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.startDate) data.startDate = new Date(updates.startDate);
  if (updates.endDate) data.endDate = new Date(updates.endDate);
  if (updates.isCurrent !== undefined) data.isCurrent = updates.isCurrent;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.term.update({
    where: { id },
    data
  });
};

// ==================== LEVELS ====================

export const createLevel = async (data: {
  name: string;
  displayName?: string;
  orderNumber?: number;
  description?: string;
  isMixed?: boolean;
  mixedLevels?: string;
}) => {
  // Check if name already exists
  const existing = await prisma.level.findUnique({
    where: { name: data.name }
  });

  if (existing) {
    throw new Error('Level name already exists');
  }

  return await prisma.level.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      orderNumber: data.orderNumber,
      description: data.description,
      isMixed: data.isMixed || false,
      mixedLevels: data.mixedLevels
    }
  });
};

export const getAllLevels = async () => {
  return await prisma.level.findMany({
    include: {
      _count: {
        select: {
          groups: true
        }
      }
    },
    orderBy: { orderNumber: 'asc' }
  });
};

export const getLevelById = async (id: string) => {
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      groups: {
        include: {
          term: {
            include: {
              program: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        }
      }
    }
  });

  if (!level) {
    throw new Error('Level not found');
  }

  return level;
};

export const updateLevel = async (id: string, updates: {
  displayName?: string;
  description?: string;
  orderNumber?: number;
  isMixed?: boolean;
  mixedLevels?: string;
}) => {
  const existing = await prisma.level.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Level not found');
  }

  const data: any = {};
  if (updates.displayName !== undefined) data.displayName = updates.displayName;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.orderNumber !== undefined) data.orderNumber = updates.orderNumber;
  if (updates.isMixed !== undefined) data.isMixed = updates.isMixed;
  if (updates.mixedLevels !== undefined) data.mixedLevels = updates.mixedLevels;

  return await prisma.level.update({
    where: { id },
    data
  });
};

// ==================== VENUES ====================

export const createVenue = async (data: {
  name: string;
  code: string;
  address?: string;
}) => {
  const existing = await prisma.venue.findUnique({
    where: { code: data.code }
  });

  if (existing) {
    throw new Error('Venue code already exists');
  }

  return await prisma.venue.create({
    data: {
      name: data.name,
      code: data.code,
      address: data.address,
      isActive: true
    }
  });
};

export const getAllVenues = async (filters: {
  isActive?: boolean;
}) => {
  const where: any = {};
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return await prisma.venue.findMany({
    where,
    include: {
      halls: {
        where: { isActive: true }
      },
      _count: {
        select: {
          halls: true,
          groups: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const getVenueById = async (id: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      halls: true,
      groups: {
        include: {
          level: true,
          term: true
        }
      }
    }
  });

  if (!venue) {
    throw new Error('Venue not found');
  }

  return venue;
};

export const updateVenue = async (id: string, updates: {
  name?: string;
  address?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.venue.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Venue not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.address !== undefined) data.address = updates.address;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.venue.update({
    where: { id },
    data
  });
};

// ==================== HALLS ====================

export const createHall = async (data: {
  venueId: string;
  name: string;
  code: string;
  capacity?: number;
  floor?: string;
}) => {
  // Check if code exists for this venue
  const existing = await prisma.hall.findFirst({
    where: {
      venueId: data.venueId,
      code: data.code
    }
  });

  if (existing) {
    throw new Error('Hall code already exists for this venue');
  }

  return await prisma.hall.create({
    data: {
      venueId: data.venueId,
      name: data.name,
      code: data.code,
      capacity: data.capacity,
      floor: data.floor,
      isActive: true
    }
  });
};

export const getAllHalls = async (filters: {
  venueId?: string;
  isActive?: boolean;
}) => {
  const where: any = {};
  if (filters.venueId) where.venueId = filters.venueId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return await prisma.hall.findMany({
    where,
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      _count: {
        select: {
          classSessions: true
        }
      }
    },
    orderBy: [
      { venue: { name: 'asc' } },
      { floor: 'asc' },
      { name: 'asc' }
    ]
  });
};

export const getHallById = async (id: string) => {
  const hall = await prisma.hall.findUnique({
    where: { id },
    include: {
      venue: true,
      classSessions: {
        include: {
          group: {
            include: {
              level: true
            }
          }
        },
        orderBy: { sessionDate: 'desc' },
        take: 10
      }
    }
  });

  if (!hall) {
    throw new Error('Hall not found');
  }

  return hall;
};

export const updateHall = async (id: string, updates: {
  name?: string;
  capacity?: number;
  floor?: string;
  isActive?: boolean;
}) => {
  const existing = await prisma.hall.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Hall not found');
  }

  const data: any = {};
  if (updates.name) data.name = updates.name;
  if (updates.capacity !== undefined) data.capacity = updates.capacity;
  if (updates.floor !== undefined) data.floor = updates.floor;
  if (updates.isActive !== undefined) data.isActive = updates.isActive;

  return await prisma.hall.update({
    where: { id },
    data
  });
};

export const deleteHall = async (id: string) => {
  const existing = await prisma.hall.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Hall not found');
  }

  // Soft delete
  return await prisma.hall.update({
    where: { id },
    data: { isActive: false }
  });
};