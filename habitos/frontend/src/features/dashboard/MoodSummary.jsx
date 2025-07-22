import React from "react";
import { Smile, TrendingUp, Activity } from "lucide-react";

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
    energetic: "bg-yellow-500",
    focused: "bg-blue-500",
    calm: "bg-green-500",
    happy: "bg-pink-500",
    stressed: "bg-red-500",
    tired: "bg-gray-500",
    excited: "bg-purple-500",
    grateful: "bg-indigo-500",
    motivated: "bg-orange-500",
    relaxed: "bg-teal-500",
  };
  return moodColors[mood] || "bg-gray-500";
};

const getMoodTextColor = (mood) => {
  const textColors = {
    energetic: "text-yellow-700",
    focused: "text-blue-700",
    calm: "text-green-700",
    happy: "text-pink-700",
    stressed: "text-red-700",
    tired: "text-gray-700",
    excited: "text-purple-700",
    grateful: "text-indigo-700",
    motivated: "text-orange-700",
    relaxed: "text-teal-700",
  };
  return textColors[mood] || "text-gray-700";
};

const MoodSummary = ({ moodData }) => {
  const { recentMoods, averageMood, totalCheckIns } = moodData;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mood Summary</h3>
          <p className="text-sm text-gray-600">
            Based on {totalCheckIns} recent check-ins
          </p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Smile className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Average Mood */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Mood</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl">{getMoodEmoji(averageMood)}</span>
              <span className="text-lg font-semibold capitalize text-gray-900">
                {averageMood}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                recentMoods.find((m) => m.mood === averageMood)?.percentage || 0
              )}
              %
            </div>
            <p className="text-xs text-gray-600">positive</p>
          </div>
        </div>
      </div>

      {/* Mood Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Recent Moods</h4>
        {recentMoods.slice(0, 5).map((moodItem, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getMoodColor(
                  moodItem.mood
                )}`}
              >
                <span className="text-white text-sm">
                  {getMoodEmoji(moodItem.mood)}
                </span>
              </div>
              <div>
                <p
                  className={`font-medium capitalize ${getMoodTextColor(
                    moodItem.mood
                  )}`}
                >
                  {moodItem.mood}
                </p>
                <p className="text-xs text-gray-600">
                  {moodItem.count} check-in{moodItem.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getMoodColor(moodItem.mood)}`}
                  style={{ width: `${moodItem.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">
                {moodItem.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mood Insights */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900">Mood Insight</h4>
            <p className="text-sm text-green-700 mt-1">
              You've been feeling mostly {averageMood} lately. Keep up the great
              work with your habits!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodSummary;
