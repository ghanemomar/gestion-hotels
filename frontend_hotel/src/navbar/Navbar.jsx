import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, role,  } = useContext(AuthContext);
  const location = useLocation();

  return (
    <header className="header">
      <Link to="/" className="logo">My Hotel</Link>

      <nav className="navbar">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/rooms" className={location.pathname === "/rooms" ? "active" : ""}>Best Rooms</Link>
        <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About</Link>

        {isAuthenticated ? (
          <>
            {role === "admin" && (
              <Link to="/admin-dashboard">Admin Dashboard</Link>
            )}

            {role === "hotel" && (
              <Link to="/hotel-dashboard">Hotel Dashboard</Link>
            )}

            {role === "user" && (
              <Link to="/profile">Profile</Link>
            )}

          </>
        ) : (
          <Link to="/auth">Login</Link>
        )}
      </nav>
    </header>
  );
}
