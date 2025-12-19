import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAuditLogDto {
    userId?: string;
    action: string;
    tableName?: string;
    recordId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
}

export const createLog = async (data: CreateAuditLogDto) => {
    try {
        // Run in background, don't block the main request
        // We use a detached promise or just await it if we want strong guarantees
        // For now, awaiting to ensure data integrity
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                tableName: data.tableName,
                recordId: data.recordId,
                oldValues: data.oldValues ? (data.oldValues as Prisma.InputJsonValue) : undefined,
                newValues: data.newValues ? (data.newValues as Prisma.InputJsonValue) : undefined,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit failure shouldn't break the main app flow
    }
};

export const getLogs = async (filters: {
    userId?: string;
    action?: string;
    entity?: string; // tableName
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}) => {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.tableName = filters.entity;

    if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
        if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        teacher: { select: { firstName: true, lastName: true } },
                        student: { select: { firstName: true, secondName: true, thirdName: true } },
                        parent: { select: { firstName: true, lastName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.auditLog.count({ where })
    ]);

    return {
        data: logs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export default {
    createLog,
    getLogs
};
