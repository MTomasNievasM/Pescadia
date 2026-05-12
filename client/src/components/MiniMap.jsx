import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { bobberIcon } from '../utils/bobberIcon';

// Hook para centrar el mapa cuando la posición cambie
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MiniMap({ theme, onSelectPoint }) {
  const [position, setPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
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

    // Cargar marcadores de capturas
    const fetchMarkers = async () => {
      try {
        const response = await fetch('/api/capturas');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setMarkers(data);
          }
        }
      } catch (err) {
        console.error("Error al cargar marcadores en minimap:", err);
      }
    };
    fetchMarkers();
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
        
        {/* Marcador de usuario */}
        <Marker position={position} icon={bobberIcon}>
          <Popup>
            <div style={{color: '#000', margin: 0}}>Estás aquí</div>
          </Popup>
        </Marker>

        {/* Marcadores de capturas */}
        {markers.map(marker => {
          const lat = Number(marker.latitude);
          const lng = Number(marker.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={marker.id} position={[lat, lng]}>
              <Popup>
                <div className="map-popup-content" style={{ minWidth: '150px' }}>
                  {marker.photo_url ? (
                    <img 
                      src={`/api${marker.photo_url}`} 
                      alt="Última captura" 
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100px', background: 'var(--btn-bg)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--placeholder-color)', marginBottom: '0.5rem', fontSize: '0.8rem', border: '1px solid var(--btn-border)' }}>
                      Sin foto
                    </div>
                  )}
                  <strong style={{ fontSize: '0.9rem' }}>Zona de Pesca</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.8rem' }}>Especies: {(marker.tags || []).join(', ')}</p>
                  <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#fbbf24', fontSize: '1rem' }}>
                    {'★'.repeat(marker.rating)}{'☆'.repeat(5 - marker.rating)}
                  </p>
                  <button 
                    className="popup-btn" 
                    style={{ width: '100%', padding: '0.4rem' }}
                    onClick={() => onSelectPoint(marker)}
                  >
                    Ver más
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <button className="mini-map-overlay" onClick={handleRecenter} aria-label="Centrar mapa en tu ubicación">
        📍 Tu ubicación actual
      </button>
    </div>
  );
}
