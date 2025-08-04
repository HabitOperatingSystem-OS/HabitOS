import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Smile,
  Frown,
  Meh,
  Save,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { habitsAPI, checkInsAPI } from "../../services/api";
import { SuccessModal, WritingPrompts } from "../../shared/components";

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

      // Prepare habits array for submission

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

      // Submit check-in data

      const response = await checkInsAPI.createBulkCheckIn(payload);

      // Show success modal
      setShowSuccessModal(true);

      setHasCheckedInToday(true);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container-premium section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Daily Check-In
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {hasCheckedInToday
              ? "Here's your progress for today"
              : "Log your progress for today and reflect on your day"}
          </p>
        </div>

        {/* Already Checked In Message */}
        {hasCheckedInToday && (
          <div className="mb-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>
              You've already completed your check-in for today! Come back
              tomorrow for your next check-in.
            </span>
          </div>
        )}

        {/* Today's Check-in Summary - Show when already checked in */}
        {hasCheckedInToday && todayCheckIns.length > 0 && (
          <div className="card-premium p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Today's Check-in Summary</span>
            </h2>

            <div className="space-y-4">
              {/* Mood Summary */}
              {todayCheckIns[0]?.mood_rating && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mood:
                  </span>
                  <div className="flex items-center space-x-2">
                    {getMoodIcon(todayCheckIns[0].mood_rating)}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {todayCheckIns[0].mood_rating}/10
                    </span>
                  </div>
                </div>
              )}

              {/* Completed Habits */}
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            {habit?.title || "Unknown Habit"}
                          </span>
                        </div>
                        {checkIn.actual_value && (
                          <span className="text-sm text-green-600 dark:text-green-400">
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

              {/* Journal Entry */}
              {todayCheckIns[0]?.journal_entry && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Journal Entry:
                  </span>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300">
                      {todayCheckIns[0].journal_entry}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Check-in Form - Show when not checked in */}
        {!hasCheckedInToday && (
          <div className="space-y-6">
            {/* Habits Section */}
            {habits.length > 0 && (
              <div className="card-premium p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Today's Habits ({habits.length})
                </h2>
                <div className="space-y-4">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleHabitToggle(habit.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            checkInData[habit.id]?.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                          }`}
                        >
                          {checkInData[habit.id]?.completed && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {habit.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {habit.description}
                          </p>
                        </div>
                      </div>

                      {/* Value Input for Fitness Habits */}
                      {habit.category === "fitness" &&
                        checkInData[habit.id]?.completed && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Minutes"
                              value={checkInData[habit.id]?.actual_value || ""}
                              onChange={(e) =>
                                handleValueChange(habit.id, e.target.value)
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              min
                            </span>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Section */}
            <div className="card-premium p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How are you feeling today?
              </h2>
              <div className="space-y-4">
                {/* Mood Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mood Rating (1-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodRating}
                      onChange={(e) => setMoodRating(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(moodRating)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {moodRating}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal Section */}
            <div className="card-premium p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Journal Entry (Optional)
              </h2>

              {/* Writing Prompts */}
              <div className="mb-4">
                <WritingPrompts
                  onPromptSelected={(prompt) => {
                    setJournalContent((prev) =>
                      prev ? `${prev}\n\n${prompt}` : prompt
                    );
                  }}
                />
              </div>

              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="Reflect on your day, note any challenges or victories, or just write whatever comes to mind..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Check-in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message.text && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              message.type === "error"
                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                : message.type === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Check-in Saved!"
        message="Your daily check-in has been saved successfully. Great job staying consistent!"
      />
    </div>
  );
};

export default CheckInsPage;
