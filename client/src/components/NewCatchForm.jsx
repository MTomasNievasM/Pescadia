import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Star, X } from 'lucide-react';
import SearchBar from './SearchBar';
import L from 'leaflet';

function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function NewCatchForm({ onClose, onSave, theme, currentUser }) {
  const [position, setPosition] = useState(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => setPosition([36.8340, -2.4637]) // Almería por defecto
      );
    } else {
      setPosition([36.8340, -2.4637]);
    }
  }, []);

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!position) return alert('Por favor, selecciona una ubicación en el mapa.');
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('latitude', position.lat !== undefined ? position.lat : position[0]);
      formData.append('longitude', position.lng !== undefined ? position.lng : position[1]);
      formData.append('rating', rating);
      formData.append('tags', JSON.stringify(tags));
      formData.append('user_id', currentUser?.id || '');
      formData.append('titulo', titulo);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('/api/capturas', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Error en el servidor al guardar la captura');
      
      const data = await response.json();
      onSave(data); // Refrescar datos y cerrar modal
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al guardar. Si estás probando localmente, asegúrate de que el backend (server) está corriendo y conectado a la base de datos.');
      onSave(); // Fallback para cerrar modal
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X size={24} /></button>
        <h3>Registrar Nueva Captura</h3>
        
        <div className="form-section">
          <label>Nombre / Título de la publicación</label>
          <input 
            type="text" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            placeholder="Ej: Gran Dorada en el puerto" 
            className="tag-input"
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
        </div>

        <div className="form-section">
          <label>Foto de la captura</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])} 
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
        </div>

        <div className="form-section">
          <label>Ubicación (Toca el mapa para fijar)</label>
          <div className="form-map-container" style={{position: 'relative'}}>
            {position ? (
              <MapContainer center={position} zoom={13} style={{height: '100%', width: '100%', borderRadius: '0.5rem'}} zoomControl={false}>
                <SearchBar style={{ top: '0.5rem', width: '90%' }} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationSelector onLocationSelect={setPosition} />
                <Marker position={position} />
              </MapContainer>
            ) : (
              <div style={{padding: '2rem', textAlign: 'center', color: 'var(--placeholder-color)'}}>Cargando mapa...</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <label>2. Valoración de la zona</label>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={32} 
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>3. ¿Qué especies habitan aquí?</label>
          <form onSubmit={handleAddTag} className="tag-input-container">
            <input 
              type="text" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              placeholder="Ej: Dorada, Lubina..." 
              className="tag-input"
            />
            <button type="submit" className="add-tag-btn">Añadir</button>
          </form>
          <div className="tags-list">
            {tags.map(tag => (
              <span key={tag} className="tag-badge">
                {tag} <X size={14} onClick={() => removeTag(tag)} style={{cursor: 'pointer'}}/>
              </span>
            ))}
          </div>
        </div>

        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={isSubmitting || tags.length === 0 || rating === 0}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar y Publicar'}
        </button>
      </div>
    </div>
  );
}
