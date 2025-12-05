"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTeacherId } from "@/lib/auth";
import { speakingSlotAPI } from "@/lib/api";
import {
  getMCQLevel,
  suggestFinalLevel,
  getLevelDescription,
  CEFR_LEVELS,
  type CEFRLevel,
} from "@/lib/levelConfig";

interface SlotData {
  id: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  status: string;
  testSessionId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
      phone?: string;
    };
  };
  testSession?: {
    id: string;
    score?: number;
    status: string;
  };
}

export default function SubmitSpeakingResult() {
  const router = useRouter();
  const params = useParams();
  const slotId = params.id as string;

  const [slot, setSlot] = useState<SlotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Level states
  const [mcqLevel, setMcqLevel] = useState<CEFRLevel>("A1");
  const [speakingLevel, setSpeakingLevel] = useState<CEFRLevel>("A1");
  const [finalLevel, setFinalLevel] = useState<CEFRLevel>("A1");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadSlotData();
  }, [slotId]);

  // Auto-calculate MCQ level when slot loads
  useEffect(() => {
    if (slot?.testSession?.score) {
      const calculatedLevel = getMCQLevel(slot.testSession.score);
      setMcqLevel(calculatedLevel);

      // Auto-suggest final level (defaults to MCQ level initially)
      setFinalLevel(calculatedLevel);
    }
  }, [slot]);

  // Update final level suggestion when speaking level changes
  useEffect(() => {
    if (mcqLevel && speakingLevel) {
      const suggested = suggestFinalLevel(mcqLevel, speakingLevel);
      setFinalLevel(suggested);
    }
  }, [mcqLevel, speakingLevel]);

  const loadSlotData = async () => {
    try {
      const teacherId = getTeacherId();
      if (!teacherId) {
        setError("Teacher ID not found");
        setLoading(false);
        return;
      }

      const result = await speakingSlotAPI.getByTeacher(teacherId);
      
      if (result.success) {
        const foundSlot = result.data.find((s: SlotData) => s.id === slotId);
        if (foundSlot) {
          setSlot(foundSlot);
        } else {
          setError("Slot not found");
        }
      } else {
        setError("Failed to load slots");
      }
    } catch (err) {
      console.error("Error loading slot:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slot?.testSessionId) {
      alert("Invalid test session");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await speakingSlotAPI.submitResult({
        slotId: slotId,
        sessionId: slot.testSessionId,
        mcqLevel: mcqLevel,
        speakingLevel: speakingLevel,
        finalLevel: finalLevel,
        feedback: feedback.trim() || undefined,
      });

      if (result.success) {
        alert("Speaking test result submitted successfully!");
        router.push("/teacher/speaking-tests");
      } else {
        setError(result.message || "Failed to submit result");
      }
    } catch (err: any) {
      console.error("Error submitting result:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLevelColor = (level: CEFRLevel): string => {
    const colors: Record<CEFRLevel, string> = {
      A1: "bg-red-100 text-red-700 border-red-300",
      A2: "bg-orange-100 text-orange-700 border-orange-300",
      B1: "bg-yellow-100 text-yellow-700 border-yellow-300",
      B2: "bg-green-100 text-green-700 border-green-300",
      C1: "bg-blue-100 text-blue-700 border-blue-300",
      C2: "bg-purple-100 text-purple-700 border-purple-300",
    };
    return colors[level];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !slot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={() => router.push("/teacher/speaking-tests")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Speaking Tests
          </button>
        </div>
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600">Slot not found</p>
          <button
            onClick={() => router.push("/teacher/speaking-tests")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Speaking Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/teacher/speaking-tests")}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Speaking Tests
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Submit Speaking Test Result
          </h1>
        </div>

        {/* Student & Appointment Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student</p>
              <p className="font-semibold text-gray-900 text-lg">
                {slot.student.firstName} {slot.student.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {slot.student.user.email}
              </p>
              {slot.student.user.phone && (
                <p className="text-sm text-gray-600 mt-1">
                  📞 {slot.student.user.phone}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Appointment</p>
              <p className="font-semibold text-gray-900">
                {formatDate(slot.slotDate)}
              </p>
              <p className="text-gray-700 mt-1">
                {formatTime(slot.slotTime)} ({slot.durationMinutes} minutes)
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {slot.status}
              </span>
            </div>
          </div>
        </div>

        {/* MCQ Score & Level */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            MCQ Test Results
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">MCQ Score</p>
              <p className="text-4xl font-bold text-blue-600">
                {slot.testSession?.score || 0}{" "}
                <span className="text-xl text-gray-500">/ 50</span>
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">
                MCQ Level (Auto-calculated)
              </p>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-2xl ${getLevelColor(
                  mcqLevel
                )}`}
              >
                {mcqLevel}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getLevelDescription(mcqLevel)}
              </p>
            </div>
          </div>
        </div>

        {/* Speaking Level Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Enter Speaking Test Results
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Speaking Level Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Speaking Level <span className="text-red-500">*</span>
              </label>
              <select
                value={speakingLevel}
                onChange={(e) => setSpeakingLevel(e.target.value as CEFRLevel)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-gray-900 bg-white"
                required
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level} className="text-gray-900">
                    {level} - {getLevelDescription(level)}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Select the CEFR level based on the student's speaking
                performance
              </p>
            </div>

            {/* Final Level Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Final Level <span className="text-red-500">*</span>
              </label>
              <select
                value={finalLevel}
                onChange={(e) => setFinalLevel(e.target.value as CEFRLevel)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold text-gray-900 bg-white"
                required
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level} className="text-gray-900">
                    {level} - {getLevelDescription(level)}
                  </option>
                ))}
              </select>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  💡 <strong>Suggested:</strong>{" "}
                  {suggestFinalLevel(mcqLevel, speakingLevel)}
                  <span className="text-blue-600 ml-2">
                    (Lower of MCQ and Speaking levels)
                  </span>
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Level Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">MCQ Level</p>
                  <span
                    className={`inline-block px-3 py-1 rounded font-bold ${getLevelColor(
                      mcqLevel
                    )}`}
                  >
                    {mcqLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Speaking Level</p>
                  <span
                    className={`inline-block px-3 py-1 rounded font-bold ${getLevelColor(
                      speakingLevel
                    )}`}
                  >
                    {speakingLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Final Level</p>
                  <span
                    className={`inline-block px-3 py-1 rounded font-bold ${getLevelColor(
                      finalLevel
                    )}`}
                  >
                    {finalLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter detailed feedback about the student's speaking performance (pronunciation, fluency, grammar, vocabulary, etc.)"
              />
              <p className="text-sm text-gray-500 mt-2">
                Provide constructive feedback to help the student improve
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Submitting...
                  </span>
                ) : (
                  "✅ Submit Result"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/teacher/speaking-tests")}
                disabled={submitting}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
