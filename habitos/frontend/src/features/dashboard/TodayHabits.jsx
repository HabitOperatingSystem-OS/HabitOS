import React from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const getMoodEmoji = (mood) => {
  const moodEmojis = {
    energetic: "⚡",
    focused: "🎯",
    calm: "😌",
    happy: "😊",
    stressed: "😰",
    tired: "😴",
    excited: "🤩",
    grateful: "🙏",
    motivated: "💪",
    relaxed: "😌",
  };
  return moodEmojis[mood] || "😐";
};

const getMoodColor = (mood) => {
  const moodColors = {
    energetic:
      "bg-gradient-to-r from-wellness-amber to-wellness-coral text-white",
    focused: "bg-gradient-to-r from-primary-600 to-primary-700 text-white",
    calm: "bg-gradient-to-r from-wellness-sage to-wellness-emerald text-white",
    happy: "bg-gradient-to-r from-wellness-rose to-wellness-coral text-white",
    stressed: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    tired: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    excited:
      "bg-gradient-to-r from-wellness-lavender to-wellness-indigo text-white",
    grateful:
      "bg-gradient-to-r from-wellness-indigo to-wellness-lavender text-white",
    motivated:
      "bg-gradient-to-r from-wellness-coral to-wellness-amber text-white",
    relaxed:
      "bg-gradient-to-r from-wellness-emerald to-wellness-sage text-white",
  };
  return (
    moodColors[mood] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
  );
};

// Progress Donut Chart Component
const ProgressDonut = ({ percentage, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-block progress-donut">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(156, 163, 175, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-gradient-wellness"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>
    </div>
  );
};

// Compact Habit Card Component
const HabitCard = ({ habit, onToggle, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer habit-card ${
        habit.completed
          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50"
          : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-primary-200/50 dark:hover:border-primary-800/50"
      }`}
      onClick={() => onToggle && onToggle(habit.id)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Status indicator */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {habit.completed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-wellness-emerald to-wellness-sage rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:border-primary-400 dark:hover:border-primary-400 transition-colors">
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </motion.div>

          {/* Habit info */}
          <div className="flex-1 min-w-0 ml-4">
            <div className="flex items-center space-x-2">
              <h4
                className={`font-semibold text-sm truncate ${
                  habit.completed
                    ? "text-green-700 dark:text-green-300 line-through"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {habit.name}
              </h4>
              {habit.mood && (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getMoodColor(
                    habit.mood
                  )} shadow-sm flex-shrink-0`}
                >
                  <span className="mr-1">{getMoodEmoji(habit.mood)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                <span className="truncate">{habit.category}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{habit.time}</span>
              </div>
            </div>
          </div>

          {/* Streak and status */}
          <div className="flex items-center space-x-2 ml-4">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span className="font-semibold">{habit.streak}</span>
            </div>

            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                habit.completed
                  ? "bg-gradient-to-r from-wellness-emerald to-wellness-sage text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {habit.completed ? "Done" : "Pending"}
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-wellness-lavender/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

const TodayHabits = ({ habits, onToggleHabit }) => {
  const completedCount = habits.filter((habit) => habit.completed).length;
  const totalCount = habits.length;
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gradient-wellness">
              Today's Habits
            </CardTitle>
            <CardDescription>
              {completedCount} of {totalCount} completed •{" "}
              {completionPercentage.toFixed(0)}% success rate
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-wellness-emerald to-wellness-sage rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Donut Chart */}
        <div className="flex justify-center">
          <ProgressDonut percentage={completionPercentage} />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-wellness-emerald to-wellness-sage h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* Compact Habit Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Habit Status
            </h4>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {habits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={onToggleHabit}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {habits.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No habits scheduled for today
            </h3>
            <p className="text-muted-foreground mb-4">
              Add some habits to start your wellness journey!
            </p>
            <Button variant="wellness" className="animate-float">
              <Target className="w-4 h-4 mr-2" />
              Create Your First Habit
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayHabits;
