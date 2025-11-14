import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isAuthenticated: !!localStorage.getItem("token"),
    role: localStorage.getItem("role") || null,
  });

  // Update when window.storage changes (other tabs)
  useEffect(() => {
    const syncAuth = () => {
      setUser({
        isAuthenticated: !!localStorage.getItem("token"),
        role: localStorage.getItem("role"),
      });
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // LOGIN
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    setUser({
      isAuthenticated: true,
      role: role,
    });
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setUser({
      isAuthenticated: false,
      role: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
