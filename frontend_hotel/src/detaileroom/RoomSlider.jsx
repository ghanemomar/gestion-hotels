import { useEffect, useState, useRef } from "react";
import "./DetaileRoom.css";


export default function HotelSlider({ images, roomName }) {
  const [current, setCurrent] = useState(0);
  const slideInterval = useRef(null);

  // Auto play
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrent(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000); // chaque 3 secondes

    return () => clearInterval(slideInterval.current);
  }, [images]);

  if (!images || images.length === 0) {
    return <p className="no-images">No images available</p>;
  }

  return (
    <div className="slider-container">
      {images.map((img, index) => (
        <div key={index} className={`slide ${index === current ? "active" : ""}`}>
          {index === current && <img src={img} alt={`Slide ${index}`} />}
        </div>
      ))}

      <div className="room-name-overlay">{roomName}</div>

      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

