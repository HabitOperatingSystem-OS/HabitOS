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
  const activeGoals = goals.filter((goal) => goal.status === "in_progress");
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const overdueGoals = goals.filter((goal) => goal.is_overdue);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <ErrorMessage message={error} onRetry={fetchGoals} />
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
            Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage your habit goals
          </p>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Goals
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeGoals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedGoals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overdueGoals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {successRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="card-premium p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Goals
            </h2>
            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No goals yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first goal to start tracking your progress
              </p>
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center space-x-2 mx-auto"
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

      {/* Modals */}
      <GoalFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialGoal={selectedGoal}
        mode={modalMode}
        habits={habits}
        loading={formLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default GoalsPage;
