import React, { useEffect, useState } from "react";
import axios from "axios";
import { getHotelRooms, deleteRoom } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./DisplayRoomsHotel.css";

export default function DisplayRoomsHotel() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  // Récupérer le nom de l'hôtel
  const fetchHotelName = async (hotelId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/hotels/${hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data.name || "Hôtel inconnu";
    } catch (err) {
      console.error("Erreur récupération hôtel:", err);
      return "Hôtel inconnu";
    }
  };

  // Supprimer une chambre avec confirmation
  const handleDeleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette chambre ?");
    if (!confirmDelete) return;

    try {
      await deleteRoom(roomId);
      setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomId));
      setMessage("✅ Chambre supprimée avec succès");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Erreur suppression room:", err);
      setMessage("❌ Impossible de supprimer la chambre");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const name = await fetchHotelName(hotelId);
        setHotelName(name);

        const response = await getHotelRooms(hotelId);
        setRooms(response.data.data || []);
      } catch (err) {
        if (err.response) setError(err.response.data.message || "Erreur serveur");
        else setError("Erreur connexion serveur");
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) fetchData();
  }, [hotelId]);

  if (loading) return <div className="message loading">⏳ Chargement...</div>;
  if (error) return <div className="message error">⚠️ {error}</div>;
  if (rooms.length === 0) return <div className="message">Aucune chambre trouvée.</div>;

  return (
    <div className="rooms-hotel-dashboard">
      <h1>Chambres de l'hôtel {hotelName}</h1>
    
        <button
          className="create-room-btn"
          onClick={() => navigate(`/hotel/${hotelId}/add-room`)}
        >
          ➕ Ajouter un chambre
        </button>
      {message && <div className="message success">{message}</div>}

      <table className="rooms-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prix (MAD)</th>
            <th>Capacité</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.name}</td>
              <td>{room.price}</td>
              <td>{room.capacity}</td>
           
              <td className="actions-cell">
                
                <button className="btn-edit" onClick={() => navigate(`/room-update/${room.id}`)}>
                  Modifier
                </button>

                <button className="btn-delete" onClick={() => handleDeleteRoom(room.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
