'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getStudentId } from '@/lib/auth';

interface SpeakingSlot {
  id: string;
  slotDate: string;
  slotTime: string;
  status: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export default function SpeakingAppointmentPage() {
  const router = useRouter();
  const [availableSlots, setAvailableSlots] = useState<SpeakingSlot[]>([]);
  const [bookedSlot, setBookedSlot] = useState<SpeakingSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const studentId = getStudentId();
      if (!studentId) {
        router.push('/login');
        return;
      }

      // Fetch student's booked slot
      const studentRes = await fetch(`http://localhost:3001/api/students/${studentId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const studentData = await studentRes.json();
      const student = studentData.data || studentData;
      
      const booked = student.speakingSlots?.find((slot: SpeakingSlot) => 
        slot.status === 'BOOKED'
      );
      setBookedSlot(booked || null);

      // Fetch available slots
      const slotsRes = await fetch('http://localhost:3001/api/speaking-slots/available', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const slotsData = await slotsRes.json();
      
      // Filter future dates only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureSlots = (slotsData.data || slotsData).filter((slot: SpeakingSlot) => {
        const slotDate = new Date(slot.slotDate);
        return slotDate >= today;
      });
      
      setAvailableSlots(futureSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    try {
      const studentId = getStudentId();
      const res = await fetch(`http://localhost:3001/api/speaking-slots/${slotId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ studentId })
      });

      if (res.ok) {
        alert('Speaking test booked successfully!');
        loadSlots(); // Reload
        router.push('/student');
      } else {
        alert('Failed to book slot. Please try again.');
      }
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('Error booking slot');
    }
  };

  const handleCancelSlot = async () => {
    if (!bookedSlot || !confirm('Are you sure you want to cancel your speaking test?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/speaking-slots/${bookedSlot.id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (res.ok) {
        alert('Appointment cancelled successfully');
        setBookedSlot(null);
        loadSlots();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
    }
  };

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.slotDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, SpeakingSlot[]>);

  const dates = Object.keys(slotsByDate).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push('/student')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Speaking Test Appointment</h1>

        {bookedSlot ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Current Appointment</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(bookedSlot.slotDate).toLocaleDateString('en-US', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="text-lg font-semibold text-gray-900">{bookedSlot.slotTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teacher</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bookedSlot.teacher.firstName} {bookedSlot.teacher.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCancelSlot}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cancel Appointment
              </button>
              <button
                onClick={() => {
                  handleCancelSlot();
                  // After cancel, show available slots
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reschedule
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Time Slots</h2>

            {dates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No available slots at the moment. Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dates.map(date => (
                  <div key={date} className="border-b border-gray-200 pb-6 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {slotsByDate[date].map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => handleBookSlot(slot.id)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
                        >
                          <div className="text-lg font-semibold text-gray-900">{slot.slotTime}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {slot.teacher.firstName} {slot.teacher.lastName}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
