import { Shield, Sparkles, Heart } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";

const AuthLayout = ({ children, title, subtitle, showToggle = true }) => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 animate-float">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        </div>
        <div
          className="absolute top-40 right-32 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>
        </div>
        <div
          className="absolute bottom-32 left-1/3 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        </div>

        {/* Additional floating elements for more visual interest */}
        <div
          className="absolute top-1/2 left-10 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-lg"></div>
        </div>
        <div
          className="absolute bottom-20 right-20 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-full blur-lg"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-premium mb-6 animate-scale-in">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              HabitOS
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Transform your life, one habit at a time
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
            {/* Security Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Secure & Private
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>

            {/* Auth Form */}
            {children}
          </div>

          {/* Footer */}
          <div
            className="text-center mt-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for your wellness</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      {showToggle && (
        <div className="fixed top-6 right-6 z-20">
          <ThemeToggle variant="glass" size="icon" />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
