import { apiFetch } from './client';

export interface FAQ {
    id: string;
    question: string;
    keywords: string[];
    answer: string;
    category?: string;
    isActive: boolean;
    roles: string[];
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFAQDto {
    question: string;
    keywords: string[];
    answer: string;
    category?: string;
    roles?: string[];
    isActive?: boolean;
    order?: number;
}

export interface UpdateFAQDto {
    question?: string;
    keywords?: string[];
    answer?: string;
    category?: string;
    roles?: string[];
    isActive?: boolean;
    order?: number;
}

export const faqsAPI = {
    getAll: (isActive?: boolean) => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append('isActive', String(isActive));
        const qs = params.toString();
        return apiFetch<{ success: boolean; data: FAQ[] }>(
            `/faqs${qs ? `?${qs}` : ''}`,
            { throwOnError: false }
        );
    },

    getById: (id: string) =>
        apiFetch<{ success: boolean; data: FAQ }>(`/faqs/${id}`, { throwOnError: false }),

    create: (data: CreateFAQDto) =>
        apiFetch<{ success: boolean; data: FAQ }>('/faqs', {
            method: 'POST',
            body: data,
            throwOnError: false,
        }),

    update: (id: string, data: UpdateFAQDto) =>
        apiFetch<{ success: boolean; data: FAQ }>(`/faqs/${id}`, {
            method: 'PUT',
            body: data,
            throwOnError: false,
        }),

    delete: (id: string) =>
        apiFetch<{ success: boolean; message: string }>(`/faqs/${id}`, {
            method: 'DELETE',
            throwOnError: false,
        }),
};
