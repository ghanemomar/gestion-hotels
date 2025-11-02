import { useState } from "react";
import { createHotel } from "./api";

export default function CreateHotel() {
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

  const [preview, setPreview] = useState([]);

  // Handle text input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file input
  const handleFileChange = (e) => {
  const newFiles = Array.from(e.target.files);

  // دمج الصور الجديدة مع القديمة
  setForm((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));

  // دمج preview القديمة مع الجديدة
  const newPreview = newFiles.map((file) => URL.createObjectURL(file));
  setPreview((prev) => [...prev, ...newPreview]);
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("city", form.city);
    formData.append("address", form.address);
    formData.append("telephone", form.telephone);
    formData.append("description", form.description);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);

    form.images.forEach((file) => {
      formData.append("image[]", file); // Laravel expects array
    });

    try {
      const res = await createHotel(formData);
      alert("✅ Hôtel créé avec succès !");
      console.log(res.data);

      // Reset form
      setForm({ name: "", city: "", address: "", description: "", telephone: "", latitude: "", longitude: "", images: [] });
      setPreview([]);
    } catch (error) {
      console.error("Erreur:", error.response?.data);
      alert(
        "Erreur: " +
          (error.response?.data?.message || "Vérifie les champs requis.")
      );
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem" }}>
      <h2 style={{ textAlign: "center" }}>Créer un hôtel</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: "15px" }}>
          <label>Nom:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Ville:</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Adresse:</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Telephone:</label>
          <input
            type="number"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Latitude:</label>
          <input
            type="number"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Longitude:</label>
          <input
            type="number"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Images:</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFileChange}
            accept="image/*"
            className="form-control"
          />
        </div>

        {/* Preview Images */}
        {preview.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
            {preview.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`preview ${index}`}
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
              />
            ))}
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          Créer
        </button>
      </form>
    </div>
  );
}
