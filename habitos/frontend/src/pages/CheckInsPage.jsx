import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  Smile,
  Frown,
  Meh,
  Save,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { habitsAPI, checkInsAPI } from "../services/api";
import SuccessModal from "../components/common/SuccessModal";

const CheckInsPage = () => {
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [allHabits, setAllHabits] = useState([]);
  const [checkInData, setCheckInData] = useState({});
  const [moodRating, setMoodRating] = useState(5);
  const [journalContent, setJournalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, []);

  const loadData = async (signal) => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      // Try to load habits and check-ins separately for better error handling
      let habitsResponse = null;
      let todayResponse = null;

      try {
        habitsResponse = await habitsAPI.getHabits({ signal });
      } catch (habitsError) {
        console.error("Error loading habits:", habitsError);
        setMessage({
          type: "error",
          text: "Failed to load habits. Please check your connection and try again.",
        });
        return;
      }

      try {
        todayResponse = await checkInsAPI.getCheckIns({ signal });
      } catch (checkInsError) {
        console.error("Error loading check-ins:", checkInsError);
        // Continue with empty check-ins if habits loaded successfully
        todayResponse = { check_ins: [] };
        setMessage({
          type: "warning",
          text: "Could not load existing check-ins. Starting fresh for today.",
        });
      }

      // Validate response structure and filter for active habits due today
      const allHabits = Array.isArray(habitsResponse)
        ? habitsResponse
        : habitsResponse.habits || [];

      const dueTodayHabits = allHabits.filter(
        (habit) => habit.active && habit.is_due_today
      );

      setHabits(dueTodayHabits);
      setAllHabits(allHabits);

      // Get today's check-ins
      const today = new Date().toISOString().split("T")[0];
      const checkIns = Array.isArray(todayResponse)
        ? todayResponse
        : todayResponse.check_ins || [];

      const todayCheckIns = checkIns.filter(
        (checkIn) => checkIn.date === today
      );
      setTodayCheckIns(todayCheckIns);

      // Check if user has already checked in today
      const hasCheckedIn = todayCheckIns.length > 0;
      setHasCheckedInToday(hasCheckedIn);

      // Initialize check-in data with existing data or defaults
      const initialData = {};
      dueTodayHabits.forEach((habit) => {
        const existingCheckIn = todayCheckIns.find(
          (ci) => String(ci.habit_id) === String(habit.id)
        );
        initialData[habit.id] = {
          habit_id: habit.id,
          completed: existingCheckIn?.completed || false,
          actual_value: existingCheckIn?.actual_value || null,
        };
      });
      setCheckInData(initialData);

      // Set mood rating from existing check-in if available
      if (todayCheckIns.length > 0) {
        const firstCheckIn = todayCheckIns[0];
        if (firstCheckIn.mood_rating) {
          setMoodRating(firstCheckIn.mood_rating);
        }
      }

      // Clear any previous error messages if everything loaded successfully
      if (todayResponse.check_ins) {
        setMessage({ type: "", text: "" });
      }

      // Show message if user has already checked in today
      if (hasCheckedIn) {
        setMessage({
          type: "info",
          text: "You've already completed your check-in for today. Come back tomorrow!",
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error loading data:", error);
        setMessage({
          type: "error",
          text: "Network error. Please check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHabitToggle = (habitId) => {
    if (hasCheckedInToday) return; // Prevent changes if already checked in

    const normalizedId = String(habitId);

    setCheckInData((prev) => ({
      ...prev,
      [normalizedId]: {
        ...prev[normalizedId],
        completed: !prev[normalizedId]?.completed,
        habit_id: normalizedId,
      },
    }));
  };

  const handleValueChange = (habitId, value) => {
    if (hasCheckedInToday) return; // Prevent changes if already checked in

    const normalizedId = String(habitId);

    setCheckInData((prev) => ({
      ...prev,
      [normalizedId]: {
        ...prev[normalizedId],
        actual_value: value,
        habit_id: normalizedId,
      },
    }));
  };

  const getMoodIcon = (rating) => {
    if (rating >= 8) return <Smile className="w-6 h-6 text-green-600" />;
    if (rating >= 6) return <Smile className="w-6 h-6 text-yellow-600" />;
    if (rating >= 4) return <Meh className="w-6 h-6 text-orange-600" />;
    return <Frown className="w-6 h-6 text-red-600" />;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      case "neutral":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleSubmit = async () => {
    if (hasCheckedInToday) {
      setMessage({
        type: "warning",
        text: "You have already checked in for today. Come back tomorrow!",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      const habitsArray = Object.values(checkInData).filter(
        (data) => data.habit_id
      );

      console.log("Habits array before submission:", habitsArray);

      if (habitsArray.length === 0) {
        setMessage({
          type: "error",
          text: "No habits to check in. Please select at least one habit.",
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const payload = {
        date: today,
        habits: habitsArray,
        mood_rating: moodRating,
        journal_content: journalContent.trim() || null,
      };

      console.log("Submitting payload:", payload);

      const response = await checkInsAPI.createBulkCheckIn(payload);

      // Show success modal
      setShowSuccessModal(true);

      setHasCheckedInToday(true);

      if (response.sentiment) {
        setSentiment(response.sentiment);
      }

      // Reload data to get updated check-ins
      await loadData();
    } catch (error) {
      console.error("Error submitting check-ins:", error);

      let errorMessage = "Failed to save check-ins";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = `${error.response.data.error || "Error"}: ${
          error.response.data.details
        }`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Redirect to dashboard after modal is closed
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Check-In</h1>
          <p className="text-gray-600 mt-2">
            {hasCheckedInToday
              ? "Here's your progress for today"
              : "Log your progress for today and reflect on your day"}
          </p>
        </div>

        {/* Already Checked In Message */}
        {hasCheckedInToday && (
          <div className="mb-6 p-4 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>
              You've already completed your check-in for today! Come back
              tomorrow for your next check-in.
            </span>
          </div>
        )}

        {/* Today's Check-in Summary - Show when already checked in */}
        {hasCheckedInToday && todayCheckIns.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Today's Check-in Summary</span>
            </h2>

            <div className="space-y-4">
              {/* Mood Summary */}
              {todayCheckIns[0]?.mood_rating && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    Mood:
                  </span>
                  <div className="flex items-center space-x-2">
                    {getMoodIcon(todayCheckIns[0].mood_rating)}
                    <span className="font-medium text-gray-700">
                      {todayCheckIns[0].mood_rating}/10
                    </span>
                  </div>
                </div>
              )}

              {/* Completed Habits */}
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Completed Habits:
                </span>
                <div className="mt-2 space-y-2">
                  {todayCheckIns.map((checkIn) => {
                    const habit = allHabits.find(
                      (h) => h.id === checkIn.habit_id
                    );
                    return (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            {habit?.title || "Unknown Habit"}
                          </span>
                        </div>
                        {checkIn.actual_value && (
                          <span className="text-sm text-green-600">
                            {checkIn.actual_value}{" "}
                            {habit?.category === "fitness"
                              ? "minutes"
                              : "units"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Check-in Time */}
              <div className="text-sm text-gray-500">
                Checked in at:{" "}
                {new Date(todayCheckIns[0]?.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Sentiment Display */}
        {sentiment && (
          <div
            className={`mb-6 p-4 rounded-lg inline-flex items-center space-x-2 ${getSentimentColor(
              sentiment
            )}`}
          >
            <span className="font-medium">AI Sentiment Analysis:</span>
            <span className="capitalize">{sentiment}</span>
          </div>
        )}

        {/* Only show the form sections if user hasn't checked in yet */}
        {!hasCheckedInToday && (
          <>
            {/* Habits Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Habits for Today
              </h2>

              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No habits due today.</p>
                  <p className="text-sm text-gray-400">
                    Check your habits page to see all habits or create new ones!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {habits.map((habit) => {
                    const habitData = checkInData[habit.id] || {
                      completed: false,
                    };
                    const isCompleted = habitData.completed;

                    return (
                      <div
                        key={habit.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          isCompleted
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleHabitToggle(habit.id)}
                              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400" />
                              )}
                              <span
                                className={`font-medium ${
                                  isCompleted
                                    ? "text-green-800"
                                    : "text-gray-700"
                                }`}
                              >
                                {habit.title}
                              </span>
                            </button>

                            {/* Category badge */}
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                              {habit.category}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Frequency info */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                Frequency:
                              </span>
                              <span className="text-sm font-medium capitalize">
                                {habit.frequency}
                                {habit.frequency_count > 0 &&
                                  ` (${habit.frequency_count}x)`}
                              </span>
                            </div>

                            {/* Streak info */}
                            {habit.current_streak > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  Streak:
                                </span>
                                <span className="text-sm font-medium text-orange-600">
                                  {habit.current_streak} 🔥
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional habit info */}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Started:{" "}
                            {new Date(habit.start_date).toLocaleDateString()}
                          </span>
                          {habit.longest_streak > 0 && (
                            <span>Best streak: {habit.longest_streak}</span>
                          )}
                        </div>

                        {/* Numeric value input for habits that need it */}
                        {habit.category === "fitness" ||
                        habit.category === "health" ? (
                          <div className="mt-3 flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700">
                              Value:
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={habitData.actual_value || ""}
                              onChange={(e) =>
                                handleValueChange(
                                  habit.id,
                                  parseFloat(e.target.value) || null
                                )
                              }
                              placeholder="e.g., 30"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">
                              {habit.category === "fitness"
                                ? "minutes"
                                : "units"}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mood Rating Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How are you feeling today?
              </h2>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Mood:</span>
                <div className="flex items-center space-x-2">
                  {getMoodIcon(moodRating)}
                  <span className="font-medium text-gray-700">
                    {moodRating}/10
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodRating}
                  onChange={(e) => setMoodRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😔</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
              </div>
            </div>

            {/* Journal Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Daily Reflection (Optional)
              </h2>
              <p className="text-gray-600 mb-4">
                Share your thoughts, feelings, or any insights from today
              </p>

              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="How was your day? What went well? What could be improved?"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />

              {journalContent && (
                <p className="text-sm text-gray-500 mt-2">
                  {journalContent.length} characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Check-In</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          title="Check-in Saved! 🎉"
          message="Great job completing your daily check-in! See you tomorrow for another productive day!"
          autoDismiss={true}
          dismissDelay={4000}
        />
      </div>
    </div>
  );
};

export default CheckInsPage;
