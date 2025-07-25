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
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");

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
        "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      health:
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300",
      fitness: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300",
      productivity:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
      mindfulness:
        "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300",
      learning:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
      social:
        "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300",
      creative:
        "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300",
      other: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading habit details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/habits"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {getCategoryIcon(habit.category)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {habit.title}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      habit.category
                    )}`}
                  >
                    {habit.category.charAt(0).toUpperCase() +
                      habit.category.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-outline flex items-center space-x-2 whitespace-nowrap"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <DeleteButton
                onClick={() => setShowDeleteModal(true)}
                size="default"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
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
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
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
          </div>
        </div>

        {/* Tabs */}
        <div className="card-premium mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "history", name: "History", icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Habit Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Habit Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Frequency
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getFrequencyText(
                            habit.frequency,
                            habit.frequency_count
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            habit.active
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {habit.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Due Today
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Progress
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Completion Rate</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Streak Progress</span>
                          <span>
                            {Math.round(
                              (habit.current_streak /
                                Math.max(habit.longest_streak, 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (habit.current_streak /
                                  Math.max(habit.longest_streak, 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  {checkIns.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No check-ins yet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Start tracking your progress!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {checkIns.slice(0, 5).map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Completed
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(
                                  checkIn.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {checkIn.mood && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Mood: {checkIn.mood}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Check-in History
                  </h3>
                </div>

                {checkIns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No check-ins yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start tracking your progress using the daily check-ins
                      page.
                    </p>

                    <Link
                      to="/check-ins"
                      className="btn-primary px-6 py-3 whitespace-nowrap flex items-center justify-center space-x-2 min-w-fit"
                    >
                      <span className="text-lg">+</span>
                      <span>Go to Check-ins</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkIns.map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
                            <span className="text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                              Mood: {checkIn.mood_rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
