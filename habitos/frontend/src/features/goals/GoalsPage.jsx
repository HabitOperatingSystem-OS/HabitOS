import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, Target, Award } from "lucide-react";
import { useGoals } from "../../shared/hooks";
import {
  LoadingSpinner,
  ErrorMessage,
  Toast,
  DeleteConfirmModal,
} from "../../shared/components";
import GoalFormModal from "./GoalFormModal";
import GoalCard from "./GoalCard";

const GoalsPage = () => {
  const {
    goals,
    habits,
    loading,
    error,
    fetchGoals,
    createGoal,
    patchGoal,
    deleteGoal,
    checkHabitGoal,
  } = useGoals();

  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Calculate stats
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const successRate =
    goals.length > 0
      ? Math.round((completedGoals.length / goals.length) * 100)
      : 0;

  // Handlers
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedGoal(null);
    setIsModalOpen(true);
  };
  const openEditModal = (goal) => {
    setModalMode("edit");
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGoal(null);
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (modalMode === "create") {
        const payload = {
          habit_id: formData.habit_id,
          title: formData.title,
          goal_type: "count",
          target_value: parseInt(formData.target_check_ins),
          target_unit: "check-ins",
          due_date: formData.due_date,
          priority: "medium",
        };
        await createGoal(payload);
        setToast({
          show: true,
          message: "Goal created successfully!",
          type: "success",
        });
      } else if (modalMode === "edit" && selectedGoal) {
        const payload = {
          title: formData.title || selectedGoal.title,
          target_value: parseInt(formData.target_check_ins),
          target_unit: "check-ins",
          due_date: formData.due_date,
          priority: formData.priority,
          status: formData.status,
        };
        await patchGoal(selectedGoal.id, payload);
        setToast({
          show: true,
          message: "Goal updated successfully!",
          type: "success",
        });
      }
      closeModal();
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to save goal. Please try again.",
        type: "error",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGoal = (goal) => {
    setSelectedGoal(goal);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteGoal(selectedGoal.id);
      setToast({
        show: true,
        message: "Goal deleted successfully!",
        type: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedGoal(null);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to delete goal. Please try again.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} onRetry={fetchGoals} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your habit goals
          </p>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Goals
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeGoals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedGoals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {successRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No goals yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first goal to start tracking your habit progress
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Goal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const habit = habits.find((h) => h.id === goal.habit_id);
                return (
                  <GoalCard
                    key={`${goal.id}-${goal.updated_at}`}
                    goal={goal}
                    habit={habit}
                    onEdit={openEditModal}
                    onDelete={handleDeleteGoal}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Goal Form Modal (Create/Edit) */}
      <GoalFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        initialGoal={selectedGoal}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        habits={habits}
        goals={goals}
        checkHabitGoal={checkHabitGoal}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedGoal(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete the goal "${selectedGoal?.title}"? This action cannot be undone.`}
        confirmText="Delete Goal"
        cancelText="Cancel"
      />
      {/* Toast Notification */}
      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default GoalsPage;
