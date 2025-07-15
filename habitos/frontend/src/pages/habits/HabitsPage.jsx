import React from "react";
import HabitsManager from "../../components/habits/HabitsManager";

const HabitsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HabitsManager />
      </div>
    </div>
  );
};

export default HabitsPage;
