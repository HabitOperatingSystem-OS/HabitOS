import React from "react";
import { CheckCircle, Circle, Clock, TrendingUp } from "lucide-react";

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
    energetic: "bg-yellow-100 text-yellow-800",
    focused: "bg-blue-100 text-blue-800",
    calm: "bg-green-100 text-green-800",
    happy: "bg-pink-100 text-pink-800",
    stressed: "bg-red-100 text-red-800",
    tired: "bg-gray-100 text-gray-800",
    excited: "bg-purple-100 text-purple-800",
    grateful: "bg-indigo-100 text-indigo-800",
    motivated: "bg-orange-100 text-orange-800",
    relaxed: "bg-teal-100 text-teal-800",
  };
  return moodColors[mood] || "bg-gray-100 text-gray-800";
};

const TodayHabits = ({ habits, onToggleHabit }) => {
  const completedCount = habits.filter((habit) => habit.completed).length;
  const totalCount = habits.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Habits
          </h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Completed</span>
          <div className="w-2 h-2 bg-gray-300 rounded-full ml-3"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
              habit.completed
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => onToggleHabit && onToggleHabit(habit.id)}
                className="flex-shrink-0"
              >
                {habit.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4
                    className={`font-medium ${
                      habit.completed
                        ? "text-green-900 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {habit.name}
                  </h4>
                  {habit.mood && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(
                        habit.mood
                      )}`}
                    >
                      <span className="mr-1">{getMoodEmoji(habit.mood)}</span>
                      {habit.mood}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {habit.category}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{habit.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <TrendingUp className="w-3 h-3" />
                <span>{habit.streak} days</span>
              </div>

              <div
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  habit.completed
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {habit.completed ? "Done" : "Pending"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600">No habits scheduled for today</p>
          <p className="text-sm text-gray-500 mt-1">
            Add some habits to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayHabits;
