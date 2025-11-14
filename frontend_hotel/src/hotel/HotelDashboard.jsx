import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelDashboard.css"
import { logoutUser, getHotelReservations, updateReservationStatus, getMyHotels, deleteHotel, deleteReservation } from "../api"; // Assure-toi que logoutUser est bien défini

export default function HotelDashboard() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

  // 🔹 Récupérer le rôle depuis le localStorage
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) setUserRole(role);
  }, []);

  // 🔹 Récupérer les réservations liées à l'hôtel connecté
  const fetchReservations = async () => {
    try {
      const res = await getHotelReservations();
            setReservations(res.data.data );
          } catch (err) {
            console.error("Erreur chargement des réservations :", err);
            setMessage("❌ Impossible de charger les réservations.");
          } finally {
            setLoading(false);
          }
        };

  useEffect(() => {
    fetchReservations();
  }, []);


  useEffect(() => {
  const fetchMyHotels = async () => {
    try {
      const res = await getMyHotels();
      setHotels(res.data.data);
    } catch (err) {
      console.error("Erreur récupération des hôtels :", err);
    }
  };

  fetchMyHotels();
}, []);

// 🔹 Supprimer hôtel
const handleDeleteHotelClick = async (hotelId) => {
  try {
    await deleteHotel(hotelId); // Appel API pour supprimer

    // Mettre à jour le state pour retirer l'hôtel supprimé
    setHotels(prevHotels => prevHotels.filter(h => h.id !== hotelId));

    setMessage("Hôtel supprimé avec succès ✅");
  } catch (error) {
    console.error("Erreur suppression hôtel:", error);
    setMessage("Impossible de supprimer l’hôtel ❌");
  }
};

    
  //delete reservation
const handleDeleteReservation = async (id) => {
  try {
    await deleteReservation(id);
    setReservations(prev => prev.filter(r => r.id !== id));
    alert("Réservation supprimée avec succès ✅");
  } catch (err) {
    console.error("Erreur suppression réservation:", err);
    alert("❌ Impossible de supprimer la réservation.");
  }
};



   // 🔹 Mettre à jour le statut d'une réservation
  const handleUpdateStatus = async (reservationId, status) => {
    try {
      const res = await updateReservationStatus(reservationId, { status });

     setReservations(prev =>
  prev.map(r => (r.id === reservationId ? { ...r, status: res.data.reservation.status } : r))
);

      setMessage("✅ Statut mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      setMessage("❌ Impossible de mettre à jour le statut.");
    }
  };

  // 🔹 Déconnexion
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("hotelId");
      navigate("/auth");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
      setMessage("❌ Impossible de se déconnecter.");
    }
  };

  if (loading) return <p>Chargement des réservations...</p>;

  return (
    <div className="hotel-dashboard">
      <h1>Dashboard de l’hôtel</h1>

      {message && <p className="message">{message}</p>}

      <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>

      <h2>Réservations</h2>

      {reservations.length === 0 ? (
        <p>Aucune réservation trouvée.</p>
      ) : (
        <table className="reservation-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Hotel</th>
              <th>Chambre</th>
              <th>Date Début</th>
              <th>Date Fin</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id}>
                <td>{res.id}</td>
                <td>{res.user?.name || "N/A"}</td>
                <td>{res.hotel?.name || "N/A"}</td>
                <td>{res.room?.name || "N/A"}</td>
                <td>{new Date(res.check_in).toLocaleDateString()}</td>
                <td>{new Date(res.check_out).toLocaleDateString()}</td>
                <td className="td_status">{res.status}</td>
                <td>
                  {(userRole === "hotel" || userRole === "admin") && res.status !== "cancelled" ? (
                    <>
                      {res.status !== "confirmed" && (
                        <button
                          className="confirm-btn"
                          onClick={() => handleUpdateStatus(res.id, "confirmed")}
                        >
                          Confirmer
                        </button>
                      )}

                      {res.status !== "cancelled" && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleUpdateStatus(res.id, "cancelled")}
                        >
                          Annuler
                        </button>
                      )}
                      
                    </>

                  ) : (
                        <button 
                        className="delete-btn"
                         onClick={()=> handleDeleteReservation(res.id)} >Delete</button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

            <h2>Mes Hotels</h2>

      {userRole === "hotel" || userRole === "admin" ? (
        <button
          className="create-hotel-btn"
          onClick={() => navigate("/hotel-create")}
        >
          ➕ Ajouter un hôtel
        </button>
      ) : null}

        {hotels.length === 0 ? (
                <p>Aucune hôtel trouvée.</p>
              ) : (
                <table className="reservation-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Ville</th>
                      <th>Address</th>
                      <th>validé ?</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map(res => (
                      <tr key={res.id}>
                        <td>{res.id}</td>
                        <td>{res.name }</td>
                        <td>{res.city}</td>
                        <td>{res.address}</td>
                        <td>
                          {res.validated ? "✅" : "❌"}
                        </td>
                        <td>
                          <button className="delete-btn"
                           onClick={()=>handleDeleteHotelClick(res.id)}>Delete</button>
                         <button
                            className="update-hotel-btn"
                            onClick={() => navigate(`/hotel-update/${res.id}`)}
                          >
                            Update
                          </button>
                           <button
                            className="rooms-hotel-btn"
                            onClick={() => navigate(`/hotel-rooms/${res.id}`)}
                          >
                            View Rooms
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
    
    </div>
  );
}
