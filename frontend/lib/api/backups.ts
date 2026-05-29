import { apiFetch, API_URL, getHeaders } from './client';

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
    getConfig: () => apiFetch('/backups/config'),

    updateConfig: (config: Partial<BackupConfig>) =>
        apiFetch('/backups/config', { method: 'PUT', body: config }),

    list: () => apiFetch('/backups'),

    create: () => apiFetch('/backups', { method: 'POST' }),

    restore: (filename: string) =>
        apiFetch(`/backups/${filename}/restore`, {
            method: 'POST',
            body: { confirmation: 'RESTORE' },
        }),

    delete: (filename: string) =>
        apiFetch(`/backups/${filename}`, { method: 'DELETE' }),

    // Downloads a binary file (Blob), so it can't use apiFetch's JSON handling.
    download: async (filename: string) => {
        const res = await fetch(`${API_URL}/backups/${filename}/download`, {
            credentials: 'include',
            headers: getHeaders(true),
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
    },
};
