import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import auditService from '../services/audit.service';

export class AuditController {
    // Get all logs (Admin only)
    async getLogs(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Extract filters from query
            const { userId, action, entity, startDate, endDate, page, limit } = req.query;

            const result = await auditService.getLogs({
                userId: userId as string,
                action: action as string,
                entity: entity as string,
                startDate: startDate as string,
                endDate: endDate as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 50
            });

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            console.error('Audit getLogs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve audit logs'
            });
        }
    }

    // Get specific stats (optional future enhancement)
    async getStats(req: AuthRequest, res: Response): Promise<void> {
        // TODO: Implement statistics if needed (e.g., logins per day)
        res.status(501).json({ message: 'Not implemented' });
    }
}

export default new AuditController();
