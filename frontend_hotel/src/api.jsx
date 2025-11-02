import axios from "axios";

// Base URL ديال backend
const API = axios.create({
  baseURL: "http://localhost:8000/api", // بدل localhost باللي عندك
});

// Add token to every request if exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token محفوظ فال localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------- Auth ----------------------
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const logoutUser = () => API.post("/logout");
export const getProfile = () => API.get("/profile");
export const assignRole = (userId, role) => API.patch(`/users/${userId}/role`, { role });

// ---------------------- Hotels ----------------------
export const getHotels = () => API.get("/hotels");
export const getHotel = (id) => API.get(`/hotels/${id}`);
export const createHotel = (data) => API.post("/hotels", data);
export const updateHotel = (id, data) => API.put(`/hotels/${id}`, data);
export const deleteHotel = (id) => API.delete(`/hotels/${id}`);
export const validateHotel = (id, validated) =>
  API.patch(`/hotels/${id}/validate`, { validated });

// ---------------------- Rooms ----------------------
export const getRooms = (hotelId) => API.get(`/hotels/${hotelId}/rooms`);
export const getRoom = (id) => API.get(`/rooms/${id}`);
export const getAllRooms = () => API.get("/rooms");

export const createRoom = (hotelId, data) =>
  API.post(`/hotels/${hotelId}/rooms`, data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// ---------------------- Reservations ----------------------
export const createReservation = (data) => API.post("/reservations", data);
export const getMyReservations = () => API.get("/my-reservations");
export const cancelReservation = (id) =>
  API.patch(`/reservations/${id}/cancel`);
// ---------------------- Admin - hotel ----------------------
export const updateReservationStatus = (id, data) =>
  API.patch(`/reservations/${id}/status`, data);
export const getAllReservations = () => API.get("/reservations");


// Récupérer les réservations de l’hôtel connecté
export const getHotelReservations = () => API.get("/hotel-reservations");


export default API;
