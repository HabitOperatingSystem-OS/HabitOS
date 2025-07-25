import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";

const Signup = () => {
  const [error, setError] = useState("");
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setError("");
    const result = await signup(
      formData.username,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Signup failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Join HabitOS"
      subtitle="Start your journey to better habits and wellness"
    >
      <AuthForm
        type="signup"
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        showSocialLogin={true}
      />

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
