import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Target,
  TrendingUp,
  Calendar,
  CheckSquare,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Settings,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render navigation if not authenticated
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: BarChart3,
      path: "/dashboard",
      description: "Your wellness dashboard",
    },
    {
      id: "habits",
      name: "Habits",
      icon: Target,
      path: "/habits",
      description: "Track your daily habits",
    },
    {
      id: "check-ins",
      name: "Check-Ins",
      icon: CheckSquare,
      path: "/check-ins",
      description: "Daily mood & wellness",
    },
    {
      id: "goals",
      name: "Goals",
      icon: TrendingUp,
      path: "/goals",
      description: "Achieve your objectives",
    },
    {
      id: "journal",
      name: "Journal",
      icon: Calendar,
      path: "/journal",
      description: "Reflect and grow",
    },
  ];

  const isActiveTab = (tabPath) => {
    if (tabPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(tabPath);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-nav fixed top-0 left-0 right-0 z-50"
      >
        <div className="container-premium">
          <div className="flex justify-between items-center h-20 px-6">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-wellness-lavender to-wellness-indigo rounded-2xl flex items-center justify-center shadow-premium animate-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-600 via-wellness-lavender to-wellness-indigo rounded-2xl blur opacity-20 animate-pulse-soft"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gradient-wellness">
                  HabitOS
                </h1>
                <p className="text-xs text-muted-foreground">
                  Wellness Platform
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center space-x-2 relative">
              {tabs.map((tab, index) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  <Link
                    to={tab.path}
                    className={`nav-item group relative ${
                      isActiveTab(tab.path) ? "active" : ""
                    }`}
                  >
                    {isActiveTab(tab.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center space-x-3">
                      <tab.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>{tab.name}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <ThemeToggle variant="ghost" size="icon" />

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-wellness-rose rounded-full animate-pulse"></span>
              </Button>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-wellness-sage to-wellness-emerald rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.username || "User"}
                  </p>
                  <p className="text-muted-foreground">Premium Member</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed top-20 left-0 right-0 z-40 glass-nav border-t border-white/20 dark:border-gray-800/20"
          >
            <div className="container-premium px-6 py-4">
              <nav className="space-y-2">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      to={tab.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`nav-item w-full justify-start ${
                        isActiveTab(tab.path) ? "active" : ""
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{tab.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tab.description}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile User Menu */}
                <div className="pt-4 border-t border-white/20 dark:border-gray-800/20 space-y-2">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-wellness-sage to-wellness-emerald rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.username || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Premium Member
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <ThemeToggle variant="outline" size="sm" showLabel={true} />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
