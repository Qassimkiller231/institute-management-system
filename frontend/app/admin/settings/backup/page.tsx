'use client';

import { useState, useEffect } from 'react';
import { backupsAPI, BackupFile, BackupConfig } from '@/lib/api/backups';
import { Database, Download, RefreshCw, Trash2, RotateCcw, Save, Clock, Settings } from 'lucide-react';

export default function BackupPage() {
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [config, setConfig] = useState<BackupConfig>({ enabled: true, schedule: '0 3 * * *' });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [restoring, setRestoring] = useState<string | null>(null);
    const [timeValue, setTimeValue] = useState('03:00'); // Helper state for time input

    const fetchData = async () => {
        try {
            setLoading(true);
            const [backupsRes, configRes] = await Promise.all([
                backupsAPI.list(),
                backupsAPI.getConfig()
            ]);

            if (backupsRes.success) {
                setBackups(backupsRes.data);
            }
            if (configRes.success && configRes.data) {
                setConfig(configRes.data);
                // Convert cron to time value (assuming simple daily schedule '0 HH MM * * *' format)
                // Cron format: 'minute hour * * *'
                const parts = configRes.data.schedule.split(' ');
                if (parts.length >= 2) {
                    const minute = parts[0].padStart(2, '0');
                    const hour = parts[1].padStart(2, '0');
                    setTimeValue(`${hour}:${minute}`);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            alert('Failed to load backup data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBackup = async () => {
        try {
            setCreating(true);
            await backupsAPI.create();
            // Refresh list
            const res = await backupsAPI.list();
            if (res.success) setBackups(res.data);
            alert('Backup created successfully');
        } catch (error) {
            console.error('Failed to create backup', error);
            alert('Failed to create backup');
        } finally {
            setCreating(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            setSavingConfig(true);
            // Convert timeValue to cron
            const [hour, minute] = timeValue.split(':');
            const cronExpression = `${parseInt(minute)} ${parseInt(hour)} * * *`;

            const newConfig = {
                enabled: config.enabled,
                schedule: cronExpression
            };

            await backupsAPI.updateConfig(newConfig);
            setConfig(newConfig as BackupConfig);
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleRestore = async (filename: string) => {
        const confirmation = prompt(`⚠️ DANGER ZONE ⚠️\n\nThis will OVERWRITE the current database with data from ${filename}.\n\nType "RESTORE" to confirm:`);

        if (confirmation !== 'RESTORE') {
            if (confirmation) alert('Restore cancelled: Incorrect confirmation code.');
            return;
        }

        try {
            setRestoring(filename);
            await backupsAPI.restore(filename);
            alert('Database restored successfully! The page will now reload.');
            window.location.reload();
        } catch (error) {
            console.error('Failed to restore backup', error);
            alert('Failed to restore backup');
        } finally {
            setRestoring(null);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            await backupsAPI.delete(filename);
            setBackups(prev => prev.filter(b => b.filename !== filename));
        } catch (error) {
            console.error('Failed to delete backup', error);
            alert('Failed to delete backup');
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            await backupsAPI.download(filename);
        } catch (err) {
            alert('Download failed');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Database className="w-8 h-8 text-blue-600" />
                        Backup & Restore
                    </h1>
                    <p className="text-gray-500 mt-1">Manage database backups, restore points, and configurations.</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {creating ? 'Creating...' : 'Create New Backup'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b pb-4 mb-4">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-900">Settings</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Auto-Backup Enabled</label>
                            <button
                                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                                className={`w-11 h-6 flex items-center rounded-full transition-colors ${config.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`w-4 h-4 bg-white rounded-full transition-transform transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Backup Time</label>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <input
                                    type="time"
                                    value={timeValue}
                                    onChange={(e) => setTimeValue(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            disabled={savingConfig}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
                        >
                            {savingConfig ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Save Settings'}
                        </button>
                    </div>

                    {/* S3 Badge */}
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3 mt-4">
                        <div className="p-1.5 bg-white rounded-full shadow-sm">
                            <span className="text-lg">☁️</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 text-sm">AWS S3 Integration</h3>
                            <p className="text-xs text-gray-500">Backups are automatically synced to your S3 bucket.</p>
                        </div>
                    </div>
                </div>

                {/* Backups List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Available Backups</h2>
                        <button onClick={fetchData} className="text-gray-500 hover:text-gray-700">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading backups...</div>
                    ) : backups.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No backups found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Filename</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {backups.map((backup) => (
                                        <tr key={backup.filename} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[150px]" title={backup.filename}>{backup.filename}</span>
                                                    {backup.filename.includes('auto') && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">Auto</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                                {new Date(backup.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                                {(backup.size / 1024 / 1024).toFixed(2)} MB
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDownload(backup.filename)}
                                                    className="text-gray-500 hover:text-blue-600 p-1"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(backup.filename)}
                                                    className="text-gray-500 hover:text-orange-600 p-1"
                                                    title="Restore"
                                                    disabled={!!restoring}
                                                >
                                                    {restoring === backup.filename ? <RefreshCw className="w-4 h-4 animate-spin text-orange-600" /> : <RotateCcw className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(backup.filename)}
                                                    className="text-gray-500 hover:text-red-600 p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
