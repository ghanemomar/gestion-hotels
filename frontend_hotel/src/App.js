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
import CreateHotel from "./hotelcrud/CreateHotel";
import UpdateHotel from "./hotelcrud/UpdateHotel";
import DisplayRoomsHotel from "./roomcrud/DisplayRoomsHotel";
import CreateRoom from "./roomcrud/CreateRoom";
import UpdateRoom from "./roomcrud/UpdateRoom";
import {
  ProtectedRoute,
  AdminRoute,
  HotelRoute,
  ClientRoute
} from "./routes/ProtectedRoute";

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

  {/* Client profile */}
  <Route
    path="/profile"
    element={
      <ClientRoute>
        <ClientProfile />
      </ClientRoute>
    }
  />

  {/* Auth */}
  <Route path="/auth" element={<AuthForm />} />

  <Route path="/about" element={<About />} />
  <Route path="/rooms" element={<AllRooms />} />
  <Route path="/hotels/:hotelId/rooms" element={<HotelRooms />} />
  <Route path="/rooms/:roomId" element={<DetailRoom />} />

  {/* Admin Dashboard */}
  <Route
    path="/admin-dashboard"
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />

  {/* Hotel Dashboard */}
  <Route
    path="/hotel-dashboard"
    element={
      <HotelRoute>
        <HotelDashboard />
      </HotelRoute>
    }
  />

  {/* Hotel CRUD */}
  <Route
    path="/hotel-create"
    element={
      <HotelRoute>
        <CreateHotel />
      </HotelRoute>
    }
  />

  <Route
    path="/hotel-update/:hotelId"
    element={
      <HotelRoute>
        <UpdateHotel />
      </HotelRoute>
    }
  />

  <Route
    path="/hotel-rooms/:hotelId"
    element={
      <HotelRoute>
        <DisplayRoomsHotel />
      </HotelRoute>
    }
  />

  <Route
    path="/hotel/:hotelId/add-room"
    element={
      <HotelRoute>
        <CreateRoom />
      </HotelRoute>
    }
  />

  <Route
    path="/room-update/:roomId"
    element={
      <HotelRoute>
        <UpdateRoom />
      </HotelRoute>
    }
  />

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

      </Router>
      <Footer />
    </>
  );
}

export default App;
