import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

const GoalCard = ({ goal, habit, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue)
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "active":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20";
      case "paused":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
      case "cancelled":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  const getStatusIcon = (status, isOverdue) => {
    if (isOverdue) return <XCircle className="w-4 h-4" />;
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "active":
        return <Clock className="w-4 h-4" />;
      case "paused":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressColor = (percentage, isOverdue) => {
    if (isOverdue) return "bg-red-500";
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = goal.is_overdue || false;
  const progressPercentage = goal.progress_percentage || 0;
  const status = goal.status || "active";

  return (
    <div className="card-premium p-4 hover:shadow-premium transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            {habit?.title || "Unknown Habit"}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {goal.title}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              status,
              isOverdue
            )}`}
          >
            {getStatusIcon(status, isOverdue)}
            <span className="capitalize">{isOverdue ? "Overdue" : status}</span>
          </div>

          {/* Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    console.log("Edit button clicked for goal:", goal);
                    setShowMenu(false);
                    onEdit(goal);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(goal);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>
            <Target className="w-3 h-3 inline mr-1" />
            Progress: {goal.current_value || 0} / {goal.target_value} check-ins
          </span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
              progressPercentage,
              isOverdue
            )}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Due Date */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Due: {formatDate(goal.due_date)}</span>
      </div>

      {/* Additional Info */}
      {goal.completed_date && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Completed on {formatDate(goal.completed_date)}
        </div>
      )}
    </div>
  );
};

export default GoalCard;
