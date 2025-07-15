import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  BookOpen,
} from "lucide-react";

const JournalPage = () => {
  const [entries] = useState([
    {
      id: 1,
      date: "2024-01-15",
      title: "A Productive Day",
      content:
        "Today was incredibly productive. I completed all my planned tasks and even had time to work on some personal projects. The morning routine really set the tone for the day.",
      mood: "happy",
      tags: ["productivity", "routine"],
    },
    {
      id: 2,
      date: "2024-01-14",
      title: "Learning New Skills",
      content:
        "Spent the afternoon learning React hooks. It's amazing how much cleaner the code becomes with proper state management. Looking forward to applying this in my projects.",
      mood: "excited",
      tags: ["learning", "coding"],
    },
    {
      id: 3,
      date: "2024-01-13",
      title: "Weekend Reflection",
      content:
        "Had a relaxing weekend with family. It's important to take breaks and recharge. Ready to tackle the new week with fresh energy.",
      mood: "peaceful",
      tags: ["family", "rest"],
    },
  ]);

  const getMoodIcon = (mood) => {
    const moodIcons = {
      happy: "😊",
      excited: "🤩",
      peaceful: "😌",
      sad: "😔",
      angry: "😠",
    };
    return moodIcons[mood] || "😐";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-2">
            Reflect on your thoughts and experiences
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">8 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Entries
          </h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>

        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {entry.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>12</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>3</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
