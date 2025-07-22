import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Grid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { habitsAPI } from "../../services/api";
import { useHabits } from "../../shared/hooks/useHabits";
import HabitCard from "./HabitCard";
import HabitFormModal from "./HabitFormModal";
import { DeleteConfirmModal, LoadingSpinner } from "../../shared/components";

const HabitsPage = () => {
  const { habits, loading, error, refreshHabits } = useHabits();

  // Habits management state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const handleCreateHabit = async (habitData) => {
    try {
      await habitsAPI.createHabit(habitData);
      setShowCreateModal(false);
      refreshHabits(); // Refresh the list
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
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <LoadingSpinner text="Loading habits..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Habits
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Habits</span>
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Habits
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {habits.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Habits
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {habits.filter((h) => h.active).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Due Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {habits.filter((h) => h.is_due_today).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Streak
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {habits.length > 0
                        ? Math.round(
                            habits.reduce(
                              (sum, h) => sum + h.current_streak,
                              0
                            ) / habits.length
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search habits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid"
                        ? "bg-primary-100 text-primary-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list"
                        ? "bg-primary-100 text-primary-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Habits Grid/List */}
          {filteredHabits.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "No habits found"
                    : "No habits yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first habit to get started on your journey"}
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
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  viewMode={viewMode}
                  onEdit={() => openEditModal(habit)}
                  onDelete={() => openDeleteModal(habit)}
                />
              ))}
            </div>
          )}

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
      </div>
    </div>
  );
};

export default HabitsPage;
