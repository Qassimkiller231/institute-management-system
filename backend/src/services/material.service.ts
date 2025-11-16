import { PrismaClient, Material } from '@prisma/client';

const prisma = new PrismaClient();

type MaterialType = 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER';

interface CreateMaterialInput {
  groupId: string;
  title: string;
  description?: string;
  materialType: MaterialType;
  fileUrl?: string;
  fileSizeKb?: number;
  uploadedBy: string; // Teacher ID
}

interface UpdateMaterialInput {
  title?: string;
  description?: string;
  materialType?: MaterialType;
  fileUrl?: string;
  fileSizeKb?: number;
}

export class MaterialService {
  // Create new material
  async createMaterial(data: CreateMaterialInput): Promise<Material> {
    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: data.groupId }
    });

    if (!group) {
      throw new Error('Group not found');
    }

    if (!group.isActive) {
      throw new Error('Cannot add materials to inactive group');
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: data.uploadedBy }
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Create material
    const material = await prisma.material.create({
      data: {
        groupId: data.groupId,
        title: data.title,
        description: data.description,
        materialType: data.materialType,
        fileUrl: data.fileUrl,
        fileSizeKb: data.fileSizeKb,
        uploadedBy: data.uploadedBy,
        isActive: true
      },
      include: {
        group: {
          select: {
            groupCode: true,
            name: true,
            level: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    return material;
  }

  // Get all materials for a group
  async getGroupMaterials(
    groupId: string,
    filters?: {
      materialType?: MaterialType;
      isActive?: boolean;
    }
  ): Promise<Material[]> {
    const where: any = { groupId };

    if (filters?.materialType) {
      where.materialType = filters.materialType;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return materials;
  }

  // Get all materials with pagination and filters
  async getAllMaterials(filters: {
    groupId?: string;
    materialType?: MaterialType;
    uploadedBy?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Material[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.groupId) where.groupId = filters.groupId;
    if (filters.materialType) where.materialType = filters.materialType;
    if (filters.uploadedBy) where.uploadedBy = filters.uploadedBy;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: limit,
        include: {
          group: {
            select: {
              groupCode: true,
              name: true,
              level: {
                select: {
                  name: true
                }
              },
              term: {
                select: {
                  name: true
                }
              }
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      }),
      prisma.material.count({ where })
    ]);

    return {
      data: materials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get material by ID
  async getMaterialById(id: string): Promise<Material> {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            groupCode: true,
            name: true,
            level: {
              select: {
                name: true,
                displayName: true
              }
            },
            term: {
              select: {
                name: true,
                startDate: true,
                endDate: true
              }
            },
            venue: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    if (!material) {
      throw new Error('Material not found');
    }

    return material;
  }

  // Update material
  async updateMaterial(id: string, data: UpdateMaterialInput): Promise<Material> {
    const existing = await prisma.material.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Material not found');
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        materialType: data.materialType,
        fileUrl: data.fileUrl,
        fileSizeKb: data.fileSizeKb
      },
      include: {
        group: {
          select: {
            groupCode: true,
            name: true
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return material;
  }

  // Soft delete material
  async deleteMaterial(id: string): Promise<void> {
    const existing = await prisma.material.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Material not found');
    }

    await prisma.material.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Hard delete material
  async permanentlyDeleteMaterial(id: string): Promise<void> {
    const existing = await prisma.material.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Material not found');
    }

    await prisma.material.delete({
      where: { id }
    });
  }

  // Get materials by type
  async getMaterialsByType(materialType: MaterialType): Promise<Material[]> {
    const materials = await prisma.material.findMany({
      where: {
        materialType,
        isActive: true
      },
      include: {
        group: {
          select: {
            groupCode: true,
            name: true,
            level: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return materials;
  }

  // Get materials uploaded by a teacher
  async getTeacherMaterials(teacherId: string): Promise<Material[]> {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const materials = await prisma.material.findMany({
      where: {
        uploadedBy: teacherId,
        isActive: true
      },
      include: {
        group: {
          select: {
            groupCode: true,
            name: true,
            level: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return materials;
  }

  // Get material statistics for a group
  async getGroupMaterialStats(groupId: string): Promise<{
    totalMaterials: number;
    byType: {
      type: string;
      count: number;
    }[];
    totalSizeKb: number;
  }> {
    const materials = await prisma.material.findMany({
      where: {
        groupId,
        isActive: true
      },
      select: {
        materialType: true,
        fileSizeKb: true
      }
    });

    const byType = materials.reduce((acc, material) => {
      const existing = acc.find(item => item.type === material.materialType);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: material.materialType, count: 1 });
      }
      return acc;
    }, [] as { type: string; count: number }[]);

    const totalSizeKb = materials.reduce((sum, material) => {
      return sum + (material.fileSizeKb || 0);
    }, 0);

    return {
      totalMaterials: materials.length,
      byType,
      totalSizeKb
    };
  }
}

export default new MaterialService();
