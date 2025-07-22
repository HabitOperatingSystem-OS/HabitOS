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

// Register Chart.js components and plugins for the line chart
// This is required before using any Chart.js components
ChartJS.register(
  CategoryScale, // For x-axis categories (days of the week)
  LinearScale, // For y-axis numerical values
  PointElement, // For data points on the line
  LineElement, // For the line connecting points
  Title, // For chart titles (disabled in this component)
  Tooltip, // For hover tooltips
  Legend, // For chart legends (disabled in this component)
  Filler // For filling area under the line (not used but registered)
);

const StreakChart = ({ data }) => {
  // Chart configuration options for styling and behavior
  const chartOptions = {
    responsive: true, // Make chart responsive to container size
    maintainAspectRatio: false, // Allow custom height/width ratios

    plugins: {
      // Hide the legend since we only have one dataset
      legend: {
        display: false,
      },
      // Hide the title since we have a custom header
      title: {
        display: false,
      },
      // Customize tooltip appearance and content
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark background
        titleColor: "white", // White title text
        bodyColor: "white", // White body text
        borderColor: "rgba(59, 130, 246, 0.5)", // Blue border
        borderWidth: 1, // Border thickness
        cornerRadius: 8, // Rounded corners
        displayColors: false, // Hide color indicators
        callbacks: {
          // Custom tooltip title format
          title: (context) => `Day ${context[0].label}`,
          // Custom tooltip body format
          label: (context) => `${context.parsed.y} habits completed`,
        },
      },
    },

    scales: {
      // X-axis configuration (days of the week)
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: "#6B7280", // Gray text color
          font: {
            size: 12, // Font size
          },
        },
      },
      // Y-axis configuration (number of habits)
      y: {
        beginAtZero: true, // Start y-axis at 0
        max: 10, // Maximum value on y-axis
        grid: {
          color: "rgba(0, 0, 0, 0.05)", // Very light gray grid lines
        },
        ticks: {
          color: "#6B7280", // Gray text color
          font: {
            size: 12, // Font size
          },
          stepSize: 2, // Show ticks every 2 units
        },
      },
    },

    // Styling for chart elements
    elements: {
      // Data point styling
      point: {
        radius: 4, // Default point size
        hoverRadius: 6, // Point size on hover
        backgroundColor: "rgb(59, 130, 246)", // Blue background
        borderColor: "white", // White border
        borderWidth: 2, // Border thickness
      },
      // Line styling
      line: {
        borderWidth: 3, // Line thickness
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Chart header with title and legend indicator */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Streak</h3>
        <div className="flex items-center space-x-2">
          {/* Blue dot indicator for the legend */}
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Habit Completion</span>
        </div>
      </div>

      {/* Chart container with fixed height */}
      <div className="h-64">
        <Line data={data} options={chartOptions} />
      </div>

      {/* Chart footer with statistics */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        {/* Calculate and display average habits per day */}
        <span>
          Average:{" "}
          {Math.round(
            data.datasets[0].data.reduce((a, b) => a + b, 0) /
              data.datasets[0].data.length
          )}{" "}
          habits/day
        </span>
        {/* Display the best day (highest number of habits completed) */}
        <span>Best day: {Math.max(...data.datasets[0].data)} habits</span>
      </div>
    </div>
  );
};

export default StreakChart;
