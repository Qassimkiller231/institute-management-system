import { API_URL, getHeaders } from './client';

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
    // Get all parents
    getAll: async (filters?: {
        isActive?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));

        const queryString = params.toString();
        const url = `${API_URL}/parents${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to fetch parents');
        return res.json();
    },

    // Get by ID
    getById: async (id: string) => {
        const res = await fetch(`${API_URL}/parents/${id}`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to fetch parent');
        return res.json();
    },

    // Create parent
    create: async (data: CreateParentDto) => {
        const res = await fetch(`${API_URL}/parents`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create parent');
        }
        return res.json();
    },

    // Update parent
    update: async (id: string, data: UpdateParentDto) => {
        const res = await fetch(`${API_URL}/parents/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update parent');
        }
        return res.json();
    },

    // Delete parent (soft delete)
    delete: async (id: string) => {
        const res = await fetch(`${API_URL}/parents/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to delete parent');
        return res.json();
    },

    // Link student to parent
    linkStudent: async (parentId: string, data: LinkStudentDto) => {
        const res = await fetch(`${API_URL}/parents/${parentId}/link-student`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to link student');
        }
        return res.json();
    },

    // Search parents
    search: async (query: string, limit: number = 20) => {
        const res = await fetch(`${API_URL}/parents/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to search parents');
        return res.json();
    }
};
