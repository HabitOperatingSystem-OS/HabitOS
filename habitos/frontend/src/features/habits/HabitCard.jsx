import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";

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
    weekly: frequencyCount > 0 ? `Weekly (${frequencyCount}x)` : "Weekly",
    monthly: frequencyCount > 0 ? `Monthly (${frequencyCount}x)` : "Monthly",
    custom: frequencyCount > 0 ? `Custom (${frequencyCount}x)` : "Custom",
  };
  return texts[frequency] || "Daily";
};

const HabitCard = ({ habit, viewMode = "grid", onEdit, onDelete }) => {
  const isGrid = viewMode === "grid";
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isGrid) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <Link
          to={`/habits/${habit.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          {/* Card Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {getCategoryIcon(habit.category)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {habit.title}
                  </h3>
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

              {/* Status and Frequency - Top-right column */}
              <div className="flex flex-col items-end space-y-2 ml-3">
                {/* Status Indicator */}
                <div
                  className={`flex items-center space-x-1 ${
                    habit.active ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {habit.active ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {habit.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Frequency Information */}
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">
                    {getFrequencyText(habit.frequency, habit.frequency_count)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-6">
              {/* Streak Information */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {habit.current_streak}
                  </p>
                  <p className="text-xs text-gray-600">Current Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {habit.longest_streak}
                  </p>
                  <p className="text-xs text-gray-600">Longest Streak</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
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
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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

              {/* Due Today Indicator */}
              {habit.is_due_today && (
                <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  <span>Due today</span>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Started {new Date(habit.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">{getCategoryIcon(habit.category)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {habit.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                    habit.category
                  )}`}
                >
                  {habit.category.charAt(0).toUpperCase() +
                    habit.category.slice(1)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {getFrequencyText(habit.frequency, habit.frequency_count)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{habit.current_streak} day streak</span>
                </div>
                {habit.is_due_today && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due today</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to={`/habits/${habit.id}`}
              className="btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1 flex items-center space-x-1 whitespace-nowrap"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View</span>
            </Link>

            <button
              onClick={() => onEdit(habit)}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => onDelete(habit)}
              className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

HabitCard.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    frequency_count: PropTypes.number,
    active: PropTypes.bool.isRequired,
    current_streak: PropTypes.number.isRequired,
    longest_streak: PropTypes.number.isRequired,
    start_date: PropTypes.string.isRequired,
    is_due_today: PropTypes.bool,
  }).isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default HabitCard;
