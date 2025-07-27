import { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Check,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

// Move InputField component outside to prevent recreation on every render
const InputField = ({
  name,
  type: inputType,
  label,
  placeholder,
  icon: Icon,
  required = true,
  showToggle = false,
  toggleState = false,
  onToggle = null,
  value,
  onChange,
  onBlur,
  hasError,
  isValid,
}) => {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </Label>
      <div className="relative group">
        <div className="input-field-icon">
          <Icon
            className={`h-5 w-5 transition-colors duration-200 ${
              hasError
                ? "text-red-500"
                : isValid
                ? "text-green-500"
                : "text-gray-400 group-focus-within:text-primary-500"
            }`}
          />
        </div>
        <Input
          id={name}
          name={name}
          type={inputType}
          required={required}
          className={`pl-12 ${
            showToggle && isValid
              ? "pr-20"
              : showToggle || isValid
              ? "pr-12"
              : "pr-4"
          } h-12 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : isValid
              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
              : ""
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {showToggle && (
          <button
            type="button"
            className={`absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 ${
              isValid ? "right-12" : "right-4"
            }`}
            onClick={onToggle}
          >
            {toggleState ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
        {isValid && (
          <div className="validation-icon">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      {hasError && (
        <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <span>{hasError}</span>
        </div>
      )}
    </div>
  );
};

const AuthForm = ({
  type = "login",
  onSubmit,
  loading = false,
  error = "",
  showSocialLogin = true,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password toggle functions
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear field error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate on blur
      validateField(name, formData[name]);
    },
    [formData]
  );

  const validateField = (name, value) => {
    let fieldError = "";

    switch (name) {
      case "username":
        if (type === "signup") {
          if (!value.trim()) {
            fieldError = "Username is required";
          } else if (value.length < 3) {
            fieldError = "Username must be at least 3 characters";
          }
        }
        break;
      case "email":
        if (!value.trim()) {
          fieldError = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          fieldError = "Please enter a valid email";
        }
        break;
      case "password":
        if (!value) {
          fieldError = "Password is required";
        } else if (value.length < 6) {
          fieldError = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (type === "signup" && value !== formData.password) {
          fieldError = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
    return !fieldError;
  };

  const validateForm = () => {
    const newErrors = {};

    if (type === "signup") {
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (type === "signup" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData =
      type === "login"
        ? { email: formData.email, password: formData.password }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Fields */}
      <div className="space-y-4">
        {type === "signup" && (
          <InputField
            name="username"
            type="text"
            label="Username"
            placeholder="Choose a username"
            icon={User}
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={touched.username && errors.username}
            isValid={touched.username && !errors.username && formData.username}
          />
        )}

        <InputField
          name="email"
          type="email"
          label="Email address"
          placeholder="Enter your email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          hasError={touched.email && errors.email}
          isValid={touched.email && !errors.email && formData.email}
        />

        <InputField
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder={
            type === "login" ? "Enter your password" : "Create a password"
          }
          icon={Lock}
          showToggle={true}
          toggleState={showPassword}
          onToggle={togglePassword}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          hasError={touched.password && errors.password}
          isValid={touched.password && !errors.password && formData.password}
        />

        {type === "signup" && (
          <InputField
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            placeholder="Confirm your password"
            icon={Check}
            showToggle={true}
            toggleState={showConfirmPassword}
            onToggle={toggleConfirmPassword}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            hasError={touched.confirmPassword && errors.confirmPassword}
            isValid={
              touched.confirmPassword &&
              !errors.confirmPassword &&
              formData.confirmPassword
            }
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {error}
          </span>
        </div>
      )}

      {/* Remember Me & Forgot Password (Login only) */}
      {type === "login" && (
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 transition-all duration-200"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
              Remember me
            </span>
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>
              {type === "login" ? "Signing in..." : "Creating account..."}
            </span>
          </div>
        ) : type === "login" ? (
          "Sign in"
        ) : (
          "Create account"
        )}
      </Button>

      {/* Social Login */}
      {showSocialLogin && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
