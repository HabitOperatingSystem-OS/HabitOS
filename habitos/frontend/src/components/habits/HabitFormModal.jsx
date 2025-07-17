import React, { useState, useEffect } from "react";
import { X, Target, Clock, Hash } from "lucide-react";

const HabitFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  habit,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "personal",
    frequency: "daily",
    frequency_count: 1,
    goal: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "personal", label: "Personal", icon: "👤" },
    { value: "health", label: "Health", icon: "🏥" },
    { value: "fitness", label: "Fitness", icon: "💪" },
    { value: "productivity", label: "Productivity", icon: "⚡" },
    { value: "mindfulness", label: "Mindfulness", icon: "🧘" },
    { value: "learning", label: "Learning", icon: "📚" },
    { value: "social", label: "Social", icon: "👥" },
    { value: "creative", label: "Creative", icon: "🎨" },
    { value: "other", label: "Other", icon: "📋" },
  ];

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom" },
  ];

  useEffect(() => {
    if (habit && mode === "edit") {
      setFormData({
        title: habit.title || "",
        category: habit.category || "personal",
        frequency: habit.frequency || "daily",
        frequency_count: habit.frequency_count || 1,
        goal: habit.goal || "",
      });
    } else {
      setFormData({
        title: "",
        category: "personal",
        frequency: "daily",
        frequency_count: 1,
        goal: "",
      });
    }
    setErrors({});
  }, [habit, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (formData.frequency_count < 1) {
      newErrors.frequency_count = "Frequency count must be at least 1";
    }

    if (formData.frequency_count > 100) {
      newErrors.frequency_count = "Frequency count cannot exceed 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      // Handle specific API errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "edit" ? "Edit Habit" : "Create New Habit"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Habit Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`input ${
                errors.title ? "border-red-300 focus:ring-red-500" : ""
              }`}
              placeholder="e.g., Morning Exercise, Read 30 minutes"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange("category", category.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.category === category.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div className="text-xs font-medium">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencies.map((frequency) => (
                <button
                  key={frequency.value}
                  type="button"
                  onClick={() =>
                    handleInputChange("frequency", frequency.value)
                  }
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.frequency === frequency.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium">{frequency.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Count */}
          {formData.frequency !== "daily" && (
            <div>
              <label
                htmlFor="frequency_count"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How many times per {formData.frequency.slice(0, -2)}?
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="frequency_count"
                  min="1"
                  max="100"
                  value={formData.frequency_count}
                  onChange={(e) =>
                    handleInputChange(
                      "frequency_count",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className={`input ${
                    errors.frequency_count
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Hash className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {errors.frequency_count && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.frequency_count}
                </p>
              )}
            </div>
          )}

          {/* Goal (Optional) */}
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Goal (Optional)
            </label>
            <textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              rows={3}
              className="input"
              placeholder="e.g., Build a consistent morning routine, Read 12 books this year"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Add a specific goal or motivation for this habit
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  {mode === "edit" ? "Update Habit" : "Create Habit"}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitFormModal;
