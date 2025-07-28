import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Target, TrendingUp, Calendar, Plus, Search, Eye } from "lucide-react";
import { habitsAPI } from "../../services/api";
import { useHabits } from "../../shared/hooks/useHabits";
import HabitCard from "./HabitCard";
import HabitFormModal from "./HabitFormModal";
import { DeleteConfirmModal, LoadingSpinner } from "../../shared/components";

const HabitsPage = () => {
  const { habits, loading, error, refreshHabits } = useHabits();

  // Stats state
  const [stats, setStats] = useState({
    total_habits: 0,
    active_habits: 0,
    due_today: 0,
    best_streak: 0,
    total_completion_rate: 0,
    habits_with_streaks: 0,
    category_breakdown: {},
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Habits management state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch habit statistics
  const fetchHabitStats = async () => {
    try {
      setStatsLoading(true);
      const response = await habitsAPI.getHabitStats();
      setStats(response);
    } catch (err) {
      console.warn(
        "Failed to fetch habit stats, using calculated values:",
        err
      );
      // Fallback to calculated stats from habits data
      const calculatedStats = {
        total_habits: habits.length,
        active_habits: habits.filter((h) => h.active).length,
        due_today: habits.filter((h) => h.is_due_today && h.active).length, // Simplified fallback
        best_streak:
          habits.length > 0
            ? Math.max(...habits.map((h) => h.longest_streak || 0))
            : 0,
        total_completion_rate: 0,
        habits_with_streaks: habits.filter((h) => h.current_streak > 0).length,
        category_breakdown: {},
      };
      setStats(calculatedStats);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch stats when habits change
  useEffect(() => {
    if (!loading && habits.length > 0) {
      fetchHabitStats();
    }
  }, [habits, loading]);

  const handleCreateHabit = async (habitData) => {
    try {
      await habitsAPI.createHabit(habitData);
      setShowCreateModal(false);
      refreshHabits(); // Refresh the list
      fetchHabitStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to create habit:", err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleUpdateHabit = async (habitData) => {
    try {
      await habitsAPI.updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
      refreshHabits(); // Refresh the list
      fetchHabitStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to update habit:", err);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleDeleteHabit = async () => {
    try {
      await habitsAPI.deleteHabit(deletingHabit.id);
      setDeletingHabit(null);
      setShowDeleteModal(false);
      refreshHabits(); // Refresh the list
      fetchHabitStats(); // Refresh stats
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
  };

  const openDeleteModal = (habit) => {
    setDeletingHabit(habit);
    setShowDeleteModal(true);
  };

  // Filter habits based on search and category
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "personal", label: "Personal" },
    { value: "health", label: "Health" },
    { value: "fitness", label: "Fitness" },
    { value: "productivity", label: "Productivity" },
    { value: "mindfulness", label: "Mindfulness" },
    { value: "learning", label: "Learning" },
    { value: "social", label: "Social" },
    { value: "creative", label: "Creative" },
    { value: "other", label: "Other" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <div className="card-premium p-6">
            <LoadingSpinner text="Loading habits..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <div className="card-premium p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Habits
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button onClick={refreshHabits} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container-premium section-padding">
        <div className="space-y-6">
          {/* Header */}
          <div className="card-premium p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Habits
                </span>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                + New Habit
              </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-premium p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Habits
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.total_habits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Habits
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.active_habits}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Due Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : stats.due_today}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Best Streak
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statsLoading ? "..." : `${stats.best_streak} days`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search habits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Habits Grid/List */}
          {filteredHabits.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No habits found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first habit"}
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Habit
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <HabitFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHabit}
          title="Create New Habit"
        />
      )}

      {editingHabit && (
        <HabitFormModal
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
          onSubmit={handleUpdateHabit}
          habit={editingHabit}
          title="Edit Habit"
        />
      )}

      {showDeleteModal && deletingHabit && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteHabit}
          title="Delete Habit"
          message={`Are you sure you want to delete "${deletingHabit.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default HabitsPage;
