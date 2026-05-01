import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Hook para centrar el mapa cuando la posición cambie
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MiniMap({ theme }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setPosition([36.8340, -2.4637]); // Almería fallback
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("No se pudo obtener ubicación:", err.message);
        setPosition([36.8340, -2.4637]); // Almería fallback
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  if (!position) {
    return <div className="mini-map-loading">Buscando tu ubicación...</div>;
  }

  const handleRecenter = () => {
    if (mapRef.current && position) {
      mapRef.current.setView(position, 14, { animate: true });
    }
  };

  return (
    <div className="mini-map-wrapper">
      <MapContainer 
        center={position} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={mapRef}
      >
        <ChangeView center={position} zoom={14} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position}>
          <Popup>
            <div style={{color: '#000', margin: 0}}>Estás aquí</div>
          </Popup>
        </Marker>
      </MapContainer>
      <button className="mini-map-overlay" onClick={handleRecenter} aria-label="Centrar mapa en tu ubicación">
        📍 Tu ubicación actual
      </button>
    </div>
  );
}
