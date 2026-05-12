import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchBar from './SearchBar';

// Arreglo para que los iconos por defecto de Leaflet carguen bien en Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
// El mapa principal ahora solo muestra marcadores, no permite crearlos.

export default function MapComponent({ markers: initialMarkers = [], activeTagFilter, clearFilter, onFilterSpecies, theme, onSelectPoint }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    let filtered = initialMarkers;
    if (activeTagFilter) {
      filtered = initialMarkers.filter(cap => 
        cap.tags && cap.tags.some(t => t.toLowerCase().trim() === activeTagFilter)
      );
    }
    setMarkers(filtered);
  }, [initialMarkers, activeTagFilter]);

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={[36.8340, -2.4637]} // Coordenadas de Almería por defecto
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <SearchBar onFilterSpecies={onFilterSpecies} />
        
        {activeTagFilter && (
          <div style={{ position: 'absolute', top: '5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            <span>Filtrando por: <strong>{activeTagFilter}</strong></span>
            <button onClick={clearFilter} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
        )}

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {markers.map(marker => {
          // Validar coordenadas
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
                    {'★'.repeat(Math.round(Number(marker.average_rating) || marker.rating))}{'☆'.repeat(5 - Math.round(Number(marker.average_rating) || marker.rating))}
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
    </div>
  );
}
