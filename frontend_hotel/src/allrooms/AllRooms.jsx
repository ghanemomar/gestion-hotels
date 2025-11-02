import { useState, useEffect } from "react";
import { getAllRooms } from "../api";
import "./AllRooms.css";
import { useNavigate } from "react-router-dom";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

  // 🔹 Charger les chambres depuis l'API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await getAllRooms();
        setRooms(response.data.data);
      } catch (err) {
        console.error("Erreur lors du chargement des chambres :", err);
        setError("Impossible de charger les chambres. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleViewRoom = (roomId) => {
    // 🔸 Exemple d’action (rediriger, ouvrir une modal, etc.)
    console.log("Voir la chambre ID:", roomId);
    // Par exemple :
    navigate(`/rooms/${roomId}`);
  };

  if (loading) return <p className="loading">Chargement des chambres...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      {/* Rooms Section */}
      <h2 className="rooms-title">Best Rooms</h2>
      <main className="rooms-list">
        {rooms.map((room) => {
          let roomImage = "https://via.placeholder.com/400x250?text=No+Image";
          try {
            const parsed = JSON.parse(room.image);
            if (parsed.length > 0) {
              roomImage = `http://localhost:8000/storage/${parsed[0]}`;
            }
          } catch {}

          return (
            <div key={room.id} className="card-room">
              <img src={roomImage} alt={room.name} />
              <div className="card-room-content">
                <h2>{room.name}</h2>
                <p>
                  <strong>Type:</strong> {room.type} <br />
                  <strong>Prix:</strong> {room.price} MAD <br />
                  <strong>Capacité:</strong> {room.capacity} personnes
                </p>
                <a
                  href="#"
                  className="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewRoom(room.id);
                  }}
                >
                  <span className="material-symbols-outlined">Réserver maintenant</span>
                </a>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && !loading && (
          <p className="no-rooms">Aucune chambre trouvée.</p>
        )}
      </main>
    </div>
  );
}
