'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sessionsAPI, groupsAPI, hallsAPI, CreateSessionDto } from '@/lib/api';

interface SessionData {
    id: string;
    sessionDate: string;
    sessionNumber: number;
    startTime: string;
    endTime: string;
    topic?: string;
    status: string;
    group: {
        id: string;
        name?: string;
        groupCode: string;
    };
    hall?: {
        id: string;
        name: string;
    };
}

export default function AdminSessionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [bulkMode, setBulkMode] = useState(false);
    const [formData, setFormData] = useState<CreateSessionDto>({
        groupId: '',
        sessionDate: '',
        sessionNumber: 1,
        startTime: '',
        endTime: '',
        hallId: '',
        topic: ''
    });
    const [bulkFormData, setBulkFormData] = useState({
        groupId: '',
        startDate: '',
        endDate: '',
        startSessionNumber: 1,
        startTime: '',
        endTime: '',
        hallId: '',
        topic: '',
        daysOfWeek: [] as number[] // 0=Sunday, 1=Monday, etc.
    });
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetchData();
    }, [selectedGroup]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [sessionsRes, groupsRes, hallsRes] = await Promise.all([
                selectedGroup ? sessionsAPI.getAll({ groupId: selectedGroup }) : sessionsAPI.getAll({}),
                groupsAPI.getAll({ isActive: true }),
                hallsAPI.getAll()
            ]);

            setSessions(sessionsRes.data || []);
            setGroups(groupsRes.data || []);
            setHalls(hallsRes.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        try {
            // Convert empty string to undefined for optional fields
            const dataToSend = {
                ...formData,
                hallId: formData.hallId || undefined,
                topic: formData.topic || undefined
            };

            await sessionsAPI.create(dataToSend);
            setShowModal(false);
            setFormData({
                groupId: '',
                sessionDate: '',
                sessionNumber: 1,
                startTime: '',
                endTime: '',
                hallId: '',
                topic: ''
            });
            fetchData();
        } catch (err: any) {
            setSubmitError(err.message);
        }
    };

    const handleBulkCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        try {
            const startDate = new Date(bulkFormData.startDate);
            const endDate = new Date(bulkFormData.endDate);
            const sessions: CreateSessionDto[] = [];
            let sessionNumber = bulkFormData.startSessionNumber;

            // Generate sessions for each date in range that matches selected days
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = date.getDay();

                if (bulkFormData.daysOfWeek.includes(dayOfWeek)) {
                    sessions.push({
                        groupId: bulkFormData.groupId,
                        sessionDate: date.toISOString().split('T')[0],
                        sessionNumber: sessionNumber++,
                        startTime: bulkFormData.startTime,
                        endTime: bulkFormData.endTime,
                        hallId: bulkFormData.hallId || undefined,
                        topic: bulkFormData.topic || undefined
                    });
                }
            }

            if (sessions.length === 0) {
                setSubmitError('No sessions to create. Please select at least one day of the week.');
                return;
            }

            // Create all sessions
            for (const session of sessions) {
                await sessionsAPI.create(session);
            }

            setShowModal(false);
            setBulkMode(false);
            setBulkFormData({
                groupId: '',
                startDate: '',
                endDate: '',
                startSessionNumber: 1,
                startTime: '',
                endTime: '',
                hallId: '',
                topic: '',
                daysOfWeek: []
            });
            fetchData();
        } catch (err: any) {
            setSubmitError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this session?')) return;

        try {
            await sessionsAPI.delete(id);
            fetchData();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr: string) => {
        return new Date(timeStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    const renderLoadingState = () => (
        <div className="p-8">
            <p className="text-gray-600">Loading sessions...</p>
        </div>
    );

    const renderErrorState = () => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">Error loading sessions</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Try Again
            </button>
        </div>
    );

    const renderHeader = () => (
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
                <p className="text-gray-600">Create and manage class sessions</p>
            </div>
            <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
                + Create Session
            </button>
        </div>
    );

    const renderFilters = () => (
        <div className="mb-6 flex gap-4">
            <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 flex-1"
            >
                <option value="">All Groups</option>
                {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.groupCode} - {group.name || 'Unnamed Group'}
                    </option>
                ))}
            </select>
            <button
                onClick={() => setSelectedGroup('')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
                Reset
            </button>
        </div>
    );

    const renderSessionCard = (session: SessionData) => (
        <div key={session.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Session #{session.sessionNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {session.group.groupCode} - {session.group.name || 'Unnamed'}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {session.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(session.sessionDate)}
                </div>
                <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </div>
                {session.hall && (
                    <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Hall: {session.hall.name}
                    </div>
                )}
                {session.topic && (
                    <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {session.topic}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleDelete(session.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                >
                    Delete
                </button>
            </div>
        </div>
    );

    const renderSessionsList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => renderSessionCard(session))}
        </div>
    );

    const renderEmptyState = () => (
        <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 text-lg mb-4">
                {selectedGroup ? 'No sessions for this group yet' : 'No sessions created yet'}
            </p>
            <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Create First Session
            </button>
        </div>
    );

    const renderCreateModal = () => {
        const toggleDay = (day: number) => {
            setBulkFormData(prev => ({
                ...prev,
                daysOfWeek: prev.daysOfWeek.includes(day)
                    ? prev.daysOfWeek.filter(d => d !== day)
                    : [...prev.daysOfWeek, day]
            }));
        };

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Create Sessions</h2>

                        {/* Tabs */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setBulkMode(false)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${!bulkMode
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Single Session
                            </button>
                            <button
                                onClick={() => setBulkMode(true)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${bulkMode
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Bulk Create
                            </button>
                        </div>
                    </div>

                    {!bulkMode ? (
                        // SINGLE SESSION FORM
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-600 text-sm mt-1">{submitError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.groupId}
                                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="">Select a group</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.groupCode} - {group.name || 'Unnamed Group'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.sessionDate}
                                        onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.sessionNumber}
                                        onChange={(e) => setFormData({ ...formData, sessionNumber: parseInt(e.target.value) })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hall (Optional)
                                </label>
                                <select
                                    value={formData.hallId}
                                    onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="">No specific hall</option>
                                    {halls.map((hall) => (
                                        <option key={hall.id} value={hall.id}>
                                            {hall.name} - {hall.venue?.name || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., Introduction to Present Perfect"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Create Session
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSubmitError('');
                                    }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        // BULK CREATION FORM
                        <form onSubmit={handleBulkCreate} className="p-6 space-y-4">
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">Error</p>
                                    <p className="text-red-600 text-sm mt-1">{submitError}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={bulkFormData.groupId}
                                    onChange={(e) => setBulkFormData({ ...bulkFormData, groupId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="">Select a group</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.groupCode} - {group.name || 'Unnamed Group'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={bulkFormData.startDate}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={bulkFormData.endDate}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Days of Week <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    {dayNames.map((day, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => toggleDay(index)}
                                            className={`flex-1 px-3 py-2 rounded-lg font-medium transition ${bulkFormData.daysOfWeek.includes(index)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={bulkFormData.startTime}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, startTime: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={bulkFormData.endTime}
                                        onChange={(e) => setBulkFormData({ ...bulkFormData, endTime: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Starting Session Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={bulkFormData.startSessionNumber}
                                    onChange={(e) => setBulkFormData({ ...bulkFormData, startSessionNumber: parseInt(e.target.value) })}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hall (Optional)
                                </label>
                                <select
                                    value={bulkFormData.hallId}
                                    onChange={(e) => setBulkFormData({ ...bulkFormData, hallId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                >
                                    <option value="">No specific hall</option>
                                    {halls.map((hall) => (
                                        <option key={hall.id} value={hall.id}>
                                            {hall.name} - {hall.venue?.name || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={bulkFormData.topic}
                                    onChange={(e) => setBulkFormData({ ...bulkFormData, topic: e.target.value })}
                                    placeholder="e.g., Grammar Lessons"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Preview:</strong> This will create sessions on selected days between the start and end dates, auto-incrementing session numbers.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                                >
                                    Create Sessions
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setBulkMode(false);
                                        setSubmitError('');
                                    }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // ========================================
    // MAIN RENDER
    // ========================================

    if (loading) return renderLoadingState();
    if (error) return renderErrorState();

    return (
        <div>
            {renderHeader()}
            {renderFilters()}
            {sessions.length === 0 ? renderEmptyState() : renderSessionsList()}
            {showModal && renderCreateModal()}
        </div>
    );
}
