import React, { useState, useEffect } from "react";
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Hamburger menu animation variants
  const hamburgerVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 },
  };

  const lineVariants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 },
  };

  const lineVariants2 = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 },
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
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-wellness-rose rounded-full animate-pulse"></span>
              </Button>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>

              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-wellness-sage to-wellness-emerald rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.username || "User"}
                    </p>
                  </div>
                </Link>
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

            {/* Mobile Menu Button with Hamburger Animation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-12 h-12 p-0"
            >
              <motion.div
                className="flex flex-col items-center justify-center w-6 h-6"
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={hamburgerVariants}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full origin-center"
                  variants={lineVariants}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full origin-center mt-1.5"
                  variants={lineVariants2}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 mobile-menu-container"
            >
              <div className="h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-wellness-lavender to-wellness-indigo rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        HabitOS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mobile Menu
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10"
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6">
                  <nav className="space-y-1 px-4">
                    {tabs.map((tab, index) => (
                      <motion.div
                        key={tab.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          ease: "easeOut",
                        }}
                      >
                        <Link
                          to={tab.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center w-full px-4 py-4 rounded-xl transition-all duration-200 min-h-[56px] ${
                            isActiveTab(tab.path)
                              ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-colors ${
                              isActiveTab(tab.path)
                                ? "bg-primary-100 dark:bg-primary-800/30"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            <tab.icon
                              className={`w-5 h-5 ${
                                isActiveTab(tab.path)
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-semibold text-left ${
                                isActiveTab(tab.path)
                                  ? "text-primary-900 dark:text-primary-100"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {tab.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-left leading-tight">
                              {tab.description}
                            </div>
                          </div>
                          {isActiveTab(tab.path) && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* User Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  {/* User Profile */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-wellness-sage to-wellness-emerald rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.username || "User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Premium Member
                      </p>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-12 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-12 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Bell className="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
                      Notifications
                    </Button>
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex justify-center">
                    <ThemeToggle variant="outline" size="sm" showLabel={true} />
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full h-12 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
