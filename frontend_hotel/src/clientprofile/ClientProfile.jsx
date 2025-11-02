import React, { useEffect, useState } from "react";
import "./ClientProfile.css";
import {
  getProfile,
  getMyReservations,
  cancelReservation,
  logoutUser,
} from "../api";
import { useNavigate } from "react-router-dom";

export default function ClientProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Charger le profil et les réservations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getProfile();
        setUserProfile(profileResponse.data);

        const reservationsResponse = await getMyReservations();
        setReservations(reservationsResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        setMessage("❌ Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Annuler une réservation
  const handleCancel = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?"))
      return;

    try {
      await cancelReservation(id);
      setReservations((prev) =>
        prev.map((res) =>
          res.id === id ? { ...res, status: "annulée" } : res
        )
      );
      setMessage("✅ Réservation annulée avec succès !");
    } catch (error) {
      console.error("Erreur d'annulation :", error);
      setMessage("❌ Erreur lors de l’annulation.");
    }
  };

  // 🔹 Déconnexion
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      setMessage("👋 Déconnexion réussie !");
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setMessage("❌ Impossible de se déconnecter.");
    }
  };

  // 🕓 Si en cours de chargement
  if (loading) return <p>Chargement du profil...</p>;

  return (
    <div className="client-profile">
      <h1>Mon Profil</h1>

      {message && <p className="profile-message">{message}</p>}

      {/* Informations utilisateur */}
      {userProfile ? (
        <div className="profile-info">
          <p>
            <strong>Nom :</strong> {userProfile.name}
          </p>
          <p>
            <strong>Email :</strong> {userProfile.email}
          </p>
          <p>
            <strong>Téléphone :</strong> {userProfile.telephone || "Non fourni"}
          </p>

          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      ) : (
        <p>Aucun profil trouvé.</p>
      )}

      {/* Réservations */}
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
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td>{res.room?.name || "Inconnu"}</td>
                  <td>{res.room?.hotel?.name || "Non spécifié"}</td>
                  <td>{res.check_in}</td>
                  <td>{res.check_out}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        res.status === "confirmée"
                          ? "status-confirmed"
                          : res.status === "en attente"
                          ? "status-pending"
                          : "status-cancelled"
                      }`}
                    >
                      {res.status || "Non défini"}
                    </span>
                  </td>
                  <td>
                    {res.status !== "annulée" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(res.id)}
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Vous n’avez aucune réservation.</p>
        )}
      </div>
    </div>
  );
}
