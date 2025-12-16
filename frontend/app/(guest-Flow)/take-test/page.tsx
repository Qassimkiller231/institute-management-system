"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { testAPI } from "@/lib/api";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  orderNumber: number;
}

interface Test {
  id: string;
  name: string;
  testType: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
}

interface TestOption {
  id: string;
  name: string;
  testType: string;
  totalQuestions: number;
  durationMinutes: number;
}

export default function TakeTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "taking">("select");
  const [availableTests, setAvailableTests] = useState<TestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadAvailableTests();
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (sessionId && Object.keys(answers).length > 0) {
      localStorage.setItem(`test_answers_${sessionId}`, JSON.stringify(answers));
      localStorage.setItem(`test_current_question_${sessionId}`, currentQuestion.toString());
    }
  }, [answers, currentQuestion, sessionId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted && step === "taking") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted, step]);

  const loadAvailableTests = async () => {
    try {
      const studentId = localStorage.getItem("studentId");
      const token = localStorage.getItem("authToken");

      if (!studentId) {
        setError("Student ID not found. Please register again.");
        router.push("/register");
        return;
      }

      if (!token) {
        setError("Not authenticated. Please login again.");
        router.push("/login");
        return;
      }

      const testsResult = await testAPI.getPlacementTests();
      const tests = testsResult.tests || testsResult.data || [];

      if (!testsResult.success || tests.length === 0) {
        setError("No placement tests available");
        setLoading(false);
        return;
      }

      setAvailableTests(tests);
    } catch (err: any) {
      setError(`Error: ${err.message || "Network error. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
  if (!selectedTestId) {
    setError('Please select a test');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const studentId = localStorage.getItem('studentId');
    
    console.log('Student ID from localStorage:', studentId);
    
    if (!studentId) {
      setError('Student ID not found. Please register again.');
      setTimeout(() => router.push('/register'), 2000);
      return;
    }

    // Start test session
    const sessionResult = await testAPI.startSession(studentId, selectedTestId);
    console.log('Session result:', sessionResult);
    if (!sessionResult.success) {
      // If error indicates already taken, try to get the result
      if (sessionResult.message?.includes('already taken') || sessionResult.message?.includes('already have')) {
        try {
          const lastSessionResult = await testAPI.getLastSession(studentId, selectedTestId);
          console.log('Last session result:', lastSessionResult);
          
          if (lastSessionResult.success && lastSessionResult.session) {
            const status = lastSessionResult.session.status;
            // If it's a completed session, show results
            if (['COMPLETED', 'FINAL_RESULTS', 'MCQ_COMPLETED', 'SPEAKING_COMPLETED'].includes(status)) {
              setTestResult(lastSessionResult.session);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error fetching last session:', e);
        }
      }
      
      setError(sessionResult.message || 'Failed to start test');
      setLoading(false);
      return;
    }

    // Normal flow - new session created successfully
    setSessionId(sessionResult.session.id);

    // Get questions
    const questionsResult = await testAPI.getSessionQuestions(sessionResult.session.id);
    console.log('Questions result:', questionsResult);
    
    if (questionsResult.success && questionsResult.test) {
      if (!questionsResult.test.questions || questionsResult.test.questions.length === 0) {
        setError('This test has no questions. Please contact support.');
        setLoading(false);
        return;
      }
      
      setTest(questionsResult.test);
      setTimeLeft(questionsResult.test.durationMinutes * 60);
      setStep('taking');
    } else {
      setError('Failed to load questions');
    }
  } catch (err: any) {
    console.error('Start test error:', err);
    setError(`Error: ${err.message || 'Network error. Please try again.'}`);
  } finally {
    setLoading(false);
  }
};

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const result = await testAPI.submitMCQ(sessionId, answers);

      if (result.success) {
        setSubmitted(true);
        localStorage.setItem("testSessionId", sessionId);
        
        // Clear saved progress from localStorage
        localStorage.removeItem(`test_answers_${sessionId}`);
        localStorage.removeItem(`test_current_question_${sessionId}`);
      } else {
        setError(result.message || "Failed to submit test");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Test Selection Screen
  if (step === "select") {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Tests...
            </h2>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push("/programs")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Programs
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Select Your Placement Test
            </h1>
            <p className="text-xl text-gray-700">
              Choose a test to determine your English level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {availableTests.map((testOption) => (
              <div
                key={testOption.id}
                onClick={() => setSelectedTestId(testOption.id)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition border-2 ${
                  selectedTestId === testOption.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {testOption.name}
                  </h3>
                  {selectedTestId === testOption.id && (
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="font-medium">
                      {testOption.totalQuestions} Questions
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {testOption.durationMinutes} Minutes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={startTest}
              disabled={!selectedTestId || loading}
              className="bg-blue-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Starting Test..." : "Start Test →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Taking Test Screen (rest of your existing code)
  if (loading && !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Test...
          </h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (testResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-blue-600 text-6xl mb-4">ℹ️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Already Completed
          </h1>
          <p className="text-gray-700 mb-4 text-lg">
            You have already completed this test.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-gray-500 text-sm">Status</span>
                <p className="font-semibold">{testResult.status}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Score</span>
                <p className="font-semibold">{testResult.score ? `${testResult.score}%` : 'Pending'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Date</span>
                <p className="font-semibold">{new Date(testResult.startedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/book-speaking")}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition text-lg mb-3"
          >
            Book Speaking Test Appointment →
          </button>
          <button
            onClick={() => { setTestResult(null); setSelectedTestId(''); setStep('select'); }}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-200 transition text-lg"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Submitted!
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Great job! To complete your placement test, please book a speaking
            test appointment.
          </p>
          <button
            onClick={() => router.push("/book-speaking")}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition text-lg"
          >
            Book Speaking Test Appointment →
          </button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const question = test.questions[currentQuestion];
if (!question) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">Question data is missing. Please restart the test.</p>
      </div>
    </div>
  );
}

  // Handle options - they are stored as JSON string in database
  let options: string[] = [];
  
  if (question.options) {
    try {
      // If it's a string, parse it
      if (typeof question.options === 'string') {
        options = JSON.parse(question.options);
      } 
      // If it's already an array, use it directly
      else if (Array.isArray(question.options)) {
        options = question.options;
      }
    } catch (error) {
      console.error('Error parsing options:', error, question.options);
      options = [];
    }
  }

  console.log('Question:', question.questionText);
  console.log('Question Type:', question.questionType);
  console.log('Raw options:', question.options);
  console.log('Parsed options:', options);


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {test.totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${
                  timeLeft < 300 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-600">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((currentQuestion + 1) / test.totalQuestions) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {question.questionText}
          </h2>

          {/* Render based on question type */}
          {question.questionType === 'FILL_BLANK' ? (
            // Text input for fill-in-the-blank questions
            <div>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-2">
                Write your answer in the text box above
              </p>
            </div>
          ) : (
            // Multiple choice options
            <div className="space-y-3">
              {options.map((option: any, index: number) => {
                const optionLabel = String.fromCharCode(65 + index);
                
                // Handle both object {id, text, isCorrect} and string formats
                const optionText = typeof option === 'object' ? option.text : option;
                const optionValue = typeof option === 'object' ? option.text : option;
                
                const isSelected = answers[question.id] === optionValue;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(question.id, optionValue)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 bg-white"
                    }`}
                  >
                    <div className="flex items-start">
                      <span
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-gray-900 font-medium pt-1">
                        {optionText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} of {test.totalQuestions} answered
          </div>

          {currentQuestion === test.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Test"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}