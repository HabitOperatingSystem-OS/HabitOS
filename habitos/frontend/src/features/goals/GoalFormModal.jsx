import React, { useState, useEffect } from "react";
import { X, Target, Calendar, Hash } from "lucide-react";

const GoalFormModal = ({
  isOpen,
  onClose,
  mode = "create",
  initialGoal = null,
  onSubmit,
  loading = false,
  habits = [], // Only needed for create
  goals = [], // Existing goals to check for duplicates
  checkHabitGoal = null, // Function to check if habit has goal
}) => {
  const [formData, setFormData] = useState({
    habit_id: "",
    title: "",
    target_check_ins: "",
    due_date: "",
    priority: "medium",
    status: "in_progress",
  });
  const [errors, setErrors] = useState({});
  const [habitGoalInfo, setHabitGoalInfo] = useState(null);
  const [checkingHabit, setCheckingHabit] = useState(false);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && initialGoal && isOpen) {
      console.log("Pre-filling form with goal data:", initialGoal);
      setFormData({
        habit_id: initialGoal.habit_id || "",
        title: initialGoal.title || "",
        target_check_ins: initialGoal.target_value?.toString() || "",
        due_date: initialGoal.due_date
          ? new Date(initialGoal.due_date).toISOString().split("T")[0]
          : "",
        priority: initialGoal.priority || "medium",
        status: initialGoal.status || "in_progress",
      });
      setErrors({});
    } else if (mode === "create" && isOpen) {
      setFormData({
        habit_id: "",
        title: "",
        target_check_ins: "",
        due_date: "",
        priority: "medium",
        status: "in_progress",
      });
      setErrors({});
    }
  }, [mode, initialGoal, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (mode === "create" && !formData.habit_id) {
      newErrors.habit_id = "Please select a habit";
    }
    if (mode === "create" && habitGoalInfo && habitGoalInfo.has_goal) {
      newErrors.habit_id =
        "This habit already has a goal. Please edit the existing goal instead.";
    }
    if (!formData.target_check_ins || formData.target_check_ins <= 0) {
      newErrors.target_check_ins = "Target check-ins must be greater than 0";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.due_date = "Due date must be in the future";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
    // Reset form after submit (for create mode)
    if (mode === "create") {
      setFormData({
        habit_id: "",
        title: "",
        target_check_ins: "",
        due_date: "",
        priority: "medium",
        status: "in_progress",
      });
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Check if habit has goal when habit is selected
    if (field === "habit_id" && value && checkHabitGoal) {
      setCheckingHabit(true);
      checkHabitGoal(value)
        .then((result) => {
          setHabitGoalInfo(result);
        })
        .catch((error) => {
          console.error("Failed to check habit goal:", error);
          setHabitGoalInfo(null);
        })
        .finally(() => {
          setCheckingHabit(false);
        });
    } else if (field === "habit_id" && !value) {
      setHabitGoalInfo(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl dark:shadow-zinc-800 max-w-md w-full mx-4 p-6 transform transition-all border border-zinc-200 dark:border-zinc-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-black dark:text-white">
            {mode === "edit" ? "Edit Goal" : "Create New Goal"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {mode === "edit"
              ? "Update your goal details"
              : "Set a target for one of your habits"}
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              Goal Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white ${
                errors.title
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
              placeholder="e.g., Read 10 books, Run a marathon, etc."
            />
            {errors.title && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>
          {/* Habit Selection (only in create mode) */}
          {mode === "create" && (
            <div>
              <label
                htmlFor="habit_id"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
              >
                <Target className="w-4 h-4 inline mr-1" />
                Select Habit
              </label>
              <select
                id="habit_id"
                value={formData.habit_id}
                onChange={(e) => handleInputChange("habit_id", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white ${
                  errors.habit_id
                    ? "border-red-500"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                <option value="">Choose a habit...</option>
                {habits.map((habit) => {
                  // Check if this habit has a goal by looking at existing goals
                  const hasGoal = goals.some(
                    (goal) => goal.habit_id === habit.id
                  );
                  return (
                    <option key={habit.id} value={habit.id} disabled={hasGoal}>
                      {habit.title} {hasGoal ? "(has goal)" : ""}
                    </option>
                  );
                })}
              </select>
              {errors.habit_id && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.habit_id}
                </p>
              )}

              {/* Show habit goal status */}
              {checkingHabit && (
                <p className="text-blue-500 dark:text-blue-400 text-sm mt-1">
                  Checking habit goal status...
                </p>
              )}
              {habitGoalInfo && habitGoalInfo.has_goal && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> This habit already has a goal: "
                    {habitGoalInfo.goal.title}"
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                    You can edit the existing goal instead of creating a new
                    one.
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Target Check-ins */}
          <div>
            <label
              htmlFor="target_check_ins"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              <Hash className="w-4 h-4 inline mr-1" />
              Target Check-ins
            </label>
            <input
              type="number"
              id="target_check_ins"
              min="1"
              value={formData.target_check_ins}
              onChange={(e) =>
                handleInputChange("target_check_ins", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white ${
                errors.target_check_ins
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
              placeholder="e.g., 15"
            />
            {errors.target_check_ins && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.target_check_ins}
              </p>
            )}
          </div>
          {/* Due Date */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white ${
                errors.due_date
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
              min={new Date().toISOString().split("T")[0]}
              style={{
                colorScheme: "dark",
              }}
            />
            {errors.due_date && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.due_date}
              </p>
            )}
          </div>
          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status (edit mode only) */}
          {mode === "edit" && (
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white"
              >
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          )}
          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (mode === "create" && habitGoalInfo && habitGoalInfo.has_goal)
              }
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                ? "Update Goal"
                : habitGoalInfo && habitGoalInfo.has_goal
                ? "Habit Has Goal"
                : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalFormModal;
