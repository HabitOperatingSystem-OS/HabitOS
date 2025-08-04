import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Target,
  Zap,
  Star,
  Flame,
  Trophy,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getCategoryColor = (category) => {
  const colors = {
    personal:
      "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25",
    health:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25",
    fitness:
      "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/25",
    productivity:
      "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25",
    mindfulness:
      "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25",
    learning:
      "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/25",
    social:
      "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/25",
    creative:
      "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25",
    other:
      "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-gray-500/25",
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

const getFrequencyText = (frequency, frequencyCount, occurrenceDays = []) => {
  const texts = {
    daily: "Daily",
    weekly: frequencyCount > 0 ? `Weekly (${frequencyCount}x)` : "Weekly",
    monthly: frequencyCount > 0 ? `Monthly (${frequencyCount}x)` : "Monthly",
    custom: frequencyCount > 0 ? `Custom (${frequencyCount}x)` : "Custom",
  };

  let baseText = texts[frequency] || "Daily";

  // Add occurrence days info for weekly and monthly habits
  if (frequency === "weekly" && occurrenceDays.length > 0) {
    const dayAbbreviations = occurrenceDays.map((day) => day.slice(0, 3));
    baseText += ` • ${dayAbbreviations.join(", ")}`;
  } else if (frequency === "monthly" && occurrenceDays.length > 0) {
    const sortedDays = occurrenceDays.sort((a, b) => a - b);
    baseText += ` • ${sortedDays.join(", ")}`;
  }

  return baseText;
};

const getFrequencyIcon = (frequency) => {
  const icons = {
    daily: Clock,
    weekly: Calendar,
    monthly: Target,
    custom: Zap,
  };
  return icons[frequency] || Clock;
};

const getStreakIcon = (currentStreak) => {
  if (currentStreak >= 30) return Trophy;
  if (currentStreak >= 14) return Star;
  if (currentStreak >= 7) return Flame;
  return TrendingUp;
};

const HabitCard = ({ habit }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);

  // Check if habit is due today AND not completed today
  const isDueToday = habit.is_due_today && !habit.completed_today;

  // Calculate progress percentage
  const progressPercentage =
    habit.longest_streak > 0
      ? Math.min((habit.current_streak / habit.longest_streak) * 100, 100)
      : 0;

  // Get streak icon based on current streak
  const StreakIcon = getStreakIcon(habit.current_streak);
  const FrequencyIcon = getFrequencyIcon(habit.frequency);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: { y: -4, scale: 1.02 },
    tap: { scale: 0.98 },
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progressPercentage}%` },
  };

  const streakVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    pulse: { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Link to={`/habits/${habit.id}`} className="block">
        {/* Main Card Container */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-primary-300 dark:group-hover:border-primary-600">
          {/* Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-100/20 dark:from-primary-900/10 dark:via-transparent dark:to-primary-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Card Content */}
          <div className="relative p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              {/* Left: Icon and Title */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getCategoryColor(
                    habit.category
                  )}`}
                >
                  <span className="text-xl">
                    {getCategoryIcon(habit.category)}
                  </span>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {habit.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                        habit.category
                      )}`}
                    >
                      {habit.category.charAt(0).toUpperCase() +
                        habit.category.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <FrequencyIcon className="w-3 h-3" />
                      <span>
                        {getFrequencyText(
                          habit.frequency,
                          habit.frequency_count,
                          habit.occurrence_days
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Status Indicator */}
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    habit.active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>{habit.active ? "Active" : "Inactive"}</span>
                </motion.div>
              </div>
            </div>

            {/* Streak Section */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Current Streak */}
                <motion.div
                  variants={streakVariants}
                  initial="initial"
                  animate="animate"
                  className="relative group/streak"
                >
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <StreakIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          Current Streak
                        </span>
                      </div>
                      <button
                        ref={tooltipRef}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <motion.div
                      key={habit.current_streak}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-bold text-primary-900 dark:text-primary-100"
                    >
                      {habit.current_streak}
                    </motion.div>
                    <div className="text-xs text-primary-600 dark:text-primary-400">
                      {habit.current_streak === 1 ? "day" : "days"}
                    </div>
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg z-20 whitespace-nowrap"
                      >
                        Consecutive days completed
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Longest Streak */}
                <motion.div
                  variants={streakVariants}
                  initial="initial"
                  animate="animate"
                  className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Longest Streak
                    </span>
                  </div>
                  <motion.div
                    key={habit.longest_streak}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold text-amber-900 dark:text-amber-100"
                  >
                    {habit.longest_streak}
                  </motion.div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    {habit.longest_streak === 1 ? "day" : "days"}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress to Best
                </span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              {habit.longest_streak > 0 ? (
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      variants={progressVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full relative overflow-hidden"
                    >
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {habit.current_streak === habit.longest_streak
                      ? "🎉 You're at your best!"
                      : `${
                          habit.longest_streak - habit.current_streak
                        } more days to beat your record!`}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Start tracking to build your streak! 🔥
                  </div>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="space-y-2">
              {/* Due Today Indicator */}
              {isDueToday && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Due today</span>
                </motion.div>
              )}

              {/* Completed Today Indicator */}
              {habit.completed_today && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Completed today</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

HabitCard.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    frequency_count: PropTypes.number,
    occurrence_days: PropTypes.array,
    active: PropTypes.bool.isRequired,
    current_streak: PropTypes.number.isRequired,
    longest_streak: PropTypes.number.isRequired,
    start_date: PropTypes.string.isRequired,
    is_due_today: PropTypes.bool,
    completed_today: PropTypes.bool,
  }).isRequired,
};

export default HabitCard;
