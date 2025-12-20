'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { speakingSlotAPI, studentsAPI } from '@/lib/api';
import { getStudentId } from '@/lib/authStorage';
import { saveTestSessionId, getTestSessionId, removeTestSessionId } from '@/lib/testSessionStorage';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorMessage } from '@/components/common/Messages';

// ========================================
// TYPES
// ========================================

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SpeakingSlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teacher: {
    id: string;
    user: {
      email: string;
    };
  };
}

type BookingStep = 'teacher' | 'date' | 'time' | 'confirm';

export default function BookSpeakingPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<BookingStep>('teacher');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  // Data State
  const [allSlots, setAllSlots] = useState<SpeakingSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentData, setStudentData] = useState<any>(null);

  // Selection State
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Filtered Data State
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<SpeakingSlot[]>([]);

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Effect 1: Initial Load
   * Runs once on mount to load student data and available slots
   */
  useEffect(() => {
    loadStudentAndSession();
  }, []);

  /**
   * Effect 2: Filter Dates by Teacher
   * When a teacher is selected, extract their unique available dates
   */
  useEffect(() => {
    if (selectedTeacher) {
      const teacherSlots = allSlots.filter(s => s.teacherId === selectedTeacher);
      const dates = [...new Set(teacherSlots.map(s => s.slotDate))].sort();
      setAvailableDates(dates);
    } else {
      setAvailableDates([]);
    }
  }, [selectedTeacher, allSlots]);

  /**
   * Effect 3: Filter Time Slots by Date
   * When both teacher and date are selected, filter to specific time slots
   */
  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      const timeSlots = allSlots.filter(
        s => s.teacherId === selectedTeacher && s.slotDate === selectedDate
      );
      setAvailableTimeSlots(timeSlots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedTeacher, selectedDate, allSlots]);

  // ========================================
  // DATA LOADING FUNCTIONS
  // ========================================

  /**
   * Load student data and find their completed test session
   * This validates that the student has completed MCQ before booking
   */
  const loadStudentAndSession = async () => {
    try {
      const studentId = getStudentId();

      if (!studentId) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      // Fetch student data with test sessions
      const result = await studentsAPI.getById(studentId);

      if (result.success && result.data) {
        setStudentData(result.data);

        // Find the latest test session with MCQ completed status
        const mcqCompletedSession = result.data.testSessions?.find(
          (session: any) => session.status === 'MCQ_COMPLETED'
        );

        if (mcqCompletedSession) {
          // Save session ID for booking (using utility function)
          saveTestSessionId(mcqCompletedSession.id);
          // console.log('Found test session for booking:', mcqCompletedSession.id); // Debug
        } else {
          setError('No completed test found. Please complete the placement test first.');
          setLoading(false);
          return;
        }
      }

      // Load available speaking slots
      await loadAvailableSlots();
    } catch (err) {
      // console.error('Error loading student data:', err); // Debug
      setError('Failed to load student data');
      setLoading(false);
    }
  };

  /**
   * Load all available speaking slots and extract unique teachers
   */
  const loadAvailableSlots = async () => {
    try {
      const result = await speakingSlotAPI.getAvailable();

      if (result.success && result.data) {
        setAllSlots(result.data);

        // Extract unique teachers from slots
        const uniqueTeachers = result.data.reduce((acc: any[], slot: SpeakingSlot) => {
          if (!acc.find(t => t.id === slot.teacherId)) {
            acc.push({
              id: slot.teacherId,
              email: slot.teacher.user.email,
              firstName: 'Teacher', // Backend doesn't return name, use email
              lastName: ''
            });
          }
          return acc;
        }, []);

        setTeachers(uniqueTeachers);
      } else {
        setError('Failed to load available slots');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle booking the selected speaking slot
   * Validates test session and student ID before booking
   */
  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    const sessionId = getTestSessionId(); // Using utility
    const studentId = getStudentId();     // Using utility

    if (!sessionId) {
      setError('Test session not found. Please complete the test first.');
      return;
    }

    if (!studentId) {
      setError('Student ID not found. Please login again.');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const result = await speakingSlotAPI.book(selectedSlot, sessionId, studentId);

      if (result.success) {
        setBooked(true);
        removeTestSessionId(); // Clear session ID (using utility)
      } else {
        setError(result.message || 'Failed to book slot');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  /**
   * Navigate back in the booking flow and clear related selections
   */
  const handleBackToTeachers = () => {
    setStep('teacher');
    setSelectedDate('');
    setSelectedSlot('');
  };

  const handleBackToDates = () => {
    setStep('date');
    setSelectedSlot('');
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Format date as: "Monday, January 15, 2025"
   */
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format date as: "Jan 15"
   */
  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Format time as: "2:30 PM"
   */
  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Success state - shown after successful booking
   */
  const renderSuccessState = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Appointment Booked!
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Your speaking test has been scheduled. You will receive a confirmation email with the details.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition text-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  };

  /**
   * Progress indicator showing current step
   */
  const renderProgressIndicator = () => {
    const steps = [
      { key: 'teacher', label: 'Teacher', number: 1 },
      { key: 'date', label: 'Date', number: 2 },
      { key: 'time', label: 'Time', number: 3 },
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <>
            <div
              key={s.key}
              className={`flex items-center ${step === s.key ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === s.key ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
              >
                {s.number}
              </div>
              <span className="ml-2 font-medium">{s.label}</span>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-1 bg-gray-300 mx-4"></div>}
          </>
        ))}
      </div>
    );
  };

  /**
   * Step 1: Teacher selection
   */
  const renderTeacherSelection = () => {
    if (step !== 'teacher') return null;

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Teacher</h2>

        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No teachers available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => {
                  setSelectedTeacher(teacher.id);
                  setStep('date');
                }}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                    {teacher.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{teacher.email}</h3>
                    <p className="text-sm text-gray-600">
                      {allSlots.filter(s => s.teacherId === teacher.id).length} slots available
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Step 2: Date selection
   */
  const renderDateSelection = () => {
    if (step !== 'date') return null;

    return (
      <div>
        <button
          onClick={handleBackToTeachers}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Back to teachers
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Date</h2>

        {availableDates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No dates available for this teacher</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setStep('time');
                }}
                className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {new Date(date).getDate()}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDateShort(date)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Step 3: Time slot selection and confirmation
   */
  const renderTimeSelection = () => {
    if (step !== 'time') return null;

    return (
      <div>
        <button
          onClick={handleBackToDates}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Back to dates
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Select a Time Slot
        </h2>
        <p className="text-gray-600 mb-6">{formatDate(selectedDate)}</p>

        {availableTimeSlots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No time slots available</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-6 rounded-lg border-2 transition text-left ${selectedSlot === slot.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {formatTime(slot.startTime)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(slot.endTime)}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedSlot === slot.id
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                        }`}
                    >
                      {selectedSlot === slot.id && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleBookSlot}
              disabled={!selectedSlot || booking}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {booking ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </>
        )}
      </div>
    );
  };

  /**
   * Main booking form with all steps
   */
  const renderBookingForm = () => {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Book Speaking Test
              </h1>
              <p className="text-gray-600">
                Choose a teacher, date, and time for your speaking test
              </p>
            </div>

            {renderProgressIndicator()}
            <ErrorMessage message={error} />
            {renderTeacherSelection()}
            {renderDateSelection()}
            {renderTimeSelection()}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================

  if (loading) return <LoadingState message="Loading Available Slots..." submessage="Please wait" />;
  if (booked) return renderSuccessState();
  return renderBookingForm();
}