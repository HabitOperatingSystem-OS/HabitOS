import React from "react";
import { Smile, TrendingUp, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { motion } from "framer-motion";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const getMoodChartColor = (mood) => {
  const chartColors = {
    energetic: "#F59E0B",
    focused: "#3B82F6",
    calm: "#10B981",
    happy: "#F43F5E",
    stressed: "#EF4444",
    tired: "#6B7280",
    excited: "#8B5CF6",
    grateful: "#6366F1",
    motivated: "#F97316",
    relaxed: "#059669",
  };
  return chartColors[mood] || "#9CA3AF";
};

// Mood Bar Chart Component - Last 10 Check-ins
const MoodBarChart = ({ moodData }) => {
  // Create mock data for last 10 check-ins (in real app, this would come from API)
  const last10CheckIns = [
    { mood: "energetic", score: 8, date: "Today" },
    { mood: "focused", score: 7, date: "Yesterday" },
    { mood: "calm", score: 9, date: "2 days ago" },
    { mood: "happy", score: 8, date: "3 days ago" },
    { mood: "stressed", score: 5, date: "4 days ago" },
    { mood: "tired", score: 6, date: "5 days ago" },
    { mood: "excited", score: 9, date: "6 days ago" },
    { mood: "grateful", score: 8, date: "7 days ago" },
    { mood: "motivated", score: 7, date: "8 days ago" },
    { mood: "relaxed", score: 8, date: "9 days ago" },
  ];

  const chartData = {
    labels: last10CheckIns.map((checkIn, index) =>
      index === 0
        ? "Today"
        : index === 1
        ? "Yesterday"
        : `${index + 1} days ago`
    ),
    datasets: [
      {
        label: "Mood Score",
        data: last10CheckIns.map((checkIn) => checkIn.score),
        backgroundColor: last10CheckIns.map((checkIn) =>
          getMoodChartColor(checkIn.mood)
        ),
        borderColor: last10CheckIns.map((checkIn) =>
          getMoodChartColor(checkIn.mood)
        ),
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: last10CheckIns.map(
          (checkIn) => getMoodChartColor(checkIn.mood) + "CC"
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const checkIn = last10CheckIns[context.dataIndex];
            return [
              `Mood: ${
                checkIn.mood.charAt(0).toUpperCase() + checkIn.mood.slice(1)
              }`,
              `Score: ${context.parsed.y}/10`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 10,
            weight: "500",
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: "rgba(139, 92, 246, 0.1)",
          lineWidth: 1,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            weight: "500",
          },
          stepSize: 2,
        },
      },
    },
  };

  return (
    <div className="h-48 mood-chart">
      <Bar data={chartData} options={options} />
    </div>
  );
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
        {/* Chart Title */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Last 10 Check-ins
          </h4>
        </div>

        {/* Chart Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 chart-container"
        >
          <MoodBarChart moodData={moodData} />
        </motion.div>

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
      </CardContent>
    </Card>
  );
};

export default MoodSummary;
