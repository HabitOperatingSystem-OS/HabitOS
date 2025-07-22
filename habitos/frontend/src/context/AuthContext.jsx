import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

// Create the authentication context that will be used to share auth state across components
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to store user information (currently just holds the token)
  const [user, setUser] = useState(null);

  // State to store the authentication token
  // Initialize from localStorage if a token exists from previous session
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // State to track loading status during authentication operations
  const [loading, setLoading] = useState(false);

  // Effect runs whenever the token changes
  // Handles setting user state based on token presence
  useEffect(() => {
    if (token) {
      // If token exists, create a user object with the token
      // TODO: Could be enhanced to decode JWT and extract user info
      setUser({ token });
    } else {
      // If no token, clear the user
      setUser(null);
    }
  }, [token]); // Dependency array - effect runs when token changes

  // Async function to handle user login
  const login = async (email, password) => {
    // Set loading state to show loading indicators in UI
    setLoading(true);

    try {
      // Call the login API endpoint with user credentials
      const data = await authAPI.login({ email, password });

      // Store the received token in localStorage for persistence
      localStorage.setItem("token", data.access_token);

      // Update token state (this will trigger the useEffect above)
      setToken(data.access_token);

      // Set user state with the token
      setUser({ token: data.access_token });

      // Return success status to the calling component
      return { success: true };
    } catch (err) {
      // If login fails, return error information
      return { success: false, message: err.message };
    } finally {
      // Always reset loading state, regardless of success/failure
      setLoading(false);
    }
  };

  // Async function to handle user signup
  const signup = async (username, email, password) => {
    // Set loading state for UI feedback
    setLoading(true);

    try {
      // Call the signup API endpoint with user information
      const data = await authAPI.signup({ username, email, password });

      // Store the received token in localStorage
      localStorage.setItem("token", data.access_token);

      // Update token state
      setToken(data.access_token);

      // Set user state with the token
      setUser({ token: data.access_token });

      // Return success status
      return { success: true };
    } catch (err) {
      // If signup fails, return error information
      return { success: false, message: err.message };
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Remove token from localStorage to clear persistent session
    localStorage.removeItem("token");

    // Clear token state
    setToken(null);

    // Clear user state
    setUser(null);
  };

  // Provide the authentication context to all child components
  // Makes user, token, loading state and auth functions available throughout the app
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the authentication context
// Components can use: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
