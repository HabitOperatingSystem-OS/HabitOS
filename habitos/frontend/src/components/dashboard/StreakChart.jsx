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
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => `Day ${context[0].label}`,
          label: (context) => `${context.parsed.y} habits completed`,
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
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 12,
          },
          stepSize: 2,
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: "rgb(59, 130, 246)",
        borderColor: "white",
        borderWidth: 2,
      },
      line: {
        borderWidth: 3,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Streak</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Habit Completion</span>
        </div>
      </div>

      <div className="h-64">
        <Line data={data} options={chartOptions} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Average:{" "}
          {Math.round(
            data.datasets[0].data.reduce((a, b) => a + b, 0) /
              data.datasets[0].data.length
          )}{" "}
          habits/day
        </span>
        <span>Best day: {Math.max(...data.datasets[0].data)} habits</span>
      </div>
    </div>
  );
};

export default StreakChart;
