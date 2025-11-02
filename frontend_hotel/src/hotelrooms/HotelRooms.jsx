import { useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { getRooms, getHotel } from "../api";
import "./HotelRooms.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HotelSlider from "./HotelSlider";
import { Helmet } from "react-helmet";

<Helmet>
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto+Condensed&family=Roboto:wght@300&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
  />
</Helmet>


export default function HotelRooms() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null);
    const navigate = useNavigate();


  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        const hotelRes = await getHotel(hotelId);
        const fetchedHotel = hotelRes.data.data;
        setHotel(fetchedHotel);

        const roomsRes = await getRooms(hotelId);
        setRooms(roomsRes.data.data);

        // Charger les coordonnées à partir de l'adresse
        if (fetchedHotel.address) {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              fetchedHotel.address
            )}`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        }
      } catch (err) {
        setError("Erreur lors du chargement de l'hôtel ou des chambres.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelAndRooms();
  }, [hotelId]);

  // Gestion des images de l'hôtel
  let hotelImages = [];
  try {
    hotelImages =
      hotel && hotel.image
        ? JSON.parse(hotel.image).map(
            (img) => `http://localhost:8000/storage/${img}`
          )
        : [];
  } catch {}

  const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

     // 🏨 Redirection vers la page ViewRoom
  const handleViewRoom = (roomId) => {
    navigate(`/rooms/${roomId}`, { state: { hotelId: hotelId } });
  };
  return (
    <>
      {/* Slider */}
      {hotel && <HotelSlider images={hotelImages} />}
      <h1 className="hotel-name">{hotel ? hotel.name : "Hôtel Inconnu"}</h1>

      {/* Rooms Section */}
      <h2 className="rooms-title">Chambres disponibles</h2>
      <main className="rooms-list">
        {rooms.map((room) => {
          let roomImage = "https://via.placeholder.com/400x250?text=No+Image";
          try {
            const parsed = JSON.parse(room.image);
            roomImage = `http://localhost:8000/storage/${parsed[0]}`;
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
              <a href="" className="button" onClick={(e) => e.preventDefault()}>
      <span
        className="material-symbols-outlined"
        onClick={() => handleViewRoom(room.id)}
      >
        Réserver maintenant
      </span>
    </a>

              </div>
            </div>
          );
        })}

        {rooms.length === 0 && !loading && (
          <p className="no-rooms">Aucune chambre trouvée.</p>
        )}
      </main>

      {/* Hotel Details */}
      {hotel && (
        <div className="hotel-details">
          <h2>Description</h2>
          <p>{hotel.description || "Aucune description disponible."}</p>
          <h2>Informations supplémentaires</h2>
          <p>
            <strong>Adresse:</strong> {hotel.address || "Adresse non fournie"}
          </p>
          <p>
            <strong>Téléphone:</strong> {hotel.telephone || "Non spécifié"}
          </p>
        </div>
      )}

      {/* Map Section */}
      {position ? (
        <div className="map-container">
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom={false}
            style={{
              height: "300px",
              width: "70%",
              borderRadius: "12px",
              margin: "20px auto",
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position} icon={customIcon}>
              <Popup>
                <strong>{hotel.name}</strong>
                <br />
                {hotel.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <p>Chargement de la carte...</p>
      )}
    </>
  );
}
