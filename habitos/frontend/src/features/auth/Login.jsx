import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";

const Login = () => {
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setError("");
    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(
        result.message ||
          "Login failed. Please check your credentials and try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your wellness journey"
    >
      <AuthForm
        type="login"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        showSocialLogin={false}
      />

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Create one now
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
