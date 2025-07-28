import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  BarChart3,
  Activity,
  Award,
  Clock,
  Zap,
  Flame,
  Star,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { habitsAPI, checkInsAPI } from "../../services/api";
import { useHabitDetail } from "../../shared/hooks/useHabitDetail";
import {
  LoadingSpinner,
  DeleteConfirmModal,
  DeleteButton,
} from "../../shared/components";
import HabitFormModal from "./HabitFormModal";

const HabitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habit, checkIns, loading, error, refreshData } = useHabitDetail(id);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateHabit = async (habitData) => {
    try {
      await habitsAPI.updateHabit(id, habitData);
      setShowEditModal(false);
      refreshData(); // Refresh data
    } catch (err) {
      console.error("Failed to update habit:", err);
      throw err;
    }
  };

  const handleDeleteHabit = async () => {
    try {
      await habitsAPI.deleteHabit(id);
      setShowDeleteModal(false);
      navigate("/habits"); // Redirect to habits list
    } catch (err) {
      setError(err.message || "Failed to delete habit");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal:
        "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25",
      health:
        "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25",
      fitness:
        "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/25",
      productivity:
        "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25",
      mindfulness:
        "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25",
      learning:
        "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/25",
      social:
        "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/25",
      creative:
        "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25",
      other:
        "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-gray-500/25",
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      personal: "👤",
      health: "🏥",
      fitness: "💪",
      productivity: "⚡",
      mindfulness: "🧘",
      learning: "📚",
      social: "👥",
      creative: "🎨",
      other: "📋",
    };
    return icons[category] || icons.other;
  };

  const getFrequencyText = (frequency, frequencyCount) => {
    const texts = {
      daily: "Daily",
      weekly: frequencyCount > 0 ? `Weekly (${frequencyCount}x)` : "Weekly",
      monthly: frequencyCount > 0 ? `Monthly (${frequencyCount}x)` : "Monthly",
      custom: frequencyCount > 0 ? `Custom (${frequencyCount}x)` : "Custom",
    };
    return texts[frequency] || "Daily";
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      daily: Clock,
      weekly: Calendar,
      monthly: Target,
      custom: Zap,
    };
    return icons[frequency] || Clock;
  };

  const getStreakIcon = (currentStreak) => {
    if (currentStreak >= 30) return Trophy;
    if (currentStreak >= 14) return Star;
    if (currentStreak >= 7) return Flame;
    return TrendingUp;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading habit details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Habit
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={refreshData} className="btn-primary mr-2">
            Try Again
          </button>
          <Link to="/habits" className="btn-secondary">
            Back to Habits
          </Link>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Habit Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The habit you're looking for doesn't exist.
          </p>
          <Link to="/habits" className="btn-primary">
            Back to Habits
          </Link>
        </div>
      </div>
    );
  }

  const FrequencyIcon = getFrequencyIcon(habit.frequency);
  const StreakIcon = getStreakIcon(habit.current_streak);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header with proper spacing */}
      <div className="sticky top-0 z-[60] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left: Back button and title */}
            <div className="flex items-center space-x-4">
              <Link
                to="/habits"
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getCategoryColor(
                    habit.category
                  )}`}
                >
                  <span className="text-xl">
                    {getCategoryIcon(habit.category)}
                  </span>
                </motion.div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {habit.title}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                        habit.category
                      )}`}
                    >
                      {habit.category.charAt(0).toUpperCase() +
                        habit.category.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <FrequencyIcon className="w-3 h-3" />
                      <span>
                        {getFrequencyText(
                          habit.frequency,
                          habit.frequency_count
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Edit and Delete buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with proper top padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card-premium p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center">
                <StreakIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {habit.current_streak}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card-premium p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Longest Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {habit.longest_streak}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-premium p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Check-ins
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {checkIns.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card-premium p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Started
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(habit.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card-premium"
        >
          <div className="p-6">
            <div className="space-y-8">
              {/* Habit Information & Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Habit Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                    Habit Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Frequency
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getFrequencyText(
                          habit.frequency,
                          habit.frequency_count
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          habit.active
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {habit.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Due Today
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          habit.is_due_today
                            ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {habit.is_due_today ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                    Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Completion Rate (30 days)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(
                            habit.calculate_completion_rate
                              ? habit.calculate_completion_rate(30)
                              : 0
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.round(
                              habit.calculate_completion_rate
                                ? habit.calculate_completion_rate(30)
                                : 0
                            )}%`,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Streak Progress</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(
                            (habit.current_streak /
                              Math.max(habit.longest_streak, 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (habit.current_streak /
                                Math.max(habit.longest_streak, 1)) *
                                100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check-in History */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Check-in History
                </h3>

                {checkIns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No check-ins yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start tracking your progress using the daily check-ins
                      page.
                    </p>
                    <Link
                      to="/check-ins"
                      className="btn-primary px-6 py-3 whitespace-nowrap flex items-center justify-center space-x-2 min-w-fit mx-auto"
                    >
                      <span className="text-lg">+</span>
                      <span>Go to Check-ins</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkIns.map((checkIn, index) => (
                      <motion.div
                        key={checkIn.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Daily Check-in Completed
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(
                                checkIn.created_at
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                checkIn.created_at
                              ).toLocaleTimeString()}
                            </p>
                            {checkIn.actual_value && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Value: {checkIn.actual_value}
                                {habit.category === "fitness"
                                  ? " minutes"
                                  : " units"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {checkIn.mood_rating && (
                            <span className="text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                              Mood: {checkIn.mood_rating}/10
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <HabitFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateHabit}
        habit={habit}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteHabit}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.title}"? This action cannot be undone and will also delete all associated check-ins and progress data.`}
      />
    </div>
  );
};

export default HabitDetailPage;
