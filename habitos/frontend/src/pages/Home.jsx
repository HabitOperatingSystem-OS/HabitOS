import { Link } from "react-router-dom";
import {
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Shield,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Target,
      title: "Habit Tracking",
      description:
        "Track your daily habits with ease and build consistency over time.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Visualize your progress with detailed charts and insights.",
    },
    {
      icon: BarChart3,
      title: "Goal Setting",
      description:
        "Set meaningful goals and track your journey to achievement.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with others on similar journeys for motivation.",
    },
    {
      icon: Zap,
      title: "AI Insights",
      description:
        "Get personalized recommendations and insights powered by AI.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is secure and private. We respect your privacy.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Better
              <span className="text-primary-600"> Habits</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your life one habit at a time. Track, analyze, and
              improve your daily routines with our comprehensive habit tracking
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you build lasting habits and
              achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your life?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already building better habits with
            HabitOS.
          </p>
          <Link
            to="/signup"
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
