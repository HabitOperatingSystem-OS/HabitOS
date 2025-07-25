import React, { useState, useEffect } from "react";
import { X, Target, Calendar, Hash, Save } from "lucide-react";
import { habitsAPI, goalsAPI } from "../../services/api";

const GoalEditModal = ({ isOpen, onClose, goal, onGoalUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    target_check_ins: "",
    due_date: "",
    priority: "medium",
    status: "active",
  });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when goal changes
  useEffect(() => {
    if (goal && isOpen) {
      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        title: goal.title || "",
        target_check_ins: goal.target_value?.toString() || "",
        due_date: formatDateForInput(goal.due_date),
        priority: goal.priority || "medium",
        status: goal.status || "active",
      });
      setErrors({});
    }
  }, [goal, isOpen]);

  // Fetch habits when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchHabits();
    }
  }, [isOpen]);

  const fetchHabits = async () => {
    try {
      const response = await habitsAPI.getHabits();
      setHabits(response.habits || []);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.target_check_ins || formData.target_check_ins <= 0) {
      newErrors.target_check_ins = "Target check-ins must be greater than 0";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        title: formData.title.trim(),
        target_value: parseInt(formData.target_check_ins),
        target_unit: "check-ins",
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status,
      };

      console.log("Updating goal with data:", goalData);
      console.log("Goal ID:", goal.id);

      const response = await goalsAPI.updateGoal(goal.id, goalData);
      console.log("Update response:", response);

      // Notify parent first, then close modal
      if (onGoalUpdated) {
        onGoalUpdated(response.goal);
      }
      onClose();
    } catch (error) {
      console.error("Failed to update goal:", error);
      console.error("Error details:", error.response?.data);
      setErrors({ submit: "Failed to update goal. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Prevent body scroll when modal is open
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

  console.log("GoalEditModal render:", { isOpen, goal });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl dark:shadow-zinc-800 max-w-md w-full mx-4 p-6 transform transition-all border border-zinc-200 dark:border-zinc-700"
        style={{ zIndex: 51 }}
      >
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
            Edit Goal
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {goal ? "Update your goal details" : "Loading goal details..."}
          </p>
        </div>

        {/* Form */}
        {!goal ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 dark:text-zinc-400">
              Loading goal details...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
              >
                <Target className="w-4 h-4 inline mr-1" />
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
                placeholder="Enter goal title"
              />
              {errors.title && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.title}
                </p>
              )}
            </div>

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

            {/* Status */}
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
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

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
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-4 py-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Updating..." : "Update Goal"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GoalEditModal;
