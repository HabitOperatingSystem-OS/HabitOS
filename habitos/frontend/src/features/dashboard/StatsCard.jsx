import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "blue",
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        iconBg: "bg-blue-100",
        iconText: "text-blue-600",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconText: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
        iconBg: "bg-purple-100",
        iconText: "text-purple-600",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
      },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${colorClasses.border} p-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {Icon && (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses.iconBg}`}
              >
                <Icon className={`w-4 h-4 ${colorClasses.iconText}`} />
              </div>
            )}
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>

        {change && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "positive" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
