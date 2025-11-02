import { useEffect, useState } from "react";
import { getHotels } from "../api";
import "./HomePage.css";
import CreateHotel from "../CreateHotel";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const navigate = useNavigate(); // ✅ pour redirection


  // 🔹 Charger les hôtels depuis l'API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await getHotels();
        setHotels(response.data.data);
        setFilteredHotels(response.data.data);
      } catch (err) {
        setError("Erreur lors du chargement des hôtels.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // 🔍 Recherche dynamique (nom ou ville)
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setSelectedHotel(""); // reset du select
    const results = hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(value) ||
        hotel.city.toLowerCase().includes(value)
    );
    setFilteredHotels(results);
  };

  // 🧾 Filtrage via le select (choix d’un hôtel précis)
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedHotel(value);
    setSearch(""); // reset la recherche
    if (value === "") setFilteredHotels(hotels);
    else {
      const result = hotels.filter((hotel) => hotel.name === value);
      setFilteredHotels(result);
    }
  };

   // 🏨 Redirection vers la page ViewRooms
  const handleViewRooms = (hotelId) => {
    navigate(`/hotels/${hotelId}/rooms`);
  };


  return (
    <div className="homepage-container">
      {/* 🖼️ Image principale */}
      <img className="hero-image" src="/images/hero.jpg" alt="Hero" />
      <div className="hero-text">
        <h1>Welcome to My Hotel Platform</h1>
        <p>Discover and book your perfect stay</p>
      </div>

      {/* 🧭 Section principale */}
      <div className="main">
        {loading && <p>Loading hotels...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* 🔍 Barre de recherche et menu de sélection */}
        <div className="filter-sort">
  <input
    type="text"
    className="search-input"
    placeholder="Search hotel by name or city..."
    value={search}
    onChange={handleSearchChange}
  />

  <select
    className="hotel-select"
    value={selectedHotel}
    onChange={handleSelectChange}
  >
    <option value="">-- Select a hotel --</option>
    {hotels.map((hotel) => (
      <option key={hotel.id} value={hotel.name}>
        {hotel.name}
      </option>
    ))}
  </select>
</div>
    

        {/* 🏨 Liste des hôtels */}
        <ul className="cards">
          {filteredHotels.map((hotel) => {
            let imageUrl = "https://via.placeholder.com/400x250?text=No+Image";
            try {
              const parsed = JSON.parse(hotel.image);
              imageUrl = `http://localhost:8000/storage/${parsed[0]}`;
            } catch {}

            return (
              <li key={hotel.id} className="cards_item">
                <div className="card">
                  <div className="card_image">
                    <img src={imageUrl} alt={hotel.name} />
                    <span className="note">{hotel.city}</span>
                  </div>
                  <div className="card_content">
                    <h2 className="card_title">{hotel.name}</h2>
                    <div className="card_text">
                      <p>{hotel.description}</p>
                      <hr />
                      <p>
                        <strong>Address:</strong> {hotel.address}
                      </p>
                      <button  className="view-rooms-button btn btn-primary" onClick={() => handleViewRooms(hotel.id)}>
                        View Rooms
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 🔔 Aucun hôtel trouvé */}
        {filteredHotels.length === 0 && !loading && (
          <p className="text-center text-muted">No hotels found.</p>
        )}
      </div>

      <CreateHotel />
    </div>
  );
}
