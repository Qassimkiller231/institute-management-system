import { API_URL, getHeaders } from './client';

export interface BackupFile {
    filename: string;
    size: number;
    createdAt: string;
}

export interface BackupConfig {
    enabled: boolean;
    schedule: string;
}

export const backupsAPI = {
    // Get Config
    getConfig: async () => {
        const res = await fetch(`${API_URL}/backups/config`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to fetch backup config');
        return res.json();
    },

    // Update Config
    updateConfig: async (config: Partial<BackupConfig>) => {
        const res = await fetch(`${API_URL}/backups/config`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(config)
        });
        if (!res.ok) throw new Error('Failed to update backup config');
        return res.json();
    },

    // List all backups
    list: async () => {
        const res = await fetch(`${API_URL}/backups`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to fetch backups');
        return res.json();
    },

    // Create manual backup
    create: async () => {
        const res = await fetch(`${API_URL}/backups`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to create backup');
        return res.json();
    },

    // Restore backup
    restore: async (filename: string) => {
        const res = await fetch(`${API_URL}/backups/${filename}/restore`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ confirmation: 'RESTORE' })
        });
        if (!res.ok) throw new Error('Failed to restore backup');
        return res.json();
    },

    // Delete backup
    delete: async (filename: string) => {
        const res = await fetch(`${API_URL}/backups/${filename}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to delete backup');
        return res.json();
    },

    // Download via Blob (Secure way with Headers)
    download: async (filename: string) => {
        const res = await fetch(`${API_URL}/backups/${filename}/download`, {
            headers: getHeaders(true)
        });
        if (!res.ok) throw new Error('Failed to download backup');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
