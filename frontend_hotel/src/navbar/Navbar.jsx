import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/profile");
          setRole(res.data.role);
        } catch (err) {
          console.error("Erreur récupération rôle:", err);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setRole(null);
        }
      }
    };
    fetchRole();
  }, [isAuthenticated]);

  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <header className="header">
      <a href="/" onClick={(e) => handleNavigation("/", e)} className="logo">
        My Hotel
      </a>

      <nav className="navbar">
        <a
          href="/"
          onClick={(e) => handleNavigation("/", e)}
          className={location.pathname === "/" ? "active" : ""}
        >
          Home
        </a>
        <a
          href="/rooms"
          onClick={(e) => handleNavigation("/rooms", e)}
          className={location.pathname === "/rooms" ? "active" : ""}
        >
          Best Rooms
        </a>
        <a
          href="/about"
          onClick={(e) => handleNavigation("/about", e)}
          className={location.pathname === "/about" ? "active" : ""}
        >
          About
        </a>

        {isAuthenticated ? (
          <>
            {role === "admin" && (
              <a
                href="/admin-dashboard"
                onClick={(e) => handleNavigation("/admin-dashboard", e)}
                className={location.pathname === "/admin-dashboard" ? "active" : ""}
              >
                Admin_Dashboard
              </a>
            )}

            {role === "hotel" && (
              <a
                href="/hotel-dashboard"
                onClick={(e) => handleNavigation("/hotel-dashboard", e)}
                className={location.pathname === "/hotel-dashboard" ? "active" : ""}
              >
                Hotel_Dashboard
              </a>
            )}

            {role !== "admin" && role !== "hotel" && (
              <a
                href="/profile"
                onClick={(e) => handleNavigation("/profile", e)}
                className={location.pathname === "/profile" ? "active" : ""}
              >
                Profile
              </a>
            )}
          </>
        ) : (
          <a
            href="/auth"
            onClick={(e) => handleNavigation("/auth", e)}
            className={location.pathname === "/auth" ? "active" : ""}
          >
            Login
          </a>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
