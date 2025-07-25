import React from "react";
import { Smile, TrendingUp, Activity, Heart, Brain, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { motion } from "framer-motion";

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
    energetic: "from-wellness-amber to-wellness-coral",
    focused: "from-primary-600 to-primary-700",
    calm: "from-wellness-sage to-wellness-emerald",
    happy: "from-wellness-rose to-wellness-coral",
    stressed: "from-red-500 to-red-600",
    tired: "from-gray-500 to-gray-600",
    excited: "from-wellness-lavender to-wellness-indigo",
    grateful: "from-wellness-indigo to-wellness-lavender",
    motivated: "from-wellness-coral to-wellness-amber",
    relaxed: "from-wellness-emerald to-wellness-sage",
  };
  return moodColors[mood] || "from-gray-400 to-gray-500";
};

const getMoodTextColor = (mood) => {
  const textColors = {
    energetic: "text-wellness-amber",
    focused: "text-primary-600",
    calm: "text-wellness-emerald",
    happy: "text-wellness-rose",
    stressed: "text-red-600",
    tired: "text-gray-600",
    excited: "text-wellness-lavender",
    grateful: "text-wellness-indigo",
    motivated: "text-wellness-coral",
    relaxed: "text-wellness-emerald",
  };
  return textColors[mood] || "text-gray-600";
};

const MoodSummary = ({ moodData }) => {
  const { recentMoods, averageMood, totalCheckIns } = moodData;

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gradient-wellness">
              Mood Summary
            </CardTitle>
            <CardDescription>
              Based on {totalCheckIns} recent check-ins
            </CardDescription>
          </div>
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-wellness-lavender to-wellness-indigo rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Smile className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Average Mood */}
        <motion.div
          className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Mood
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <motion.span
                  className="text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getMoodEmoji(averageMood)}
                </motion.span>
                <span className="text-xl font-bold capitalize text-gradient-wellness">
                  {averageMood}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient-wellness">
                {Math.round(
                  recentMoods.find((m) => m.mood === averageMood)?.percentage ||
                    0
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">positive</p>
            </div>
          </div>
        </motion.div>

        {/* Mood Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Moods
          </h4>
          <div className="space-y-3">
            {recentMoods.slice(0, 5).map((moodItem, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    className={`w-10 h-10 bg-gradient-to-br ${getMoodColor(
                      moodItem.mood
                    )} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="text-white text-sm">
                      {getMoodEmoji(moodItem.mood)}
                    </span>
                  </motion.div>
                  <div>
                    <p
                      className={`font-semibold capitalize ${getMoodTextColor(
                        moodItem.mood
                      )}`}
                    >
                      {moodItem.mood}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {moodItem.count} check-in{moodItem.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${getMoodColor(
                        moodItem.mood
                      )}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${moodItem.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-10 text-right">
                    {moodItem.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mood Insights */}
        <motion.div
          className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start space-x-4">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-wellness-emerald to-wellness-sage rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                Mood Insight
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You've been feeling mostly{" "}
                <span className="font-semibold capitalize">{averageMood}</span>{" "}
                lately. Keep up the great work with your wellness habits! ✨
              </p>
            </div>
          </div>
        </motion.div>

        {/* Wellness Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            className="text-center p-4 bg-gradient-to-br from-wellness-rose/10 to-wellness-coral/10 rounded-xl border border-wellness-rose/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Heart className="w-6 h-6 text-wellness-rose mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Emotional</p>
            <p className="text-lg font-bold text-gradient-wellness">85%</p>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-gradient-to-br from-wellness-lavender/10 to-wellness-indigo/10 rounded-xl border border-wellness-lavender/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Brain className="w-6 h-6 text-wellness-lavender mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Mental</p>
            <p className="text-lg font-bold text-gradient-wellness">92%</p>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-gradient-to-br from-wellness-amber/10 to-wellness-coral/10 rounded-xl border border-wellness-amber/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Zap className="w-6 h-6 text-wellness-amber mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Energy</p>
            <p className="text-lg font-bold text-gradient-wellness">78%</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodSummary;
