"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create Context
const AuthContext = createContext();

// Hook to use AuthContext easily
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  // Login function
  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    logout,
    setUser,
    loading, // ✅ expose loading
    isAuthenticated: !!token, // ✅ expose authenticated flag
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
