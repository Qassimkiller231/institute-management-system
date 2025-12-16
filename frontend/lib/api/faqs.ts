import { API_URL, getHeaders } from './client';

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
    /**
     * Get all FAQs
     */
    getAll: async (isActive?: boolean): Promise<{ success: boolean; data: FAQ[] }> => {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append('isActive', String(isActive));

        const url = `${API_URL}/faqs${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url, { headers: getHeaders(true) });
        return response.json();
    },

    /**
     * Get FAQ by ID
     */
    getById: async (id: string): Promise<{ success: boolean; data: FAQ }> => {
        const response = await fetch(`${API_URL}/faqs/${id}`, {
            headers: getHeaders(true)
        });
        return response.json();
    },

    /**
     * Create FAQ
     */
    create: async (data: CreateFAQDto): Promise<{ success: boolean; data: FAQ }> => {
        const response = await fetch(`${API_URL}/faqs`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    /**
     * Update FAQ
     */
    update: async (id: string, data: UpdateFAQDto): Promise<{ success: boolean; data: FAQ }> => {
        const response = await fetch(`${API_URL}/faqs/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    /**
     * Delete FAQ
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await fetch(`${API_URL}/faqs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return response.json();
    }
};
