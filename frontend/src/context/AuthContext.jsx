import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replaceAll("-", "+").replaceAll("_", "/");
    const decoded = JSON.parse(globalThis.atob(base64));

    return {
      id: decoded.id || "",
      email: decoded.sub || "",
      name: decoded.name || (decoded.sub ? decoded.sub.split("@")[0] : "User"),
      roles: Array.isArray(decoded.roles) ? decoded.roles : ["USER"],
      provider: "LOCAL",
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Keep dashboard responsive when we already have user info.
      const shouldBlockUI = !user;
      if (shouldBlockUI) {
        setLoading(true);
      }

      try {
        // If token exists, fetch user details
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (error) {
        console.error("Failed to load user", error);

        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        } else if (!user) {
          // Fallback to JWT claims to keep navigation fast even when user API is temporarily unavailable.
          const fallbackUser = decodeJwtPayload(token);
          if (fallbackUser) {
            setUser(fallbackUser);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const loginUser = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    if (userData) {
      setUser(userData);
      return;
    }

    const fallbackUser = decodeJwtPayload(newToken);
    if (fallbackUser) {
      setUser(fallbackUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
