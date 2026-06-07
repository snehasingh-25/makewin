import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const res = await axios.get("/auth/verify");
      setUser(res.data.user);
    } catch (error) {
      console.error("Token verification error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const data = res.data;

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("adminToken", data.token);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("adminToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
