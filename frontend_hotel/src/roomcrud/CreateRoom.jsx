import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateRoom.css";

export default function CreateRoom() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");

  // Gérer les inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Upload multiple images
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages([...images, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreview([...preview, ...newPreviews]);
  };

  // Supprimer une image avant sauvegarde
  const removeImage = (index) => {
    const updatedImages = [...images];
    const updatedPreview = [...preview];

    updatedImages.splice(index, 1);
    updatedPreview.splice(index, 1);

    setImages(updatedImages);
    setPreview(updatedPreview);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Vous devez être connecté.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // Ajouter les images au FormData
    images.forEach((img) => {
      formData.append("image[]", img);
    });

    try {
      const response = await axios.post(
        `http://localhost:8000/api/hotels/${hotelId}/rooms`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("✅ Chambre ajoutée avec succès !");
      setTimeout(() => navigate(`/hotel/${hotelId}/rooms`), 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'ajout de la chambre.");
    }
  };

  return (
    <div className="create-room-container">
      <h1 className="create_chambre">Ajouter une chambre</h1>

      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit} className="room-form">
        
        <div className="form-group">
          <label>Nom de la chambre</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Type de chambre</label>
          <input type="text" name="type" value={form.type} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Prix (MAD)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Capacité</label>
            <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}></textarea>
        </div>

        {/* Upload images */}
        <div className="form-group">
          <label>Images (multiple)</label>
          <input type="file" multiple onChange={handleImages} />
        </div>

        {/* Preview images */}
        <div className="preview-container">
          {preview.map((img, index) => (
            <div className="preview-item" key={index}>
              <img src={img} alt="preview" />
              <button type="button" onClick={() => removeImage(index)}>X</button>
            </div>
          ))}
        </div>

        <button type="submit" className="submit-btn">Ajouter</button>
      </form>
    </div>
  );
}
