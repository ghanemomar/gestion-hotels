import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./navbar/Navbar";

import AuthForm from "./auth/AuthForm";
import About from "./about/About";
import AllRooms from "./allrooms/AllRooms";
import HomePage from "./homepage/HomePage";
import HotelRooms from "./hotelrooms/HotelRooms";
import DetailRoom from "./detaileroom/DetaileRoom";
import Footer from "./footer/Footer";
import ClientProfile from "./clientprofile/ClientProfile";
import AdminDashboard from "./admin/AdminDashboard";
import API from "./api"; // ton fichier API.js
import HotelDashboard from "./hotel/HotelDashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(null);

  // 🔹 Vérifier le rôle de l'utilisateur connecté
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/profile");
          setUserRole(res.data.role);
        } catch (err) {
          console.error("Erreur récupération rôle:", err);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
    };
    fetchUserRole();
  }, [isAuthenticated]);

  return (
    <>
      <Router>
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* 🔹 Profil client (auth seulement) */}
          <Route
            path="/profile"
            element={isAuthenticated ? <ClientProfile /> : <Navigate to="/auth" replace />}
          />

          {/* 🔹 Auth */}
          <Route
            path="/auth"
            element={<AuthForm setIsAuthenticated={setIsAuthenticated} />}
          />

          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/hotels/:hotelId/rooms" element={<HotelRooms />} />
          <Route path="/rooms/:roomId" element={<DetailRoom />} />

          {/* 🔹 Admin Dashboard (auth + admin) */}
          <Route
            path="/admin-dashboard"
            element={
              isAuthenticated && userRole === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          🔹 Admin Dashboard (auth + admin)
          <Route
            path="/hotel-dashboard"
            element={
              isAuthenticated && userRole === "hotel" ? (
                <HotelDashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* 🔹 Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
}

export default App;
