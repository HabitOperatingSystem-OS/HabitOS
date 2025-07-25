import { Link } from "react-router-dom";
import {
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Shield,
  Sparkles,
  Heart,
  Brain,
  Award,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { motion } from "framer-motion";

const Home = () => {
  const features = [
    {
      icon: Target,
      title: "Habit Tracking",
      description:
        "Track your daily habits with ease and build consistency over time with our intuitive interface.",
      gradient: "from-wellness-emerald to-wellness-sage",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "Visualize your progress with detailed charts and AI-powered insights.",
      gradient: "from-primary-600 to-primary-700",
    },
    {
      icon: BarChart3,
      title: "Goal Setting",
      description:
        "Set meaningful goals and track your journey to achievement with smart milestones.",
      gradient: "from-wellness-lavender to-wellness-indigo",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Connect with others on similar journeys for motivation and accountability.",
      gradient: "from-wellness-rose to-wellness-coral",
    },
    {
      icon: Zap,
      title: "AI Insights",
      description:
        "Get personalized recommendations and insights powered by advanced AI algorithms.",
      gradient: "from-wellness-amber to-wellness-coral",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your data is secure and private. We respect your privacy and protect your information.",
      gradient: "from-gray-600 to-gray-700",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "95%", label: "Success Rate", icon: Award },
    { value: "50+", label: "Habit Categories", icon: Target },
    { value: "24/7", label: "AI Support", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-wellness-lavender/20 to-wellness-indigo/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-wellness-emerald/20 to-wellness-sage/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-premium relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-wellness-lavender/10 to-wellness-indigo/10 rounded-full border border-wellness-lavender/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-wellness-lavender" />
              <span className="text-sm font-medium text-wellness-lavender">
                Premium Wellness Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-gray-900 dark:text-white">
                Build Better
              </span>
              <br />
              <span className="text-gradient-wellness">Habits</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your life one habit at a time. Track, analyze, and
              improve your daily routines with our comprehensive wellness
              platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Button
                asChild
                size="lg"
                variant="premium"
                className="text-lg px-8 py-4"
              >
                <Link to="/signup">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-wellness-lavender/20 to-wellness-indigo/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-6 h-6 text-wellness-lavender" />
                  </div>
                  <div className="text-2xl font-bold text-gradient-wellness">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container-premium">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to help you build lasting habits and
              achieve your wellness goals with precision and style.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="card-glass h-full group">
                  <CardContent className="p-6">
                    <motion.div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-wellness-lavender/10 to-wellness-indigo/10"></div>
        <div className="container-premium relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to transform your life?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of people who are already building better habits
              and achieving their wellness goals with HabitOS.
            </p>
            <Button
              asChild
              size="lg"
              variant="premium"
              className="text-lg px-8 py-4"
            >
              <Link to="/signup">
                <Heart className="w-5 h-5 mr-2" />
                Start Your Journey
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
