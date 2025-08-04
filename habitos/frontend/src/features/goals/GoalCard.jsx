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
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Award,
  Flag,
  Brain,
  Heart,
  BookOpen,
  Briefcase,
  Dumbbell,
  Leaf,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Category-based color coding with predefined classes
  const getCategoryConfig = (category) => {
    const categories = {
      wellness: {
        color: "indigo",
        icon: <Heart className="w-6 h-6" />,
        name: "Wellness",
        emoji: "🧘‍♀️",
        bgClass: "bg-indigo-500 hover:bg-indigo-600",
        textClass: "text-indigo-600 dark:text-indigo-400",
        badgeClass: "bg-indigo-100 dark:bg-indigo-900/20",
        gradientClass:
          "from-indigo-50/30 via-transparent to-indigo-100/20 dark:from-indigo-900/10 dark:via-transparent dark:to-indigo-800/10",
      },
      mental: {
        color: "purple",
        icon: <Brain className="w-6 h-6" />,
        name: "Mental",
        emoji: "🧠",
        bgClass: "bg-purple-500 hover:bg-purple-600",
        textClass: "text-purple-600 dark:text-purple-400",
        badgeClass: "bg-purple-100 dark:bg-purple-900/20",
        gradientClass:
          "from-purple-50/30 via-transparent to-purple-100/20 dark:from-purple-900/10 dark:via-transparent dark:to-purple-800/10",
      },
      fitness: {
        color: "red",
        icon: <Dumbbell className="w-6 h-6" />,
        name: "Fitness",
        emoji: "💪",
        bgClass: "bg-red-500 hover:bg-red-600",
        textClass: "text-red-600 dark:text-red-400",
        badgeClass: "bg-red-100 dark:bg-red-900/20",
        gradientClass:
          "from-red-50/30 via-transparent to-red-100/20 dark:from-red-900/10 dark:via-transparent dark:to-red-800/10",
      },
      learning: {
        color: "emerald",
        icon: <BookOpen className="w-6 h-6" />,
        name: "Learning",
        emoji: "📚",
        bgClass: "bg-emerald-500 hover:bg-emerald-600",
        textClass: "text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-100 dark:bg-emerald-900/20",
        gradientClass:
          "from-emerald-50/30 via-transparent to-emerald-100/20 dark:from-emerald-900/10 dark:via-transparent dark:to-emerald-800/10",
      },
      career: {
        color: "slate",
        icon: <Briefcase className="w-6 h-6" />,
        name: "Career",
        emoji: "💼",
        bgClass: "bg-slate-500 hover:bg-slate-600",
        textClass: "text-slate-600 dark:text-slate-400",
        badgeClass: "bg-slate-100 dark:bg-slate-900/20",
        gradientClass:
          "from-slate-50/30 via-transparent to-slate-100/20 dark:from-slate-900/10 dark:via-transparent dark:to-slate-800/10",
      },
      health: {
        color: "green",
        icon: <Leaf className="w-6 h-6" />,
        name: "Health",
        emoji: "🌿",
        bgClass: "bg-green-500 hover:bg-green-600",
        textClass: "text-green-600 dark:text-green-400",
        badgeClass: "bg-green-100 dark:bg-green-900/20",
        gradientClass:
          "from-green-50/30 via-transparent to-green-100/20 dark:from-green-900/10 dark:via-transparent dark:to-green-800/10",
      },
      productivity: {
        color: "blue",
        icon: <Target className="w-6 h-6" />,
        name: "Productivity",
        emoji: "⚡",
        bgClass: "bg-blue-500 hover:bg-blue-600",
        textClass: "text-blue-600 dark:text-blue-400",
        badgeClass: "bg-blue-100 dark:bg-blue-900/20",
        gradientClass:
          "from-blue-50/30 via-transparent to-blue-100/20 dark:from-blue-900/10 dark:via-transparent dark:to-blue-800/10",
      },
      mindfulness: {
        color: "violet",
        icon: <Heart className="w-6 h-6" />,
        name: "Mindfulness",
        emoji: "🧘",
        bgClass: "bg-violet-500 hover:bg-violet-600",
        textClass: "text-violet-600 dark:text-violet-400",
        badgeClass: "bg-violet-100 dark:bg-violet-900/20",
        gradientClass:
          "from-violet-50/30 via-transparent to-violet-100/20 dark:from-violet-900/10 dark:via-transparent dark:to-violet-800/10",
      },
      social: {
        color: "pink",
        icon: <Star className="w-6 h-6" />,
        name: "Social",
        emoji: "👥",
        bgClass: "bg-pink-500 hover:bg-pink-600",
        textClass: "text-pink-600 dark:text-pink-400",
        badgeClass: "bg-pink-100 dark:bg-pink-900/20",
        gradientClass:
          "from-pink-50/30 via-transparent to-pink-100/20 dark:from-pink-900/10 dark:via-transparent dark:to-pink-800/10",
      },
      creative: {
        color: "orange",
        icon: <Award className="w-6 h-6" />,
        name: "Creative",
        emoji: "🎨",
        bgClass: "bg-orange-500 hover:bg-orange-600",
        textClass: "text-orange-600 dark:text-orange-400",
        badgeClass: "bg-orange-100 dark:bg-orange-900/20",
        gradientClass:
          "from-orange-50/30 via-transparent to-orange-100/20 dark:from-orange-900/10 dark:via-transparent dark:to-orange-800/10",
      },
    };

    return categories[category] || categories.productivity;
  };

  const getGoalIcon = (goalType) => {
    const icons = {
      streak: <TrendingUp className="w-6 h-6" />,
      frequency: <Target className="w-6 h-6" />,
      value: <Zap className="w-6 h-6" />,
      custom: <Flag className="w-6 h-6" />,
    };
    return icons[goalType] || <Target className="w-6 h-6" />;
  };

  const getStatusConfig = (status, isOverdue) => {
    if (isOverdue) {
      return {
        color: "rose",
        text: "Overdue",
        icon: <XCircle className="w-4 h-4" />,
        bgClass: "bg-rose-100 dark:bg-rose-900/20",
        textClass: "text-rose-600 dark:text-rose-400",
        borderClass: "border-rose-200 dark:border-rose-800",
      };
    }

    const statusConfigs = {
      completed: {
        color: "green",
        text: "Completed",
        icon: <CheckCircle className="w-4 h-4" />,
        bgClass: "bg-green-100 dark:bg-green-900/20",
        textClass: "text-green-600 dark:text-green-400",
        borderClass: "border-green-200 dark:border-green-800",
      },
      in_progress: {
        color: "blue",
        text: "In Progress",
        icon: <Clock className="w-4 h-4" />,
        bgClass: "bg-blue-100 dark:bg-blue-900/20",
        textClass: "text-blue-600 dark:text-blue-400",
        borderClass: "border-blue-200 dark:border-blue-800",
      },
      paused: {
        color: "yellow",
        text: "Paused",
        icon: <Clock className="w-4 h-4" />,
        bgClass: "bg-yellow-100 dark:bg-yellow-900/20",
        textClass: "text-yellow-600 dark:text-yellow-400",
        borderClass: "border-yellow-200 dark:border-yellow-800",
      },
      cancelled: {
        color: "gray",
        text: "Cancelled",
        icon: <XCircle className="w-4 h-4" />,
        bgClass: "bg-gray-100 dark:bg-gray-800",
        textClass: "text-gray-600 dark:text-gray-400",
        borderClass: "border-gray-200 dark:border-gray-700",
      },
      abandoned: {
        color: "gray",
        text: "Abandoned",
        icon: <XCircle className="w-4 h-4" />,
        bgClass: "bg-gray-100 dark:bg-gray-800",
        textClass: "text-gray-600 dark:text-gray-400",
        borderClass: "border-gray-200 dark:border-gray-700",
      },
    };

    return statusConfigs[status] || statusConfigs.in_progress;
  };

  const getProgressColor = (percentage, isOverdue) => {
    if (isOverdue) return "bg-gradient-to-r from-rose-500 to-pink-500";
    if (percentage >= 100)
      return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (percentage >= 70) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (percentage >= 40)
      return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fixed completion logic
  const isOverdue = goal.is_overdue || false;
  const progressPercentage = goal.progress_percentage || 0;
  const status = goal.status || "in_progress";
  const goalType = goal.goal_type || "custom";

  // Determine category from habit or default to productivity
  const category = habit?.category || "productivity";
  const categoryConfig = getCategoryConfig(category);
  const statusConfig = getStatusConfig(status, isOverdue);

  // Fixed completion logic - only show completed date if actually completed
  const isActuallyCompleted = status === "completed" && goal.completed_date;
  const hasValidDueDate = goal.due_date && goal.due_date !== "No due date";

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -4, scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${Math.min(progressPercentage, 100)}%` },
  };

  const completionVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden min-h-[300px] max-h-[400px] flex flex-col"
    >
      {/* Category-based gradient background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative p-6 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          {/* Left: Category Icon and Title */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors duration-300 ${categoryConfig.bgClass}`}
            >
              {categoryConfig.icon}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{categoryConfig.emoji}</span>
                <span
                  className={`text-xs font-medium ${categoryConfig.textClass} ${categoryConfig.badgeClass} px-2 py-1 rounded-full`}
                >
                  {categoryConfig.name}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 leading-tight break-words">
                {goal.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                {habit?.title || "Unknown Habit"}
              </p>
            </div>
          </div>

          {/* Right: Status Badge and Menu */}
          <div className="flex items-start space-x-1 flex-shrink-0 ml-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgClass} ${statusConfig.textClass} ${statusConfig.borderClass}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </motion.div>

            {/* Action Menu */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[120px]"
                  >
                    <button
                      onClick={() => {
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-3 flex-1">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>
                {goal.current_value || 0} / {goal.target_value} check-ins
              </span>
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              variants={progressVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${getProgressColor(
                progressPercentage,
                isOverdue
              )} relative overflow-hidden`}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Due Date */}
        {hasValidDueDate && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Due: {formatDate(goal.due_date)}</span>
          </div>
        )}

        {/* Footer - Fixed completion logic */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          {isActuallyCompleted ? (
            <motion.div
              variants={completionVariants}
              initial="initial"
              animate="animate"
              className="flex items-center text-sm text-green-600 dark:text-green-400"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="italic">
                Completed on {formatShortDate(goal.completed_date)}
              </span>
            </motion.div>
          ) : hasValidDueDate ? (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Target className="w-4 h-4 mr-2" />
              <span className="italic">
                Target: {formatShortDate(goal.due_date)}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-400 dark:text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span className="italic">No target date set</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GoalCard;
