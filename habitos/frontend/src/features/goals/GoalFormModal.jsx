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
}) => {
  const [formData, setFormData] = useState({
    habit_id: "",
    title: "",
    target_check_ins: "",
    due_date: "",
    priority: "medium",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && initialGoal && isOpen) {
      setFormData({
        habit_id: initialGoal.habit_id || "",
        title: initialGoal.title || "",
        target_check_ins: initialGoal.target_value?.toString() || "",
        due_date: initialGoal.due_date
          ? new Date(initialGoal.due_date).toISOString().split("T")[0]
          : "",
        priority: initialGoal.priority || "medium",
        status: initialGoal.status || "active",
      });
      setErrors({});
    } else if (mode === "create" && isOpen) {
      setFormData({
        habit_id: "",
        title: "",
        target_check_ins: "",
        due_date: "",
        priority: "medium",
        status: "active",
      });
      setErrors({});
    }
  }, [mode, initialGoal, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (mode === "create" && !formData.habit_id) {
      newErrors.habit_id = "Please select a habit";
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
        status: "active",
      });
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === "edit" ? "Edit Goal" : "Create New Goal"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {mode === "edit"
              ? "Update your goal details"
              : "Set a target for one of your habits"}
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Selection (only in create mode) */}
          {mode === "create" && (
            <div>
              <label
                htmlFor="habit_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Target className="w-4 h-4 inline mr-1" />
                Select Habit
              </label>
              <select
                id="habit_id"
                value={formData.habit_id}
                onChange={(e) => handleInputChange("habit_id", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.habit_id ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Choose a habit...</option>
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.title}
                  </option>
                ))}
              </select>
              {errors.habit_id && (
                <p className="text-red-500 text-sm mt-1">{errors.habit_id}</p>
              )}
            </div>
          )}
          {/* Target Check-ins */}
          <div>
            <label
              htmlFor="target_check_ins"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.target_check_ins ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 15"
            />
            {errors.target_check_ins && (
              <p className="text-red-500 text-sm mt-1">
                {errors.target_check_ins}
              </p>
            )}
          </div>
          {/* Due Date */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.due_date ? "border-red-500" : "border-gray-300"
              }`}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.due_date && (
              <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
            )}
          </div>
          {/* Priority (edit mode only) */}
          {mode === "edit" && (
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
          {/* Status (edit mode only) */}
          {mode === "edit" && (
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                ? "Update Goal"
                : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalFormModal;
