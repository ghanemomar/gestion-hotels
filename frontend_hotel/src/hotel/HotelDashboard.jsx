import { useEffect, useState } from "react";
import { getHotelReservations, updateReservationStatus, logoutUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function HotelDashboard() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Récupérer le rôle depuis le localStorage
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) setUserRole(role);
  }, []);

  // 🔹 Récupérer les réservations liées à l'hôtel
  const fetchReservations = async () => {
    try {
      const res = await getHotelReservations();
      setReservations(res.data);
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

  // 🔹 Mettre à jour le statut
  const handleUpdateStatus = async (reservationId, status) => {
    try {
      await updateReservationStatus(reservationId, { status });
      setReservations(prev =>
        prev.map(r => (r.id === reservationId ? { ...r, status } : r))
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
      setMessage("👋 Déconnexion réussie !");
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setMessage("❌ Impossible de se déconnecter.");
    }
  };

  if (loading) return <p>Chargement des réservations...</p>;

  return (
    <div>
      <h1>Hotel Dashboard</h1>
      {message && <p>{message}</p>}

      <button className="logout-btn" onClick={handleLogout}>
        Déconnexion
      </button>

      <h2>Reservations</h2>
      {reservations.length === 0 ? (
        <p>Aucune réservation trouvée.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id}>
                <td>{res.id}</td>
                <td>{res.user?.name || "N/A"}</td>
                <td>{res.room?.name || "N/A"}</td>
                <td>{res.status}</td>
                <td>
                  {(userRole === "hotel" || userRole === "admin") && res.status !== "cancelled" ? (
                    <>
                      <button onClick={() => handleUpdateStatus(res.id, "confirmed")}>
                        Confirmer
                      </button>
                      <button onClick={() => handleUpdateStatus(res.id, "cancelled")}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
