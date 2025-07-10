import { useState } from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      name: "Active Habits",
      value: "12",
      change: "+2",
      changeType: "positive",
    },
    {
      name: "Current Streak",
      value: "7 days",
      change: "+1",
      changeType: "positive",
    },
    {
      name: "Completion Rate",
      value: "85%",
      change: "+5%",
      changeType: "positive",
    },
    {
      name: "Goals Achieved",
      value: "3",
      change: "+1",
      changeType: "positive",
    },
  ];

  const recentHabits = [
    {
      id: 1,
      name: "Morning Exercise",
      category: "Fitness",
      streak: 7,
      completed: true,
    },
    {
      id: 2,
      name: "Read 30 minutes",
      category: "Learning",
      streak: 5,
      completed: true,
    },
    {
      id: 3,
      name: "Drink 8 glasses water",
      category: "Health",
      streak: 3,
      completed: false,
    },
    {
      id: 4,
      name: "Meditation",
      category: "Mindfulness",
      streak: 12,
      completed: true,
    },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "habits", name: "Habits", icon: Target },
    { id: "goals", name: "Goals", icon: TrendingUp },
    { id: "journal", name: "Journal", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HabitOS</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Habit
              </button>

              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:block">John Doe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Today's Habits */}
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Today's Habits
                  </h2>
                  <div className="space-y-3">
                    {recentHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              habit.completed ? "bg-success-500" : "bg-gray-300"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {habit.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {habit.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {habit.streak} day streak
                          </p>
                          <p className="text-xs text-gray-600">
                            {habit.completed ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
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
            )}

            {activeTab === "habits" && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Habits
                </h2>
                <p className="text-gray-600">
                  Habits management interface will be implemented here.
                </p>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Goals
                </h2>
                <p className="text-gray-600">
                  Goals tracking interface will be implemented here.
                </p>
              </div>
            )}

            {activeTab === "journal" && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Journal
                </h2>
                <p className="text-gray-600">
                  Journal interface will be implemented here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
