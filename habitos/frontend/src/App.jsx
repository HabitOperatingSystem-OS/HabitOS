import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import HabitsPage from "./pages/habits/HabitsPage";
import HabitDetailPage from "./pages/habits/HabitDetailPage";
import GoalsPage from "./pages/GoalsPage";
import JournalPage from "./pages/JournalPage";

// Layout component for pages that need navigation
const ProtectedLayout = ({ children }) => (
  <>
    <Navigation />
    {children}
  </>
);

// Route configuration for better maintainability
const routes = [
  // Public routes
  { path: "/", element: <Home />, protected: false },
  { path: "/login", element: <Login />, protected: false },
  { path: "/signup", element: <Signup />, protected: false },

  // Protected routes (with navigation)
  { path: "/dashboard", element: <Dashboard />, protected: true },
  { path: "/habits", element: <HabitsPage />, protected: true },
  { path: "/habits/:id", element: <HabitDetailPage />, protected: true },
  { path: "/goals", element: <GoalsPage />, protected: true },
  { path: "/journal", element: <JournalPage />, protected: true },
];

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {routes.map(({ path, element, protected: isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedLayout>{element}</ProtectedLayout>
                ) : (
                  element
                )
              }
            />
          ))}
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
