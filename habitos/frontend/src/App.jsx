import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import HabitsPage from "./pages/habits/HabitsPage";
import HabitDetailPage from "./pages/habits/HabitDetailPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/habits/:id" element={<HabitDetailPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
