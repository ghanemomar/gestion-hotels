import React, { useEffect, useState } from "react";
import { updateRoom, getRoom } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./UpdateRoom.css";

export default function UpdateRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [hotelId, setHotelId] = useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ---------------- Fetch Room --------------------
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoom(roomId);
        const room = res.data.data;

        setForm({
          name: room.name,
          type: room.type,
          price: room.price,
          capacity: room.capacity,
          description: room.description,
        });

        setHotelId(room.hotel_id);
        setExistingImages(JSON.parse(room.image || "[]"));
      } catch (err) {
        setMessage({
          type: "error",
          text: "Impossible de charger la chambre.",
        });
      }
    };

    fetchRoom();
  }, [roomId]);

  // ---------------- Handlers --------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setNewImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (imgPath) => {
    setExistingImages((prev) => prev.filter((i) => i !== imgPath));
    setRemoveImages((prev) => [...prev, imgPath]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("type", form.type);
    fd.append("price", form.price);
    fd.append("capacity", form.capacity);
    fd.append("description", form.description);

    newImages.forEach((file) => {
      fd.append("image[]", file);
    });

    removeImages.forEach((file) => {
      fd.append("remove_images[]", file);
    });

    try {
      await updateRoom(roomId, fd);

      setMessage({
        type: "success",
        text: "La chambre a été mise à jour avec succès ✔️",
      });

      setTimeout(() => {
        navigate(`/hotel-rooms/${hotelId}`);
      }, 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue lors de la mise à jour.",
      });
    }
  };

  // ---------------- Render --------------------
  return (
    <div className="update-room-container">
      <h2>Modifier la chambre</h2>

      {message.text && (
        <div className={`message-box ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="update-room-form">
        <label>Nom</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} />

        <label>Type</label>
        <input type="text" name="type" value={form.type} onChange={handleChange} />

        <label>Prix</label>
        <input type="number" name="price" value={form.price} onChange={handleChange} />

        <label>Capacité</label>
        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange}></textarea>

        {/* Images existantes */}
        <h3>Images existantes</h3>
        <div className="image-preview-container">
          {existingImages.map((img, index) => (
            <div className="image-wrapper" key={index}>
              <img src={`http://localhost:8000/storage/${img}`} alt="" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => handleRemoveExistingImage(img)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        {/* Nouvelles images */}
        <label>Ajouter nouvelles images</label>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} />

        <div className="image-preview-container">
          {preview.map((src, index) => (
            <div className="image-wrapper" key={index}>
              <img src={src} alt="" />
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

        <button type="submit" className="btn-primary">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
