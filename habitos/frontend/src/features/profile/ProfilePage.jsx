import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { LoadingSpinner, ErrorMessage } from "../../shared/components";
import { usersAPI } from "../../services/api";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  const { theme } = useTheme();

  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user is viewing their own profile
  const isOwnProfile = !id || id === authUser?.id;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = id || authUser?.id;
        if (!userId) {
          throw new Error("No user ID available");
        }

        const response = await usersAPI.getProfile(userId);
        setProfile(response.user);
        setEditData({
          username: response.user.username || "",
          email: response.user.email || "",
          bio: response.user.bio || "",
          profile_picture_url: response.user.profile_picture_url || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, authUser?.id]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check if there are changes
    const hasChanges = Object.keys(editData).some(
      (key) => editData[key] !== profile[key]
    );
    setHasChanges(hasChanges);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await usersAPI.updateProfile(editData);
      setProfile(response.user);
      setIsEditing(false);
      setHasChanges(false);

      // Update auth context if it's the current user
      if (isOwnProfile) {
        // TODO: Update auth context with new user data
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditData({
      username: profile?.username || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
      profile_picture_url: profile?.profile_picture_url || "",
    });
    setIsEditing(false);
    setHasChanges(false);
    setError(null);
  };

  // Generate initials from username or email
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <LoadingSpinner
            size="lg"
            text="Loading profile..."
            variant="wellness"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="container-premium section-padding">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="container-premium section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-gradient-wellness mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {isOwnProfile ? "Your Profile" : `${profile?.username}'s Profile`}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Manage your personal information and preferences
            </motion.p>
          </div>

          {/* Profile Card */}
          <Card className="card-premium">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage
                      src={profile?.profile_picture_url}
                      alt={profile?.username}
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-wellness-sage to-wellness-emerald text-white">
                      {getInitials(profile?.username || profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                      onClick={() => {
                        // TODO: Implement image upload
                        console.log("Upload image");
                      }}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {!isEditing && isOwnProfile && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300">
                    {error}
                  </span>
                </div>
              )}

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.username || ""}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      placeholder="Enter username"
                      className="input-premium"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground">
                      {profile?.username || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email"
                      type="email"
                      className="input-premium"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground">
                      {profile?.email || "Not set"}
                    </p>
                  )}
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <p className="text-lg font-medium text-foreground">
                    {formatJoinDate(profile?.created_at)}
                  </p>
                </div>

                {/* Profile Picture URL */}
                {isEditing && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Profile Picture URL
                    </Label>
                    <Input
                      value={editData.profile_picture_url || ""}
                      onChange={(e) =>
                        handleInputChange("profile_picture_url", e.target.value)
                      }
                      placeholder="Enter image URL"
                      className="input-premium"
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Bio
                </Label>
                {isEditing ? (
                  <textarea
                    value={editData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-wellness-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                ) : (
                  <p className="text-lg text-foreground min-h-[4rem]">
                    {profile?.bio || "No bio added yet."}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="gap-2 flex-1"
                    variant="default"
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    variant="outline"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
