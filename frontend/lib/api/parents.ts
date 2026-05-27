import { apiFetch } from './client';

export interface Parent {
    id: string;
    firstName: string;
    lastName: string;
    user: {
        id: string;
        email?: string;
        phone?: string;
        isActive: boolean;
        lastLogin?: string;
    };
    phones?: Array<{
        id: string;
        phoneNumber: string;
        countryCode?: string;
        isPrimary: boolean;
    }>;
    parentStudentLinks?: Array<{
        id: string;
        relationship?: string;
        student: {
            id: string;
            firstName: string;
            secondName?: string;
            thirdName?: string;
            cpr: string;
            email?: string;
        };
    }>;
    _count?: {
        parentStudentLinks: number;
    };
    createdAt: string;
}

export interface CreateParentDto {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
}

export interface UpdateParentDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
}

export interface LinkStudentDto {
    studentId: string;
    relationship?: string;
}

export const parentsAPI = {
    getAll: (filters?: { isActive?: boolean; search?: string; page?: number; limit?: number }) => {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));
        const qs = params.toString();
        return apiFetch(`/parents${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string) => apiFetch(`/parents/${id}`),

    create: (data: CreateParentDto) =>
        apiFetch('/parents', { method: 'POST', body: data }),

    update: (id: string, data: UpdateParentDto) =>
        apiFetch(`/parents/${id}`, { method: 'PUT', body: data }),

    delete: (id: string) => apiFetch(`/parents/${id}`, { method: 'DELETE' }),

    linkStudent: (parentId: string, data: LinkStudentDto) =>
        apiFetch(`/parents/${parentId}/link-student`, { method: 'POST', body: data }),

    search: (query: string, limit: number = 20) =>
        apiFetch(`/parents/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};
