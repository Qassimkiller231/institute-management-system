import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

/**
 * Create a new FAQ
 */
export const createFAQ = async (data: CreateFAQDto) => {
    return prisma.fAQ.create({
        data: {
            question: data.question,
            keywords: data.keywords,
            answer: data.answer,
            category: data.category,
            roles: data.roles || ['ALL'],
            isActive: data.isActive !== undefined ? data.isActive : true,
            order: data.order || 0
        }
    });
};

/**
 * Get all FAQs (with optional active filter)
 */
export const getAllFAQs = async (isActive?: boolean) => {
    const where: any = {};
    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    return prisma.fAQ.findMany({
        where,
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ]
    });
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (id: string) => {
    return prisma.fAQ.findUnique({
        where: { id }
    });
};

/**
 * Update FAQ
 */
export const updateFAQ = async (id: string, data: UpdateFAQDto) => {
    return prisma.fAQ.update({
        where: { id },
        data
    });
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (id: string) => {
    return prisma.fAQ.delete({
        where: { id }
    });
};

/**
 * Get FAQ response for chatbot (search by keywords)
 */
export const getFAQResponse = async (message: string, userRole: string): Promise<string | null> => {
    const lowerMessage = message.toLowerCase();

    // Get all active FAQs
    const allFAQs = await prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    for (const faq of allFAQs) {
        // Check if any keyword matches
        const matches = faq.keywords.some((keyword: string) =>
            lowerMessage.includes(keyword.toLowerCase())
        );

        if (matches) {
            // Check if FAQ is role-specific
            if (faq.roles.includes('ALL') || faq.roles.includes(userRole)) {
                return faq.answer;
            }
        }
    }

    return null;
};
