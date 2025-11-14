// ClientProfile.jsx
import React, { useEffect, useState } from "react";
import "./ClientProfile.css";
import { getProfile, getMyReservations, cancelReservation, logoutUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function ClientProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getProfile();
        setUserProfile(profileResponse.data);

        const reservationsResponse = await getMyReservations();
        setReservations(reservationsResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
        setMessage({ text: "Impossible de charger les données.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;
    try {
      await cancelReservation(id);
      setReservations(prev =>
        prev.map(res => (res.id === id ? { ...res, status: "annulée" } : res))
      );
      setMessage({ text: "Réservation annulée avec succès !", type: "success" });
    } catch (error) {
      console.error("Erreur d'annulation :", error);
      setMessage({ text: "Erreur lors de l’annulation.", type: "error" });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      setMessage({ text: "Déconnexion réussie !", type: "success" });
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setMessage({ text: "Impossible de se déconnecter.", type: "error" });
    }
  };

  if (loading) return <p>Chargement du profil...</p>;

  return (
    <div className="client-profile">
      <h1>Mon Profil</h1>

      {message.text && (
        <p className={`profile-message ${message.type}`}>{message.text}</p>
      )}

      {userProfile ? (
        <div className="profile-info">
          <p><strong>Nom :</strong> {userProfile.name}</p>
          <p><strong>Email :</strong> {userProfile.email}</p>
          <p><strong>Téléphone :</strong> {userProfile.telephone || "Non fourni"}</p>

          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      ) : (
        <p>Aucun profil trouvé.</p>
      )}

      <div className="reservations-section">
        <h2>Mes Réservations</h2>

        {reservations.length > 0 ? (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Chambre</th>
                <th>Hôtel</th>
                <th>Date d’arrivée</th>
                <th>Date de départ</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>{res.room?.name || "Inconnu"}</td>
                  <td>{res.room?.hotel?.name || "Non spécifié"}</td>
                  <td>{res.check_in}</td>
                  <td>{res.check_out}</td>
                  <td>
                    <span className={`status-badge ${
                      res.status === "confirmée"
                        ? "status-confirmed"
                        : res.status === "en attente"
                        ? "status-pending"
                        : "status-cancelled"
                    }`}>{res.status || "Non défini"}</span>
                  </td>
                  <td>
                    {res.status !== "annulée" && (
                      <button className="cancel-btn" onClick={() => handleCancel(res.id)}>Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Vous n’avez aucune réservation.</p>}
      </div>
    </div>
  );
}
