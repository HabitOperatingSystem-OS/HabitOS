import React from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  LogOut,
  User,
  Activity,
  Award,
  Target as TargetIcon,
  BookOpen,
} from "lucide-react";

import { useDashboard } from "../hooks/useDashboard";
import StreakChart from "../components/dashboard/StreakChart";
import TodayHabits from "../components/dashboard/TodayHabits";
import MoodSummary from "../components/dashboard/MoodSummary";
import StatsCard from "../components/dashboard/StatsCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const { dashboardData, loading, error, refreshData } = useDashboard();

  const handleToggleHabit = (habitId) => {
    // This would typically make an API call to update the habit status
    console.log("Toggling habit:", habitId);
    // For now, we'll just refresh the data
    refreshData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={refreshData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const { stats, streakData, todaysHabits, moodSummary } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, John!
          </h1>
          <p className="text-gray-600 mt-2">Here's how you're doing today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Habits"
            value={stats.activeHabits}
            change="+2"
            changeType="positive"
            icon={TargetIcon}
            color="blue"
          />
          <StatsCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            change="+1"
            changeType="positive"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            change="+5%"
            changeType="positive"
            icon={Activity}
            color="purple"
          />
          <StatsCard
            title="Goals Achieved"
            value={stats.goalsAchieved}
            change="+1"
            changeType="positive"
            icon={Award}
            color="orange"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Streak Chart */}
          <StreakChart data={streakData} />

          {/* Today's Habits and Mood Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayHabits
              habits={todaysHabits}
              onToggleHabit={handleToggleHabit}
            />
            <MoodSummary moodData={moodSummary} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Add New Habit</span>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span className="font-medium">View Calendar</span>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <span className="font-medium">View Analytics</span>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
