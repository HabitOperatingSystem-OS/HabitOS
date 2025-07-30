import React, { useState } from "react";
import { Brain, Calendar, Lightbulb, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";

const SimpleAIDashboard = ({ onBack }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const features = [
    {
      id: "insights",
      title: "AI Insights",
      description: "Get personalized insights for your journal entries",
      icon: <Brain className="h-6 w-6" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      id: "monthly",
      title: "Monthly Summary",
      description:
        "Review your journal entries with AI-powered monthly summaries",
      icon: <Calendar className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      id: "prompts",
      title: "Writing Prompts",
      description: "Get AI-generated prompts to inspire your journaling",
      icon: <Lightbulb className="h-6 w-6" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
  ];

  const renderFeatureContent = () => {
    switch (selectedFeature) {
      case "insights":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI Insights for Journal Entries
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a journal entry to get personalized AI insights and
                reflections.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                AI insights are available when viewing individual journal
                entries. Navigate to your journal entries to use this feature.
              </p>
            </div>
          </div>
        );

      case "monthly":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Monthly Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get an AI-powered summary of your journal entries for{" "}
                {currentMonth}.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                Monthly summaries are now available via the "Generate Monthly AI
                Summary" button on the journal page.
              </p>
            </div>
          </div>
        );

      case "prompts":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Writing Prompts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get AI-generated prompts to inspire your journaling practice.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                Writing prompts are now available on the check-in page to help
                inspire your journal entries.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedFeature) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setSelectedFeature(null)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {features.find((f) => f.id === selectedFeature)?.title}
          </h2>
        </div>

        {renderFeatureContent()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-purple-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Features
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Explore AI-powered features to enhance your journaling experience with
          insights, summaries, and writing prompts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${feature.bgColor} ${feature.borderColor}`}
              onClick={() => setSelectedFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Button>
      </div>
    </motion.div>
  );
};

export default SimpleAIDashboard;
