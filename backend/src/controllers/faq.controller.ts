import { Request, Response } from 'express';
import * as faqService from '../services/faq.service';

/**
 * Create FAQ
 */
export const createFAQ = async (req: Request, res: Response) => {
    try {
        const faq = await faqService.createFAQ(req.body);
        res.status(201).json({ success: true, data: faq });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all FAQs
 */
export const getAllFAQs = async (req: Request, res: Response) => {
    try {
        const isActive = req.query.isActive === 'true' ? true :
            req.query.isActive === 'false' ? false : undefined;

        const faqs = await faqService.getAllFAQs(isActive);
        res.json({ success: true, data: faqs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (req: Request, res: Response) => {
    try {
        const faq = await faqService.getFAQById(req.params.id);
        if (!faq) {
            return res.status(404).json({ success: false, message: 'FAQ not found' });
        }
        res.json({ success: true, data: faq });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (req: Request, res: Response) => {
    try {
        const faq = await faqService.updateFAQ(req.params.id, req.body);
        res.json({ success: true, data: faq });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (req: Request, res: Response) => {
    try {
        await faqService.deleteFAQ(req.params.id);
        res.json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
