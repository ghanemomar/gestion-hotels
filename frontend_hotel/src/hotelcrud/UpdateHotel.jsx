import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById, updateHotel } from "../api";
import "./UpdateHotel.css"; // CSS pur, sans Bootstrap

export default function UpdateHotel() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    telephone: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔹 Charger l'hôtel par ID
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await getHotelById(hotelId);
        const hotel = res.data.data;

        setForm({
          name: hotel.name || "",
          city: hotel.city || "",
          address: hotel.address || "",
          description: hotel.description || "",
          telephone: hotel.telephone || "",
          latitude: hotel.latitude || "",
          longitude: hotel.longitude || "",
          images: [],
        });

        // Conversion en tableau d'images
        const imagesArray = Array.isArray(hotel.image)
          ? hotel.image
          : JSON.parse(hotel.image || "[]");
        setExistingImages(imagesArray);
      } catch (err) {
        console.error("Erreur récupération hôtel:", err);
        setMessage("❌ Impossible de charger l'hôtel");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  // 🔹 Gérer les changements dans les inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Gérer l'upload de nouvelles images
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
    const newPreview = newFiles.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...newPreview]);
  };

  // 🔹 Supprimer une image existante
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Supprimer une nouvelle image avant upload
  const handleRemoveNewImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "images") formData.append(key, value);
    });

    // Ajouter nouvelles images
    form.images.forEach((file) => formData.append("image[]", file));

    // Ajouter anciennes images à garder
    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      await updateHotel(hotelId, formData);
      alert("✅ Hôtel mis à jour avec succès !");
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur update hôtel:", err);
      alert(
        "❌ Impossible de mettre à jour l'hôtel. " +
          (err.response?.data?.message || "")
      );
    }
  };

  if (loading) return <p>Chargement de l'hôtel...</p>;

  return (
    <div className="update-hotel-container">
      <h2>Modifier l’hôtel</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Nom :</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ville :</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Adresse :</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Téléphone :</label>
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description :</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Latitude :</label>
          <input
            type="number"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Longitude :</label>
          <input
            type="number"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
          />
        </div>

        {/* Images existantes */}
        <div className="form-group">
          <label>Images existantes :</label>
          <div className="image-preview-container">
            {existingImages.map((img, index) => (
              <div className="image-wrapper" key={index}>
                <img
                  src={`http://localhost:8000/storage/${img}`}
                  alt={`img-${index}`}
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nouvelles images */}
        <div className="form-group">
          <label>Ajouter de nouvelles images :</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="image-preview-container">
            {preview.map((src, index) => (
              <div className="image-wrapper" key={index}>
                <img src={src} alt={`preview-${index}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveNewImage(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn_update">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
