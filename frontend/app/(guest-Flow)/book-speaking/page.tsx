'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { speakingSlotAPI } from '@/lib/api';

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

export default function BookSpeakingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'teacher' | 'date' | 'time' | 'confirm'>('teacher');
  
  // Data
  const [allSlots, setAllSlots] = useState<SpeakingSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Selections
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  
  // Filtered data
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<SpeakingSlot[]>([]);
  
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  // When teacher is selected, show their available dates
  useEffect(() => {
    if (selectedTeacher) {
      const teacherSlots = allSlots.filter(s => s.teacherId === selectedTeacher);
      const dates = [...new Set(teacherSlots.map(s => s.slotDate))].sort();
      setAvailableDates(dates);
    }
  }, [selectedTeacher, allSlots]);

  // When date is selected, show available time slots
  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      const timeSlots = allSlots.filter(
        s => s.teacherId === selectedTeacher && s.slotDate === selectedDate
      );
      setAvailableTimeSlots(timeSlots);
    }
  }, [selectedTeacher, selectedDate, allSlots]);

  const loadAvailableSlots = async () => {
    try {
      const result = await speakingSlotAPI.getAvailable();
      
      if (result.success && result.data) {
        setAllSlots(result.data);
        
        // Extract unique teachers
        const uniqueTeachers = result.data.reduce((acc: any[], slot: SpeakingSlot) => {
          if (!acc.find(t => t.id === slot.teacherId)) {
            acc.push({
              id: slot.teacherId,
              email: slot.teacher.user.email,
              firstName: 'Teacher', // Backend doesn't return this, use email
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

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    const sessionId = localStorage.getItem('testSessionId');
    const studentId = localStorage.getItem('studentId');
    
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
        localStorage.removeItem('testSessionId');
      } else {
        setError(result.message || 'Failed to book slot');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Available Slots...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (booked) {
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
  }

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

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${step === 'teacher' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Teacher</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className={`flex items-center ${step === 'date' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Date</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className={`flex items-center ${step === 'time' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Time</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Select Teacher */}
          {step === 'teacher' && (
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
          )}

          {/* Step 2: Select Date */}
          {step === 'date' && (
            <div>
              <button
                onClick={() => {
                  setStep('teacher');
                  setSelectedDate('');
                }}
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
          )}

          {/* Step 3: Select Time */}
          {step === 'time' && (
            <div>
              <button
                onClick={() => {
                  setStep('date');
                  setSelectedSlot('');
                }}
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
                        className={`p-6 rounded-lg border-2 transition text-left ${
                          selectedSlot === slot.id
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
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedSlot === slot.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
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
          )}
        </div>
      </div>
    </div>
  );
}