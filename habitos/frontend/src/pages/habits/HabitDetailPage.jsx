import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  BarChart3,
  Activity,
  Award,
  Plus,
} from "lucide-react";
import { habitsAPI, checkInsAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import HabitFormModal from "../../components/habits/HabitFormModal";

const HabitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchHabitData();
  }, [id]);

  const fetchHabitData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch habit details
      const habitResponse = await habitsAPI.getHabit(id);
      setHabit(habitResponse.habit);

      // Fetch check-ins for this habit
      const checkInsResponse = await checkInsAPI.getCheckIns();
      const habitCheckIns =
        checkInsResponse.check_ins?.filter((ci) => ci.habit_id === id) || [];
      setCheckIns(habitCheckIns);
    } catch (err) {
      setError(err.message || "Failed to fetch habit data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHabit = async (habitData) => {
    try {
      await habitsAPI.updateHabit(id, habitData);
      setShowEditModal(false);
      fetchHabitData(); // Refresh data
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
      personal: "bg-blue-100 text-blue-800",
      health: "bg-green-100 text-green-800",
      fitness: "bg-red-100 text-red-800",
      productivity: "bg-purple-100 text-purple-800",
      mindfulness: "bg-indigo-100 text-indigo-800",
      learning: "bg-yellow-100 text-yellow-800",
      social: "bg-pink-100 text-pink-800",
      creative: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
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
      weekly: `Weekly (${frequencyCount}x)`,
      monthly: `Monthly (${frequencyCount}x)`,
      custom: `Custom (${frequencyCount}x)`,
    };
    return texts[frequency] || "Daily";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading habit details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Habit
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchHabitData} className="btn-primary mr-2">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Habit Not Found
          </h2>
          <p className="text-gray-600 mb-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/habits"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {getCategoryIcon(habit.category)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
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
                className="btn-outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {habit.current_streak}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Longest Streak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {habit.longest_streak}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Check-ins
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {checkIns.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Started</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(habit.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "history", name: "History", icon: Activity },
                { id: "settings", name: "Settings", icon: Target },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      Habit Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Frequency</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getFrequencyText(
                            habit.frequency,
                            habit.frequency_count
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            habit.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {habit.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Due Today</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            habit.is_due_today
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {habit.is_due_today ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Progress
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Completion Rate</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  {checkIns.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No check-ins yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Start tracking your progress!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {checkIns.slice(0, 5).map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Completed
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  checkIn.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {checkIn.mood && (
                            <span className="text-sm text-gray-600">
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Check-in History
                  </h3>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Check-in
                  </button>
                </div>

                {checkIns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No check-ins yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start tracking your progress to see your history here.
                    </p>
                    <button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Check-in
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkIns.map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Completed
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                checkIn.created_at
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                checkIn.created_at
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {checkIn.mood && (
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {checkIn.mood}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Habit Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Habit Status</p>
                      <p className="text-sm text-gray-600">
                        Enable or disable this habit
                      </p>
                    </div>
                    <button className="btn-outline">
                      {habit.active ? "Disable" : "Enable"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Edit Habit</p>
                      <p className="text-sm text-gray-600">
                        Modify habit details and settings
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn-outline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Delete Habit</p>
                      <p className="text-sm text-red-600">
                        Permanently remove this habit and all data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
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
