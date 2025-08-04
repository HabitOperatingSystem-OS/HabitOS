import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Target, Hash } from "lucide-react";

// Day Selector Component for Weekly and Monthly habits
const DaySelector = ({
  frequency,
  selectedDays,
  onDaysChange,
  frequencyCount = 1,
}) => {
  const weekDays = [
    { value: "Monday", label: "Mon", short: "M" },
    { value: "Tuesday", label: "Tue", short: "T" },
    { value: "Wednesday", label: "Wed", short: "W" },
    { value: "Thursday", label: "Thu", short: "T" },
    { value: "Friday", label: "Fri", short: "F" },
    { value: "Saturday", label: "Sat", short: "S" },
    { value: "Sunday", label: "Sun", short: "S" },
  ];

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      // Remove day
      const newDays = selectedDays.filter((d) => d !== day);
      onDaysChange(newDays);
    } else {
      // Add day - but only if we haven't reached the limit
      if (selectedDays.length < frequencyCount) {
        const newDays = [...selectedDays, day];
        onDaysChange(newDays);
      }
    }
  };

  if (frequency === "weekly") {
    return (
      <div>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-3">
          Select Days of the Week
        </label>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                selectedDays.includes(day.value)
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800"
              }`}
            >
              <div className="text-xs font-medium text-black dark:text-white">
                {day.short}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {day.label}
              </div>
            </button>
          ))}
        </div>
        {selectedDays.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Select {frequencyCount} day{frequencyCount > 1 ? "s" : ""} of the
            week
          </p>
        )}
        {selectedDays.length > 0 && selectedDays.length < frequencyCount && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Select {frequencyCount - selectedDays.length} more day
            {frequencyCount - selectedDays.length > 1 ? "s" : ""}
          </p>
        )}
        {selectedDays.length === frequencyCount && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ {frequencyCount} day{frequencyCount > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );
  }

  if (frequency === "monthly") {
    return (
      <div>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-3">
          Select Days of the Month
        </label>
        <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto">
          {monthDays.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`p-2 rounded-lg border-2 text-center transition-colors ${
                selectedDays.includes(day)
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800"
              }`}
            >
              <div className="text-sm font-medium text-black dark:text-white">
                {day}
              </div>
            </button>
          ))}
        </div>
        {selectedDays.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Select {frequencyCount} day{frequencyCount > 1 ? "s" : ""} of the
            month
          </p>
        )}
        {selectedDays.length > 0 && selectedDays.length < frequencyCount && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Select {frequencyCount - selectedDays.length} more day
            {frequencyCount - selectedDays.length > 1 ? "s" : ""}
          </p>
        )}
        {selectedDays.length === frequencyCount && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ {frequencyCount} day{frequencyCount > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );
  }

  return null;
};

DaySelector.propTypes = {
  frequency: PropTypes.string.isRequired,
  selectedDays: PropTypes.array.isRequired,
  onDaysChange: PropTypes.func.isRequired,
  frequencyCount: PropTypes.number,
};

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
    frequency_count: "",
    goal: "",
    occurrence_days: [],
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
        frequency_count:
          habit.frequency_count !== undefined ? habit.frequency_count : "",
        goal: habit.goal || "",
        occurrence_days: habit.occurrence_days || [],
      });
    } else {
      setFormData({
        title: "",
        category: "personal",
        frequency: "daily",
        frequency_count: "",
        goal: "",
        occurrence_days: [],
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

    if (formData.frequency_count !== "" && formData.frequency_count < 0) {
      newErrors.frequency_count = "Frequency count cannot be negative";
    }

    if (formData.frequency_count !== "" && formData.frequency_count > 100) {
      newErrors.frequency_count = "Frequency count cannot exceed 100";
    }

    // Validate occurrence_days for weekly and monthly habits
    if (formData.frequency === "weekly" || formData.frequency === "monthly") {
      const requiredCount = formData.frequency_count || 1;

      if (formData.occurrence_days.length === 0) {
        newErrors.occurrence_days = `Please select ${requiredCount} day${
          requiredCount > 1 ? "s" : ""
        } for ${formData.frequency} habits`;
      } else if (formData.occurrence_days.length !== requiredCount) {
        newErrors.occurrence_days = `Please select exactly ${requiredCount} day${
          requiredCount > 1 ? "s" : ""
        } (currently selected: ${formData.occurrence_days.length})`;
      }
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

    // Reset occurrence_days when frequency changes
    if (field === "frequency") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        occurrence_days: [],
      }));
    }

    // Trim occurrence_days when frequency_count is reduced
    if (field === "frequency_count") {
      const newCount = value || 1;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        occurrence_days: prev.occurrence_days.slice(0, newCount),
      }));
    }
  };

  const handleDaysChange = (days) => {
    setFormData((prev) => ({
      ...prev,
      occurrence_days: days,
    }));

    // Clear error when user selects days
    if (errors.occurrence_days) {
      setErrors((prev) => ({
        ...prev,
        occurrence_days: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl dark:shadow-zinc-800 max-w-md w-full max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {mode === "edit" ? "Edit Habit" : "Create New Habit"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
            >
              Habit Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-600 ${
                errors.title ? "border-red-300 focus:ring-red-500" : ""
              }`}
              placeholder="e.g., Morning Exercise, Read 30 minutes"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2">
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
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800"
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div className="text-xs font-medium text-black dark:text-white">
                    {category.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2">
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
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 bg-white dark:bg-zinc-800"
                  }`}
                >
                  <div className="text-sm font-medium text-black dark:text-white">
                    {frequency.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Count */}
          {formData.frequency !== "daily" && (
            <div>
              <label
                htmlFor="frequency_count"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 mb-2"
              >
                How many times per {formData.frequency.slice(0, -2)}? (optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="frequency_count"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.frequency_count}
                  onChange={(e) =>
                    handleInputChange(
                      "frequency_count",
                      e.target.value === "" ? "" : parseInt(e.target.value) || 0
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-600 ${
                    errors.frequency_count
                      ? "border-red-300 focus:ring-red-500"
                      : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Hash className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </div>
              {errors.frequency_count && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.frequency_count}
                </p>
              )}
            </div>
          )}

          {/* Day Selector for Weekly and Monthly */}
          {(formData.frequency === "weekly" ||
            formData.frequency === "monthly") && (
            <div>
              <DaySelector
                frequency={formData.frequency}
                selectedDays={formData.occurrence_days}
                onDaysChange={handleDaysChange}
                frequencyCount={formData.frequency_count || 1}
              />
              {errors.occurrence_days && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.occurrence_days}
                </p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors dark:bg-primary-500 dark:hover:bg-primary-600 flex items-center space-x-2"
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

HabitFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  habit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    category: PropTypes.string,
    frequency: PropTypes.string,
    frequency_count: PropTypes.number,
    goal: PropTypes.string,
    occurrence_days: PropTypes.array,
  }),
  mode: PropTypes.oneOf(["create", "edit"]),
};

export default HabitFormModal;
