import React, { useEffect, useState } from "react";
import RoomSlider from "./RoomSlider";
import { useParams } from "react-router-dom";
import "./DetaileRoom.css";
import { getRoom, createReservation, getProfile } from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function DetailRoom() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({ check_in: "", check_out: "" });
  const [userRole, setUserRole] = useState(null);

  // Récupérer les infos de la room et le rôle de l'utilisateur
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Room
        const roomRes = await getRoom(roomId);
        setRoom(roomRes.data.data);

        // User role
        try {
          const profile = await getProfile();
          setUserRole(profile.data.role);
        } catch {
          setUserRole(null); // non connecté
        }

      } catch (err) {
        console.error(err);
        setError("Impossible de charger la chambre.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  // Images
  let roomImages = [];
  try {
    roomImages =
      room && room.image
        ? JSON.parse(room.image).map((img) => `http://localhost:8000/storage/${img}`)
        : [];
  } catch {}

  // Icône Leaflet
  const hotelIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  if (loading) return <p>Chargement de la chambre...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Aucune chambre trouvée.</p>;

  // Formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await createReservation({
        room_id: room.id,
        hotel_id: room.hotel_id, // pris automatiquement depuis la room
        check_in: formData.check_in,
        check_out: formData.check_out,
      });

      setMessage("✅ Réservation effectuée avec succès !");
      setFormData({ check_in: "", check_out: "" });
    } catch (err) {
      console.error("Erreur réservation :", err);
      if (err.response?.data?.message) {
        setMessage("❌ " + err.response.data.message);
      } else {
        setMessage("❌ Erreur lors de la réservation");
      }
    }
  };

  const canReserve = userRole === "user";

  return (
    <div className="detail-room-container">
      {/* Slider */}
      {room && <RoomSlider images={roomImages} roomName={room.name} />}

      <h1 className="room-name">{room.name}</h1>

      <div className="room-content">
        {/* Détails */}
        <div className="room-details">
          <h2>Description</h2>
          <p>{room.description || "Aucune description disponible."}</p>
          <h2>Informations supplémentaires</h2>
          <p><strong>Type:</strong> {room.type || "Non spécifié"}</p>
          <p><strong>Prix:</strong> {room.price ? `${room.price} MAD` : "Non spécifié"}</p>
          <p><strong>Capacité:</strong> {room.capacity || "Non spécifiée"} personnes</p>
        </div>

        {/* Hôtel */}
        {room.hotel && (
          <div className="hotel-details">
            <h2>Hôtel associé</h2>
            <p><strong>Nom:</strong> {room.hotel.name}</p>
            <p><strong>Adresse:</strong> {room.hotel.address || "Non fournie"}</p>
            <p><strong>Ville:</strong> {room.hotel.city || "Non spécifiée"}</p>
            <p><strong>Téléphone:</strong> {room.hotel.telephone || "Non disponible"}</p>
          </div>
        )}

        {/* Formulaire de réservation */}
        <div className="reservation-form">
          <h2>Réserver cette chambre</h2>
          {!userRole && <p className="info-text">⚠️ Veuillez vous connecter pour réserver.</p>}
          {canReserve ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date d'arrivée</label>
                <input type="date" name="check_in" value={formData.check_in} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Date de départ</label>
                <input type="date" name="check_out" value={formData.check_out} onChange={handleChange} required />
              </div>
              <button type="submit" className="reserve-btn">Réserver maintenant</button>
            </form>
          ) : userRole ? (
            <p className="info-text">ℹ️ Seuls les utilisateurs peuvent réserver une chambre.</p>
          ) : null}

          {message && <p className="form-message">{message}</p>}
        </div>
      </div>

      {/* Carte */}
      {room.hotel?.latitude && room.hotel?.longitude && (
        <div className="hotel-map">
          <h2>📍 Localisation de l’hôtel</h2>
          <MapContainer
            center={[room.hotel.latitude, room.hotel.longitude]}
            zoom={13}
            style={{ height: "400px", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[room.hotel.latitude, room.hotel.longitude]} icon={hotelIcon}>
              <Popup>
                <strong>{room.hotel.name}</strong><br/>
                {room.hotel.address || "Adresse non disponible"}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}
