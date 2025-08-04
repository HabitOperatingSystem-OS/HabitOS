import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Target, Award } from "lucide-react";

// Register Chart.js components and plugins for the line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StreakChart = ({ data }) => {
  // Enhanced chart configuration with better responsive design and mobile optimization
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    // Disable click events to make chart non-interactive
    onClick: null,
    onHover: null,

    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        // Enhanced tooltip callbacks
        callbacks: {
          title: (context) => {
            const day = context[0].label;
            return `${day}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            return `${value} habit${value !== 1 ? "s" : ""} completed`;
          },
          afterLabel: (context) => {
            const value = context.parsed.y;
            if (value === 0) {
              return "No habits completed";
            } else if (value === 1) {
              return "Great start!";
            } else if (value >= 3) {
              return "Excellent progress!";
            }
            return "Keep it up!";
          },
        },
        // Improved tooltip positioning for mobile
        position: "nearest",
        xAlign: "center",
        yAlign: "bottom",
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
            size: window.innerWidth < 768 ? 10 : 11,
            weight: "500",
          },
          maxRotation: 0,
          minRotation: 0,
          // Optimize label display for mobile
          callback: function (value, index) {
            const labels = this.getLabelForValue(value);
            if (window.innerWidth < 640) {
              // Show abbreviated labels on mobile
              return labels.length > 4
                ? labels.substring(0, 3) + "..."
                : labels;
            }
            return labels;
          },
        },
        // Improve mobile touch interaction
        afterFit: function (scale) {
          if (window.innerWidth < 768) {
            scale.paddingLeft = 10;
            scale.paddingRight = 10;
          }
        },
      },
      y: {
        beginAtZero: true,
        max: Math.max(...data.datasets[0].data) + 1,
        grid: {
          color: "rgba(139, 92, 246, 0.1)",
          lineWidth: 1,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: window.innerWidth < 768 ? 10 : 11,
            weight: "500",
          },
          stepSize: 1,
          // Ensure whole numbers
          callback: function (value) {
            return Math.floor(value) === value ? value : "";
          },
        },
        // Optimize Y axis for mobile
        afterFit: function (scale) {
          if (window.innerWidth < 768) {
            scale.paddingTop = 5;
            scale.paddingBottom = 5;
          }
        },
      },
    },

    elements: {
      point: {
        radius: window.innerWidth < 768 ? 6 : 8,
        hoverRadius: window.innerWidth < 768 ? 10 : 12,
        backgroundColor: "rgb(139, 92, 246)",
        borderColor: "white",
        borderWidth: 3,
        hoverBorderColor: "rgb(139, 92, 246)",
        hoverBorderWidth: 3,
        hoverBackgroundColor: "rgb(139, 92, 246)",
        // Ensure points are not clickable
        hitRadius: 0,
      },
      line: {
        borderWidth: window.innerWidth < 768 ? 3 : 4,
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        hoverBorderWidth: window.innerWidth < 768 ? 4 : 6,
        hoverBorderColor: "rgb(139, 92, 246)",
      },
    },
  };

  const averageHabits = Math.round(
    data.datasets[0].data.reduce((a, b) => a + b, 0) /
      data.datasets[0].data.length
  );
  const bestDay = Math.max(...data.datasets[0].data);
  const totalHabits = data.datasets[0].data.reduce((a, b) => a + b, 0);

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gradient-wellness">
              Weekly Streak
            </CardTitle>
            <CardDescription>
              Your habit completion journey over the past week
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-wellness-lavender to-wellness-indigo rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart container with improved mobile responsiveness */}
        <div className="relative">
          <motion.div
            className="h-64 sm:h-72 md:h-80 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Line data={data} options={chartOptions} />

            {/* Gradient overlay for visual enhancement */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-gray-900/5 rounded-xl" />
          </motion.div>
        </div>

        {/* Enhanced statistics with improved mobile layout */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200/50 dark:border-primary-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Daily Average</p>
            <p className="text-xl sm:text-2xl font-bold text-gradient-wellness">
              {averageHabits}
            </p>
            <p className="text-xs text-muted-foreground">habits/day</p>
          </motion.div>

          <motion.div
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-wellness-emerald/10 to-wellness-sage/10 rounded-xl border border-wellness-emerald/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-wellness-emerald mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Best Day</p>
            <p className="text-xl sm:text-2xl font-bold text-gradient-wellness">
              {bestDay}
            </p>
            <p className="text-xs text-muted-foreground">habits completed</p>
          </motion.div>

          <motion.div
            className="text-center p-3 sm:p-4 bg-gradient-to-br from-wellness-lavender/10 to-wellness-indigo/10 rounded-xl border border-wellness-lavender/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-wellness-lavender mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Weekly Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gradient-wellness">
              {totalHabits}
            </p>
            <p className="text-xs text-muted-foreground">habits completed</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakChart;
