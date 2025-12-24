'use client';

import { useState, useEffect } from 'react';
import { speakingSlotAPI, studentsAPI } from '@/lib/api';

export default function SpeakingTestsPage() {
    const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await speakingSlotAPI.getAll();
            setTests(response.data || []);
        } catch (err) {
            // console.error('Error loading tests:', err);
            alert('Error loading tests');
        } finally {
            setLoading(false);
        }
    };

    const filteredTests = tests.filter(test => {
        const studentName = test.student ? `${test.student.firstName} ${test.student.secondName}`.trim() : '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: tests.length,
        scheduled: tests.filter(t => t.status === 'BOOKED').length,
        completed: tests.filter(t => t.status === 'COMPLETED').length,
        avgScore: tests.filter(t => t.result).reduce((acc, t) => acc + (t.result.score || 0), 0) / Math.max(tests.filter(t => t.result).length, 1)
    };

    /* Booking State */
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingStep, setBookingStep] = useState<'student' | 'slot' | 'confirm'>('student');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Step 1: Student Selection
    const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentTestSessionId, setStudentTestSessionId] = useState<string | null>(null);

    // Step 2: Slot Selection
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>('');


    useEffect(() => {
        if (showBookingModal && bookingStep === 'student') {
            // Clear previous states when opening
            setSelectedStudentId('');
            setSelectedStudent(null);
            setBookingError('');
            fetchEligibleStudents();
        }
    }, [showBookingModal, bookingStep]);

    /* Student Fetch Logic */
    const fetchEligibleStudents = async () => {
        setBookingLoading(true);
        try {
            const result = await studentsAPI.getAll({
                needsSpeakingTest: true,
                limit: 100
            });
            if (result.success) {
                setEligibleStudents(result.data);
            }
        } catch (err) {
            // console.error('Fetch error:', err);
            setBookingError('Failed to load eligible students');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSelectStudent = async () => {
        if (!selectedStudentId) return;

        setBookingLoading(true);
        setBookingError('');
        try {
            // Fetch full student details to check for test session
            const result = await studentsAPI.getById(selectedStudentId);

            if (!result.success || !result.data) {
                throw new Error('Failed to fetch student details');
            }

            const fullStudent = result.data;

            // Check for MCQ_COMPLETED session
            const eligibleSession = fullStudent.testSessions?.find(
                (s: any) => s.status === 'MCQ_COMPLETED'
            );

            if (!eligibleSession) {
                setBookingError('Student has not completed the Placement Test MCQ recently. Please ask them to take the placement test first.');
                setBookingLoading(false);
                return;
            }

            setSelectedStudent(fullStudent);
            setStudentTestSessionId(eligibleSession.id);

            // Load slots for next step
            await loadAvailableSlots();
            setBookingStep('slot');
        } catch (err: any) {
            setBookingError(err.message || 'Error validating student');
        } finally {
            setBookingLoading(false);
        }
    };

    /* Slot Logic */
    const loadAvailableSlots = async () => {
        try {
            const result = await speakingSlotAPI.getAvailable();
            if (result.success && result.data) {
                setAvailableSlots(result.data);

                // Extract unique teachers
                const uniqueTeachers = result.data.reduce((acc: any[], slot: any) => {
                    if (!acc.find(t => t.id === slot.teacherId)) {
                        acc.push({
                            id: slot.teacherId,
                            firstName: slot.teacher?.firstName || 'Teacher',
                            lastName: slot.teacher?.lastName || slot.teacher?.user?.email || ''
                        });
                    }
                    return acc;
                }, []);
                setTeachers(uniqueTeachers);
            }
        } catch (err) {
            // console.error('Error loading slots:', err);
            setBookingError('Failed to load available slots');
        }
    };

    useEffect(() => {
        if (selectedTeacher) {
            const teacherSlots = availableSlots.filter(s => s.teacherId === selectedTeacher);
            const dates = [...new Set(teacherSlots.map((s: any) => s.slotDate))].sort() as string[];
            setAvailableDates(dates);
            setSelectedDate('');
            setSelectedSlot('');
        }
    }, [selectedTeacher, availableSlots]);

    useEffect(() => {
        if (selectedTeacher && selectedDate) {
            const timeSlots = availableSlots.filter(
                s => s.teacherId === selectedTeacher && s.slotDate === selectedDate
            );
            setAvailableTimeSlots(timeSlots);
        }
    }, [selectedTeacher, selectedDate, availableSlots]);

    /* Booking Logic */
    const handleConfirmBooking = async () => {
        if (!selectedSlot || !studentTestSessionId || !selectedStudent) return;

        setBookingLoading(true);
        try {
            const result = await speakingSlotAPI.book(selectedSlot, studentTestSessionId, selectedStudent.id);

            if (result.success) {
                alert('Speaking test booked successfully!');
                setShowBookingModal(false);
                fetchTests(); // Refresh list
            } else {
                setBookingError(result.message || 'Failed to book slot');
            }
        } catch (err: any) {
            setBookingError('Network error: ' + err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTestDetails, setSelectedTestDetails] = useState<any>(null);

    const handleView = (test: any) => {
        setSelectedTestDetails(test);
        setShowDetailsModal(true);
    };

    const handleCancel = async (test: any) => {
        if (!test.testSessionId) {
            alert('Cannot cancel: Session ID missing');
            return;
        }

        if (confirm('Are you sure you want to cancel this speaking test? This will free the slot and reset the student\'s status.')) {
            try {
                const result = await speakingSlotAPI.cancel(test.id, test.testSessionId);
                if (result.success) {
                    alert('Test cancelled successfully');
                    fetchTests(); // Refresh
                } else {
                    alert('Failed to cancel: ' + result.message);
                }
            } catch (err: any) {
                // console.error('Cancel error:', err);
                alert('Error creating cancellation: ' + err.message);
            }
        }
    };

    const formatTime = (time: string) => {
        if (!time) return '-';
        try {
            // Check if it's already a full ISO string or similar
            if (time.includes('T')) {
                return new Date(time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            // Assume it's HH:MM:SS
            return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return time;
        }
    };

    // ========================================
    // RENDER FUNCTIONS - MAIN UI
    // ========================================

    const renderHeader = () => (
        <div className="mb-6 flex justify-between items-start"><div><h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking Tests</h1><p className="text-gray-700">Schedule and manage speaking test sessions</p></div><button onClick={() => { setShowBookingModal(true); setBookingStep('student'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"><span>+</span> Book Test</button></div>
    );

    const renderStats = () => (
        <div className="grid md:grid-cols-4 gap-6 mb-6"><div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"><p className="text-sm font-medium text-gray-700 mb-1">Total Tests</p><p className="text-3xl font-bold text-gray-900">{stats.total}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"><p className="text-sm font-medium text-gray-700 mb-1">Scheduled</p><p className="text-3xl font-bold text-gray-900">{stats.scheduled}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"><p className="text-sm font-medium text-gray-700 mb-1">Completed</p><p className="text-3xl font-bold text-gray-900">{stats.completed}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600"><p className="text-sm font-medium text-gray-700 mb-1">Average Score</p><p className="text-3xl font-bold text-gray-900">{stats.avgScore.toFixed(0)}%</p></div></div>
    );

    const renderFilters = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6"><div className="grid md:grid-cols-3 gap-4"><div className="col-span-2"><input type="text" placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div><div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Status</option><option value="BOOKED">Scheduled</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div></div></div>
    );

    const renderTestRow = (test: any) => {
        const studentName = test.student ? `${test.student.firstName} ${test.student.secondName}`.trim() : 'N/A';
        const teacherName = test.teacher ? `${test.teacher.firstName} ${test.teacher.lastName}`.trim() : 'N/A';

        return (
            <tr key={test.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{studentName}</td><td className="px-6 py-4 text-sm text-gray-900">{test.speakingLevel || '-'}</td><td className="px-6 py-4 text-sm text-gray-900">{teacherName}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{test.slotDate ? new Date(test.slotDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{test.startTime ? `${test.startTime} - ${test.endTime}` : '-'}</td><td className="px-6 py-4 text-center"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${test.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : test.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{test.status === 'BOOKED' ? 'SCHEDULED' : test.status}</span></td><td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">{test.result?.score ? `${test.result.score}%` : '-'}</td><td className="px-6 py-4 text-center"><div className="flex justify-center gap-2"><button onClick={() => handleView(test)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">View</button>{test.status === 'BOOKED' && <button onClick={() => handleCancel(test)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Cancel</button>}</div></td></tr>
        );
    };

    const renderTestsTable = () => (
        <div className="bg-white rounded-lg shadow overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Level</th><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teacher</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Date</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Time</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Score</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredTests.map(renderTestRow)}</tbody></table>{filteredTests.length === 0 && <div className="p-12 text-center"><p className="text-gray-600">No tests found</p></div>}</div>
    );

    // ========================================
    // RENDER FUNCTIONS - MODALS
    // ========================================

    /* Modal Render */
    const renderModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Book Speaking Test</h2>
                    <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-6 text-sm">
                        <div className={`flex items-center ${bookingStep === 'student' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center mr-2">1</span>
                            Select Student
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className={`flex items-center ${bookingStep === 'slot' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center mr-2">2</span>
                            Select Slot
                        </div>
                        <div className="w-8 h-px bg-gray-300"></div>
                        <div className={`flex items-center ${bookingStep === 'confirm' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center mr-2">3</span>
                            Confirm
                        </div>
                    </div>

                    {bookingError && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
                            {bookingError}
                        </div>
                    )}

                    {/* STEP 1: STUDENT */}
                    {bookingStep === 'student' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                                <p className="text-xs text-gray-500 mb-2">Showing students who have completed the Placement Test MCQ but haven't booked a speaking test.</p>

                                {bookingLoading && eligibleStudents.length === 0 ? (
                                    <div className="text-gray-500 text-sm py-2">Loading students...</div>
                                ) : (
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                    >
                                        <option value="">-- Select a Student --</option>
                                        {eligibleStudents.length === 0 && (
                                            <option disabled>No students waiting for speaking test</option>
                                        )}
                                        {eligibleStudents.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.firstName} {student.secondName} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSelectStudent}
                                    disabled={!selectedStudentId || bookingLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
                                >
                                    {bookingLoading ? 'Checking...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SLOT */}
                    {bookingStep === 'slot' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded mb-4">
                                <p className="text-sm text-blue-800">Booking for: <strong>{selectedStudent?.firstName} {selectedStudent?.secondName}</strong></p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Teacher</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                    >
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        disabled={!selectedTeacher}
                                    >
                                        <option value="">-- Select Date --</option>
                                        {availableDates.map(date => (
                                            <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableTimeSlots.map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => setSelectedSlot(slot.id)}
                                                className={`p-3 rounded border text-sm text-center transition ${selectedSlot === slot.id
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'hover:border-blue-500 border-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                {formatTime(slot.startTime)}
                                                <div className="text-xs opacity-75 mt-0.5">{formatTime(slot.endTime)}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <button
                                    onClick={() => setBookingStep('student')}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setBookingStep('confirm')}
                                    disabled={!selectedSlot}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {bookingStep === 'confirm' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg text-center space-y-4 border">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedStudent?.firstName} {selectedStudent?.secondName}</p>
                                    <p className="text-sm text-gray-600">{selectedStudent?.email}</p>
                                </div>
                                <div className="w-full h-px bg-gray-200"></div>
                                <div className="grid grid-cols-2 gap-4 text-left px-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Teacher</p>
                                        <p className="font-medium text-gray-900">
                                            {teachers.find(t => t.id === selectedTeacher)?.firstName} {teachers.find(t => t.id === selectedTeacher)?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Date & Time</p>
                                        {selectedSlot && availableTimeSlots.find(s => s.id === selectedSlot) && (
                                            <div className="font-medium text-gray-900">
                                                {new Date(selectedDate).toLocaleDateString()}<br />
                                                {formatTime(availableTimeSlots.find(s => s.id === selectedSlot).startTime)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setBookingStep('slot')}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingLoading}
                                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                >
                                    {bookingLoading ? 'Booking...' : 'Confirm & Book'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    /* Details Modal */
    const renderDetailsModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800">Speaking Test Details</h3>
                    <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-gray-700 uppercase font-semibold">Status</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium
                            ${selectedTestDetails?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    selectedTestDetails?.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                {selectedTestDetails?.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-700 uppercase font-semibold">Date</label>
                            <p className="font-medium text-gray-900">{new Date(selectedTestDetails?.slotDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-700 uppercase font-semibold">Time</label>
                            <p className="font-medium text-gray-900">{formatTime(selectedTestDetails?.slotTime)}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <label className="text-xs text-gray-700 uppercase font-semibold">Teacher</label>
                        <p className="font-medium text-gray-900">
                            {selectedTestDetails?.teacher?.firstName} {selectedTestDetails?.teacher?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{selectedTestDetails?.teacher?.user?.email}</p>
                    </div>

                    {selectedTestDetails?.student && (
                        <div className="pt-4 border-t">
                            <label className="text-xs text-gray-700 uppercase font-semibold">Student</label>
                            <p className="font-medium text-gray-900">
                                {selectedTestDetails.student.firstName} {selectedTestDetails.student.secondName}
                            </p>
                            <p className="text-sm text-gray-500">{selectedTestDetails.student.user?.email}</p>
                        </div>
                    )}

                    {selectedTestDetails?.status === 'COMPLETED' && (
                        <div className="pt-4 border-t bg-green-50 p-3 rounded">
                            <h4 className="font-bold text-green-900 mb-2">Results</h4>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-xs text-gray-500">MCQ</div>
                                    <div className="font-bold text-gray-900">{selectedTestDetails.mcqLevel || '-'}</div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-xs text-gray-500">Speaking</div>
                                    <div className="font-bold text-gray-900">{selectedTestDetails.speakingLevel || '-'}</div>
                                </div>
                                <div className="bg-white p-2 rounded border-2 border-green-200">
                                    <div className="text-xs text-gray-500">Final</div>
                                    <div className="font-bold text-green-700">{selectedTestDetails.finalLevel || '-'}</div>
                                </div>
                            </div>
                            {selectedTestDetails.feedback && (
                                <div className="mt-3 text-sm text-gray-700 italic border-t pt-2">
                                    "{selectedTestDetails.feedback}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
                    <button
                        onClick={() => setShowDetailsModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    // MAIN RENDER
    // ========================================

    return (
        <div>
            {renderHeader()}
            {renderStats()}
            {renderFilters()}
            {renderTestsTable()}

            {showBookingModal && renderModal()}
            {showDetailsModal && renderDetailsModal()}
        </div>
    );
}