import React, { useEffect, useState } from "react";
import { getAllReservations, assignRole, getProfile, getHotels, logoutUser, validateHotel } from "../api";
import axios from "axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [hotels, setHotels] = useState([]);
  const [userName, setUserName] = useState(""); // ✅ correction ici
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await getProfile();
        if (res.data.role === "admin") {
          setIsAdmin(true);
          setUserName(res.data.name); // ✅ récupération du nom
          fetchReservations();
          fetchUsers();
          fetchHotels();

        }
      } catch (error) {
        console.error("Erreur auth:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await getHotels();
      setHotels(res.data.data || res.data); // ✅ supporte les 2 formats
    } catch (error) {
      console.error("Erreur chargement hôtels:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await getAllReservations();
      setReservations(res.data);
    } catch (error) {
      console.error("Erreur chargement réservations:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await assignRole(userId, newRole);
      setMessage("Rôle mis à jour avec succès ✅");
      fetchUsers();
    } catch (error) {
      console.error("Erreur changement rôle:", error);
      setMessage("Erreur : impossible de modifier le rôle ❌");
    }
  };




// const handleToggleValidation = async (hotelId, validated) => {
//   try {
//     await validateHotel(hotelId, validated); // API patch avec { validated }
    
//     // Mise à jour directe de l'état
//     setHotels(prevHotels =>
//       prevHotels.map(h =>
//         h.id === hotelId ? { ...h, validated } : h
//       )
//     );

//     setMessage(validated 
//       ? "✅ Hôtel validé avec succès !" 
//       : "❌ Validation retirée avec succès !");
//   } catch (error) {
//     console.error("Erreur validation hôtel:", error);
//     setMessage("❌ Impossible de changer le statut de l’hôtel.");
//   }
// };






  const handleDeleteHotel = async (hotelId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Hôtel supprimé avec succès ✅");
      fetchHotels();
    } catch (error) {
      console.error("Erreur suppression hôtel:", error);
      setMessage("Impossible de supprimer l’hôtel ❌");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      setMessage("❌ Impossible de se déconnecter.");
    }
  };

  if (loading) return <p className="loading">Chargement...</p>;
  if (!isAdmin)
    return <p className="error">⛔ Accès refusé — réservé à l’administrateur.</p>;

  return (
    <div className="admin-container">
      <h2 className="user_name">
        Bonjour  {userName}
      </h2>
      <h2>
        Tableau de bord administrateur{" "}
        <button className="logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </h2>

      {message && <div className="message">{message}</div>}

      {/* 🧾 Liste des réservations */}
      <section className="section">
        <h4>🧾 Liste des réservations</h4>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Hôtel</th>
              <th>Chambre</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.user?.name || "N/A"}</td>
                  <td>{r.hotel?.name || "N/A"}</td>
                  <td>{r.room?.title || "N/A"}</td>
                  <td>{r.status}</td>
                  <td>{r.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="center-text">
                  Aucune réservation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 👥 Gestion des utilisateurs */}
      <section className="section">
        <h4>👥 Gestion des utilisateurs</h4>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle actuel</th>
              <th>Changer le rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="hotel">Hôtel</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="center-text">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 🏨 Gestion des hôtels */}
      <section className="section">
        <h4>🏨 Gestion des hôtels</h4>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Ville</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length > 0 ? (
              hotels.map((h) => (
                <tr key={h.id}>
                  <td>{h.id}</td>
                  <td>{h.name}</td>
                  <td>{h.city}</td>
                       <td>
                        {/* <button
                          className={h.validated ? "unvalidate_button" : "validate_button"}
                          onClick={() => handleToggleValidation(h.id, !h.validated)}
                        >
                          {h.validated ? " ✅ Valider  " : " ❌ Ne pas valider"}
                        </button> */}
                        <button
                          className="delete_button"
                          onClick={() => handleDeleteHotel(h.id)}
                        >
                          Supprimer
                        </button>
                      </td>


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="center-text">
                  Aucun hôtel trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
