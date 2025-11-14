import { useState } from "react";
import { createHotel } from "../api";
import "./CreateHotel.css";

export default function CreateHotel() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    telephone: "",
    latitude: "",
    longitude: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");

  // Mise à jour des champs texte
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajout de nouvelles images et génération du preview
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...newPreviews]);
  };

  // Supprimer une image avant l’envoi
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach((file) => formData.append("image[]", file));

    try {
      await createHotel(formData);
      setMessage("✅ Hôtel créé avec succès !");
      setForm({
        name: "",
        city: "",
        address: "",
        description: "",
        telephone: "",
        latitude: "",
        longitude: "",
      });
      setImages([]);
      setPreview([]);
    } catch (error) {
      setMessage(
        "❌ Erreur: " + (error.response?.data?.message || "Vérifie les champs requis.")
      );
    }
  };

  return (
    <div className="create-hotel-page">
      <h2>Créer un hôtel</h2>

      {message && <p className="form-message">{message}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Nom:</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />

        <label>Ville:</label>
        <input type="text" name="city" value={form.city} onChange={handleChange} required />

        <label>Adresse:</label>
        <input type="text" name="address" value={form.address} onChange={handleChange} required />

        <label>Téléphone:</label>
        <input type="number" name="telephone" value={form.telephone} onChange={handleChange} required />

        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} />

        <label>Latitude:</label>
        <input type="number" name="latitude" value={form.latitude} onChange={handleChange} />

        <label>Longitude:</label>
        <input type="number" name="longitude" value={form.longitude} onChange={handleChange} />

        <label>Images:</label>
        <input type="file" multiple accept="image/*" onChange={handleImages} />

        {/* Preview des images */}
        {preview.length > 0 && (
          <div className="preview-images">
            {preview.map((src, index) => (
              <div key={index} className="preview-item">
                <img src={src} alt={`preview-${index}`} />
                <button type="button" onClick={() => removeImage(index)}>X</button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn-submit">Créer</button>
      </form>
    </div>
  );
}
