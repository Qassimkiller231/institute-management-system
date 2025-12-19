'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditApi, AuditLog, AuditLogResponse } from '@/lib/api/audit';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 20
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        action: '',
        userId: '',
        startDate: '',
        endDate: '',
    });

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await auditApi.getLogs({
                page: pagination.page,
                limit: pagination.limit,
                action: filters.action || undefined,
                userId: filters.userId || undefined,
                startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
                endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined
            });
            setLogs(response.data);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch logs');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    // Initial fetch and on page change
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            userId: '',
            startDate: '',
            endDate: '',
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
        if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-emerald-100 text-emerald-800';
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
        if (action.includes('LOGIN')) return 'bg-gray-100 text-gray-800';
        if (action.includes('PAYMENT')) return 'bg-amber-100 text-amber-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            return dateString;
        }
    };

    const formatChanges = (log: AuditLog) => {
        if (!log.newValues && !log.oldValues) return <span className="text-gray-400 text-xs">No detail changes</span>;

        const hasOld = log.oldValues && Object.keys(log.oldValues).length > 0;
        const hasNew = log.newValues && Object.keys(log.newValues).length > 0;

        return (
            <div className="text-xs space-y-1 font-mono">
                {hasOld && (
                    <div className="text-red-700 break-all bg-red-50 p-1 rounded">
                        <span className="font-semibold select-none">Old: </span>
                        {JSON.stringify(log.oldValues)}
                    </div>
                )}
                {hasNew && (
                    <div className="text-emerald-700 break-all bg-emerald-50 p-1 rounded">
                        <span className="font-semibold select-none">New: </span>
                        {JSON.stringify(log.newValues)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track system activities and user actions.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-200 hover:bg-gray-100 h-9 px-4 py-2"
                >
                    {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Action Type</label>
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="MATERIAL_UPLOAD">Material Upload</option>
                                <option value="MATERIAL_DELETE">Material Delete</option>
                                <option value="STUDENT_CREATED">Student Created</option>
                                <option value="STUDENT_UPDATED">Student Updated</option>
                                <option value="PAYMENT_RECEIVED">Payment Received</option>
                                <option value="REFUND_PROCESSED">Refund Processed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">User ID Search</label>
                            <input
                                type="text"
                                placeholder="Search by User ID..."
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Timestamp</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">User</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Action</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Resource</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center h-24 align-middle">
                                        <div className="flex items-center justify-center text-gray-500 animate-pulse">
                                            Loading logs...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center h-24 align-middle text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center h-24 align-middle text-gray-500">
                                        No logs found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b transition-colors hover:bg-gray-50/50">
                                        <td className="p-4 align-middle font-mono text-xs whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-gray-900">{log.user?.email || 'Unknown User'}</span>
                                                <span className="text-xs text-gray-500">{log.user?.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getActionColor(log.action)}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="text-sm">
                                                {log.tableName && <span className="font-medium block text-gray-700">{log.tableName}</span>}
                                                {log.recordId && <span className="text-xs text-gray-400 block truncate max-w-[100px] font-mono" title={log.recordId}>ID: {log.recordId.substring(0, 8)}...</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle max-w-[400px]">
                                            {formatChanges(log)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={pagination.page === 1 || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 py-2"
                    >
                        Previous
                    </button>
                    <div className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <button
                        onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages || isLoading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 py-2"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
