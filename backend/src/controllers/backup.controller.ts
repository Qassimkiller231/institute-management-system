import { Request, Response } from 'express';
import { backupService } from '../services/backup.service';

export const backupController = {
    // Get Configuration
    getConfig: (req: Request, res: Response) => {
        try {
            const config = backupService.getConfig();
            res.json({
                success: true,
                data: config
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update Configuration
    updateConfig: (req: Request, res: Response) => {
        try {
            const { enabled, schedule } = req.body;
            const config = backupService.updateConfig({ enabled, schedule });
            res.json({
                success: true,
                message: 'Backup configuration updated successfully',
                data: config
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Create Manual Backup
    createBackup: async (req: Request, res: Response) => {
        try {
            const result = await backupService.createBackup('manual');
            res.json({
                success: true,
                message: 'Backup created successfully',
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // List All Backups
    listBackups: async (req: Request, res: Response) => {
        try {
            const backups = await backupService.listBackups();
            res.json({
                success: true,
                data: backups
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Download Backup
    downloadBackup: (req: Request, res: Response) => {
        try {
            const { filename } = req.params;
            const filepath = backupService.getBackupPath(filename);
            res.download(filepath, filename);
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },

    // Restore Backup
    restoreBackup: async (req: Request, res: Response) => {
        try {
            const { filename } = req.params;

            // Safety check: Require confirmation in body
            const { confirmation } = req.body;
            if (confirmation !== 'RESTORE') {
                return res.status(400).json({
                    success: false,
                    message: 'Missing confirmation code "RESTORE"'
                });
            }

            await backupService.restoreBackup(filename);

            res.json({
                success: true,
                message: 'Database restored successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete Backup
    deleteBackup: async (req: Request, res: Response) => {
        try {
            const { filename } = req.params;
            await backupService.deleteBackup(filename);

            res.json({
                success: true,
                message: 'Backup deleted successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};
