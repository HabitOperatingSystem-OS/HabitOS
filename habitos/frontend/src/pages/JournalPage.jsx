import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  BookOpen,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { checkInsAPI } from "../services/api";

const JournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisMonth: 0,
    streak: 0,
  });

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      // For now, we'll use the check-ins API to get journal entries
      // In a real implementation, you'd have a dedicated journal API
      const response = await checkInsAPI.getCheckIns();

      // Filter entries that have journal content (this would come from a proper journal API)
      // For now, we'll use mock data but structure it to match the expected API response
      const mockEntries = [
        {
          id: 1,
          date: "2024-01-15",
          content:
            "Today was incredibly productive. I completed all my planned tasks and even had time to work on some personal projects. The morning routine really set the tone for the day.",
          mood_rating: 8,
          sentiment: "positive",
          tags: ["productivity", "routine"],
        },
        {
          id: 2,
          date: "2024-01-14",
          content:
            "Spent the afternoon learning React hooks. It's amazing how much cleaner the code becomes with proper state management. Looking forward to applying this in my projects.",
          mood_rating: 7,
          sentiment: "positive",
          tags: ["learning", "coding"],
        },
        {
          id: 3,
          date: "2024-01-13",
          content:
            "Had a relaxing weekend with family. It's important to take breaks and recharge. Ready to tackle the new week with fresh energy.",
          mood_rating: 6,
          sentiment: "neutral",
          tags: ["family", "rest"],
        },
      ];

      setEntries(mockEntries);
      setStats({
        totalEntries: mockEntries.length,
        thisMonth: mockEntries.filter((entry) => {
          const entryDate = new Date(entry.date);
          const now = new Date();
          return (
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
          );
        }).length,
        streak: 3, // This would be calculated from actual data
      });
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodIcon = (rating) => {
    if (rating >= 8) return <Smile className="w-5 h-5 text-green-600" />;
    if (rating >= 6) return <Smile className="w-5 h-5 text-yellow-600" />;
    if (rating >= 4) return <Meh className="w-5 h-5 text-orange-600" />;
    return <Frown className="w-5 h-5 text-red-600" />;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      case "neutral":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Daily Reflections
          </h1>
          <p className="text-gray-600 mt-2">
            A log of your daily thoughts and experiences from your check-ins
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEntries}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.thisMonth}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.streak} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Reflections
          </h2>
          <button
            onClick={() => (window.location.href = "/check-ins")}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>
        </div>

        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reflections yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start your daily check-ins to build a collection of meaningful
                reflections.
              </p>
              <button
                onClick={() => (window.location.href = "/check-ins")}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Start Your First Check-In
              </button>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {getMoodIcon(entry.mood_rating)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mood: {entry.mood_rating}/10
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.sentiment && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(
                          entry.sentiment
                        )}`}
                      >
                        {entry.sentiment}
                      </span>
                    )}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
