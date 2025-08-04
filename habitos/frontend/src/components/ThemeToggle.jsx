import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/button";

const ThemeToggle = ({
  variant = "default",
  size = "default",
  className = "",
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const getButtonVariant = () => {
    switch (variant) {
      case "ghost":
        return "ghost";
      case "outline":
        return "outline";
      case "glass":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      case "icon":
        return "icon";
      default:
        return "default";
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "transition-all duration-300 hover:scale-110";

    if (variant === "glass") {
      return `${baseClasses} glass shadow-premium ${className}`;
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={getButtonSize()}
      onClick={toggleTheme}
      className={getButtonClasses()}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 group-hover:text-gray-700 transition-colors duration-200" />
      )}
      {showLabel && (
        <span className="ml-2">{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </Button>
  );
};

export default ThemeToggle;
