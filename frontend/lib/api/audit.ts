import { apiFetch } from './client';

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    tableName?: string;
    recordId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user?: {
        email: string;
        role: string;
        studentId?: string;
        teacherId?: string;
        parentId?: string;
    };
}

export interface GetAuditLogsParams {
    userId?: string;
    action?: string;
    entity?: string; // tableName
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface AuditLogResponse {
    data: AuditLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface AuditStats {
    actionCounts: { action: string; count: number }[];
    dailyActivity: { date: string; count: number }[];
}

export const auditApi = {
    getLogs: (params: GetAuditLogsParams) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.action) queryParams.append('action', params.action);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.entity) queryParams.append('entity', params.entity);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);

        return apiFetch<AuditLogResponse>(`/audit?${queryParams.toString()}`);
    },

    getStats: () => apiFetch<AuditStats>('/audit/stats'),
};
